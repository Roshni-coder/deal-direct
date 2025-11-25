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
        const res = await axios.get(`${API_BASE}/api/categories/list-category`);
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
      <section ref={propertiesSectionRef} className="relative py-4 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-4">
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

      {/* 🛠 PREMIUM: How Deal Direct Works Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
          <h2 className="text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            How Deal Direct Works
          </h2>
          <p className="text-slate-600 text-lg mb-16 max-w-2xl mx-auto leading-relaxed">
            Three simple steps to find your perfect property or sell directly to buyers
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6 relative z-10">
          {/* Step 1: Search Properties */}
          <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-blue-200 hover:-translate-y-2">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl text-4xl text-white group-hover:scale-110 transition-transform duration-300">
              <FaSearch />
            </div>
            <div className="mt-10 text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Search Properties</h3>
              <p className="text-slate-600 text-base leading-relaxed">
                Browse thousands of listings directly from property owners.
              </p>
            </div>
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-blue-50 to-transparent rounded-tl-full opacity-50"></div>
          </div>

          {/* Step 2: Connect Directly */}
          <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-purple-200 hover:-translate-y-2">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-20 flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl text-4xl text-white group-hover:scale-110 transition-transform duration-300">
              <FaRegCommentDots />
            </div>
            <div className="mt-10 text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Connect Directly</h3>
              <p className="text-slate-600 text-base leading-relaxed">
                Message property owners instantly. No intermediaries.
              </p>
            </div>
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-purple-50 to-transparent rounded-tl-full opacity-50"></div>
          </div>

          {/* Step 3: Close the Deal */}
          <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-green-200 hover:-translate-y-2">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-20 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl text-4xl text-white group-hover:scale-110 transition-transform duration-300">
              <FaKey />
            </div>
            <div className="mt-10 text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Close the Deal</h3>
              <p className="text-slate-600 text-base leading-relaxed">
                Negotiate directly and complete your deal confidently.
              </p>
            </div>
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-green-50 to-transparent rounded-tl-full opacity-50"></div>
          </div>
        </div>
      </section>

      {/* ✨ PREMIUM: Why Choose Deal Direct Section */}
      <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <div className="max-w-6xl mx-auto text-center px-6 relative z-10">
          <h2 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Why Choose Deal Direct?
          </h2>
          <p className="text-slate-600 text-lg mb-20 max-w-2xl mx-auto leading-relaxed">
            Experience the benefits of direct property transactions
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 px-8 relative z-10">
          {/* Benefit 1: Zero Commission */}
          <div className="group text-center flex flex-col items-center transition-all duration-300 hover:-translate-y-2">
            <div className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mb-6 text-4xl text-white shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
              <AiOutlineDollarCircle className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Zero Commission</h3>
            <p className="text-slate-600 text-[15px] leading-relaxed max-w-[220px]">
              Save thousands by connecting directly with owners.
            </p>
          </div>

          {/* Benefit 2: Faster Deals */}
          <div className="group text-center flex flex-col items-center transition-all duration-300 hover:-translate-y-2">
            <div className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mb-6 text-4xl text-white shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
              <FaRegClock className="w-11 h-11" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Faster Deals</h3>
            <p className="text-slate-600 text-[15px] leading-relaxed max-w-[220px]">
              Close deals quicker with direct communication.
            </p>
          </div>

          {/* Benefit 3: Secure Transactions */}
          <div className="group text-center flex flex-col items-center transition-all duration-300 hover:-translate-y-2">
            <div className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mb-6 text-4xl text-white shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
              <FaShieldAlt className="w-11 h-11" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Secure Transactions</h3>
            <p className="text-slate-600 text-[15px] leading-relaxed max-w-[220px]">
              Safe and transparent property transactions.
            </p>
          </div>

          {/* Benefit 4: Direct Communication */}
          <div className="group text-center flex flex-col items-center transition-all duration-300 hover:-translate-y-2">
            <div className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mb-6 text-4xl text-white shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
              <FaUserFriends className="w-11 h-11" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Direct Communication</h3>
            <p className="text-slate-600 text-[15px] leading-relaxed max-w-[220px]">
              Chat directly with owners and get instant replies.
            </p>
          </div>
        </div>
      </section>

      <TopLocalities />

      {/* 🏙 Explore Popular Cities */}
      <section className="py-8 bg-white">
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