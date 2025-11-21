// src/Components/TopDevelopers/TopDevelopers.jsx
import React from "react";
import LogoLoop from "../LogoLoop/LogoLoop";
import { FiAward } from "react-icons/fi";
import TATAHOUSE from "../../assets/TATAHOUSE.png";
import GodrejLogo from "../../assets/Godrej Properties.jpg";
import DLFLogo from "../../assets/DLF Limited.jpg";
import PrestigeLogo from "../../assets/Prestige Group.jpg";
import SobhaLogo from "../../assets/Sobha Limited.jpg";
import BrigadeLogo from "../../assets/Brigade Group.jpg";
import LodhaLogo from "../../assets/Lodha Group.png";
import MahindraLogo from "../../assets/Mahindra Lifespaces.jpg";
import KoltePatilLogo from "../../assets/Kolte Patil.jpg";
import PuravankaraLogo from "../../assets/Puravankara.jpg";

const TopDevelopers = () => {


  const developers = [
    {
      id: 1,
      name: "Godrej Properties",
      location: "Pan India",
      logo: GodrejLogo,
      totalProjects: 98,
      experience: 30,
    },
    {
      id: 2,
      name: "DLF Limited",
      location: "Delhi NCR, Bangalore",
      logo: DLFLogo,
      totalProjects: 145,
      experience: 75,
    },
    {
      id: 3,
      name: "Prestige Group",
      location: "Bangalore, Hyderabad",
      logo: PrestigeLogo,
      totalProjects: 280,
      experience: 35,
    },
    {
      id: 4,
      name: "Sobha Limited",
      location: "Bangalore, Kerala",
      logo: SobhaLogo,
      totalProjects: 115,
      experience: 45,
    },
    {
      id: 5,
      name: "Brigade Group",
      location: "Bangalore, Chennai",
      logo: BrigadeLogo,
      totalProjects: 200,
      experience: 38,
    },
    {
      id: 6,
      name: "Lodha Group",
      location: "Mumbai, Pune",
      logo: LodhaLogo,
      totalProjects: 125,
      experience: 40,
    },
    {
      id: 7,
      name: "Mahindra Lifespaces",
      location: "Mumbai, Pune, Chennai",
      logo: MahindraLogo,
      totalProjects: 85,
      experience: 28,
    },
    {
      id: 8,
      name: "Tata Housing",
      location: "Pan India",
      logo: TATAHOUSE,
      totalProjects: 92,
      experience: 20,
    },
    {
      id: 9,
      name: "Kolte Patil",
      location: "Pune, Bangalore",
      logo: KoltePatilLogo,
      totalProjects: 122,
      experience: 29,
    },
    {
      id: 10,
      name: "Puravankara",
      location: "Bangalore, Chennai",
      logo: PuravankaraLogo,
      totalProjects: 95,
      experience: 47,
    },
  ];

  // Convert developers to logo format for LogoLoop
  // Convert developers to logo format for LogoLoop
  const developerLogos = developers.map((developer) => ({
    node: (
      <div className="flex flex-col items-center gap-3 px-5 py-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
        {/* FIX APPLIED HERE: 
           1. Removed 'p-2' from this container div
           2. Added 'overflow-hidden' to ensure images don't spill out
        */}
        <div className="w-32 h-32 flex items-center justify-center relative overflow-hidden">
          <img
            src={developer.logo}
            alt={developer.name}
            className="!w-full !h-full object-contain"
          />
        </div>

        <div className="text-center min-w-[160px]">
          <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
            {developer.name}
          </h3>
          <p className="text-xs text-gray-600 mb-2 line-clamp-1">{developer.location}</p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <div>
              <div className="font-bold text-gray-900">{developer.totalProjects}</div>
              <div className="text-gray-600">Projects</div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div>
              <div className="font-bold text-gray-900">{developer.experience}</div>
              <div className="text-gray-600">Years</div>
            </div>
          </div>
        </div>
      </div>
    ),
    title: developer.name,
    href: "#",
  }));

  return (
    <section className="w-full py-12 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900">
            Top Developers in India
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-4xl mx-auto">
            Worried about delays or poor construction? Refer to our list of top developers across India, the most trusted real estate developers who have always kept their promises. These builders emphasise customer satisfaction, transparent practices, and strong project execution. Invest in names you can trust.
          </p>
        </div>

        {/* LogoLoop Animation */}
        <div className="relative overflow-hidden py-4">
          <LogoLoop
            logos={developerLogos}
            speed={60}
            direction="right"
            logoHeight={100}
            gap={24}
            hoverSpeed={15}
            scaleOnHover={false}
            fadeOut
            fadeOutColor="#ffffff"
            ariaLabel="Top developers in India"
          />
        </div>

        {/* View All Button */}
        <div className="mt-8 text-center">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg text-sm">
            <FiAward className="text-base" />
            <span>View All Developers in India</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopDevelopers;
