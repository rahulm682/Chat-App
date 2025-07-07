import React from "react";
import {
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

interface UserMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ anchorEl, onClose, onLogout }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <MenuItem onClick={onClose}>
        <PersonIcon sx={{ mr: 2 }} />
        Profile (Coming Soon)
      </MenuItem>
      <MenuItem onClick={onClose}>
        <SettingsIcon sx={{ mr: 2 }} />
        Settings (Coming Soon)
      </MenuItem>
      <Divider />
      <MenuItem onClick={onLogout} sx={{ color: "error.main" }}>
        <LogoutIcon sx={{ mr: 2 }} />
        Logout
      </MenuItem>
    </Menu>
  );
};

export default UserMenu; 