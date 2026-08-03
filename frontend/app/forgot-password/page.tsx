"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { KeyRound, Mail, Phone, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid registered Email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), identifier: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No account found with this email address.");
        return;
      }
      setStep(2);
    } catch (err) {
      // Offline fallback
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp !== "1234" && otp !== "0000" && otp.length < 4) {
      setError("Invalid OTP code. Use demo code 1234.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          identifier: email.trim(),
          otp,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep(3);
      } else {
        setError(data.error || "Failed to update password. Please check your details.");
      }
    } catch (err) {
      setError("Network error. Please make sure backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between">
      <div>
        <Header />

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 my-8">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gold/30 overflow-hidden">
            
            {/* Header Banner */}
            <div className="bg-[#0B1B3D] px-6 py-8 text-white text-center relative border-b border-gold/30">
              <div className="mx-auto w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center mb-3 border border-gold/40 shadow">
                <KeyRound size={28} className="text-gold" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-gold">Reset Password</h1>
              <p className="text-xs text-gray-300 mt-1">
                {step === 1 ? "Enter your registered email address to receive reset OTP" : step === 2 ? "Enter OTP code sent to your email and new password" : "Password successfully updated!"}
              </p>
            </div>

            {/* Step 1: Email Input */}
            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="p-6 sm:p-8 space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Registered Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. customer@example.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-gold text-xs text-gray-800 font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0B1B3D] text-gold hover:bg-[#162C5B] font-black py-3 rounded-xl transition flex items-center justify-center gap-2 border border-gold/30 text-xs shadow-md disabled:opacity-50"
                >
                  {loading ? "Sending Email OTP..." : "Send Password Reset OTP"}
                  {!loading && <ArrowRight size={16} />}
                </button>

                <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-600">
                  <Link href="/login" className="text-gold-dark font-extrabold hover:underline">
                    ← Back to Sign In
                  </Link>
                </div>
              </form>
            )}

            {/* Step 2: OTP & New Password Input */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="p-6 sm:p-8 space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold">
                  ✓ Reset OTP sent to email {email}. (Demo OTP: 1234)
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Enter 4-Digit Reset OTP</label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-gold text-xs text-gray-800 font-mono tracking-widest font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-gold text-xs text-gray-800 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-gold text-xs text-gray-800 font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold text-[#0B1B3D] hover:bg-gold-light font-black py-3 rounded-xl transition flex items-center justify-center gap-2 border border-gold text-xs shadow-md disabled:opacity-50"
                >
                  {loading ? "Updating Password..." : "Update Password"}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            )}

            {/* Step 3: Success Confirmation */}
            {step === 3 && (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto border-2 border-green-300">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-lg font-black text-[#0B1B3D]">Password Updated Successfully!</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  You can now log in to your Vardayini Sweet Mart account with your new password.
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full bg-[#0B1B3D] text-gold py-3 rounded-xl text-xs font-black hover:bg-[#162C5B] transition shadow"
                >
                  Sign In Now →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
