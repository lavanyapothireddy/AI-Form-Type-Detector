import React, { useState } from 'react'
import API from '../services/api'

function UploadForm() {

  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)

  const detectText = async () => {
    const response = await API.post('/detect-text', {
      text
    })

    setResult(response.data)
  }

  const detectFile = async () => {

    const formData = new FormData()
    formData.append('file', file)

    const response = await API.post('/detect-file', formData)

    setResult(response.data.prediction)
  }

  return (
    <div style={{ padding: '40px' }}>

      <h1>AI Form Type Detector</h1>

      <textarea
        rows="10"
        cols="60"
        placeholder="Paste form text here"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br /><br />

      <button onClick={detectText}>
        Detect From Text
      </button>

      <br /><br />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={detectFile}>
        Detect From File
      </button>

      {
        result && (
          <div>
            <h2>Result</h2>
            <p>Form Type: {result.form_type}</p>
            <p>Confidence: {result.confidence}%</p>
          </div>
        )
      }

    </div>
  )
}

export default UploadForm
