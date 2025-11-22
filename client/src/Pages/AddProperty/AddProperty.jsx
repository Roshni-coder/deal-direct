import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Home, MapPin, IndianRupee, Layers, Image as ImageIcon, Calendar,
    ChevronLeft, Upload, Check, X, Building2,
    Wifi, Car, Zap, Shield, Utensils, LandPlot, Store, ArrowRight
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
    { id: 1, label: "Category & Type", icon: <Home size={20} />, description: "Property basics" },
    { id: 2, label: "Location", icon: <MapPin size={20} />, description: "Address details" },
    { id: 3, label: "Pricing & Area", icon: <IndianRupee size={20} />, description: "Value & size" },
    { id: 4, label: "Features", icon: <Layers size={20} />, description: "Amenities & more" },
    { id: 5, label: "Photos", icon: <ImageIcon size={20} />, description: "Visual appeal" },
    { id: 6, label: "Review", icon: <Calendar size={20} />, description: "Final check" },
];

const PROPERTY_CATEGORIES = {
    Residential: {
        icon: <Home size={32} />,
        types: ["Apartment", "Independent House", "Villa", "Studio Apartment", "Penthouse"],
        desc: "Homes for living"
    },
    Commercial: {
        icon: <Store size={32} />,
        types: ["Office Space", "Shop / Showroom", "Warehouse/Godown", "Co-working", "Industrial Shed"],
        desc: "Business spaces"
    },
    Plot: {
        icon: <LandPlot size={32} />,
        types: ["Residential Plot", "Commercial Land", "Industrial Land", "Agricultural Land"],
        desc: "Land for development"
    }
};

const AMENITIES_LIST = [
    { id: "gym", label: "Gymnasium", icon: <Zap size={20} /> },
    { id: "parking", label: "Parking", icon: <Car size={20} /> },
    { id: "security", label: "24x7 Security", icon: <Shield size={20} /> },
    { id: "wifi", label: "Internet/Wifi", icon: <Wifi size={20} /> },
    { id: "cafeteria", label: "Cafeteria", icon: <Utensils size={20} /> },
    { id: "powerBackup", label: "Power Backup", icon: <Zap size={20} /> },
    { id: "lift", label: "Lift", icon: <Building2 size={20} /> },
];

const variants = {
    enter: (direction) => ({
        x: direction > 0 ? 20 : -20,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        x: direction < 0 ? 20 : -20,
        opacity: 0,
    }),
};

const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

export default function AddProperty() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);

    const [metadata, setMetadata] = useState({
        categories: [],
        subcategories: [],
        propertyTypes: []
    });

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [cats, subs, types] = await Promise.all([
                    axios.get("http://localhost:9000/api/categories/list-category"),
                    axios.get("http://localhost:9000/api/subcategories/list"),
                    axios.get("http://localhost:9000/api/propertyTypes/list-propertytype")
                ]);

                const categoryData = Array.isArray(cats.data) ? cats.data : [];
                const subData = Array.isArray(subs.data) ? subs.data : [];
                const typeData = Array.isArray(types.data) ? types.data : [];

                setMetadata({
                    categories: categoryData,
                    subcategories: subData,
                    propertyTypes: typeData
                });
            } catch (error) {
                console.error("Failed to fetch metadata", error);
            }
        };
        fetchMetadata();
    }, []);

    const [formData, setFormData] = useState({
        listingType: "Rent",
        propertyCategory: "Residential",
        propertyType: "Apartment",
        bhkType: "",
        city: "",
        locality: "",
        landmark: "",
        address: "",
        builtUpArea: "",
        carpetArea: "",
        expectedPrice: "",
        expectedDeposit: "",
        maintenance: "",
        availableFrom: new Date().toISOString().split('T')[0],
        furnishing: "Unfurnished",
        bathrooms: 1,
        balconies: 0,
        washrooms: 1,
        selectedAmenities: [],
        description: "",
    });

    const isResidential = formData.propertyCategory === "Residential";
    const isCommercial = formData.propertyCategory === "Commercial";
    const isPlot = formData.propertyCategory === "Plot";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (category) => {
        const defaultType = PROPERTY_CATEGORIES[category].types[0];
        setFormData(prev => ({
            ...prev,
            propertyCategory: category,
            propertyType: defaultType,
            bhkType: category === "Residential" ? prev.bhkType : "",
        }));
    };

    const handleAmenityToggle = (id) => {
        setFormData(prev => {
            const current = prev.selectedAmenities;
            return {
                ...prev,
                selectedAmenities: current.includes(id)
                    ? current.filter(item => item !== id)
                    : [...current, id]
            };
        });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 10) return toast.error("Maximum 10 images allowed");
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...files]);
        setPreviewImages(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const validateStep = (step) => {
        const { propertyType, bhkType, city, locality, expectedPrice, builtUpArea } = formData;

        switch (step) {
            case 1:
                if (!propertyType) return "Please select Property Type.";
                if (isResidential && !bhkType) return "Please select BHK Configuration.";
                break;
            case 2:
                if (!city || !locality) return "City and Locality are required.";
                break;
            case 3:
                if (!expectedPrice) return "Expected Price/Rent is required.";
                if (!builtUpArea) return isPlot ? "Plot Area is required." : "Built-up Area is required.";
                break;
            case 5:
                if (images.length < 1) return "Please upload at least 1 photo.";
                break;
            default:
                break;
        }
        return null;
    };

    const handleNext = () => {
        const error = validateStep(currentStep);
        if (error) return toast.error(error);
        setDirection(1);
        setCurrentStep(prev => Math.min(prev + 1, 6));
    };

    const handlePrev = () => {
        setDirection(-1);
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const matchedPropertyType = metadata.propertyTypes.find(
                t => t.name.toLowerCase() === formData.propertyCategory.toLowerCase()
            ) || metadata.propertyTypes[0];

            const matchedCategory = metadata.categories.find(
                c => c.name.toLowerCase() === formData.propertyType.toLowerCase()
            ) || metadata.categories[0];

            const matchedSubcategory = metadata.subcategories.find(
                s => s.name.toLowerCase() === formData.bhkType.toLowerCase()
            );

            const submitData = new FormData();

            submitData.append("propertyType", matchedPropertyType?._id || "");
            submitData.append("category", matchedCategory?._id || "");
            if (matchedSubcategory) {
                submitData.append("subcategory", matchedSubcategory._id);
            }

            const title = `${formData.bhkType ? formData.bhkType + ' ' : ''}${formData.propertyType} for ${formData.listingType} in ${formData.locality}`;
            submitData.append("title", title);
            submitData.append("description", formData.description);
            submitData.append("price", formData.expectedPrice);
            submitData.append("priceUnit", "Total");
            submitData.append("listingType", formData.listingType);

            const areaData = {
                totalSqft: formData.builtUpArea,
                builtUpSqft: formData.builtUpArea,
                carpetSqft: formData.carpetArea,
                pricePerSqft: Math.round(Number(formData.expectedPrice) / Number(formData.builtUpArea)) || 0
            };
            submitData.append("area", JSON.stringify(areaData));

            const addressData = {
                city: formData.city,
                area: formData.locality,
                state: "",
                pincode: "",
                line: formData.address,
                landmark: formData.landmark
            };
            submitData.append("address", JSON.stringify(addressData));

            const featuresData = {
                furnishing: formData.furnishing,
                bathrooms: formData.bathrooms,
                balconies: formData.balconies,
                washrooms: formData.washrooms,
                amenities: formData.selectedAmenities,
                availableFrom: formData.availableFrom,
                deposit: formData.expectedDeposit,
                maintenance: formData.maintenance,
                bhk: formData.bhkType
            };
            submitData.append("features", JSON.stringify(featuresData));

            const parkingData = {
                covered: formData.selectedAmenities.includes('parking') ? "Available" : "None",
                open: ""
            };
            submitData.append("parking", JSON.stringify(parkingData));

            images.forEach(file => {
                submitData.append("images", file);
            });

            if (images.length > 0) {
                const inlineImages = await Promise.all(images.map(fileToBase64));
                submitData.append("inlineImages", JSON.stringify(inlineImages));
            }

            const token = localStorage.getItem("token");

            await axios.post("http://localhost:9000/api/properties/add", submitData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: token ? `Bearer ${token}` : ""
                }
            });

            toast.success("Property published successfully!");
            navigate("/");

        } catch (error) {
            console.error("Submission failed", error);
            toast.error(error.response?.data?.message || "Failed to publish property");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Basics</h2>
                <p className="text-slate-500 mt-2">Let's start with the essentials.</p>
            </div>
            <div className="flex justify-center mb-8">
                <div className="bg-slate-100 p-1 rounded-2xl inline-flex">
                    {["Rent", "Sell"].map(type => (
                        <button
                            key={type}
                            onClick={() => setFormData(p => ({ ...p, listingType: type }))}
                            className={`px-12 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${formData.listingType === type
                                ? "bg-white text-blue-600 shadow-md scale-100"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Property Category</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(PROPERTY_CATEGORIES).map(([key, value]) => (
                        <div
                            key={key}
                            onClick={() => handleCategoryChange(key)}
                            className={`cursor-pointer relative overflow-hidden rounded-2xl p-6 flex flex-col items-center gap-4 transition-all duration-300 group ${formData.propertyCategory === key
                                ? "bg-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.02]"
                                : "bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg"
                                }`}
                        >
                            <div className={`p-4 rounded-full transition-colors ${formData.propertyCategory === key ? "bg-white/20" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"}`}>
                                {value.icon}
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">{key}</h3>
                                <p className={`text-xs mt-1 ${formData.propertyCategory === key ? "text-blue-100" : "text-slate-400"}`}>{value.desc}</p>
                            </div>
                            {formData.propertyCategory === key && (
                                <div className="absolute top-3 right-3">
                                    <Check className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Property Type</label>
                <div className="flex flex-wrap gap-3">
                    {PROPERTY_CATEGORIES[formData.propertyCategory].types.map(type => (
                        <button
                            key={type}
                            onClick={() => setFormData(p => ({ ...p, propertyType: type }))}
                            className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${formData.propertyType === type
                                ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-105"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
            {isResidential && (
                <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">BHK Configuration</label>
                    <div className="flex flex-wrap gap-3">
                        {["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"].map(bhk => (
                            <button
                                key={bhk}
                                onClick={() => setFormData(p => ({ ...p, bhkType: bhk }))}
                                className={`px-6 py-3 rounded-xl border text-sm font-bold transition-all duration-200 ${formData.bhkType === bhk
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:text-blue-600"
                                    }`}
                            >
                                {bhk}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Location</h2>
                <p className="text-slate-500 mt-2">Help potential buyers find your property.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-slate-50 focus:bg-white" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Locality / Society</label>
                    <input type="text" name="locality" value={formData.locality} onChange={handleChange} placeholder="e.g. Bandra West" className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-slate-50 focus:bg-white" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Street / Landmark</label>
                <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="e.g. Near City Mall" className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-slate-50 focus:bg-white" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Address (Optional)</label>
                <textarea name="address" rows="3" value={formData.address} onChange={handleChange} placeholder="Enter full address..." className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-slate-50 focus:bg-white resize-none" />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Pricing & Dimensions</h2>
                <p className="text-slate-500 mt-2">Define the value and size of your property.</p>
            </div>
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        {formData.listingType === "Rent" ? "Expected Monthly Rent" : "Total Expected Price"}
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 font-bold text-xl">₹</div>
                        <input type="number" name="expectedPrice" value={formData.expectedPrice} onChange={handleChange} placeholder="0.00" className="w-full pl-12 pr-5 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none text-2xl font-bold text-slate-900 bg-white" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Maintenance (Monthly)</label>
                        <input type="number" name="maintenance" value={formData.maintenance} onChange={handleChange} placeholder="₹ 0" className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none bg-white" />
                    </div>
                    {formData.listingType === "Rent" && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Security Deposit</label>
                            <input type="number" name="expectedDeposit" value={formData.expectedDeposit} onChange={handleChange} placeholder="₹ 0" className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none bg-white" />
                        </div>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        {isPlot ? "Plot Area" : "Built-up Area"}
                    </label>
                    <div className="relative">
                        <input type="number" name="builtUpArea" value={formData.builtUpArea} onChange={handleChange} placeholder="e.g. 1200" className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none bg-slate-50 focus:bg-white" />
                        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-slate-400 font-medium">sq.ft</div>
                    </div>
                </div>
                {!isPlot && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Carpet Area</label>
                        <div className="relative">
                            <input type="number" name="carpetArea" value={formData.carpetArea} onChange={handleChange} placeholder="e.g. 900" className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none bg-slate-50 focus:bg-white" />
                            <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-slate-400 font-medium">sq.ft</div>
                        </div>
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Available From</label>
                <input type="date" name="availableFrom" value={formData.availableFrom} onChange={handleChange} className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-blue-600 outline-none bg-slate-50 focus:bg-white" />
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Features & Amenities</h2>
                <p className="text-slate-500 mt-2">What makes your property special?</p>
            </div>
            {!isPlot && (
                <div className="flex flex-wrap gap-6 justify-center">
                    {isResidential && (
                        <>
                            {[{ l: "Bathrooms", k: "bathrooms" }, { l: "Balconies", k: "balconies" }].map(item => (
                                <div key={item.k} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center w-36 transition-all hover:shadow-md hover:border-blue-200">
                                    <span className="text-slate-500 text-sm mb-3 font-medium">{item.l}</span>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setFormData(p => ({ ...p, [item.k]: Math.max(0, p[item.k] - 1) }))} className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors font-bold text-lg">-</button>
                                        <span className="font-bold text-2xl text-slate-900">{formData[item.k]}</span>
                                        <button onClick={() => setFormData(p => ({ ...p, [item.k]: p[item.k] + 1 }))} className="w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center transition-colors font-bold text-lg shadow-lg shadow-blue-200">+</button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                    {isCommercial && (
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center w-36">
                            <span className="text-slate-500 text-sm mb-3 font-medium">Washrooms</span>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setFormData(p => ({ ...p, washrooms: Math.max(0, p.washrooms - 1) }))} className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors font-bold text-lg">-</button>
                                <span className="font-bold text-2xl text-slate-900">{formData.washrooms}</span>
                                <button onClick={() => setFormData(p => ({ ...p, washrooms: p.washrooms + 1 }))} className="w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center transition-colors font-bold text-lg shadow-lg shadow-blue-200">+</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {!isPlot && (
                <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Furnishing Status</label>
                    <div className="grid grid-cols-3 gap-4">
                        {["Unfurnished", "Semi-Furnished", "Fully Furnished"].map(opt => (
                            <button
                                key={opt}
                                onClick={() => setFormData(p => ({ ...p, furnishing: opt }))}
                                className={`py-4 text-sm font-bold rounded-xl border transition-all duration-200 ${formData.furnishing === opt ? "bg-blue-50 border-blue-600 text-blue-800 ring-1 ring-blue-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {!isPlot && (
                <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Amenities</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {AMENITIES_LIST.map(am => (
                            <div
                                key={am.id}
                                onClick={() => handleAmenityToggle(am.id)}
                                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${formData.selectedAmenities.includes(am.id)
                                    ? "bg-green-50 border-green-500 text-green-900 shadow-sm"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                            >
                                <div className={`${formData.selectedAmenities.includes(am.id) ? "text-green-600" : "text-slate-400"}`}>
                                    {am.icon}
                                </div>
                                <span className="text-sm font-medium">{am.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea name="description" rows="5" placeholder="Tell us more about the property (e.g. nearby schools, parks, etc.)" value={formData.description} onChange={handleChange} className="w-full p-5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none resize-none bg-slate-50 focus:bg-white transition-all" />
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Add Photos</h2>
                <p className="text-slate-500 mt-2">High quality photos increase engagement by 5x.</p>
            </div>
            <div className="border-3 border-dashed border-blue-200 bg-blue-50/30 rounded-3xl h-64 flex flex-col items-center justify-center relative group hover:bg-blue-50 transition-all duration-300 cursor-pointer">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="bg-white p-5 rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="text-blue-600" size={32} />
                </div>
                <p className="font-bold text-lg text-blue-900">Click to upload photos</p>
                <p className="text-sm text-blue-500 mt-1">or drag and drop here (Max 10)</p>
            </div>
            {previewImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fadeIn">
                    {previewImages.map((src, index) => (
                        <div key={index} className="relative group rounded-2xl overflow-hidden aspect-square shadow-md bg-slate-100 border border-slate-200">
                            <img src={src} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-white text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all shadow-sm transform translate-y-2 group-hover:translate-y-0"><X size={16} /></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderStep6 = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Review & Publish</h2>
                <p className="text-slate-500 mt-2">Preview your listing before it goes live.</p>
            </div>
            <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 transform transition-all hover:scale-[1.01]">
                <div className="h-64 bg-slate-200 relative">
                    {previewImages.length > 0 ? (
                        <img src={previewImages[0]} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                            <ImageIcon size={48} className="opacity-20" />
                        </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm text-slate-900 uppercase tracking-wide">{formData.listingType}</span>
                        <span className="bg-slate-900/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide">{formData.propertyCategory}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-20">
                        <h3 className="text-3xl font-bold text-white">₹ {parseInt(formData.expectedPrice).toLocaleString()}</h3>
                        <p className="text-white/90 font-medium">{formData.propertyType} {isResidential ? `• ${formData.bhkType}` : ""}</p>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-start gap-3 text-slate-600">
                        <MapPin className="shrink-0 mt-1 text-blue-600" size={18} />
                        <div>
                            <p className="font-semibold text-slate-900">{formData.locality}, {formData.city}</p>
                            <p className="text-sm text-slate-500">{formData.landmark}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-100">
                        <div className="flex items-center gap-2 text-slate-700">
                            <LandPlot size={18} className="text-blue-600" />
                            <span className="font-medium">{formData.builtUpArea} <span className="text-slate-400 text-sm font-normal">sq.ft</span></span>
                        </div>
                        {!isPlot && (
                            <div className="flex items-center gap-2 text-slate-700">
                                <Layers size={18} className="text-blue-600" />
                                <span className="font-medium">{formData.furnishing}</span>
                            </div>
                        )}
                        {isResidential && (
                            <div className="flex items-center gap-2 text-slate-700">
                                <Building2 size={18} className="text-blue-600" />
                                <span className="font-medium">{formData.bathrooms} Bathrooms</span>
                            </div>
                        )}
                    </div>
                    {formData.selectedAmenities.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-slate-900 mb-3">Amenities</p>
                            <div className="flex flex-wrap gap-2">
                                {formData.selectedAmenities.slice(0, 5).map(id => {
                                    const am = AMENITIES_LIST.find(a => a.id === id);
                                    return am ? (
                                        <span key={id} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">{am.label}</span>
                                    ) : null;
                                })}
                                {formData.selectedAmenities.length > 5 && (
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">+{formData.selectedAmenities.length - 5} more</span>
                                )}
                            </div>
                        </div>
                    )}
                    <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                        {isLoading ? "Publishing..." : <>Confirm & Publish <Check size={20} /></>}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 selection:bg-blue-100 pt-20">
            <aside className="hidden md:flex flex-col w-80 bg-white border-r border-slate-200 h-[calc(100vh-5rem)] sticky top-20 p-6 pt-8 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-y-auto">
                <nav className="space-y-2 flex-1">
                    {STEPS.map((step) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        return (
                            <div key={step.id} className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
                                <div className={`relative z-10 transition-colors ${isActive ? "text-blue-600" : isCompleted ? "text-green-500" : "text-slate-400 group-hover:text-slate-600"}`}>
                                    {isCompleted ? <Check size={20} strokeWidth={3} /> : step.icon}
                                </div>
                                <div className="flex flex-col relative z-10">
                                    <span className={`font-bold text-sm ${isActive ? "text-blue-900" : "text-slate-700"}`}>{step.label}</span>
                                    <span className="text-xs opacity-70 font-medium">{step.description}</span>
                                </div>
                                {isActive && <motion.div layoutId="activeStep" className="absolute inset-0 bg-blue-50 rounded-2xl" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-l-full" />}
                            </div>
                        );
                    })}
                </nav>
                <div className="mt-auto pt-8 border-t border-slate-100">
                    <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-20 -mr-10 -mt-10"></div>
                        <h4 className="font-bold relative z-10">Need Help?</h4>
                        <p className="text-xs text-slate-400 mt-1 relative z-10 mb-3">Contact our support team for assistance.</p>
                        <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors w-full text-left">Contact Support &rarr;</button>
                    </div>
                </div>
            </aside>
            <div className="md:hidden bg-white p-4 sticky top-20 z-30 border-b border-slate-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg"><Home className="text-white" size={16} /></div>
                    <span className="font-bold text-slate-900">Step {currentStep}</span>
                </div>
                <div className="flex gap-1.5">
                    {STEPS.map(s => (
                        <div key={s.id} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${s.id <= currentStep ? "bg-blue-600" : "bg-slate-200"}`} />
                    ))}
                </div>
            </div>
            <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full flex flex-col h-full">
                <div className="flex-1 bg-white md:bg-transparent rounded-3xl md:rounded-none shadow-sm md:shadow-none border md:border-none border-slate-200 p-6 md:p-0 mb-20 md:mb-0 relative">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="min-h-[500px]"
                        >
                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                            {currentStep === 3 && renderStep3()}
                            {currentStep === 4 && renderStep4()}
                            {currentStep === 5 && renderStep5()}
                            {currentStep === 6 && renderStep6()}
                        </motion.div>
                    </AnimatePresence>
                    <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200/60">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${currentStep === 1
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-slate-600 hover:bg-white hover:shadow-md hover:text-slate-900"
                                }`}
                        >
                            <ChevronLeft size={20} /> Back
                        </button>
                        {currentStep < 6 && (
                            <button
                                onClick={handleNext}
                                className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-slate-200 flex items-center gap-3 group"
                            >
                                Next Step <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}