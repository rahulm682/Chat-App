import React, { createContext, useContext, useEffect, useState } from "react";
import { type User } from "../types/auth";
import { connectSocket, getSocket } from "../socket/socket";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : null;
    return parsed;
  });

  useEffect(() => {
    if (user?.token) {
      console.log("🔌 Connecting socket with token:", user.token.substring(0, 20) + "...");
      connectSocket(user.token);
    }
  }, [user]);

  const logout = () => {
    // Disconnect socket
    const socket = getSocket();
    if (socket) {
      socket.disconnect();
    }
    
    // Clear user from state and localStorage
    setUser(null);
    localStorage.removeItem("user");
    
    console.log("🔌 User logged out, socket disconnected");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
