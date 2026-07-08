import React, { useState } from "react";
import { LogIn, AlertCircle, Boxes } from "lucide-react";
import { AdminUser } from "../types";
import { setToken, redirectByRole, markSessionActive } from "./auth";

interface LoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
}

export default function LoginPage({ onLoginSuccess, onSwitchToSignUp, onSwitchToForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data: { error?: string; token?: string; user?: AdminUser } = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Server returned an invalid response. Please restart the app (npm run dev).");
        }
      } else if (!res.ok) {
        throw new Error(`Login failed (${res.status}). Restart the server with npm run dev.`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      setToken(data.token!);
      markSessionActive();
      if (data.user && redirectByRole(data.user.role)) {
        return;
      }
      onLoginSuccess(data.user!);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };




  

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-[#1f3a28] rounded-xl text-white shadow-md mb-4">
          <img src="admin/src/assets/images/herbavi-logo.jpeg" alt="Herbavi" className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-extrabold text-black tracking-wide uppercase">Herbavi</h1>
        <p className="text-xs text-gray-600 mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-lg">
        {error && (
          <div className="p-3 bg-red-950/40 text-red-400 border border-red-900/50 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email</label>
          <input
            type="email"
            required
            disabled={isSubmitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@herbavi.com"
            className="w-full text-xs p-3 bg-white text-black border border-gray-300 rounded-xl focus:outline-none focus:border-[#1f3a28]"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Password</label>
          <input
            type="password"
            required
            disabled={isSubmitting}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-xs p-3 bg-white text-black border border-gray-300 rounded-xl focus:outline-none focus:border-[#1f3a28]"
          />
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-[#1f3a28] hover:text-[#172d22] text-xs font-semibold cursor-pointer transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[#1f3a28] hover:bg-[#172d22] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span>{isSubmitting ? "Logging in..." : "Log In"}</span>
        </button>

        <p className="text-center text-xs text-gray-600 pt-2">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-[#1f3a28] font-semibold hover:text-[#172d22] cursor-pointer"
          >
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
}
