import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

const TypingIndicator = ({ show }: { show: boolean }) => {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 400);
    return () => clearInterval(interval);
  }, [show]);

  return (
    <Box
      sx={{
        minHeight: 15, // Reserve space
        transition: "opacity 0.4s, height 0.4s",
        opacity: show ? 1 : 0,
        height: show ? 15 : 0,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        pl: 2,
      }}
    >
      <Typography variant="body2" color="gray">
        {`Typing${".".repeat(dotCount)}`}
      </Typography>
    </Box>
  );
};

export default TypingIndicator; 