import Chat from "./models/Chat.js";
import Message from "./models/Message.js";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

const onlineUsers = new Map(); // Track connected users

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

export default { setupSocket };
