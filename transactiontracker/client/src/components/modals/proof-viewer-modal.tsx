import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, X, MessageCircle, Mail, Copy, Trash2, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface ProofViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  proof: string | null;
  proofType: string | null;
  externalProofUrl?: string | null;
  isArchived?: boolean;
  transactionId: number;
  clientName?: string;
  amount?: string;
  isProofShared?: boolean;
}

export default function ProofViewerModal({ 
  isOpen, 
  onClose, 
  proof, 
  proofType, 
  externalProofUrl,
  isArchived = false,
  transactionId,
  clientName = "",
  amount = "",
  isProofShared = false
}: ProofViewerModalProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [archivedProofData, setArchivedProofData] = useState<{type: string, content: string} | null>(null);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const [archivedError, setArchivedError] = useState<string | null>(null);
  const [copiedProofContent, setCopiedProofContent] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  console.log("🗑️ [MODAL DEBUG] Utilisateur connecté:", user?.firstName, "Rôle:", user?.role);

  const deleteProofMutation = useMutation({
    mutationFn: async () => {
      console.log("🗑️ [MODAL DELETE] Suppression de la preuve pour transaction:", transactionId);
      return apiRequest("PATCH", `/api/transactions/${transactionId}`, {
        proof: null,
        proofType: null,
        status: "pending",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Preuve supprimée",
        description: "La preuve a été supprimée avec succès. La transaction est maintenant en attente.",
      });
      onClose(); // Fermer le modal après suppression
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la preuve",
        variant: "destructive",
      });
    },
  });

  const markAsSharedMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/transactions/${transactionId}`, {
        isProofShared: true,
      });
    },
    onMutate: async () => {
      // Mise à jour optimiste du cache
      await queryClient.cancelQueries({ queryKey: ["/api/transactions"] });
      
      const previousTransactions = queryClient.getQueryData(["/api/transactions"]);
      
      queryClient.setQueryData(["/api/transactions"], (old: any) => {
        if (!old) return old;
        return old.map((t: any) => 
          t.id === transactionId 
            ? { ...t, isProofShared: true }
            : t
        );
      });
      
      return { previousTransactions };
    },
    onSuccess: () => {
      // Forcer l'actualisation du cache
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      // Fermer le modal immédiatement - l'icône suffit pour indiquer le partage
      onClose();
    },
    onError: (err, variables, context) => {
      // Restaurer les données précédentes en cas d'erreur
      if (context?.previousTransactions) {
        queryClient.setQueryData(["/api/transactions"], context.previousTransactions);
      }
      console.error("Erreur lors du marquage comme partagé");
    },
  });

  // Charger la preuve archivée si nécessaire
  useEffect(() => {
    if (isOpen && isArchived && externalProofUrl && !proof) {
      setIsLoadingArchived(true);
      setArchivedError(null);
      
      fetch(externalProofUrl, { credentials: 'include' })
        .then(response => {
          if (!response.ok) throw new Error('Impossible de charger la preuve archivée');
          return response.json();
        })
        .then(data => {
          setArchivedProofData(data);
        })
        .catch(error => {
          console.error('Erreur lors du chargement de la preuve archivée:', error);
          setArchivedError(error.message);
        })
        .finally(() => {
          setIsLoadingArchived(false);
        });
    }
  }, [isOpen, isArchived, externalProofUrl, proof]);

  if (!proof && !externalProofUrl && !isArchived) return null;

  const shareData = {
    title: `Preuve de Transaction ${transactionId}`,
    text: `Preuve de paiement ${clientName ? `pour ${clientName}` : ""} ${amount ? `- Montant: ${amount}` : ""}`,
    url: window.location.origin
  };

  const handleNativeShare = async () => {
    const currentProof = archivedProofData?.content || proof;
    const currentProofType = archivedProofData?.type || proofType;
    
    if (navigator.share && currentProofType === "image" && currentProof) {
      try {
        // Convertir le data URL en blob
        const response = await fetch(currentProof);
        const blob = await response.blob();
        const file = new File([blob], `preuve-transaction-${transactionId}.jpg`, { type: 'image/jpeg' });
        
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          files: [file]
        });
        
        // Marquer comme partagé après un partage réussi
        if (!isProofShared) {
          markAsSharedMutation.mutate();
        }
        
        setShowShareMenu(false);
      } catch (error) {
        console.log('Partage natif annulé ou non supporté');
        setShowShareMenu(!showShareMenu);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const shareToWhatsApp = async () => {
    const currentProof = archivedProofData?.content || proof;
    const currentProofType = archivedProofData?.type || proofType;
    
    if (currentProofType === "image") {
      try {
        // Essayer d'abord le partage natif avec fichier
        if (navigator.share && currentProof) {
          const response = await fetch(currentProof);
          const blob = await response.blob();
          const file = new File([blob], `preuve-transaction-${transactionId}.jpg`, { type: 'image/jpeg' });
          
          await navigator.share({
            title: shareData.title,
            text: shareData.text,
            files: [file]
          });
          
          // Marquer comme partagé après un partage réussi
          if (!isProofShared) {
            markAsSharedMutation.mutate();
          }
          
          setShowShareMenu(false);
          return;
        }
        
        // Fallback : télécharger l'image et guider l'utilisateur
        const link = document.createElement('a');
        link.href = currentProof || '';
        link.download = `preuve-transaction-${transactionId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Marquer comme partagé après téléchargement (considéré comme préparation au partage)
        if (!isProofShared) {
          markAsSharedMutation.mutate();
        }
        
        toast({
          title: "Image téléchargée",
          description: "L'image a été téléchargée. Vous pouvez maintenant la partager sur WhatsApp depuis votre galerie.",
          duration: 5000,
        });
        
      } catch (error) {
        // Si le partage natif échoue, utiliser le lien
        const message = encodeURIComponent(`${shareData.text}\n\nVoir la preuve: ${shareData.url}/transaction/${transactionId}`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
      }
    } else {
      // Pour le texte, utiliser le lien
      const message = encodeURIComponent(`${shareData.text}\n\nVoir la preuve: ${shareData.url}/transaction/${transactionId}`);
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
    
    // Marquer comme partagé pour tous les types de partage
    if (!isProofShared) {
      markAsSharedMutation.mutate();
    }
    
    setShowShareMenu(false);
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent(shareData.title);
    const body = encodeURIComponent(`${shareData.text}\n\nConsultez la preuve complète: ${shareData.url}/transaction/${transactionId}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    setShowShareMenu(false);
  };

  const copyTransactionInfo = async () => {
    const textToCopy = `${shareData.title}\n${shareData.text}\nLien: ${shareData.url}/transaction/${transactionId}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Informations copiées",
        description: "Les détails de la transaction ont été copiés",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier les informations",
        variant: "destructive",
      });
    }
    setShowShareMenu(false);
  };

  const copyProofContent = async () => {
    const currentProof = archivedProofData?.content || proof;
    const currentProofType = archivedProofData?.type || proofType;
    
    if (!currentProof) return;
    
    try {
      if (currentProofType === "image" || currentProof.startsWith('data:image/')) {
        // Pour les images, copier l'URL/data de l'image
        await navigator.clipboard.writeText(currentProof);
        toast({
          title: "Copié !",
          description: "L'image a été copiée dans le presse-papiers"
        });
      } else {
        // Pour le texte, copier le contenu directement
        await navigator.clipboard.writeText(currentProof);
        toast({
          title: "Copié !",
          description: "Le texte de la preuve a été copié dans le presse-papiers"
        });
      }
      setCopiedProofContent(true);
      // Reset après 2 secondes
      setTimeout(() => setCopiedProofContent(false), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier dans le presse-papiers",
        variant: "destructive"
      });
    }
  };

  const downloadProof = () => {
    const currentProof = archivedProofData?.content || proof;
    const currentProofType = archivedProofData?.type || proofType;
    
    if (!currentProof) return;
    
    if (currentProofType === "image" || currentProof.startsWith('data:image/')) {
      const link = document.createElement('a');
      link.href = currentProof;
      link.download = `preuve-transaction-${transactionId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Téléchargement",
        description: "La preuve a été téléchargée",
      });
    } else {
      // Pour le texte, créer un fichier texte
      const blob = new Blob([currentProof], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `preuve-transaction-${transactionId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Téléchargement",
        description: "La preuve a été téléchargée",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Preuve de Dépôt
            </DialogTitle>
            <div className="flex gap-2">
              {/* Bouton de copie du contenu de la preuve */}
              <Button
                variant="outline"
                size="sm"
                onClick={copyProofContent}
                className="text-blue-600 hover:text-blue-700"
                title="Copier le contenu de la preuve"
              >
                {copiedProofContent ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>

              {/* Bouton de partage WhatsApp */}
              <Button
                variant="outline"
                size="sm"
                onClick={shareToWhatsApp}
                className={`relative ${isProofShared 
                  ? 'text-green-600 hover:text-green-700 bg-green-50 border-green-200' 
                  : 'text-green-600 hover:text-green-700'
                }`}
                title={isProofShared ? 'Déjà partagé' : 'Partager sur WhatsApp'}
              >
                <MessageCircle className="w-4 h-4" />
                {isProofShared && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white">
                    <div className="w-full h-full bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </Button>

              {/* Bouton de suppression de preuve - Administrateur uniquement */}
              {user?.role === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm("Êtes-vous sûr de vouloir supprimer cette preuve ? La transaction reviendra en statut 'En attente'.")) {
                      deleteProofMutation.mutate();
                    }
                  }}
                  disabled={deleteProofMutation.isPending}
                  className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                  title="Supprimer la preuve"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}

              {/* Bouton de fermeture */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 max-h-[70vh] overflow-auto">
          {isLoadingArchived ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-muted-foreground">Chargement de la preuve...</p>
            </div>
          ) : archivedError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 mb-2">Erreur de chargement</p>
              <p className="text-sm text-muted-foreground">{archivedError}</p>
            </div>
          ) : archivedProofData ? (
            archivedProofData.type === 'image' ? (
              <div className="flex justify-center bg-gray-50 rounded-lg p-2">
                <img
                  src={archivedProofData.content}
                  alt="Preuve de dépôt archivée"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  style={{ maxHeight: '600px' }}
                />
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                  {archivedProofData.content}
                </p>
              </div>
            )
          ) : proof ? (
            (proofType === "image" || proof.startsWith('data:image/') || proof.includes('base64,')) ? (
              <div className="flex justify-center bg-gray-50 rounded-lg p-2">
                <img
                  src={proof}
                  alt="Preuve de dépôt"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  style={{ maxHeight: '600px' }}
                />
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                  {proof}
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Aucune preuve disponible</p>
              <p className="text-sm text-muted-foreground">
                Cette transaction n'a pas de preuve associée.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}