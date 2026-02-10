import React from "react";
import { Card, Box, Typography, useTheme } from "@mui/material";

export default function FeatureCard({ icon, title }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 2,
        minWidth: 130,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: 3,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box fontSize="2rem" mb={1} color={theme.palette.success.main}>
        {icon}
      </Box>
      <Typography fontWeight="bold" textAlign="center">
        {title}
      </Typography>
    </Card>
  );
}
