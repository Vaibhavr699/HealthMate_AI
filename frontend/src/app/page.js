"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "../assets/MetaIcon.png";

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const features = [
    {
      icon: "🩺",
      title: "AI-Powered Diagnosis",
      description:
        "Get instant medical insights and preliminary diagnosis based on your symptoms",
    },
    {
      icon: "💊",
      title: "Medication Guidance",
      description:
        "Receive personalized medication reminders and drug interaction alerts",
    },
    {
      icon: "📊",
      title: "Health Analytics",
      description:
        "Track your vitals and health metrics with intelligent trend analysis",
    },
    {
      icon: "🔒",
      title: "Secure & Private",
      description:
        "Your health data is encrypted and protected with enterprise-grade security",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      content:
        "This AI has been a game-changer for managing my chronic condition. It's like having a doctor available 24/7.",
      rating: 5,
    },
    {
      name: "Dr. Michael Chen",
      role: "General Practitioner",
      content:
        "An excellent tool that helps patients understand their health better. The AI provides accurate preliminary assessments.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Health Enthusiast",
      content:
        "I love how it explains complex medical terms in simple language. It's educational and practical.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute -bottom-32 left-1/2 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <header className="relative z-50 backdrop-blur-sm bg-white/70 border-b border-emerald-100">
        <div className="max-w-full mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <Image src={Logo} alt=""></Image>
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                HealthMate AI
              </span>
            </div>

            <nav className="hidden lg:flex space-x-8 text-sm font-medium">
              <Link
                href="#features"
                className="text-gray-700 hover:text-emerald-600 transition-all duration-300 cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-emerald-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-700 hover:text-emerald-600 transition-all duration-300 cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-emerald-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                How It Works
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-700 hover:text-emerald-600 transition-all duration-300 cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-emerald-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Testimonials
              </Link>
              <Link
                href="#contact"
                className="text-gray-700 hover:text-emerald-600 transition-all duration-300 cursor-pointer relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-emerald-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Contact
              </Link>
            </nav>

            <div className="hidden lg:flex items-center space-x-3">
              <Link href="/auth/signin">
                <button className="border-2 border-emerald-500 text-emerald-600 text-sm px-6 py-2.5 rounded-full hover:bg-emerald-50 transition-all duration-300 font-semibold cursor-pointer transform hover:scale-105">
                  Log in
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm px-6 py-2.5 rounded-full hover:shadow-lg transition-all duration-300 font-semibold cursor-pointer transform hover:scale-105 hover:from-emerald-600 hover:to-teal-700">
                  Sign up
                </button>
              </Link>
            </div>

            <button
              className="lg:hidden p-2 text-gray-700 hover:text-emerald-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-emerald-100">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="#features"
                  className="text-gray-700 hover:text-emerald-600 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-gray-700 hover:text-emerald-600 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  href="#testimonials"
                  className="text-gray-700 hover:text-emerald-600 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </Link>
                <Link
                  href="#contact"
                  className="text-gray-700 hover:text-emerald-600 transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <div className="flex flex-col space-y-3 pt-4 border-t border-emerald-100">
                  <Link href="/auth/signin">
                    <button className="w-full border-2 border-emerald-500 text-emerald-600 text-sm px-6 py-2.5 rounded-full hover:bg-emerald-50 transition-all duration-300 font-semibold">
                      Log in
                    </button>
                  </Link>
                  <Link href="/auth/signup">
                    <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm px-6 py-2.5 rounded-full hover:shadow-lg transition-all duration-300 font-semibold">
                      Sign up
                    </button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <main className="relative z-10">
        <section className="relative overflow-hidden py-12 sm:py-24 px-4 sm:px-6">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600')] bg-cover bg-center opacity-10"></div>

          <div className="max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 items-center">
              <div className="space-y-6 sm:space-y-8 animate-fade-in">
                <div className="inline-block">
                  <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
                    🌟 Your 24/7 Health Companion
                  </span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 leading-tight">
                  Chat with Your
                  <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    AI Doctor Assistant
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                  Get instant medical advice, symptom analysis, and personalized
                  health recommendations powered by advanced AI technology. Your
                  health journey starts here.
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                  <Link href="/auth/signup">
                    <button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer transform hover:scale-105 hover:-translate-y-1">
                      Start Free Consultation
                    </button>
                  </Link>
                  <button className="w-full sm:w-auto bg-white hover:bg-gray-50 text-emerald-600 border-2 border-emerald-500 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105 flex items-center justify-center gap-2">
                    <span>▶</span> Watch Demo
                  </button>
                </div>
              </div>

              <div className="relative lg:block hidden">
                <div className="relative w-full h-[500px] rounded-4xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105 cursor-pointer">
                  <img
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800"
                    alt="Doctor consulting"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent"></div>

                  <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xl">
                        🤖
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">AI Doctor</p>
                        <p className="text-gray-800 font-medium">
                          Based on your symptoms, I recommend drinking more
                          water and getting rest. Would you like me to explain
                          more?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl animate-bounce cursor-pointer hover:shadow-2xl transition-shadow">
                  <p className="text-3xl font-bold text-emerald-600">24/7</p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-12 sm:py-20 px-4 sm:px-6 bg-white/50 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
                Features
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mt-4 mb-6">
                Everything You Need for Better Health
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Comprehensive AI-powered tools designed to help you take control
                of your health journey
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-2 border-transparent hover:border-emerald-200"
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="text-5xl mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-50"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
                Process
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-4 mb-6">
                How It Works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
                Follow our simple three-step process to get personalized medical
                insights powered by AI.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10 relative">
              {[
                {
                  step: "01",
                  title: "Share Symptoms",
                  desc: "Describe your symptoms in natural language",
                  icon: "💬",
                },
                {
                  step: "02",
                  title: "AI Analysis",
                  desc: "Our AI analyzes your data and medical history",
                  icon: "🧠",
                },
                {
                  step: "03",
                  title: "Get Insights",
                  desc: "Receive personalized recommendations ",
                  icon: "✨",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  aria-label={`Step ${item.step}: ${item.title}`}
                >
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-5xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                      {item.icon}
                    </div>
                    <div className="text-emerald-100 font-bold text-sm mb-2">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-emerald-50">{item.desc}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:flex absolute top-1/3 z-50 -right-10 text-5xl text-blue-600 animate-pulse">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Middle Image Section */}
            <div className="mt-16 sm:mt-24 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200"
                  alt="Medical technology showcasing AI analysis"
                  className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-teal-900/80 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center text-white px-6">
                    <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 animate-fadeIn">
                      Advanced Medical AI Technology
                    </h3>
                    <p className="text-base sm:text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto">
                      Powered by cutting-edge machine learning algorithms
                      trained on millions of medical cases for precise and
                      personalized recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section
          id="testimonials"
          className="py-12 sm:py-20 px-4 sm:px-6 bg-white/50 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
                Testimonials
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mt-4 mb-6">
                Trusted by Thousands
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full"></div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 sm:p-12 text-center shadow-2xl transform transition-all duration-300 hover:scale-105 cursor-pointer">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to Take Control of Your Health?
              </h2>
              <p className="text-emerald-50 text-lg sm:text-xl mb-8">
                Join thousands of users who trust HealthMate AI for their health
                needs
              </p>
              <Link href="/auth/signup">
                <button className="bg-white text-emerald-600 px-8 sm:px-10 py-4 rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
                  Get Started for Free
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-gray-900 text-white py-12 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10  rounded-xl flex items-center justify-center">
                  <Image src={Logo} alt=""></Image>
                </div>
                <span className="text-xl font-bold">HealthMate AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted AI health companion available 24/7
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link
                    href="#"
                    className="hover:text-emerald-400 transition cursor-pointer"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-emerald-400 transition cursor-pointer"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-emerald-400 transition cursor-pointer"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link
                    href="#"
                    className="hover:text-emerald-400 transition cursor-pointer"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-emerald-400 transition cursor-pointer"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-emerald-400 transition cursor-pointer"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link
                    href="#"
                    className="hover:text-emerald-400 transition cursor-pointer"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-emerald-400 transition cursor-pointer"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-emerald-400 transition cursor-pointer"
                  >
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; All rights reserved by Vaibhav Raj</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
