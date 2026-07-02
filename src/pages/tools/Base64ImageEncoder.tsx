import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Copy, Image as ImageIcon } from "lucide-react";
import { isRasterImageFile } from "@/utils/imageFiles";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp"];

const Base64ImageEncoder = () => {
  const [base64Output, setBase64Output] = useState("");
  const [preview, setPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;

    if (!isRasterImageFile(file, SUPPORTED_TYPES)) {
      toast({
        title: "Unsupported file",
        description: "Please upload a JPG, PNG, WebP, GIF, or BMP image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10 MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBase64Output(result);
      setPreview(result);
      toast({ description: "Image encoded to Base64!" });
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(base64Output);
    toast({ description: "Copied to clipboard!" });
  };

  const copyDataUri = () => {
    navigator.clipboard.writeText(`<img src="${base64Output}" />`);
    toast({ description: "HTML img tag copied!" });
  };

  return (
    <ToolLayout
      title="Base64 Image Encoder"
      description="Convert images to Base64 strings for embedding in HTML, CSS, or JavaScript. Free and instant."
      category="Image Tools"
      instructions={[
        "Upload any image (PNG, JPG, WebP, GIF)",
        "The Base64 string is generated instantly",
        "Copy the string or the full HTML img tag",
      ]}
    >
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_TYPES.join(",")}
          onChange={handleImageUpload}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
          ) : (
            <>
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="h-7 w-7 text-primary" />
              </div>
              <p className="font-medium">Click to upload an image</p>
              <p className="text-sm text-muted-foreground mt-1">PNG, JPG, WebP, GIF supported</p>
            </>
          )}
        </div>

        {base64Output && (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Base64 Output</label>
              <Textarea
                value={base64Output}
                readOnly
                className="rounded-xl font-mono text-xs min-h-[120px] bg-muted/30"
              />
              <p className="text-xs text-muted-foreground">Size: {(base64Output.length / 1024).toFixed(1)} KB</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={copyToClipboard} className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
                <Copy className="mr-2 h-4 w-4" /> Copy Base64 String
              </Button>
              <Button variant="outline" onClick={copyDataUri} className="rounded-xl">
                Copy as HTML img tag
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-xl">
                <Upload className="mr-2 h-4 w-4" /> Upload New Image
              </Button>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default Base64ImageEncoder;
