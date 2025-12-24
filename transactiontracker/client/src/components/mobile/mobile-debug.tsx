import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

interface DebugInfo {
  userAgent: string;
  viewport: { width: number; height: number };
  devicePixelRatio: number;
  cookiesEnabled: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  apiResponse: any;
  timestamp: string;
}

export function MobileDebug() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [apiTest, setApiTest] = useState<any>(null);

  const collectDebugInfo = async () => {
    const info: DebugInfo = {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      devicePixelRatio: window.devicePixelRatio,
      cookiesEnabled: navigator.cookieEnabled,
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      apiResponse: null,
      timestamp: new Date().toISOString()
    };

    // Test API call
    try {
      const response = await fetch(`/api/stats/user?userId=${user?.id}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      info.apiResponse = {
        status: response.status,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      };
      setApiTest(data);
    } catch (error) {
      info.apiResponse = { error: error instanceof Error ? error.message : String(error) };
    }

    setDebugInfo(info);
  };

  useEffect(() => {
    collectDebugInfo();
  }, [user?.id]);

  if (!debugInfo) {
    return <div>Collecte des informations de débogage...</div>;
  }

  return (
    <Card className="p-4 m-4 bg-yellow-50 border-yellow-200">
      <h3 className="font-bold text-yellow-800 mb-4">Debug Mobile - Dette Actuelle</h3>
      
      <div className="space-y-4 text-sm">
        <div>
          <strong>Appareil:</strong>
          <div className="ml-2 text-xs break-all">{debugInfo.userAgent}</div>
        </div>
        
        <div>
          <strong>Écran:</strong> {debugInfo.viewport.width}x{debugInfo.viewport.height} 
          (Ratio: {debugInfo.devicePixelRatio})
        </div>
        
        <div>
          <strong>Stockage:</strong>
          <div className="ml-2">
            Cookies: {debugInfo.cookiesEnabled ? '✓' : '✗'} |
            LocalStorage: {debugInfo.localStorage ? '✓' : '✗'} |
            SessionStorage: {debugInfo.sessionStorage ? '✓' : '✗'}
          </div>
        </div>

        <div>
          <strong>API Response:</strong>
          <div className="ml-2 bg-white p-2 rounded border text-xs overflow-auto">
            <div>Status: {debugInfo.apiResponse?.status}</div>
            <div>Dette Actuelle: {debugInfo.apiResponse?.data?.currentDebt}</div>
            <div>Type: {typeof debugInfo.apiResponse?.data?.currentDebt}</div>
            <div className="mt-2">Données complètes:</div>
            <pre className="text-xs">{JSON.stringify(debugInfo.apiResponse?.data, null, 2)}</pre>
          </div>
        </div>

        <div>
          <strong>Test Formatage:</strong>
          <div className="ml-2 bg-white p-2 rounded border text-xs">
            <div>Valeur brute: {apiTest?.currentDebt}</div>
            <div>Number(): {Number(apiTest?.currentDebt)}</div>
            <div>parseFloat(): {parseFloat(apiTest?.currentDebt || '0')}</div>
            <div>toString(): {String(apiTest?.currentDebt)}</div>
            <div className="mt-2 font-semibold">Tests de formatage Intl:</div>
            <div>Standard: {new Intl.NumberFormat("fr-FR").format(apiTest?.currentDebt || 0)}</div>
            <div>Sans décimales: {new Intl.NumberFormat("fr-FR", {maximumFractionDigits: 0}).format(apiTest?.currentDebt || 0)}</div>
            <div>Décimal explicite: {new Intl.NumberFormat("fr-FR", {style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0}).format(apiTest?.currentDebt || 0)}</div>
            <div className="mt-2 font-semibold">Test navigateur:</div>
            <div>Navigator: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</div>
            <div>Support Intl: {typeof Intl !== 'undefined' ? 'Oui' : 'Non'}</div>
            <div>Locale détectée: {Intl.DateTimeFormat().resolvedOptions().locale}</div>
          </div>
        </div>

        <Button onClick={collectDebugInfo} className="w-full">
          Actualiser Debug
        </Button>
      </div>
    </Card>
  );
}