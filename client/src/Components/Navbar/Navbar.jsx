import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineUser, AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import logo from "../../assets/dealdirect_logo.webp";
import CityDropdown from "./CityDropdown";
import MegaMenu from "./MegaMenu";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen((s) => !s);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
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

  // --- menu data kept same as your original ---
  const buyMenuSections = [ /* ...your buyMenuSections (unchanged) ... */ ];
  const rentMenuSections = [ /* ...your rentMenuSections (unchanged) ... */ ];

  // You can keep your full arrays here — I omitted them above for brevity.
  // (When pasting, keep the original buyMenuSections and rentMenuSections content.)

  // Classes that adapt to background (hero/dark vs scrolled/light)
  const navWrapperClass = `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
    isScrolled
      ? "bg-white/95 dark:bg-gray-100/80 backdrop-blur-xl shadow-lg py-2"
      : "bg-transparent py-4"
  }`;

  const navTextClass = isScrolled ? "text-red-600 dark:text-red-600" : "text-white";

  return (
    <nav className={navWrapperClass}>
      <div className="mx-auto flex items-center justify-between px-6 lg:px-8 py-4 max-w-[1200px]">
        {/* Logo */}
        <Link to="/" className="flex items-center mr-6">
          <img
            src={logo}
            alt="DealDirect"
            className="h-10 w-auto object-contain hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Desktop Menu - Left Side */}
        

        {/* Desktop Menu - Right Side */}
        <div className="hidden lg:flex items-center space-x-6 ml-auto mr-2">
          <Link to="/about" className={`${navTextClass} hover:text-red-600 font-medium text-[15px]`}>
            About
          </Link>
          <Link to="/contact" className={`${navTextClass} hover:text-red-600 font-medium text-[15px]`}>
            Contact
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/properties" className={`${navTextClass} hover:text-red-600 font-medium text-[15px]`}>
              Properties
            </Link>
            <div className={`hidden lg:flex items-center space-x-4 ${navTextClass}`}>
          <CityDropdown
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            isOpen={activeMenu === "city"}
            onMouseEnter={() => setActiveMenu("city")}
            onMouseLeave={() => setActiveMenu(null)}
            navTextClass={navTextClass}
          />

          {/* <MegaMenu
            title="Buy"
            sections={buyMenuSections}
            isOpen={activeMenu === "buy"}
            onMouseEnter={() => setActiveMenu("buy")}
            onMouseLeave={() => setActiveMenu(null)}
            navTextClass={navTextClass}
          /> */}

          {/* <MegaMenu
            title="Rent"
            sections={rentMenuSections}
            isOpen={activeMenu === "rent"}
            onMouseEnter={() => setActiveMenu("rent")}
            onMouseLeave={() => setActiveMenu(null)}
            navTextClass={navTextClass}
          /> */}

          <Link
            to="/agreements"
            className={`${navTextClass} hover:text-red-600 font-medium transition text-[15px] px-3 py-1`}
          >
            Agreements
          </Link>
        </div>

            {showAgentUpload && (
              <button
                type="button"
                onClick={handleAgentUploadNavigation}
                className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:opacity-95 transition inline-flex"
              >
                Upload Property
              </button>
            )}
          </div>

          {user ? (
            <div className="flex items-center space-x-3">
              <span className={`${navTextClass} font-medium text-sm`}>Hi, {user.name?.split(" ")[0] || "User"}</span>
              <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className={`flex items-center space-x-1 ${navTextClass} hover:text-red-600 transition`}>
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
        className={`lg:hidden absolute left-0 w-full bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 ease-in-out ${
          menuOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-5 invisible"
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
