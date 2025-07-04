import { io, Socket } from "socket.io-client";

const ENDPOINT = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket: Socket;
let onlineUsersCallback: ((users: string[]) => void) | null = null;

export const connectSocket = (token: string) => {
  // Disconnect existing socket if any
  if (socket) {
    console.log("🔌 Disconnecting existing socket");
    socket.disconnect();
  }

  console.log("🔌 Creating new socket connection to:", ENDPOINT);
  socket = io(ENDPOINT, {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("🔌 Connected to Socket.io with ID:", socket.id);
    // Request current online users when connected
    socket.emit("get-online-users");
  });

  socket.on("connect_error", (error) => {
    console.error("🔌 Socket connection error:", error);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  socket.on("error", (error) => {
    console.error("🔌 Socket error:", error);
  });

  // Set up online users listener immediately
  socket.on("online-users", (users: string[]) => {
    console.log("🔌 Received online users from server:", users);
    if (onlineUsersCallback) {
      console.log("🔌 Calling stored callback with users:", users);
      onlineUsersCallback(users);
    } else {
      console.log("🔌 No callback stored yet, users received but not processed");
    }
  });

  return socket;
};

export const onUserOnline = (callback: (users: string[]) => void) => {
  console.log("🔌 onUserOnline called, socket state:", socket?.connected);
  
  // Store the callback for when socket connects
  onlineUsersCallback = callback;
  
  // If socket is already connected, set up the listener immediately
  if (socket && socket.connected) {
    console.log("🔌 Socket already connected, setting up listener immediately");
    socket.on("online-users", callback);
    // Request current online users
    socket.emit("get-online-users");
  } else {
    console.log("🔌 Socket not connected yet, callback stored for later");
  }

  return () => {
    console.log("🔌 Cleaning up onUserOnline callback");
    onlineUsersCallback = null;
    if (socket) {
      socket.off("online-users", callback);
    }
  };
};

export const getSocket = () => {
  if (!socket) {
    console.warn("🔌 Socket not initialized. Call connectSocket first.");
  }

  console.log("🔌 Socket:", socket);
  return socket;
};
