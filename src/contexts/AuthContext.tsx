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
  setDoc,
  getDoc,
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

const fetchUserProfile = async (uid: string): Promise<AppUser | null> => {
  if (!db) return null;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as AppUser;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null); // New state for FirebaseUser
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(
      auth,
      async (fbUser: FirebaseUser | null) => {
        try {
          setFirebaseUser(fbUser); // Always set FirebaseUser
          if (fbUser) {
            if (!fbUser.emailVerified) {
              // If user is not verified, do not load full profile yet
              setUser(null); // Keep AppUser null to prevent dashboard access
              console.log("User is authenticated but email not verified.");
            } else {
              const profile = await fetchUserProfile(fbUser.uid);
              setUser(profile);
              if ((profile as any)?.theme) {
                setTheme((profile as any).theme);
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
            }
          } else {
            setUser(null);
            const savedTheme = localStorage.getItem("theme") as Theme;
            if (savedTheme) {
              setTheme(savedTheme);
            }
          }
        } catch (err) {
          console.error("Auth listener error:", err);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (user && db) {
      try {
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, { theme: newTheme });
      } catch (error) {
        console.error("Failed to update theme in Firestore:", error);
      }
    }
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
        theme: theme, // Set default theme on registration
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
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!cred.user.emailVerified) {
      // If login successful but email not verified, throw an error
      if (auth) await signOut(auth); // Sign out the unverified user immediately
      throw new Error("Email not verified. Please check your inbox.");
    }
    // If verified, onAuthStateChanged will handle setting the user
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
