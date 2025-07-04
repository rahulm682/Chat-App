import { createContext, useContext, useEffect, useState } from "react";
import { getSocket, onUserOnline } from "../socket/socket";
import { useAuth } from "./AuthContext";

const OnlineUsersContext = createContext<string[]>([]);

export const useOnlineUsers = () => useContext(OnlineUsersContext);

export const OnlineUsersProvider = ({ children }: { children: React.ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.token) {
      setOnlineUsers([]);
      return;
    }

    console.log("🔌 OnlineUsersProvider: Setting up online users listener");
    
    const unsubscribe = onUserOnline((users: string[]) => {
      console.log("✅ OnlineUsersProvider: Received online users:", users);
      setOnlineUsers(users);
    });

    // Cleanup function
    return () => {
      console.log("🔌 OnlineUsersProvider: Cleaning up listener");
      unsubscribe();
    };
  }, [user?.token]); // Only depend on token, not entire user object

  return (
    <OnlineUsersContext.Provider value={onlineUsers}>
      {children}
    </OnlineUsersContext.Provider>
  );
};
