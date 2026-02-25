import { useState } from "react";
import Sidebar from "@/Components/Sidebar";
import {
  Box,
  Drawer,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  useMediaQuery
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 260;

export default function GuestLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => setOpen(!open);

  return (
    <Box sx={{ display: "flex" }}>
      
      {/* 🔹 Barre du haut (mobile seulement) */}
      {isMobile && (
        <AppBar position="fixed" sx={{ bgcolor: "#fff", color: "#000", boxShadow: 1 }}>
          <Toolbar>
            <IconButton edge="start" onClick={toggleDrawer}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Dashboard</Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* 🔹 Sidebar Desktop */}
      {!isMobile && (
        <Box
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": { width: drawerWidth }
          }}
        >
          <Sidebar />
        </Box>
      )}

      {/* 🔹 Sidebar Mobile (Drawer) */}
      {isMobile && (
        <Drawer open={open} onClose={toggleDrawer}>
          <Sidebar />
        </Drawer>
      )}

      {/* 🔹 Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: "#F5F5F5",
          minHeight: "100vh",
          mt: isMobile ? 8 : 0, // évite que le contenu passe sous la barre mobile
        }}
      >
        {children}
      </Box>
    </Box>
  );
}