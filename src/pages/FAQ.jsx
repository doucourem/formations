import React from 'react';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FAQ() {
  const faqData = [
    {
      question: "Comment accéder à mes formations après l'achat ?",
      answer:
        "Une fois connecté, cliquez sur votre tableau de bord pour accéder à toutes vos formations disponibles.",
    },
    {
      question: "Puis-je suivre les cours à mon rythme ?",
      answer:
        "Oui, toutes nos formations sont disponibles en ligne en accès illimité 24h/24.",
    },
    {
      question: "Proposez-vous des certificats ?",
      answer:
        "Oui, un certificat de réussite est délivré automatiquement à la fin de chaque formation.",
    },
    {
      question: "Quels sont les moyens de paiement acceptés ?",
      answer:
        "Nous acceptons les paiements par carte bancaire (Visa, Mastercard), PayPal, et mobile money dans certains pays.",
    },
    {
      question: "Puis-je contacter un formateur ?",
      answer:
        "Certains modules proposent un espace de questions. Sinon, vous pouvez contacter le support pour transmettre votre demande.",
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" gutterBottom>
        FAQ – Questions fréquentes
      </Typography>

      <Typography variant="body1" paragraph>
        Retrouvez ici les réponses aux questions les plus posées par nos utilisateurs.
      </Typography>

      <Box mt={4}>
        {faqData.map((faq, index) => (
          <Accordion key={index} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}
