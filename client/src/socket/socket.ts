import { io, Socket } from "socket.io-client";

const ENDPOINT = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket: Socket;
let onlineUsersCallback: ((users: string[]) => void) | null = null;

export const connectSocket = (token: string) => {
  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }

  socket = io(ENDPOINT, {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    socket.emit("get-online-users");
  });

  socket.on("connect_error", (error) => {
  });

  socket.on("disconnect", (reason) => {
  });

  socket.on("error", (error) => {
  });

  // Set up online users listener immediately
  socket.on("online-users", (users: string[]) => {
    if (onlineUsersCallback) {
      onlineUsersCallback(users);
    }
  });

  return socket;
};

export const onUserOnline = (callback: (users: string[]) => void) => {
  // Store the callback for when socket connects
  onlineUsersCallback = callback;
  
  // If socket is already connected, set up the listener immediately
  if (socket && socket.connected) {
    socket.on("online-users", callback);
    // Request current online users
    socket.emit("get-online-users");
  }

  return () => {
    onlineUsersCallback = null;
    if (socket) {
      socket.off("online-users", callback);
    }
  };
};

export const getSocket = () => {
  if (!socket) {
  }

  return socket;
};
