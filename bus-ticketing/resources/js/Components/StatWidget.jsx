import { Card, Box, Typography, Stack } from "@mui/material";

/**
 * StatWidget - Composant de tableau de bord réutilisable
 * @param {string} label - Le nom de la métrique (ex: "Véhicules")
 * @param {string|number} value - La valeur à afficher (ex: "15" ou "2M FCFA")
 * @param {element} icon - L'icône Material UI
 * @param {string} color - Couleur principale (ex: "primary.main", "error.main", "#1976d2")
 * @param {string} trend - (Optionnel) Pourcentage d'évolution (ex: "+10%")
 */
export default function StatWidget({ label, value, icon, color = "primary.main", trend }) {
  return (
    <Card sx={{ 
      p: 3, 
      borderRadius: 4, 
      boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
      border: "1px solid rgba(0,0,0,0.02)",
      transition: "transform 0.2s ease-in-out",
      "&:hover": { transform: "translateY(-4px)" }
    }}>
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Conteneur de l'icône avec fond translucide */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            borderRadius: "12px",
            bgcolor: (theme) => {
              // Gère les couleurs MUI (primary.main) ou Hex (#ffffff)
              const parts = color.split('.');
              const baseColor = parts.length > 1 ? theme.palette[parts[0]][parts[1]] : color;
              return `${baseColor}15`; 
            },
            color: color,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography 
            variant="overline" 
            sx={{ 
              display: 'block',
              color: "text.secondary", 
              fontWeight: 700, 
              lineHeight: 1.2,
              mb: 0.5 
            }}
          >
            {label}
          </Typography>
          
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
              {value}
            </Typography>
            
            {trend && (
              <Box sx={{ 
                px: 0.8, 
                py: 0.2, 
                borderRadius: 1, 
                bgcolor: "success.lighter", // Nécessite une config theme ou remplacez par "#e8f5e9"
                color: "success.main" 
              }}>
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                  {trend}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}