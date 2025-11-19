import React from "react";
import MiddelSection from "../../Components/MiddelSection";

const Contact = () => {
  return (
    <div className="bg-white text-gray-800">
      <MiddelSection />

      {/* Contact Section */}
      <section className="py-16 px-6 md:px-12 lg:px-24 bg-gray-50">
        <div className="grid md:grid-cols-2 gap-14 items-start">

          {/* Contact Form */}
          <div className="bg-white p-12  rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition duration-300">
            <h2 className="text-3xl text-center font-bold text-red-600 mb-6">
              Send Us a Message
            </h2>

            <form className="space-y-5">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0056B8] outline-none"
                required
              />

              <input
                type="email"
                placeholder="Your Email"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0056B8] outline-none"
                required
              />

              <input
                type="text"
                placeholder="Subject"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0056B8] outline-none"
              />

              <textarea
                rows="5"
                placeholder="Your Message"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0056B8] outline-none"
                required
              ></textarea>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Details */}
          <div>
            <h2 className="text-3xl font-bold text-[#ED1C24] mb-6">
              Contact Information
            </h2>

            <ul className="space-y-4 text-gray-700">
              <li className="text-lg">📍 <strong>Office:</strong> 123 Real Estate Avenue, Mumbai</li>
              <li className="text-lg">📞 <strong>Phone:</strong> +91 98765 43210</li>
              <li className="text-lg">✉️ <strong>Email:</strong> support@dealdirect.in</li>
              <li className="text-lg">🕒 <strong>Working Hours:</strong> Mon–Sat, 9:00 AM – 7:00 PM</li>
            </ul>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-lg mt-8 border">
              <iframe
                title="Deal Direct Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.4363325116217!2d72.87765507504482!3d19.172347350047146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63a79b1e1a3%3A0x9d02e5d8907f03!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1692989478342!5m2!1sen!2sin"
                width="100%"
                height="260"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen=""
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
