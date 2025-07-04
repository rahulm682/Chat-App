import React from "react";
import { Box, Typography, Chip } from "@mui/material";

const WelcomeScreen: React.FC = () => {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
        textAlign: "center",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          bgcolor: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          opacity: 0.1,
        }}
      >
        <Typography variant="h1" color="primary.contrastText">
          💬
        </Typography>
      </Box>
      <Typography
        variant="h4"
        color="primary.main"
        gutterBottom
        fontWeight="bold"
        sx={{
          textShadow: "0 0 2px rgba(0,0,0,0.1)",
        }}
      >
        Welcome to Chat App
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 2, maxWidth: 400 }}
      >
        Connect with friends and family through instant messaging. Select a
        chat from the sidebar to start your conversation.
      </Typography>
      <Chip
        label="Real-time messaging"
        color="primary"
        variant="outlined"
        sx={{ mr: 1 }}
      />
      <Chip label="Secure & private" color="success" variant="outlined" />
    </Box>
  );
};

export default WelcomeScreen; 