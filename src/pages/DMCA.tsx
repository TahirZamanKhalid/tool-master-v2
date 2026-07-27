import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

const DMCA = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="DMCA Copyright Policy - ToolMaster Pro"
        description="ToolMaster Pro's Digital Millennium Copyright Act (DMCA) policy and procedures for reporting copyright infringement."
        keywords="dmca, copyright, infringement, takedown notice"
        canonical="https://toolmaster.cloud/dmca"
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
            <h1>DMCA Copyright Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

            <h2>Introduction</h2>
            <p>
              ToolMaster Pro respects the intellectual property rights of others and expects our users to do the same. 
              In accordance with the Digital Millennium Copyright Act of 1998 (DMCA), we will respond expeditiously to 
              claims of copyright infringement committed using our website or services.
            </p>

            <h2>Our Copyright Policy</h2>
            <p>
              It is our policy to:
            </p>
            <ul>
              <li>Remove or disable access to material that is claimed to be infringing upon another's copyright</li>
              <li>Terminate, in appropriate circumstances, users who are repeat infringers</li>
              <li>Accommodate and not interfere with standard technical measures used by copyright owners to protect their materials</li>
            </ul>

            <h2>Filing a DMCA Notice of Copyright Infringement</h2>
            <p>
              If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement 
              and is accessible on our website, please notify our copyright agent as set forth below.
            </p>

            <h3>Required Information</h3>
            <p>
              For your complaint to be valid under the DMCA, you must provide the following information in writing:
            </p>
            <ul>
              <li>An electronic or physical signature of a person authorized to act on behalf of the copyright owner</li>
              <li>Identification of the copyrighted work that you claim has been infringed</li>
              <li>Identification of the material that is claimed to be infringing and where it is located on our website</li>
              <li>Your contact information, including address, telephone number, and email address</li>
              <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner, its agent, or law</li>
              <li>A statement, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf</li>
            </ul>

            <h3>How to Submit a Notice</h3>
            <p>
              Please send your DMCA notice to our designated Copyright Agent:
            </p>
            <div className="bg-muted/50 p-6 rounded-lg not-prose my-6">
              <p className="font-semibold mb-2">Copyright Agent</p>
              <p>ToolMaster Pro</p>
              <p>Email: dmca@toolmasterpro.com</p>
              <p>Subject Line: "DMCA Takedown Request"</p>
            </div>

            <h2>Counter-Notification</h2>
            <p>
              If you believe that your content that was removed (or to which access was disabled) is not infringing, 
              or that you have the authorization from the copyright owner, the copyright owner's agent, or pursuant 
              to the law, to post and use the content, you may send a counter-notice containing the following information 
              to our Copyright Agent:
            </p>
            <ul>
              <li>Your physical or electronic signature</li>
              <li>Identification of the content that has been removed or to which access has been disabled and the location at which the content appeared before it was removed or disabled</li>
              <li>A statement that you have a good faith belief that the content was removed or disabled as a result of mistake or a misidentification of the content</li>
              <li>Your name, address, telephone number, and email address</li>
              <li>A statement that you consent to the jurisdiction of the federal court in your district and that you will accept service of process from the person who provided notification of the alleged infringement</li>
            </ul>

            <h2>Repeat Infringers</h2>
            <p>
              In accordance with the DMCA and other applicable law, we have adopted a policy of terminating, 
              in appropriate circumstances and at our sole discretion, users who are deemed to be repeat infringers. 
              We may also, at our sole discretion, limit access to our website and/or terminate the accounts of any 
              users who infringe any intellectual property rights of others, whether or not there is any repeat infringement.
            </p>

            <h2>User-Generated Content</h2>
            <p>
              Our website allows users to process their own content through our tools. We do not monitor or review 
              user-uploaded content before it is processed. However, we reserve the right to:
            </p>
            <ul>
              <li>Remove any content that violates this policy</li>
              <li>Disable access to tools if they are being used to infringe copyright</li>
              <li>Cooperate with law enforcement in copyright infringement investigations</li>
            </ul>

            <h2>Misrepresentation</h2>
            <p>
              Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that:
            </p>
            <ul>
              <li>Material or activity is infringing, or</li>
              <li>Material or activity was removed or disabled by mistake or misidentification</li>
            </ul>
            <p>
              may be subject to liability for damages, including costs and attorneys' fees.
            </p>

            <h2>No Obligation to Monitor</h2>
            <p>
              We are not obligated to monitor access to or use of our website or to review or edit any user content. 
              However, we have the right to do so for the purpose of operating our website, ensuring compliance with 
              our Terms of Service, and complying with applicable law or court order.
            </p>

            <h2>Fair Use</h2>
            <p>
              Before submitting a DMCA notice, please consider whether the use of copyrighted material may be protected 
              under the fair use doctrine. Fair use is a legal doctrine that permits limited use of copyrighted material 
              without requiring permission from the rights holders for purposes such as:
            </p>
            <ul>
              <li>Commentary and criticism</li>
              <li>News reporting</li>
              <li>Teaching and scholarship</li>
              <li>Research</li>
            </ul>

            <h2>Processing Time</h2>
            <p>
              Upon receipt of a valid DMCA notice, we will:
            </p>
            <ul>
              <li>Remove or disable access to the allegedly infringing material</li>
              <li>Notify the user who posted the material</li>
              <li>Process the removal within 24-48 hours of receiving a valid notice</li>
            </ul>

            <h2>International Users</h2>
            <p>
              This DMCA policy is intended to comply with United States copyright law. If you are located outside 
              the United States and believe your copyright has been infringed, you may still file a DMCA notice, 
              or you may contact us to discuss alternative procedures under your local copyright laws.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We reserve the right to modify this policy at any time. Changes will be effective immediately upon 
              posting to our website. Your continued use of our website following the posting of changes constitutes 
              your acceptance of such changes.
            </p>

            <h2>Contact Information</h2>
            <p>
              For all DMCA-related inquiries and notices, please contact our Copyright Agent at the contact 
              information provided above. For general inquiries, please visit our <a href="/contact">contact page</a>.
            </p>

            <h2>Additional Resources</h2>
            <p>
              For more information about the DMCA, please visit:
            </p>
            <ul>
              <li><a href="https://www.copyright.gov/legislation/dmca.pdf" target="_blank" rel="noopener noreferrer">Official DMCA Text (U.S. Copyright Office)</a></li>
              <li><a href="https://www.copyright.gov/" target="_blank" rel="noopener noreferrer">U.S. Copyright Office</a></li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DMCA;
