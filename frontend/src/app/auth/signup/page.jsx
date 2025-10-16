"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../../assets/MetaIcon.png";
import Image2 from "../../../assets/image2.jpg";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isValid:
        hasMinLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar,
    };
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value && value.length < 2) {
      setNameError("Name must be at least 2 characters");
    } else {
      setNameError("");
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const validation = validatePassword(value);
    if (value && !validation.isValid) {
      setPasswordError(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      );
    } else {
      setPasswordError("");
    }
  };

  const PasswordStrengthIndicator = ({ password, isFocused }) => {
    const validation = validatePassword(password);
    const strength = Object.values(validation).filter(Boolean).length - 1;

    if (!isFocused && !password) return null;

    const getStrengthColor = () => {
      if (strength === 0) return "bg-gray-300";
      if (strength <= 2) return "bg-red-500";
      if (strength <= 3) return "bg-yellow-500";
      return "bg-green-500";
    };

    const getStrengthText = () => {
      if (strength === 0) return "Very Weak";
      if (strength <= 2) return "Weak";
      if (strength <= 3) return "Medium";
      return "Strong";
    };

    const requirements = [
      {
        key: "hasMinLength",
        text: "At least 8 characters",
        met: validation.hasMinLength,
      },
      {
        key: "hasUpperCase",
        text: "One uppercase letter",
        met: validation.hasUpperCase,
      },
      {
        key: "hasLowerCase",
        text: "One lowercase letter",
        met: validation.hasLowerCase,
      },
      { key: "hasNumber", text: "One number", met: validation.hasNumber },
      {
        key: "hasSpecialChar",
        text: "One special character (!@#$%^&*)",
        met: validation.hasSpecialChar,
      },
    ];

    const unmetRequirements = requirements.filter((req) => !req.met);

    return (
      <div className="mb-4 transition-all duration-300">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Password Strength:</span>
          <span
            className={`text-sm font-medium ${
              strength <= 2
                ? "text-red-500"
                : strength <= 3
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            {getStrengthText()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          ></div>
        </div>

        {unmetRequirements.length > 0 && (
          <div className="mt-2 text-xs">
            <p className="text-gray-500 mb-1">Still needed:</p>
            <ul className="space-y-1">
              {unmetRequirements.map((req) => (
                <li key={req.key} className="flex items-center text-gray-600">
                  <span className="text-red-500 mr-2">✕</span>
                  {req.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {unmetRequirements.length === 0 && password && (
          <div className="mt-2 text-xs flex items-center text-green-600">
            <span className="mr-2">✓</span>
            All requirements met!
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (name.length < 2) {
      setNameError("Name must be at least 2 characters");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      );
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border px-3 py-1.5 rounded-md text-sm bg-white hover:bg-gray-50"
        >
          <span>←</span>
          <span>Home</span>
        </Link>
      </div>
      <div className="hidden lg:flex bg-emerald-900 text-emerald-50 relative overflow-hidden order-2 lg:order-1">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(60% 80% at 70% 20%, rgba(255,255,255,0.15), transparent)",
          }}
        />
        <div className="w-full h-full flex items-center justify-center p-10">
          <div className="max-w-md text-center">
            <div className="mb-6 flex items-center justify-center gap-2 text-emerald-200">
              <span className="text-blue">🧬</span>
              <span>Your health, simplified</span>
            </div>
            <div className="bg-emerald-800/70 border border-emerald-700 rounded-xl shadow-2xl overflow-hidden">
              <Image
                src={Image2}
                alt="Medical illustration"
                width={500}
                height={500}
                className="object-cover w-full h-[500px]"
                priority
              />
            </div>

            <div className="mt-6">
              <button className="bg-white text-emerald-900 px-6 py-2 rounded-md font-semibold shadow-md hover:bg-gray-100 transition">
                Explore features
              </button>

              <p className="mt-4 text-sm text-emerald-200">
                Sign up to securely manage your health data, get AI-powered
                insights, and make smarter health decisions — all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="bg-white flex items-center justify-center p-6 sm:p-10 order-1 lg:order-2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex gap-2 justify-center items-center">
            <Image src={Logo} alt="" className="h-12 w-12"></Image>
            <span className="text-2xl font-bold text-emerald-700">
              HealthMate
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-2">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-emerald-700 font-medium">
              Sign in
            </Link>
          </p>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Full name
              </label>
              <input
                type="text"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  nameError ? "border-red-500" : ""
                }`}
                value={name}
                onChange={handleNameChange}
                disabled={isLoading}
                placeholder="John Doe"
              />
              {nameError && (
                <p className="text-red-500 text-xs mt-1">{nameError}</p>
              )}
            </div>

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
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  disabled={isLoading}
                  placeholder="Enter a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-500"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
              <PasswordStrengthIndicator
                password={password}
                isFocused={passwordFocused}
              />
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
              <span>{isLoading ? "Creating Account…" : "Create account"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
