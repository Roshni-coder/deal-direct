import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../src/Components/Navbar/Navbar.jsx";
import Home from "./Pages/Home/Home.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import PropertyPage from "./Pages/PropertyList/PropertyList.jsx";
import PropertyDetails from "./Pages/Property Details/PropertyDetails.jsx";
import Login from "./Pages/Login/Login.jsx";
import Register from "./Pages/Register/Register.jsx";
import About from "./Pages/About/About.jsx";
import Contact from "./Pages/Contact/Contact.jsx";
import SampleAgreement from "./Components/SampleAgreement/SampleAgreement.jsx";
import AddProperty from "./Pages/AddProperty/AddProperty.jsx";
import EditProperty from "./Pages/EditProperty/EditProperty.jsx";
import Profile from "./Pages/Profile/Profile.jsx";
import MyProperties from "./Pages/MyProperties/MyProperties.jsx";
import SavedProperties from "./Pages/SavedProperties/SavedProperties.jsx";
import ScrollToTop from "./Components/ScrollToTop/ScrollToTop.jsx";

function App() {
  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-white">
      <Router>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/properties" element={<PropertyPage />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Register />} />
          <Route path="/agreements" element={<SampleAgreement />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/edit-property/:id" element={<EditProperty />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-properties" element={<MyProperties />} />
          <Route path="/saved-properties" element={<SavedProperties />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
