import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineUser, AiOutlineMenu, AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { FaMapMarkerAlt, FaMicrophone } from "react-icons/fa";
import logo from "../../assets/dealdirect_logo.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Classes that adapt: transparent initially, blue when scrolled past hero
  const navWrapperClass = `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
    ? "bg-[#0b1e3f] shadow-lg py-2"
    : "bg-transparent py-4"
    }`;

  const navTextClass = "text-white"; // Always white text in both states

  return (
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

          {/* Scrolled State: Search Bar + City Dropdown */}
          {isScrolled && (
            <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-6 gap-3">
              {/* City Dropdown */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
              </select>

              {/* Search Bar */}
              <div className="relative flex-1 flex items-center">
                <AiOutlineSearch className="absolute left-3 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Enter Locality / Project / Society / Landmark"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-16 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-red-500 outline-none"
                />
                <div className="absolute right-3 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-600 cursor-pointer hover:text-red-700" />
                  <FaMicrophone className="text-red-600 cursor-pointer hover:text-red-700" />
                </div>
              </div>

              {/* Search Button */}
              <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-red-700 transition flex items-center gap-2">
                <AiOutlineSearch />
                Search
              </button>
            </div>
          )}

          {/* Desktop Navigation Items - Only in non-scrolled state */}
          {!isScrolled && (
            <div className="hidden lg:flex items-center gap-6">
              {/* City Dropdown */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent border border-white/30 rounded-lg px-3 py-1.5 text-sm font-medium text-white focus:ring-2 focus:ring-white/50 outline-none cursor-pointer hover:border-white/50 transition"
              >
                <option value="Mumbai" className="text-gray-900">Mumbai</option>
                <option value="Pune" className="text-gray-900">Pune</option>
                <option value="Delhi" className="text-gray-900">Delhi</option>
                <option value="Bangalore" className="text-gray-900">Bangalore</option>
              </select>

              {/* Buy Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveMenu('buy')}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className={`${navTextClass} hover:text-red-400 font-medium text-[15px] flex items-center gap-1`}>
                  Buy
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeMenu === 'buy' && (
                  <div className="absolute top-full left-0 mt-2 bg-white shadow-2xl rounded-lg p-6 w-[800px] z-50">
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
                <button className={`${navTextClass} hover:text-red-400 font-medium text-[15px] flex items-center gap-1`}>
                  Rent
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeMenu === 'rent' && (
                  <div className="absolute top-full left-0 mt-2 bg-white shadow-2xl rounded-lg p-6 w-[800px] z-50">
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
                <button className={`${navTextClass} hover:text-red-400 font-medium text-[15px] flex items-center gap-1`}>
                  Services
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeMenu === 'services' && (
                  <div className="absolute top-full left-0 mt-2 bg-white shadow-2xl rounded-lg p-6 w-[800px] z-50">
                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-3 text-sm">For Buyers / Owners</h3>
                        <ul className="space-y-2">
                          <li><Link to="/services/home-loan" className="text-gray-700 hover:text-red-600 text-sm">Home Loan</Link></li>
                          <li><Link to="/services/interior-design" className="text-gray-700 hover:text-red-600 text-sm">Home Interior Design</Link></li>
                          <li><Link to="/services/valuation" className="text-gray-700 hover:text-red-600 text-sm">Valuation</Link></li>
                          <li><Link to="/services/vastu" className="text-gray-700 hover:text-red-600 text-sm">Vastu Calculator</Link></li>
                          <li><Link to="/services/property-management" className="text-gray-700 hover:text-red-600 text-sm">Property Management</Link></li>
                          <li><Link to="/post-property" className="text-gray-700 hover:text-red-600 text-sm">Sell or Rent Property</Link></li>
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
                <button className={`${navTextClass} hover:text-red-400 font-medium text-[15px] flex items-center gap-1`}>
                  Resources
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeMenu === 'resources' && (
                  <div className="absolute top-full left-0 mt-2 bg-white shadow-2xl rounded-lg p-6 w-[600px] z-50">
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
                <Link to="/properties" className={`${navTextClass} hover:text-red-400 font-medium text-[15px]`}>
                  Properties
                </Link>
                <Link
                  to="/agreements"
                  className={`${navTextClass} hover:text-red-400 font-medium transition text-[15px]`}
                >
                  Agreements
                </Link>
                <Link to="/about" className={`${navTextClass} hover:text-red-400 font-medium text-[15px]`}>
                  About
                </Link>
                <Link to="/contact" className={`${navTextClass} hover:text-red-400 font-medium text-[15px]`}>
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

            {/* Sell or Rent Property Button - visible in initial state */}
            {!isScrolled && (
              <Link
                to="/post-property"
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/20 hover:border-white/50 transition"
              >
                Sell or Rent Property
              </Link>
            )}
          </div>

          {user ? (
            <div className="flex items-center space-x-3">
              <span className={`${navTextClass} font-medium text-sm`}>Hi, {user.name?.split(" ")[0] || "User"}</span>
              <button onClick={handleLogout} className="text-sm text-red-400 hover:underline">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className={`flex items-center space-x-1 ${navTextClass} hover:text-red-400 transition`}>
              <AiOutlineUser className="text-lg" />
              <span className="font-medium text-sm">Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMenu}
          className={`lg:hidden text-2xl transition ${isScrolled ? "text-gray-700" : "text-white"}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute left-0 w-full bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 ease-in-out ${menuOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-5 invisible"
          }`}
      >
        <div className="flex flex-col px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Link to="/" onClick={toggleMenu} className="text-gray-700 dark:text-gray-100 font-medium hover:text-red-600 transition py-2 border-b">
            Home
          </Link>
          <Link to="/properties" onClick={toggleMenu} className="text-gray-700 dark:text-gray-100 font-medium hover:text-red-600 transition py-2 border-b">
            Properties
          </Link>

          {showAgentUpload && (
            <button
              type="button"
              className="text-gray-700 dark:text-gray-100 font-medium hover:text-red-600 transition py-2 border-b text-left"
              onClick={() => {
                handleAgentUploadNavigation();
                if (!isExternalAgentUrl) toggleMenu();
              }}
            >
              Upload Property
            </button>
          )}

          <Link to="/agreements" onClick={toggleMenu} className="text-gray-700 dark:text-gray-100 font-medium hover:text-red-600 transition py-2 border-b">
            Agreements
          </Link>

          <Link to="/about" onClick={toggleMenu} className="text-gray-700 dark:text-gray-100 font-medium hover:text-red-600 transition py-2 border-b">
            About
          </Link>

          <Link to="/contact" onClick={toggleMenu} className="text-gray-700 dark:text-gray-100 font-medium hover:text-red-600 transition py-2 border-b">
            Contact
          </Link>

          {user ? (
            <div className="flex flex-col items-start space-y-3 py-2">
              <span className="text-gray-700 dark:text-gray-100 font-medium">Hi, {user.name?.split(" ")[0] || "User"}</span>
              <button onClick={() => { handleLogout(); toggleMenu(); }} className="text-red-500 hover:underline text-sm">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={toggleMenu} className="text-gray-700 dark:text-gray-100 font-medium hover:text-red-600 transition py-2 border-b">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
