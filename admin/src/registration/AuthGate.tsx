import React, { useState } from "react";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import { AdminUser } from "../types";

interface AuthGateProps {
  onAuthenticated: (user: AdminUser) => void;
}

export default function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgotpassword">("login");

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 admin-app">
      {mode === "login" ? (
        <LoginPage
          onLoginSuccess={onAuthenticated}
          onSwitchToSignUp={() => setMode("signup")}
          onSwitchToForgotPassword={() => setMode("forgotpassword")}
        />
      ) : mode === "signup" ? (
        <SignUpPage
          onSignUpSuccess={() => setMode("login")}
          onSwitchToLogin={() => setMode("login")}
        />
      ) : (
        <ForgotPasswordPage onSwitchToLogin={() => setMode("login")} />
      )}
    </div>
  );
}