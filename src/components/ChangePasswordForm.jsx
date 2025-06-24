import React from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import "./LoginForm.css"; // Reuse CSS from login form

const ChangePasswordForm = () => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const newPassword = watch('new_password');

  const onSubmit = async (data) => {
    if (data.new_password !== data.confirm_password) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/change-password/", {
        old_password: data.old_password,
        new_password: data.new_password,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`
        }
      });

      alert("Mot de passe changé avec succès !");
      reset();
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors du changement.");
    }
  };

  return (
        <div className="login-container"> {/* ⬅️ Centrage ici */}
    
    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
      <h2>Changer le mot de passe</h2>

      <label>Ancien mot de passe</label>
      <input type="password" {...register("old_password", { required: true })} />

      <label>Nouveau mot de passe</label>
      <input type="password" {...register("new_password", { required: true })} />

      <label>Confirmer le nouveau mot de passe</label>
      <input type="password" {...register("confirm_password", { required: true })} />

      {errors.confirm_password && <p className="error">Confirmation requise</p>}

      <button type="submit">Mettre à jour</button>
    </form>
    </div>
  );
};

export default ChangePasswordForm;
