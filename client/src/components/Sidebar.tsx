import {
  Box,
  Typography,
  List,
  IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import UserSearchDialog from "./UserSearchDialog";
import UserProfile from "./UserProfile";
import ChatListItem from "./ChatListItem";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../socket/socket";
import type { User, Message } from "../types/auth";

interface Chat {
  _id: string;
  isGroup: boolean;
  participants: User[];
  groupAdmin?: User;
  chatName?: string;
  latestMessage?: Message;
}

const Sidebar = ({ 
  onSelectChat, 
  onChatsLoaded 
}: { 
  onSelectChat: (chat: Chat) => void;
  onChatsLoaded?: (chats: Chat[]) => void;
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await API.get("/chats", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setChats(data);
        // Call onChatsLoaded to restore selected chat from URL
        if (onChatsLoaded) {
          onChatsLoaded(data);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };
    fetchChats();
  }, [user, onChatsLoaded]);

  // Listen for new messages to update chat list
  useEffect(() => {
    const socket = getSocket();
    
    if (!socket || !user?._id) {
      return;
    }

    // Join user's personal room to receive messages for all their chats
    socket.emit("setup", user._id);

    const handleNewMessage = async (message: Message) => {
      try {
        // Fetch updated chat data from backend to get properly populated latestMessage
        const { data: updatedChats } = await API.get("/chats", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        
        setChats(updatedChats);
      } catch (error) {
        // Fallback: update locally if fetch fails
        setChats((prevChats) => {
          const chatIndex = prevChats.findIndex((chat) => chat._id === message.chat);
          
          if (chatIndex === -1) {
            return prevChats;
          }

          const updatedChat = {
            ...prevChats[chatIndex],
            latestMessage: message,
            updatedAt: new Date().toISOString(),
          };

          const newChats = prevChats.filter((_, index) => index !== chatIndex);
          return [updatedChat, ...newChats];
        });
      }
    };

    socket.on("message-received", handleNewMessage);

    return () => {
      socket.off("message-received", handleNewMessage);
    };
  }, [user]);



  return (
    <>
      <Box
        sx={{
          width: 300,
          borderRight: "1px solid",
          borderColor: "divider",
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          minHeight: 0,
          bgcolor: "background.paper",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flex: '0 0 48px', // Fixed height for header
          }}
        >
          <Typography 
            variant="h6"
            sx={{
              color: "primary.main",
              fontWeight: "bold",
              textShadow: "0 0 1px rgba(0,0,0,0.1)",
            }}
          >
            Chats
          </Typography>
          <IconButton onClick={() => setOpenDialog(true)}>
            <PersonAddIcon />
          </IconButton>
        </Box>

        {/* User Info */}
        {user && <UserProfile user={user} />}

        {/* Chat List */}
        <List sx={{ flex: 1, minHeight: 0, maxHeight: '68vh', overflowY: 'auto' }}>
          {chats.map((chat) => (
            <ChatListItem
              key={chat._id}
              chat={chat}
              isSelected={selectedChatId === chat._id}
              currentUserId={user?._id || ""}
              onClick={() => {
                setSelectedChatId(chat._id);
                onSelectChat(chat);
              }}
            />
          ))}
        </List>
      </Box>

      {/* Search Dialog */}
      <UserSearchDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onChatCreated={(chat) => {
          setChats((prev) => {
            const exists = prev.find((c) => c._id === chat._id);
            return exists ? prev : [chat, ...prev];
          });
          setSelectedChatId(chat._id);
          onSelectChat(chat);
        }}
      />
    </>
  );
};

export default Sidebar;
