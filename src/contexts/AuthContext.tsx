import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User as AppUser, UserRole } from "../types";
import { auth, db } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  sendEmailVerification,
} from "firebase/auth";
import {
  doc,
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

type Theme = "light" | "dark";

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    userData: Partial<AppUser> & { email: string; password: string }
  ) => Promise<FirebaseUser | null>; // Register now returns FirebaseUser
  switchRole: (role: UserRole) => Promise<void>;
  updateUserProfile: (data: Partial<AppUser>) => Promise<void>;
  isAuthenticated: boolean;
  theme: Theme;
  toggleTheme: () => void;
  firebaseUser: FirebaseUser | null; // Expose FirebaseUser for verification status
  sendEmailVerification: (user: FirebaseUser) => Promise<void>; // Expose sendEmailVerification
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserProfile = async (uid: string, firebaseUser?: FirebaseUser): Promise<AppUser | null> => {
  if (!firebaseUser || !db) return null;

  console.log(`[fetchUserProfile] Starting for UID: ${uid}`);
  const userRef = doc(db, "users", uid);
  let userProfile: AppUser | null = null;

  try {
    console.log(`[fetchUserProfile] Querying Firestore for document: users/${uid}`);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      console.log("[fetchUserProfile] Document found in Firestore.");
      userProfile = docSnap.data() as AppUser;
      console.log("[fetchUserProfile] Fetched data:", userProfile);
    } else {
      console.log(`[fetchUserProfile] No profile found for UID: ${uid}. Creating a default one.`);
      const defaultProfile: AppUser = {
        id: uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        avatar: '',
        role: 'student',
        verified: firebaseUser.emailVerified,
        skills: [],
        interests: [],
        theme: 'light', // Set default theme on registration
        createdAt: serverTimestamp() as any,
      } as any;
      await setDoc(userRef, defaultProfile);
      userProfile = defaultProfile;
      console.log("[fetchUserProfile] Created and saved default profile:", userProfile);
    }
  } catch (error) {
    console.error("[fetchUserProfile] Error fetching or creating user profile:", error);
    return null;
  }

  const finalProfile = {
    ...userProfile,
    id: uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || userProfile.name,
    verified: firebaseUser.emailVerified,
  };

  console.log("[fetchUserProfile] Final merged profile:", finalProfile);
  return finalProfile;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null); // New state for FirebaseUser
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    if (!auth) {
      console.warn('Firebase Auth not available');
      setLoading(false);
      return;
    }

    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(
      auth,
      async (fbUser: FirebaseUser | null) => {
        try {
          console.log('🔄 Auth state changed:', fbUser ? `User: ${fbUser.email}` : 'No user');
          console.log('🔄 Firebase User UID:', fbUser?.uid);
          setFirebaseUser(fbUser); // Always set FirebaseUser
          
          if (fbUser) {
            console.log('✅ Firebase user authenticated, checking email verification...');
            if (!fbUser.emailVerified) {
              // If user is not verified, do not load full profile yet
              setUser(null); // Keep AppUser null to prevent dashboard access
              console.log("❌ User is authenticated but email not verified.");
            } else {
              console.log('✅ Email verified, creating profile...');
              // Create profile instantly from Firebase Auth (no Firestore needed)
              const profile = await fetchUserProfile(fbUser.uid, fbUser);
              
              console.log('📊 Profile created:', profile);
              
              if (profile) {
                console.log('✅ Setting user state with profile:', profile.name, '(', profile.role, ')');
                setUser(profile);
                console.log('🎯 Current user state after setUser:', profile);
                
                if (profile.theme) {
                  setTheme(profile.theme);
                } else {
                  const savedTheme = localStorage.getItem("theme") as Theme;
                  if (savedTheme) {
                    setTheme(savedTheme);
                  } else if (
                      window.matchMedia("(prefers-color-scheme: dark)").matches
                    ) {
                    setTheme("dark");
                  }
                }
              } else {
                console.warn('❌ Could not create profile for authenticated user');
                setUser(null);
              }
            }
          } else {
            console.log('🔴 No Firebase user, setting user to null');
            setUser(null);
            const savedTheme = localStorage.getItem("theme") as Theme;
            if (savedTheme) {
              setTheme(savedTheme);
            }
          }
        } catch (err) {
          console.error("❌ Auth listener error:", err);
          setUser(null);
          setFirebaseUser(null);
        } finally {
          console.log('🏁 Auth state processing complete, setting loading to false');
          setLoading(false);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = async () => {
    if (!user) return;
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await updateUserProfile({ theme: newTheme });
  };

  const register = async (
    userData: Partial<AppUser> & { email: string; password: string }
  ): Promise<FirebaseUser | null> => {
    if (!auth) throw new Error("Authentication not available");
    const { email, password, name = "", ...rest } = userData;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    if (name) {
      try {
        await updateProfile(cred.user, { displayName: name });
      } catch (err) {
        console.warn("updateProfile failed", err);
      }
    }

    // Send email verification
    try {
      await sendEmailVerification(cred.user);
      console.log("Verification email sent!");
    } catch (err) {
      console.error("Error sending verification email:", err);
    }

    if (!db) return cred.user;
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const profile = {
        id: uid,
        name,
        email,
        role: (userData.role as UserRole) || "student",
        verified: cred.user.emailVerified,
        skills: [],
        interests: [],
        theme: 'light', // Set default theme on registration
        ...rest,
      } as any;

      await setDoc(ref, {
        ...profile,
        createdAt: serverTimestamp(),
      });

      // Do NOT setUser(profile) here if email is not verified
      // The onAuthStateChanged listener will handle setting the user once verified
    } else {
      // If the document already exists, merge the new data
      const existingData = snap.data() as any;
      const updatedProfile = {
        ...existingData,
        name: name || existingData.name,
        verified: cred.user.emailVerified,
        ...rest,
        updatedAt: serverTimestamp(),
      };

      await setDoc(ref, updatedProfile, { merge: true });
      // Do NOT setUser(updatedProfile) here if email is not verified
    }
    return cred.user; // Return the FirebaseUser object
  };

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Authentication not available");
    
    try {
      console.log(`Attempting login for: ${email}`);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      
      if (!cred.user.emailVerified) {
        console.warn(`Email not verified for: ${email}`);
        // If login successful but email not verified, throw an error
        if (auth) await signOut(auth); // Sign out the unverified user immediately
        throw new Error("Email not verified. Please check your inbox.");
      }
      
      console.log(`Login successful for: ${email}`);
      // If verified, onAuthStateChanged will handle setting the user
      
    } catch (error: any) {
      console.error(`Login failed for ${email}:`, error.code);
      
      // Provide more specific error messages
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error("Account not found. Please check your email or sign up.");
        case 'auth/wrong-password':
          throw new Error("Incorrect password. Please try again.");
        case 'auth/invalid-email':
          throw new Error("Invalid email address.");
        case 'auth/user-disabled':
          throw new Error("Account has been disabled.");
        case 'auth/too-many-requests':
          throw new Error("Too many failed attempts. Please try again later.");
        default:
          throw error;
      }
    }
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    setUser(null);
    setFirebaseUser(null); // Clear FirebaseUser on logout
  };

  const switchRole = async (role: UserRole) => {
    if (!user) throw new Error("Not authenticated");
    if (!db) throw new Error("Database not available");
    const ref = doc(db, "users", user.id);
    await setDoc(ref, { role, updatedAt: serverTimestamp() }, { merge: true });
    setUser({ ...user, role });
  };

  const updateUserProfile = async (data: Partial<AppUser>) => {
    if (!user) throw new Error("Not authenticated");
    if (!db) throw new Error("Database not available");
    const ref = doc(db, "users", user.id);
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );
    await setDoc(
      ref,
      { ...cleaned, updatedAt: serverTimestamp() },
      { merge: true }
    );
    setUser({ ...user, ...cleaned });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        switchRole,
        updateUserProfile,
        isAuthenticated: !!user,
        theme,
        toggleTheme,
        firebaseUser, // Expose firebaseUser
        sendEmailVerification: (user: FirebaseUser) => sendEmailVerification(user), // Expose sendEmailVerification
      }}
    >
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
