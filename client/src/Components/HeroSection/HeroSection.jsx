// src/Components/HeroSection/HeroSection.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMapMarkerAlt, FaMicrophone } from "react-icons/fa";
import { tabConfig } from "./filterConfig";
import PropertyTypeFilter from "./PropertyTypeFilter";

const defaultTabs = [
  { label: "Buy", intent: "buy" },
  { label: "Rental", intent: "rent" },
  { label: "Projects", intent: "project" },
  { label: "PG / Hostels", intent: "pg" },
  { label: "Plot & Land", intent: "plot" },
  { label: "Commercial", intent: "commercial" },
  { label: "Agents", intent: "agent" },
];

const HeroSection = ({ filters, setFilters, propertyTypes = [] }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Buy");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const animatedWords = [
    "Site Visits",
    "Interiors",
    "Property Management",
    "Transactions",
    "Financing",
    "Documentation",
  ];

  const dropdownRefs = {
    budget: useRef(null),
    propertyType: useRef(null),
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % animatedWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openDropdown &&
        dropdownRefs[openDropdown]?.current &&
        !dropdownRefs[openDropdown].current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  const propertyTypeTabs = useMemo(() => {
    if (!Array.isArray(propertyTypes) || propertyTypes.length === 0) return [];
    return propertyTypes.slice(0, 7).map((type) => ({
      label: type.name,
      propertyTypeId: type._id,
    }));
  }, [propertyTypes]);

  const tabs = propertyTypeTabs.length ? propertyTypeTabs : defaultTabs;

  useEffect(() => {
    if (!tabs.length) return;
    if (!tabs.some((tab) => tab.label === activeTab)) {
      setActiveTab(tabs[0].label);
    }
  }, [tabs, activeTab]);

  const configKey = tabConfig[activeTab] ? activeTab : "Buy";
  const currentConfig = tabConfig[configKey];

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const updatePropertyTypes = (updater) => {
    setFilters((prev) => {
      const previous = prev.propertyTypes || [];
      const nextValue =
        typeof updater === "function" ? updater(previous) : updater;
      return { ...prev, propertyTypes: nextValue };
    });
  };

  const renderFilters = () =>
    currentConfig.filters.map((filterType) => {
      if (filterType === "propertyType") {
        return (
          <PropertyTypeFilter
            key="propertyType"
            selectedPropertyTypes={filters.propertyTypes || []}
            setSelectedPropertyTypes={updatePropertyTypes}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            dropdownRef={dropdownRefs.propertyType}
          />
        );
      }

      return null;
    });

  const handleTabSelect = (tab) => {
    setActiveTab(tab.label);
    const params = new URLSearchParams();

    if (tab.propertyTypeId) {
      params.set("propertyType", tab.propertyTypeId);
    } else if (tab.intent) {
      params.set("intent", tab.intent);
    }

    if (params.toString()) {
      navigate({ pathname: "/properties", search: params.toString() });
    }
  };

  return (
    <section className="relative  flex flex-col justify-center items-center px-4 sm:px-8 lg:px-16 text-center overflow-visible">
      {/* === Background Image === */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2000&auto=format&fit=crop')",
          filter: "brightness(0.7) contrast(1.1)",
        }}
      ></div>

      {/* === Overlay (Red + Dark Blue Gradient) === */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-[#0b1e3f]/95 via-[#0b1e3f]/80 to-[#b71c1c]/80"></div> */}

      {/* === Subtle Pattern Layer === */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23ffffff10%22/%3E%3C/svg%3E')",
        }}
      ></div>

      {/* === Foreground Content === */}
      <div className="relative pt-30 py-15 z-10 flex flex-col items-center max-w-7xl w-full space-y-2">
        {/* Location Tag */}
        <div className="flex items-center bg-white/90 px-5 py-2 rounded-full shadow-md border border-gray-100 gap-2">
          <FaMapMarkerAlt className="text-[#d32f2f]" />
          <span className="text-sm font-medium text-gray-800">Mumbai</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[700] text-white leading-tight drop-shadow-lg max-w-4xl">
          Find Your <span className="text-white">Dream Property</span> in{" "}
          <span className="text-red-500">Mumbai</span>
        </h1>

        {/* Subtext (No Animation) */}
        <p className="text-base sm:text-lg text-gray-100 max-w-3xl">
          From finding the right home to{" "}
          <span className="font-semibold text-white">
            Property Management, Interiors & More
          </span>
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mt-5">
          {tabs.map((tab, i) => (
            <button
              key={`${tab.label}-${i}`}
              onClick={() => handleTabSelect(tab)}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm border-2 transition-all duration-300 ${
                activeTab === tab.label
                  ? "bg-red-600  text-white border-transparent shadow-lg scale-105"
                  : "bg-white text-gray-800 border-gray-300 "
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl p-6 sm:p-8 mt-6 w-full max-w-5xl border border-gray-100">
          <div className="flex pb-3 flex-col sm:flex-row gap-3 ">

            <div className="relative flex-1 flex items-center">
              <AiOutlineSearch className="absolute left-3 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder={currentConfig.searchPlaceholder}
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full border border-gray-300 rounded-xl pl-10 pr-16 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-[#0b1e3f] outline-none"
              />
              <div className="absolute right-3 flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#0b1e3f] cursor-pointer" />
                <FaMicrophone className="text-[#d32f2f] cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filters.city}
              onChange={(e) => updateFilter("city", e.target.value)}
              className="w-full sm:w-48 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-[#0b1e3f] outline-none"
            >
              <option value="">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
            {/* {renderFilters()} */}
            <button className="ml-auto border-red-600 border-1 bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-lg">
              <AiOutlineSearch /> Search
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {/* <div className="flex flex-wrap justify-center gap-10 mt-10 text-gray-100">
          <div className="text-center">
            <span className="text-white font-bold text-xl">25K+</span>
            <p className="text-sm text-gray-200">Properties Listed</p>
          </div>
          <div className="text-center">
            <span className="text-[#d32f2f] font-bold text-xl">0%</span>
            <p className="text-sm text-gray-200">Brokerage Fee</p>
          </div>
          <div className="text-center">
            <span className="text-white font-bold text-xl">5000+</span>
            <p className="text-sm text-gray-200">Verified Owners</p>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default HeroSection;
