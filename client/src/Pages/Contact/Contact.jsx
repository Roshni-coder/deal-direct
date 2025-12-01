import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaClock, 
  FaPaperPlane, 
  FaBuilding,
  FaHeadset
} from "react-icons/fa";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      toast.success("Message sent! Our support team will contact you shortly.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 2000);
  };

  return (
    <div className="bg-slate-50 font-sans text-gray-800">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[60vh] flex flex-col items-center justify-center bg-slate-900 text-white overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/30 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

        <div className="relative z-10 text-center px-6 max-w-4xl mt-[-50px]">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 backdrop-blur-md text-blue-300 text-xs font-bold uppercase tracking-widest">
            <FaHeadset /> 24/7 Support
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Get in Touch with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              The Experts.
            </span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Whether you're a buyer, seller, or just have a question, our team at DealDirect is here to help you navigate your property journey.
          </p>
        </div>
      </section>

      {/* --- MAIN CONTENT (Overlapping Card) --- */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 pb-20 -mt-24">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
          
          {/* LEFT: Contact Info & Map */}
          <div className="lg:w-2/5 bg-slate-900 text-white p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative Overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>

            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                Contact Information
              </h3>
              <p className="text-slate-400 mb-10 text-sm leading-relaxed">
                Reach out to our corporate headquarters or customer support team. We generally respond within 2 hours during business days.
              </p>

              <div className="space-y-8">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-400">
                    <FaBuilding size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Corporate HQ</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      IshiSoftTech Pvt Ltd<br />
                      123 Innovation Park, Tech Hub,<br />
                      Mumbai, Maharashtra 400001
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-400">
                    <FaPhoneAlt size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Call Us</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      +91 98765 43210 (Support)<br />
                      +91 22 1234 5678 (Office)
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-400">
                    <FaEnvelope size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Email Us</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      support@dealdirect.in<br />
                      business@ishisofttech.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Map */}
            <div className="mt-12 rounded-2xl overflow-hidden border border-slate-700 h-48 shadow-lg relative group">
              <iframe
                title="Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.792556734796!2d72.87739281482195!3d19.07282778709007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1623918237920!5m2!1sen!2sin"
                className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
              <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur text-xs px-2 py-1 rounded text-white flex items-center gap-1">
                <FaMapMarkerAlt className="text-red-500" /> View on Map
              </div>
            </div>
          </div>

          {/* RIGHT: Contact Form */}
          <div className="lg:w-3/5 p-10 lg:p-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Send us a Message</h2>
            <p className="text-slate-500 mb-8">
              Got a question about a property, or want to partner with us? Fill out the form below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Regarding Property Listing / Partnership"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Message</label>
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you today?"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-slate-50 focus:bg-white resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <FaPaperPlane /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* --- EXTRA: Support Hours Strip --- */}
      <section className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              <FaClock />
            </div>
            <h4 className="font-bold text-slate-900">Operating Hours</h4>
            <p className="text-slate-500 text-sm mt-1">Mon - Sat: 9:00 AM - 8:00 PM</p>
          </div>
          <div className="p-4 border-l border-r border-slate-100">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              <FaHeadset />
            </div>
            <h4 className="font-bold text-slate-900">Direct Support</h4>
            <p className="text-slate-500 text-sm mt-1">Dedicated team for premium listings</p>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
              <FaBuilding />
            </div>
            <h4 className="font-bold text-slate-900">Office Visits</h4>
            <p className="text-slate-500 text-sm mt-1">By Appointment Only</p>
          </div>
        </div>
      </section>

    </div>
  );
}