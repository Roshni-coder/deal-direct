import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

// Import top locality images
import bangaloretop from "../../assets/bangaloretop.jpg";
import bihartop from "../../assets/bihartop.jpg";
import delhitop from "../../assets/delhitop.jpg";
import gujarattop from "../../assets/gujarattop.jpg";
import gurgaontop from "../../assets/gurgaontop.jpg";
import hyderabadtop from "../../assets/Hyderabadtop.jpg";
import kolkatatop from "../../assets/kolkatatop.jpg";
import mumbaitop from "../../assets/mumbaitop.jpg";

// --- Internal LogoLoop Component ---
const LogoLoop = ({ logos, speed = 50, direction = "left", gap = 24 }) => {
  // Duplicate logos to create seamless loop
  const scrollerContent = [...logos, ...logos];

  return (
    <div className="w-full overflow-hidden relative">
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left {
          animation: scroll-left var(--speed) linear infinite;
        }
        .animate-scroll-right {
          animation: scroll-right var(--speed) linear infinite;
        }
        .pause-hover:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div
        className={`flex w-max pause-hover ${direction === 'right' ? 'animate-scroll-right' : 'animate-scroll-left'}`}
        style={{
          '--speed': `${1000 / speed * 2}s`,
          gap: `${gap}px`
        }}
      >
        {scrollerContent.map((item, idx) => (
          <div key={`${idx}-${item.title}`} className="flex-shrink-0">
            {item.node}
          </div>
        ))}
      </div>
    </div>
  );
};

const TopLocalities = () => {
  const navigate = useNavigate();

  const localities = [
    {
      id: 1,
      name: "Whitefield, Bangalore",
      city: "Bangalore",
      image: bangaloretop,
      properties: "2,500+",
    },
    {
      id: 2,
      name: "Bandra, Mumbai",
      city: "Mumbai",
      image: mumbaitop,
      properties: "1,800+",
    },
    {
      id: 3,
      name: "Gurgaon Sector 54, Delhi NCR",
      city: "Gurgaon",
      image: gurgaontop,
      properties: "1,600+",
    },
    {
      id: 4,
      name: "Koramangala, Bangalore",
      city: "Bangalore",
      image: bangaloretop,
      properties: "2,200+",
    },
    {
      id: 5,
      name: "Hitech City, Hyderabad",
      city: "Hyderabad",
      image: hyderabadtop,
      properties: "1,900+",
    },
    {
      id: 6,
      name: "Salt Lake, Kolkata",
      city: "Kolkata",
      image: kolkatatop,
      properties: "1,400+",
    },
    {
      id: 7,
      name: "Connaught Place, Delhi",
      city: "Delhi",
      image: delhitop,
      properties: "1,700+",
    },
    {
      id: 8,
      name: "Ahmedabad, Gujarat",
      city: "Gujarat",
      image: gujarattop,
      properties: "1,500+",
    },
    {
      id: 9,
      name: "Patna, Bihar",
      city: "Bihar",
      image: bihartop,
      properties: "2,000+",
    },
    {
      id: 10,
      name: "Gachibowli, Hyderabad",
      city: "Hyderabad",
      image: hyderabadtop,
      properties: "1,800+",
    },
  ];

  // Handler for locality click
  const handleLocalityClick = (city) => {
    navigate(`/properties?city=${encodeURIComponent(city)}`);
  };

  // Convert localities to logo format for LogoLoop
  const localityLogos = localities.map((locality) => ({
    node: (
      <div
        onClick={() => handleLocalityClick(locality.city)}
        className="flex flex-col items-center gap-3 px-5 py-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer hover:border-blue-300"
      >
        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-100 relative flex-shrink-0">
          <img
            src={locality.image}
            alt={locality.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center"><svg class="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg></div>`;
            }}
          />
        </div>

        <div className="text-center min-w-[160px]">
          <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
            {locality.name}
          </h3>
          <p className="text-xs text-gray-600 mb-2 line-clamp-1">{locality.city}</p>
          <div className="flex items-center justify-center gap-1 text-xs text-blue-600 font-semibold">
            <MapPin className="w-3 h-3" />
            <span>{locality.properties} Properties</span>
          </div>
        </div>
      </div>
    ),
    title: locality.name,
  }));

  return (
    <section className="w-full py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900">
            Top Localities in India
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-4xl mx-auto">
            The right locality can make or break your home-buying experience. Our expert-picked top localities across India are renowned for their balanced development, lifestyle comfort, and strong return on investment. Whether you desire a serene hideaway or a vibrant city experience, choose a locality that grows with you.
          </p>
        </div>

        {/* LogoLoop Animation */}
        <div className="relative overflow-hidden py-4">
          <LogoLoop
            logos={localityLogos}
            speed={30}
            direction="left"
            logoHeight={16}
            gap={24}
          />
        </div>

        {/* View All Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/properties')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg text-sm"
          >
            <MapPin className="w-4 h-4" />
            <span>Explore All Localities in India</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopLocalities;