import supabase from "../supabaseClient";
export const sendAndSaveMessage = async (to, message) => {
  try {
    // 1️⃣ Envoi via Edge Function
 const { data: { session } } = await supabase.auth.getSession();

const token = session?.access_token;

const response = await fetch(
  "https://swjbaulntncrzsxjwhhu.supabase.co/functions/v1/sendMessage",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ to, message }),
  }
);
    if (!response.ok) {
      
  } 
}
catch (err) {
    console.error("Erreur :", err.message);
    return false;
  }
};
