import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import { CiLogout } from "react-icons/ci";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const adminInfo = useMemo(() => {
    try {
      const stored = localStorage.getItem("adminInfo");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Failed to parse adminInfo", error);
      return null;
    }
  }, []);

  const isEnvAgent = Boolean(adminInfo?.isEnvAgent);

  const menuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      path: "/all-clients",
      name: "All Clients",
      icon: <Users className="h-5 w-5" />,
    },
    {
      path: "/all-leads",
      name: "All Leads",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      path: "/all-properties",
      name: "All Properties",
      icon: <Home className="h-5 w-5" />,
    },
    {
      path: "/all-category",
      name: "All Category",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      path: "/add-category",
      name: "Add Category",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      path: "/add-subcategory",
      name: "Add SubCategory",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      path: "/add-property",
      name: "Upload Property",
      icon: <Home className="h-5 w-5" />,
    },
  ];

  const filteredMenu = isEnvAgent
    ? menuItems.filter((item) => item.path === "/add-property")
    : menuItems;
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminRole");
    window.location.href = "/admin/login"; // Redirect
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      <div className="flex  border-r border-gray-100 flex-col h-full">
        {/* Top section with logo & toggle */}
        <div className="flex items-center justify-between p-4">
          <button
            className="hidden lg:block text-gray-600 hover:text-gray-600"
            onClick={toggleSidebar}
          >
            {isOpen ? <X size={25} className="ml-60" /> : <Menu size={25} />}
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-auto mt-2 px-2">
          <ul className="space-y-1">
            {filteredMenu.map((item, idx) => (
              <li key={idx}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2 rounded-md transition-all duration-200 ${
                      isActive
                        ? "bg-gray-100 text-gray-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {item.icon}
                  {isOpen && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </NavLink>
              </li>
            ))}

            {/* Logout */}
            <li>
              <button
                className="w-full flex items-center gap-3 p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-all duration-200"
                onClick={handleLogout}
              >
                <CiLogout className="h-5 w-5" />
                {isOpen && <span className="text-sm font-medium">Logout</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
