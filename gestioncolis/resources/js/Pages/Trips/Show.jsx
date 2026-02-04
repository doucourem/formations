import React from "react";
import {
  Box, Typography, Paper, Divider, Stack, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from "@mui/material";
import { Inertia } from "@inertiajs/inertia";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

// Icônes
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MapIcon from "@mui/icons-material/Map";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InventoryIcon from "@mui/icons-material/Inventory";
import PrintIcon from "@mui/icons-material/Print";

export default function TripShow({ trip }) {
  if (!trip) {
    return (
      <AuthenticatedLayout>
        <Typography sx={{ p: 3 }}>Chargement des données logistiques...</Typography>
      </AuthenticatedLayout>
    );
  }

  const formatDateFR = (date) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch { return date; }
  };

  return (
    <AuthenticatedLayout>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
        
        {/* En-tête de navigation */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
             <Box sx={{ bgcolor: '#1A237E', p: 1, borderRadius: 2 }}>
                <MapIcon sx={{ color: 'white' }} />
             </Box>
             <Box>
                <Typography variant="h4" fontWeight="900" color="#1A237E">
                    Voyage #{trip.id}
                </Typography>
                <Typography variant="body2" color="textSecondary">Manifeste de chargement fret</Typography>
             </Box>
          </Stack>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => Inertia.get(route("trips.index"))}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Retour au planning
          </Button>
        </Stack>

        <Grid container spacing={3}>
            {/* Colonne Gauche : Détails Techniques du Voyage */}
            <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E0E0E0', height: '100%' }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>ITINÉRAIRE & VÉHICULE</Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="caption" fontWeight="bold" color="primary">TRAJET</Typography>
                            <Typography variant="h6" fontWeight="bold">
                                {trip.route?.departureCity?.name} → {trip.route?.arrivalCity?.name}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" fontWeight="bold" color="primary">VÉHICULE ASSIGNÉ</Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <LocalShippingIcon sx={{ mr: 1, fontSize: 20 }} />
                                {trip.bus?.model || "Standard"} ({trip.bus?.registration_number || "N/A"})
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" fontWeight="bold" color="primary">HORAIRES PRÉVUS</Typography>
                            <Stack spacing={1} mt={1}>
                                <Typography variant="body2"><strong>Départ :</strong> {formatDateFR(trip.departure_at)}</Typography>
                                <Typography variant="body2"><strong>Arrivée :</strong> {formatDateFR(trip.arrival_at)}</Typography>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>
            </Grid>

            {/* Colonne Droite : Liste des Colis Chargés */}
            <Grid item xs={12} md={8}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E0E0E0' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                            <InventoryIcon sx={{ mr: 1.5, color: '#1A237E' }} />
                            Colis en soute ({trip.parcels?.length || 0})
                        </Typography>
                        <Button variant="contained" startIcon={<PrintIcon />} sx={{ bgcolor: '#1A237E' }}>
                            Imprimer Manifeste
                        </Button>
                    </Stack>

                    {trip.parcels?.length > 0 ? (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Tracking #</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Expéditeur</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Destinataire</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Poids/Qté</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {trip.parcels.map((parcel) => (
                                        <TableRow key={parcel.id} hover>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#1A237E' }}>
                                                {parcel.tracking_number}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{parcel.sender_name}</Typography>
                                                <Typography variant="caption" color="textSecondary">{parcel.sender_phone}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{parcel.recipient_name}</Typography>
                                                <Typography variant="caption" color="textSecondary">{parcel.recipient_phone}</Typography>
                                            </TableCell>
                                            <TableCell>{parcel.weight_kg} kg</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={parcel.status} 
                                                    size="small" 
                                                    variant="outlined" 
                                                    color={parcel.status === 'delivered' ? 'success' : 'info'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#FDFDFD', borderRadius: 4, border: '2px dashed #EEE' }}>
                            <InventoryIcon sx={{ fontSize: 48, color: '#DDD', mb: 2 }} />
                            <Typography color="textSecondary">Aucun colis n'a été affecté à ce voyage pour le moment.</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
      </Box>
    </AuthenticatedLayout>
  );
}