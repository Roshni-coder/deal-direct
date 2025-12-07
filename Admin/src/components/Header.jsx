import React, { useState, useEffect, useRef } from "react"; // ⬅️ IMPORT useRef
import { ChevronDownIcon, Bars3Icon, ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import logoSrc from "../assets/dd.jpg";

const Header = ({ toggleSidebar }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef(null); // ⬅️ Create a ref for the dropdown container

    const [adminInfo, setAdminInfo] = useState({
        name: "Admin",
        email: "admin@example.com",
        isEnvAgent: false,
    });

    useEffect(() => {
        try {
            const storedRaw = localStorage.getItem("adminInfo");
            const storedInfo = storedRaw ? JSON.parse(storedRaw) : null;
            
            const name = storedInfo?.name || localStorage.getItem("adminName") || "Admin";
            const email = storedInfo?.email || "N/A";
            const isEnvAgent = Boolean(storedInfo?.isEnvAgent);

            setAdminInfo({ name, email, isEnvAgent });
        } catch (error) {
            console.error("Failed to parse adminInfo", error);
            setAdminInfo(prev => ({ 
                ...prev, 
                name: localStorage.getItem("adminName") || "Admin" 
            }));
        }
    }, []);

    // ⬅️ EFFECT FOR HANDLING CLICKS OUTSIDE THE DROPDOWN
    useEffect(() => {
        function handleClickOutside(event) {
            // Check if click is outside the referenced element
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on cleanup
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);


    // 🚪 Logout Function
    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminName");
        localStorage.removeItem("adminInfo");
        localStorage.removeItem("adminRole");
        window.location.href = "/admin/login"; 
    };

    // Get Avatar Text (e.g., 'A' for Admin)
    const getAvatarText = (name) => {
        return name.charAt(0).toUpperCase();
    };

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 p-3 sm:p-4 flex justify-between items-center shadow-md">
            {/* Left Side: Toggle & Logo (unchanged) */}
            <div className="flex items-center px-5 space-x-3 sm:space-x-4 flex-shrink-0">
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none transition"
                    aria-label="Toggle Sidebar"
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>
                <img src={logoSrc} alt="DealDirect Logo" className="h-7 sm:h-10 w-auto object-contain" />
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-3 sm:space-x-5 relative flex-shrink-1 min-w-0">
                
                {/* Admin Profile + Dropdown */}
                <div ref={dropdownRef} className="relative flex-shrink-1"> {/* ⬅️ Attach ref here */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center space-x-1 sm:space-x-2 p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition focus:outline-none"
                        aria-expanded={menuOpen}
                        aria-controls="profile-menu"
                    >
                        {/* Profile Avatar (unchanged) */}
                        <div className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                            {getAvatarText(adminInfo.name)}
                        </div>
                        
                        {/* Info and Chevron (unchanged) */}
                        <div className="hidden md:flex flex-col items-start min-w-0">
                            <span className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                                {adminInfo.name}
                            </span>
                            <span className="text-xs text-gray-500 truncate max-w-[120px]">
                                {adminInfo.isEnvAgent ? 'Agent' : 'Administrator'}
                            </span>
                        </div>
                        
                        <ChevronDownIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen && (
                        <div 
                            id="profile-menu" 
                            className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-lg shadow-xl z-50 origin-top-right animate-fade-in-down"
                        >
                            <div className="p-4 border-b border-gray-100">
                                <p className="font-bold text-gray-800 truncate">{adminInfo.name}</p>
                                <p className="text-sm text-gray-500 truncate">{adminInfo.email}</p>
                                {adminInfo.isEnvAgent && (
                                    <span className="mt-1 inline-block text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                        Environment Agent
                                    </span>
                                )}
                            </div>
                            
                            <ul className="py-2">
                                {/* Logout Button */}
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition mt-1 pt-2"
                                    >
                                        <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
                                        <span>Logout</span>
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