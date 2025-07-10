import Chat from "./models/Chat.js";
import Message from "./models/Message.js";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

const onlineUsers = new Map(); // Track connected users
const usersViewingChats = new Map(); // Track which users are viewing which chats

// Helper function to extract user ID from JWT token
const getUserIdFromToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");
    return user ? user._id.toString() : null;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const userId = await getUserIdFromToken(token);
      if (!userId) {
        return next(new Error("Authentication error: Invalid token"));
      }

      socket.userId = userId;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    // Add user to online users immediately upon connection
    if (socket.userId) {
      onlineUsers.set(socket.userId, socket.id);
      
      // Emit the updated list of online users to all clients
      io.emit("online-users", Array.from(onlineUsers.keys()));
    }

    // Join user-specific room for personal notifications
    socket.on("setup", (userId) => {
      socket.join(userId);
    });

    // Join chat room
    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
    });

    // Track when user is actively viewing a chat
    socket.on("user-viewing-chat", (data) => {
      const { chatId, userId } = data;
      if (chatId && userId) {
        // Store which user is viewing which chat
        if (!usersViewingChats.has(userId)) {
          usersViewingChats.set(userId, new Set());
        }
        usersViewingChats.get(userId).add(chatId);
      }
    });

    // Typing indicator
    socket.on("typing", (chatId) => {
      socket.to(chatId).emit("typing");
    });

    socket.on("stop-typing", (chatId) => {
      socket.to(chatId).emit("stop-typing");
    });

    // Send message event
    socket.on("new-message", async (messageData) => {
    });

    // Disconnect event
    socket.on("disconnect", () => {
      
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        
        // Remove user from viewing chats tracking
        usersViewingChats.delete(socket.userId);
        
        // Emit the updated list of online users to all clients
        io.emit("online-users", Array.from(onlineUsers.keys()));
      }
    });

    // Handle request for current online users
    socket.on("get-online-users", () => {
      socket.emit("online-users", Array.from(onlineUsers.keys()));
    });
  });
};

// Helper function to check if a user is viewing a specific chat
const isUserViewingChat = (userId, chatId) => {
  const userViewingChats = usersViewingChats.get(userId);
  return userViewingChats && userViewingChats.has(chatId);
};

// Helper function to automatically mark messages as read for users viewing the chat
const autoMarkMessagesAsRead = async (chatId, messageId) => {
  try {
    const chat = await Chat.findById(chatId).populate("participants");
    if (!chat) return;

    const usersToMarkAsRead = [];
    const allParticipants = [];
    
    // Check each participant
    chat.participants.forEach((participant) => {
      const participantId = participant._id.toString();
      allParticipants.push(participantId);
      
      // If user is viewing this chat, mark the message as read for them
      if (isUserViewingChat(participantId, chatId)) {
        usersToMarkAsRead.push(participantId);
      }
    });

    // Update the message to mark it as read for these users
    if (usersToMarkAsRead.length > 0) {
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { readBy: { $each: usersToMarkAsRead } }
      });
    } else {
      // no users are viewing this chat, so we don't need to mark the message as read
    }
  } catch (error) {
    console.error("Error auto-marking message as read:", error);
  }
};

export default { setupSocket, autoMarkMessagesAsRead };
