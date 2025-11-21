import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AiOutlineStar,
  AiOutlineDollarCircle,
} from "react-icons/ai";
import { FaBuilding, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import HeroSection from "../../Components/HeroSection/HeroSection";
import DiscoverSection from "../../Components/DiscoverSection/DiscoverSection";
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

  // Major Indian Cities Data
  const majorCities = [
    { name: "Mumbai", properties: "25K+", image: "https://images.unsplash.com/photo-1560215986-02b1c78af74a?auto=format&fit=crop&w=400&q=80" },
    { name: "Delhi", properties: "22K+", image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=400&q=80" },
    { name: "Bengaluru", properties: "18K+", image: "https://images.unsplash.com/photo-1529209065735-c1a5e2cbea1f?auto=format&fit=crop&w=400&q=80" },
    { name: "Hyderabad", properties: "15K+", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80" },
    { name: "Chennai", properties: "12K+", image: "https://images.unsplash.com/photo-1595079676339-153e7ea56a93?auto=format&fit=crop&w=400&q=80" },
    { name: "Kolkata", properties: "10K+", image: "https://images.unsplash.com/photo-1582573613351-495bdfa3d96e?auto=format&fit=crop&w=400&q=80" },
    { name: "Pune", properties: "14K+", image: "https://images.unsplash.com/photo-1597040663342-45b6af3e0917?auto=format&fit=crop&w=400&q=80" },
    { name: "Ahmedabad", properties: "8K+", image: "https://images.unsplash.com/photo-1633152617887-e10dbd5027d3?auto=format&fit=crop&w=400&q=80" },
  ];

  const allCities = [
    "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
    "Surat", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Patna", "Indore", "Thane",
    "Bhopal", "Visakhapatnam", "Vadodara", "Firozabad", "Ludhiana", "Rajkot", "Agra",
    "Siliguri", "Nashik", "Faridabad", "Patiala", "Meerut", "Kalyan", "Vasai", "Varanasi",
    "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi",
    "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai",
    "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli", "Dharwad"
  ];

  const featuredDevelopers = [
    { name: "DLF", projects: "150+", logo: "🏢" },
    { name: "Sobha", projects: "120+", logo: "🏛" },
    { name: "Prestige", projects: "180+", logo: "🏬" },
    { name: "Godrej", projects: "90+", logo: "🏣" },
    { name: "Brigade", projects: "110+", logo: "🏤" },
    { name: "Lodha", projects: "130+", logo: "🏨" },
  ];

  const propertyShowcaseTypes = [
    { type: "Apartments", count: "45K+", icon: "🏢" },
    { type: "Villas", count: "12K+", icon: "🏡" },
    { type: "Plots", count: "8K+", icon: "📐" },
    { type: "Commercial", count: "15K+", icon: "🏬" },
    { type: "Farm Houses", count: "3K+", icon: "🌾" },
    { type: "PG/Hostels", count: "5K+", icon: "🏘" },
  ];

  const stats = [
    { number: "10,000+", label: "Properties Listed" },
    { number: "₹2,500Cr+", label: "Property Value" },
    { number: "98%", label: "Customer Satisfaction" },
    { number: "0%", label: "Brokerage Fee" },
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
                Popular Owner <span className="text-red-600">Properties</span>
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

      {/* 📢 Post Property CTA */}
      <section className="py-10 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px bg-gray-300 flex-1 max-w-[150px] sm:max-w-[200px]"></div>
            <h3 className="text-xl sm:text-2xl text-gray-600 font-normal">
              Are you a Property Owner?
            </h3>
            <div className="h-px bg-gray-300 flex-1 max-w-[150px] sm:max-w-[200px]"></div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-red-600 text-white px-8 py-3 rounded-md font-semibold text-lg hover:bg-blue-600 transition-all duration-500 ease-in-out shadow-sm"
          >
            Post Free Property Ad
          </button>
        </div>
      </section>

      {/* 🏘 Discover Section Component */}
      <DiscoverSection />
      <TopLocalities />
      <TopDevelopers />



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



      {/* 📈 Investment Banner */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">

          <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-3xl p-10 text-center shadow-xl relative overflow-hidden">

            {/* Soft Glow Effect */}
            <div className="absolute inset-0 bg-white/10 blur-2xl"></div>

            {/* Icon */}
            <AiOutlineStar className="text-5xl mx-auto mb-4 text-white drop-shadow-lg relative" />

            {/* Title */}
            <h3 className="text-3xl font-extrabold mb-3 text-white tracking-wide relative">
              Smart Investment Opportunity
            </h3>

            {/* Subtitle */}
            <p className="text-lg text-white/90 mb-8 relative">
              Properties in top cities appreciating <span className="font-semibold">15–20% annually</span>
            </p>

            {/* Button */}
            <button className="px-8 py-3 bg-white text-red-600 font-semibold rounded-lg 
                         shadow-md hover:bg-red-50 hover:shadow-lg transition-all duration-200 relative">
              View High ROI Properties →
            </button>

          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
