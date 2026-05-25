import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Terms of Service - ToolMaster Pro"
        description="Read ToolMaster Pro's terms of service to understand the rules and regulations for using our free online tools and services."
        keywords="terms of service, user agreement, terms and conditions, legal terms, advertising terms"
        canonical="https://toolmaster.cloud/terms-of-service"
      />
      <Header />
      <main className="flex-1">
        <div className="container py-12 px-4">
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
            <li>Interfere with or disable any advertising features on the site</li>
          </ul>

          <h2>Advertising and Third-Party Content</h2>
          <p>
            ToolMaster Pro uses third-party advertising networks, such as Google AdSense, to display ads. 
            By using our site, you acknowledge and agree that these third parties may use cookies and other tracking technologies 
            to serve personalized advertisements based on your browsing history. 
            Please review our <a href="/privacy-policy">Privacy Policy</a> for more details on how advertising data is handled.
          </p>

          <h2>Cookies</h2>
          <p>
            We use cookies to enhance your experience, analyze traffic, and serve relevant advertisements. 
            By continuing to use ToolMaster Pro, you consent to our use of cookies in accordance with our Privacy Policy.
          </p>

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
            For questions about these Terms of Service, please contact us through our <a href="/contact">contact page</a>.
          </p>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
