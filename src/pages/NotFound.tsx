import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AdSpace } from "@/components/AdSpace";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="container max-w-2xl text-center space-y-8 py-12">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold text-primary">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold">Oops! Page not found</h2>
          <p className="text-lg text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Ad on 404 page */}
        <AdSpace size="rectangle" />

        <Button size="lg" onClick={() => window.location.href = "/"} className="gradient-primary">
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
