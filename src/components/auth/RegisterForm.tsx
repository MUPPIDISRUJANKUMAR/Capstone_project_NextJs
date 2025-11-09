'use client'

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as UserRole,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  const {
    register,
    firebaseUser,
    sendEmailVerification: sendVerificationEmailAuth,
  } = useAuth(); // Get sendEmailVerification from useAuth
  const { showToast } = useToast();

  const handleResendVerification = async () => {
    if (firebaseUser) {
      try {
        await sendVerificationEmailAuth(firebaseUser);
        showToast(
          "Verification email re-sent! Please check your inbox.",
          "info"
        );
      } catch (err) {
        console.error("Error re-sending verification email:", err);
        showToast("Failed to re-send verification email.", "error");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowVerificationBanner(false); // Hide banner on new submission attempt

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      showToast("Passwords do not match", "error");
      setLoading(false);
      return;
    }

        // College-specific email validation

        if (!formData.email.endsWith("@sru.edu.in")) {

          setError("Enter College specific mail (e.g., yourname@sru.edu.in)");

          showToast("Enter College specific mail (e.g., yourname@sru.edu.in)", "error");

          setLoading(false);

          return;

        }

    try {
      const firebaseUser = await register(formData); // register now returns the FirebaseUser
      if (firebaseUser && !firebaseUser.emailVerified) {
        setShowVerificationBanner(true);
        showToast(
          "Registration Successful! Please verify your email.",
          "success"
        );
      } else {
        showToast("Registration Successful!", "success");
        // Redirect to dashboard if already verified (shouldn't happen on first register)
      }
    } catch (err: any) {
      let errorMessage =
        "An unexpected error occurred. Please try again later.";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (err.code === "auth/weak-password") {
        errorMessage =
          "The password is too weak. Please use at least 6 characters.";
      } else {
        console.error("Registration error:", err);
      }
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join CampusConnect to start networking
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {showVerificationBanner && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-md flex items-center justify-between"
                role="alert"
              >
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-3" />
                  <p className="font-bold">Verify Your Email</p>
                  <p className="text-sm ml-2">
                    Please check your inbox for a verification link.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendVerification}
                  className="text-yellow-700 hover:bg-yellow-200"
                >
                  Resend
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVerificationBanner(false)}
                  className="text-yellow-700 hover:bg-yellow-200"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="pl-10"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select.Root
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <Select.Trigger className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <Select.Value placeholder="Select role" />
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Select.Trigger>

                <Select.Portal>
                  <Select.Content className="bg-background border rounded-lg shadow-lg p-1">
                    <Select.Viewport>
                      <Select.Item
                        value="student"
                        className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent"
                      >
                        <Select.ItemText>Student</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="alumni"
                        className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent"
                      >
                        <Select.ItemText>Alumni</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-10"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="pl-10"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="p-0" onClick={onToggleMode}>
              Sign in
            </Button>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
