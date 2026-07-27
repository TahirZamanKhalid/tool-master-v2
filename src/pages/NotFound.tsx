import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Home, Search, ArrowLeft, Wrench } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="404 — Page Not Found | ToolMaster Pro"
        description="The page you are looking for doesn't exist. Browse 150+ free online tools at ToolMaster Pro."
        canonical="https://toolmaster.cloud/404"
        noindex={true}
      />
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background blur */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl" />
        </div>

        <div className="container max-w-2xl text-center space-y-6">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter">
            <span className="text-gradient">404</span>
          </h1>

          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-black text-foreground">
              Lost in the toolbox?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved. But don't worry — we've got 150+ other tools waiting for you.
            </p>
            <p className="text-xs text-muted-foreground/60 font-mono">
              Path: {location.pathname}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-11 shadow-md shadow-primary/25"
            >
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl px-6 h-11 font-bold"
            >
              <Link to="/tools">
                <Wrench className="mr-2 h-4 w-4" />
                Browse Tools
              </Link>
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="lg"
              className="rounded-xl px-6 h-11 font-bold"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
