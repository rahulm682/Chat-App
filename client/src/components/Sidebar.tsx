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
import { getSocket } from "../socket/socket";
import type { Message, User } from "../types/auth";
import { useGetChatsQuery, useInvalidateChatListMutation } from '../store/services/chatApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedChatId } from '../store/slices/chatSlice';
import { selectCurrentUser } from "../store/slices/userSlice";

const Sidebar = ({ onSelectChat }: { onSelectChat: (chat: any) => void }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const dispatch = useAppDispatch();
  const selectedChatId = useAppSelector(state => state.chat.selectedChatId);
  const { data: chats = [], refetch, isLoading, error } = useGetChatsQuery();
  const [invalidateChatList] = useInvalidateChatListMutation();
  const user = useAppSelector(selectCurrentUser) as User | null;

  // Debug: Log chat list updates
  useEffect(() => {
    // Log total unread count
    const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
  }, [chats, selectedChatId, user, isLoading, error]);

  // Listen for new messages to update chat list
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user?._id) {
      return;
    }

    // Join user's personal room to receive messages for all their chats
    socket.emit("setup", user._id);

    const handleNewMessage = async (message: Message) => {
      // Only invalidate cache if message is from another user and not for the currently selected chat
      if (message.sender._id !== user._id && message.chat !== selectedChatId) {
        try {
          // Invalidate chat list cache to trigger refetch with updated unread counts
          await invalidateChatList();
          
          // Also try manual refetch as backup
          await refetch();
        } catch (error) {
        }
      }
    };

    socket.on("message-received", handleNewMessage);

    return () => {
      socket.off("message-received", handleNewMessage);
    };
  }, [user, invalidateChatList, selectedChatId, refetch]);

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
              unreadCount={chat.unreadCount || 0}
              onClick={() => {
                dispatch(setSelectedChatId(chat._id));
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
          // Optionally refetch chats
          dispatch(setSelectedChatId(chat._id));
          onSelectChat(chat);
        }}
      />
    </>
  );
};

export default Sidebar;
