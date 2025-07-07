import {
  Box,
  useTheme,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import TopNavbar from "../components/TopNavbar";
import UserMenu from "../components/UserMenu";
import type { User, Message } from "../types/auth";
import { useAppSelector } from "../store/hooks";
import { logout, selectCurrentUser } from "../store/slices/userSlice";

interface Chat {
  _id: string;
  isGroup: boolean;
  participants: User[];
  groupAdmin?: User;
  chatName?: string;
  latestMessage?: Message;
}

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const user = useAppSelector(selectCurrentUser);
  const theme = useTheme();

  // Keep sidebar always visible
  useEffect(() => {
    setSidebarOpen(true);
  }, []);

  // Only set selected chat, do not update URL
  const handleSelectChat = useCallback((chat: Chat) => {
    setSelectedChat(chat);
  }, []);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: '100vh', minHeight: 0 }}>
      {/* Top Navigation Bar */}
      <TopNavbar user={user} onUserMenuOpen={handleUserMenuOpen} />

      {/* User Menu */}
      <UserMenu
        anchorEl={userMenuAnchor}
        onClose={handleUserMenuClose}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: sidebarOpen ? 300 : 0,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflow: "hidden",
            borderRight: "1px solid",
            borderColor: "divider",
          }}
        >
          <Sidebar onSelectChat={handleSelectChat} />
        </Box>

        {/* Chat Window */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <ChatWindow chat={selectedChat} />
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
