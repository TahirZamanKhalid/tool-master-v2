import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem("cookieConsent");
    if (!hasConsented) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "false");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg md:p-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies. 
            See our <a href="/privacy-policy" className="underline text-primary hover:text-primary/80">Privacy Policy</a> for more details.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={declineCookies} className="whitespace-nowrap">
            Decline
          </Button>
          <Button onClick={acceptCookies} className="whitespace-nowrap">
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};
