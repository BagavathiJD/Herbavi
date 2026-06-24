import React, { useState } from "react";
import { UserPlus, AlertCircle, Boxes } from "lucide-react";
import { AdminUser } from "../types";
import { setToken } from "./auth";

interface SignUpPageProps {
  onSignUpSuccess: (user: AdminUser) => void;
  onSwitchToLogin: () => void;
}

export default function SignUpPage({ onSignUpSuccess, onSwitchToLogin }: SignUpPageProps) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [mail, setMail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: mail,
          password,
          phone: phoneNumber,
        }),
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
        throw new Error(`Registration failed (${res.status}). Restart the server with npm run dev.`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      if (!data.token || !data.user) {
        throw new Error("Registration saved but server response was incomplete. Try signing in.");
      }

      setToken(data.token);
      onSignUpSuccess(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass =
    "w-full text-xs p-3 bg-[#020617] text-white border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500";

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30 mb-4">
          <Boxes className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-extrabold text-white tracking-wide uppercase">Create Account</h1>
        <p className="text-xs text-slate-400 mt-1">Register for Herbavi admin panel</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        {error && (
          <div className="p-3 bg-red-950/40 text-red-400 border border-red-900/50 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">User Name</label>
          <input
            type="text"
            required
            disabled={isSubmitting}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your user name"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
          <input
            type="password"
            required
            minLength={6}
            disabled={isSubmitting}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mail</label>
          <input
            type="email"
            required
            disabled={isSubmitting}
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            placeholder="you@example.com"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
          <input
            type="tel"
            required
            disabled={isSubmitting}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1-555-0100"
            className={fieldClass}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isSubmitting ? "Creating account..." : "Sign Up"}</span>
        </button>

        <p className="text-center text-xs text-slate-400 pt-2">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-indigo-400 font-semibold hover:text-indigo-300 cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}
