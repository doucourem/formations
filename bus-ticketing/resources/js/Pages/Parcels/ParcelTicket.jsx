import React from "react";
import { jsPDF } from "jspdf";
import { Box, Button, Typography } from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";

export default function ParcelTicket({ parcel }) {
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
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      text
    )}`;
    return await getBase64ImageFromURL(url);
  };

  const numberToWordsFR = (n) => {
    const u = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    const t = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante"];

    const c = (x) => {
      if (x < 10) return u[x];
      if (x < 20) return ["dix","onze","douze","treize","quatorze","quinze","seize"][x-10] || `dix-${u[x-10]}`;
      if (x < 70) return t[Math.floor(x/10)] + (x%10 ? "-" + u[x%10] : "");
      if (x < 80) return "soixante-" + c(x-60);
      return "quatre-vingt" + (x%20 ? "-" + c(x-80) : "");
    };

    let r = "";
    if (n >= 1000) { r += c(Math.floor(n/1000)) + " mille "; n %= 1000; }
    if (n >= 100) { r += u[Math.floor(n/100)] + " cent "; n %= 100; }
    if (n > 0) r += c(n);
    return r.trim() || "zéro";
  };

  const generateTicket = async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 200] });
    let y = 8;
    const amount = Number(parcel.price) || 0;
    const center = 40;

    /* HEADER */
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TRANSPORT & LOGISTIQUE", center, y, { align: "center" });
    y += 6;
    doc.text("BILLET DE COLIS", center, y, { align: "center" });
    y += 6;
    doc.line(5, y, 75, y);
    y += 5;

    /* INFO COLIS */
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Date : ${new Date().toLocaleString("fr-FR")}`, 5, y);
    y += 5;
    doc.text(`Tracking : ${parcel.tracking_number || parcel.id}`, 5, y);
    y += 6;
    doc.line(5, y, 75, y);
    y += 5;

    /* EXPÉDITEUR / DESTINATAIRE */
    doc.setFont("helvetica", "bold");
    doc.text("EXPÉDITEUR", 5, y); y += 4;
    doc.setFont("helvetica", "normal");
    doc.text(parcel.sender_name || "-", 5, y); y += 6;

    doc.setFont("helvetica", "bold");
    doc.text("DESTINATAIRE", 5, y); y += 4;
    doc.setFont("helvetica", "normal");
    doc.text(parcel.recipient_name || "-", 5, y); y += 6;

    doc.line(5, y, 75, y); y += 6;

    /* DETAILS TECHNIQUES */
    doc.text(`Poids : ${parcel.weight_kg ?? "-"} kg`, 5, y); y += 5;
    doc.text(`Statut : ${parcel.status}`, 5, y); y += 6;

    /* MONTANT */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${amount.toLocaleString("fr-FR")} FCFA`, center, y, { align: "center" });
    y += 6;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    const words = doc.splitTextToSize(`${numberToWordsFR(amount)} francs CFA`, 70);
    doc.text(words, 5, y);
    y += words.length * 4 + 4;

    /* QR CODE */
    const qr = await getQRCodeBase64(parcel.tracking_number || parcel.id);
    doc.addImage(qr, "PNG", 25, y, 30, 30);
    y += 34;

    doc.setFontSize(7);
    doc.text("Scanner pour le suivi", center, y, { align: "center" });
    y += 6;
    doc.line(5, y, 75, y); y += 4;
    doc.text("Merci pour votre confiance", center, y, { align: "center" });

    doc.save(`ticket_${parcel.tracking_number || parcel.id}.pdf`);
  };

  return (
    <Box textAlign="center" mt={4}>
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={generateTicket}
      >
        Télécharger le billet
      </Button>
    </Box>
  );
}
