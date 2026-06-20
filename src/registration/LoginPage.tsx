import React, { useState } from "react";
import { LogIn, AlertCircle, Boxes } from "lucide-react";
import { AdminUser } from "../types";
import { setToken } from "./auth";

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

      setToken(data.token);
      onLoginSuccess(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30 mb-4">
          <Boxes className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-extrabold text-white tracking-wide uppercase">Herbavi Admin</h1>
        <p className="text-xs text-slate-400 mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        {error && (
          <div className="p-3 bg-red-950/40 text-red-400 border border-red-900/50 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
          <input
            type="email"
            required
            disabled={isSubmitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@herbavi.com"
            className="w-full text-xs p-3 bg-[#020617] text-white border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
          <input
            type="password"
            required
            disabled={isSubmitting}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-xs p-3 bg-[#020617] text-white border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span>{isSubmitting ? "Logging in..." : "Log In"}</span>
        </button>

        <p className="text-center text-xs text-slate-400 pt-2">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-indigo-400 font-semibold hover:text-indigo-300 cursor-pointer"
          >
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
}
