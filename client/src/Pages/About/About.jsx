import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillLinkedin, AiOutlineMail } from "react-icons/ai";
import { FaBuilding, FaHandshake, FaUserShield, FaChartLine } from "react-icons/fa";

export default function About() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div className="bg-slate-900 text-white font-sans overflow-x-hidden selection:bg-pink-500 selection:text-white">
      
      {/* --- HERO SECTION: Focus on Trust & Market --- */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Blobs (Kept for visual appeal) */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full border border-blue-400/30 bg-blue-500/10 backdrop-blur-md text-blue-300 text-sm font-semibold tracking-wide uppercase">
            <FaBuilding className="text-blue-400" />
            <span>A Venture by IshiSoft  Pvt Ltd</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            Real Estate Simplified, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
              Direct Connect with Owners
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
  <strong>
    We are India's fastest-growing "PropTech" platform. We combine deep real estate expertise with cutting-edge technology to eliminate brokerage fees and bring transparency to every deal.
  </strong>
</p>

          
          {/* Trust Metrics (Business Focused) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: "Brokerage Saved", val: "₹50Cr+" },
              { label: "Happy Families", val: "10k+" },
              { label: "Cities", val: "12+" },
              { label: "Verified Listings", val: "100%" }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-default">
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.val}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- COMPANY VALUES (Why Trust Us?) --- */}
      <section className="py-24 px-6 relative bg-slate-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:-translate-y-2 transition-all duration-300">
                <FaUserShield className="text-4xl text-blue-500 mb-6" />
                <h3 className="text-xl font-bold mb-3">100% Verified Owners</h3>
                <p className="text-slate-400 leading-relaxed">
                    We don't just list properties; we verify them. Our tech-enabled verification ensures you only deal with genuine owners, eliminating fake listings and fraud.
                </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:-translate-y-2 transition-all duration-300">
                <FaHandshake className="text-4xl text-indigo-500 mb-6" />
                <h3 className="text-xl font-bold mb-3">Zero Commission Policy</h3>
                <p className="text-slate-400 leading-relaxed">
                    We believe your money belongs to you. Our platform connects you directly, saving you lakhs in brokerage fees that traditional agents charge.
                </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:-translate-y-2 transition-all duration-300">
                <FaChartLine className="text-4xl text-cyan-500 mb-6" />
                <h3 className="text-xl font-bold mb-3">Data-Driven Insights</h3>
                <p className="text-slate-400 leading-relaxed">
                    Make informed decisions with our market trends, price history, and locality insights, powered by our advanced analytics engine.
                </p>
            </div>
        </div>
      </section>

      {/* --- LEADERSHIP TEAM (Rebranded from "Dev Squad") --- */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Leadership Team</h2>
            <p className="text-slate-400 text-lg">
                The visionaries driving innovation at <span className="text-blue-400 font-semibold">IshiSoft Pvt Ltd</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            
            {/* CHIRAG - Rebranded as CTO/Tech Lead */}
            <div className="group relative bg-slate-800 rounded-3xl p-8 md:p-10 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 shadow-2xl">
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-bold shadow-lg">
                        C
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Chirag </h3>
                        <p className="text-blue-400 font-medium tracking-wide">Chief Technology Officer (CTO)</p>
                        <p className="text-xs text-slate-500 uppercase mt-1">IshiSoft Pvt Ltd</p>
                    </div>
                </div>
                <p className="text-slate-300 leading-relaxed mb-6">
                    As the technical architect behind DealDirect, Chirag leads the engineering strategy. He focuses on building scalable, secure infrastructure that ensures millions of users can transact safely and seamlessly without downtime.
                </p>
                <div className="flex gap-4">
                    <button className="text-slate-400 hover:text-blue-400 transition"><AiFillLinkedin size={24} /></button>
                    <button className="text-slate-400 hover:text-white transition"><AiOutlineMail size={24} /></button>
                </div>
            </div>

            {/* ROSHNI - Rebranded as Product/Design Lead */}
            <div className="group relative bg-slate-800 rounded-3xl p-8 md:p-10 border border-slate-700 hover:border-pink-500/50 transition-all duration-300 shadow-2xl">
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 flex items-center justify-center text-3xl font-bold shadow-lg">
                        RB
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Roshni Bhoi</h3>
                        <p className="text-pink-400 font-medium tracking-wide">Head of Product & Design</p>
                        <p className="text-xs text-slate-500 uppercase mt-1">IshiSoft Pvt Ltd</p>
                    </div>
                </div>
                <p className="text-slate-300 leading-relaxed mb-6">
                    Roshni drives the user experience (UX) and visual identity of DealDirect. Her focus is on making complex real estate transactions simple, intuitive, and accessible for everyone through human-centric design.
                </p>
                <div className="flex gap-4">
                    <button className="text-slate-400 hover:text-pink-400 transition"><AiFillLinkedin size={24} /></button>
                    <button className="text-slate-400 hover:text-white transition"><AiOutlineMail size={24} /></button>
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold mb-6 text-white">Ready to find your dream home?</h2>
        <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate('/properties')}
              className="bg-white text-slate-900 px-8 py-3.5 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-white/10"
            >
                Browse Properties
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="border border-slate-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-slate-800 transition-colors"
            >
                Contact Support
            </button>
        </div>
      </section>

    </div>
  );
}