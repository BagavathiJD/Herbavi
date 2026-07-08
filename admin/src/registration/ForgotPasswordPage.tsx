import React, { useState } from "react";
import { KeyRound, AlertCircle, CheckCircle, Boxes } from "lucide-react";

interface ForgotPasswordPageProps {
  onSwitchToLogin: () => void;
}

export default function ForgotPasswordPage({ onSwitchToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          newPassword,
        }),
      });

      const text = await res.text();
      let data: { error?: string; message?: string } = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Server returned an invalid response. Please restart the app.");
        }
      }

      if (!res.ok) {
        throw new Error(data.error || "Password reset failed.");
      }

      setSuccess(true);
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Password reset failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-[#1f3a28] rounded-xl text-white shadow-md mb-4">
          <Boxes className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-extrabold text-black tracking-wide uppercase">Herbavi Admin</h1>
        <p className="text-xs text-gray-600 mt-1">Reset your password</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-lg"
      >
        {error && (
          <div className="p-3 bg-red-950/40 text-red-400 border border-red-900/50 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-950/40 text-green-400 border border-green-900/50 text-xs rounded-xl flex items-start gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Password reset successfully! Redirecting to login...</span>
          </div>
        )}

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            Confirm Email
          </label>
          <input
            type="email"
            required
            disabled={isSubmitting || success}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@herbavi.com"
            className="w-full text-xs p-3 bg-white text-black border border-gray-300 rounded-xl focus:outline-none focus:border-[#1f3a28] disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            New Password
          </label>
          <input
            type="password"
            required
            disabled={isSubmitting || success}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-xs p-3 bg-white text-black border border-gray-300 rounded-xl focus:outline-none focus:border-[#1f3a28] disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            Confirm Password
          </label>
          <input
            type="password"
            required
            disabled={isSubmitting || success}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-xs p-3 bg-white text-black border border-gray-300 rounded-xl focus:outline-none focus:border-[#1f3a28] disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || success}
          className="w-full py-3 bg-[#1f3a28] hover:bg-[#172d22] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
        >
          <KeyRound className="w-4 h-4" />
          <span>{isSubmitting ? "Resetting..." : "Reset Password"}</span>
        </button>

        <p className="text-center text-xs text-gray-600 pt-2">
          Remember your password?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={isSubmitting}
            className="text-[#1f3a28] font-semibold hover:text-[#172d22] cursor-pointer disabled:opacity-50"
          >
            Back to login
          </button>
        </p>
      </form>
    </div>
  );
}
