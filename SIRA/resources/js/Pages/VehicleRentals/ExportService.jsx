import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

export const exportRentalToPDF = (rental, expenses, logo) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // --- Helpers de formatage ---
   const formatMoney = (num) => {
  if (!num && num !== 0) return "0";
  const parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(","); // décimales séparées par ","
};
  const formatDate = (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "—");

  // 1. EN-TÊTE (Logo + Titre)
  if (logo) {
    doc.addImage(logo, "PNG", margin, 10, 25, 15);
  }
  
  doc.setFontSize(18).setFont("helvetica", "bold").setTextColor(40);
  doc.text("RÉSUMÉ DE LOCATION", 50, 18);
  
  doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(100);
  doc.text(`Édité le : ${dayjs().format("DD/MM/YYYY à HH:mm")}`, 50, 23);
  doc.text(`Référence dossier : #RENT-${rental.id}`, 50, 27);

  // 2. BLOC INFOS GÉNÉRALES (Utilisation d'autoTable pour l'alignement parfait)
  autoTable(doc, {
    startY: 35,
    margin: { left: margin },
    tableWidth: 'auto',
    body: [
      [{ content: "DÉTAILS DU CONTRAT", colSpan: 4, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }],
      ["Client:", { content: rental.customer_name, styles: { fontStyle: 'bold' } }, "Véhicule:", rental.vehicle_name],
      ["Chauffeur:", rental.driver_name || "Sans chauffeur", "Contrat:", rental.contract_model],
      ["Trajet:", `${rental.departure_location} -> ${rental.arrival_location}`, "Période:", `${formatDate(rental.rental_start)} au ${formatDate(rental.rental_end)}`],
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'italic', textColor: 100 }, 2: { fontStyle: 'italic', textColor: 100 } }
  });

  let currentY = doc.lastAutoTable.finalY + 10;

  // 3. RÉSUMÉ FINANCIER (Style "Facture")
  const totalDepenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const soldeNet = (rental.price || 0) - totalDepenses;

  doc.setFontSize(12).setFont("helvetica", "bold").setTextColor(40);
  doc.text("BILAN FINANCIER", margin, currentY);
  
  autoTable(doc, {
    startY: currentY + 2,
    margin: { left: margin },
    tableWidth: 100, // On limite la largeur pour laisser de la place
    body: [
      ["Prix de la location", formatMoney(rental.price)],
      ["Total des dépenses", `${formatMoney(totalDepenses)}`],
      [{ content: "SOLDE NET RÉEL", styles: { fontStyle: 'bold', textColor: [21, 101, 192] } }, 
       { content: formatMoney(soldeNet), styles: { fontStyle: 'bold', textColor: [21, 101, 192] } }],
    ],
    theme: 'striped',
    styles: { fontSize: 9 }
  });

  // Bloc "Paiement" à droite du bilan financier
  doc.setFontSize(10).text("État du Paiement", 130, currentY + 5);
  doc.setFontSize(14).text(formatMoney(rental.total_paid), 130, currentY + 12);
  doc.setFontSize(8).setTextColor(150).text(`Reste à payer : ${formatMoney(rental.balance)}`, 130, currentY + 17);

  currentY = doc.lastAutoTable.finalY + 10;

  // 4. TABLEAU DES DÉPENSES
  if (expenses.length > 0) {
    doc.setFontSize(11).setFont("helvetica", "bold").setTextColor(40);
    doc.text("DÉTAIL DES DÉPENSES", margin, currentY);
    
    autoTable(doc, {
      startY: currentY + 2,
      head: [["Type", "Description", "Montant"]],
      body: expenses.map((e) => [e.type, e.description || "-", formatMoney(e.amount)]),
      headStyles: { fillColor: [211, 47, 47] }, // Rouge discret pour les dépenses
      styles: { fontSize: 8 },
    });
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // 5. TABLEAU DES PAIEMENTS
  if (rental.payments?.length > 0) {
    doc.setFontSize(11).setFont("helvetica", "bold").setTextColor(40);
    doc.text("HISTORIQUE DES PAIEMENTS", margin, currentY);
    
    autoTable(doc, {
      startY: currentY + 2,
      head: [["Date", "Méthode", "Réceptionné par", "Montant"]],
      body: rental.payments.map((p) => [
        formatDate(p.created_at),
        p.method,
        p.user?.name || "—",
        formatMoney(p.amount)
      ]),
      headStyles: { fillColor: [46, 125, 50] }, // Vert pour les paiements
      styles: { fontSize: 8 },
    });
    currentY = doc.lastAutoTable.finalY + 15;
  }

  // 6. PIED DE PAGE & SIGNATURE
  const footerY = Math.max(currentY, 250); // S'assure que c'est en bas si peu de données
  
  doc.setDrawColor(200);
  doc.line(margin, footerY, pageWidth - margin, footerY); // Ligne de séparation
  
  doc.setFontSize(9).setFont("helvetica", "bold").text("Cachet & Signature Client", margin, footerY + 8);
  doc.rect(margin, footerY + 10, 50, 20); // Case signature client

  doc.text("Visa Entreprise", pageWidth - 64, footerY + 8);
  doc.rect(pageWidth - 64, footerY + 10, 50, 20); // Case signature entreprise

  // Sauvegarde
  doc.save(`Facture_Location_${rental.id}_${dayjs().format("YYYYMMDD")}.pdf`);
};