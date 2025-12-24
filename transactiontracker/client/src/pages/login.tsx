import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/auth";
import { useAuth } from "@/contexts/auth-context";
import { Coins } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
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

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const user = await login(data.username, data.password);
      updateUser(user);
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${user.firstName} ${user.lastName}`,
      });
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Nom d'utilisateur ou mot de passe incorrect",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="h-screen h-[100vh] h-[100dvh] flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-2xl border-0 bg-white/98 backdrop-blur-sm">
          <CardContent className="p-8 sm:p-10">
            <div className="text-center mb-10">
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-xl">
                <Coins className="text-white text-3xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading tracking-tight mb-3">GesFinance</h1>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mx-auto mt-4"></div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="Entrez votre email" 
                            {...field} 
                            disabled={isLoading}
                            autoComplete="username"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                            inputMode="text"
                            className="h-16 border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl text-gray-800 placeholder-gray-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl focus:shadow-2xl pl-5 pr-5 text-center placeholder:text-center"
                            style={{ fontSize: '17px', lineHeight: '64px' }}
                            onBlur={(e) => {
                              const trimmed = e.target.value.trim();
                              if (trimmed !== e.target.value) {
                                field.onChange(trimmed);
                              }
                            }}
                          />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50/30 to-indigo-50/30 pointer-events-none opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="password"
                            placeholder="Entrez votre mot de passe" 
                            {...field} 
                            disabled={isLoading}
                            autoComplete="current-password"
                            className="h-16 border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl text-gray-800 placeholder-gray-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl focus:shadow-2xl pl-5 pr-5 text-center placeholder:text-center"
                            style={{ fontSize: '17px', lineHeight: '64px' }}
                            onBlur={(e) => {
                              const trimmed = e.target.value.trim();
                              if (trimmed !== e.target.value) {
                                field.onChange(trimmed);
                              }
                            }}
                          />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50/30 to-indigo-50/30 pointer-events-none opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        <span className="text-lg">Connexion...</span>
                      </div>
                    ) : (
                      <span className="text-lg">Connexion</span>
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
