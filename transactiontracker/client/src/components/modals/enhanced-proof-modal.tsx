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
import { Camera, Images, X, Crop, Plus, Trash2 } from "lucide-react";
import ImageCropper from "./image-cropper";

const proofSchema = z.object({
  proofText: z.string().optional(),
});

type ProofForm = z.infer<typeof proofSchema>;

interface EnhancedProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: number | null;
}

interface ProofImage {
  id: string;
  file: File;
  url: string;
  cropped?: boolean;
}

export default function EnhancedProofModal({ isOpen, onClose, transactionId }: EnhancedProofModalProps) {
  const { user } = useAuth();
  const [proofImages, setProofImages] = useState<ProofImage[]>([]);
  const [currentImageForCrop, setCurrentImageForCrop] = useState<string | null>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<ProofForm>({
    resolver: zodResolver(proofSchema),
    defaultValues: {
      proofText: "",
    },
  });

  const submitProofMutation = useMutation({
    mutationFn: async (data: { proofImages?: string[]; proofText?: string }) => {
      if (!transactionId) throw new Error("ID de transaction manquant");
      
      console.log("📸 [ENHANCED PROOF] Début soumission multiple, transactionId:", transactionId);
      
      const payload: any = {};
      
      // Si c'est un admin qui soumet, valider automatiquement la transaction
      if (user?.role === 'admin') {
        payload.status = "validated";
      }
      
      if (data.proofImages && data.proofImages.length > 0) {
        // Nouveau système avec plusieurs images
        payload.proofImages = JSON.stringify(data.proofImages);
        payload.proofCount = data.proofImages.length;
        payload.proofType = "images";
      } else if (data.proofText && data.proofText.trim()) {
        // Système legacy pour texte
        payload.proof = data.proofText.trim();
        payload.proofType = "text";
      }
      
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      
      console.log("📸 [ENHANCED PROOF] Réponse serveur:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("📸 [ENHANCED PROOF] Erreur serveur:", errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("📸 [ENHANCED PROOF] Preuves soumises avec succès");
      return result;
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
      console.error("📸 [ENHANCED PROOF] Erreur soumission:", error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre les preuves",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setProofImages([]);
    setCurrentImageForCrop(null);
    setCurrentImageId(null);
    form.reset();
    onClose();
  };

  const processImageFile = (file: File) => {
    if (proofImages.length >= 3) {
      toast({
        title: "Limite atteinte",
        description: "Maximum 3 images par transaction",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const imageId = Date.now().toString();
      
      setProofImages(prev => [...prev, {
        id: imageId,
        file,
        url,
        cropped: false
      }]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          processImageFile(file);
        }
      });
    }
    e.target.value = '';
  };

  const removeImage = (imageId: string) => {
    setProofImages(prev => prev.filter(img => img.id !== imageId));
  };

  const cropImage = (imageId: string) => {
    const image = proofImages.find(img => img.id === imageId);
    if (image) {
      setCurrentImageForCrop(image.url);
      setCurrentImageId(imageId);
    }
  };

  const handleCropComplete = (croppedUrl: string) => {
    if (currentImageId) {
      setProofImages(prev => prev.map(img => 
        img.id === currentImageId 
          ? { ...img, url: croppedUrl, cropped: true }
          : img
      ));
    }
    setCurrentImageForCrop(null);
    setCurrentImageId(null);
  };

  const handleCropCancel = () => {
    setCurrentImageForCrop(null);
    setCurrentImageId(null);
  };

  const convertImageToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(url);
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = url;
    });
  };

  const onSubmit = async (data: ProofForm) => {
    console.log("📸 [ENHANCED PROOF] onSubmit appelé", { 
      imageCount: proofImages.length,
      hasText: !!data.proofText?.trim(),
      transactionId: transactionId
    });
    
    if (proofImages.length > 0) {
      try {
        const base64Images = await Promise.all(
          proofImages.map(img => convertImageToBase64(img.url))
        );
        
        console.log("📸 [ENHANCED PROOF] Soumission de", base64Images.length, "images");
        submitProofMutation.mutate({
          proofImages: base64Images,
        });
      } catch (error) {
        console.error("📸 [ENHANCED PROOF] Erreur conversion images:", error);
        toast({
          title: "Erreur",
          description: "Impossible de traiter les images",
          variant: "destructive",
        });
      }
    } else if (data.proofText && data.proofText.trim()) {
      console.log("📸 [ENHANCED PROOF] Soumission de texte");
      submitProofMutation.mutate({
        proofText: data.proofText.trim(),
      });
    } else {
      toast({
        title: "Preuve requise",
        description: "Veuillez fournir au moins une image ou un texte",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Soumettre des preuves améliorées</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Section Images */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Images (0-3 maximum)</h3>
                <div className="text-xs text-gray-500">
                  {proofImages.length}/3 images
                </div>
              </div>

              {/* Boutons d'ajout d'images */}
              {proofImages.length < 3 && (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFileSelect}
                    disabled={submitProofMutation.isPending}
                    className="flex-1"
                  >
                    <Images className="w-4 h-4 mr-2" />
                    Galerie
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCameraCapture}
                    disabled={submitProofMutation.isPending}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Caméra
                  </Button>
                </div>
              )}

              {/* Inputs cachés */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Aperçu des images */}
              {proofImages.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {proofImages.map((image, index) => (
                    <div key={image.id} className="relative border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Image {index + 1}</span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => cropImage(image.id)}
                            disabled={submitProofMutation.isPending}
                          >
                            <Crop className="w-3 h-3 mr-1" />
                            {image.cropped ? "Rerogner" : "Rogner"}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(image.id)}
                            disabled={submitProofMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-center bg-gray-50 rounded p-2">
                        <img
                          src={image.url}
                          alt={`Preuve ${index + 1}`}
                          className="max-w-full max-h-32 object-contain rounded"
                        />
                      </div>
                      {image.cropped && (
                        <div className="mt-1 text-xs text-green-600 flex items-center">
                          <Crop className="w-3 h-3 mr-1" />
                          Image rognée
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">OU</span>
              </div>
            </div>

            {/* Section Texte */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="proofText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Saisir un texte</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Coller ou saisir la preuve textuelle..."
                          {...field}
                          disabled={submitProofMutation.isPending || proofImages.length > 0}
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
                    {submitProofMutation.isPending ? "Soumission..." : 
                      proofImages.length > 0 ? `Soumettre ${proofImages.length} image(s)` : "Soumettre"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Cropper Modal */}
      {currentImageForCrop && (
        <ImageCropper
          imageUrl={currentImageForCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}