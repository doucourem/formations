import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, // Ajouté ici
  Paper, 
  Chip, 
  Avatar, 
  Typography, 
  IconButton 
} from "@mui/material";
import { MoreVert, LocalShipping } from "@mui/icons-material";

const rows = [
  { id: 1, plate: "AA-456-CK", model: "Mercedes Actros", driver: "Moussa Diop", status: "En mission", color: "success" },
  { id: 2, plate: "BB-789-LL", model: "Volvo FH16", driver: "Jean Bakary", status: "Garage", color: "error" },
  { id: 3, plate: "CC-123-ZZ", model: "Scania R500", driver: "Ousmane Tall", status: "Disponible", color: "info" },
];

export default function InventoryList() {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: 'hidden' }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8f9fa" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Véhicule</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Chauffeur</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Statut</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "primary.light", borderRadius: 2 }}>
                    <LocalShipping fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", lineHeight: 1 }}>
                        {row.plate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {row.model}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{row.driver}</Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={row.status} 
                  color={row.color} 
                  size="small" 
                  sx={{ fontWeight: "bold", borderRadius: 1.5 }} 
                />
              </TableCell>
              <TableCell align="right">
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}