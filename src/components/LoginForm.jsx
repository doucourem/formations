import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from "@mui/material";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    console.log(data);
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
          label="Nom d'utilisateur"
          fullWidth
          {...register("username", { required: "Nom requis" })}
          error={!!errors.username}
          helperText={errors.username?.message}
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
