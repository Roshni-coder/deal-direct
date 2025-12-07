import React, { useEffect, useState } from "react";
import {
    Scale,
    UserCheck,
    Home,
    MessageSquare,
    FileText,
    AlertTriangle,
    ShieldAlert,
    Gavel,
    ChevronRight
} from "lucide-react";

const TermsAndConditions = () => {
    const [activeSection, setActiveSection] = useState("acceptance");

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, []);

    const sections = [
        { id: "acceptance", title: "Acceptance of Terms", icon: Scale },
        { id: "accounts", title: "User Accounts", icon: UserCheck },
        { id: "listings", title: "Property Listings", icon: Home },
        { id: "conduct", title: "User Conduct & Chat", icon: MessageSquare },
        { id: "ai-services", title: "AI Agreement Tool", icon: FileText },
        { id: "liability", title: "Limitation of Liability", icon: AlertTriangle },
        { id: "termination", title: "Termination", icon: ShieldAlert },
        { id: "governing", title: "Governing Law", icon: Gavel },
    ];

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            setActiveSection(id);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* Header */}
            <div className="bg-slate-900 text-white py-16 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-white/10 rounded-full backdrop-blur-md">
                            <Scale className="w-12 h-12 text-blue-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms and Conditions</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Please read these terms carefully before using DealDirect. By accessing our platform, you agree to be bound by these conditions.
                    </p>
                    <p className="text-slate-500 text-sm mt-4">Last Updated: December 2025</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col lg:flex-row gap-12">

                {/* Sidebar Navigation */}
                <div className="lg:w-1/4 hidden lg:block">
                    <div className="sticky top-28 bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeSection === section.id
                                    ? "bg-blue-50 text-blue-700 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <section.icon className={`w-4 h-4 ${activeSection === section.id ? "text-blue-600" : "text-gray-400"}`} />
                                    {section.title}
                                </div>
                                {activeSection === section.id && <ChevronRight className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:w-3/4 space-y-12">

                    {/* Acceptance */}
                    <section id="acceptance" className="scroll-mt-28">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-gray-600 leading-relaxed">
                            <p>
                                <strong>DealDirect</strong>, operated by <strong>IshiSoftTech Pvt Ltd</strong>, provides this platform to facilitate direct connections between property owners and buyers/tenants. By accessing our website or mobile application, you acknowledge that you have read, understood, and agree to be bound by these Terms.
                            </p>
                        </div>
                    </section>

                    {/* User Accounts */}
                    <section id="accounts" className="scroll-mt-28">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-gray-600 space-y-4">
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Eligibility:</strong> You must be at least 18 years old to create an account.</li>
                                <li><strong>Accuracy:</strong> You agree to provide accurate, current, and complete information during registration (Name, Email, Phone). Fake profiles will be suspended.</li>
                                <li><strong>Security:</strong> You are responsible for maintaining the confidentiality of your password. Any activity under your account is your responsibility.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Property Listings */}
                    <section id="listings" className="scroll-mt-28">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Property Listings</h2>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-gray-600 space-y-4">
                            <p>For Property Owners ("Listers"):</p>
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></span>
                                    <span><strong>Ownership:</strong> You warrant that you are the legal owner or authorized attorney of the property listed.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></span>
                                    <span><strong>Content:</strong> Photos and descriptions must be accurate. We reserve the right to remove listings that violate copyright or contain inappropriate content.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></span>
                                    <span><strong>No Brokerage:</strong> You agree not to demand brokerage fees from leads generated through DealDirect.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Chat & Conduct */}
                    <section id="conduct" className="scroll-mt-28">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Conduct & Chat</h2>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-gray-600">
                            <p className="mb-4">
                                Our in-app chat feature is designed for negotiating property deals. You agree NOT to:
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="font-semibold text-gray-800 block mb-1">Harassment</span>
                                    <span className="text-sm">Use abusive, threatening, or offensive language.</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="font-semibold text-gray-800 block mb-1">Spam</span>
                                    <span className="text-sm">Send unsolicited promotions or advertisements.</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* AI Services - Specific to your codebase */}
                    <section id="ai-services" className="scroll-mt-28">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-2xl">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="text-amber-600" />
                                5. AI Agreement Generator Disclaimer
                            </h2>
                            <p className="text-gray-700 mb-4">
                                DealDirect provides an automated Rent/Lease Agreement generator powered by Google's Generative AI. By using this tool, you acknowledge:
                            </p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-2">
                                <li>
                                    <strong>Not Legal Advice:</strong> The generated documents are for informational purposes only and do not constitute legal advice.
                                </li>
                                <li>
                                    <strong>Verification Required:</strong> You are responsible for verifying the content with a qualified legal professional before signing.
                                </li>
                                <li>
                                    <strong>Liability:</strong> IshiSoftTech Pvt Ltd is not liable for any disputes, financial loss, or legal issues arising from the use of agreements generated on this platform.
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section id="liability" className="scroll-mt-28">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-gray-600">
                            <p>
                                DealDirect acts solely as a connector. We do not verify the physical condition of properties or the financial standing of buyers/tenants. Any transaction entered into is strictly between the Buyer and Seller. We are not liable for any direct, indirect, or consequential damages arising from the use of our services.
                            </p>
                        </div>
                    </section>

                    {/* Termination */}
                    <section id="termination" className="scroll-mt-28">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Termination</h2>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-gray-600">
                            <p>
                                We reserve the right to suspend or terminate your account (block access) at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
                            </p>
                        </div>
                    </section>

                    {/* Governing Law */}
                    <section id="governing" className="scroll-mt-28 mb-20">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
                        <div className="bg-slate-900 text-white p-8 rounded-3xl">
                            <p className="mb-4 text-slate-300">
                                These terms shall be governed by and construed in accordance with the laws of India.
                            </p>
                            <div className="flex items-center gap-3">
                                <Gavel className="text-blue-400" />
                                <span>All disputes shall be subject to the exclusive jurisdiction of the courts in <strong>Mumbai, Maharashtra</strong>.</span>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;