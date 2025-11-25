import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlineUser, AiOutlineMenu, AiOutlineClose, AiOutlineSearch, AiOutlineHome, AiOutlineInfoCircle, AiOutlinePhone, AiOutlineFileText, AiOutlinePlusCircle, AiOutlineLogin, AiOutlineLogout } from "react-icons/ai";
import { FaMapMarkerAlt, FaMicrophone } from "react-icons/fa";
import { BsBuilding } from "react-icons/bs";
import logo from "../../assets/dealdirect_logo.png";
import AuthModal from "../AuthModal/AuthModal";

const API_BASE = import.meta.env.VITE_API_BASE;

// Omnibox-style relevance scoring (Same as HeroSection)
const calculateRelevanceScore = (query, text) => {
  if (!text) return 0;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  if (textLower === queryLower) return 100;
  if (textLower.startsWith(queryLower)) return 90;

  const words = textLower.split(/\s+/);
  if (words.some(word => word.startsWith(queryLower))) return 80;
  if (textLower.includes(queryLower)) return 70;

  // Fuzzy match
  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) queryIndex++;
  }
  return queryIndex === queryLower.length ? 50 : 0;
};

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Search Suggestions State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen((s) => !s);

  useEffect(() => {
    const handleScroll = () => {
      // Detect if we've scrolled past the hero section (approximately 600-700px)
      setIsScrolled(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const syncUserFromStorage = useCallback(() => {
    try {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch (error) {
      console.error("Failed to parse user from storage", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    syncUserFromStorage();
    const handleStorage = () => syncUserFromStorage();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-change", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-change", handleStorage);
    };
  }, [syncUserFromStorage]);

  // Search Suggestions Logic
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await axios.get(`${API_BASE}/api/properties/property-list`);
        const properties = response.data.data || [];

        const searchTerm = searchQuery.toLowerCase().trim();
        const scoredSuggestions = [];

        properties.forEach(property => {
          if (property.title) {
            const score = calculateRelevanceScore(searchTerm, property.title);
            if (score > 0) {
              scoredSuggestions.push({
                type: 'project',
                value: property.title,
                subtitle: `${property.city || ''} ${property.locality ? '• ' + property.locality : ''}`.trim(),
                score,
              });
            }
          }

          if (property.locality) {
            const score = calculateRelevanceScore(searchTerm, property.locality);
            if (score > 0) {
              scoredSuggestions.push({
                type: 'locality',
                value: property.locality,
                subtitle: property.city || '',
                score: score * 0.9,
              });
            }
          }

          if (property.city) {
            const score = calculateRelevanceScore(searchTerm, property.city);
            if (score > 0) {
              scoredSuggestions.push({
                type: 'city',
                value: property.city,
                subtitle: 'City',
                score: score * 0.8,
              });
            }
          }
        });

        const uniqueSuggestions = Array.from(
          new Map(scoredSuggestions.map(item => [`${item.type}-${item.value}`, item])).values()
        ).sort((a, b) => b.score - a.score).slice(0, 8);

        setSuggestions(uniqueSuggestions);
        setShowSuggestions(uniqueSuggestions.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle Click Outside for Suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
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
  }, []);

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.value);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    navigate(`/properties?search=${encodeURIComponent(suggestion.value)}`);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login");
  };

  const derivedRole = useMemo(() => {
    if (!user) return "user";
    const fallbacks = user.role || user.accountType || user.userType || user.type;
    if (typeof fallbacks === "string") return fallbacks.toLowerCase();
    if (user.isAgent) return "agent";
    return "user";
  }, [user]);

  const isAgent = derivedRole === "agent";
  const agentUploadUrl = import.meta.env.VITE_AGENT_UPLOAD_URL || "/admin/add-property";
  const isExternalAgentUrl = /^https?:\/\//i.test(agentUploadUrl || "");
  const showAgentUpload = isAgent && Boolean(agentUploadUrl);

  const handleAgentUploadNavigation = useCallback(() => {
    if (!showAgentUpload) return;
    if (isExternalAgentUrl) {
      window.location.href = agentUploadUrl;
      return;
    }
    navigate(agentUploadUrl);
  }, [agentUploadUrl, isExternalAgentUrl, navigate, showAgentUpload]);

  const handleRegisterProperty = () => {
    if (user) {
      navigate("/add-property");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  // Classes that adapt: white background always
  const navWrapperClass = `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
    ? "bg-white shadow-lg py-3"
    : "bg-white py-4"
    }`;

  const navTextClass = "text-gray-800"; // Dark text for white background

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <nav className={navWrapperClass}>
        <div className="mx-auto flex items-center justify-between px-6 lg:px-8 max-w-[1400px]">
          {/* Left Side: Logo + Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="DealDirect"
                className="h-10 w-auto object-contain hover:scale-105 transition-transform duration-300"
              />
            </Link>

            {/* Scrolled State: Search Bar */}
            {isScrolled && (
              <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-6 gap-3 relative" ref={searchInputRef}>

                {/* Search Bar */}
                <div className="relative flex-1 flex items-center">
                  <AiOutlineSearch className="absolute left-3 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Enter Locality / Project / Society / Landmark"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-16 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                  <div className="absolute right-3 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-600 cursor-pointer hover:text-red-700" />
                    <FaMicrophone className="text-red-600 cursor-pointer hover:text-red-700" />
                  </div>
                </div>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50"
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
                            className={`px-4 py-3 cursor-pointer transition-colors flex items-start gap-3 ${selectedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'
                              }`}
                          >
                            <AiOutlineSearch className="text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">
                                {highlightMatch(suggestion.value, searchQuery)}
                              </p>
                              {suggestion.subtitle && (
                                <p className="text-xs text-gray-500 truncate">{suggestion.subtitle}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 capitalize flex-shrink-0">{suggestion.type}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-red-700 transition flex items-center gap-2"
                >
                  <AiOutlineSearch />
                  Search
                </button>
              </div>
            )}

            {/* Desktop Navigation Items - Only in non-scrolled state */}
            {!isScrolled && (
              <div className="hidden lg:flex items-center gap-6">

                {/* Buy Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveMenu('buy')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button className={`${navTextClass} hover:text-red-600 font-medium text-[15px] flex items-center gap-1 transition-colors duration-200`}>
                    Buy
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeMenu === 'buy' && (
                    <div className="absolute top-full left-0 pt-2 bg-white shadow-2xl rounded-lg p-6 w-[800px] z-50">
                      <div className="grid grid-cols-4 gap-6">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">Popular Searches</h3>
                          <ul className="space-y-2">
                            <li><Link to="/properties?type=property" className="text-gray-700 hover:text-red-600 text-sm">Property in {selectedCity}</Link></li>
                            <li><Link to="/properties?type=gated-community" className="text-gray-700 hover:text-red-600 text-sm">Gated Community Flats</Link></li>
                            <li><Link to="/properties?brokerage=no" className="text-gray-700 hover:text-red-600 text-sm">No Brokerage Flats</Link></li>
                            <li><Link to="/properties?budget=under-50" className="text-gray-700 hover:text-red-600 text-sm">Property Under 50 Lakhs</Link></li>
                            <li><Link to="/properties?bhk=2" className="text-gray-700 hover:text-red-600 text-sm">2 BHK Flats</Link></li>
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">Property Type</h3>
                          <ul className="space-y-2">
                            <li><Link to="/properties?type=plot" className="text-gray-700 hover:text-red-600 text-sm">Plot</Link></li>
                            <li><Link to="/properties?type=flat" className="text-gray-700 hover:text-red-600 text-sm">Flats</Link></li>
                            <li><Link to="/properties?type=villa" className="text-gray-700 hover:text-red-600 text-sm">Villa</Link></li>
                            <li><Link to="/properties?type=house" className="text-gray-700 hover:text-red-600 text-sm">Houses</Link></li>
                            <li><Link to="/properties?type=builder-floor" className="text-gray-700 hover:text-red-600 text-sm">Builder Floor</Link></li>
                            <li><Link to="/properties?type=office" className="text-gray-700 hover:text-red-600 text-sm">Office Space</Link></li>
                            <li><Link to="/properties?type=shop" className="text-gray-700 hover:text-red-600 text-sm">Shop</Link></li>
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">New Projects</h3>
                          <ul className="space-y-2">
                            <li><Link to="/projects?status=new" className="text-gray-700 hover:text-red-600 text-sm">New Projects</Link></li>
                            <li><Link to="/projects?status=ready" className="text-gray-700 hover:text-red-600 text-sm">Ready to Move</Link></li>
                            <li><Link to="/projects?status=construction" className="text-gray-700 hover:text-red-600 text-sm">Under Construction</Link></li>
                            <li><Link to="/projects?status=launch" className="text-gray-700 hover:text-red-600 text-sm">New Launch</Link></li>
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">By BHK</h3>
                          <ul className="space-y-2">
                            <li><Link to="/properties?bhk=1" className="text-gray-700 hover:text-red-600 text-sm">1 BHK Flats</Link></li>
                            <li><Link to="/properties?bhk=2" className="text-gray-700 hover:text-red-600 text-sm">2 BHK Flats</Link></li>
                            <li><Link to="/properties?bhk=3" className="text-gray-700 hover:text-red-600 text-sm">3 BHK Flats</Link></li>
                            <li><Link to="/properties?bhk=4" className="text-gray-700 hover:text-red-600 text-sm">4 BHK Flats</Link></li>
                            <li><Link to="/properties?bhk=5" className="text-gray-700 hover:text-red-600 text-sm">5 BHK Flats</Link></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rent Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveMenu('rent')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button className={`${navTextClass} hover:text-red-600 font-medium text-[15px] flex items-center gap-1 transition-colors duration-200`}>
                    Rent
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeMenu === 'rent' && (
                    <div className="absolute top-full left-0 pt-2 bg-white shadow-2xl rounded-lg p-6 w-[800px] z-50">
                      <div className="grid grid-cols-4 gap-6">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">Popular Searches</h3>
                          <ul className="space-y-2">
                            <li><Link to="/properties?intent=rent" className="text-gray-700 hover:text-red-600 text-sm">Property for Rent</Link></li>
                            <li><Link to="/properties?intent=rent&furnished=yes" className="text-gray-700 hover:text-red-600 text-sm">Furnished Flats</Link></li>
                            <li><Link to="/properties?intent=rent&type=gated" className="text-gray-700 hover:text-red-600 text-sm">Gated Community Flats</Link></li>
                            <li><Link to="/properties?intent=rent&bhk=2" className="text-gray-700 hover:text-red-600 text-sm">2 BHK Flats for Rent</Link></li>
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">Property Type</h3>
                          <ul className="space-y-2">
                            <li><Link to="/properties?intent=rent&type=flat" className="text-gray-700 hover:text-red-600 text-sm">Flats for Rent</Link></li>
                            <li><Link to="/properties?intent=rent&type=house" className="text-gray-700 hover:text-red-600 text-sm">Houses for Rent</Link></li>
                            <li><Link to="/properties?intent=rent&type=builder-floor" className="text-gray-700 hover:text-red-600 text-sm">Builder Floor</Link></li>
                            <li><Link to="/properties?intent=rent&type=villa" className="text-gray-700 hover:text-red-600 text-sm">Villa for Rent</Link></li>
                            <li><Link to="/properties?intent=rent&type=pg" className="text-gray-700 hover:text-red-600 text-sm">PG</Link></li>
                            <li><Link to="/properties?intent=rent&type=office" className="text-gray-700 hover:text-red-600 text-sm">Office Space</Link></li>
                            <li><Link to="/properties?intent=rent&type=coworking" className="text-gray-700 hover:text-red-600 text-sm">Coworking Space</Link></li>
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">By BHK</h3>
                          <ul className="space-y-2">
                            <li><Link to="/properties?intent=rent&bhk=1rk" className="text-gray-700 hover:text-red-600 text-sm">1 RK for Rent</Link></li>
                            <li><Link to="/properties?intent=rent&bhk=1" className="text-gray-700 hover:text-red-600 text-sm">1 BHK Flats</Link></li>
                            <li><Link to="/properties?intent=rent&bhk=2" className="text-gray-700 hover:text-red-600 text-sm">2 BHK Flats</Link></li>
                            <li><Link to="/properties?intent=rent&bhk=3" className="text-gray-700 hover:text-red-600 text-sm">3 BHK Flats</Link></li>
                            <li><Link to="/properties?intent=rent&bhk=4" className="text-gray-700 hover:text-red-600 text-sm">4 BHK Flats</Link></li>
                            <li><Link to="/properties?intent=rent&bhk=5" className="text-gray-700 hover:text-red-600 text-sm">5 BHK Flats</Link></li>
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">Budget</h3>
                          <ul className="space-y-2">
                            <li><Link to="/properties?intent=rent&budget=10-20k" className="text-gray-700 hover:text-red-600 text-sm">10-20 Thousand</Link></li>
                            <li><Link to="/properties?intent=rent&budget=20-30k" className="text-gray-700 hover:text-red-600 text-sm">20-30 Thousand</Link></li>
                            <li><Link to="/properties?intent=rent&budget=30-40k" className="text-gray-700 hover:text-red-600 text-sm">30-40 Thousand</Link></li>
                            <li><Link to="/properties?intent=rent&budget=40-50k" className="text-gray-700 hover:text-red-600 text-sm">40-50 Thousand</Link></li>
                            <li><Link to="/properties?intent=rent&budget=50-60k" className="text-gray-700 hover:text-red-600 text-sm">50-60 Thousand</Link></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Services Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveMenu('services')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button className={`${navTextClass} hover:text-red-600 font-medium text-[15px] flex items-center gap-1 transition-colors duration-200`}>
                    Services
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeMenu === 'services' && (
                    <div className="absolute top-full left-0 pt-2 bg-white shadow-2xl rounded-lg p-6 w-[800px] z-50">
                      <div className="grid grid-cols-4 gap-6">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">For Buyers / Owners</h3>
                          <ul className="space-y-2">
                            <li><Link to="/services/home-loan" className="text-gray-700 hover:text-red-600 text-sm">Home Loan</Link></li>
                            <li><Link to="/services/interior-design" className="text-gray-700 hover:text-red-600 text-sm">Home Interior Design</Link></li>
                            <li><Link to="/services/valuation" className="text-gray-700 hover:text-red-600 text-sm">Valuation</Link></li>
                            <li><Link to="/services/vastu" className="text-gray-700 hover:text-red-600 text-sm">Vastu Calculator</Link></li>
                            <li><Link to="/services/property-management" className="text-gray-700 hover:text-red-600 text-sm">Property Management</Link></li>
                            <li><button onClick={handleRegisterProperty} className="text-gray-700 hover:text-red-600 text-sm text-left w-full">Register Property</button></li>
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">For Tenants</h3>
                          <ul className="space-y-2">
                            <li><Link to="/agreements" className="text-gray-700 hover:text-red-600 text-sm">Online Rent Agreement</Link></li>
                            <li><Link to="/services/rent-receipts" className="text-gray-700 hover:text-red-600 text-sm">Rent Receipts</Link></li>
                            <li><Link to="/services/property-management" className="text-gray-700 hover:text-red-600 text-sm">Property Management</Link></li>
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">For Agents</h3>
                          <ul className="space-y-2">
                            <li><Link to="/services/list-property" className="text-gray-700 hover:text-red-600 text-sm">List Property With Us</Link></li>
                            <li><Link to="/services/co-broking" className="text-gray-700 hover:text-red-600 text-sm">Co-Broking For New Projects</Link></li>
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">For Builders & Banks</h3>
                          <ul className="space-y-2">
                            <li><Link to="/services/advertise" className="text-gray-700 hover:text-red-600 text-sm">Advertise With Us</Link></li>
                            <li><Link to="/services/3d-services" className="text-gray-700 hover:text-red-600 text-sm">3D/AR/VR Services</Link></li>
                            <li><Link to="/services/data-intelligence" className="text-gray-700 hover:text-red-600 text-sm">Data Intelligence</Link></li>
                            <li><Link to="/services/mortgage" className="text-gray-700 hover:text-red-600 text-sm">Mortgage Partnerships</Link></li>
                            <li><Link to="/services/super-agent" className="text-gray-700 hover:text-red-600 text-sm">Super Agent Pro</Link></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resources Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveMenu('resources')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button className={`${navTextClass} hover:text-red-600 font-medium text-[15px] flex items-center gap-1 transition-colors duration-200`}>
                    Resources
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeMenu === 'resources' && (
                    <div className="absolute top-full left-0 pt-2 bg-white shadow-2xl rounded-lg p-6 w-[600px] z-50">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3 text-sm">Tools and Services</h3>
                          <ul className="space-y-2">
                            <li><Link to="/resources/heatmaps" className="text-gray-700 hover:text-red-600 text-sm">Heatmaps</Link></li>
                            <li><Link to="/resources/price-vs-size" className="text-gray-700 hover:text-red-600 text-sm">Price vs Size</Link></li>
                            <li><Link to="/resources/escrow" className="text-gray-700 hover:text-red-600 text-sm">Escrow</Link></li>
                            <li><Link to="/resources/property-inspection" className="text-gray-700 hover:text-red-600 text-sm">Property Inspection</Link></li>
                            <li><Link to="/resources/credit-score" className="text-gray-700 hover:text-red-600 text-sm">Check your Credit Score</Link></li>
                            <li><Link to="/resources/legal-services" className="text-gray-700 hover:text-red-600 text-sm">Property Legal Services</Link></li>
                            <li><Link to="/resources/litigation-search" className="text-gray-700 hover:text-red-600 text-sm">Litigation Search</Link></li>
                            <li><Link to="/resources/title-search" className="text-gray-700 hover:text-red-600 text-sm">Title Search</Link></li>
                          </ul>
                        </div>
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-bold text-gray-900 mb-3 text-sm">Solutions</h3>
                            <ul className="space-y-2">
                              <li><Link to="/resources/solutions" className="text-gray-700 hover:text-red-600 text-sm">Home Services</Link></li>
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 mb-3 text-sm">Loans</h3>
                            <ul className="space-y-2">
                              <li><Link to="/resources/financial-tools" className="text-gray-700 hover:text-red-600 text-sm">Financial Tools</Link></li>
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 mb-3 text-sm">Calculators</h3>
                            <ul className="space-y-2">
                              <li><Link to="/resources/calculators" className="text-gray-700 hover:text-red-600 text-sm">Calculators</Link></li>
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 mb-3 text-sm">Guide</h3>
                            <ul className="space-y-2">
                              <li><Link to="/resources/guide" className="text-gray-700 hover:text-red-600 text-sm">Guide</Link></li>
                              <li><Link to="/resources/glossary" className="text-gray-700 hover:text-red-600 text-sm">Glossary</Link></li>
                              <li><Link to="/resources/forum" className="text-gray-700 hover:text-red-600 text-sm">Real Estate Q&A Forum</Link></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Sell Property + Login */}
          <div className="hidden lg:flex items-center gap-6 ml-auto">

            <div className="flex items-center gap-6">
              {isScrolled && (
                <>
                  <Link to="/properties" className={`${navTextClass} hover:text-red-600 font-medium text-[15px] transition-colors duration-200`}>
                    Properties
                  </Link>
                  <Link
                    to="/agreements"
                    className={`${navTextClass} hover:text-red-600 font-medium text-[15px] transition-colors duration-200`}
                  >
                    Agreements
                  </Link>
                  <Link to="/about" className={`${navTextClass} hover:text-red-600 font-medium text-[15px] transition-colors duration-200`}>
                    About
                  </Link>
                  <Link to="/contact" className={`${navTextClass} hover:text-red-600 font-medium text-[15px] transition-colors duration-200`}>
                    Contact
                  </Link>
                </>
              )}

              {showAgentUpload && (
                <button
                  type="button"
                  onClick={handleAgentUploadNavigation}
                  className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:opacity-95 transition"
                >
                  Upload Property
                </button>
              )}

              {/* Register Property Button - always visible */}
              <button
                type="button"
                onClick={handleRegisterProperty}
                className="bg-red-600 text-white px-6 py-2.5 rounded-lg text-base font-bold hover:bg-red-700 transition shadow-md"
              >
                Register Property
              </button>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                <span className={`${navTextClass} font-medium text-sm`}>Hi, {user.name?.split(" ")[0] || "User"}</span>
                <button onClick={handleLogout} className="text-sm text-red-400 hover:underline">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className={`flex items-center space-x-1 ${navTextClass} hover:text-red-600 transition-colors duration-200`}>
                <AiOutlineUser className="text-lg" />
                <span className="font-medium text-sm">Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className={`lg:hidden text-2xl transition text-gray-700`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          onClick={toggleMenu}
        />

        {/* Mobile Menu Drawer */}
        <div
          className={`lg:hidden fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${menuOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <span className="text-xl font-bold text-slate-800">Menu</span>
              <button
                onClick={toggleMenu}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition"
              >
                <AiOutlineClose size={24} />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
              <Link
                to="/"
                onClick={toggleMenu}
                className="flex items-center gap-4 px-4 py-3 text-slate-700 font-medium rounded-xl hover:bg-red-50 hover:text-red-600 transition"
              >
                <AiOutlineHome size={20} />
                Home
              </Link>

              <Link
                to="/properties"
                onClick={toggleMenu}
                className="flex items-center gap-4 px-4 py-3 text-slate-700 font-medium rounded-xl hover:bg-red-50 hover:text-red-600 transition"
              >
                <BsBuilding size={20} />
                Properties
              </Link>

              <button
                onClick={() => {
                  handleRegisterProperty();
                  toggleMenu();
                }}
                className="w-full flex items-center gap-4 px-4 py-3 text-slate-700 font-medium rounded-xl hover:bg-red-50 hover:text-red-600 transition text-left"
              >
                <AiOutlinePlusCircle size={20} />
                Register Property
              </button>

              {showAgentUpload && (
                <button
                  type="button"
                  className="w-full flex items-center gap-4 px-4 py-3 text-slate-700 font-medium rounded-xl hover:bg-red-50 hover:text-red-600 transition text-left"
                  onClick={() => {
                    handleAgentUploadNavigation();
                    if (!isExternalAgentUrl) toggleMenu();
                  }}
                >
                  <AiOutlinePlusCircle size={20} />
                  Upload Property
                </button>
              )}

              <Link
                to="/agreements"
                onClick={toggleMenu}
                className="flex items-center gap-4 px-4 py-3 text-slate-700 font-medium rounded-xl hover:bg-red-50 hover:text-red-600 transition"
              >
                <AiOutlineFileText size={20} />
                Agreements
              </Link>

              <Link
                to="/about"
                onClick={toggleMenu}
                className="flex items-center gap-4 px-4 py-3 text-slate-700 font-medium rounded-xl hover:bg-red-50 hover:text-red-600 transition"
              >
                <AiOutlineInfoCircle size={20} />
                About
              </Link>

              <Link
                to="/contact"
                onClick={toggleMenu}
                className="flex items-center gap-4 px-4 py-3 text-slate-700 font-medium rounded-xl hover:bg-red-50 hover:text-red-600 transition"
              >
                <AiOutlinePhone size={20} />
                Contact
              </Link>
            </div>

            {/* Footer / User Section */}
            <div className="p-5 border-t bg-slate-50">
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{user.name || "User"}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); toggleMenu(); }}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-red-600 py-2.5 rounded-lg font-medium hover:bg-red-50 transition"
                  >
                    <AiOutlineLogout size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={toggleMenu}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition"
                >
                  <AiOutlineLogin size={20} />
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;

