import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { formatDateOnly } from "../utils/timestamp";

interface DateSeparatorProps {
  date: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        my: 2,
        px: 2,
      }}
    >
      <Divider sx={{ flex: 1, mr: 2 }} />
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          backgroundColor: "background.paper",
          px: 2,
          py: 0.5,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          fontSize: "0.75rem",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {formatDateOnly(date)}
      </Typography>
      <Divider sx={{ flex: 1, ml: 2 }} />
    </Box>
  );
};

export default DateSeparator; 