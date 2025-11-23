// src/pages/Auth/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"; // Ensure you have lucide-react or use SVGs
import dealDirectLogo from "../../assets/dealdirect_logo.png";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/users/login`, formData);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Notify other components (like Navbar) that auth state changed
      window.dispatchEvent(new Event("auth-change"));

      toast.success(`Welcome back, ${user.name || 'User'}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

        {/* LEFT SIDE - IMAGE & BRANDING */}
        <div className="md:w-1/2 relative hidden md:flex flex-col justify-between p-12 text-white">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')" }}>
          </div>
          <div className="absolute inset-0 bg-slate-900/60 z-10"></div>

          {/* Content over image */}
          <div className="relative z-20 flex items-center gap-2 mb-6">
            <img src={dealDirectLogo} alt="DealDirect" className="h-12 w-auto" />
          </div>

          <div className="relative z-20 mb-8">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Find your dream property, <br /> <span className="text-blue-400">Broker-free.</span>
            </h2>
            <p className="text-gray-300 text-lg">
              Join thousands of buyers and sellers connecting directly on the world's most transparent real estate platform.
            </p>
          </div>

          <div className="relative z-20 text-sm text-gray-400">
            © 2025 DealDirect. All rights reserved.
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="md:w-1/2 w-full p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
              <p className="text-slate-500 mt-2">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-colors outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-colors outline-none text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me / Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-blue-900 border-slate-300 rounded focus:ring-blue-900" />
                  <span className="ml-2 text-slate-600">Remember me</span>
                </label>
                <a href="#" className="font-medium text-blue-900 hover:underline">Forgot password?</a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-3.5 rounded-lg font-semibold hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-slate-500">
              Don’t have an account?{" "}
              <Link to="/register" className="font-bold text-blue-900 hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}