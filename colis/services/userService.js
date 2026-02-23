// src/services/userService.js
import supabase  from "../supabaseClient";

export async function createDefaultUser(email, password) {
  try {
    // 1️⃣ Création dans Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    const user = data.user;

    // 2️⃣ Insertion dans ta table (users/profiles)
    const { error: dbError } = await supabase.from("users").insert([
      {
        id: user.id, // FK vers auth.users
        name: "Nouvel utilisateur",
        role: "user",
        status: "active",
        created_at: new Date(),
      },
    ]);

    if (dbError) throw dbError;

    return { user };
  } catch (err) {
    console.error("❌ createDefaultUser error:", err.message);
    return { error: err };
  }
}
