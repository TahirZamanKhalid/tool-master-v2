import { useState, useEffect } from 'react';

export const usePeriodicAds = () => {
  const [showAd, setShowAd] = useState(false);
  const [lastAdTime, setLastAdTime] = useState(Date.now());

  useEffect(() => {
    // Show first ad after 2 minutes of site being open
    const initialDelay = 2 * 60 * 1000; // 2 minutes
    
    const initialTimer = setTimeout(() => {
      setShowAd(true);
      setLastAdTime(Date.now());
    }, initialDelay);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (!showAd) return;

    // After closing an ad, wait 2-3 minutes (random) before showing next one
    const minInterval = 2 * 60 * 1000; // 2 minutes
    const maxInterval = 3 * 60 * 1000; // 3 minutes
    const randomInterval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;

    const timer = setTimeout(() => {
      setShowAd(true);
      setLastAdTime(Date.now());
    }, randomInterval);

    return () => clearTimeout(timer);
  }, [lastAdTime, showAd]);

  const handleCloseAd = () => {
    setShowAd(false);
    setLastAdTime(Date.now());
  };

  return { showAd, handleCloseAd };
};
