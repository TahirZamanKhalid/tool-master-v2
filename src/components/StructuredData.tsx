import { useEffect } from "react";

interface StructuredDataProps {
  type: "WebPage" | "FAQPage" | "HowTo" | "SoftwareApplication";
  data: any;
}

export const StructuredData = ({ type, data }: StructuredDataProps) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    script.id = `structured-data-${type}`;
    
    // Remove existing script with same ID if exists
    const existingScript = document.getElementById(`structured-data-${type}`);
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);
    
    return () => {
      script.remove();
    };
  }, [type, data]);

  return null;
};
