import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  UserCircleIcon,
  FlagIcon,
  PlusIcon,
  CalendarDaysIcon,
  PhoneArrowUpRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE;

// Chat Message Component
const ChatMessage = ({ message, isOwn, onReport, onAcceptAction }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isAction = message.messageType === "action";
  const metadata = message.metadata || {};

  // Render content based on type
  const renderContent = () => {
    if (isAction) {
      if (metadata.actionType === "site_visit_request") {
        return (
          <div className="bg-white/10 p-1 rounded-lg">
            <div className="bg-white text-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm">Site Visit Request</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Requested for: <span className="font-semibold text-gray-900">{metadata.date ? format(new Date(metadata.date), "PPP p") : "Anytime"}</span>
              </p>
              {!isOwn && (
                <button
                  onClick={() => onAcceptAction(message)}
                  className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircleIcon className="w-3 h-3" /> Accept Request
                </button>
              )}
              {isOwn && (
                <div className="mt-1 text-center text-xs text-gray-400 italic bg-gray-50 py-1 rounded">
                  Waiting for response
                </div>
              )}
            </div>
          </div>
        );
      }
      if (metadata.actionType === "site_visit_accepted") {
        return (
          <div className="bg-white/10 p-1 rounded-lg">
            <div className="bg-emerald-50 text-emerald-800 rounded-lg p-3 shadow-sm border border-emerald-100 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm">Request Accepted</span>
              </div>
              <p className="text-xs">
                Site visit has been confirmed.
              </p>
            </div>
          </div>
        );
      }
      if (metadata.actionType === "callback_request") {
        return (
          <div className="bg-white/10 p-1 rounded-lg">
            <div className="bg-white text-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                <PhoneArrowUpRightIcon className="w-5 h-5 text-green-600" />
                <span className="font-bold text-sm">Callback Requested</span>
              </div>
              <p className="text-xs text-gray-600">
                I would like a callback regarding this property.
              </p>
            </div>
          </div>
        );
      }
    }

    // Default text
    return <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>;
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3 group`}>
      <div
        className={`max-w-[85%] relative px-4 py-2.5 rounded-2xl ${isOwn
          ? "bg-blue-600 text-white rounded-br-md"
          : "bg-gray-100 text-gray-900 rounded-bl-md"
          } ${isAction ? "bg-opacity-90" : ""}`}
      >
        {!isOwn && !isAction && (
          <button
            onClick={() => onReport(message)}
            className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
            title="Report Message"
          >
            <FlagIcon className="w-4 h-4" />
          </button>
        )}

        {renderContent()}

        <p
          className={`text-[10px] mt-1 text-right ${isOwn ? "text-blue-100" : "text-gray-500"
            }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
};

// Conversation List Item
const ConversationItem = ({ conversation, isActive, onClick }) => {
  const buildImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads")) return `${API_BASE}${img}`;
    return `${API_BASE}/uploads/${img}`;
  };

  const propertyImage =
    conversation.property?.images?.[0] ||
    (conversation.property?.categorizedImages?.residential?.exterior?.[0]);

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 cursor-pointer transition-all border-b border-gray-100 hover:bg-gray-50 ${isActive ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
        }`}
    >
      {/* Property Image */}
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
        {propertyImage ? (
          <img
            src={buildImageUrl(propertyImage)}
            alt="Property"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Conversation Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-gray-900 truncate">
            {conversation.otherParticipant?.name || "Unknown User"}
          </h4>
          {conversation.lastMessage?.createdAt && (
            <span className="text-[10px] text-gray-500">
              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                addSuffix: false,
              })}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 truncate">
          {conversation.property?.title || "Property"}
        </p>
        {conversation.lastMessage?.text && (
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {conversation.lastMessage.text}
          </p>
        )}
      </div>

      {/* Unread Badge */}
      {conversation.myUnreadCount > 0 && (
        <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
          {conversation.myUnreadCount}
        </div>
      )}
    </div>
  );
};

// Main Chat Widget Component
const ChatWidget = () => {
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    isChatOpen,
    isTyping,
    openChat,
    closeChat,
    sendMessage,
    emitTyping,
    emitStopTyping,
    isUserOnline,
    fetchConversations,
    fetchMessages,
    joinConversation,
    leaveConversation,
    unreadCount,
    reportMessage,
  } = useChat();

  const [messageText, setMessageText] = useState("");
  const [showConversations, setShowConversations] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // New features state
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Report State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedMessageForReport, setSelectedMessageForReport] = useState(null);
  const [reportReason, setReportReason] = useState("Asking for brokerage/commission");
  const [isReporting, setIsReporting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !currentConversation) return;

    await sendMessage(currentConversation._id, messageText.trim());
    setMessageText("");
    emitStopTyping(currentConversation._id);
  };

  // Handle sending action (Site Visit / Callback)
  const handleSendAction = async (type, data = {}) => {
    if (!currentConversation) return;

    let text = "";
    let metadata = {};

    if (type === "site_visit_request") {
      const dateTime = new Date(`${data.date}T${data.time}`);
      text = "I'd like to schedule a site visit.";
      metadata = {
        actionType: "site_visit_request",
        date: dateTime.toISOString(),
        status: "pending"
      };
    } else if (type === "callback_request") {
      text = "Please call me back.";
      metadata = {
        actionType: "callback_request",
        status: "pending"
      };
    } else if (type === "site_visit_accepted") {
      text = "Site visit request accepted.";
      metadata = {
        actionType: "site_visit_accepted",
        refMessageId: data.refMessageId,
      };
    }

    try {
      const sentMessage = await sendMessage(currentConversation._id, text, {
        messageType: "action",
        metadata
      });

      if (sentMessage) {
        setShowActionMenu(false);
        setShowDatePicker(false);
      } else {
        toast.error("Failed to send request");
      }
    } catch (err) {
      console.error("Failed to send action", err);
      toast.error("Failed to send request");
    }
  };

  const handleAcceptAction = (message) => {
    // Send an acceptance message
    handleSendAction("site_visit_accepted", { refMessageId: message._id });
  };

  // Handle typing
  const handleTyping = (e) => {
    setMessageText(e.target.value);

    if (currentConversation) {
      emitTyping(currentConversation._id);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(currentConversation._id);
      }, 2000);
    }
  };

  // Handle conversation click
  const handleConversationClick = (conversation) => {
    if (currentConversation) {
      leaveConversation(currentConversation._id);
    }
    openChat(conversation);
    setShowConversations(false);
  };

  // Handle back button
  const handleBack = () => {
    if (currentConversation) {
      leaveConversation(currentConversation._id);
    }
    setShowConversations(true);
    openChat(null);
  };

  // Handle Report Click
  const onReportClick = (message) => {
    setSelectedMessageForReport(message);
    setReportModalOpen(true);
  };

  // Submit Report
  const handleSubmitReport = async () => {
    if (!selectedMessageForReport) return;
    setIsReporting(true);
    const res = await reportMessage(selectedMessageForReport._id, reportReason);
    setIsReporting(false);

    if (res?.success) {
      toast.success("Message reported to admin.");
      setReportModalOpen(false);
      setReportReason("Asking for brokerage/commission");
      setSelectedMessageForReport(null);
    } else {
      toast.error(res?.message || "Failed to report message.");
    }
  };

  // Build image URL
  const buildImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads")) return `${API_BASE}${img}`;
    return `${API_BASE}/uploads/${img}`;
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
        {showConversations ? (
          <>
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              <h3 className="font-bold text-lg">Messages</h3>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-1 hover:bg-white/20 rounded-full transition"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                {currentConversation?.otherParticipant?.profileImage ? (
                  <img
                    src={buildImageUrl(currentConversation.otherParticipant.profileImage)}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-sm leading-tight max-w-[150px] truncate">
                    {currentConversation?.otherParticipant?.name || "Chat"}
                  </h4>
                  <p className="text-[10px] text-blue-100 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isUserOnline(currentConversation?.otherParticipant?._id) ? "bg-green-400" : "bg-gray-400"}`}></span>
                    {isUserOnline(currentConversation?.otherParticipant?._id)
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        <button
          onClick={closeChat}
          className="p-1 hover:bg-white/20 rounded-full transition"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-gray-50">
        {showConversations ? (
          // Conversations List
          <div className="h-full overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-center font-medium">No conversations yet</p>
                <p className="text-sm text-center mt-1">
                  Start chatting with property owners from property details page
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv._id}
                  conversation={conv}
                  isActive={currentConversation?._id === conv._id}
                  onClick={() => handleConversationClick(conv)}
                />
              ))
            )}
          </div>
        ) : (
          // Chat Messages
          <div className="h-full flex flex-col">
            {/* Property Info Bar */}
            {currentConversation?.property && (
              <div className="px-3 py-2 bg-white border-b border-gray-200 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {currentConversation.property.images?.[0] ? (
                    <img
                      src={buildImageUrl(currentConversation.property.images[0])}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">N/A</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {currentConversation.property.title}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {currentConversation.property.address?.city || ""}
                  </p>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f0f2f5]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Send a message to start the conversation</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg._id}
                      message={msg}
                      isOwn={msg.sender?._id === currentUser._id}
                      onReport={onReportClick}
                      onAcceptAction={handleAcceptAction}
                    />
                  ))}
                  {isTyping && isTyping.userId !== currentUser._id && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm pl-2">
                      <span className="text-xs italic">{isTyping.userName} is typing...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Action Menus */}
            <div className="relative">
              {showActionMenu && (
                <div className="absolute bottom-full left-4 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[200px] animate-in slide-in-from-bottom-2 duration-200 z-20">
                  {!showDatePicker ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => setShowDatePicker(true)}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <CalendarDaysIcon className="w-5 h-5" />
                        Schedule Site Visit
                      </button>
                      <button
                        onClick={() => handleSendAction("callback_request")}
                        className="w-full text-left px-3 py-2 hover:bg-green-50 hover:text-green-600 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <PhoneArrowUpRightIcon className="w-5 h-5" />
                        Request Callback
                      </button>
                    </div>
                  ) : (
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700">Select Date & Time</span>
                        <button onClick={() => setShowDatePicker(false)} className="text-gray-400 hover:text-gray-600">
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="date"
                        className="w-full text-sm border border-gray-300 rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <input
                        type="time"
                        className="w-full text-sm border border-gray-300 rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setSelectedTime(e.target.value)}
                      />
                      <button
                        onClick={() => {
                          if (selectedDate && selectedTime) {
                            handleSendAction("site_visit_request", { date: selectedDate, time: selectedTime })
                          } else {
                            toast.warning("Please select date and time");
                          }
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                      >
                        Send Request
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowActionMenu(!showActionMenu);
                    setShowDatePicker(false);
                  }}
                  className={`p-2 rounded-full transition-colors ${showActionMenu ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Report Modal Overlay */}
        {reportModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-xs p-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <FlagIcon className="w-5 h-5 text-red-600" />
                  Report Message
                </h3>
                <button onClick={() => setReportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 line-clamp-2 italic bg-gray-50 p-2 rounded">
                  "{selectedMessageForReport?.text}"
                </p>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="Asking for brokerage/commission">Asking for brokerage/commission</option>
                  <option value="Listing info is incorrect">Listing information is incorrect</option>
                  <option value="Fake Property / Fraud">Fake Property / Fraud Suspected</option>
                  <option value="Unresponsive/Ghosting">Unresponsive / Ghosting</option>
                  <option value="Spam / Irrelevant Messages">Spam / Irrelevant Messages</option>
                  <option value="Abusive or Offensive Language">Abusive or Offensive Language</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={isReporting}
                  className="flex-1 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
                >
                  {isReporting ? "Reporting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
