import { useState } from "react";
import "./LineNumberAdder.css";

const LineNumberAdder = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const addLineNumbers = () => {
    const lines = input.split("\n");
    const numbered = lines.map((line, i) => `${i + 1}. ${line}`);
    setOutput(numbered.join("\n"));
  };

  return (
    <div className="line-number-adder-container">
      <div className="line-number-adder-content">
        <div className="line-number-adder-header">
          <span className="line-number-adder-badge">Text Tools</span>
          <h1 className="line-number-adder-title">Line Number Adder</h1>
          <p className="line-number-adder-description">
            Add line numbers to text
          </p>
        </div>
        
        <div className="line-number-adder-card">
          <div className="line-number-adder-form">
            <textarea
              className="line-number-adder-textarea"
              placeholder="Enter text..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={10}
            />
            <button
              onClick={addLineNumbers}
              className="line-number-adder-button"
            >
              Add Line Numbers
            </button>
            {output && (
              <textarea
                className="line-number-adder-textarea"
                value={output}
                readOnly
                rows={10}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineNumberAdder;
