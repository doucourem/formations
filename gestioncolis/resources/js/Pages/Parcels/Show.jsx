import React from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Card, CardHeader, CardContent, Typography, Box, Button,
  Divider, Grid, Chip, Paper, Stack
} from "@mui/material";
import {
  Download as DownloadIcon,
  Payment as PaymentIcon,
  LocationOn,
  QrCode2
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import ParcelTicket80mm from './ParcelTicket80mm'; 
import { format } from "date-fns";

const STATUS_CONFIG = {
  pending: { label: "EN ATTENTE", color: "warning", bg: "#FFF9C4" },
  in_transit: { label: "EN TRANSIT", color: "info", bg: "#E3F2FD" },
  delivered: { label: "LIVRÉ", color: "success", bg: "#C8E6C9" },
};

export default function ParcelDetail({ parcel }) {
  const amount = Number(parcel.price) || 0;
  const remainingAmount = Number(parcel.remaining_amount) || 0;

  const handleDownloadPDF = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const BLUE_FL = [26, 35, 126]; // #1A237E

    doc.setFillColor(...BLUE_FL);
    doc.rect(0, 0, 210, 40, "F");
    doc.setFontSize(22);
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text("FASOLOGISTIQUE - REÇU CLIENT", 20, 25);

    doc.setFontSize(10);
    doc.text(`Tracking ID: ${parcel.tracking_number}`, 150, 25);

    doc.setTextColor(40);
    let y = 55;
    doc.setFontSize(12);
    doc.text("INFORMATIONS D'EXPÉDITION", 20, y);
    doc.line(20, y+2, 190, y+2);

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

    y += 25;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DÉTAILS DU COLIS", 20, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.text(`Désignation: ${parcel.description || 'Colis standard'}`, 20, y);
    y += 7;
    doc.text(`Poids/Quantité: ${parcel.weight_kg} unités`, 20, y);

    y += 20;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y, 170, 20, "F");
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL PAYÉ: ${amount.toLocaleString()} FCFA`, 105, y + 13, { align: "center" });

    doc.setFontSize(8);
    doc.text("Merci de votre confiance en FasoLogistique", 105, 285, { align: "center" });

    doc.save(`Recu_${parcel.tracking_number}.pdf`);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto" }}>

        {/* Barre d'actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="900" color="#1A237E">Détails Fret</Typography>
            <Typography color="textSecondary">Gestion des expéditions internes</Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />} 
            onClick={handleDownloadPDF}
            sx={{ bgcolor: '#1A237E', borderRadius: 2, px: 3 }}
          >
            Imprimer Reçu PDF
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {/* Carte principale */}
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

          {/* Sidebar */}
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

            <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px dashed #BDBDBD', bgcolor: '#FFF' }}>
              <Typography variant="subtitle2" textAlign="center" gutterBottom>TICKET DE CAISSE (80mm)</Typography>
              <ParcelTicket80mm parcel={parcel} />
            </Paper>
          </Grid>

          {/* ----------------- PAIEMENTS ----------------- */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #E0E0E0" }}>
              <CardHeader
                avatar={<PaymentIcon color="primary" />}
                title={<Typography variant="h6" fontWeight="bold">Historique des paiements</Typography>}
                action={
                  remainingAmount > 0 && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => Inertia.get(route('parcels.payment.edit', parcel.id))}
                    >
                      Encaisser un paiement
                    </Button>
                  )
                }
              />
              <CardContent>
                <Stack spacing={2}>
                  <Typography>
                    <strong>Montant total :</strong> {amount.toLocaleString()} FCFA
                  </Typography>
                  <Typography color="success.main">
                    <strong>Déjà payé :</strong> {(parcel.paid_amount || 0).toLocaleString()} FCFA
                  </Typography>
                  <Typography color="warning.main">
                    <strong>Reste à payer :</strong> {remainingAmount.toLocaleString()} FCFA
                  </Typography>

                  <Divider />

                  {parcel.payments?.length > 0 ? (
                    <Box>
                      {parcel.payments.map((p) => (
                        <Paper
                          key={p.id}
                          variant="outlined"
                          sx={{ p: 2, mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                          <Typography>{Number(p.paid_amount).toLocaleString()} FCFA</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {format(new Date(p.created_at), "dd/MM/yyyy HH:mm")}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="textSecondary">Aucun paiement enregistré pour ce colis.</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </GuestLayout>
  );
}
