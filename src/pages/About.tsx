import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Target, Users, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { LazyAdSpace } from "@/components/LazyAdSpace";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="About Us - ToolMaster Pro"
        description="Learn about ToolMaster Pro, your trusted source for 100+ free online tools. Our mission is to make everyday tasks easier and more efficient for everyone."
        keywords="about toolmaster pro, free online tools, web tools, productivity tools"
        canonical={`${window.location.origin}/about`}
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

          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              About ToolMaster Pro
            </h1>
            <p className="text-xl text-muted-foreground mb-12">
              Your trusted platform for free, professional-grade online tools
            </p>
            
            <LazyAdSpace size="leaderboard" className="mb-8" />

            <div className="prose prose-slate dark:prose-invert max-w-none mb-12">
              <h2>Who We Are</h2>
              <p>
                ToolMaster Pro is a comprehensive platform offering 100+ free online tools designed to simplify your daily tasks. Whether you're a professional, student, content creator, or just someone looking to get things done efficiently, we've got the perfect tool for you.
              </p>

              <h2>Our Mission</h2>
              <p>
                We believe that powerful tools shouldn't come with a price tag. Our mission is to democratize access to professional-grade utilities, making productivity tools available to everyone, everywhere, completely free of charge.
              </p>

              <h2>What We Offer</h2>
              <p>
                Our extensive collection includes tools for image editing, PDF manipulation, text processing, code formatting, calculators, converters, generators, and much more. All tools are:
              </p>
              <ul>
                <li>100% free to use with no hidden charges</li>
                <li>No registration or signup required</li>
                <li>Privacy-focused with client-side processing when possible</li>
                <li>Mobile-friendly and responsive</li>
                <li>Regularly updated with new features</li>
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="p-6">
                <Target className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become the world's most trusted and comprehensive free online tools platform, serving millions of users worldwide.
                </p>
              </Card>

              <Card className="p-6">
                <Users className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Our Community</h3>
                <p className="text-muted-foreground">
                  Serving thousands of users daily across the globe, helping professionals and individuals accomplish their tasks efficiently.
                </p>
              </Card>

              <Card className="p-6">
                <Zap className="h-12 w-12 text-accent mb-4" />
                <h3 className="text-xl font-semibold mb-2">Our Technology</h3>
                <p className="text-muted-foreground">
                  Built with modern web technologies, ensuring fast performance, security, and privacy protection for all our users.
                </p>
              </Card>

              <Card className="p-6">
                <Heart className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-xl font-semibold mb-2">Our Commitment</h3>
                <p className="text-muted-foreground">
                  Committed to providing free, reliable, and user-friendly tools while respecting your privacy and never selling your data.
                </p>
              </Card>
            </div>

            <div className="bg-muted/50 rounded-lg p-8 mb-12">
              <h2 className="text-2xl font-bold mb-4">Why Choose ToolMaster Pro?</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">✓ Always Free</h3>
                  <p className="text-muted-foreground">
                    We believe in keeping our tools accessible to everyone. No subscriptions, no hidden fees, ever.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">✓ Privacy First</h3>
                  <p className="text-muted-foreground">
                    Most of our tools process data directly in your browser, ensuring your files never leave your device.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">✓ No Registration</h3>
                  <p className="text-muted-foreground">
                    Jump right in and start using our tools. No account creation, no email verification required.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">✓ Constantly Evolving</h3>
                  <p className="text-muted-foreground">
                    We regularly add new tools and features based on user feedback and emerging needs.
                  </p>
                </div>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h2>Our Values</h2>
              <p>
                <strong>Accessibility:</strong> We ensure our tools work on all devices and browsers, making them available to everyone regardless of their technical setup.
              </p>
              <p>
                <strong>Simplicity:</strong> Our interfaces are designed to be intuitive and easy to use, even for first-time users.
              </p>
              <p>
                <strong>Quality:</strong> We maintain high standards for all our tools, ensuring accurate results and reliable performance.
              </p>
              <p>
                <strong>Privacy:</strong> Your data security is our top priority. We minimize data collection and maximize transparency.
              </p>

              <h2>Get in Touch</h2>
              <p>
                Have questions, suggestions, or feedback? We'd love to hear from you! Visit our <a href="/contact" className="text-primary hover:underline">contact page</a> to get in touch with our team.
              </p>
            </div>
            
            <LazyAdSpace size="leaderboard" className="mt-8" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;