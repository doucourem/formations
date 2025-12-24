import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Camera, Images, X } from "lucide-react";

const proofSchema = z.object({
  proofText: z.string().optional(),
});

type ProofForm = z.infer<typeof proofSchema>;

interface ProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: number | null;
}

export default function ProofModal({ isOpen, onClose, transactionId }: ProofModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [originalImageData, setOriginalImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fonction pour compresser l'image de manière ultra-agressive
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Dimensions très réduites pour garantir une petite taille
        const maxSize = 300; // 300px maximum
        let { width, height } = img;
        
        // Réduction drastique des dimensions
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compression équilibrée - qualité améliorée
        let compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        
        // Vérification finale et réduction supplémentaire si nécessaire
        let attempts = 0;
        while (compressedDataUrl.length > 200000 && attempts < 3) { // 200KB max
          attempts++;
          const reductionFactor = 0.85 - (attempts * 0.05);
          const newWidth = Math.floor(width * reductionFactor);
          const newHeight = Math.floor(height * reductionFactor);
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx?.clearRect(0, 0, newWidth, newHeight);
          ctx?.drawImage(img, 0, 0, newWidth, newHeight);
          compressedDataUrl = canvas.toDataURL('image/jpeg', Math.max(0.4, 0.6 - attempts * 0.1));
        }
        
        resolve(compressedDataUrl);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Fonction pour recadrer l'image
  const cropImage = (dataUrl: string, cropArea: { x: number, y: number, width: number, height: number }): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = cropArea.width;
        canvas.height = cropArea.height;
        
        ctx?.drawImage(
          img,
          cropArea.x, cropArea.y, cropArea.width, cropArea.height,
          0, 0, cropArea.width, cropArea.height
        );
        
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.3);
        resolve(croppedDataUrl);
      };
      
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  const form = useForm<ProofForm>({
    resolver: zodResolver(proofSchema),
    defaultValues: {
      proofText: "",
    },
  });

  const submitProofMutation = useMutation({
    mutationFn: async (data: { proof: string; proofType: string }) => {
      if (!transactionId) throw new Error("ID de transaction manquant");
      
      console.log("📸 [PHOTO DEBUG] Début soumission preuve, transactionId:", transactionId);
      console.log("📸 [PHOTO DEBUG] Données à envoyer:", {
        proofType: data.proofType,
        proofLength: data.proof.length
      });
      
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          proof: data.proof,
          proofType: data.proofType,
          // Si c'est un admin qui soumet, valider automatiquement
          ...(user?.role === 'admin' ? { status: "validated" } : {})
        }),
      });
      
      console.log("📸 [PHOTO DEBUG] Réponse serveur:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("📸 [PHOTO ERROR] Erreur serveur:", errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("📸 [PHOTO DEBUG] Preuve soumise avec succès");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Preuve soumise",
        description: "La preuve a été soumise avec succès",
      });
      handleClose();
    },
    onError: (error: any) => {
      console.error("📸 [PHOTO ERROR] Erreur lors de la soumission:", error);
      toast({
        title: "Erreur Soumission",
        description: `Échec: ${error.message || "Erreur inconnue"}`,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("📸 [PHOTO DEBUG] handleFileSelect appelé");
    const file = event.target.files?.[0];
    
    if (file) {
      console.log("📸 [PHOTO DEBUG] Fichier sélectionné:", {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      if (file.type.startsWith('image/')) {
        console.log("📸 [PHOTO DEBUG] Type d'image valide, compression en cours...");
        
        toast({
          title: "Compression Image",
          description: `Optimisation en cours... (${Math.round(file.size / 1024)}KB)`,
        });
        
        setSelectedImage(file);
        
        try {
          // Compresser l'image de manière ultra-agressive
          const compressedDataUrl = await compressImage(file);
          
          console.log("📸 [PHOTO DEBUG] Image ultra-compressée:", {
            originalSize: file.size,
            compressedSize: compressedDataUrl.length,
            ratio: Math.round((compressedDataUrl.length / file.size) * 100)
          });
          
          setOriginalImageData(compressedDataUrl);
          setImagePreview(compressedDataUrl);
          
          const finalSizeKB = Math.round(compressedDataUrl.length / 1024);
          
          toast({
            title: "Image Compressée",
            description: `${Math.round(file.size / 1024)}KB → ${finalSizeKB}KB`,
          });
          
          // Si encore trop gros, proposer le recadrage
          if (compressedDataUrl.length > 150000) {
            setShowImageEditor(true);
            toast({
              title: "Image Trop Volumineuse",
              description: "Utilisez les boutons de recadrage pour réduire la taille",
              variant: "destructive",
            });
          }
          
          form.setValue("proofText", "");
        } catch (error) {
          console.error("📸 [PHOTO ERROR] Erreur de compression:", error);
          toast({
            title: "Erreur de traitement",
            description: "Impossible de traiter l'image",
            variant: "destructive",
          });
        }
      } else {
        console.error("📸 [PHOTO ERROR] Type de fichier non supporté:", file.type);
        toast({
          title: "Format non supporté",
          description: `Type reçu: ${file.type}`,
          variant: "destructive",
        });
      }
    } else {
      console.log("📸 [PHOTO DEBUG] Aucun fichier sélectionné");
    }
  };

  const handleTakePhoto = async () => {
    console.log("📸 [PHOTO DEBUG] handleTakePhoto appelé");
    
    // Essayer d'abord l'API native de l'appareil photo
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        console.log("📸 [PHOTO DEBUG] Tentative d'accès direct à l'appareil photo");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        // Arrêter le stream immédiatement (on utilise juste pour tester l'accès)
        stream.getTracks().forEach(track => track.stop());
        
        // Si l'accès fonctionne, utiliser l'input file avec capture
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        }
      } catch (error) {
        console.error("📸 [PHOTO ERROR] Accès appareil photo refusé:", error);
        toast({
          title: "Appareil Photo Indisponible",
          description: "Utilisez 'Sélectionner de la Galerie' à la place",
          variant: "destructive",
        });
      }
    } else {
      // Fallback sur l'input file classique
      console.log("📸 [PHOTO DEBUG] API caméra non supportée, fallback vers input file");
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  const handleSelectFromGallery = () => {
    console.log("📸 [PHOTO DEBUG] handleSelectFromGallery appelé");
    if (fileInputRef.current) {
      console.log("📸 [PHOTO DEBUG] Ouverture de la galerie...");
      fileInputRef.current.click();
    } else {
      console.error("📸 [PHOTO ERROR] Référence input non trouvée pour galerie");
    }
  };

  const onSubmit = (data: ProofForm) => {
    console.log("📸 [PHOTO DEBUG] onSubmit appelé", { 
      hasImage: !!selectedImage, 
      hasPreview: !!imagePreview, 
      hasText: !!data.proofText?.trim(),
      transactionId: transactionId
    });
    
    if (selectedImage && imagePreview) {
      console.log("📸 [PHOTO DEBUG] Soumission d'une image, taille:", imagePreview.length);
      toast({
        title: "Debug - Soumission",
        description: `Image: ${imagePreview.length} caractères, ID: ${transactionId}`,
      });
      submitProofMutation.mutate({
        proof: imagePreview,
        proofType: "image",
      });
    } else if (data.proofText && data.proofText.trim()) {
      console.log("📸 [PHOTO DEBUG] Soumission d'un texte, longueur:", data.proofText.trim().length);
      toast({
        title: "Debug - Soumission",
        description: `Texte: ${data.proofText.trim().length} caractères`,
      });
      submitProofMutation.mutate({
        proof: data.proofText.trim(),
        proofType: "text",
      });
    } else {
      console.log("📸 [PHOTO DEBUG] Aucune preuve fournie");
      toast({
        title: "Preuve requise",
        description: "Veuillez fournir une image ou un texte comme preuve",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedImage(null);
    setImagePreview(null);
    onClose();
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setOriginalImageData(null);
    setShowImageEditor(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropImage = async (cropType: 'center' | 'top' | 'bottom') => {
    if (!originalImageData) return;
    
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Améliorer la qualité - résolution plus grande, compression moins agressive
        const targetSize = Math.min(img.width, img.height) * 0.8;
        const finalSize = Math.min(targetSize, 400); // Maximum 400px pour meilleure qualité
        canvas.width = finalSize;
        canvas.height = finalSize;
        
        let sx = 0, sy = 0;
        if (cropType === 'center') {
          sx = (img.width - targetSize) / 2;
          sy = (img.height - targetSize) / 2;
        } else if (cropType === 'top') {
          sx = (img.width - targetSize) / 2;
          sy = 0;
        } else if (cropType === 'bottom') {
          sx = (img.width - targetSize) / 2;
          sy = img.height - targetSize;
        }
        
        ctx?.drawImage(img, sx, sy, targetSize, targetSize, 0, 0, finalSize, finalSize);
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // Qualité améliorée à 70%
        
        setImagePreview(croppedDataUrl);
        setShowImageEditor(false);
        
        const newSizeKB = Math.round(croppedDataUrl.length / 1024);
        toast({
          title: "Image Recadrée",
          description: `Nouvelle taille: ${newSizeKB}KB`,
        });
      };
      img.src = originalImageData;
    } catch (error) {
      toast({
        title: "Erreur de recadrage",
        description: "Impossible de recadrer l'image",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Soumettre une Preuve
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Image Upload Section */}
          <div className="space-y-4">
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preuve"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Boutons de recadrage si l'image est trop volumineuse */}
                {showImageEditor && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm text-orange-800 mb-3 font-medium">
                      Image trop volumineuse - Recadrez pour réduire la taille :
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCropImage('top')}
                        className="text-xs"
                      >
                        Haut
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCropImage('center')}
                        className="text-xs"
                      >
                        Centre
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCropImage('bottom')}
                        className="text-xs"
                      >
                        Bas
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSelectFromGallery}
                  className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors h-24 w-48"
                  disabled={submitProofMutation.isPending}
                >
                  <Images className="text-2xl text-gray-400 mb-2" size={32} />
                  <span className="text-sm text-gray-600">Galerie</span>
                </Button>
              </div>
            )}

            {/* Input pour la galerie */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* Input pour l'appareil photo */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Separator */}
          <div className="relative">
            <hr className="border-gray-300" />
            <span className="absolute inset-x-0 top-0 flex justify-center">
              <span className="bg-white px-2 text-xs text-gray-400">OU</span>
            </span>
          </div>

          {/* Text Input Section */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="proofText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coller/Saisir un Texte</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Coller ou saisir la preuve textuelle..."
                        {...field}
                        disabled={submitProofMutation.isPending || !!imagePreview}
                        className="focus:ring-primary focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={submitProofMutation.isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-success hover:bg-green-600"
                  disabled={submitProofMutation.isPending}
                >
                  {submitProofMutation.isPending ? "Soumission..." : "Soumettre"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
