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
import { Images, X, Trash2, Plus, Crop } from "lucide-react";
import SimpleCropModal from "./simple-crop-modal";

const proofSchema = z.object({
  proofText: z.string().optional(),
});

type ProofForm = z.infer<typeof proofSchema>;

interface SimpleEnhancedProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: number | null;
}

interface ProofImage {
  id: string;
  file: File;
  url: string;
}

export default function SimpleEnhancedProofModal({ isOpen, onClose, transactionId }: SimpleEnhancedProofModalProps) {
  const [proofImages, setProofImages] = useState<ProofImage[]>([]);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentImageToCrop, setCurrentImageToCrop] = useState<string>("");
  const [currentImageId, setCurrentImageId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ProofForm>({
    resolver: zodResolver(proofSchema),
    defaultValues: {
      proofText: "",
    },
  });

  const submitProofMutation = useMutation({
    mutationFn: async (data: ProofForm) => {
      if (!transactionId) throw new Error("Transaction ID manquant");
      
      console.log("📸 [SIMPLE PROOF] Début soumission:", { 
        transactionId, 
        imagesCount: proofImages.length,
        hasText: !!data.proofText?.trim()
      });

      const payload: any = {};
      
      if (proofImages.length > 0) {
        // Nouveau système multi-images
        const imageDataArray = await Promise.all(
          proofImages.map(async (img) => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(img.file);
            });
          })
        );
        
        payload.proofImages = JSON.stringify(imageDataArray);
        payload.proofCount = proofImages.length;
        payload.proofType = "images";
        console.log("📸 [SIMPLE PROOF] Images préparées:", imageDataArray.length);
      } else if (data.proofText && data.proofText.trim()) {
        // Système legacy pour texte
        payload.proof = data.proofText.trim();
        payload.proofType = "text";
        console.log("📸 [SIMPLE PROOF] Texte préparé");
      } else {
        throw new Error("Aucune preuve fournie");
      }
      
      // Si c'est un admin qui soumet, valider automatiquement la transaction
      if (user?.role === 'admin') {
        payload.status = "validated";
      }
      
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Preuves soumises",
        description: `${proofImages.length > 0 ? proofImages.length + ' image(s)' : 'Texte'} soumis(es) avec succès`,
      });
      handleClose();
    },
    onError: (error) => {
      console.error("📸 [SIMPLE PROOF] Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de soumettre les preuves",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setProofImages([]);
    setCropModalOpen(false);
    setCurrentImageToCrop("");
    setCurrentImageId("");
    form.reset();
    onClose();
  };

  const openCropModal = (imageUrl: string, imageId: string) => {
    setCurrentImageToCrop(imageUrl);
    setCurrentImageId(imageId);
    setCropModalOpen(true);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    // Remplacer l'image existante par la version rognée
    setProofImages(prev => prev.map(img => 
      img.id === currentImageId 
        ? { ...img, url: croppedImageUrl }
        : img
    ));
    setCropModalOpen(false);
    setCurrentImageToCrop("");
    setCurrentImageId("");
    
    toast({
      title: "Image rognée",
      description: "L'image a été rognée avec succès",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (proofImages.length >= 3) {
        toast({
          title: "Limite atteinte",
          description: "Maximum 3 images par transaction",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Format non supporté",
          description: "Veuillez sélectionner une image",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ProofImage = {
          id: Date.now().toString() + Math.random(),
          file,
          url: e.target?.result as string,
        };
        setProofImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input pour permettre sélection du même fichier
    event.target.value = '';
  };

  const removeImage = (imageId: string) => {
    setProofImages(prev => prev.filter(img => img.id !== imageId));
  };

  const onSubmit = (data: ProofForm) => {
    if (proofImages.length === 0 && (!data.proofText || !data.proofText.trim())) {
      toast({
        title: "Preuve requise",
        description: "Veuillez ajouter au moins une image ou un texte",
        variant: "destructive",
      });
      return;
    }

    submitProofMutation.mutate(data);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Soumettre une preuve</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Section Images */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Images (optionnel)</label>
                  
                  {/* Bouton d'ajout d'images */}
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={proofImages.length >= 3}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter image</span>
                    </Button>
                    <span className="text-xs text-gray-500">
                      {proofImages.length}/3 images
                    </span>
                  </div>

                  {/* Input caché pour fichiers */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Aperçu des images */}
                  {proofImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {proofImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url}
                            alt="Preuve"
                            className="w-full h-24 object-cover rounded border"
                          />
                          
                          {/* Boutons d'action */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => openCropModal(image.url, image.id)}
                              className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600"
                            >
                              <Crop className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeImage(image.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section Texte */}
                <FormField
                  control={form.control}
                  name="proofText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texte de preuve (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Entrez votre preuve en texte (numéro de transaction, référence, etc.)"
                          className="min-h-[100px]"
                          {...field}
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
                    {submitProofMutation.isPending ? "Soumission..." : 
                      proofImages.length > 0 ? `Soumettre ${proofImages.length} image(s)` : "Soumettre"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de rognage */}
      <SimpleCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        imageUrl={currentImageToCrop}
        onCropComplete={handleCropComplete}
      />
    </>
  );
}