import React, { useState } from "react";
import {
  CalendarDays,
  User,
  MapPin,
  Info,
  CircleCheck,
  XCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function SiteVisitManagement() {
  const [visits, setVisits] = useState([
    {
      id: 1,
      buyer: "Riya Shah",
      property: "2BHK in Mumbai – Powai",
      date: "2025-01-14",
      time: "4:00 PM",
      status: "Pending",
    },
    {
      id: 2,
      buyer: "Amit Verma",
      property: "3BHK in Surat – Adajan",
      date: "2025-01-12",
      time: "11:00 AM",
      status: "Confirmed",
    },
    {
      id: 3,
      buyer: "Neha Patil",
      property: "Plot in Pune – Hinjewadi",
      date: "2025-01-10",
      time: "2:30 PM",
      status: "Completed",
    },
    {
      id: 4,
      buyer: "Karan Joshi",
      property: "Villa in Goa – Calangute",
      date: "2025-01-09",
      time: "5:00 PM",
      status: "Missed",
    },
    {
      id: 5,
      buyer: "Sneha Desai",
      property: "Office Space – Ahmedabad",
      date: "2025-01-08",
      time: "3:00 PM",
      status: "Disputed",
    },
  ]);

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    Confirmed: "bg-blue-100 text-blue-800",
    Completed: "bg-green-100 text-green-800",
    Missed: "bg-red-100 text-red-700",
    Cancelled: "bg-gray-300 text-gray-700",
    Disputed: "bg-orange-200 text-orange-800",
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Site Visit Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage booked visits, confirmations, and visit outcomes.
        </p>
      </div>

      {/* Card Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition"
          >
            {/* Top Section */}
            <div className="flex justify-between items-center mb-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[visit.status]}`}
              >
                {visit.status}
              </span>

              <div className="flex items-center text-gray-600">
                <CalendarDays size={18} className="mr-1" /> {visit.date} •{" "}
                {visit.time}
              </div>
            </div>

            {/* Buyer & Property Info */}
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <User size={18} className="text-gray-700" />
                <span className="font-medium">{visit.buyer}</span>
              </div>

              <div className="flex gap-2 items-center">
                <MapPin size={18} className="text-gray-700" />
                <span>{visit.property}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-3">
              {visit.status === "Pending" && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <CircleCheck size={18} /> Confirm Visit
                </button>
              )}

              {visit.status === "Confirmed" && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <CheckCircle2 size={18} /> Mark Completed
                </button>
              )}

              {(visit.status === "Pending" ||
                visit.status === "Confirmed") && (
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                  <XCircle size={18} /> Mark Missed
                </button>
              )}

              {visit.status !== "Disputed" && (
                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2">
                  <AlertTriangle size={18} /> Disputed
                </button>
              )}

              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2">
                <Info size={18} /> Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
