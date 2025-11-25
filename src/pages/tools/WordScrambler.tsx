import { useState } from "react";
import "./WordScrambler.css";

const WordScrambler = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const scrambleWords = () => {
    const words = input.split(" ");
    const scrambled = words.map(word => {
      const chars = word.split("");
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      return chars.join("");
    });
    setOutput(scrambled.join(" "));
  };

  return (
    <div className="word-scrambler-container">
      <div className="word-scrambler-content">
        <div className="word-scrambler-header">
          <span className="word-scrambler-badge">Text Tools</span>
          <h1 className="word-scrambler-title">Word Scrambler</h1>
          <p className="word-scrambler-description">
            Scramble words randomly
          </p>
        </div>
        
        <div className="word-scrambler-card">
          <div className="word-scrambler-form">
            <textarea
              className="word-scrambler-textarea"
              placeholder="Enter text to scramble..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
            />
            <button
              onClick={scrambleWords}
              className="word-scrambler-button"
            >
              Scramble Words
            </button>
            {output && (
              <textarea
                className="word-scrambler-textarea"
                value={output}
                readOnly
                rows={6}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordScrambler;
