import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput  from "@/components/ui/PasswordInput";

const schema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Mot de passe trop court" }),
});

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: any) => {
    console.log("Login data:", data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo + Title */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-2xl w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">🔒</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Connexion</h1>
          <p className="text-gray-500 text-sm">Bienvenue sur votre espace</p>
        </div>

        {/* Form Card */}
        <Card>
          <CardContent className="pt-6 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  placeholder="Email"
                  {...register("email")}
                  type="email"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message?.toString()}
                  </p>
                )}
              </div>

              <div>
                <PasswordInput
                  placeholder="Mot de passe"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message?.toString()}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
