import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  Box,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import type { User } from "../types/auth";
import ThemeToggle from "./ThemeToggle";
import { useNotifications } from "../context/NotificationContext";

interface TopNavbarProps {
  user: User | null;
  onUserMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ user, onUserMenuOpen }) => {
  const { totalUnreadCount } = useNotifications();
  
  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{ bgcolor: "background.paper", color: "text.primary" }}
    >
      <Toolbar>
        {/* App Title */}
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              fontWeight: "bold",
              color: "primary.main",
              textShadow: "0 0 1px rgba(0,0,0,0.1)",
            }}
          >
            Chat App
          </Typography>
          {totalUnreadCount > 0 && (
            <Chip
              label={totalUnreadCount}
              color="primary"
              size="small"
              sx={{ 
                ml: 1,
                fontSize: "0.7rem",
                height: "20px",
                "& .MuiChip-label": {
                  px: 1,
                },
              }}
            />
          )}
        </Box>

        {/* Search Button */}
        <Tooltip title="Search">
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <SearchIcon />
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Settings */}
        <Tooltip title="Settings">
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile Menu */}
        <Tooltip title="User Menu">
          <IconButton onClick={onUserMenuOpen} sx={{ p: 0 }}>
            <Avatar
              src={user?.avatarUrl}
              alt={user?.name}
              sx={{ width: 32, height: 32 }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar; 