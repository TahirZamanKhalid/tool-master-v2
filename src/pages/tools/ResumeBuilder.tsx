import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Plus, Trash2, Download } from "lucide-react";
import { AdWatchModal } from "@/components/AdWatchModal";
import { jsPDF } from "jspdf";

interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  duration: string;
  details: string;
}

interface Skill {
  name: string;
}

const ResumeBuilder = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");

  const [experiences, setExperiences] = useState<Experience[]>([
    { company: "", position: "", duration: "", description: "" }
  ]);

  const [education, setEducation] = useState<Education[]>([
    { school: "", degree: "", duration: "", details: "" }
  ]);

  const [skills, setSkills] = useState<Skill[]>([{ name: "" }]);

  const [template, setTemplate] = useState("professional");
  const [colorScheme, setColorScheme] = useState("blue");
  const [showAdModal, setShowAdModal] = useState(false);
  const [canDownload, setCanDownload] = useState(false);

  const colorSchemes = {
    blue: { primary: "#2563eb", secondary: "#1e40af", text: "#1e293b" },
    green: { primary: "#16a34a", secondary: "#15803d", text: "#1e293b" },
    purple: { primary: "#9333ea", secondary: "#7e22ce", text: "#1e293b" },
    red: { primary: "#dc2626", secondary: "#b91c1c", text: "#1e293b" },
    gray: { primary: "#475569", secondary: "#334155", text: "#1e293b" }
  };

  const currentColor = colorSchemes[colorScheme as keyof typeof colorSchemes];

  const addExperience = () => {
    setExperiences([...experiences, { company: "", position: "", duration: "", description: "" }]);
  };

  const removeExperience = (index: number) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((_, i) => i !== index));
    }
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const addEducation = () => {
    setEducation([...education, { school: "", degree: "", duration: "", details: "" }]);
  };

  const removeEducation = (index: number) => {
    if (education.length > 1) {
      setEducation(education.filter((_, i) => i !== index));
    }
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const addSkill = () => {
    setSkills([...skills, { name: "" }]);
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      setSkills(skills.filter((_, i) => i !== index));
    }
  };

  const updateSkill = (index: number, value: string) => {
    const updated = [...skills];
    updated[index].name = value;
    setSkills(updated);
  };

  const handleDownload = () => {
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please fill in at least your name and email");
      return;
    }

    if (!canDownload) {
      setShowAdModal(true);
      return;
    }

    generatePDF();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    const leftMargin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - 40;

    // Helper function to add text with word wrap
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return lines.length * (fontSize * 0.5);
    };

    // Header
    doc.setFillColor(currentColor.primary);
    doc.rect(0, 0, pageWidth, 50, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text(fullName || "Your Name", leftMargin, 25);
    doc.setFontSize(10);
    const contactInfo = [email, phone, location].filter(Boolean).join(" | ");
    doc.text(contactInfo, leftMargin, 35);

    yPos = 60;
    doc.setTextColor(0, 0, 0);

    // Summary
    if (summary.trim()) {
      doc.setTextColor(currentColor.primary);
      doc.setFontSize(14);
      doc.text("PROFESSIONAL SUMMARY", leftMargin, yPos);
      yPos += 7;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      yPos += addWrappedText(summary, leftMargin, yPos, contentWidth, 10);
      yPos += 10;
    }

    // Experience
    const hasExperience = experiences.some(exp => exp.company.trim() || exp.position.trim());
    if (hasExperience) {
      doc.setTextColor(currentColor.primary);
      doc.setFontSize(14);
      doc.text("WORK EXPERIENCE", leftMargin, yPos);
      yPos += 7;
      doc.setTextColor(0, 0, 0);

      experiences.forEach((exp) => {
        if (exp.company.trim() || exp.position.trim()) {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(exp.position || "Position", leftMargin, yPos);
          yPos += 5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(exp.company || "Company", leftMargin, yPos);
          if (exp.duration) {
            doc.text(exp.duration, pageWidth - leftMargin - doc.getTextWidth(exp.duration), yPos);
          }
          yPos += 5;

          if (exp.description.trim()) {
            yPos += addWrappedText(exp.description, leftMargin, yPos, contentWidth, 9);
          }
          yPos += 8;
        }
      });
    }

    // Education
    const hasEducation = education.some(edu => edu.school.trim() || edu.degree.trim());
    if (hasEducation) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      doc.setTextColor(currentColor.primary);
      doc.setFontSize(14);
      doc.text("EDUCATION", leftMargin, yPos);
      yPos += 7;
      doc.setTextColor(0, 0, 0);

      education.forEach((edu) => {
        if (edu.school.trim() || edu.degree.trim()) {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(edu.degree || "Degree", leftMargin, yPos);
          yPos += 5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(edu.school || "School", leftMargin, yPos);
          if (edu.duration) {
            doc.text(edu.duration, pageWidth - leftMargin - doc.getTextWidth(edu.duration), yPos);
          }
          yPos += 5;

          if (edu.details.trim()) {
            yPos += addWrappedText(edu.details, leftMargin, yPos, contentWidth, 9);
          }
          yPos += 8;
        }
      });
    }

    // Skills
    const hasSkills = skills.some(skill => skill.name.trim());
    if (hasSkills) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setTextColor(currentColor.primary);
      doc.setFontSize(14);
      doc.text("SKILLS", leftMargin, yPos);
      yPos += 7;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);

      const skillsList = skills.filter(s => s.name.trim()).map(s => s.name).join(" • ");
      yPos += addWrappedText(skillsList, leftMargin, yPos, contentWidth, 10);
    }

    doc.save(`${fullName.replace(/\s+/g, '_') || 'resume'}.pdf`);
    toast.success("Resume downloaded successfully!");
  };

  return (
    <>
      <ToolLayout
        title="Professional Resume Builder"
        description="Create beautiful, professional resumes with live preview. Choose from multiple templates and color schemes."
        category="Document Tools"
        instructions={[
          "Fill in your personal information",
          "Add work experience and education",
          "List your skills",
          "Choose a template and color scheme",
          "Preview your resume in real-time",
          "Download as PDF"
        ]}
        relatedTools={[
          { name: "PDF Editor", path: "/tools/pdf-editor" },
          { name: "Cover Letter Generator", path: "/tools/cover-letter-generator" }
        ]}
      >
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>

                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="New York, NY"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Brief overview of your professional background and career goals..."
                    className="mt-2 h-24"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Work Experience</h3>
                  <Button onClick={addExperience} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {experiences.map((exp, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Experience {index + 1}</Label>
                      {experiences.length > 1 && (
                        <Button
                          onClick={() => removeExperience(index)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    <Input
                      value={exp.position}
                      onChange={(e) => updateExperience(index, "position", e.target.value)}
                      placeholder="Job Title"
                    />
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(index, "company", e.target.value)}
                      placeholder="Company Name"
                    />
                    <Input
                      value={exp.duration}
                      onChange={(e) => updateExperience(index, "duration", e.target.value)}
                      placeholder="Jan 2020 - Present"
                    />
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(index, "description", e.target.value)}
                      placeholder="Describe your responsibilities and achievements..."
                      className="h-20"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Education</h3>
                  <Button onClick={addEducation} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {education.map((edu, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Education {index + 1}</Label>
                      {education.length > 1 && (
                        <Button
                          onClick={() => removeEducation(index)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, "degree", e.target.value)}
                      placeholder="Degree, e.g., Bachelor of Science in Computer Science"
                    />
                    <Input
                      value={edu.school}
                      onChange={(e) => updateEducation(index, "school", e.target.value)}
                      placeholder="University Name"
                    />
                    <Input
                      value={edu.duration}
                      onChange={(e) => updateEducation(index, "duration", e.target.value)}
                      placeholder="2016 - 2020"
                    />
                    <Textarea
                      value={edu.details}
                      onChange={(e) => updateEducation(index, "details", e.target.value)}
                      placeholder="Additional details, honors, relevant coursework..."
                      className="h-16"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Skills</h3>
                  <Button onClick={addSkill} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={skill.name}
                        onChange={(e) => updateSkill(index, e.target.value)}
                        placeholder="Skill name"
                      />
                      {skills.length > 1 && (
                        <Button
                          onClick={() => removeSkill(index)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Customization</h3>

                <div>
                  <Label>Template</Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Color Scheme</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {Object.entries(colorSchemes).map(([key, colors]) => (
                      <button
                        key={key}
                        onClick={() => setColorScheme(key)}
                        className={`h-10 rounded-lg border-2 transition-all ${
                          colorScheme === key ? "border-primary scale-105" : "border-transparent"
                        }`}
                        style={{ backgroundColor: colors.primary }}
                        title={key.charAt(0).toUpperCase() + key.slice(1)}
                      />
                    ))}
                  </div>
                </div>

                <Button onClick={handleDownload} className="w-full" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume PDF
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Live Preview */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Live Preview</h3>
                </div>

                <div className="border rounded-lg p-6 bg-white text-black min-h-[600px] shadow-lg">
                  {/* Header */}
                  <div
                    className="p-4 -mx-6 -mt-6 mb-6"
                    style={{ backgroundColor: currentColor.primary }}
                  >
                    <h1 className="text-2xl font-bold text-white">
                      {fullName || "Your Name"}
                    </h1>
                    <p className="text-sm text-white/90 mt-1">
                      {[email, phone, location].filter(Boolean).join(" | ") || "Contact Information"}
                    </p>
                  </div>

                  {/* Summary */}
                  {summary.trim() && (
                    <div className="mb-6">
                      <h2
                        className="text-sm font-bold uppercase mb-2 pb-1 border-b-2"
                        style={{ color: currentColor.primary, borderColor: currentColor.primary }}
                      >
                        Professional Summary
                      </h2>
                      <p className="text-sm text-gray-700">{summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {experiences.some(exp => exp.company.trim() || exp.position.trim()) && (
                    <div className="mb-6">
                      <h2
                        className="text-sm font-bold uppercase mb-2 pb-1 border-b-2"
                        style={{ color: currentColor.primary, borderColor: currentColor.primary }}
                      >
                        Work Experience
                      </h2>
                      {experiences.map((exp, index) => (
                        (exp.company.trim() || exp.position.trim()) && (
                          <div key={index} className="mb-4">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-bold text-sm">
                                {exp.position || "Position"}
                              </h3>
                              <span className="text-xs text-gray-600">{exp.duration}</span>
                            </div>
                            <p className="text-sm text-gray-700">{exp.company || "Company"}</p>
                            {exp.description.trim() && (
                              <p className="text-xs text-gray-600 mt-1">{exp.description}</p>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {education.some(edu => edu.school.trim() || edu.degree.trim()) && (
                    <div className="mb-6">
                      <h2
                        className="text-sm font-bold uppercase mb-2 pb-1 border-b-2"
                        style={{ color: currentColor.primary, borderColor: currentColor.primary }}
                      >
                        Education
                      </h2>
                      {education.map((edu, index) => (
                        (edu.school.trim() || edu.degree.trim()) && (
                          <div key={index} className="mb-4">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-bold text-sm">
                                {edu.degree || "Degree"}
                              </h3>
                              <span className="text-xs text-gray-600">{edu.duration}</span>
                            </div>
                            <p className="text-sm text-gray-700">{edu.school || "School"}</p>
                            {edu.details.trim() && (
                              <p className="text-xs text-gray-600 mt-1">{edu.details}</p>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  {skills.some(skill => skill.name.trim()) && (
                    <div className="mb-6">
                      <h2
                        className="text-sm font-bold uppercase mb-2 pb-1 border-b-2"
                        style={{ color: currentColor.primary, borderColor: currentColor.primary }}
                      >
                        Skills
                      </h2>
                      <p className="text-sm text-gray-700">
                        {skills.filter(s => s.name.trim()).map(s => s.name).join(" • ")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ToolLayout>

      <AdWatchModal
        open={showAdModal}
        onOpenChange={setShowAdModal}
        onAdWatched={() => {
          setCanDownload(true);
          setShowAdModal(false);
          generatePDF();
        }}
        title="Watch ad to download your resume"
        description="Please watch this short ad to download your professionally formatted resume PDF."
      />
    </>
  );
};

export default ResumeBuilder;
