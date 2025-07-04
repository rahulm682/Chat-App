import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";

interface UnreadMessageHighlightProps {
  messageId: string;
  isUnread: boolean;
  children: React.ReactNode;
}

const UnreadMessageHighlight: React.FC<UnreadMessageHighlightProps> = ({
  messageId,
  isUnread,
  children,
}) => {
  const [isHighlighted, setIsHighlighted] = useState(isUnread);

  useEffect(() => {
    if (isUnread) {
      setIsHighlighted(true);
      // Remove highlight after 3 seconds
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isUnread]);

  if (!isHighlighted) {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          backgroundColor: "primary.main",
          borderRadius: "2px",
          animation: "pulse 2s infinite",
        },
        "@keyframes pulse": {
          "0%": {
            opacity: 1,
          },
          "50%": {
            opacity: 0.5,
          },
          "100%": {
            opacity: 1,
          },
        },
      }}
    >
      {children}
    </Box>
  );
};

export default UnreadMessageHighlight; 