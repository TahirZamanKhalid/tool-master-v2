import { AdWatchModal } from "./AdWatchModal";
import { usePeriodicAds } from "@/hooks/usePeriodicAds";

export const PeriodicAdModal = () => {
  const { showAd, handleCloseAd } = usePeriodicAds();

  return (
    <AdWatchModal
      open={showAd}
      onOpenChange={(open) => {
        if (!open) handleCloseAd();
      }}
      onAdWatched={handleCloseAd}
      title="Advertisement"
      description="Please wait while the advertisement is displayed. This helps keep our tools free!"
      adDuration={10}
    />
  );
};
