import { useEffect } from 'react';

/**
 * Hook pour améliorer la navigation directionnelle dans les tableaux
 * OPTIMISÉ: Détection mobile/Firefox avec support orientation et navigation tactile
 */
export function useTableNavigation() {
  useEffect(() => {
    // Détecter le navigateur et l'appareil
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isFirefox = /Firefox/i.test(navigator.userAgent);
    const isLandscape = () => window.innerWidth > window.innerHeight;
    
    console.log(`🔍 [TABLE NAV] Mobile: ${isMobile}, Firefox: ${isFirefox}, Paysage: ${isLandscape()}`);
    
    // Initialiser tous les conteneurs scrollables
    const initializeScrollableContainers = () => {
      const containers = document.querySelectorAll('.overflow-x-auto');
      
      containers.forEach((container) => {
        const element = container as HTMLElement;
        
        // Configuration mobile spéciale pour Firefox
        if (isMobile) {
          element.style.touchAction = 'pan-x pan-y';
          element.style.WebkitOverflowScrolling = 'touch';
          element.setAttribute('tabindex', '0');
          
          // Firefox mobile nécessite des propriétés spéciales
          if (isFirefox) {
            element.style.cursor = 'grab';
            element.style.userSelect = 'none';
            element.style.outline = 'none';
            
            // Forcer le focus pour Firefox mobile avec événements multiples
            const forceFocus = () => {
              element.focus({ preventScroll: true });
              element.setAttribute('data-firefox-focused', 'true');
              console.log(`👆 [FIREFOX] Focus forcé avec succès`);
            };
            
            element.addEventListener('click', forceFocus);
            element.addEventListener('touchstart', forceFocus, { passive: true });
            element.addEventListener('touchend', forceFocus, { passive: true });
          }
        } else {
          element.setAttribute('tabindex', '0');
        }
        
        // Ajouter attributs d'accessibilité
        if (!element.hasAttribute('role')) {
          element.setAttribute('role', 'region');
        }
        
        const ariaLabel = isMobile && !isLandscape() 
          ? 'Tableau scrollable - touchez et glissez pour naviguer'
          : 'Tableau scrollable - utilisez les flèches pour naviguer';
        element.setAttribute('aria-label', ariaLabel);
        
        // Gestionnaire d'événements clavier - Firefox mobile sans restrictions
        const handleContainerKeyDown = (e: KeyboardEvent) => {
          // Debug pour Firefox mobile
          if (isMobile && isFirefox) {
            console.log(`🔍 [FIREFOX MOBILE] Key: ${e.key}, Focus: ${document.activeElement === element}, Element:`, element);
          }
          
          const isArrowLeft = e.key === 'ArrowLeft';
          const isArrowRight = e.key === 'ArrowRight';
          const isArrowUp = e.key === 'ArrowUp';
          const isArrowDown = e.key === 'ArrowDown';
          
          if (isArrowLeft || isArrowRight) {
            e.preventDefault();
            e.stopPropagation();
            
            const scrollAmount = isMobile ? (isFirefox ? 120 : 100) : 150;
            const direction = isArrowLeft ? -scrollAmount : scrollAmount;
            
            element.scrollBy({ left: direction, behavior: 'smooth' });
            
            if (isMobile && isFirefox) {
              console.log(`🔥 [FIREFOX MOBILE] Navigation horizontale ${isArrowLeft ? 'GAUCHE' : 'DROITE'} - SUCCÈS!`);
              // Flash visuel pour confirmer
              element.style.background = 'rgba(255, 107, 53, 0.3)';
              setTimeout(() => element.style.background = '', 200);
            } else {
              console.log(`🔄 [TABLE NAV] Navigation horizontale ${isArrowLeft ? 'gauche' : 'droite'}`, element);
            }
          }
          
          if (isArrowUp || isArrowDown) {
            e.preventDefault();
            e.stopPropagation();
            
            const scrollAmount = isMobile ? (isFirefox ? 100 : 80) : 100;
            const direction = isArrowUp ? -scrollAmount : scrollAmount;
            
            element.scrollBy({ top: direction, behavior: 'smooth' });
            
            if (isMobile && isFirefox) {
              console.log(`🔥 [FIREFOX MOBILE] Navigation verticale ${isArrowUp ? 'HAUT' : 'BAS'} - SUCCÈS!`);
              // Flash visuel pour confirmer
              element.style.background = 'rgba(255, 107, 53, 0.3)';
              setTimeout(() => element.style.background = '', 200);
            } else {
              console.log(`🔄 [TABLE NAV] Navigation verticale ${isArrowUp ? 'haut' : 'bas'}`, element);
            }
          }
        };
        
        // Gestionnaire tactile pour mobile
        const handleTouchNavigation = (e: TouchEvent) => {
          if (!isMobile) return;
          
          const touch = e.touches[0];
          const rect = element.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          
          // Zone de navigation tactile (coins du conteneur)
          const cornerSize = 50;
          const isLeftEdge = x < cornerSize;
          const isRightEdge = x > rect.width - cornerSize;
          const isTopEdge = y < cornerSize;
          const isBottomEdge = y > rect.height - cornerSize;
          
          if (isLeftEdge || isRightEdge || isTopEdge || isBottomEdge) {
            console.log(`👆 [TABLE NAV] Touch navigation activé`);
            // Ajouter indicateur visuel temporaire
            element.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';
            setTimeout(() => {
              element.style.boxShadow = '';
            }, 1000);
          }
        };
        
        // Supprimer anciens listeners
        (element as any).__tableNavListener && element.removeEventListener('keydown', (element as any).__tableNavListener);
        (element as any).__tableTouchListener && element.removeEventListener('touchstart', (element as any).__tableTouchListener);
        
        // Ajouter nouveaux listeners
        element.addEventListener('keydown', handleContainerKeyDown);
        element.addEventListener('touchstart', handleTouchNavigation, { passive: true });
        
        // Sauvegarder références
        (element as any).__tableNavListener = handleContainerKeyDown;
        (element as any).__tableTouchListener = handleTouchNavigation;
      });
    };
    
    // Initialiser immédiatement
    initializeScrollableContainers();
    
    // Observer les changements DOM pour les nouveaux conteneurs
    const observer = new MutationObserver(initializeScrollableContainers);
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Observer changements d'orientation mobile
    const handleOrientationChange = () => {
      if (isMobile) {
        console.log(`📱 [TABLE NAV] Changement d'orientation - Paysage: ${isLandscape()}`);
        setTimeout(initializeScrollableContainers, 100);
      }
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
      
      // Nettoyer les listeners lors du démontage
      const containers = document.querySelectorAll('.overflow-x-auto');
      containers.forEach((container) => {
        const element = container as HTMLElement;
        if ((element as any).__tableNavListener) {
          element.removeEventListener('keydown', (element as any).__tableNavListener);
          delete (element as any).__tableNavListener;
        }
        if ((element as any).__tableTouchListener) {
          element.removeEventListener('touchstart', (element as any).__tableTouchListener);
          delete (element as any).__tableTouchListener;
        }
      });
    };
  }, []);
}