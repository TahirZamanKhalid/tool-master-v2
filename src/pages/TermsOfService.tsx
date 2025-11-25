import { Header } from "@/components/Header";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Agreement to Terms</h2>
          <p>
            By accessing and using ToolMaster Pro, you agree to be bound by these Terms of Service
            and all applicable laws and regulations.
          </p>

          <h2>Use License</h2>
          <p>
            We grant you a personal, non-exclusive, non-transferable license to use our tools for
            lawful purposes only.
          </p>

          <h2>Acceptable Use</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Use the service for any illegal purposes</li>
            <li>Attempt to reverse engineer or exploit our tools</li>
            <li>Upload malicious content or viruses</li>
            <li>Overload our servers with automated requests</li>
          </ul>

          <h2>Disclaimer</h2>
          <p>
            Our tools are provided "as is" without warranties of any kind. We do not guarantee
            the accuracy, completeness, or reliability of results.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            ToolMaster Pro shall not be liable for any damages arising from the use or inability
            to use our services.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the service
            constitutes acceptance of modified terms.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about these Terms of Service, please contact us through our contact page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
