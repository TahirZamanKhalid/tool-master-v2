import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Copy, Eye } from "lucide-react";

const EmailSignatureGenerator = () => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [template, setTemplate] = useState("professional");
  const [colorScheme, setColorScheme] = useState("blue");
  const [signatureHTML, setSignatureHTML] = useState("");

  const colors = {
    blue: { primary: "#0066cc", secondary: "#666666" },
    green: { primary: "#00AA4F", secondary: "#666666" },
    purple: { primary: "#7B68EE", secondary: "#666666" },
    red: { primary: "#DC143C", secondary: "#666666" },
    orange: { primary: "#FF8C00", secondary: "#666666" },
    black: { primary: "#000000", secondary: "#666666" }
  };

  const generateSignature = () => {
    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }

    const color = colors[colorScheme as keyof typeof colors];
    let html = "";

    if (template === "professional") {
      html = `
<table cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
  <tr>
    <td style="padding: 20px 0; border-top: 2px solid ${color.primary};">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right: 20px; vertical-align: top;">
            <div style="font-size: 18px; font-weight: bold; color: ${color.primary};">${name}</div>
            ${title ? `<div style="font-size: 13px; color: ${color.secondary}; margin-top: 4px;">${title}</div>` : ''}
            ${company ? `<div style="font-size: 13px; color: ${color.secondary}; margin-top: 2px;">${company}</div>` : ''}
            <div style="margin-top: 10px;">
              ${email ? `<div style="margin-bottom: 4px;"><a href="mailto:${email}" style="color: ${color.primary}; text-decoration: none;">📧 ${email}</a></div>` : ''}
              ${phone ? `<div style="margin-bottom: 4px; color: ${color.secondary};">📞 ${phone}</div>` : ''}
              ${website ? `<div style="margin-bottom: 4px;"><a href="${website}" style="color: ${color.primary}; text-decoration: none;">🌐 ${website}</a></div>` : ''}
              ${address ? `<div style="color: ${color.secondary}; font-size: 12px; margin-top: 6px;">📍 ${address}</div>` : ''}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
    } else if (template === "minimal") {
      html = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #333;">
  <div style="font-weight: 600; font-size: 15px; color: ${color.primary};">${name}</div>
  ${title ? `<div style="color: ${color.secondary}; margin-top: 2px;">${title}</div>` : ''}
  ${company ? `<div style="color: ${color.secondary};">${company}</div>` : ''}
  <div style="margin-top: 8px; color: ${color.secondary};">
    ${email ? `<a href="mailto:${email}" style="color: ${color.primary}; text-decoration: none;">${email}</a>` : ''}
    ${phone ? ` | ${phone}` : ''}
    ${website ? ` | <a href="${website}" style="color: ${color.primary}; text-decoration: none;">${website}</a>` : ''}
  </div>
</div>`;
    } else if (template === "modern") {
      html = `
<table cellpadding="0" cellspacing="0" style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px;">
  <tr>
    <td style="background: linear-gradient(135deg, ${color.primary} 0%, ${color.primary}dd 100%); color: white; padding: 15px 20px; border-radius: 8px;">
      <div style="font-size: 19px; font-weight: bold;">${name}</div>
      ${title ? `<div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">${title}</div>` : ''}
      ${company ? `<div style="font-size: 13px; opacity: 0.9;">${company}</div>` : ''}
    </td>
  </tr>
  <tr>
    <td style="padding: 15px 0;">
      ${email ? `<div style="margin-bottom: 6px;"><a href="mailto:${email}" style="color: ${color.primary}; text-decoration: none; font-weight: 500;">📧 ${email}</a></div>` : ''}
      ${phone ? `<div style="margin-bottom: 6px; color: #666;">📞 ${phone}</div>` : ''}
      ${website ? `<div><a href="${website}" style="color: ${color.primary}; text-decoration: none; font-weight: 500;">🌐 ${website}</a></div>` : ''}
    </td>
  </tr>
</table>`;
    }

    setSignatureHTML(html);
    toast.success("Email signature generated!");
  };

  const copyHTML = () => {
    navigator.clipboard.writeText(signatureHTML);
    toast.success("HTML copied to clipboard!");
  };

  const copyAsText = () => {
    const text = `
${name}
${title}
${company}
${email}
${phone}
${website}
${address}
    `.trim();
    navigator.clipboard.writeText(text);
    toast.success("Plain text copied!");
  };

  return (
    <ToolLayout
      title="Email Signature Generator"
      description="Create professional email signatures for Gmail, Outlook, Apple Mail. Free HTML email signature generator with templates. Boost your professional image."
      category="Generators"
      instructions={[
        "Enter your contact details",
        "Choose a template style",
        "Select color scheme",
        "Click generate to create signature",
        "Copy HTML and paste in your email client"
      ]}
      relatedTools={[
        { name: "Business Name Generator", path: "/tools/business-name-generator" },
        { name: "QR Code Generator", path: "/tools/qr-code-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Marketing Director"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corporation"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="www.company.com"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Business St, City, State 12345"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Style Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Template Style</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Color Scheme</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <Button onClick={generateSignature} className="w-full" size="lg">
              <Mail className="h-4 w-4 mr-2" />
              Generate Email Signature
            </Button>
          </CardContent>
        </Card>

        {/* Preview and Code */}
        {signatureHTML && (
          <>
            <Card className="border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Preview</h3>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg" dangerouslySetInnerHTML={{ __html: signatureHTML }} />

                <div className="flex gap-2">
                  <Button onClick={copyHTML} className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy HTML
                  </Button>
                  <Button onClick={copyAsText} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy as Plain Text
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* HTML Code */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <Label>HTML Code (Copy this to your email client)</Label>
                <Textarea
                  value={signatureHTML}
                  readOnly
                  className="font-mono text-xs"
                  rows={10}
                  onClick={(e) => e.currentTarget.select()}
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Setup Instructions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">How to Add to Email Clients</h3>
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-semibold mb-2">Gmail</p>
                <p className="text-muted-foreground">Settings → General → Signature → Create new → Paste HTML</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-semibold mb-2">Outlook</p>
                <p className="text-muted-foreground">File → Options → Mail → Signatures → New → Paste HTML</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-semibold mb-2">Apple Mail</p>
                <p className="text-muted-foreground">Mail → Preferences → Signatures → Add → Paste HTML</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default EmailSignatureGenerator;
