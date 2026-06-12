import React, { useState } from "react";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
import { AdminUser } from "../types";

interface AuthGateProps {
  onAuthenticated: (user: AdminUser) => void;
}

export default function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      {mode === "login" ? (
        <LoginPage
          onLoginSuccess={onAuthenticated}
          onSwitchToSignUp={() => setMode("signup")}
        />
      ) : (
        <SignUpPage
          onSignUpSuccess={onAuthenticated}
          onSwitchToLogin={() => setMode("login")}
        />
      )}
    </div>
  );
}
