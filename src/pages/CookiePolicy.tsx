import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

const CookiePolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Cookie Policy - ToolMaster Pro"
        description="Learn about how ToolMaster Pro uses cookies and similar technologies to improve your browsing experience and analyze site usage."
        keywords="cookie policy, cookies, privacy, data collection"
        canonical="https://toolmaster.cloud/cookie-policy"
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
            <h1>Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

            <h2>What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
              Cookies are widely used by website owners to make their websites work, or to work more efficiently, 
              as well as to provide reporting information.
            </p>

            <h2>How We Use Cookies</h2>
            <p>
              ToolMaster Pro uses cookies for the following purposes:
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for the website to function properly, such as remembering your theme preference (dark/light mode)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website by collecting and reporting information anonymously</li>
              <li><strong>Advertising Cookies:</strong> Used to deliver advertisements that are relevant to you and your interests</li>
            </ul>

            <h2>Types of Cookies We Use</h2>
            
            <h3>1. Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function and cannot be switched off in our systems. 
              They are usually only set in response to actions made by you which amount to a request for services, 
              such as setting your privacy preferences or filling in forms.
            </p>

            <h3>2. Performance and Analytics Cookies</h3>
            <p>
              These cookies allow us to count visits and traffic sources so we can measure and improve the performance 
              of our site. They help us know which pages are the most and least popular and see how visitors move 
              around the site. All information these cookies collect is aggregated and therefore anonymous.
            </p>

            <h3>3. Advertising Cookies</h3>
            <p>
              These cookies may be set through our site by our advertising partners (Google AdSense). They may be 
              used by those companies to build a profile of your interests and show you relevant adverts on other sites. 
              They do not store directly personal information but are based on uniquely identifying your browser and 
              internet device.
            </p>

            <h2>Third-Party Cookies</h2>
            <p>
              We use Google AdSense to display advertisements on our website. Google AdSense uses cookies to serve ads 
              based on your prior visits to our website or other websites. You can opt out of personalized advertising 
              by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
            </p>

            <h2>Managing Cookies</h2>
            <p>
              You can control and/or delete cookies as you wish. You can delete all cookies that are already on your 
              computer and you can set most browsers to prevent them from being placed. However, if you do this, you 
              may have to manually adjust some preferences every time you visit a site and some services and functionalities 
              may not work.
            </p>

            <h3>Browser-Specific Instructions</h3>
            <ul>
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
              <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
            </ul>

            <h2>Local Storage</h2>
            <p>
              In addition to cookies, we may use local storage to save your preferences (such as theme selection) 
              and improve your user experience. Local storage data remains on your device and is not transmitted to our servers.
            </p>

            <h2>Your Consent</h2>
            <p>
              By using our website, you consent to our use of cookies in accordance with this Cookie Policy. 
              If you do not agree with our use of cookies, you should change your browser settings accordingly 
              or discontinue use of our website.
            </p>

            <h2>Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, 
              or our data practices. We will notify you of any significant changes by posting the new Cookie Policy 
              on this page and updating the "Last updated" date.
            </p>

            <h2>More Information</h2>
            <p>
              For more information about how we handle your personal data, please see our <a href="/privacy-policy">Privacy Policy</a>. 
              For general information about cookies, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a>.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about our Cookie Policy, please <a href="/contact">contact us</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;