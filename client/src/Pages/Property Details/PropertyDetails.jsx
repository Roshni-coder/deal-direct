import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  BanknotesIcon,
  HomeIcon,
  Square2StackIcon,
  TagIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserGroupIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
  CubeIcon,
  TruckIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  EyeIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid, StarIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import { useChat } from "../../context/ChatContext";

const API_BASE = import.meta.env.VITE_API_BASE;

import VisitModal from "../../Components/VisitModal/VisitModal";

const PropertyDetails = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { startConversation, openChat } = useChat();
  const [property, setProperty] = useState(state?.property || null);
  const [loading, setLoading] = useState(!state?.property);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);

  // ---- EMI Section States ----
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8);
  const [loanTenure, setLoanTenure] = useState(20);
  const [emi, setEmi] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  // ---- Scroll to top on page load ----
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [id]);

  // ---- Check if user is already interested ----
  useEffect(() => {
    const checkUserInterest = async () => {
      const token = localStorage.getItem("token");
      if (!token || !id) return;

      try {
        const res = await axios.get(`${API_BASE}/api/properties/interested/${id}/check`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setIsInterested(res.data.isInterested);
        }
      } catch (error) {
        console.error("Error checking interest status:", error);
      }
    };
    checkUserInterest();
  }, [id]);

  // ---- Fetch property and increment view ----
  useEffect(() => {
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
        if (!property) {
          setError("Error fetching property details");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showFullscreenGallery) {
        if (e.key === 'ArrowLeft') setActiveImage(prev => Math.max(0, prev - 1));
        if (e.key === 'ArrowRight') setActiveImage(prev => Math.min(imgs.length - 1, prev + 1));
        if (e.key === 'Escape') setShowFullscreenGallery(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFullscreenGallery]);

  const buildImageUrl = (img) => {
    if (!img) return "";
    const lower = img.toLowerCase();
    if (lower.startsWith("data:")) return img;
    if (lower.startsWith("http://") || lower.startsWith("https://")) return img;
    if (img.startsWith("/uploads")) return `${API_BASE}${img}`;
    return `${API_BASE}/uploads/${img}`;
  };

  // Combine regular images with categorized images
  const getAllImages = () => {
    const allImages = [];
    let hasCategorizedImages = false;

    // Add categorized images if available
    if (property?.categorizedImages) {
      const catImages = property.categorizedImages;

      // Check residential images
      if (catImages.residential) {
        Object.entries(catImages.residential).forEach(([category, images]) => {
          if (Array.isArray(images) && images.length > 0) {
            hasCategorizedImages = true;
            images.forEach(img => {
              if (img) allImages.push({ url: buildImageUrl(img), category: formatCategoryName(category) });
            });
          }
        });
      }

      // Check commercial images
      if (catImages.commercial) {
        Object.entries(catImages.commercial).forEach(([category, images]) => {
          if (Array.isArray(images) && images.length > 0) {
            hasCategorizedImages = true;
            images.forEach(img => {
              if (img) allImages.push({ url: buildImageUrl(img), category: formatCategoryName(category) });
            });
          }
        });
      }
    }

    // Add regular images ONLY if no categorized images found to avoid duplicates/generic "Gallery" label
    if (!hasCategorizedImages && property?.images?.length > 0) {
      property.images.forEach(img => allImages.push({ url: buildImageUrl(img), category: 'Gallery' }));
    }

    return allImages;
  };

  // Format category key to display name (e.g., "livingRoom" -> "Living Room")
  const formatCategoryName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const allPropertyImages = getAllImages();
  const imgs = allPropertyImages.length > 0
    ? allPropertyImages.map(item => item.url)
    : (property?.images || []).map(buildImageUrl);

  // Get current image category for display
  const currentImageCategory = allPropertyImages[activeImage]?.category || 'Gallery';

  // ---- EMI Calculation ----
  useEffect(() => {
    // Optional: Stop calculation if it's Rent, though hiding the UI is the main fix
    if (property?.listingType === "Rent") return;

    const P = loanAmount;
    const r = interestRate / 100 / 12;
    const n = loanTenure * 12;
    const emiCalc = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = emiCalc * n;
    setEmi(emiCalc);
    setTotalPayment(totalPay);
    setTotalInterest(totalPay - P);
  }, [loanAmount, interestRate, loanTenure, property]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading property details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <XMarkIcon className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-500 font-medium">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Go Back</button>
        </div>
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

  const isResidential = property.categoryName === "Residential" || property.category?.name === "Residential";
  const isCommercial = property.categoryName === "Commercial" || property.category?.name === "Commercial";
  const isRent = property.listingType === "Rent";
  const isSale = property.listingType === "Sell";

  // Helper function to get extra rooms
  const getExtraRooms = () => {
    const extras = [];
    if (property.extras?.servantRoom) extras.push("Servant Room");
    if (property.extras?.poojaRoom) extras.push("Pooja Room");
    if (property.extras?.studyRoom) extras.push("Study Room");
    if (property.extras?.storeRoom) extras.push("Store Room");
    return extras;
  };

  // Helper function to get commercial config details
  const getCommercialConfig = () => {
    const config = [];
    if (property.workstations) config.push({ label: "Workstations", value: property.workstations });
    if (property.conferenceRooms) config.push({ label: "Conference Rooms", value: property.conferenceRooms });
    if (property.cabins) config.push({ label: "Cabins", value: property.cabins });
    if (property.pantry) config.push({ label: "Pantry", value: property.pantry });
    if (property.frontage) config.push({ label: "Frontage", value: `${property.frontage} ft` });
    if (property.storage) config.push({ label: "Storage", value: property.storage });
    if (property.displayWindows) config.push({ label: "Display Windows", value: property.displayWindows });
    if (property.displayArea) config.push({ label: "Display Area", value: `${property.displayArea} sq.ft` });
    if (property.seatingCapacity) config.push({ label: "Seating Capacity", value: property.seatingCapacity });
    if (property.kitchenArea) config.push({ label: "Kitchen Area", value: `${property.kitchenArea} sq.ft` });
    if (property.barArea) config.push({ label: "Bar Area", value: property.barArea });
    if (property.outdoorSeating) config.push({ label: "Outdoor Seating", value: property.outdoorSeating });
    if (property.meetingRooms) config.push({ label: "Meeting Rooms", value: property.meetingRooms });
    if (property.privateCabins) config.push({ label: "Private Cabins", value: property.privateCabins });
    if (property.phoneBooths) config.push({ label: "Phone Booths", value: property.phoneBooths });
    if (property.loungeArea) config.push({ label: "Lounge Area", value: property.loungeArea });
    if (property.loadingDocks) config.push({ label: "Loading Docks", value: property.loadingDocks });
    if (property.ceilingHeight) config.push({ label: "Ceiling Height", value: `${property.ceilingHeight} ft` });
    if (property.floorLoadCapacity) config.push({ label: "Floor Load Capacity", value: `${property.floorLoadCapacity} kg/sq.ft` });
    if (property.powerConnection) config.push({ label: "Power Connection", value: `${property.powerConnection} kVA` });
    if (property.overheadCrane) config.push({ label: "Overhead Crane", value: property.overheadCrane });
    if (property.centralAC) config.push({ label: "Central AC", value: property.centralAC });
    if (property.powerBackup) config.push({ label: "Power Backup", value: property.powerBackup });
    return config;
  };

  const extraRooms = getExtraRooms();
  const commercialConfig = getCommercialConfig();

  const handleInterest = async () => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      toast.info("Please login to express interest in this property");
      navigate("/login", { state: { from: `/properties/${id}` } });
      return;
    }

    // Check if already interested
    if (isInterested) {
      toast.info("You have already expressed interest in this property");
      return;
    }

    setInterestLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/properties/interested/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setIsInterested(true);
        toast.success("Interest registered! The owner will be notified.");
      } else {
        toast.error(res.data.message || "Failed to register interest");
      }
    } catch (error) {
      console.error("Error registering interest:", error);
      const errorMsg = error.response?.data?.message || "Failed to register interest";
      toast.error(errorMsg);
    } finally {
      setInterestLoading(false);
    }
  };

  // Handle Chat with Owner
  const handleChatWithOwner = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || !user._id) {
      toast.info("Please login to chat with the owner");
      navigate("/login", { state: { from: `/properties/${id}` } });
      return;
    }

    // Get owner ID from property
    const ownerId = property.owner?._id || property.owner;

    // Check if property has an owner
    if (!ownerId) {
      toast.error("Unable to contact owner - no owner information available");
      return;
    }

    // Check if user is the owner
    if (user._id === ownerId) {
      toast.info("This is your own property");
      return;
    }

    setChatLoading(true);
    try {
      console.log("Starting conversation with:", { propertyId: property._id, ownerId });
      const conversation = await startConversation(property._id, ownerId);
      if (conversation) {
        openChat(conversation);
        toast.success("Chat started! You can now message the owner.");
      } else {
        toast.error("Failed to start conversation");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      const errorMessage = error.response?.data?.message || "Failed to start conversation";
      toast.error(errorMessage);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <VisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        propertyTitle={property?.title}
      />

      {/* Fullscreen Gallery Modal */}
      {showFullscreenGallery && (
        <div className="fixed inset-0 z-50 bg-black">
          <button
            onClick={() => setShowFullscreenGallery(false)}
            className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>

          <div className="h-full flex items-center justify-center">
            <button
              onClick={() => setActiveImage(prev => Math.max(0, prev - 1))}
              disabled={activeImage === 0}
              className="absolute left-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors disabled:opacity-30"
            >
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>

            <img
              src={imgs[activeImage]}
              alt=""
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />

            <button
              onClick={() => setActiveImage(prev => Math.min(imgs.length - 1, prev + 1))}
              disabled={activeImage === imgs.length - 1}
              className="absolute right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors disabled:opacity-30"
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm">
              {activeImage + 1} / {imgs.length} • {currentImageCategory}
            </span>
          </div>

          {/* Thumbnail strip */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-4xl overflow-x-auto pb-2 px-4">
            {imgs.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                onClick={() => setActiveImage(i)}
                className={`h-16 w-24 object-cover rounded cursor-pointer transition-all ${i === activeImage ? "ring-2 ring-white scale-105" : "opacity-60 hover:opacity-100"
                  }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hero Section with Images */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Main Image */}
          <div
            className="relative rounded-2xl overflow-hidden bg-gray-200 h-[400px] lg:h-[500px] cursor-pointer group"
            onClick={() => setShowFullscreenGallery(true)}
          >
            <img
              src={imgs[activeImage] || "https://via.placeholder.com/800x600?text=No+Image"}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-900 px-4 py-2 rounded-full text-sm font-medium transition-opacity">
                View Gallery ({imgs.length} photos)
              </span>
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg ${isRent ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
                }`}>
                For {property.listingType}
              </span>
              <span className="bg-white/95 backdrop-blur text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                {property.categoryName || property.category?.name}
              </span>
              {property.constructionStatus && property.constructionStatus !== "Ready to Move" && (
                <span className="bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                  {property.constructionStatus}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
                className="bg-white/95 backdrop-blur p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                {isFavorite ? (
                  <HeartIconSolid className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Property link copied!");
                }}
                className="bg-white/95 backdrop-blur p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <ShareIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Image category badge */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <span className="bg-black/70 backdrop-blur text-white text-sm px-3 py-1.5 rounded-full font-medium">
                {activeImage + 1} / {imgs.length}
              </span>
              <span className="bg-blue-600/90 backdrop-blur text-white text-sm px-3 py-1.5 rounded-full font-medium">
                {currentImageCategory}
              </span>
            </div>

            {/* Views badge */}
            {property.views > 0 && (
              <div className="absolute bottom-4 right-4">
                <span className="bg-white/95 backdrop-blur text-gray-700 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                  <EyeIcon className="w-4 h-4" /> {property.views} views
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Grid */}
          <div className="hidden lg:grid grid-cols-2 gap-3 h-[500px]">
            {imgs.slice(1, 5).map((img, i) => (
              <div
                key={i}
                onClick={() => { setActiveImage(i + 1); setShowFullscreenGallery(true); }}
                className="relative rounded-xl overflow-hidden cursor-pointer group bg-gray-200"
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {allPropertyImages[i + 1]?.category && (
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {allPropertyImages[i + 1].category}
                  </span>
                )}
                {i === 3 && imgs.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">+{imgs.length - 5} more</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Thumbnails */}
        {imgs.length > 1 && (
          <div className="lg:hidden flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            {imgs.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                onClick={() => setActiveImage(i)}
                className={`h-16 w-24 flex-shrink-0 object-cover rounded-lg cursor-pointer border-2 transition-all ${i === activeImage ? "border-blue-500 scale-105" : "border-transparent opacity-70"
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title & Price Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">
                    {property.title}
                  </h1>
                  <p className="flex items-center text-gray-600 text-lg">
                    <MapPinIcon className="w-5 h-5 mr-1.5 text-blue-600 flex-shrink-0" />
                    {property.locality || property.address?.area}, {property.city || property.address?.city}
                  </p>
                  {property.address?.landmark && (
                    <p className="text-sm text-gray-500 mt-1 ml-6">Near {property.address.landmark}</p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">
                    {isRent ? "Monthly Rent" : "Price"}
                  </p>
                  <p className="text-3xl md:text-4xl font-bold text-blue-600">
                    ₹{formattedPrice}
                  </p>
                  {isRent && property.deposit && (
                    <p className="text-sm text-gray-500 mt-1">
                      Deposit: ₹{Number(property.deposit).toLocaleString()}
                    </p>
                  )}
                  {isSale && property.bookingAmount && (
                    <p className="text-sm text-gray-500 mt-1">
                      Booking: ₹{Number(property.bookingAmount).toLocaleString()}
                    </p>
                  )}
                  {property.negotiable && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <CheckCircleIcon className="w-3 h-3" /> Negotiable
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">
                    {property.area?.builtUpSqft || property.builtUpArea || property.area?.carpetSqft || "-"}
                  </p>
                  <p className="text-xs text-gray-500 uppercase font-medium">Sq.ft</p>
                </div>
                {isResidential && (
                  <>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">{property.bedrooms || "-"}</p>
                      <p className="text-xs text-gray-500 uppercase font-medium">Bedrooms</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">{property.bathrooms || "-"}</p>
                      <p className="text-xs text-gray-500 uppercase font-medium">Bathrooms</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">{property.balconies || "-"}</p>
                      <p className="text-xs text-gray-500 uppercase font-medium">Balconies</p>
                    </div>
                  </>
                )}
                {isCommercial && (
                  <>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">{property.washrooms || "-"}</p>
                      <p className="text-xs text-gray-500 uppercase font-medium">Washrooms</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">{property.floorHeight || "-"}</p>
                      <p className="text-xs text-gray-500 uppercase font-medium">Floor Ht (ft)</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">{property.powerLoad || "-"}</p>
                      <p className="text-xs text-gray-500 uppercase font-medium">Power (kW)</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Property Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                <BuildingStorefrontIcon className="w-6 h-6 text-blue-600" />
                Property Overview
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailRow label="Property Type" value={property.propertyTypeName || property.propertyType?.name} />
                <DetailRow label="Category" value={property.categoryName || property.category?.name} />

                {isResidential && (
                  <>
                    <DetailRow label="BHK Configuration" value={property.bhk} />
                    <DetailRow label="Furnishing" value={property.furnishing} />
                    <DetailRow label="Floor" value={property.floorNo ? `${property.floorNo} of ${property.totalFloors || '?'}` : null} />
                    <DetailRow label="Facing" value={property.facing} />
                    <DetailRow label="Property Age" value={property.propertyAge} />
                    <DetailRow label="Construction Status" value={property.constructionStatus} />
                    <DetailRow label="Preferred Tenants" value={property.allowedFor} />
                    <DetailRow label="Pet Friendly" value={property.petFriendly} />
                  </>
                )}

                {isCommercial && (
                  <>
                    <DetailRow label="Commercial Type" value={property.commercialSubType} />
                    <DetailRow label="Washrooms" value={property.washrooms} />
                    <DetailRow label="Floor Height" value={property.floorHeight ? `${property.floorHeight} ft` : null} />
                    <DetailRow label="Power Load" value={property.powerLoad ? `${property.powerLoad} kW` : null} />
                    <DetailRow label="Loading Area" value={property.loadingArea} />
                    <DetailRow label="Dock Available" value={property.dockAvailable ? "Yes" : property.dockAvailable === false ? "No" : null} />
                    <DetailRow label="Shutters" value={property.shutters} />
                  </>
                )}

                <DetailRow
                  label="Parking"
                  value={
                    (property.parking?.covered || property.parking?.open)
                      ? `${property.parking?.covered ? `${property.parking.covered} Covered` : ""}${property.parking?.covered && property.parking?.open ? ", " : ""}${property.parking?.open ? `${property.parking.open} Open` : ""}`
                      : null
                  }
                />

                <DetailRow
                  label="Available From"
                  value={property.availableFrom ? new Date(property.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "Immediately"}
                />
              </div>
            </div>

            {/* Commercial Configuration */}
            {isCommercial && commercialConfig.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                  Space Configuration
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {commercialConfig.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-xl font-bold text-gray-900">{item.value}</p>
                      <p className="text-xs text-gray-500 uppercase font-medium mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dimensions & Pricing */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                <Square2StackIcon className="w-6 h-6 text-blue-600" />
                Dimensions & Pricing
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailRow label="Built-up Area" value={property.area?.builtUpSqft ? `${property.area.builtUpSqft} sq.ft` : null} />
                <DetailRow label="Carpet Area" value={property.area?.carpetSqft ? `${property.area.carpetSqft} sq.ft` : null} />
                <DetailRow label="Super Built-up" value={property.area?.superBuiltUpSqft ? `${property.area.superBuiltUpSqft} sq.ft` : null} />
                <DetailRow label="Plot Area" value={property.area?.plotSqft ? `${property.area.plotSqft} sq.ft` : null} />
                <DetailRow label="Price" value={`₹${formattedPrice}`} highlight />
                <DetailRow
                  label={isRent ? "Security Deposit" : "Booking Amount"}
                  value={property.deposit || property.bookingAmount ? `₹${Number(property.deposit || property.bookingAmount).toLocaleString()}` : null}
                />
                <DetailRow
                  label="Maintenance"
                  value={property.maintenanceIncluded ? "Included" : property.maintenance ? `₹${property.maintenance}/month` : null}
                />
                <DetailRow label="GST Applicable" value={property.gstApplicable} />
              </div>
            </div>

            {/* Extra Rooms */}
            {isResidential && extraRooms.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                  <CubeIcon className="w-6 h-6 text-blue-600" />
                  Additional Rooms
                </h2>
                <div className="flex flex-wrap gap-3">
                  {extraRooms.map((room, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4" />
                      {room}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {(property.amenities?.length > 0) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                  <SparklesIcon className="w-6 h-6 text-blue-600" />
                  Amenities & Features
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {property.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legal & Compliance */}
            {property.legal && (property.legal.reraId || property.legal.occupancyCertificate || property.legal.tradeLicense || property.legal.fireNoc) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                  Legal & Compliance
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.legal.reraId && (
                    <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-xl">
                      <span className="text-gray-600 font-medium">RERA ID</span>
                      <span className="font-bold text-green-700">{property.legal.reraId}</span>
                    </div>
                  )}
                  <LegalBadge label="Occupancy Certificate" value={property.legal.occupancyCertificate} />
                  {isCommercial && (
                    <>
                      <LegalBadge label="Trade License" value={property.legal.tradeLicense} />
                      <LegalBadge label="Fire NOC" value={property.legal.fireNoc} />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Video Tour */}
            {property.videoUrl && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                  <VideoCameraIcon className="w-6 h-6 text-blue-600" />
                  Video Tour
                </h2>
                <a
                  href={property.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <VideoCameraIcon className="w-5 h-5" />
                  Watch Video Walkthrough
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                <HomeIcon className="w-6 h-6 text-blue-600" />
                About This Property
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description || "No description provided for this property."}
              </p>
            </div>

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">

            {/* Contact Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              {/* Owner Info */}
              {property.owner && (
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    {property.owner.name?.charAt(0).toUpperCase() || "O"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{property.owner.name || "Property Owner"}</p>
                    <p className="text-sm text-gray-500">Owner</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleInterest}
                  disabled={interestLoading || isInterested}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed ${isInterested
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                >
                  {interestLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : isInterested ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5" /> Interest Registered
                    </>
                  ) : (
                    <>
                      <HeartIcon className="w-5 h-5" /> I'm Interested
                    </>
                  )}
                </button>

                {isInterested && (
                  <button
                    onClick={handleChatWithOwner}
                    disabled={chatLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold shadow-md transition-all active:scale-[0.98] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white disabled:opacity-70"
                  >
                    {chatLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Starting...
                      </>
                    ) : (
                      <>
                        <ChatBubbleLeftRightIcon className="w-5 h-5" /> Chat with Owner
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  <span>Posted {property.createdAt ? new Date(property.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "Recently"}</span>
                </div>
                {property.views > 0 && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                    <span>{property.views} people viewed this property</span>
                  </div>
                )}
              </div>
            </div>

            {/* EMI Calculator - Only for Sale */}
            {isSale && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                  <BanknotesIcon className="w-5 h-5 text-blue-600" />
                  EMI Calculator
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Loan Amount (₹)</label>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(+e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(+e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Years</label>
                      <input
                        type="number"
                        value={loanTenure}
                        onChange={(e) => setLoanTenure(+e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-gray-600 font-medium">Monthly EMI</span>
                    <span className="text-2xl font-bold text-blue-600">₹{emi.toFixed(0).toLocaleString()}</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Total Interest</span>
                      <span>₹{totalInterest.toFixed(0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount</span>
                      <span>₹{totalPayment.toFixed(0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Location Map */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <MapPinIcon className="w-5 h-5 text-blue-600" />
                Location
              </h2>

              <div className="rounded-xl overflow-hidden h-56 bg-gray-100 mb-4">
                {property.address?.latitude && property.address?.longitude ? (
                  <iframe
                    src={`https://www.google.com/maps?q=${property.address.latitude},${property.address.longitude}&z=15&output=embed`}
                    title="Property Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                ) : (
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      `${property.locality || property.address?.area || ""} ${property.city || property.address?.city || "India"}`
                    )}&output=embed`}
                    title="Property Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{property.address?.line || property.locality || property.address?.area}</span>
                  {property.city && <span>, {property.city}</span>}
                </p>

                {property.address?.landmark && (
                  <p className="text-sm text-gray-500">
                    Near {property.address.landmark}
                  </p>
                )}

                {property.address?.nearby && property.address.nearby.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Nearby Places</p>
                    <div className="flex flex-wrap gap-2">
                      {property.address.nearby.map((place, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{place}</span>
                      ))}
                    </div>
                  </div>
                )}

                {property.address?.latitude && property.address?.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${property.address.latitude},${property.address.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                  >
                    Open in Google Maps
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const DetailRow = ({ label, value, highlight = false }) => {
  if (!value || value === "N/A") return null;
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${highlight ? "text-blue-600 text-lg" : "text-gray-900"}`}>{value}</span>
    </div>
  );
};

const LegalBadge = ({ label, value }) => {
  if (value === undefined || value === null) return null;
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${value ? "bg-green-50" : "bg-gray-50"}`}>
      <span className="text-gray-600 font-medium">{label}</span>
      <span className={`font-bold ${value ? "text-green-700" : "text-gray-500"}`}>
        {value ? "Yes" : "No"}
      </span>
    </div>
  );
};

export default PropertyDetails;