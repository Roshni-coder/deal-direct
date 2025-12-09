import React from "react";
import { useChat } from "../../context/ChatContext";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const ChatButton = () => {
  const { unreadCount, isChatOpen, openChat, fetchConversations } = useChat();
  const token = localStorage.getItem("token");

  if (!token) return null; // Don't show if not logged in

  const handleClick = () => {
    fetchConversations();
    openChat();
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isChatOpen ? "Close chat" : `Open chat${unreadCount > 0 ? `, ${unreadCount} unread messages` : ''}`}
      className={`fixed w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg flex items-center justify-center transition-all z-40 touch-target
        ${isChatOpen
          ? "bg-gray-600 hover:bg-gray-700 active:bg-gray-800"
          : "bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 active:bg-blue-800"
        }`}
      style={{
        /* iOS Safe Area Support - prevents overlap with iPhone notch/home indicator */
        bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        right: 'calc(24px + env(safe-area-inset-right, 0px))',
      }}
    >
      <ChatBubbleLeftRightIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />

      {/* Unread Badge */}
      {unreadCount > 0 && !isChatOpen && (
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-md">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatButton;
