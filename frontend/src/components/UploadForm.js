import React, { useState } from "react";
import API from "../services/api";

function UploadForm() {

  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const detectText = async () => {

    if (!text.trim()) {
      setError("Please enter form text");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {

      const response = await API.post("/detect-text", {
        text: text
      });

      setResult(response.data);

    } catch (err) {

      console.log(err);

      setError(
        "Failed to connect backend API"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div style={styles.container}>

      <div style={styles.card}>

        <h1 style={styles.title}>
          AI Form Type Detector
        </h1>

        <p style={styles.subtitle}>
          Detect any form type using AI
        </p>

        <textarea
          style={styles.textarea}
          rows="10"
          placeholder="Paste form content here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          style={styles.button}
          onClick={detectText}
        >
          {loading ? "Detecting..." : "Detect Form Type"}
        </button>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {result && (
          <div style={styles.resultBox}>

            <h2>Detection Result</h2>

            <p>
              <strong>Form Type:</strong>
              {" "}
              {result.form_type}
            </p>

            <p>
              <strong>Confidence:</strong>
              {" "}
              {result.confidence}%
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

const styles = {

  container: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
  },

  card: {
    width: "100%",
    maxWidth: "700px",
    background: "#1e293b",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0px 0px 20px rgba(0,0,0,0.3)"
  },

  title: {
    color: "#ffffff",
    textAlign: "center",
    marginBottom: "10px"
  },

  subtitle: {
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: "25px"
  },

  textarea: {
    width: "100%",
    padding: "15px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    fontSize: "16px",
    resize: "none",
    marginBottom: "20px"
  },

  button: {
    width: "100%",
    padding: "15px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer"
  },

  resultBox: {
    marginTop: "25px",
    background: "#334155",
    padding: "20px",
    borderRadius: "10px",
    color: "#fff"
  },

  error: {
    marginTop: "20px",
    background: "#7f1d1d",
    color: "#fff",
    padding: "15px",
    borderRadius: "10px"
  }
};

export default UploadForm;
