import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface AutoRefreshIndicatorProps {
  lastRefreshTime?: Date;
  intervalSeconds?: number;
  isActive?: boolean;
}

export function AutoRefreshIndicator({ 
  lastRefreshTime, 
  intervalSeconds = 30, 
  isActive = true 
}: AutoRefreshIndicatorProps) {
  const [timeLeft, setTimeLeft] = useState(intervalSeconds);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRefreshing(true);
          setTimeout(() => setIsRefreshing(false), 1000);
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [intervalSeconds, isActive]);

  // Reset when lastRefreshTime changes
  useEffect(() => {
    if (lastRefreshTime) {
      setTimeLeft(intervalSeconds);
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [lastRefreshTime, intervalSeconds]);

  if (!isActive) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
      <RefreshCw 
        className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} 
      />
      <span>
        Actualisation dans {timeLeft}s
      </span>
      {lastRefreshTime && (
        <span className="text-gray-400">
          • Dernière: {lastRefreshTime.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}
        </span>
      )}
    </div>
  );
}