import React, { useState, useEffect } from "react";
import { BellIcon, ChevronDownIcon, Bars3Icon } from "@heroicons/react/24/outline";
import logoSrc from "../assets/dd.jpg";

const Header = ({ toggleSidebar }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [isEnvAgent, setIsEnvAgent] = useState(false);

  useEffect(() => {
    try {
      const storedRaw = localStorage.getItem("adminInfo");
      const storedInfo = storedRaw ? JSON.parse(storedRaw) : null;
      if (storedInfo?.name) setAdminName(storedInfo.name);
      else setAdminName(localStorage.getItem("adminName") || "Admin");
      setIsEnvAgent(Boolean(storedInfo?.isEnvAgent));
    } catch (error) {
      console.error("Failed to parse adminInfo", error);
      setAdminName(localStorage.getItem("adminName") || "Admin");
    }
  }, []);

  // 🚪 Logout Function
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminInfo");
    localStorage.removeItem("adminRole");
    window.location.href = "/admin/login";
  };

  return (
    <header className="bg-white border-b border-gray-100 p-3 sm:p-4 lg:p-6 flex justify-between items-center shadow-md gap-2">
      {/* Left Side: Toggle & Logo */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <img src={logoSrc} alt="DealDirect Logo" className="h-6 sm:h-8 lg:h-10 w-auto object-contain" />
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-2 sm:space-x-6 relative flex-shrink-1 min-w-0">
        {/* Notification */}
        <button className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition flex-shrink-0">
          <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </button>

        {/* Admin Name + Dropdown */}
        <div className="relative flex-shrink-1 min-w-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center space-x-1 sm:space-x-2 bg-blue-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-blue-100 transition max-w-full"
          >
            <span className="text-blue-700 font-semibold whitespace-nowrap text-xs sm:text-base max-w-[60px] xs:max-w-[100px] sm:max-w-none truncate">
              {adminName}
            </span>
            {isEnvAgent && (
              <span className="hidden sm:inline-block text-xs font-semibold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                Agent
              </span>
            )}
            <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-lg shadow-lg z-50">
              <ul className="py-2">
                <li>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    {adminName}
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
