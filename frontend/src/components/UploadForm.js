import React, { useState, useRef } from 'react'
import API from '../services/api'
import './UploadForm.css'

function UploadForm() {
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('text')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const clearState = () => {
    setResult(null)
    setError('')
    setExtractedText('')
  }

  const detectText = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze.')
      return
    }
    clearState()
    setLoading(true)
    try {
      const response = await API.post('/detect-text', { text })
      // BUG FIX: /detect-text returns the result directly (not nested under "prediction")
      setResult(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const detectFile = async () => {
    if (!file) {
      setError('Please select a file to upload.')
      return
    }
    clearState()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await API.post('/detect-file', formData)
      // BUG FIX: /detect-file returns { extracted_text, prediction }
      setResult(response.data.prediction)
      setExtractedText(response.data.extracted_text || '')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      setFile(dropped)
      clearState()
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#00d68f'
    if (confidence >= 50) return '#ffb347'
    return '#ff6b6b'
  }

  return (
    <div className="app-wrapper">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="logo-badge">AI</div>
          <div>
            <h1 className="title">Form Type Detector</h1>
            <p className="subtitle">Intelligent document classification at your fingertips</p>
          </div>
        </header>

        {/* Tab switcher */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'text' ? 'tab-active' : ''}`}
            onClick={() => { setActiveTab('text'); clearState() }}
          >
            <span className="tab-icon">✏️</span> Paste Text
          </button>
          <button
            className={`tab ${activeTab === 'file' ? 'tab-active' : ''}`}
            onClick={() => { setActiveTab('file'); clearState() }}
          >
            <span className="tab-icon">📄</span> Upload File
          </button>
        </div>

        {/* Card */}
        <div className="card">

          {activeTab === 'text' && (
            <div className="input-section">
              <label className="input-label">Form Text Content</label>
              <textarea
                className="textarea"
                rows="10"
                placeholder="Paste the contents of your form here — tax forms, medical records, insurance claims, contracts..."
                value={text}
                onChange={(e) => { setText(e.target.value); clearState() }}
              />
              <div className="char-count">{text.length} characters</div>
              <button
                className="btn btn-primary"
                onClick={detectText}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : '🔍 Detect Form Type'}
              </button>
            </div>
          )}

          {activeTab === 'file' && (
            <div className="input-section">
              <label className="input-label">Upload Document</label>
              <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => { setFile(e.target.files[0]); clearState() }}
                />
                {file ? (
                  <>
                    <div className="file-icon">📎</div>
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                    <span className="change-file">Click to change</span>
                  </>
                ) : (
                  <>
                    <div className="upload-icon">☁️</div>
                    <p className="drop-text">Drag & drop or <span className="link">browse</span></p>
                    <p className="file-hint">PNG, JPG, JPEG, PDF supported</p>
                  </>
                )}
              </div>
              <button
                className="btn btn-primary"
                onClick={detectFile}
                disabled={loading || !file}
              >
                {loading ? <span className="spinner" /> : '🔍 Analyze Document'}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="error-box">
              <span className="error-icon">⚠️</span> {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="result-section">
              <div className="result-divider">
                <span>Detection Result</span>
              </div>

              <div className="result-main">
                <div className="form-type-badge">
                  <span className="form-type-label">Form Type</span>
                  <span className="form-type-value">{result.form_type}</span>
                </div>

                <div className="confidence-block">
                  <div className="confidence-header">
                    <span>Confidence</span>
                    <span
                      className="confidence-value"
                      style={{ color: getConfidenceColor(result.confidence) }}
                    >
                      {result.confidence}%
                    </span>
                  </div>
                  <div className="confidence-bar-track">
                    <div
                      className="confidence-bar-fill"
                      style={{
                        width: `${result.confidence}%`,
                        background: getConfidenceColor(result.confidence)
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Top predictions */}
              {result.top_predictions && result.top_predictions.length > 1 && (
                <div className="top-predictions">
                  <p className="top-predictions-label">All Predictions</p>
                  {result.top_predictions.map((pred, i) => (
                    <div key={i} className="prediction-row">
                      <span className={`pred-rank rank-${i + 1}`}>#{i + 1}</span>
                      <span className="pred-type">{pred.form_type}</span>
                      <span className="pred-conf">{pred.confidence}%</span>
                      <div className="pred-bar-track">
                        <div
                          className="pred-bar-fill"
                          style={{ width: `${pred.confidence}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Extracted text preview */}
              {extractedText && (
                <details className="extracted-details">
                  <summary>View Extracted Text</summary>
                  <pre className="extracted-text">{extractedText}</pre>
                </details>
              )}
            </div>
          )}
        </div>

        <footer className="footer">
          Powered by TF-IDF + Naive Bayes · FastAPI + React
        </footer>
      </div>
    </div>
  )
}

export default UploadForm
