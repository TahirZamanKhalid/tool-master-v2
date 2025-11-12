import { useState, useEffect } from 'react';

export const useAdRefresh = (intervalMinutes: number = 3) => {
  const [adKey, setAdKey] = useState(0);

  useEffect(() => {
    // Convert minutes to milliseconds
    const intervalMs = intervalMinutes * 60 * 1000;

    const timer = setInterval(() => {
      setAdKey(prev => prev + 1);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMinutes]);

  return adKey;
};
