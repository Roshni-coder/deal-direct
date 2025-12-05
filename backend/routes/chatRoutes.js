import express from "express";
import {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  deleteConversation,
} from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authUser.js";

const router = express.Router();

// All chat routes require authentication
router.use(authMiddleware);

// Start or get existing conversation
router.post("/conversation/start", startConversation);

// Get all conversations for logged-in user
router.get("/conversations", getConversations);

// Get messages for a conversation
router.get("/messages/:conversationId", getMessages);

// Send a message
router.post("/message/send", sendMessage);

// Get unread message count
router.get("/unread-count", getUnreadCount);

// Delete/Archive a conversation
router.delete("/conversation/:conversationId", deleteConversation);

export default router;
