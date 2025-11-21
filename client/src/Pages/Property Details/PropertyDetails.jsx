import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import {
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  HomeIcon,
  Square2StackIcon,
  TagIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE;

import VisitModal from "../../Components/VisitModal/VisitModal";

const PropertyDetails = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const [property, setProperty] = useState(state?.property || null);
  const [loading, setLoading] = useState(!state?.property);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);

  // ---- EMI Section States ----
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8);
  const [loanTenure, setLoanTenure] = useState(20);
  const [emi, setEmi] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  // ---- Fetch property ----
  useEffect(() => {
    if (property) return;

    const fetchProperty = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/properties/${id}`);
        if (res.data) {
          setProperty(res.data);
        } else {
          setError("Property not found");
        }
      } catch (error) {
        console.error(error);
        setError("Error fetching property details");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, property]);

  const buildImageUrl = (img) => {
    if (!img) return "";
    const lower = img.toLowerCase();
    if (lower.startsWith("data:")) return img;
    if (lower.startsWith("http://") || lower.startsWith("https://")) return img;
    if (img.startsWith("/uploads")) return `${API_BASE}${img}`;
    return `${API_BASE}/uploads/${img}`;
  };

  const imgs = (property?.images || []).map(buildImageUrl);

  // ---- EMI Calculation ----
  useEffect(() => {
    const P = loanAmount;
    const r = interestRate / 100 / 12;
    const n = loanTenure * 12;
    const emiCalc = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = emiCalc * n;
    setEmi(emiCalc);
    setTotalPayment(totalPay);
    setTotalInterest(totalPay - P);
  }, [loanAmount, interestRate, loanTenure]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        Loading property details...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  if (!property)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Property not found
      </div>
    );

  const price = property.price || property.expectedPrice || 0;
  const formattedPrice = Number(price).toLocaleString();
  const whatsappNumber = property.contact?.phone
    ? `91${property.contact.phone.replace(/\D/g, "")}`
    : "919876543210";
  const message = `Hi, I'm interested in "${property.title}" located in ${property.city || property.address?.city || ""
    }. Please share more details.`;

  const handleInterest = () => {
    toast.success("Interest registered! The owner will contact you shortly.");
  };

  const handleVisit = () => {
    setIsVisitModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 mt-20 font-sans">
      <VisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        propertyTitle={property?.title}
      />

      {/* ... rest of the component ... */}
      {/* ---- Images Section ---- */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/5">
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-100 h-[500px]">
            <img
              src={imgs[activeImage] || buildImageUrl(property.image) || "https://via.placeholder.com/800x600?text=No+Image"}
              alt={property.title}
              className="w-full h-full object-cover"
            />

            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="bg-white p-3 rounded-full shadow-md hover:scale-110 transition"
              >
                {isFavorite ? (
                  <HeartIconSolid className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Property link copied!");
                }}
                className="bg-white p-3 rounded-full shadow-md hover:scale-110 transition"
              >
                <ShareIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Image counter */}
            <div className="absolute bottom-4 left-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
              {activeImage + 1} / {imgs.length || 1}
            </div>
          </div>

          {/* Thumbnails */}
          {imgs.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {imgs.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setActiveImage(i)}
                  className={`h-24 w-32 object-cover rounded-xl cursor-pointer border-2 flex-shrink-0 ${i === activeImage
                    ? "border-red-500 scale-105"
                    : "border-transparent hover:border-red-300"
                    } transition-all`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ---- Property Info Header ---- */}
        <div className="lg:w-2/5 flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                {property.listingType || "For Sale"}
              </span>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                {property.propertyCategory || "Property"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
              {property.title}
            </h1>
            <p className="flex items-center text-gray-600 text-lg">
              <MapPinIcon className="w-5 h-5 mr-1 text-red-500 flex-shrink-0" />
              {property.locality || property.address?.area}, {property.city || property.address?.city}
            </p>
          </div>

          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-1">Price</p>
            <p className="text-4xl font-bold text-red-600">
              ₹{formattedPrice}
            </p>
            {property.maintenance && (
              <p className="text-sm text-gray-500 mt-1">
                + ₹{property.maintenance} Maintenance/mo
              </p>
            )}
          </div>

          {/* Key Highlights Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold">Area</p>
              <p className="font-bold text-gray-800 text-lg">
                {property.builtUpArea || property.area?.totalSqft || "N/A"} <span className="text-sm font-normal text-gray-500">sq.ft</span>
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold">Configuration</p>
              <p className="font-bold text-gray-800 text-lg">
                {property.bhkType || property.propertyType?.name || property.propertyType || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold">Furnishing</p>
              <p className="font-bold text-gray-800 text-lg">
                {property.furnishing || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold">Available From</p>
              <p className="font-bold text-gray-800 text-lg">
                {property.availableFrom ? new Date(property.availableFrom).toLocaleDateString() : "Ready to Move"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleInterest}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold shadow-md transition transform active:scale-95"
              >
                <HeartIcon className="w-5 h-5" /> I'm Interested
              </button>
              <button
                onClick={handleVisit}
                className="flex items-center justify-center gap-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl font-bold shadow-sm transition transform active:scale-95"
              >
                <CalendarDaysIcon className="w-5 h-5" /> Reserve a Visit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-bold shadow-md transition transform active:scale-95"
              >
                <ChatBubbleLeftIcon className="w-5 h-5" /> WhatsApp
              </a>
              <a
                href={`tel:${property.contact?.phone || ""}`}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold shadow-md transition transform active:scale-95"
              >
                <PhoneIcon className="w-5 h-5" /> Call Owner
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Detailed Info Sections ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">

        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">

          {/* Overview */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
              <BuildingStorefrontIcon className="w-6 h-6 text-red-600" /> Property Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Project / Society</span>
                <span className="font-semibold text-gray-900">{property.locality || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Property Type</span>
                <span className="font-semibold text-gray-900">{property.propertyType?.name || property.propertyType || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">BHK Configuration</span>
                <span className="font-semibold text-gray-900">{property.bhkType || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Balconies</span>
                <span className="font-semibold text-gray-900">{property.balconies || 0}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Bathrooms</span>
                <span className="font-semibold text-gray-900">{property.bathrooms || 1}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Washrooms</span>
                <span className="font-semibold text-gray-900">{property.washrooms || 0}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Parking</span>
                <span className="font-semibold text-gray-900">{property.parking?.type || "Available"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Ownership</span>
                <span className="font-semibold text-gray-900">Freehold</span>
              </div>
            </div>
          </div>

          {/* Dimensions & Pricing */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
              <Square2StackIcon className="w-6 h-6 text-red-600" /> Dimensions & Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Built-up Area</span>
                <span className="font-semibold text-gray-900">{property.builtUpArea || "N/A"} sq.ft</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Carpet Area</span>
                <span className="font-semibold text-gray-900">{property.carpetArea || "N/A"} sq.ft</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Expected Price</span>
                <span className="font-semibold text-gray-900">₹{formattedPrice}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Booking/Token Amount</span>
                <span className="font-semibold text-gray-900">₹{property.expectedDeposit || "0"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Maintenance Charges</span>
                <span className="font-semibold text-gray-900">₹{property.maintenance || "0"} / month</span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {property.selectedAmenities && property.selectedAmenities.length > 0 && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                <TagIcon className="w-6 h-6 text-red-600" /> Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.selectedAmenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="capitalize">{amenity.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900">
              <HomeIcon className="w-6 h-6 text-red-600" /> About Property
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description || "No description provided."}
            </p>
          </div>

        </div>

        {/* Right Column: Tools & Map */}
        <div className="space-y-8">

          {/* EMI Calculator */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
              <BanknotesIcon className="w-6 h-6 text-red-600" /> EMI Calculator
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loan Amount (₹)</label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(+e.target.value)}
                  className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(+e.target.value)}
                    className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Years</label>
                  <input
                    type="number"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(+e.target.value)}
                    className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-end mb-2">
                <span className="text-gray-500 font-medium">Monthly EMI</span>
                <span className="text-2xl font-bold text-red-600">₹{emi.toFixed(0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Total Interest</span>
                <span>₹{totalInterest.toFixed(0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Total Amount</span>
                <span>₹{totalPayment.toFixed(0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
              <MapPinIcon className="w-6 h-6 text-red-600" /> Location
            </h2>
            <div className="rounded-xl overflow-hidden h-64 bg-gray-100">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  property.locality || property.address?.area || property.city || property.address?.city || "India"
                )}&output=embed`}
                title="Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {property.landmark && `Near ${property.landmark}, `}
              {property.locality || property.address?.area}, {property.city || property.address?.city}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
