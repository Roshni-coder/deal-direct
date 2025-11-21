// src/Components/HeroSection/HeroSection.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMapMarkerAlt, FaMicrophone, FaHome, FaKey, FaBuilding, FaBed, FaTree, FaStore, FaUserTie } from "react-icons/fa";
import { tabConfig } from "./filterConfig";
import PropertyTypeFilter from "./PropertyTypeFilter";
import SKYBACKGROUND from "../../assets/SKYBACKGROUND.png";

const defaultTabs = [
  { label: "Buy", intent: "buy", icon: FaHome },
  { label: "Rental", intent: "rent", icon: FaKey },
  { label: "Projects", intent: "project", icon: FaBuilding },
  { label: "PG / Hostels", intent: "pg", icon: FaBed },
  { label: "Plot & Land", intent: "plot", icon: FaTree },
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

  const tabs = defaultTabs;

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
    // Just set the tab as a filter, don't navigate
  };

  return (
    <section className="relative  flex flex-col justify-center items-center px-4 sm:px-8 lg:px-16 text-center overflow-visible">
      {/* === Background - Sky Image === */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${SKYBACKGROUND})`,
        }}
      ></div>

      {/* === Subtle Pattern Layer === */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23ffffff10%22/%3E%3C/svg%3E')",
        }}
      ></div>

      {/* === Foreground Content === */}
      <div className="relative pt-20 py-15 z-10 flex flex-col items-center max-w-7xl w-full space-y-2">


        {/* Hero Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[700] text-white leading-tight max-w-4xl">
          Buy, Sell & Rent Properties
          <br />
          <span className="text-red-500">Directly from Owners</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-3xl">
          No middleman. No commission fees.
          <br />
          <span className="font-semibold text-white">
            Connect directly with property owners
          </span>
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mt-5">
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            return (
              <button
                key={`${tab.label}-${i}`}
                onClick={() => handleTabSelect(tab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm border-2 transition-all duration-300 ${activeTab === tab.label
                  ? "bg-red-600 text-white border-transparent shadow-lg shadow-red-500/50 scale-105"
                  : "bg-white/10 backdrop-blur-sm text-white border-white/30 hover:border-white/50 hover:bg-white/20"
                  }`}
              >
                {Icon && <Icon className="text-base" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Filters */}
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl p-6 sm:p-8 mt-6 w-full max-w-5xl border border-gray-100">
          {/* Search Row with City Dropdown */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4">
            {/* City Dropdown */}
            <select
              value={filters.city || "Bangalore"}
              onChange={(e) => updateFilter("city", e.target.value)}
              className="w-full sm:w-48 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Delhi">Delhi</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 flex items-center">
              <AiOutlineSearch className="absolute left-4 text-gray-500 text-lg" />
              <input
                type="text"
                placeholder="Search by Project, Locality, or Builder"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full border border-gray-300 rounded-xl pl-11 pr-20 py-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 outline-none"
              />
              <div className="absolute right-4 flex items-center gap-3">
                <FaMapMarkerAlt className="text-gray-600 cursor-pointer hover:text-gray-800" />
                <FaMicrophone className="text-red-600 cursor-pointer hover:text-red-700" />
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Budget Filter - Always shown */}
            <select
              value={filters.budget || ""}
              onChange={(e) => updateFilter("budget", e.target.value)}
              className="flex-1 min-w-[140px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="">Budget</option>
              <option value="0-25">Under 25 Lakhs</option>
              <option value="25-50">25-50 Lakhs</option>
              <option value="50-75">50-75 Lakhs</option>
              <option value="75-100">75 Lakhs - 1 Cr</option>
              <option value="100+">Above 1 Cr</option>
            </select>

            {/* Dynamic Filters based on activeTab */}
            {activeTab === "Buy" && (
              <>
                {/* Property Type Filter */}
                <select
                  value={filters.propertyType || ""}
                  onChange={(e) => updateFilter("propertyType", e.target.value)}
                  className="flex-1 min-w-[140px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Property Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                  <option value="house">Independent House</option>
                </select>

                {/* Possession Status Filter */}
                <select
                  value={filters.possession || ""}
                  onChange={(e) => updateFilter("possession", e.target.value)}
                  className="flex-1 min-w-[140px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Possession Status</option>
                  <option value="ready">Ready to Move</option>
                  <option value="under-construction">Under Construction</option>
                  <option value="new-launch">New Launch</option>
                </select>
              </>
            )}

            {activeTab === "Rental" && (
              <>
                {/* Property Type Filter */}
                <select
                  value={filters.propertyType || ""}
                  onChange={(e) => updateFilter("propertyType", e.target.value)}
                  className="flex-1 min-w-[140px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Property Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="house">Independent House</option>
                </select>

                {/* Furnishing Status Filter */}
                <select
                  value={filters.furnishing || ""}
                  onChange={(e) => updateFilter("furnishing", e.target.value)}
                  className="flex-1 min-w-[140px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Furnishing Status</option>
                  <option value="fully-furnished">Fully Furnished</option>
                  <option value="semi-furnished">Semi Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </>
            )}

            {activeTab === "Projects" && (
              <>
                {/* Project Status Filter */}
                <select
                  value={filters.projectStatus || ""}
                  onChange={(e) => updateFilter("projectStatus", e.target.value)}
                  className="flex-1 min-w-[140px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Project Status</option>
                  <option value="new-launch">New Launch</option>
                  <option value="under-construction">Under Construction</option>
                  <option value="ready-to-move">Ready to Move</option>
                </select>

                {/* Property Type Filter */}
                <select
                  value={filters.propertyType || ""}
                  onChange={(e) => updateFilter("propertyType", e.target.value)}
                  className="flex-1 min-w-[140px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Property Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                </select>
              </>
            )}

            {activeTab === "PG / Hostels" && (
              <>
                {/* Food Available Filter */}
                <select
                  value={filters.foodAvailable || ""}
                  onChange={(e) => updateFilter("foodAvailable", e.target.value)}
                  className="flex-1 min-w-[140px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Food Available</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="optional">Optional</option>
                </select>

                {/* Available For Filter */}
                <select
                  value={filters.availableFor || ""}
                  onChange={(e) => updateFilter("availableFor", e.target.value)}
                  className="flex-1 min-w-[140px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Available For</option>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                  <option value="both">Both</option>
                </select>
              </>
            )}

            {activeTab === "Plot & Land" && (
              <>
                {/* Property Type Filter */}
                <select
                  value={filters.propertyType || ""}
                  onChange={(e) => updateFilter("propertyType", e.target.value)}
                  className="flex-1 min-w-[140px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Property Type</option>
                  <option value="residential-plot">Residential Plot</option>
                  <option value="commercial-plot">Commercial Plot</option>
                  <option value="agricultural-land">Agricultural Land</option>
                  <option value="industrial-land">Industrial Land</option>
                </select>

                {/* Possession Status Filter */}
                <select
                  value={filters.possession || ""}
                  onChange={(e) => updateFilter("possession", e.target.value)}
                  className="flex-1 min-w-[140px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Possession Status</option>
                  <option value="immediate">Immediate</option>
                  <option value="within-3-months">Within 3 Months</option>
                  <option value="within-6-months">Within 6 Months</option>
                </select>
              </>
            )}

            {/* Search Button */}
            <button className="bg-red-600 text-white px-8 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap">
              <AiOutlineSearch />
              Search
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
