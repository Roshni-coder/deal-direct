// src/Components/HeroSection/HeroSection.jsx - Omnibox Style
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMapMarkerAlt, FaMicrophone, FaHome, FaKey, FaBuilding, FaBed, FaTree } from "react-icons/fa";
import { tabConfig } from "./filterConfig";
import PropertyTypeFilter from "./PropertyTypeFilter";
import gemback from "../../assets/gemback.png";

const API_BASE = import.meta.env.VITE_API_BASE;

const defaultTabs = [
  { label: "Buy", intent: "buy", icon: FaHome },
  { label: "Rental", intent: "rent", icon: FaKey },
  { label: "Projects", intent: "project", icon: FaBuilding },
  { label: "PG / Hostels", intent: "pg", icon: FaBed },
  { label: "Plot & Land", intent: "plot", icon: FaTree },
];

// Simple in-memory cache for suggestions
const suggestionsCache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

const HeroSection = ({ filters, setFilters, propertyTypes = [] }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Buy");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const abortControllerRef = useRef(null);

  const dropdownRefs = {
    budget: useRef(null),
    propertyType: useRef(null),
  };

  // Optimized autocomplete with dedicated endpoint, caching, and request cancellation
  useEffect(() => {
    const searchTerm = filters.search?.trim() || '';
    
    if (searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Check cache first
    const cacheKey = searchTerm.toLowerCase();
    const cached = suggestionsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setSuggestions(cached.data);
      setShowSuggestions(cached.data.length > 0);
      setSelectedIndex(-1);
      return;
    }

    const fetchSuggestions = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoadingSuggestions(true);
      try {
        const response = await axios.get(
          `${API_BASE}/api/properties/suggestions`,
          {
            params: { q: searchTerm },
            signal: abortControllerRef.current.signal,
            timeout: 3000 // 3 second timeout
          }
        );

        const data = response.data.suggestions || [];
        
        // Cache the result
        suggestionsCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });

        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    // Debounce: 150ms for fast response
    const debounceTimer = setTimeout(fetchSuggestions, 150);
    return () => {
      clearTimeout(debounceTimer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filters.search]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openDropdown &&
        dropdownRefs[openDropdown]?.current &&
        !dropdownRefs[openDropdown].current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }

      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
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
      const nextValue = typeof updater === "function" ? updater(previous) : updater;
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

  const handleSuggestionClick = (suggestion) => {
    setFilters({ ...filters, search: suggestion.value });
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab.label);
  };

  // Highlight matching text
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.substring(0, index)}
        <span className="font-semibold">{text.substring(index, index + query.length)}</span>
        {text.substring(index + query.length)}
      </>
    );
  };

  return (
    <section className="relative flex flex-col justify-center items-center px-4 sm:px-8 lg:px-16 text-center overflow-visible">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${gemback})` }}
      ></div>

      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative pt-32 pb-16 z-10 flex flex-col items-center max-w-7xl w-full space-y-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[700] text-white leading-tight max-w-4xl">
          Buy, Rent & Sell Properties
          <br />
          <span className="text-red-500">Directly from Owners</span>
        </h1>

        <p className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-3xl">
          No middleman. No commission fees.
          <br />
          <span className="font-bold text-white">
            Deal directly with property owners
          </span>
        </p>

        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-full p-2 sm:p-3 mt-4 w-full max-w-5xl">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <div className="relative flex-1 w-full" ref={searchInputRef}>
              <div className="relative flex items-center">
                <AiOutlineSearch className="absolute left-5 text-gray-400 text-2xl" />
                <input
                  type="text"
                  placeholder="Search by Project, Locality, or City"
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({ ...filters, search: e.target.value });
                    setShowSuggestions(true);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  className="w-full bg-transparent rounded-full pl-14 pr-24 py-4 text-lg text-gray-900 placeholder-gray-400 focus:outline-none"
                />
                <div className="absolute right-5 flex items-center gap-4">
                  <FaMapMarkerAlt className="text-gray-600 cursor-pointer hover:text-gray-800 text-xl" />
                  <FaMicrophone className="text-red-600 cursor-pointer hover:text-red-700 text-xl" />
                </div>
              </div>

              {/* Omnibox Suggestions */}
              {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50"
                >
                  {isLoadingSuggestions ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin inline-block w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                      <p className="mt-2 text-sm">Searching...</p>
                    </div>
                  ) : (
                    <ul className="py-1">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${selectedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'
                            }`}
                        >
                          {suggestion.type === 'city' ? (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                              <FaMapMarkerAlt className="text-white text-lg" />
                            </div>
                          ) : suggestion.image ? (
                            <img 
                              src={suggestion.image} 
                              alt="" 
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              suggestion.type === 'project' ? 'bg-blue-100 text-blue-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {suggestion.type === 'project' ? '🏠' : '📍'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium">
                              {highlightMatch(suggestion.value, filters.search)}
                            </p>
                            {suggestion.subtitle && suggestion.type !== 'city' && (
                              <p className="text-xs text-gray-500 truncate">{suggestion.subtitle}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                            suggestion.type === 'project' ? 'bg-blue-50 text-blue-600' :
                            suggestion.type === 'locality' ? 'bg-green-50 text-green-600' :
                            'bg-orange-50 text-orange-600'
                          }`}>{suggestion.type}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button className="bg-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap">
              <AiOutlineSearch className="text-xl" />
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
