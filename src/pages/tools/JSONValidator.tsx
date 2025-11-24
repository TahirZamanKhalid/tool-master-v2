import { useState } from "react";
import "./JSONValidator.css";

const JSONValidator = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null);

  const validate = () => {
    try {
      JSON.parse(input);
      setResult({ valid: true, message: "Valid JSON!" });
    } catch (error: any) {
      setResult({ valid: false, message: error.message });
    }
  };

  return (
    <div className="json-validator-container">
      <div className="json-validator-content">
        <div className="json-validator-header">
          <span className="json-validator-badge">Developer Tools</span>
          <h1 className="json-validator-title">JSON Validator</h1>
          <p className="json-validator-description">
            Validate JSON syntax
          </p>
        </div>
        
        <div className="json-validator-card">
          <div className="json-validator-form">
            <textarea
              className="json-validator-textarea"
              placeholder="Paste JSON here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={10}
            />
            <button
              onClick={validate}
              className="json-validator-button"
            >
              Validate JSON
            </button>
            {result && (
              <div className={`json-validator-alert ${result.valid ? 'success' : 'error'}`}>
                {result.valid ? "✓ " : "✗ "}
                {result.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONValidator;
