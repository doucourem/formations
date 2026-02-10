import React from "react";
import { Box, Button } from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import { jsPDF } from "jspdf";

export default function VehicleRentalTicket80mm({ rental }) {
  const ticketWidth = 80; // mm

  // QR Code API + conversion Base64
  const getBase64ImageFromURL = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = url;
    });

  const getQRCodeBase64 = async (text) => {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
      text
    )}`;
    return await getBase64ImageFromURL(url);
  };

  const generateTicket = async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 200] });
    let y = 8;
    const center = ticketWidth / 2;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("LOCATION & TRANSPORT", center, y, { align: "center" });
    y += 6;
    doc.setFontSize(13);
    doc.text("BILLET DE LOCATION", center, y, { align: "center" });
    y += 6;
    doc.line(5, y, 75, y);
    y += 5;

    // Infos
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Date : ${new Date().toLocaleString("fr-FR")}`, 5, y); y += 5;
    doc.text(`ID : ${rental.id}`, 5, y); y += 5;
    doc.text(`Véhicule : ${rental.vehicle_name}`, 5, y); y += 5;
    doc.text(`Client : ${rental.customer_name}`, 5, y); y += 5;

    // Statut
    const statusMap = { active: "Active", completed: "Terminée", cancelled: "Annulée" };
    doc.text(`Statut : ${statusMap[rental.status] || rental.status}`, 5, y); y += 6;

    // Dates
    doc.text(`Début : ${rental.rental_start}`, 5, y); y += 5;
    doc.text(`Fin : ${rental.rental_end}`, 5, y); y += 6;

    doc.line(5, y, 75, y); y += 5;

    // QR Code
    const qr = await getQRCodeBase64(rental.id);
    doc.addImage(qr, "PNG", 25, y, 30, 30);
    y += 34;
    doc.setFontSize(7);
    doc.text("Scanner pour suivi", center, y, { align: "center" });
    y += 6;

    doc.line(5, y, 75, y); y += 4;
    doc.text("Merci pour votre confiance", center, y, { align: "center" });

    doc.save(`ticket_location_${rental.id}.pdf`);
  };

  return (
    <Box textAlign="center" mt={2}>
      <Button variant="contained" startIcon={<DownloadIcon />} onClick={generateTicket}>
        Télécharger le billet
      </Button>
    </Box>
  );
}
