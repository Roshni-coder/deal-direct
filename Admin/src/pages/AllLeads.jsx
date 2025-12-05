import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  Loader2, Search, Phone, Mail, Eye, MessageCircle,
  Filter, ChevronDown, User, Home, Calendar, TrendingUp
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  interested: "bg-purple-100 text-purple-800",
  negotiating: "bg-orange-100 text-orange-800",
  converted: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

const AllLeads = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, page]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/admin/leads`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter, page, limit: 15, search }
      });
      if (data.success) {
        setLeads(data.data);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    try {
      setUpdating(true);
      await axios.put(
        `${API_URL}/api/admin/leads/${leadId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Lead status updated");
      fetchLeads();
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to update lead");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="p-6 h-[80vh] bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Leads</h1>
        <p className="text-gray-500 mt-1">Manage and track all property inquiries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div 
          onClick={() => { setStatusFilter("all"); setPage(1); }}
          className={`p-4 rounded-lg cursor-pointer transition-all ${
            statusFilter === "all" ? "bg-gray-800 text-white" : "bg-white hover:bg-gray-50"
          }`}
        >
          <p className="text-2xl font-bold">{stats.total || 0}</p>
          <p className="text-sm opacity-80">Total</p>
        </div>
        {Object.entries(statusColors).map(([status, color]) => (
          <div 
            key={status}
            onClick={() => { setStatusFilter(status); setPage(1); }}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              statusFilter === status 
                ? "ring-2 ring-offset-2 ring-blue-500" 
                : "hover:shadow-md"
            } ${color.replace('text-', 'bg-').split(' ')[0]}`}
          >
            <p className="text-2xl font-bold">{stats[status] || 0}</p>
            <p className="text-sm capitalize">{status}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, property..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Search
        </button>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No leads found</h3>
          <p className="text-gray-500">
            {statusFilter !== "all" 
              ? `No ${statusFilter} leads at the moment` 
              : "When users express interest in properties, they'll appear here"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Lead</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Property</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Owner</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    {/* Lead Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {lead.userSnapshot?.name || lead.user?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {lead.userSnapshot?.email || lead.user?.email}
                          </p>
                          {(lead.userSnapshot?.phone || lead.user?.phone) && (
                            <p className="text-xs text-gray-500">
                              {lead.userSnapshot?.phone || lead.user?.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Property Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800 truncate max-w-[200px]">
                            {lead.propertySnapshot?.title || lead.property?.title || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {lead.propertySnapshot?.city || lead.property?.address?.city} • {formatPrice(lead.propertySnapshot?.price || lead.property?.price)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Owner Info */}
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{lead.propertyOwner?.name || "N/A"}</p>
                      <p className="text-xs text-gray-500">{lead.propertyOwner?.email}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusUpdate(lead._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${statusColors[lead.status]}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="interested">Interested</option>
                        <option value="negotiating">Negotiating</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(lead.createdAt)}
                      </div>
                      {!lead.isViewed && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                          Unread
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {(lead.userSnapshot?.phone || lead.user?.phone) && (
                          <a
                            href={`tel:${lead.userSnapshot?.phone || lead.user?.phone}`}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Call"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        <a
                          href={`mailto:${lead.userSnapshot?.email || lead.user?.email}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        {(lead.userSnapshot?.phone || lead.user?.phone) && (
                          <a
                            href={`https://wa.me/${(lead.userSnapshot?.phone || lead.user?.phone).replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => { setSelectedLead(lead); setShowModal(true); }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total leads)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lead Details Modal */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Lead Details</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedLead.userSnapshot?.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedLead.userSnapshot?.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedLead.userSnapshot?.phone || "N/A"}</p>
                </div>
              </div>

              {/* Property Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Property Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Title:</span> {selectedLead.propertySnapshot?.title}</p>
                  <p><span className="font-medium">Location:</span> {selectedLead.propertySnapshot?.city}, {selectedLead.propertySnapshot?.locality}</p>
                  <p><span className="font-medium">Type:</span> {selectedLead.propertySnapshot?.propertyType} - {selectedLead.propertySnapshot?.bhk}</p>
                  <p><span className="font-medium">Price:</span> {formatPrice(selectedLead.propertySnapshot?.price)}</p>
                  <p><span className="font-medium">Listing Type:</span> {selectedLead.propertySnapshot?.listingType}</p>
                </div>
              </div>

              {/* Lead Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Lead Status</h3>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleStatusUpdate(selectedLead._id, e.target.value)}
                  disabled={updating}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Notes</h3>
                  <p className="bg-gray-50 p-4 rounded-lg">{selectedLead.notes}</p>
                </div>
              )}

              {/* Contact History */}
              {selectedLead.contactHistory?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Contact History</h3>
                  <div className="space-y-2">
                    {selectedLead.contactHistory.map((entry, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium capitalize">{entry.action}</p>
                        <p className="text-sm text-gray-600">{entry.note}</p>
                        <p className="text-xs text-gray-400">{formatDate(entry.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Timeline</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <p><span className="font-medium">Created:</span> {formatDate(selectedLead.createdAt)}</p>
                  {selectedLead.viewedAt && (
                    <p><span className="font-medium">First Viewed:</span> {formatDate(selectedLead.viewedAt)}</p>
                  )}
                  <p><span className="font-medium">Last Updated:</span> {formatDate(selectedLead.updatedAt)}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllLeads;
