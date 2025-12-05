// src/pages/Auth/Register.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle,
  ShieldCheck, RefreshCw, Home, Search
} from "lucide-react";
import dealDirectLogo from "../../assets/dealdirect_logo.png";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Register() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", agree: false
  });
  const [userType, setUserType] = useState("buyer");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.agree)
      return toast.error("Please accept the Terms & Privacy Policy");

    setIsLoading(true);
    try {
      if (userType === "buyer") {
        const res = await axios.post(`${API_BASE}/api/users/register-direct`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "user",
        });

        const { token, user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        window.dispatchEvent(new Event("auth-change"));

        toast.success("Welcome to DealDirect!");
        navigate("/");
      } else {
        await axios.post(`${API_BASE}/api/users/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "owner",
        });

        toast.success("OTP sent! Please verify.");
        setStep(2);
        setResendTimer(60);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    try {
      await axios.post(`${API_BASE}/api/users/resend-otp`, {
        email: formData.email,
      });
      toast.success("OTP resent!");
      setResendTimer(60);
      setOtp("");
    } catch (err) {
      toast.error("Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/users/verify-otp`, {
        email: formData.email,
        otp,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("auth-change"));

      toast.success("Registration complete!");
      navigate("/");
    } catch (err) {
      toast.error("Invalid OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1f] flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* Futuristic glowing background orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600/20 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-purple-600/20 blur-3xl rounded-full animate-pulse"></div>

      {/* Outer Container */}
      <div className="w-full max-w-6xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.45)] flex flex-col md:flex-row overflow-hidden">

        {/* LEFT PANEL (BRANDING) */}
        <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-14 text-white">

          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1920')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1fd9] to-[#0a0f1f]"></div>

          <div className="relative z-20 flex items-center gap-3 mb-8">
            <img src={dealDirectLogo} className="h-14 drop-shadow-xl" />
          </div>

          <div className="relative z-20">
            <h2 className="text-4xl font-extrabold leading-tight drop-shadow-xl">
              Discover your <span className="text-blue-400">dream property</span>
              <br /> with confidence.
            </h2>

            <ul className="mt-8 space-y-4 text-gray-200/90">
              {[
                "Direct deals with verified owners",
                "Zero brokerage, full transparency",
                "Futuristic AI-powered property matching",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-20 text-xs text-gray-400 mt-10">
            © 2025 DealDirect — The Future of Real Estate.
          </div>
        </div>

        {/* RIGHT PANEL (FORM) */}
        <div className="md:w-1/2 w-full p-10 md:p-14 bg-white/5 backdrop-blur-xl text-white">

          {step === 1 ? (
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold">Create Your Account</h2>
                <p className="text-gray-300 mt-2">Join the next-gen real estate marketplace.</p>
              </div>

              {/* USER TYPE */}
              <div className="mb-8">
                <label className="text-sm font-medium text-gray-300 block mb-3">I want to:</label>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      type: "buyer",
                      icon: <Search className="w-6 h-6" />,
                      title: "Buy Property",
                      desc: "Browse & purchase",
                    },
                    {
                      type: "owner",
                      icon: <Home className="w-6 h-6" />,
                      title: "List Property",
                      desc: "Sell or rent",
                    },
                  ].map((item) => (
                    <div
                      key={item.type}
                      onClick={() => setUserType(item.type)}
                      className={`cursor-pointer group p-5 rounded-xl border transition-all backdrop-blur-xl 
                        ${
                          userType === item.type
                            ? "border-blue-500 bg-blue-500/20 shadow-[0_0_20px_rgba(0,150,255,0.4)]"
                            : "border-white/20 hover:border-white/40 hover:bg-white/10"
                        }
                      `}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-2 text-blue-400">{item.icon}</div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-xs text-gray-300 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {userType === "owner" && (
                  <p className="text-xs text-amber-400 mt-2 flex items-center gap-2">
                    <ShieldCheck size={14} /> Email verification required
                  </p>
                )}
              </div>

              {/* FORM */}
              <form onSubmit={handleRegister} className="space-y-6">

                {/* NAME */}
                <div>
                  <label className="text-sm text-gray-300">Full Name</label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="text-sm text-gray-300">Email Address</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="text-sm text-gray-300">Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {/* TERMS */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={formData.agree}
                    onChange={handleChange}
                    className="w-4 h-4 rounded bg-white/10 border-white/30 focus:ring-blue-500"
                  />
                  <label className="ml-3 text-sm text-gray-300">
                    I agree to the{" "}
                    <span className="text-blue-400 cursor-pointer">Terms</span> &{" "}
                    <span className="text-blue-400 cursor-pointer">Privacy Policy</span>
                  </label>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-500/30 flex justify-center items-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                    </>
                  ) : userType === "owner" ? (
                    "Send OTP"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* FOOTER */}
              <div className="text-center text-gray-400 text-sm mt-8">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-400 hover:underline">
                  Log In
                </Link>
              </div>
            </>
          ) : (
            /* OTP SCREEN */
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,150,255,0.4)] mb-5">
                  <ShieldCheck className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold">Email Verification</h2>
                <p className="text-gray-300 mt-2">
                  Enter the 6-digit code sent to  
                  <span className="text-blue-400"> {formData.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    className="w-full text-center text-3xl tracking-widest py-4 bg-white/10 border border-white/20 rounded-xl text-blue-300 focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-500/30 flex justify-center items-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Complete Registration"
                  )}
                </button>

                {/* RESEND */}
                <div className="text-center text-sm text-gray-400">
                  Didn’t receive OTP?
                  <button
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || resendLoading}
                    className="ml-2 text-blue-400 hover:underline disabled:text-gray-500"
                  >
                    {resendLoading ? (
                      <>Sending...</>
                    ) : resendTimer > 0 ? (
                      <>Resend in {resendTimer}s</>
                    ) : (
                      "Resend OTP"
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-gray-400 text-sm hover:text-white transition"
                >
                  Change Email
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
