import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import AddProperty from "./pages/AddProperty";
import AddCategory from "./pages/AddCategory";
import AddSubCategory from "./pages/AddSubCategory";
import AllClients from "./pages/AllClients";
import AllProperty from "./pages/AllProperty";
import AllCategory from "./pages/AllCategory";
import AdminLogin from "./pages/AdminLogin";
import LeadMonitoring from "./pages/LeadMonitoring";
import BuilderVerification from "./pages/BuilderVerification";
import BuilderProjects from "./pages/BuilderProjects";

const getStoredAdminInfo = () => {
  try {
    const stored = localStorage.getItem("adminInfo");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to parse adminInfo", error);
    return null;
  }
};

// ✅ Protected Route Component
const ProtectedRoute = ({ children, allowEnvAgent = true }) => {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/admin/login" replace />;

  const adminInfo = getStoredAdminInfo();
  if (adminInfo?.isEnvAgent && !allowEnvAgent) {
    return <Navigate to="/add-property" replace />;
  }

  return children;
};

const Layout = ({ isSidebarOpen, toggleSidebar, children }) => {
  const location = useLocation();

  // ✅ Hide header + sidebar on login page
  const isLoginPage = location.pathname === "/admin/login";

  return (
    <div className="h-screen flex flex-col font-sans text-gray-800 bg-gray-50">
      {/* Header */}
      {!isLoginPage && (
        <header className="w-full shadow bg-white">
          <Header toggleSidebar={toggleSidebar} />
        </header>
      )}

      {/* Main content area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {!isLoginPage && (
          <aside
            className={`bg-white shadow-md transition-all duration-300 ease-in-out`}
            style={{ width: isSidebarOpen ? "20%" : "5%" }}
          >
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          </aside>
        )}
        
        {/* footer */}
        <main
          className={`transition-all duration-300 ease-in-out overflow-auto p-6`}
          style={{ width: !isLoginPage && isSidebarOpen ? "80%" : "100%" }}
        >
          {children}
          {/* Footer */}
          {!isLoginPage && (
            <footer className="mt-10 border-t border-gray-200 pt-6 pb-4 text-center text-sm text-gray-500">
              <div className="flex flex-col items-center justify-center space-y-2">
                <p className="flex items-center space-x-2">
                  <span>
                    © {new Date().getFullYear()}{" "}
                    <strong className="text-blue-600">PropDeal</strong> Admin
                    Panel
                  </span>
                </p>
                <div className="flex items-center space-x-4 text-gray-400 text-xs">
                  <span>Built with ❤️ using React & Tailwind CSS</span>
                </div>
              </div>
            </footer>
          )}
        </main> 
      </div>
    </div>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <Router>
      <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
        <Routes>
          {/* Public Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowEnvAgent={false}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-property"
            element={
              <ProtectedRoute allowEnvAgent>
                <AddProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lead-monitoring"
            element={
              <ProtectedRoute allowEnvAgent>
                <LeadMonitoring />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-category"
            element={
              <ProtectedRoute allowEnvAgent={false}>
                <AddCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-subcategory"
            element={
              <ProtectedRoute allowEnvAgent={false}>
                <AddSubCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-owners"
            element={
              <ProtectedRoute allowEnvAgent={false}>
                <BuilderVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owners-projects"
            element={
              <ProtectedRoute allowEnvAgent={false}>
                <BuilderProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-clients"
            element={
              <ProtectedRoute allowEnvAgent={false}>
                <AllClients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-properties"
            element={
              <ProtectedRoute allowEnvAgent={false}>
                <AllProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-category"
            element={
              <ProtectedRoute allowEnvAgent={false}>
                <AllCategory />
              </ProtectedRoute>
            }
          />

          {/* Redirect all other routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
