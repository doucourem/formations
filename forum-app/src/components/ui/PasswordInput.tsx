import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput() {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full max-w-sm">
      <input
        type={show ? "text" : "password"}
        placeholder="Mot de passe"
        className="w-full pr-10 h-12 border border-gray-300 rounded-md px-3 text-base"
        aria-describedby="passwordHelp"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label={show ? "Cacher le mot de passe" : "Afficher le mot de passe"}
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
