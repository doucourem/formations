import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { Loader2, Database, Wifi, CheckCircle } from "lucide-react";

interface InitialDataLoaderProps {
  children: React.ReactNode;
}

export default function InitialDataLoader({ children }: InitialDataLoaderProps) {
  const { user, isDataLoading } = useAuth();
  const [loadingSteps, setLoadingSteps] = useState({
    auth: false,
    connection: false,
    data: false,
    complete: false
  });
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (user && isDataLoading) {
      setShowLoader(true);
      
      // Séquence de chargement réaliste basée sur les vraies données
      const loadingSequence = async () => {
        // Étape 1: Authentification (immédiate car utilisateur déjà défini)
        setLoadingSteps(prev => ({ ...prev, auth: true }));
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Étape 2: Connexion base de données
        setLoadingSteps(prev => ({ ...prev, connection: true }));
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Étape 3: Chargement des données
        setLoadingSteps(prev => ({ ...prev, data: true }));
        // Attendre plus longtemps car les vraies données prennent du temps
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Étape 4: Terminé
        setLoadingSteps(prev => ({ ...prev, complete: true }));
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Masquer le loader
        setShowLoader(false);
      };
      
      loadingSequence();
    }
  }, [user, isDataLoading]);

  // Écouter la fin du chargement des données
  useEffect(() => {
    if (!isDataLoading && user) {
      setShowLoader(false);
    }
  }, [isDataLoading, user]);

  if (!showLoader || !user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center bg-white shadow-xl">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connexion à GesFinance
          </h2>
          <p className="text-gray-600">
            Chargement de vos données personnelles...
          </p>
        </div>

        <div className="space-y-4">
          {/* Étape 1: Authentification */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            {loadingSteps.auth ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            )}
            <span className={`font-medium ${loadingSteps.auth ? 'text-green-700' : 'text-gray-700'}`}>
              Authentification
            </span>
          </div>

          {/* Étape 2: Connexion */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            {loadingSteps.connection ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : loadingSteps.auth ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <Wifi className="w-5 h-5 text-gray-400" />
            )}
            <span className={`font-medium ${loadingSteps.connection ? 'text-green-700' : loadingSteps.auth ? 'text-gray-700' : 'text-gray-400'}`}>
              Connexion base de données
            </span>
          </div>

          {/* Étape 3: Données */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            {loadingSteps.data ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : loadingSteps.connection ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <Database className="w-5 h-5 text-gray-400" />
            )}
            <span className={`font-medium ${loadingSteps.data ? 'text-green-700' : loadingSteps.connection ? 'text-gray-700' : 'text-gray-400'}`}>
              Chargement des données
            </span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            {!loadingSteps.auth && "Vérification de votre identité..."}
            {loadingSteps.auth && !loadingSteps.connection && "Établissement de la connexion..."}
            {loadingSteps.connection && !loadingSteps.data && "Récupération de vos transactions..."}
            {loadingSteps.data && !loadingSteps.complete && "Finalisation..."}
            {loadingSteps.complete && "Connexion établie avec succès !"}
          </p>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Utilisateur: {user.firstName} {user.lastName}
        </div>
      </Card>
    </div>
  );
}