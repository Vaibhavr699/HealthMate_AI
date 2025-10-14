"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SideImage from "@/assets/image1.jpg";
import Logo from "../../../assets/MetaIcon.png";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(
      value && !validateEmail(value) ? "Please enter a valid email address" : ""
    );
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(
      value && value.length < 6 ? "Password must be at least 6 characters" : ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) return setError("Please fill in all fields");
    if (!validateEmail(email))
      return setEmailError("Please enter a valid email address");
    if (password.length < 6)
      return setPasswordError("Password must be at least 6 characters");

    setIsLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative">
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border px-3 py-1.5 rounded-md text-sm bg-green-700 text-white hover:bg-green-600"
        >
          <span>←</span>
          <span>Home</span>
        </Link>
      </div>

      {/* Left side */}
      <div className="bg-white flex items-center justify-center p-6 sm:p-10 relative">
        <div className="w-full max-w-md relative z-10">
          <div className="mb-8 flex gap-2 justify-center items-center">
            <Image src={Logo} alt="" className="h-12 w-12"></Image>
            <span className="text-2xl font-bold text-emerald-700">
              HealthMate
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Sign in</h1>
          <p className="text-gray-500 mt-2">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-emerald-700 font-medium">
              Create now
            </Link>
          </p>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  emailError ? "border-red-500" : ""
                }`}
                placeholder="example@gmail.com"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading}
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Password
              </label>
              <div
                className={`flex items-center border rounded-md px-3 ${
                  passwordError ? "border-red-500" : ""
                }`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  className="flex-1 py-2 focus:outline-none"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-500 cursor-pointer"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className={`w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-md font-medium transition flex items-center justify-center gap-2 ${
                isLoading ? "opacity-60" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isLoading ? "Signing in…" : "Sign in"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right side */}
      <div className="hidden lg:flex bg-emerald-900 text-emerald-50 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(60% 80% at 70% 20%, rgba(255,255,255,0.15), transparent)",
          }}
        />
        <div className="w-full h-full flex items-center justify-center p-10">
          <div className="max-w-md">
            <div className="mb-6 flex items-center gap-2 text-emerald-200">
              <span>🩺</span>
              <span>Support</span>
            </div>
            <div className="bg-emerald-800/70 border border-emerald-700 rounded-xl p-5 shadow-xl flex flex-col items-center">
              <div className="relative w-full h-64 mb-4">
                <Image
                  src={SideImage}
                  alt="Medical illustration"
                  fill
                  className="rounded-lg object-fill"
                  priority
                />
              </div>
              <h3 className="text-xl font-semibold text-center text-white">
                Stay on top of your health
              </h3>
            </div>
            <div className="mt-4 text-center">
              <p className="text-emerald-200">
                Upload lab reports, prescriptions, and records. Get clear,
                empathetic explanations powered by AI.
              </p>
              <button className="mt-4 bg-white text-emerald-900 px-4 py-2 rounded-md font-medium cursor-pointer">
                Learn more
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
