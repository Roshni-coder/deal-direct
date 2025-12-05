import React, { useState, useEffect } from "react";
import { BellIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import logoSrc from "../assets/dd.jpg";

const Header = () => {
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
    <header className="bg-white border-b border-gray-100 p-6 flex justify-between items-center shadow-md">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <img src={logoSrc} alt="DealDirect Logo" className="h-10 w-auto" />
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-6 relative">
        {/* Notification */}
        <button className="p-2 rounded-full hover:bg-gray-100 transition">
          <BellIcon className="h-6 w-6 text-gray-600" />
        </button>

        {/* Admin Name + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition"
          >
            <span className="text-blue-700 font-semibold">{adminName}</span>
            {isEnvAgent && (
              <span className="text-xs font-semibold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                Agent
              </span>
            )}
            <ChevronDownIcon className="h-5 w-5 text-blue-600" />
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
