import React from "react";
import {
  Avatar,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  VideoCall as VideoCallIcon,
  Call as CallIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import type { IBaseUser } from "../types/api";

interface ChatHeaderProps {
  otherUser: IBaseUser | null;
  isOtherUserOnline: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ otherUser, isOtherUserOnline }) => {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: "background.paper",
        flex: "0 0 64px", // Fixed height for header
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={otherUser?.avatarUrl}
            alt={otherUser?.name}
            sx={{ width: 48, height: 48 }}
          >
            {otherUser?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          {/* Online status indicator */}
          {isOtherUserOnline && (
            <Box
              sx={{
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "success.main",
                border: "2px solid",
                borderColor: "background.paper",
                boxShadow: "0 0 4px rgba(76, 175, 80, 0.5)",
              }}
            />
          )}
        </Box>
        <Box>
          <Typography 
            variant="h6" 
            fontWeight="bold"
            sx={{
              color: "primary.main",
              textShadow: "0 0 1px rgba(0,0,0,0.1)",
            }}
          >
            {otherUser?.name || "Unknown User"}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            {otherUser?.email && (
              <Typography variant="body2" color="text.secondary">
                {otherUser.email}
              </Typography>
            )}
            {isOtherUserOnline && (
              <Typography variant="body2" color="success.main" sx={{ fontWeight: "medium" }}>
                • Online
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Voice Call (Coming Soon)">
          <IconButton size="small">
            <CallIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Video Call (Coming Soon)">
          <IconButton size="small">
            <VideoCallIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Chat Info (Coming Soon)">
          <IconButton size="small">
            <InfoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="More Options (Coming Soon)">
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ChatHeader; 