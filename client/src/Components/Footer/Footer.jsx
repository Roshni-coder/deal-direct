import React from "react";
import { Link } from "react-router-dom";
import {
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineFacebook,
  AiOutlineTwitter,
  AiOutlineInstagram,
  AiOutlineLinkedin,
  AiOutlineEnvironment
} from "react-icons/ai";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = {
    "Buy": [
      { name: "Apartments", path: "/properties?type=flat&intent=apartment" },
      { name: "Villas", path: "/properties?type=villa&intent=villa" },
      { name: "Plots", path: "/properties?type=plot&intent=plot" },
      { name: "Commercial", path: "/properties?type=office&intent=commercial" }
    ],
    "Rent": [
      { name: "Studio", path: "/properties?bhk=1rk&intent=rent" },
      { name: "Family Homes", path: "/properties?intent=rent" },
      { name: "Short Term", path: "/properties?intent=rent" },
      { name: "Commercial", path: "/properties?type=office&intent=rent" }
    ],
    "Company": [
      { name: "About Us", path: "/about" },
      { name: "Careers", path: "/about" },
      { name: "Blog", path: "/about" },
      { name: "Press", path: "/about" }
    ],
    "Support": [
      { name: "Help Center", path: "/contact" },
      { name: "Contact", path: "/contact" },
      { name: "Privacy", path: "/privacy" },
      { name: "Terms", path: "/terms" }
    ]
  };

  const cities = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai"];

  const socialLinks = [
    { icon: <AiOutlineFacebook />, name: "Facebook", url: "#" },
    { icon: <AiOutlineTwitter />, name: "Twitter", url: "#" },
    { icon: <AiOutlineInstagram />, name: "Instagram", url: "#" },
    { icon: <AiOutlineLinkedin />, name: "LinkedIn", url: "#" }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-8 border-b border-gray-800">

          {/* Brand & Contact - ORIGINAL LOGO KEPT */}
          <div className="space-y-5">
            <div className="text-2xl font-bold">
              <span className="text-red-600">deal</span>
              <span className="text-blue-800">direct</span>
              <sup className="text-red-600 text-sm ml-1">™</sup>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted partner for direct property deals without brokerage fees.
            </p>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex items-center gap-2">
                <AiOutlineMail className="text-blue-600 text-base flex-shrink-0" />
                <span>hello@dealdirect.com</span>
              </div>
              <div className="flex items-center gap-2">
                <AiOutlinePhone className="text-blue-600 text-base flex-shrink-0" />
                <span>+91 1800-123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <AiOutlineEnvironment className="text-blue-600 text-base flex-shrink-0" />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links - 2 Column Grid */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8">
            {Object.entries(quickLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-semibold text-white text-sm mb-4">{category}</h4>
                <div className="flex flex-col gap-2.5">
                  {links.map((link, idx) => (
                    <Link
                      key={idx}
                      to={link.path}
                      className="text-gray-400 text-sm hover:text-blue-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cities & Newsletter */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Popular Cities</h4>
              <div className="flex flex-wrap gap-2">
                {cities.map((city, idx) => (
                  <Link
                    key={idx}
                    to={`/properties?city=${city}`}
                    className="text-gray-300 text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Stay Updated</h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 border border-gray-700"
                />
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
          <p>&copy; {currentYear} DealDirect. All rights reserved.</p>

          <div className="flex gap-3">
            {socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.url}
                aria-label={social.name}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 border border-gray-700 hover:bg-blue-600 hover:border-blue-600 transition-all text-lg"
              >
                {social.icon}
              </a>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-blue-600 transition-colors">Cookie Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
