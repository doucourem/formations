import React from "react";
import { usePage } from "@inertiajs/react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Show() {
  const { thirdParty } = usePage().props; // récupère le tiers et ses transferts depuis le controller
  const transfers = thirdParty.transfers || [];

  return (
    <GuestLayout>
      <Card sx={{ p: 3, borderRadius: 3 }}>
        <CardHeader title={`Détail des transferts - ${thirdParty.name}`} />
        <CardContent>
          <Box mb={2}>
            <strong>Téléphone :</strong> {thirdParty.phone}
          </Box>

          <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  {["ID", "Expéditeur", "Destinataire", "Montant", "Payé", "Code retrait", "Statut"].map(
                    (col) => (
                      <TableCell
                        key={col}
                        sx={{ backgroundColor: "#1976d2", color: "white", fontWeight: "bold" }}
                      >
                        {col}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {transfers.length > 0 ? (
                  transfers.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell>{t.id}</TableCell>
                      <TableCell>{t.sender_name}</TableCell>
                      <TableCell>{t.receiver_name}</TableCell>
                      <TableCell>{t.amount} XOF</TableCell>
                      <TableCell>{t.paid ? "Oui" : "Non"}</TableCell>
                      <TableCell>{t.withdraw_code}</TableCell>
                      <TableCell>{t.status}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aucun transfert trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
