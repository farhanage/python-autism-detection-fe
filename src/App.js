import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setResult(null);
    setError(null);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // FastAPI backend endpoint - using the correct endpoint path
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    document.getElementById('fileInput').value = '';
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Autism Detection System</h1>
        <p>Upload an image for autism detection analysis</p>
      </header>
      
      <main className="App-main">
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-input-container">
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
            />
            <label htmlFor="fileInput" className="file-input-label">
              Choose Image File
            </label>
          </div>

          {preview && (
            <div className="preview-container">
              <h3>Preview:</h3>
              <img src={preview} alt="Preview" className="image-preview" />
            </div>
          )}

          <div className="button-container">
            <button 
              type="submit" 
              disabled={!selectedFile || loading}
              className="submit-button"
            >
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
            
            <button 
              type="button" 
              onClick={resetForm}
              className="reset-button"
            >
              Reset
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {result && (
          <div className="result-container">
            <h3>Analysis Result:</h3>
            <div className="result-content">
              {typeof result === 'object' ? (
                <pre>{JSON.stringify(result, null, 2)}</pre>
              ) : (
                <p>{result}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
