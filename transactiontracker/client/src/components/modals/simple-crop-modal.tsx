import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SimpleCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

export default function SimpleCropModal({ isOpen, onClose, imageUrl, onCropComplete }: SimpleCropModalProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // État simple
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 150, height: 150 });
  const [activeHandle, setActiveHandle] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Gérer le chargement de l'image
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    // Centrer la zone de recadrage
    setCropArea({ x: 125, y: 75, width: 150, height: 150 });
  }, []);

  // Gestionnaire unifié pour tous les événements de souris
  const handleMouseDown = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Variables locales pour capturer l'état au moment du clic
    let isDrag = action === 'move';
    let handle = isDrag ? '' : action;
    
    if (isDrag) {
      setIsDragging(true);
    } else {
      setActiveHandle(action);
    }

    // Ajouter les écouteurs globaux
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Limites du container
      const maxX = rect.width;
      const maxY = rect.height;
      const minSize = 30;
      
      setCropArea(prev => {
        if (isDrag) {
          // Déplacement simple
          return {
            ...prev,
            x: Math.max(0, Math.min(mouseX - prev.width/2, maxX - prev.width)),
            y: Math.max(0, Math.min(mouseY - prev.height/2, maxY - prev.height))
          };
        }
        
        // Redimensionnement selon la poignée active
        switch (handle) {
          case 'se': // Sud-Est - simple
            return {
              ...prev,
              width: Math.max(minSize, Math.min(mouseX - prev.x, maxX - prev.x)),
              height: Math.max(minSize, Math.min(mouseY - prev.y, maxY - prev.y))
            };
          case 'nw': // Nord-Ouest
            const newX = Math.max(0, Math.min(mouseX, prev.x + prev.width - minSize));
            const newY = Math.max(0, Math.min(mouseY, prev.y + prev.height - minSize));
            return {
              x: newX,
              y: newY,
              width: (prev.x + prev.width) - newX,
              height: (prev.y + prev.height) - newY
            };
          case 'ne': // Nord-Est
            const neY = Math.max(0, Math.min(mouseY, prev.y + prev.height - minSize));
            return {
              x: prev.x,
              y: neY,
              width: Math.max(minSize, Math.min(mouseX - prev.x, maxX - prev.x)),
              height: (prev.y + prev.height) - neY
            };
          case 'sw': // Sud-Ouest
            const swX = Math.max(0, Math.min(mouseX, prev.x + prev.width - minSize));
            return {
              x: swX,
              y: prev.y,
              width: (prev.x + prev.width) - swX,
              height: Math.max(minSize, Math.min(mouseY - prev.y, maxY - prev.y))
            };
          case 'n': // Nord
            const nY = Math.max(0, Math.min(mouseY, prev.y + prev.height - minSize));
            return {
              x: prev.x,
              y: nY,
              width: prev.width,
              height: (prev.y + prev.height) - nY
            };
          case 's': // Sud
            return {
              ...prev,
              height: Math.max(minSize, Math.min(mouseY - prev.y, maxY - prev.y))
            };
          case 'w': // Ouest
            const wX = Math.max(0, Math.min(mouseX, prev.x + prev.width - minSize));
            return {
              x: wX,
              y: prev.y,
              width: (prev.x + prev.width) - wX,
              height: prev.height
            };
          case 'e': // Est
            return {
              ...prev,
              width: Math.max(minSize, Math.min(mouseX - prev.x, maxX - prev.x))
            };
          default:
            return prev;
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setActiveHandle('');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Appliquer le recadrage
  const applyCrop = () => {
    if (!imageRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculer les ratios pour la conversion
    const scaleX = img.naturalWidth / containerRect.width;
    const scaleY = img.naturalHeight / containerRect.height;

    // Dimensions de la zone recadrée
    canvas.width = cropArea.width * scaleX;
    canvas.height = cropArea.height * scaleY;

    // Dessiner la partie recadrée
    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedImageUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rogner l'image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Zone de recadrage simplifiée */}
          <div 
            ref={containerRef}
            className="relative bg-gray-100 rounded-lg overflow-hidden select-none" 
            style={{ width: 400, height: 300 }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Image à rogner"
              className="w-full h-full object-contain pointer-events-none"
              onLoad={handleImageLoad}
            />
            
            {imageLoaded && (
              <>
                {/* Zone de recadrage */}
                <div
                  className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                  style={{
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.width,
                    height: cropArea.height,
                    cursor: 'move'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'move')}
                >
                  {/* Instructions au centre */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs text-blue-700 font-medium bg-white bg-opacity-90 px-2 py-1 rounded">
                      Glisser pour déplacer
                    </span>
                  </div>
                  
                  {/* Poignées de redimensionnement */}
                  {/* Coins */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white rounded cursor-nw-resize"
                       onMouseDown={(e) => handleMouseDown(e, 'nw')} />
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white rounded cursor-ne-resize"
                       onMouseDown={(e) => handleMouseDown(e, 'ne')} />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white rounded cursor-sw-resize"
                       onMouseDown={(e) => handleMouseDown(e, 'sw')} />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white rounded cursor-se-resize"
                       onMouseDown={(e) => handleMouseDown(e, 'se')} />
                  
                  {/* Côtés */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 border-2 border-white rounded cursor-n-resize"
                       onMouseDown={(e) => handleMouseDown(e, 'n')} />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 border-2 border-white rounded cursor-s-resize"
                       onMouseDown={(e) => handleMouseDown(e, 's')} />
                  <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-600 border-2 border-white rounded cursor-w-resize"
                       onMouseDown={(e) => handleMouseDown(e, 'w')} />
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-600 border-2 border-white rounded cursor-e-resize"
                       onMouseDown={(e) => handleMouseDown(e, 'e')} />
                </div>
              </>
            )}
          </div>

          {/* Boutons d'actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCropArea({ x: 125, y: 75, width: 150, height: 150 })}>
              Réinitialiser
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={applyCrop}>
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}