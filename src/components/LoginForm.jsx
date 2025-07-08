import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box, Button, Container, IconButton, InputAdornment,
  TextField, Typography
} from "@mui/material";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { supabase } from "../utils/supabaseClient"; // ✅ Import supabase

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async ({ email, password }) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("Connexion réussie !");
      console.log(data);
      // Redirect / store token if needed
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ mt: 8, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography variant="h5" align="center">Connexion</Typography>

        <TextField
          label="Email"
          fullWidth
          {...register("email", { required: "Email requis" })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          label="Mot de passe"
          fullWidth
          type={showPassword ? "text" : "password"}
          {...register("password", { required: "Mot de passe requis" })}
          error={!!errors.password}
          helperText={errors.password?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Button variant="contained" type="submit" fullWidth color="primary">
          Se connecter
        </Button>
      </Box>
    </Container>
  );
}
