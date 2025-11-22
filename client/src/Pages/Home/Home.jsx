import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AiOutlineDollarCircle,
  AiOutlineHeart
} from "react-icons/ai";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaRegCommentDots,
  FaKey,
  FaShieldAlt,
  FaUserFriends,
  FaRegClock,
  FaArrowRight,
  FaCheckCircle
} from "react-icons/fa";
import HeroSection from "../../Components/HeroSection/HeroSection";
import TopLocalities from "../../Components/TopLocalities/TopLocalities";
import AuthModal from "../../Components/AuthModal/AuthModal";

// Asset Imports
import MumbaiIcon from "../../assets/Mumbai.png";
import DelhiIcon from "../../assets/Delhi.png";
import BangaloreIcon from "../../assets/Bangalore.png";
import HyderabadIcon from "../../assets/Hyderabad.png";
import PuneIcon from "../../assets/Pune.png";
import ChennaiIcon from "../../assets/chennai.png";
import KolkataIcon from "../../assets/kolkata.png";
import AhmedabadIcon from "../../assets/ahmedabad.png";
import GurgaonIcon from "../../assets/Gurgaon.png";
import NoidaIcon from "../../assets/noida.png";
import ChandigarhIcon from "../../assets/chandigarh.png";
import JaipurIcon from "../../assets/jaipur.png";

const API_BASE = import.meta.env.VITE_API_BASE;

const parseBudgetValue = (label) => {
  if (!label) return null;
  const cleaned = label.replace(/₹|,/g, "").trim().toLowerCase();
  if (!cleaned) return null;

  if (cleaned.includes("crore")) {
    const amount = parseFloat(cleaned.replace("crore", "")) || 0;
    return amount * 10000000;
  }

  if (cleaned.includes("lakh")) {
    const amount = parseFloat(
      cleaned.replace("lakhs", "").replace("lakh", "")
    ) || 0;
    return amount * 100000;
  }

  const numeric = parseFloat(cleaned.replace(/[^0-9.]/g, ""));
  return Number.isNaN(numeric) ? null : Math.round(numeric);
};

const normalizePrice = (price, unit) => {
  const amount = Number(price) || 0;
  const normalizedUnit = (unit || "").toLowerCase();

  if (normalizedUnit.includes("crore")) return amount * 10000000;
  if (normalizedUnit.includes("lac") || normalizedUnit.includes("lakh")) return amount * 100000;
  return amount;
};

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    subcategory: "",
    city: "",
    state: "",
    minBudget: "",
    maxBudget: "",
    propertyTypes: [],
  });
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const propertiesSectionRef = useRef(null);

  const handleCityClick = (cityName) => {
    setFilters((prev) => ({ ...prev, city: cityName }));
    propertiesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 320;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const resolveImageSrc = (img) => {
    if (!img) return "";
    const lower = img.toLowerCase();
    if (lower.startsWith("data:")) return img;
    if (lower.startsWith("http://") || lower.startsWith("https://")) return img;
    if (img.startsWith("/uploads")) return `${API_BASE}${img}`;
    return `${API_BASE}/uploads/${img}`;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/properties/property-list`);
        setProperties(response.data.data || []);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/categories/list`);
        setCategories(res.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/propertyTypes/list-propertytype`);
        setPropertyTypeOptions(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching property types:", error);
      }
    };
    fetchPropertyTypes();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!filters.category) {
        setSubcategories([]);
        return;
      }
      try {
        const res = await axios.get(
          `${API_BASE}/api/subcategories/byCategory/${filters.category}`
        );
        setSubcategories(res.data || []);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    fetchSubcategories();
  }, [filters.category]);

  const minBudgetValue = parseBudgetValue(filters.minBudget);
  const maxBudgetValue = parseBudgetValue(filters.maxBudget);
  const selectedPropertyTypes = filters.propertyTypes || [];

  const filteredProperties = properties.filter((p) => {
    const title = (p.title || "").toLowerCase();
    const city = (p.address?.city || "").toLowerCase();
    const state = (p.address?.state || "").toLowerCase();
    const propertyTypeName = (p.propertyType?.name || "").toLowerCase();
    const q = filters.search.toLowerCase();
    const priceInRupees = normalizePrice(p.price, p.priceUnit);

    return (
      (!q || title.includes(q) || city.includes(q) || state.includes(q)) &&
      (!filters.category || p.category?._id === filters.category) &&
      (!filters.subcategory || p.subcategory?._id === filters.subcategory) &&
      (!filters.city || city.includes(filters.city.toLowerCase())) &&
      (!filters.state || state.includes(filters.state.toLowerCase())) &&
      (!minBudgetValue || priceInRupees >= minBudgetValue) &&
      (!maxBudgetValue || priceInRupees <= maxBudgetValue) &&
      (selectedPropertyTypes.length === 0 || selectedPropertyTypes.some((type) => propertyTypeName.includes(type.toLowerCase())))
    );
  });

  const handleViewDetails = (property) => {
    navigate(`/properties/${property._id}`, { state: { property } });
  };

  // --- Updated Data with visual improvements ---
  const workSteps = [
    {
      icon: <FaSearch />,
      step: "01",
      title: "Search Properties",
      desc: "Browse thousands of verified listings directly from owners. Filter by location & budget.",
    },
    {
      icon: <FaRegCommentDots />,
      step: "02",
      title: "Connect Directly",
      desc: "Message owners instantly. No intermediaries, no waiting. Arrange viewings on your terms.",
    },
    {
      icon: <FaKey />,
      step: "03",
      title: "Close the Deal",
      desc: "Negotiate directly and save on commission fees. Complete the transaction with confidence.",
    },
  ];

  const benefits = [
    {
      icon: <AiOutlineDollarCircle />,
      title: "Zero Commission",
      desc: "Save lakhs by connecting directly with property owners.",
    },
    {
      icon: <FaRegClock />,
      title: "Faster Deals",
      desc: "Skip the middleman and close deals 2x faster.",
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure Data",
      desc: "We ensure your contact details remain private and safe.",
    },
    {
      icon: <FaUserFriends />,
      title: "Direct Chat",
      desc: "Instant communication with the decision makers.",
    },
  ];

  return (
    <div className="font-sans text-gray-800">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <HeroSection
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        subcategories={subcategories}
        propertyTypes={propertyTypeOptions}
      />

      {/* 🏙 Featured Properties */}
      <section ref={propertiesSectionRef} className="relative py-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Popular <span className="text-red-600">Properties</span>
              </h2>
              <p className="text-slate-500 mt-2 max-w-lg">
                Handpicked premium homes and investments across India's top cities.
              </p>
            </div>

            <button
              onClick={() => navigate('/properties')}
              className="text-red-600 font-semibold hover:text-red-700 transition flex items-center gap-2 pb-1 border-b-2 border-transparent hover:border-red-600"
            >
              View All <FaArrowRight className="text-sm" />
            </button>
          </div>

          {/* Carousel Container */}
          {filteredProperties.length === 0 ? (
            <p className="text-gray-400 text-lg text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">No properties found matching your search.</p>
          ) : (
            <div className="relative group">
              <button onClick={() => scroll('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center text-gray-800 hover:text-red-600 transition-all border border-gray-100 opacity-0 group-hover:opacity-100">
                <FaChevronLeft className="text-lg" />
              </button>

              <button onClick={() => scroll('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center text-gray-800 hover:text-red-600 transition-all border border-gray-100 opacity-0 group-hover:opacity-100">
                <FaChevronRight className="text-lg" />
              </button>

              <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-8 pt-2 snap-x snap-mandatory scrollbar-hide px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {[...filteredProperties]
                  .sort((a, b) => normalizePrice(b.price, b.priceUnit) - normalizePrice(a.price, a.priceUnit))
                  .slice(0, 8)
                  .map((property) => (
                    <div
                      key={property._id}
                      onClick={() => handleViewDetails(property)}
                      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden cursor-pointer min-w-[300px] w-[300px] flex-shrink-0 snap-start"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-2 py-1 rounded">
                          {property.category?.name}
                        </div>
                        <img
                          src={resolveImageSrc(property.images?.[0])}
                          alt={property.title}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => (e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800')}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-1 truncate">{property.title}</h3>
                        <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                          <FaMapMarkerAlt className="text-red-500" /> {property.address?.city}, {property.address?.state}
                        </p>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                          <p className="text-xl font-bold text-red-600">
                            ₹{property.price?.toLocaleString()} <span className="text-xs font-medium text-gray-500">{property.priceUnit}</span>
                          </p>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                            {property.propertyType?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 🛠 IMPROVED: How Deal Direct Works (Process Steps UI) */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              It's Simple. It's Direct.
            </h2>
            <p className="text-slate-500 text-lg">
              We've stripped away the complexities of real estate. Here is your path to a better deal in three steps.
            </p>
          </div>

          {/* Connection Line (Desktop) */}
          <div className="hidden md:block absolute top-[55%] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-red-200 to-transparent border-t-2 border-dashed border-red-200 -z-10"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {workSteps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center group">
                {/* Step Number Bubble */}
                <div className="w-16 h-16 rounded-full bg-white border-4 border-red-50 text-red-600 font-bold text-xl flex items-center justify-center shadow-lg z-10 group-hover:scale-110 group-hover:border-red-100 transition-all duration-300 mb-6">
                  {step.step}
                </div>

                {/* Card Content */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 w-full h-full flex flex-col items-center relative overflow-hidden">
                  {/* Subtle Icon Watermark */}
                  <div className="absolute -right-4 -bottom-4 text-8xl text-slate-50 opacity-50 pointer-events-none group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                    {step.icon}
                  </div>

                  <div className="text-4xl text-slate-700 mb-4 group-hover:text-red-600 transition-colors">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✨ IMPROVED: Why Choose Deal Direct (High Contrast Dark Mode) */}
      <section className="py-20 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">

            {/* Left Side: Text & CTA */}
            <div className="w-full md:w-1/3">
              <div className="inline-block px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm font-semibold mb-4 border border-red-600/30">
                Why Us?
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                The Smartest Way to Buy & Sell Property
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Experience the freedom of direct property transactions. We eliminate the noise, the fees, and the middlemen, giving you total control.
              </p>
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-lg font-semibold shadow-lg hover:shadow-red-600/30 transition-all transform hover:-translate-y-0.5">
                Get Started Now
              </button>
            </div>

            {/* Right Side: Grid of Cards */}
            <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((item, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-red-500/30 transition-all duration-300 group hover:shadow-2xl hover:shadow-black/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-red-500 text-2xl group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                      {item.icon}
                    </div>
                    <FaCheckCircle className="text-slate-700 group-hover:text-green-500 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      <TopLocalities />

      {/* 🏙 Explore Popular Cities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore by City
          </h2>
          <p className="text-gray-500 mb-10 max-w-3xl text-base leading-relaxed">
            Discover city-wise insights and properties in India's most active real estate markets.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Mumbai", icon: MumbaiIcon },
              { name: "Delhi", icon: DelhiIcon },
              { name: "Bangalore", icon: BangaloreIcon },
              { name: "Hyderabad", icon: HyderabadIcon },
              { name: "Pune", icon: PuneIcon },
              { name: "Chennai", icon: ChennaiIcon },
              { name: "Kolkata", icon: KolkataIcon },
              { name: "Ahmedabad", icon: AhmedabadIcon },
              { name: "Gurgaon", icon: GurgaonIcon },
              { name: "Noida", icon: NoidaIcon },
              { name: "Chandigarh", icon: ChandigarhIcon },
              { name: "Jaipur", icon: JaipurIcon },
            ].map((city, index) => (
              <div
                key={index}
                onClick={() => handleCityClick(city.name)}
                className="flex flex-col items-center justify-center p-6 border border-gray-100 rounded-2xl bg-white hover:shadow-xl hover:border-red-100 transition-all cursor-pointer group hover:-translate-y-1"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded-full mb-3 group-hover:bg-red-50 transition-colors">
                  <img src={city.icon} alt={city.name} className="w-8 h-8 object-contain opacity-70 group-hover:opacity-100 transition-all" />
                </div>
                <span className="font-semibold text-gray-700 text-sm group-hover:text-red-600 transition-colors">{city.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;