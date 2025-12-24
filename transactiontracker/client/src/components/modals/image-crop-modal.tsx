import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crop, RotateCcw, Save, X } from "lucide-react";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

export default function ImageCropModal({ isOpen, onClose, imageUrl, onCropComplete }: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>("");
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 200, height: 200 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    if (imageRef.current) {
      const img = imageRef.current;
      const containerWidth = 400;
      const containerHeight = 300;
      
      // Calculer les dimensions pour centrer l'image
      const scale = Math.min(containerWidth / img.naturalWidth, containerHeight / img.naturalHeight);
      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;
      
      // Initialiser la zone de recadrage au centre
      setCropArea({
        x: (containerWidth - 150) / 2,
        y: (containerHeight - 150) / 2,
        width: 150,
        height: 150
      });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Vérifier si on clique sur une poignée
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      return; // Ne pas démarrer le déplacement si on clique sur une poignée
    }
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setIsResizing(false);
    
    const containerRect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      x: e.clientX - containerRect.left - cropArea.x,
      y: e.clientY - containerRect.top - cropArea.y
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setIsDragging(false);
    
    // Stocker la position de la souris au moment du clic
    const containerRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (containerRect) {
      setDragStart({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (isDragging) {
      const newX = mouseX - dragStart.x;
      const newY = mouseY - dragStart.y;
      
      // Utiliser les vraies dimensions du container
      const maxX = rect.width - cropArea.width;
      const maxY = rect.height - cropArea.height;
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      }));
    } else if (isResizing) {
      const minSize = 30;
      const containerWidth = rect.width;
      const containerHeight = rect.height;
      
      // Position absolue de la souris dans le container
      
      let newArea = { ...cropArea };
      
      switch (resizeHandle) {
        case 'nw':
          // Coin Nord-Ouest : nouvelle position = position souris, adapter taille
          const nwNewX = Math.max(0, Math.min(mouseX, cropArea.x + cropArea.width - minSize));
          const nwNewY = Math.max(0, Math.min(mouseY, cropArea.y + cropArea.height - minSize));
          newArea = {
            x: nwNewX,
            y: nwNewY,
            width: (cropArea.x + cropArea.width) - nwNewX,
            height: (cropArea.y + cropArea.height) - nwNewY
          };
          break;
          
        case 'ne':
          // Coin Nord-Est : garder x, adapter y et largeur
          const neNewY = Math.max(0, Math.min(mouseY, cropArea.y + cropArea.height - minSize));
          const neNewWidth = Math.max(minSize, Math.min(mouseX - cropArea.x, containerWidth - cropArea.x));
          newArea = {
            x: cropArea.x,
            y: neNewY,
            width: neNewWidth,
            height: (cropArea.y + cropArea.height) - neNewY
          };
          break;
          
        case 'sw':
          // Coin Sud-Ouest : adapter x et hauteur
          const swNewX = Math.max(0, Math.min(mouseX, cropArea.x + cropArea.width - minSize));
          const swNewHeight = Math.max(minSize, Math.min(mouseY - cropArea.y, containerHeight - cropArea.y));
          newArea = {
            x: swNewX,
            y: cropArea.y,
            width: (cropArea.x + cropArea.width) - swNewX,
            height: swNewHeight
          };
          break;
          
        case 'se':
          // Coin Sud-Est : garder position, adapter taille
          const seNewWidth = Math.max(minSize, Math.min(mouseX - cropArea.x, containerWidth - cropArea.x));
          const seNewHeight = Math.max(minSize, Math.min(mouseY - cropArea.y, containerHeight - cropArea.y));
          newArea = {
            x: cropArea.x,
            y: cropArea.y,
            width: seNewWidth,
            height: seNewHeight
          };
          break;
          
        case 'n':
          // Nord : adapter y et hauteur
          const nNewY = Math.max(0, Math.min(mouseY, cropArea.y + cropArea.height - minSize));
          newArea = {
            x: cropArea.x,
            y: nNewY,
            width: cropArea.width,
            height: (cropArea.y + cropArea.height) - nNewY
          };
          break;
          
        case 's':
          // Sud : adapter hauteur seulement
          const sNewHeight = Math.max(minSize, Math.min(mouseY - cropArea.y, containerHeight - cropArea.y));
          newArea = {
            x: cropArea.x,
            y: cropArea.y,
            width: cropArea.width,
            height: sNewHeight
          };
          break;
          
        case 'w':
          // Ouest : adapter x et largeur
          const wNewX = Math.max(0, Math.min(mouseX, cropArea.x + cropArea.width - minSize));
          newArea = {
            x: wNewX,
            y: cropArea.y,
            width: (cropArea.x + cropArea.width) - wNewX,
            height: cropArea.height
          };
          break;
          
        case 'e':
          // Est : adapter largeur seulement
          const eNewWidth = Math.max(minSize, Math.min(mouseX - cropArea.x, containerWidth - cropArea.x));
          newArea = {
            x: cropArea.x,
            y: cropArea.y,
            width: eNewWidth,
            height: cropArea.height
          };
          break;
      }
      
      setCropArea(newArea);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle("");
  };

  const handleCrop = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    // Calculer les proportions réelles
    const containerWidth = 400;
    const containerHeight = 300;
    const scale = Math.min(containerWidth / img.naturalWidth, containerHeight / img.naturalHeight);
    
    const realWidth = img.naturalWidth * scale;
    const realHeight = img.naturalHeight * scale;
    const offsetX = (containerWidth - realWidth) / 2;
    const offsetY = (containerHeight - realHeight) / 2;

    // Calculer les coordonnées de recadrage sur l'image réelle
    const cropX = Math.max(0, (cropArea.x - offsetX) / scale);
    const cropY = Math.max(0, (cropArea.y - offsetY) / scale);
    const cropWidth = Math.min(cropArea.width / scale, img.naturalWidth - cropX);
    const cropHeight = Math.min(cropArea.height / scale, img.naturalHeight - cropY);

    // Définir la taille du canvas
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Dessiner la partie recadrée
    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );

    // Convertir en base64
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedImageUrl);
    onClose();
  };

  const resetCrop = () => {
    setCropArea({ x: 50, y: 50, width: 200, height: 200 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rogner l'image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Zone de recadrage */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ width: 400, height: 300 }}>
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Image à rogner"
              className="w-full h-full object-contain"
              onLoad={handleImageLoad}
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
            
            {imageLoaded && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 cursor-move"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Poignées de redimensionnement interactives */}
                {/* Coins */}
                <div
                  className="resize-handle absolute -top-1.5 -left-1.5 w-4 h-4 bg-blue-500 border-2 border-white cursor-nw-resize hover:bg-blue-600 rounded-sm shadow-sm"
                  onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                />
                <div
                  className="resize-handle absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 border-2 border-white cursor-ne-resize hover:bg-blue-600 rounded-sm shadow-sm"
                  onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                />
                <div
                  className="resize-handle absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-blue-500 border-2 border-white cursor-sw-resize hover:bg-blue-600 rounded-sm shadow-sm"
                  onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                />
                <div
                  className="resize-handle absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-blue-500 border-2 border-white cursor-se-resize hover:bg-blue-600 rounded-sm shadow-sm"
                  onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                />
                
                {/* Poignées latérales */}
                <div
                  className="resize-handle absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 border-2 border-white cursor-n-resize hover:bg-blue-600 rounded-sm shadow-sm"
                  onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
                />
                <div
                  className="resize-handle absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 border-2 border-white cursor-s-resize hover:bg-blue-600 rounded-sm shadow-sm"
                  onMouseDown={(e) => handleResizeMouseDown(e, 's')}
                />
                <div
                  className="resize-handle absolute -left-1.5 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white cursor-w-resize hover:bg-blue-600 rounded-sm shadow-sm"
                  onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
                />
                <div
                  className="resize-handle absolute -right-1.5 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white cursor-e-resize hover:bg-blue-600 rounded-sm shadow-sm"
                  onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
                />
                
                {/* Centre avec instructions - zone de déplacement */}
                <div className="absolute inset-4 flex items-center justify-center cursor-move bg-blue-200 bg-opacity-30 rounded border border-blue-300 border-dashed"
                     onMouseDown={handleMouseDown}>
                  <span className="text-xs text-blue-700 font-medium bg-white bg-opacity-90 px-2 py-1 rounded shadow-sm pointer-events-none">
                    Glisser pour déplacer
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-sm text-gray-600 text-center space-y-1">
            <div>Glissez le rectangle bleu pour le déplacer</div>
            <div>Tirez sur les poignées bleues pour redimensionner</div>
            <div className="text-xs text-gray-500">8 poignées : 4 coins + 4 côtés</div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={resetCrop}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Réinitialiser</span>
            </Button>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleCrop}
                className="bg-success hover:bg-green-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Rogner
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas caché pour le recadrage */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}