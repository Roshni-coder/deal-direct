import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AiOutlineStar,
  AiOutlineDollarCircle,
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
  FaRegClock
} from "react-icons/fa";
import HeroSection from "../../Components/HeroSection/HeroSection";
import TopDevelopers from "../../Components/TopDevelopers/TopDevelopers";
import TopLocalities from "../../Components/TopLocalities/TopLocalities";
import AuthModal from "../../Components/AuthModal/AuthModal";

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

  if (normalizedUnit.includes("crore")) {
    return amount * 10000000;
  }

  if (normalizedUnit.includes("lac") || normalizedUnit.includes("lakh")) {
    return amount * 100000;
  }

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
      const scrollAmount = 320; // Card width + gap
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

  // Scroll to top on page load
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

    const matchSearch =
      !q || title.includes(q) || city.includes(q) || state.includes(q);
    const matchCategory =
      !filters.category || p.category?._id === filters.category;
    const matchSubcategory =
      !filters.subcategory || p.subcategory?._id === filters.subcategory;
    const matchCity =
      !filters.city || city.includes(filters.city.toLowerCase());
    const matchState =
      !filters.state || state.includes(filters.state.toLowerCase());
    const priceInRupees = normalizePrice(p.price, p.priceUnit);
    const matchBudget =
      (!minBudgetValue || priceInRupees >= minBudgetValue) &&
      (!maxBudgetValue || priceInRupees <= maxBudgetValue);
    const matchPropertyType =
      selectedPropertyTypes.length === 0 ||
      selectedPropertyTypes.some((type) =>
        propertyTypeName.includes(type.toLowerCase())
      );

    return (
      matchSearch &&
      matchCategory &&
      matchSubcategory &&
      matchCity &&
      matchState &&
      matchBudget &&
      matchPropertyType
    );
  });

  const handleViewDetails = (property) => {
    navigate(`/properties/${property._id}`, { state: { property } });
  };

  // --- DATA FOR NEW SECTIONS ---
  const workSteps = [
    {
      icon: <FaSearch className="text-3xl text-gray-700" />,
      title: "Search Properties",
      desc: "Browse thousands of listings directly from property owners. Filter by location, price, and property type.",
    },
    {
      icon: <FaRegCommentDots className="text-3xl text-gray-700" />,
      title: "Connect Directly",
      desc: "Message property owners instantly. No intermediaries, no waiting. Arrange viewings on your schedule.",
    },
    {
      icon: <FaKey className="text-3xl text-gray-700" />,
      title: "Close the Deal",
      desc: "Negotiate directly with the owner and save on commission fees. Complete the transaction with confidence.",
    },
  ];

  const benefits = [
    {
      icon: <AiOutlineDollarCircle className="text-2xl text-red-500" />,
      title: "Zero Commission",
      desc: "Save thousands by connecting directly with property owners. No agent fees.",
    },
    {
      icon: <FaRegClock className="text-2xl text-red-500" />,
      title: "Faster Deals",
      desc: "Skip the middleman and close deals faster with direct communication.",
    },
    {
      icon: <FaShieldAlt className="text-2xl text-red-500" />,
      title: "Secure Transactions",
      desc: "Our platform ensures safe and transparent property transactions.",
    },
    {
      icon: <FaUserFriends className="text-2xl text-red-500" />,
      title: "Direct Communication",
      desc: "Chat directly with property owners and get immediate responses.",
    },
  ];

  return (
    <div className="font-sans text-gray-800">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* 🏠 Hero Section Component */}
      <HeroSection
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        subcategories={subcategories}
        propertyTypes={propertyTypeOptions}
      />

      {/* 🏙 Featured Properties */}
      <section ref={propertiesSectionRef} className="relative py-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Popular  <span className="text-red-600">Properties</span>
              </h2>
              <p className="text-gray-500 mt-2">
                Handpicked premium homes and investments across India's top cities
              </p>
            </div>

            <button
              onClick={() => navigate('/properties')}
              className="text-red-600 font-semibold hover:text-red-700 transition flex items-center gap-2"
            >
              See all Properties →
            </button>
          </div>

          {/* Carousel Container */}
          {filteredProperties.length === 0 ? (
            <p className="text-gray-400 text-lg text-center py-12">No properties found.</p>
          ) : (
            <div className="relative group">
              {/* Left Navigation Button */}
              <button
                onClick={() => scroll('left')}
                className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 hover:text-red-600 hover:scale-110 transition-all border border-gray-100"
                aria-label="Scroll left"
              >
                <FaChevronLeft className="text-lg" />
              </button>

              {/* Right Navigation Button */}
              <button
                onClick={() => scroll('right')}
                className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 hover:text-red-600 hover:scale-110 transition-all border border-gray-100"
                aria-label="Scroll right"
              >
                <FaChevronRight className="text-lg" />
              </button>

              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {[...filteredProperties]
                  .sort((a, b) => {
                    const priceA = normalizePrice(a.price, a.priceUnit);
                    const priceB = normalizePrice(b.price, b.priceUnit);
                    return priceB - priceA;
                  })
                  .slice(0, 6)
                  .map((property) => (
                    <div
                      key={property._id}
                      onClick={() => handleViewDetails(property)}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden cursor-pointer min-w-[300px] w-[300px] flex-shrink-0 snap-start"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={resolveImageSrc(property.images?.[0])}
                          alt={property.title}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) =>
                          (e.target.src =
                            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800')
                          }
                        />
                        {/* Image Count Badge */}
                        {property.images?.length > 1 && (
                          <span className="absolute top-3 left-3 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                            📷 {property.images.length}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        {/* Property Type & Size */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {property.propertyType?.name || 'Property'}
                          </span>
                          {property.size && (
                            <>
                              <span className="text-gray-400">|</span>
                              <span className="text-sm text-gray-600">
                                {property.size} {property.sizeUnit}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Price */}
                        <p className="text-xl font-bold text-gray-900 mb-2">
                          ₹{property.price?.toLocaleString()}{' '}
                          <span className="text-sm font-medium text-gray-600">
                            {property.priceUnit}
                          </span>
                        </p>

                        {/* Location */}
                        <p className="text-sm text-gray-600 mb-3 flex items-center gap-1 line-clamp-1">
                          <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
                          {property.address?.city}, {property.address?.state}
                        </p>

                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                            {property.category?.name || 'Available'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {property.subcategory?.name || ''}
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

      {/* 🛠 How Deal Direct Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            How Deal Direct Works
          </h2>
          <p className="text-gray-500 mb-12 max-w-2xl mx-auto">
            Three simple steps to find your perfect property or sell directly to buyers
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {workSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 group-hover:shadow-md group-hover:scale-110 transition-all duration-300 border border-gray-100">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm px-4">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✨ Why Choose Deal Direct Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Why Choose Deal Direct?
            </h2>
            <p className="text-gray-500">
              Experience the benefits of direct property transactions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100 group"
              >
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TopLocalities />
      {/*<TopDevelopers />*/}

      {/* 🏙 Explore Popular Cities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Real Estate in Popular Indian Cities
          </h2>
          <p className="text-gray-500 mb-10 max-w-6xl text-base leading-relaxed">
            Thinking of investing in more than one city? Our platform showcases top properties in India's most active real estate markets. Discover city-wise insights, builder details, and pricing comparisons with a click. Whether you want growth, stability, or rental returns, find the right match across India's urban centres.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-red-200 transition-all cursor-pointer group bg-white"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-red-50 rounded-lg shrink-0 group-hover:bg-red-100 transition-colors p-2">
                  <img src={city.icon} alt={city.name} className="w-full h-full object-contain" />
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-red-600 transition-colors">{city.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;