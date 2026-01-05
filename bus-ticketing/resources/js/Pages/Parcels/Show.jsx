import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Card, CardHeader, CardContent, Typography, Box } from '@mui/material';

export default function ParcelDetail({ parcel }) {
  const statusFr = {
    pending: "En attente",
    in_transit: "En transit",
    delivered: "Livré",
  };

  return (
    <GuestLayout>
      <Box p={3}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader title={`Colis #${parcel.id} — ${parcel.tracking_number || "-"}`} />
          <CardContent>

            {/* Image du colis */}
            {parcel.image_url && (
              <Box
                component="img"
                src={parcel.image_url}
                alt={`Colis #${parcel.id}`}
                sx={{ width: '100%', maxWidth: 300, borderRadius: 2, mb: 2 }}
              />
            )}

            <Typography><strong>Expéditeur :</strong> {parcel.sender_name || "-"}</Typography>
            <Typography>
              <strong>Agence expéditeur :</strong> {parcel.senderAgency?.name || "-"}
            </Typography>

            <Typography><strong>Destinataire :</strong> {parcel.recipient_name || "-"}</Typography>
            <Typography>
              <strong>Agence destinataire :</strong> {parcel.recipientAgency?.name || "-"}
            </Typography>

            <Typography><strong>Poids :</strong> {parcel.weight_kg ?? "-"} kg</Typography>
            <Typography>
              <strong>Montant :</strong> {(parcel.price ?? 0).toLocaleString()} FCFA
            </Typography>
            <Typography>
              <strong>Statut :</strong> {statusFr[parcel.status] || "-"}
            </Typography>
            <Typography><strong>Description :</strong> {parcel.description || "-"}</Typography>

            {parcel.trip && (
              <Box mt={2}>
                <Typography variant="h6">Voyage associé</Typography>
                <Typography>
                  {parcel.trip.departureCity || "-"} → {parcel.trip.arrivalCity || "-"}<br />
                  Départ : {parcel.trip.departure_at || "-"}<br />
                  Arrivée : {parcel.trip.arrival_at || "-"}<br />
                  Bus : {parcel.trip.bus?.registration_number || "-"}
                </Typography>
              </Box>
            )}

          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
