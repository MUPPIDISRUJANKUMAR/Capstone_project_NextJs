"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
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
import { useToast } from "../../contexts/ToastContext";

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);
  const {
    login,
    firebaseUser,
    sendEmailVerification: sendVerificationEmailAuth,
  } = useAuth();
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

    try {
      await login(email, password);
      // If login is successful and email is verified, AuthContext will handle redirection
    } catch (err: any) {
      if (err.message === "Email not verified. Please check your inbox.") {
        setError(err.message);
        setShowVerificationBanner(true);
        showToast(err.message, "error");
      } else if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential" // Added for more generic login errors
      ) {
        setError("Invalid email or password. Please try again.");
        showToast("Invalid email or password. Please try again.", "error");
      } else {
        setError("An unexpected error occurred. Please try again later.");
        showToast(
          "An unexpected error occurred. Please try again later.",
          "error"
        );
        console.error("Login error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    {
      email: "2203a51118@sru.edu.in",
      password: "Student@123",
      role: "Student",
    },
    {
      email: "2203a51249@sru.edu.in",
      password: "12345678",
      role: "Alumni",
    },
    { email: "srujanmuppidi@gmail.com", password: "123456", role: "Admin" },
  ];

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
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your CampusConnect account
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
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Demo Accounts
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {demoLogins.map((demo, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-sm"
                  onClick={() => {
                    setEmail(demo.email);
                    setPassword(demo.password);
                  }}
                >
                  Login as {demo.role}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button variant="link" className="p-0" onClick={onToggleMode}>
              Sign up
            </Button>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
