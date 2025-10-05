import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

const Disclaimer = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Disclaimer - ToolMaster Pro"
        description="Important disclaimer and terms regarding the use of ToolMaster Pro's free online tools and services."
        keywords="disclaimer, terms, liability, use of service"
        canonical={`${window.location.origin}/disclaimer`}
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
            <h1>Disclaimer</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

            <h2>General Information</h2>
            <p>
              The information provided by ToolMaster Pro ("we," "us," or "our") on our website is for general 
              informational purposes only. All information on the site and our tools are provided in good faith, 
              however we make no representation or warranty of any kind, express or implied, regarding the accuracy, 
              adequacy, validity, reliability, availability, or completeness of any information on the site or 
              through our tools.
            </p>

            <h2>No Professional Advice</h2>
            <p>
              The tools and information provided on ToolMaster Pro are not intended to be a substitute for professional 
              advice. You should not act or refrain from acting based solely on the information obtained from our tools 
              without first consulting with the appropriate professional advisor. This includes, but is not limited to:
            </p>
            <ul>
              <li><strong>Medical Advice:</strong> Our BMI Calculator and health-related tools do not provide medical advice</li>
              <li><strong>Financial Advice:</strong> Currency converters and calculators are for informational purposes only</li>
              <li><strong>Legal Advice:</strong> Our tools do not constitute legal advice or create an attorney-client relationship</li>
              <li><strong>Technical Advice:</strong> Code formatters and development tools are provided as-is without professional guarantees</li>
            </ul>

            <h2>Accuracy of Tools and Results</h2>
            <p>
              While we strive to ensure the accuracy and reliability of our tools, we cannot guarantee that all 
              results will be 100% accurate or error-free. Factors that may affect accuracy include:
            </p>
            <ul>
              <li>User input errors</li>
              <li>Browser compatibility issues</li>
              <li>Network connectivity problems</li>
              <li>File format inconsistencies</li>
              <li>Third-party API limitations or changes</li>
            </ul>
            <p>
              Users are responsible for verifying the accuracy of results before using them for any important purpose.
            </p>

            <h2>External Links Disclaimer</h2>
            <p>
              Our website may contain links to external websites that are not provided or maintained by us. 
              We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on 
              these external websites. The inclusion of any links does not necessarily imply a recommendation 
              or endorse the views expressed within them.
            </p>

            <h2>Errors and Omissions</h2>
            <p>
              While we make every effort to ensure that the information on our website and tools is correct, 
              ToolMaster Pro does not warrant its completeness or accuracy; nor do we commit to ensuring that 
              the website remains available or that the material on the website is kept up to date.
            </p>

            <h2>Fair Use Disclaimer</h2>
            <p>
              Our website may use copyrighted material which has not always been specifically authorized by the 
              copyright owner. We make such material available for criticism, comment, news reporting, teaching, 
              scholarship, or research. We believe this constitutes a "fair use" of any such copyrighted material.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              Under no circumstances shall ToolMaster Pro have any liability to you for any loss or damage of 
              any kind incurred as a result of the use of the site or reliance on any information provided on 
              the site. Your use of the site and your reliance on any information on the site is solely at your own risk.
            </p>

            <h3>Specific Tool Limitations</h3>
            <ul>
              <li><strong>Image Tools:</strong> Results may vary based on image quality and format. We are not responsible for any loss of image quality or data</li>
              <li><strong>PDF Tools:</strong> We cannot guarantee preservation of all PDF features, formatting, or metadata</li>
              <li><strong>Converters:</strong> Conversion results may not always be perfect and should be verified before important use</li>
              <li><strong>Generators:</strong> Generated content (QR codes, barcodes, passwords, etc.) should be tested before production use</li>
              <li><strong>AI Tools:</strong> AI-generated content should be reviewed and verified as it may contain errors or biases</li>
            </ul>

            <h2>Data Loss</h2>
            <p>
              We are not responsible for any data loss that may occur from using our tools. Users are advised to:
            </p>
            <ul>
              <li>Keep backups of all important files before processing</li>
              <li>Verify results before deleting original files</li>
              <li>Not use our tools for mission-critical operations without proper backup procedures</li>
            </ul>

            <h2>Service Availability</h2>
            <p>
              We do not guarantee that our website or tools will be available at all times. We may experience 
              hardware, software, or other problems that may result in interruptions or delays in service. 
              We reserve the right to modify, suspend, or discontinue any part of our services without notice.
            </p>

            <h2>Third-Party Services</h2>
            <p>
              Some of our tools may rely on third-party APIs or services. We are not responsible for:
            </p>
            <ul>
              <li>Availability or performance of third-party services</li>
              <li>Accuracy of data provided by third-party services</li>
              <li>Changes to third-party service terms or pricing</li>
              <li>Privacy practices of third-party services</li>
            </ul>

            <h2>User Responsibility</h2>
            <p>
              Users are responsible for:
            </p>
            <ul>
              <li>Ensuring they have the right to process any data they upload</li>
              <li>Complying with all applicable laws and regulations</li>
              <li>Not uploading malicious, illegal, or copyrighted content</li>
              <li>Verifying results before using them for any important purpose</li>
              <li>Maintaining their own backups of important data</li>
            </ul>

            <h2>Changes to This Disclaimer</h2>
            <p>
              We may update our Disclaimer from time to time. We will notify you of any changes by posting 
              the new Disclaimer on this page and updating the "Last updated" date. You are advised to review 
              this Disclaimer periodically for any changes.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Disclaimer, please <a href="/contact">contact us</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Disclaimer;