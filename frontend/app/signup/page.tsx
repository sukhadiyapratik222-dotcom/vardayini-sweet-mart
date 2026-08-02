"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Mail, Phone, Lock, User, ArrowRight, CheckCircle2, KeyRound } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    if (!phone) {
      setError("Please enter a mobile phone number first.");
      return;
    }
    setError(null);
    setOtpSent(true);
    setSuccessMsg(`OTP sent to ${phone}. (Demo OTP: 1234)`);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (res.ok && data.token && data.user) {
        login(data.token, data.user);
        router.push("/account/profile");
        return;
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between">
      <div>
        <Header />

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 my-6">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gold/30 overflow-hidden">
            
            {/* Header Banner */}
            <div className="bg-[#0B1B3D] px-6 py-8 text-white text-center relative border-b border-gold/30">
              <div className="mx-auto w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center mb-3 border border-gold/40 shadow">
                <UserPlus size={28} className="text-gold" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-gold">Create An Account</h1>
              <p className="text-xs text-gray-300 mt-1">Join Vardayini Sweet Mart for exclusive offers & order tracking</p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="p-6 sm:p-8 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-gold text-xs text-gray-800 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-gold text-xs text-gray-800 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-gold text-xs text-gray-800 font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="bg-amber-50 hover:bg-gold/20 text-[#0B1B3D] border border-gold/40 px-3 py-2.5 rounded-xl text-xs font-extrabold transition"
                  >
                    {otpSent ? "Resend" : "OTP Verify"}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Enter OTP Code</label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-gold text-xs text-gray-800 tracking-widest font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-gold text-xs text-gray-800 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-gold text-xs text-gray-800 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-[#0B1B3D] hover:bg-gold-light font-black py-3 rounded-xl transition flex items-center justify-center gap-2 border border-gold text-xs shadow-md disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ArrowRight size={16} />}
              </button>

              <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-600">
                <p>
                  Already have an account?{" "}
                  <Link href="/login" className="text-gold-dark font-extrabold hover:underline">
                    Sign In Here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
