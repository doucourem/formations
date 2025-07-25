import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import  PasswordInput from "@/components/ui/PasswordInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/auth";
import { useAuth } from "@/contexts/auth-context";

import { MessageSquare } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (data: LoginForm) => {
      setIsLoading(true);
      try {
        const user = await login(data.username.trim(), data.password.trim());
        updateUser(user);
        toast({
          title: "Connexion réussie",
          description: `Bienvenue sur AgoraForum, ${user.firstName} ${user.lastName} !`,
        });
        setTimeout(() => {
          window.history.pushState(null, "", "/");
          setLocation("/");
        }, 100);
      } catch {
        toast({
          title: "Erreur de connexion",
          description: "Nom d'utilisateur ou mot de passe incorrect",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setLocation, toast, updateUser]
  );

  const sharedInputClass =
    "h-16 border-2 border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-2xl text-gray-800 placeholder-gray-500 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl focus:shadow-2xl px-5 text-center placeholder:text-center text-[17px] leading-[64px] transition-all duration-300";

  return (
    <div className="h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 sm:p-10">
            <div className="text-center mb-10">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-xl">
                <MessageSquare className="text-white text-3xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2">
                AgoraForum
              </h1>
              <div className="w-12 h-1 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-full mx-auto" />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nom d'utilisateur"
                          disabled={isLoading}
                          autoComplete="username"
                          inputMode="text"
                          className={sharedInputClass}
                          aria-label="Nom d'utilisateur"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              
                        <PasswordInput

                        />
                     
                
  

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white font-semibold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        Connexion...
                      </div>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
