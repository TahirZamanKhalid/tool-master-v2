import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Privacy Policy - ToolMaster Pro"
        description="Read ToolMaster Pro's privacy policy to understand how we collect, use, and protect your personal information when you use our free online tools."
        keywords="privacy policy, data protection, user privacy, data security, adsense policy, cookies policy"
        canonical="https://toolmaster.cloud/privacy-policy"
      />
      <Header />
      <main className="flex-1">
        <div className="container py-12 px-4">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Introduction</h2>
          <p>
            Welcome to ToolMaster Pro. We respect your privacy and are committed to protecting your personal data.
            This privacy policy informs you about how we handle your data when you use our website, and explains your privacy rights and how the law protects you.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We collect minimal information to provide you with our services:
          </p>
          <ul>
            <li><strong>Usage data:</strong> Information about pages visited and tools used.</li>
            <li><strong>Technical data:</strong> Browser type, IP address, device information.</li>
            <li><strong>Files:</strong> Files you upload for processing (like images or PDFs) are processed locally in your browser whenever possible and are not stored on our servers.</li>
          </ul>

          <h2>Google AdSense and Advertising Cookies</h2>
          <p>
            We use Google AdSense to display advertisements on our website. Google, as a third-party vendor, uses cookies to serve ads on ToolMaster Pro.
          </p>
          <ul>
            <li>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</li>
            <li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
            <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Ads Settings</a>. (Alternatively, you can direct users to opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://aboutads.info" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.)</li>
          </ul>

          <h2>Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track the activity on our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze our Service.
            You can instruct your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if you do not accept Cookies, you may not be able to use some parts of our Service.
          </p>

          <h2>How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide, maintain, and improve our services.</li>
            <li>Analyze usage patterns to enhance user experience.</li>
            <li>Deliver relevant advertising to you (as detailed in the AdSense section).</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your data. We emphasize that most tools process data
            directly in your browser without uploading to our servers, ensuring your files remain private.
          </p>

          <h2>Your Rights (GDPR & CCPA)</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request deletion or correction of your data.</li>
            <li>Object to or restrict data processing.</li>
            <li>Opt-out of the sale of personal information (we do not sell personal data).</li>
          </ul>

          <h2>Changes to this Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through our <a href="/contact">contact page</a>.
          </p>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
