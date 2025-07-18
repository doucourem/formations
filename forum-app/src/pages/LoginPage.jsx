import { useState } from "react";
import axios from "axios";

export default function LoginPage({ setTokens }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    const res = await axios.post("http://localhost:4000/auth/login", {
      email,
      password,
    });
    setTokens(res.data);
  }

  return (
    <form onSubmit={handleLogin} className="p-4 max-w-md mx-auto space-y-4">
      <input
        className="w-full border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        className="w-full border p-2"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button className="w-full bg-blue-600 text-white py-2">Login</button>
    </form>
  );
}
