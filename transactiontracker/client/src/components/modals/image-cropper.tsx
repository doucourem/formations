import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crop, RotateCcw, RotateCw, Save, X } from "lucide-react";

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageCropper({ imageUrl, onCropComplete, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setImageSize({ width: image.width, height: image.height });
      
      // Ajuster la zone de crop par défaut à 80% de l'image
      const defaultWidth = Math.min(image.width * 0.8, 300);
      const defaultHeight = Math.min(image.height * 0.8, 300);
      setCropArea({
        x: (image.width - defaultWidth) / 2,
        y: (image.height - defaultHeight) / 2,
        width: defaultWidth,
        height: defaultHeight
      });
      
      if (canvasRef.current) {
        drawCanvas();
      }
    };
    image.src = imageUrl;
    if (imageRef.current) {
      imageRef.current.src = imageUrl;
    }
  }, [imageUrl]);

  useEffect(() => {
    drawCanvas();
  }, [cropArea, rotation, imageSize]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Définir la taille du canvas
    const maxDisplaySize = 400;
    const scale = Math.min(maxDisplaySize / imageSize.width, maxDisplaySize / imageSize.height);
    canvas.width = imageSize.width * scale;
    canvas.height = imageSize.height * scale;

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sauvegarder le contexte pour la rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Dessiner l'image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Restaurer le contexte
    ctx.restore();

    // Dessiner l'overlay sombre et la zone de crop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Zone de crop claire
    const scaledCrop = {
      x: cropArea.x * scale,
      y: cropArea.y * scale,
      width: cropArea.width * scale,
      height: cropArea.height * scale
    };

    ctx.clearRect(scaledCrop.x, scaledCrop.y, scaledCrop.width, scaledCrop.height);
    
    // Redessiner l'image dans la zone de crop
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(
      image, 
      scaledCrop.x / scale, scaledCrop.y / scale, scaledCrop.width / scale, scaledCrop.height / scale,
      scaledCrop.x, scaledCrop.y, scaledCrop.width, scaledCrop.height
    );
    
    ctx.restore();

    // Bordure de la zone de crop
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(scaledCrop.x, scaledCrop.y, scaledCrop.width, scaledCrop.height);

    // Coins de redimensionnement
    const cornerSize = 8;
    ctx.fillStyle = '#3b82f6';
    // Coin haut-gauche
    ctx.fillRect(scaledCrop.x - cornerSize/2, scaledCrop.y - cornerSize/2, cornerSize, cornerSize);
    // Coin haut-droite
    ctx.fillRect(scaledCrop.x + scaledCrop.width - cornerSize/2, scaledCrop.y - cornerSize/2, cornerSize, cornerSize);
    // Coin bas-gauche
    ctx.fillRect(scaledCrop.x - cornerSize/2, scaledCrop.y + scaledCrop.height - cornerSize/2, cornerSize, cornerSize);
    // Coin bas-droite
    ctx.fillRect(scaledCrop.x + scaledCrop.width - cornerSize/2, scaledCrop.y + scaledCrop.height - cornerSize/2, cornerSize, cornerSize);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    const scale = Math.min(400 / imageSize.width, 400 / imageSize.height);

    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(imageSize.width - prev.width, prev.x + deltaX / scale)),
      y: Math.max(0, Math.min(imageSize.height - prev.height, prev.y + deltaY / scale))
    }));

    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const rotateCCW = () => {
    setRotation(prev => (prev - 90) % 360);
  };

  const rotateCW = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const applyCrop = () => {
    const image = imageRef.current;
    if (!image) return;

    const cropCanvas = document.createElement('canvas');
    const ctx = cropCanvas.getContext('2d');
    if (!ctx) return;

    cropCanvas.width = cropArea.width;
    cropCanvas.height = cropArea.height;

    // Appliquer la rotation si nécessaire
    if (rotation !== 0) {
      ctx.save();
      ctx.translate(cropArea.width / 2, cropArea.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-cropArea.width / 2, -cropArea.height / 2);
    }

    ctx.drawImage(
      image,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    );

    if (rotation !== 0) {
      ctx.restore();
    }

    const croppedImageUrl = cropCanvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedImageUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <Card className="bg-white p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Rogner l'image</h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-4 flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Original"
            className="hidden"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={rotateCCW}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Rotation gauche
          </Button>
          <Button variant="outline" size="sm" onClick={rotateCW}>
            <RotateCw className="w-4 h-4 mr-1" />
            Rotation droite
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Cliquez et déplacez pour repositionner la zone de rognage
        </p>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={applyCrop} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Appliquer
          </Button>
        </div>
      </Card>
    </div>
  );
}