import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Stack
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import axios from "axios";

export default function ExpensesDashboard() {
  const [tripExpenses, setTripExpenses] = useState([]);
  const [rentalExpenses, setRentalExpenses] = useState([]);
  const [deliveryExpenses, setDeliveryExpenses] = useState([]);

  useEffect(() => {
    axios.get("/trips/expenses/total-by-type")
      .then(res => setTripExpenses(res.data))
      .catch(console.error);

    axios.get("/vehicle-rentals/expenses/total-by-type")
      .then(res => setRentalExpenses(res.data))
      .catch(console.error);

    axios.get("/deliveries/expenses/total-by-type")
      .then(res => setDeliveryExpenses(res.data))
      .catch(console.error);
  }, []);

  const renderChart = (data, title) => (
    <Card sx={{ borderRadius: 3, mb: 3 }}>
      <CardHeader title={<Typography variant="h6">{title}</Typography>} />
      <Divider />
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>

        <Stack mt={2} spacing={1}>
          {data.map(d => (
            <Typography key={d.type}>
              {d.type.toUpperCase()} : {Number(d.total).toLocaleString()} FCFA
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <div>
      {tripExpenses.length > 0 &&
        renderChart(tripExpenses, "Dépenses – Tous les Voyages")}

      {rentalExpenses.length > 0 &&
        renderChart(rentalExpenses, "Dépenses – Toutes les Locations")}

      {deliveryExpenses.length > 0 &&
        renderChart(deliveryExpenses, "Dépenses – Toutes les Livraisons")}
    </div>
  );
}
