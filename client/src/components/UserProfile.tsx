import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import type { User } from "../types/auth";

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        mb: 2,
        backgroundColor: "background.default",
        borderRadius: 1,
        flex: "0 0 72px", // Fixed height for user info
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Avatar src={user.avatarUrl} alt={user.name} />
      <Box sx={{ flex: 1 }}>
        <Typography 
          variant="body1" 
          fontWeight="bold"
          sx={{
            color: "primary.main",
            textShadow: "0 0 1px rgba(0,0,0,0.1)",
          }}
        >
          {user.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user.email}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserProfile; 