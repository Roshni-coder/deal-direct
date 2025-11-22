import React, { useEffect } from "react";
import heroImg from "../../assets/Villa.jpg";
import { AiOutlineCheckCircle } from "react-icons/ai";
import Middel from "../About/Middel.jsx";

export default function About() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div className="bg-white text-gray-800">

      {/* HERO SECTION */}
      <Middel
        title="About DealDirect"
        subtitle="Connecting Buyers, Sellers & Renters — Directly and Transparently"
      />

      {/* ABOUT MAIN */}
      <section className="flex flex-col-reverse md:flex-row  justify-between gap-12 px-6 md:px-40 py-20">

        {/* LEFT CONTENT */}
        <div className="w-full md:w-1/2 space-y-6">

          <div className="flex items-center text-red-600 font-medium">
            <AiOutlineCheckCircle className="mr-2 text-lg" />
            No Brokerage • Verified Listings • Direct Deals
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Why Choose{" "}
            <span className="text-red-600">Deal</span>
            <span className="text-blue-800">Direct?</span>
          </h2>

          <p className="text-gray-600 text-lg leading-relaxed">
            DealDirect transforms the real estate experience by eliminating
            middlemen, providing verified listings, and ensuring transparent
            transactions between buyers, sellers, and renters.
          </p>

          {/* Buttons */}
          <div className="flex gap-4 pt-3">
            <button className="bg-blue-800 text-white px-7 py-3.5 rounded-xl shadow-md font-semibold hover:opacity-90 transition">
              Explore Properties
            </button>

            <button className="border-2 border-blue-800 text-blue-900 px-7 py-3.5 rounded-xl font-semibold hover:bg-blue-800 hover:text-white transition">
              List Your Property
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={heroImg}
            alt="DealDirect"
            className="rounded-3xl shadow-xl w-full h-[320px] md:h-[450px] object-cover"
          />
        </div>
      </section>

      {/* MISSION & VISION SECTION (Two Boxes) */}
      <section className="py-20 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

          {/* MISSION BOX */}
          <div className="bg-white shadow-xl rounded-2xl border border-gray-200 p-10 hover:shadow-2xl transition">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              To simplify real estate by empowering individuals to take control
              of their property journey without intermediaries. Our goal is to
              make every transaction transparent, affordable, and completely
              hassle-free for every Indian.
            </p>
          </div>

          {/* VISION BOX */}
          <div className="bg-white shadow-xl rounded-2xl border border-gray-200 p-10 hover:shadow-2xl transition">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Our Vision
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              To become India’s most trusted property platform — where
              transparency, trust, and technology work together to enable
              seamless and direct property transactions for buyers, sellers,
              renters, and builders.
            </p>
          </div>

        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
          Meet the Team
        </h2>
        <p className="text-gray-600 mb-10">
          The Leaders Behind DealDirect
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
          {[
            { name: "Roshni Bhoi", role: "Founder & CEO", emoji: "👩‍💼" },
            { name: "Rahul Sharma", role: "CTO", emoji: "💻" },
            { name: "Priya Patel", role: "Marketing Head", emoji: "📣" },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition"
            >
              <div className="text-5xl mb-4">{t.emoji}</div>
              <h3 className="text-xl font-semibold">{t.name}</h3>
              <p className="text-blue-700 font-medium">{t.role}</p>
            </div>
          ))}
        </div>

      </section>

    </div>
  );
}
