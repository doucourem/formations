import React from "react";
import { Link } from "@inertiajs/react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Show({ company }) {
  return (
    <GuestLayout>
    <Card>
      <CardContent>
        <Typography variant="h5">{company.name}</Typography>
        <Typography>Type : {company.type}</Typography>
        <Typography>Adresse : {company.address}</Typography>
        <Typography>Contact : {company.contact}</Typography>

        <Stack direction="row" spacing={2} mt={2}>
          <Button
            component={Link}
            href={`/companies/${company.id}/edit`}
            variant="contained"
          >
            Modifier
          </Button>
          <Button component={Link} href="/companies">
            Retour
          </Button>
        </Stack>
      </CardContent>
    </Card>
    </GuestLayout>
  );
}
