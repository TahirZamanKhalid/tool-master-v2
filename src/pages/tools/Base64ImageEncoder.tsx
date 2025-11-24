import { useState } from "react";
import { toast } from "sonner";
import "./Base64ImageEncoder.css";

const Base64ImageEncoder = () => {
  const [base64Output, setBase64Output] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBase64Output(reader.result as string);
        toast.success("Image encoded to Base64!");
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(base64Output);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="base64-encoder-container">
      <div className="base64-encoder-content">
        <div className="base64-encoder-header">
          <span className="base64-encoder-badge">Developer Tools</span>
          <h1 className="base64-encoder-title">Base64 Image Encoder</h1>
          <p className="base64-encoder-description">
            Convert images to Base64 strings
          </p>
        </div>
        
        <div className="base64-encoder-card">
          <div className="base64-encoder-form">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="base64-encoder-input"
            />
            <textarea
              className="base64-encoder-textarea"
              value={base64Output}
              readOnly
              placeholder="Base64 output will appear here..."
            />
            <button
              onClick={copyToClipboard}
              className="base64-encoder-button"
              disabled={!base64Output}
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Base64ImageEncoder;
