import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      await axios.post("http://127.0.0.1:8000/api/register/", data);
      alert("Inscription réussie !");
    } catch (error) {
      alert("Erreur d'inscription");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography variant="h5" align="center">
          Inscription
        </Typography>

        <TextField
          label="Nom d'utilisateur"
          fullWidth
          {...register("username", { required: "Nom requis" })}
          error={!!errors.username}
          helperText={errors.username?.message}
        />

        <TextField
          label="Email"
          type="email"
          fullWidth
          {...register("email", { required: "Email requis" })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          label="Mot de passe"
          type={showPassword ? "text" : "password"}
          fullWidth
          {...register("password", { required: "Mot de passe requis" })}
          error={!!errors.password}
          helperText={errors.password?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button variant="contained" type="submit" fullWidth color="primary">
          S'inscrire
        </Button>
      </Box>
    </Container>
  );
}
