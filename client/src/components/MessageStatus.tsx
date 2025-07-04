import React from "react";
import { Box, Tooltip } from "@mui/material";
import {
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";

interface MessageStatusProps {
  status: "sent" | "delivered" | "read";
  timestamp: string;
  isRead?: boolean;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status, timestamp, isRead = false }) => {
  const getStatusIcon = () => {
    switch (status) {
      case "sent":
        return <CheckIcon sx={{ fontSize: "0.8rem", color: "text.secondary" }} />;
      case "delivered":
        return <DoneAllIcon sx={{ fontSize: "0.8rem", color: "text.secondary" }} />;
      case "read":
        return <DoneAllIcon sx={{ fontSize: "0.8rem", color: isRead ? "primary.main" : "text.secondary" }} />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "sent":
        return "Sent";
      case "delivered":
        return "Delivered";
      case "read":
        return "Read";
      default:
        return "";
    }
  };

  return (
    <Tooltip title={`${getStatusText()} at ${timestamp}`}>
      <Box sx={{ display: "inline-flex", alignItems: "center", ml: 0.5 }}>
        {getStatusIcon()}
      </Box>
    </Tooltip>
  );
};

export default MessageStatus; 