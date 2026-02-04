import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"; // Utilise le layout Pro
import {
  Card, CardHeader, CardContent, Typography, Box, Button,
  Divider, Grid, Chip, Paper, Stack
} from "@mui/material";
import {
  Download as DownloadIcon,
  LocalShipping,
  Person,
  ReceiptLong,
  LocationOn,
  QrCode2
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import ParcelTicket80mm from './ParcelTicket80mm'; 

const STATUS_CONFIG = {
  pending: { label: "EN ATTENTE", color: "warning", bg: "#FFF9C4" },
  in_transit: { label: "EN TRANSIT", color: "info", bg: "#E3F2FD" },
  delivered: { label: "LIVRÉ", color: "success", bg: "#C8E6C9" },
};

export default function ParcelDetail({ parcel }) {
  const amount = Number(parcel.price) || 0;

  // --- LOGIQUE PDF (Reprise et améliorée) ---
  const handleDownloadPDF = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const BLUE_FL = [26, 35, 126]; // #1A237E
    
    // Design du header
    doc.setFillColor(...BLUE_FL);
    doc.rect(0, 0, 210, 40, "F");
    doc.setFontSize(22);
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text("FASOLOGISTIQUE - REÇU CLIENT", 20, 25);
    
    doc.setFontSize(10);
    doc.text(`Tracking ID: ${parcel.tracking_number}`, 150, 25);

    // Contenu
    doc.setTextColor(40);
    let y = 55;
    doc.setFontSize(12);
    doc.text("INFORMATIONS D'EXPÉDITION", 20, y);
    doc.line(20, y+2, 190, y+2);

    // Grid Expéditeur / Destinataire
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.text("EXPÉDITEUR", 20, y);
    doc.text("DESTINATAIRE", 110, y);
    
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.text(`${parcel.sender_name}`, 20, y);
    doc.text(`${parcel.recipient_name}`, 110, y);
    
    y += 5;
    doc.setFontSize(10);
    doc.text(`Tel: ${parcel.sender_phone}`, 20, y);
    doc.text(`Tel: ${parcel.recipient_phone}`, 110, y);

    // Détails Colis
    y += 25;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DÉTAILS DU COLIS", 20, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.text(`Désignation: ${parcel.description || 'Colis standard'}`, 20, y);
    y += 7;
    doc.text(`Poids/Quantité: ${parcel.weight_kg} unités`, 20, y);

    // Zone de prix
    y += 20;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y, 170, 20, "F");
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL PAYÉ: ${amount.toLocaleString()} FCFA`, 105, y + 13, { align: "center" });

    // QR Code et Footer
    try {
      const qr = await getQRCodeBase64(parcel.tracking_number);
      doc.addImage(qr, "PNG", 85, 240, 40, 40);
    } catch(e) {}
    
    doc.setFontSize(8);
    doc.text("Merci de votre confiance en FasoLogistique", 105, 285, { align: "center" });

    doc.save(`Recu_${parcel.tracking_number}.pdf`);
  };

  return (
    <AuthenticatedLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
        
        {/* Barre d'actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="900" color="#1A237E">Détails Fret</Typography>
            <Typography color="textSecondary">Gestion des expéditions internes</Typography>
          </Box>
          <Button 
            variant="contained" 
            disableElevation
            startIcon={<DownloadIcon />} 
            onClick={handleDownloadPDF}
            sx={{ bgcolor: '#1A237E', borderRadius: 2, px: 3 }}
          >
            Imprimer Reçu PDF
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {/* Carte Principale */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #E0E0E0' }}>
              <CardHeader 
                avatar={<QrCode2 color="primary" />}
                title={<Typography variant="h6" fontWeight="bold">{parcel.tracking_number}</Typography>}
                action={
                  <Chip 
                    label={STATUS_CONFIG[parcel.status]?.label} 
                    sx={{ bgcolor: STATUS_CONFIG[parcel.status]?.bg, fontWeight: 'bold' }} 
                  />
                }
                sx={{ borderBottom: '1px solid #F0F0F0' }}
              />
              <CardContent>
                <Grid container spacing={4}>
                  <Grid item xs={6}>
                    <Typography variant="overline" color="textSecondary">Expéditeur</Typography>
                    <Typography variant="body1" fontWeight="bold">{parcel.sender_name}</Typography>
                    <Typography variant="body2">{parcel.sender_phone}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                      <LocationOn fontSize="small" color="disabled" />
                      <Typography variant="caption">Agence: {parcel.departure_agency?.name}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="overline" color="textSecondary">Destinataire</Typography>
                    <Typography variant="body1" fontWeight="bold">{parcel.recipient_name}</Typography>
                    <Typography variant="body2">{parcel.recipient_phone}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                      <LocationOn fontSize="small" color="disabled" />
                      <Typography variant="caption">Agence: {parcel.arrival_agency?.name}</Typography>
                    </Stack>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Contenu du colis</Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {parcel.description || "Aucune description détaillée."}
                </Typography>

                <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                    <Typography variant="caption" color="textSecondary">QUANTITÉ</Typography>
                    <Typography variant="h6" fontWeight="bold">{parcel.weight_kg}</Typography>
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', minWidth: 100, bgcolor: '#F8F9FA' }}>
                    <Typography variant="caption" color="textSecondary">FRAIS DE PORT</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">{amount.toLocaleString()} FCFA</Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar : Image et Ticket de caisse */}
          <Grid item xs={12} md={4}>
             <Card elevation={0} sx={{ borderRadius: 4, mb: 3, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
                <Box 
                  component="img"
                  src={parcel.parcel_image ? `/storage/${parcel.parcel_image}` : 'https://via.placeholder.com/400x300?text=Pas+d+image'}
                  sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                />
                <Box p={2} textAlign="center">
                  <Typography variant="caption" color="textSecondary">Preuve visuelle du dépôt</Typography>
                </Box>
             </Card>

             {/* Le ticket thermique (composant séparé) */}
             <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px dashed #BDBDBD', bgcolor: '#FFF' }}>
                <Typography variant="subtitle2" textAlign="center" gutterBottom>TICKET DE CAISSE (80mm)</Typography>
                <ParcelTicket80mm parcel={parcel} />
             </Paper>
          </Grid>
        </Grid>
      </Box>
    </AuthenticatedLayout>
  );
}