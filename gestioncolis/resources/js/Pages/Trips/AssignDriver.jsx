import React from "react";
import { useForm } from "@inertiajs/react";
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function AssignDriver({ trip, drivers, assignments }) {
  const { data, setData, post, processing } = useForm({
    driver_id: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(`/trips/${trip.id}/assign-driver`);
  };

  return (
    <GuestLayout>
      <Card sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
        <CardHeader title="Affecter un Chauffeur au Trip" />

        <CardContent>
          <Typography variant="h6" mb={2}>
            Trip : {trip.name ?? `#${trip.id}`}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField
              select
              label="Chauffeur"
              fullWidth
              value={data.driver_id}
              onChange={(e) => setData("driver_id", e.target.value)}
              required
            >
              {drivers.map((drv) => (
                <MenuItem key={drv.id} value={drv.id}>
                  {drv.first_name} {drv.last_name} — {drv.phone}
                </MenuItem>
              ))}
            </TextField>

            <Button type="submit" variant="contained" disabled={processing}>
              Affecter
            </Button>
          </Box>

          <Typography variant="h6" mt={4}>Historique des affectations</Typography>

          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Chauffeur</TableCell>
                <TableCell>Date affectation</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {assignments.map(a => (
                <TableRow key={a.id}>
                  <TableCell>
                    {a.driver.first_name} {a.driver.last_name}
                  </TableCell>
                  <TableCell>{a.assigned_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
