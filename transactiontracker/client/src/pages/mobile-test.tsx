import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function MobileTestPage() {
  const [username, setUsername] = useState("orange");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testLogin = async () => {
    setIsLoading(true);
    setResult("");
    
    try {
      console.log("🔍 [MOBILE TEST] Starting login test");
      console.log("🔍 [MOBILE TEST] Username:", username);
      console.log("🔍 [MOBILE TEST] Password length:", password.length);
      console.log("🔍 [MOBILE TEST] User Agent:", navigator.userAgent);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });
      
      console.log("🔍 [MOBILE TEST] Response status:", response.status);
      console.log("🔍 [MOBILE TEST] Response headers:", Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log("🔍 [MOBILE TEST] Response data:", data);
      
      if (response.ok) {
        setResult(`✅ SUCCESS: Logged in as ${data.firstName} ${data.lastName}`);
        toast({
          title: "Test réussi",
          description: "Connexion mobile fonctionnelle",
        });
      } else {
        setResult(`❌ FAILED: ${data.message}`);
        toast({
          title: "Test échoué",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("🔍 [MOBILE TEST] Network error:", error);
      setResult(`❌ NETWORK ERROR: ${error}`);
      toast({
        title: "Erreur réseau",
        description: "Impossible de se connecter au serveur",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testMe = async () => {
    try {
      console.log("🔍 [MOBILE TEST] Testing /api/auth/me");
      
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      console.log("🔍 [MOBILE TEST] /me Response status:", response.status);
      const data = await response.json();
      console.log("🔍 [MOBILE TEST] /me Response data:", data);
      
      toast({
        title: "Test session",
        description: response.ok ? `Session active: ${data.username}` : "Pas de session",
        variant: response.ok ? "default" : "destructive",
      });
    } catch (error) {
      console.error("🔍 [MOBILE TEST] /me error:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Mobile Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nom d'utilisateur</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="orange"
              style={{ fontSize: '16px' }}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Mot de passe</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez le mot de passe"
              style={{ fontSize: '16px' }}
            />
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={testLogin} 
              disabled={isLoading || !password}
              className="w-full"
            >
              {isLoading ? "Test en cours..." : "Test Connexion"}
            </Button>
            
            <Button 
              onClick={testMe} 
              variant="outline"
              className="w-full"
            >
              Test Session
            </Button>
          </div>
          
          {result && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            <p>User Agent: {navigator.userAgent.slice(0, 60)}...</p>
            <p>Viewport: {window.innerWidth}x{window.innerHeight}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}