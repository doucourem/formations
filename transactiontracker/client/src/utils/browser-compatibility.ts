// Browser compatibility and feature detection utilities

export interface BrowserInfo {
  name: string;
  version: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  supportsWebSocket: boolean;
  supportsPWA: boolean;
  supportsNotifications: boolean;
  supportsServiceWorker: boolean;
}

export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\b(?:Chrome|Firefox|Safari)\b)/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;

  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  // Detect browser
  if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
    browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
  }

  return {
    name: browserName,
    version: browserVersion,
    isMobile,
    isTablet,
    isDesktop,
    supportsWebSocket: 'WebSocket' in window,
    supportsPWA: 'serviceWorker' in navigator && 'PushManager' in window,
    supportsNotifications: 'Notification' in window,
    supportsServiceWorker: 'serviceWorker' in navigator,
  };
}

export function checkCriticalFeatures(): { supported: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!('WebSocket' in window)) {
    missing.push('WebSocket');
  }
  
  if (!('localStorage' in window)) {
    missing.push('LocalStorage');
  }
  
  if (!('fetch' in window)) {
    missing.push('Fetch API');
  }
  
  if (!('Promise' in window)) {
    missing.push('Promises');
  }

  return {
    supported: missing.length === 0,
    missing
  };
}

export function applyBrowserSpecificFixes(): void {
  const browserInfo = detectBrowser();
  
  // Firefox-specific fixes
  if (browserInfo.name === 'Firefox') {
    // Fix Firefox viewport calculations
    const setFirefoxVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setFirefoxVH();
    window.addEventListener('resize', setFirefoxVH);
    
    // Fix Firefox input focus behavior
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        if (input instanceof HTMLElement) {
          input.style.fontSize = '16px';
          input.style.outline = '2px solid #3b82f6';
          input.style.outlineOffset = '2px';
        }
      });
      
      input.addEventListener('blur', () => {
        if (input instanceof HTMLElement) {
          input.style.outline = '';
          input.style.outlineOffset = '';
        }
      });
    });
    
    // Fix Firefox button focus
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('focus', () => {
        if (button instanceof HTMLElement) {
          button.style.outline = '2px solid #3b82f6';
          button.style.outlineOffset = '2px';
        }
      });
      
      button.addEventListener('blur', () => {
        if (button instanceof HTMLElement) {
          button.style.outline = '';
          button.style.outlineOffset = '';
        }
      });
    });
    
    // Fix Firefox grid layout
    const gridElements = document.querySelectorAll('.grid');
    gridElements.forEach(grid => {
      if (grid instanceof HTMLElement) {
        grid.style.display = 'grid';
        grid.style.webkitDisplay = 'grid';
        grid.style.mozDisplay = 'grid';
      }
    });
  }
  
  // iOS Safari fixes
  if (browserInfo.name === 'Safari' && browserInfo.isMobile) {
    // Fix viewport height on iOS
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    // Prevent zoom on input focus
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        if (input instanceof HTMLElement) {
          input.style.fontSize = '16px';
        }
      });
    });
  }
  
  // Chrome Android fixes
  if (browserInfo.name === 'Chrome' && browserInfo.isMobile) {
    // Fix address bar height changes
    const setFullHeight = () => {
      document.documentElement.style.setProperty('--full-height', `${window.innerHeight}px`);
    };
    
    setFullHeight();
    window.addEventListener('resize', setFullHeight);
  }
  
  // General mobile fixes
  if (browserInfo.isMobile) {
    // Disable pull-to-refresh
    document.body.style.overscrollBehavior = 'none';
    
    // Improve touch responsiveness
    document.body.style.touchAction = 'manipulation';
  }
}

export function logBrowserInfo(): void {
  const browserInfo = detectBrowser();
  const features = checkCriticalFeatures();
  
  console.group('🌐 Browser Compatibility Info');
  console.log('Browser:', `${browserInfo.name} ${browserInfo.version}`);
  console.log('Device Type:', browserInfo.isMobile ? 'Mobile' : browserInfo.isTablet ? 'Tablet' : 'Desktop');
  console.log('Critical Features:', features.supported ? '✅ All supported' : `❌ Missing: ${features.missing.join(', ')}`);
  console.log('WebSocket:', browserInfo.supportsWebSocket ? '✅' : '❌');
  console.log('PWA Support:', browserInfo.supportsPWA ? '✅' : '❌');
  console.log('Notifications:', browserInfo.supportsNotifications ? '✅' : '❌');
  console.groupEnd();
}