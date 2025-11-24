import { useState } from "react";
import "./WhitespaceRemover.css";

const WhitespaceRemover = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const removeWhitespace = () => {
    setOutput(input.replace(/\s+/g, " ").trim());
  };

  return (
    <div className="whitespace-remover-container">
      <div className="whitespace-remover-content">
        <div className="whitespace-remover-header">
          <span className="whitespace-remover-badge">Text Tools</span>
          <h1 className="whitespace-remover-title">Whitespace Remover</h1>
          <p className="whitespace-remover-description">
            Remove extra whitespace from text
          </p>
        </div>
        
        <div className="whitespace-remover-card">
          <div className="whitespace-remover-form">
            <textarea
              className="whitespace-remover-textarea"
              placeholder="Enter text with extra spaces..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
            />
            <button
              onClick={removeWhitespace}
              className="whitespace-remover-button"
            >
              Remove Extra Whitespace
            </button>
            {output && (
              <textarea
                className="whitespace-remover-textarea"
                value={output}
                readOnly
                rows={8}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhitespaceRemover;
