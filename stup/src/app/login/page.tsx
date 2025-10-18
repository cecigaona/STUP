"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: replace this with your real auth call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);

    // In your old app you called onLogin(username). Here we just route:
    router.push("/dashboard");
  };

  const handleGoogleLogin = () => {
    // If you have NextAuth or a custom route, point to it here:
    // window.location.href = "/api/auth/signin/google";
    // or use an env var you expose as NEXT_PUBLIC_GOOGLE_AUTH_URL
    console.log("Google login clicked");
  };

  const goRegister = () => router.push("/register");

  return (
    <div className="min-h-screen bg-[#F3E7D2] flex items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <h1 className="text-[#145147] text-5xl font-bold tracking-wide">STUP</h1>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h2 className="text-[#145147] text-4xl font-semibold leading-tight">
            Welcome<br />back
          </h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm rounded-full border-0 
                         text-gray-700 placeholder-gray-500 text-lg
                         focus:outline-none focus:ring-2 focus:ring-[#145147]/30 focus:bg-white
                         transition-all duration-300 ease-in-out
                         shadow-sm hover:shadow-md"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm rounded-full border-0 
                         text-gray-700 placeholder-gray-500 text-lg
                         focus:outline-none focus:ring-2 focus:ring-[#145147]/30 focus:bg-white
                         transition-all duration-300 ease-in-out
                         shadow-sm hover:shadow-md"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#145147] text-white py-4 rounded-full text-lg font-medium
                       hover:bg-[#0f3d37] active:bg-[#0a2d27] 
                       focus:outline-none focus:ring-2 focus:ring-[#145147]/50 focus:ring-offset-2 focus:ring-offset-[#F3E7D2]
                       transition-all duration-300 ease-in-out
                       shadow-lg hover:shadow-xl active:shadow-md
                       transform hover:-translate-y-0.5 active:translate-y-0
                       disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Logging in...
              </div>
            ) : (
              "Log in"
            )}
          </button>

          <div className="flex items-center justify-center my-8">
            <span className="text-gray-500 text-sm">or</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white/90 backdrop-blur-sm text-gray-700 py-4 rounded-full text-lg font-medium
                       hover:bg-white hover:shadow-lg active:bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-[#F3E7D2]
                       transition-all duration-300 ease-in-out
                       shadow-md hover:shadow-xl active:shadow-sm
                       transform hover:-translate-y-0.5 active:translate-y-0
                       border border-gray-200/50"
          >
            Log in with Google
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Don&apos;t have an account?{" "}
            <button
              onClick={goRegister}
              className="text-[#145147] font-medium hover:underline focus:outline-none focus:underline
                         transition-all duration-200 ease-in-out"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
