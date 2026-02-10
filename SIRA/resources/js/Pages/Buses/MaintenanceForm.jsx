import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Stack,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material";

export default function MaintenanceForm({
  bus,
  garages = [],
  maintenancePlans = [],
  maintenance = null,
  closeDialog,
}) {
  const isEdit = Boolean(maintenance);

  // -----------------------------
  // State
  // -----------------------------
  const [form, setForm] = useState({
    bus_id: bus.id,
    maintenance_plan_id: "",
    maintenance_date: "",
    mileage: "",
    cost: "",
    labour_cost: "",
    parts: "",
    duration_hours: "",
    garage_id: "",
    photo_before: null,
    photo_after: null,
    notes: "",
    type: "", // <-- ajouté
  });

  const [tasks, setTasks] = useState([]);
  const [previewBefore, setPreviewBefore] = useState(null);
  const [previewAfter, setPreviewAfter] = useState(null);

  // -----------------------------
  // Init en mode édition
  // -----------------------------
  useEffect(() => {
    if (isEdit) {
      setForm({
        bus_id: bus.id,
        maintenance_plan_id: maintenance.maintenance_plan_id ?? "",
        maintenance_date: maintenance.maintenance_date ?? "",
        mileage: maintenance.mileage ?? "",
        cost: maintenance.cost ?? "",
        labour_cost: maintenance.labour_cost ?? "",
        parts: maintenance.parts ?? "",
        duration_hours: maintenance.duration_hours ?? "",
        garage_id: maintenance.garage_id ?? "",
        photo_before: null,
        photo_after: null,
        notes: maintenance.notes ?? "",
        type: maintenance.type ?? "", // <-- ajouté
      });

      if (maintenance.photo_before) setPreviewBefore(`/storage/${maintenance.photo_before}`);
      if (maintenance.photo_after) setPreviewAfter(`/storage/${maintenance.photo_after}`);
    }
  }, [isEdit, maintenance, bus.id]);

  // -----------------------------
  // Charger les tâches du plan
  // -----------------------------
  useEffect(() => {
    if (form.maintenance_plan_id) {
      axios
        .get(route("maintenance-plans.tasks", form.maintenance_plan_id))
        .then((res) => {
          const formatted = res.data.map((t) => ({
            id: t.id,
            task_name: t.task_name,
            status: "ok",
          }));
          setTasks(formatted);
        });
    } else {
      setTasks([]);
    }
  }, [form.maintenance_plan_id]);

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleChange = (field) => (e) => {
    const value = e.target.type === "file" ? e.target.files[0] : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));

    // Preview image
    if (e.target.type === "file" && value) {
      const url = URL.createObjectURL(value);
      field === "photo_before" ? setPreviewBefore(url) : setPreviewAfter(url);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") formData.append(key, value);
    });

    formData.append("tasks", JSON.stringify(tasks));

    if (isEdit) {
      formData.append("_method", "PUT");
      router.post(route("bus.maintenance.update", maintenance.id), formData, {
        forceFormData: true,
        onSuccess: () => closeDialog?.(),
      });
    } else {
      router.post(route("bus.maintenance.store"), formData, {
        forceFormData: true,
        onSuccess: () => closeDialog?.(),
      });
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h6" mb={2}>
        {isEdit ? "Modifier la maintenance" : "Ajouter une maintenance"}
      </Typography>

      <Stack spacing={3}>
        {/* Plan d’entretien et date */}
        <Stack spacing={2}>
          <TextField
            select
            fullWidth
            label="Plan d’entretien"
            value={form.maintenance_plan_id}
            onChange={(e) => setForm({ ...form, maintenance_plan_id: e.target.value })}
            required
          >
            {maintenancePlans.map((plan) => (
              <MenuItem key={plan.id} value={plan.id}>
                {plan.name} ({plan.interval_value} {plan.interval_type})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Type de maintenance"
            value={form.type}
            onChange={handleChange("type")}
            required
          >
            <MenuItem value="routine">Routine</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
            <MenuItem value="inspection">Inspection</MenuItem>
          </TextField>

          <TextField
            type="date"
            fullWidth
            label="Date de maintenance"
            InputLabelProps={{ shrink: true }}
            value={form.maintenance_date}
            onChange={handleChange("maintenance_date")}
            required
          />

          <TextField
            type="number"
            fullWidth
            label="Kilométrage"
            value={form.mileage}
            onChange={handleChange("mileage")}
          />
        </Stack>

        <Divider />

        {/* Checklist */}
        {tasks.length > 0 && (
          <>
            <Typography fontWeight="bold">Checklist</Typography>
            <Stack spacing={1}>
              {tasks.map((task, index) => (
                <TextField
                  key={task.id}
                  select
                  fullWidth
                  label={task.task_name}
                  value={task.status}
                  onChange={(e) => {
                    const updated = [...tasks];
                    updated[index].status = e.target.value;
                    setTasks(updated);
                  }}
                >
                  <MenuItem value="ok">OK</MenuItem>
                  <MenuItem value="replaced">Remplacé</MenuItem>
                  <MenuItem value="repair">À réparer</MenuItem>
                </TextField>
              ))}
            </Stack>
            <Divider />
          </>
        )}

        {/* Coûts */}
        <Stack spacing={2}>
          <TextField
            type="number"
            fullWidth
            label="Coût total (FCFA)"
            value={form.cost}
            onChange={handleChange("cost")}
          />
          <TextField
            type="number"
            fullWidth
            label="Coût main d’œuvre (FCFA)"
            value={form.labour_cost}
            onChange={handleChange("labour_cost")}
          />
        </Stack>

        <Divider />

        {/* Pièces & durée */}
        <Stack spacing={2}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Pièces changées"
            value={form.parts}
            onChange={handleChange("parts")}
          />
          <TextField
            type="number"
            fullWidth
            label="Durée maintenance (heures)"
            value={form.duration_hours}
            onChange={handleChange("duration_hours")}
          />
        </Stack>

        <Divider />

        {/* Garage */}
        <TextField
          select
          fullWidth
          label="Garage"
          value={form.garage_id}
          onChange={handleChange("garage_id")}
        >
          <MenuItem value="">— Aucun —</MenuItem>
          {garages.map((garage) => (
            <MenuItem key={garage.id} value={garage.id}>
              {garage.name}
            </MenuItem>
          ))}
        </TextField>

        <Divider />

        {/* Photos */}
        <Stack spacing={2}>
          <TextField
            type="file"
            fullWidth
            label="Photo avant"
            InputLabelProps={{ shrink: true }}
            onChange={handleChange("photo_before")}
          />
          {previewBefore && (
            <img src={previewBefore} alt="Avant" width={130} style={{ borderRadius: 8 }} />
          )}

          <TextField
            type="file"
            fullWidth
            label="Photo après"
            InputLabelProps={{ shrink: true }}
            onChange={handleChange("photo_after")}
          />
          {previewAfter && (
            <img src={previewAfter} alt="Après" width={130} style={{ borderRadius: 8 }} />
          )}
        </Stack>

        <Divider />

        {/* Notes */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Notes"
          value={form.notes}
          onChange={handleChange("notes")}
        />

        {/* Bouton */}
        <Button variant="contained" type="submit" size="large" sx={{ alignSelf: "flex-end" }}>
          {isEdit ? "Mettre à jour" : "Ajouter"}
        </Button>
      </Stack>
    </Box>
  );
}
