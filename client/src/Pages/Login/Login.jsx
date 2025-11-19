// src/pages/Auth/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/users/login`, formData);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("auth-change"));

      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-4xl mt-30 flex flex-col md:flex-row rounded-3xl shadow-xl overflow-hidden bg-white">

        {/* LEFT BLUE PANEL */}
        <div className="md:w-1/2 bg-blue-900 text-white flex flex-col justify-center items-center px-10 py-14">
          <h1 className="text-5xl font-extrabold mb-4 tracking-wide">
            deal<span className="text-gray-200">direct</span>
          </h1>
          <p className="text-lg opacity-90 max-w-sm text-center">
            Welcome back! Login to continue exploring broker-free properties.
          </p>
        </div>

        {/* FORM SECTION */}
        <div className="md:w-1/2 px-8 py-14">
          <h2 className="text-3xl font-bold mb-6 text-[#003366]">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#003366] outline-none"
            />

            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#003366] outline-none"
            />

            <button
              type="submit"
              className="w-full bg-[#003366] text-white py-3 rounded-xl font-semibold hover:bg-[#00254d] transition"
            >
              Login
            </button>
          </form>

          <p className="mt-5 text-sm">
            Don’t have an account?{" "}
            <a href="/register" className="text-[#003366] font-semibold">
              Register
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
