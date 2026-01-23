import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, Typography, Divider, Stack } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";

export default function ExpensesDashboard({ tripId, rentalId, deliveryId }) {
  const [tripExpenses, setTripExpenses] = useState([]);
  const [rentalExpenses, setRentalExpenses] = useState([]);
  const [deliveryExpenses, setDeliveryExpenses] = useState([]);

  useEffect(() => {
    if(tripId){
      axios.get(`/trips/${tripId}/expenses/total-by-type`).then(res => setTripExpenses(res.data));
    }
    if(rentalId){
      axios.get(`/vehicle-rentals/${rentalId}/expenses/total-by-type`).then(res => setRentalExpenses(res.data));
    }
    if(deliveryId){
      axios.get(`/deliveries/${deliveryId}/expenses/total-by-type`).then(res => setDeliveryExpenses(res.data));
    }
  }, [tripId, rentalId, deliveryId]);

  const renderChart = (data, title) => (
    <Card sx={{ borderRadius: 3, mb: 3 }}>
      <CardHeader title={<Typography variant="h6">{title}</Typography>} />
      <Divider />
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              {d.type.charAt(0).toUpperCase() + d.type.slice(1)} : {Number(d.total).toLocaleString()} CFA
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <div>
      {tripExpenses.length > 0 && renderChart(tripExpenses, "Dépenses par type - Voyage")}
      {rentalExpenses.length > 0 && renderChart(rentalExpenses, "Dépenses par type - Location Véhicule")}
      {deliveryExpenses.length > 0 && renderChart(deliveryExpenses, "Dépenses par type - Livraison")}
    </div>
  );
}
