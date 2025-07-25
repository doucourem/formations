import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

// Hook pour optimiser les performances de rendu
export function usePerformanceOptimization() {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current++;
    lastRenderTimeRef.current = Date.now();
  });

  const memoizedCallback = useCallback((fn: Function) => {
    return (...args: any[]) => fn(...args);
  }, []);

  const optimizedMemo = useCallback((data: any, deps: any[]) => {
    return useMemo(() => data, deps);
  }, []);

  return {
    renderCount: renderCountRef.current,
    lastRenderTime: lastRenderTimeRef.current,
    memoizedCallback,
    optimizedMemo
  };
}

// Hook pour gérer les listes grandes avec virtualisation simple
export function useVirtualizedList<T>(items: T[], itemHeight = 60, containerHeight = 400) {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(Math.ceil(containerHeight / itemHeight));

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  const handleScroll = useCallback((scrollTop: number) => {
    const newStartIndex = Math.floor(scrollTop / itemHeight);
    const newEndIndex = newStartIndex + Math.ceil(containerHeight / itemHeight);
    
    setStartIndex(newStartIndex);
    setEndIndex(Math.min(newEndIndex, items.length - 1));
  }, [items.length, itemHeight, containerHeight]);

  return {
    visibleItems,
    handleScroll,
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight
  };
}

// Hook pour débouncer les recherches et filtres
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook pour la mémorisation intelligente des calculs lourds
export function useSmartMemo<T>(
  computeValue: () => T,
  deps: any[],
  options: { maxAge?: number; compareDeep?: boolean } = {}
) {
  const { maxAge = 30000, compareDeep = false } = options;
  const cacheRef = useRef<{ value: T; timestamp: number; deps: any[] } | null>(null);

  return useMemo(() => {
    const now = Date.now();
    const cache = cacheRef.current;

    // Vérifier si le cache est encore valide
    if (cache && now - cache.timestamp < maxAge) {
      // Comparer les dépendances
      const depsChanged = compareDeep 
        ? JSON.stringify(deps) !== JSON.stringify(cache.deps)
        : deps.some((dep, index) => dep !== cache.deps[index]);

      if (!depsChanged) {
        return cache.value;
      }
    }

    // Recalculer et mettre en cache
    const value = computeValue();
    cacheRef.current = { value, timestamp: now, deps: [...deps] };
    return value;
  }, deps);
}