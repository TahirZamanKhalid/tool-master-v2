import { useState, useEffect } from "react";
import "../css/JSONValidator.css";

const JSONValidator = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ valid: boolean; message: string; formatted?: string } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"validate" | "format" | "minify">("validate");
  const [autoCorrect, setAutoCorrect] = useState(false);

  useEffect(() => {
    // Check system theme preference
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(isDark);

    // Listen for theme changes
    const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    themeMediaQuery.addEventListener("change", handleThemeChange);

    return () => themeMediaQuery.removeEventListener("change", handleThemeChange);
  }, []);

  useEffect(() => {
    // Load AdSense script
    const script = document.createElement("script");
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7382531001943020";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const attemptAutoCorrect = (jsonString: string): string => {
    let corrected = jsonString.trim();

    // Fix common issues
    // 1. Replace single quotes with double quotes
    corrected = corrected.replace(/'/g, '"');

    // 2. Add quotes to unquoted keys
    corrected = corrected.replace(/(\{|,)\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');

    // 3. Fix trailing commas
    corrected = corrected.replace(/,\s*([\]}])/g, "$1");

    // 4. Fix missing commas between properties
    corrected = corrected.replace(/("\s*)\s+"/g, '$1,"');
    corrected = corrected.replace(/(\d)\s+"/g, '$1,"');
    corrected = corrected.replace(/(true|false|null)\s+"/g, '$1,"');

    // 5. Fix undefined values
    corrected = corrected.replace(/:\s*undefined/g, ": null");

    // 6. Remove comments (single line and multi-line)
    corrected = corrected.replace(/\/\/.*$/gm, "");
    corrected = corrected.replace(/\/\*[\s\S]*?\*\//g, "");

    // 7. Fix multiple colons
    corrected = corrected.replace(/:+/g, ":");

    // 8. Fix multiple commas
    corrected = corrected.replace(/,+/g, ",");

    return corrected;
  };

  const validate = () => {
    if (!input.trim()) {
      setResult({ valid: false, message: "Please enter JSON to validate" });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setResult({
        valid: true,
        message: "✓ Valid JSON! Your JSON syntax is correct.",
        formatted: JSON.stringify(parsed, null, 2)
      });
    } catch (error: any) {
      if (autoCorrect) {
        try {
          const corrected = attemptAutoCorrect(input);
          const parsed = JSON.parse(corrected);
          setInput(corrected);
          setResult({
            valid: true,
            message: "✓ JSON corrected and validated! Auto-correction applied.",
            formatted: JSON.stringify(parsed, null, 2)
          });
        } catch (correctionError: any) {
          setResult({
            valid: false,
            message: `✗ Invalid JSON: ${error.message}\n\nAuto-correction attempted but failed: ${correctionError.message}`
          });
        }
      } else {
        setResult({
          valid: false,
          message: `✗ Invalid JSON: ${error.message}\n\nTip: Enable auto-correct to fix common issues automatically.`
        });
      }
    }
  };

  const formatJSON = () => {
    if (!input.trim()) {
      setResult({ valid: false, message: "Please enter JSON to format" });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setInput(formatted);
      setResult({
        valid: true,
        message: "✓ JSON formatted successfully!",
        formatted
      });
    } catch (error: any) {
      if (autoCorrect) {
        try {
          const corrected = attemptAutoCorrect(input);
          const parsed = JSON.parse(corrected);
          const formatted = JSON.stringify(parsed, null, 2);
          setInput(formatted);
          setResult({
            valid: true,
            message: "✓ JSON corrected and formatted!",
            formatted
          });
        } catch (correctionError: any) {
          setResult({
            valid: false,
            message: `✗ Cannot format invalid JSON: ${error.message}`
          });
        }
      } else {
        setResult({
          valid: false,
          message: `✗ Cannot format invalid JSON: ${error.message}`
        });
      }
    }
  };

  const minifyJSON = () => {
    if (!input.trim()) {
      setResult({ valid: false, message: "Please enter JSON to minify" });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setInput(minified);
      setResult({
        valid: true,
        message: `✓ JSON minified successfully! Reduced to ${minified.length} characters.`,
        formatted: minified
      });
    } catch (error: any) {
      if (autoCorrect) {
        try {
          const corrected = attemptAutoCorrect(input);
          const parsed = JSON.parse(corrected);
          const minified = JSON.stringify(parsed);
          setInput(minified);
          setResult({
            valid: true,
            message: `✓ JSON corrected and minified! Reduced to ${minified.length} characters.`,
            formatted: minified
          });
        } catch (correctionError: any) {
          setResult({
            valid: false,
            message: `✗ Cannot minify invalid JSON: ${error.message}`
          });
        }
      } else {
        setResult({
          valid: false,
          message: `✗ Cannot minify invalid JSON: ${error.message}`
        });
      }
    }
  };

  const clearAll = () => {
    setInput("");
    setResult(null);
  };

  const copyToClipboard = () => {
    if (result?.formatted) {
      navigator.clipboard.writeText(result.formatted);
      alert("Copied to clipboard!");
    } else if (input) {
      navigator.clipboard.writeText(input);
      alert("Copied to clipboard!");
    }
  };

  const handleAction = () => {
    switch (activeTab) {
      case "validate":
        validate();
        break;
      case "format":
        formatJSON();
        break;
      case "minify":
        minifyJSON();
        break;
    }
  };

  const getCharCount = () => {
    return input.length;
  };

  const getLineCount = () => {
    return input.split('\n').length;
  };

  return (
    <div className={`json-validator-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="json-validator-content">
        {/* Header Section */}
        <div className="json-validator-header">
          <span className="json-validator-badge">Developer Tools</span>
          <h1 className="json-validator-title">
            <svg className="json-validator-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
              <rect x="2" y="3" width="20" height="18" rx="2" />
            </svg>
            Advanced JSON Validator
          </h1>
          <p className="json-validator-description">
            Validate, format, minify, and auto-correct JSON with powerful features
          </p>
        </div>

        {/* Top AdSense Ad */}
        <div className="ad-container">
          <ins
            className="adsbygoogle"
            style={{ display: "block", textAlign: "center" }}
            data-ad-layout="in-article"
            data-ad-format="fluid"
            data-ad-client="ca-pub-7382531001943020"
            data-ad-slot="2931558314"
          ></ins>
        </div>

        {/* Main Tool Card */}
        <div className="json-validator-card">
          {/* Tab Navigation */}
          <div className="json-validator-tabs">
            <button
              className={`tab-button ${activeTab === "validate" ? "active" : ""}`}
              onClick={() => setActiveTab("validate")}
            >
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Validate
            </button>
            <button
              className={`tab-button ${activeTab === "format" ? "active" : ""}`}
              onClick={() => setActiveTab("format")}
            >
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Format
            </button>
            <button
              className={`tab-button ${activeTab === "minify" ? "active" : ""}`}
              onClick={() => setActiveTab("minify")}
            >
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Minify
            </button>
          </div>

          {/* Auto-Correct Toggle */}
          <div className="json-validator-settings">
            <label className="auto-correct-toggle">
              <input
                type="checkbox"
                checked={autoCorrect}
                onChange={(e) => setAutoCorrect(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">
                <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Auto-Correct Enabled
              </span>
            </label>
            <div className="info-tooltip">
              <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span className="tooltip-text">
                Automatically fixes common JSON errors like single quotes, missing quotes on keys, trailing commas, and undefined values
              </span>
            </div>
          </div>

          {/* JSON Input Area */}
          <div className="json-validator-form">
            <div className="textarea-container">
              <textarea
                className="json-validator-textarea"
                placeholder='Enter or paste JSON here... Example: {"name": "John", "age": 30, "city": "New York"}'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={15}
                spellCheck={false}
              />
              <div className="textarea-stats">
                <span className="stat-item">
                  <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7h16M4 12h16M4 17h10" />
                  </svg>
                  {getLineCount()} lines
                </span>
                <span className="stat-item">
                  <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {getCharCount()} characters
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="button-group">
              <button onClick={handleAction} className="json-validator-button primary">
                {activeTab === "validate" && (
                  <>
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Validate JSON
                  </>
                )}
                {activeTab === "format" && (
                  <>
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Format & Beautify
                  </>
                )}
                {activeTab === "minify" && (
                  <>
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Minify JSON
                  </>
                )}
              </button>
              <button onClick={copyToClipboard} className="json-validator-button secondary" disabled={!input}>
                <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy
              </button>
              <button onClick={clearAll} className="json-validator-button secondary" disabled={!input}>
                <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 7l-.867 12.142A2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>

            {/* Result Display */}
            {result && (
              <div className={`json-validator-alert ${result.valid ? "success" : "error"}`}>
                <div className="alert-icon">
                  {result.valid ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                  )}
                </div>
                <div className="alert-content">
                  <div className="alert-message">{result.message}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon validate">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Instant Validation</h3>
            <p>Quickly validate JSON syntax with detailed error messages</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon format">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3>Auto-Correction</h3>
            <p>Automatically fix common JSON errors and formatting issues</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon minify">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <h3>Format & Minify</h3>
            <p>Beautify or compress JSON for readability or optimization</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon stats">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3>Real-time Stats</h3>
            <p>Track character count, line numbers, and JSON structure</p>
          </div>
        </div>

        {/* Bottom AdSense Ad */}
        <div className="ad-container bottom">
          <ins
            className="adsbygoogle"
            style={{ display: "block", textAlign: "center" }}
            data-ad-layout="in-article"
            data-ad-format="fluid"
            data-ad-client="ca-pub-7382531001943020"
            data-ad-slot="2931558314"
          ></ins>
        </div>
      </div>
    </div>
  );
};

export default JSONValidator;