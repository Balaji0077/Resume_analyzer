import React, { useState } from 'react';
import './UploadForm.css';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error(error);
      alert('Error analyzing resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2 className="upload-title">Resume Analyzer</h2>

        <form onSubmit={handleSubmit} className="upload-form">
          <label className="file-input-label">
            {file ? file.name : 'Click to upload resume (.pdf/.docx)'}
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleChange} />
          </label>

          <button type="submit" className="analyze-btn" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>

        {result && <div className="result-box">{result}</div>}
      </div>
    </div>
  );
};

export default UploadForm;
