import React, { useState } from "react";
import {
  Mail,
  PhoneCall,
  MessageSquare,
  Filter,
  User,
  X,
  Sparkles,
} from "lucide-react";

export default function LeadMonitoring() {
  const [selectedLead, setSelectedLead] = useState(null);

  const leads = [
    {
      id: 1,
      buyer: "Riya Shah",
      property: "2BHK in Mumbai – Powai",
      date: "2025-01-12",
      status: "Seen",
      unread: true,
      conversation: [
        { sender: "Buyer", msg: "Is this property still available?" },
        { sender: "Owner", msg: "Yes, available. When can we connect?" },
      ],
    },
    {
      id: 2,
      buyer: "Amit Verma",
      property: "3BHK in Surat – Adajan",
      date: "2025-01-11",
      status: "Contacted",
      unread: false,
      conversation: [
        { sender: "Buyer", msg: "Can I schedule a site visit?" },
        { sender: "Owner", msg: "Sure! I will call you shortly." },
      ],
    },
    {
      id: 3,
      buyer: "Neha Patil",
      property: "Plot in Pune – Hinjewadi",
      date: "2025-01-10",
      status: "Ignored",
      unread: false,
      conversation: [{ sender: "Buyer", msg: "Please share more photos" }],
    },
  ];

  const statusColors = {
    Seen: "bg-blue-100 text-blue-700 border-blue-300",
    Contacted: "bg-green-100 text-green-700 border-green-300",
    Ignored: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Spam: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <div className="p-4 min-h-screen ">

      {/* Page Title */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
          <Sparkles className="text-purple-600 drop-shadow" />
          Lead Monitoring
        </h1>

        <button className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow hover:shadow-xl transition-all">
          <Filter className="text-gray-700" size={20} />
          <span className="font-medium text-gray-800">Filter</span>
        </button>
      </div>

      {/* Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded shadow-2xl overflow-hidden border border-white/40">

        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-200 via-blue-200 to-pink-200">
            <tr className="text-gray-800">
              <th className="py-4 px-6 text-left font-semibold">Buyer</th>
              <th className="py-4 px-6 text-left font-semibold">Property</th>
              <th className="py-4 px-6 text-left font-semibold">Date</th>
              <th className="py-4 px-6 text-left font-semibold">Status</th>
              <th className="py-4 px-6 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all border-b last:border-none"
              >
                {/* Buyer */}
                <td className="py-4 px-6 flex items-center gap-3 text-gray-900 font-medium">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-300 to-blue-300 flex items-center justify-center shadow-inner">
                    <User size={19} className="text-gray-800" />
                  </div>
                  {lead.buyer}

                  {lead.unread && (
                    <span className="ml-3 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                      NEW
                    </span>
                  )}
                </td>

                <td className="py-4 px-6 text-gray-700">{lead.property}</td>
                <td className="py-4 px-6 text-gray-700">{lead.date}</td>

                {/* Status */}
                <td className="py-4 px-6">
                  <span
                    className={`px-4 py-1.5 border rounded-full text-xs font-semibold shadow-sm ${statusColors[lead.status]}`}
                  >
                    {lead.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-center">
                  <div className="flex justify-center gap-5">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="text-blue-600 hover:scale-125 transition-transform"
                    >
                      <MessageSquare size={22} />
                    </button>

                    <button className="text-green-600 hover:scale-125 transition-transform">
                      <PhoneCall size={22} />
                    </button>

                    <button className="text-gray-700 hover:scale-125 transition-transform">
                      <Mail size={22} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {/* Chat Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-200">

            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Chat with {selectedLead.buyer}</h2>

              <button
                onClick={() => setSelectedLead(null)}
                className="hover:scale-125 transition"
              >
                <X size={28} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
              {selectedLead.conversation.map((msg, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl shadow-sm ${
                    msg.sender === "Buyer"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-green-100 text-green-900"
                  }`}
                >
                  <strong>{msg.sender}: </strong>
                  {msg.msg}
                </div>
              ))}
            </div>

            {/* Close */}
            <div className="p-6">
              <button
                onClick={() => setSelectedLead(null)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all shadow-md"
              >
                Close Chat
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
