import React from "react";
import { Card, Box, Typography, useTheme } from "@mui/material";

export default function StatCard({ icon, label, value }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 3,
        minWidth: 150,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: 3,
        backgroundColor: theme.palette.background.paper,
        textAlign: "center",
      }}
    >
      <Box fontSize="2.5rem" mb={1} color={theme.palette.primary.main}>
        {icon}
      </Box>
      <Typography variant="h5" fontWeight="bold">
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Card>
  );
}
