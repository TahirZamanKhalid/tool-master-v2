import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MemeGenerator = () => {
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateMeme = () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
      return;
    }
    toast.success("Meme created!");
  };

  return (
    <ToolLayout
      title="Meme Generator"
      description="Create funny memes with custom text"
      category="Image Tools"
    >
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Upload Image</Label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div>
            <Label>Top Text</Label>
            <Input
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              placeholder="Enter top text"
            />
          </div>
          <div>
            <Label>Bottom Text</Label>
            <Input
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder="Enter bottom text"
            />
          </div>
          <Button onClick={generateMeme} className="w-full">
            Generate Meme
          </Button>
          {selectedImage && (
            <div className="relative">
              <img src={selectedImage} alt="Meme" className="w-full" />
              {topText && (
                <div className="absolute top-4 left-0 right-0 text-center text-white text-3xl font-bold uppercase" style={{ textShadow: "2px 2px 4px black" }}>
                  {topText}
                </div>
              )}
              {bottomText && (
                <div className="absolute bottom-4 left-0 right-0 text-center text-white text-3xl font-bold uppercase" style={{ textShadow: "2px 2px 4px black" }}>
                  {bottomText}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default MemeGenerator;
