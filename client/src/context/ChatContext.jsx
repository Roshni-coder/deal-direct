import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io(API_BASE, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user._id) {
        newSocket.emit("user_online", user._id);
      }
    });

    newSocket.on("users_online", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
      // Update conversation list
      fetchConversations();
    });

    newSocket.on("user_typing", ({ userId, userName }) => {
      setIsTyping({ userId, userName });
    });

    newSocket.on("user_stop_typing", () => {
      setIsTyping(null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setConversations(res.data.conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE}/api/chat/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/chat/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Start or get conversation
  const startConversation = useCallback(async (propertyId, ownerId) => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const res = await axios.post(
        `${API_BASE}/api/chat/conversation/start`,
        { propertyId, ownerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchConversations();
        return res.data.conversation;
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      return null;
    }
  }, [fetchConversations]);

  // Send message
  const sendMessage = useCallback(async (conversationId, text) => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const res = await axios.post(
        `${API_BASE}/api/chat/message/send`,
        { conversationId, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const newMessage = res.data.message;
        setMessages((prev) => [...prev, newMessage]);
        
        // Emit to socket
        if (socket) {
          socket.emit("send_message", { conversationId, message: newMessage });
        }
        
        fetchConversations();
        return newMessage;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      return null;
    }
  }, [socket, fetchConversations]);

  // Join conversation room
  const joinConversation = useCallback((conversationId) => {
    if (socket) {
      socket.emit("join_conversation", conversationId);
    }
  }, [socket]);

  // Leave conversation room
  const leaveConversation = useCallback((conversationId) => {
    if (socket) {
      socket.emit("leave_conversation", conversationId);
    }
  }, [socket]);

  // Emit typing
  const emitTyping = useCallback((conversationId) => {
    if (socket) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      socket.emit("typing", { conversationId, userId: user._id, userName: user.name });
    }
  }, [socket]);

  // Emit stop typing
  const emitStopTyping = useCallback((conversationId) => {
    if (socket) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      socket.emit("stop_typing", { conversationId, userId: user._id });
    }
  }, [socket]);

  // Open chat with a conversation
  const openChat = useCallback((conversation = null) => {
    setCurrentConversation(conversation);
    setIsChatOpen(true);
    if (conversation) {
      fetchMessages(conversation._id);
      joinConversation(conversation._id);
    }
  }, [fetchMessages, joinConversation]);

  // Close chat
  const closeChat = useCallback(() => {
    if (currentConversation) {
      leaveConversation(currentConversation._id);
    }
    setIsChatOpen(false);
    setCurrentConversation(null);
    setMessages([]);
  }, [currentConversation, leaveConversation]);

  // Check if user is online
  const isUserOnline = useCallback((userId) => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  // Initial fetch
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [fetchConversations, fetchUnreadCount]);

  // Poll for unread count
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token) {
        fetchUnreadCount();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const value = {
    socket,
    conversations,
    currentConversation,
    messages,
    unreadCount,
    onlineUsers,
    isTyping,
    loading,
    isChatOpen,
    fetchConversations,
    fetchUnreadCount,
    fetchMessages,
    startConversation,
    sendMessage,
    joinConversation,
    leaveConversation,
    emitTyping,
    emitStopTyping,
    openChat,
    closeChat,
    isUserOnline,
    setCurrentConversation,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;
