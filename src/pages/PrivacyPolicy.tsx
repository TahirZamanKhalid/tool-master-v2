import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Privacy Policy - ToolMaster Pro"
        description="Read ToolMaster Pro's privacy policy to understand how we collect, use, and protect your personal information when you use our free online tools."
        keywords="privacy policy, data protection, user privacy, data security"
        canonical="https://toolmaster.cloud/privacy-policy"
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
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Introduction</h2>
          <p>
            Welcome to ToolMaster Pro. We respect your privacy and are committed to protecting your personal data.
            This privacy policy will inform you about how we handle your data when you use our website.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We collect minimal information to provide you with our services:
          </p>
          <ul>
            <li>Usage data (pages visited, tools used)</li>
            <li>Technical data (browser type, IP address)</li>
            <li>Files you upload are processed locally in your browser when possible</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Improve user experience</li>
            <li>Analyze usage patterns</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your data. Most tools process data
            directly in your browser without uploading to our servers.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through our contact page.
          </p>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
