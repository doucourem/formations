import { Share2, MessageCircle, Mail, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  className?: string;
}

export default function ShareButton({ className = "" }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { toast } = useToast();

  const shareData = {
    title: "GesFinance - Gestion des Transactions",
    text: "Découvrez GesFinance, l'application de gestion des transactions financières FCFA/GNF avec suivi en temps réel !",
    url: window.location.origin
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShowMenu(false);
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setShowMenu(false);
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent(shareData.title);
    const body = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    setShowMenu(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      toast({
        title: "Lien copié !",
        description: "Le lien a été copié dans le presse-papier",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
    setShowMenu(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleNativeShare}
        className="p-2 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors"
        aria-label="Partager l'application"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {showMenu && !navigator.share && (
        <div className="absolute top-12 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-48 z-50">
          <button
            onClick={shareToWhatsApp}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
          >
            <MessageCircle className="w-5 h-5 text-green-500" />
            <span>WhatsApp</span>
          </button>
          
          <button
            onClick={shareByEmail}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
          >
            <Mail className="w-5 h-5 text-blue-500" />
            <span>Email</span>
          </button>
          
          <button
            onClick={copyLink}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
          >
            <Copy className="w-5 h-5 text-gray-500" />
            <span>Copier le lien</span>
          </button>
        </div>
      )}

      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}