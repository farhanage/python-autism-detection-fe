import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const MAX_FILE_SIZE = 524288000; // 5MB

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setResult(null);
    setError(null);

    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    // File type validation
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setSelectedFile(file);

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
      const apiUrl = `${process.env.REACT_APP_API_URL}/predict`;
      console.log('Calling API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('API Response:', responseText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Unexpected content type:', contentType);
        console.error('Response body:', responseText);
        throw new Error('API returned non-JSON response. Check console for details.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Full error:', err);
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
              {result.success && result.prediction ? (
                <div className="prediction-result">
                  <div className="prediction-header">
                    <h4>Prediction: <span className={`prediction-class ${result.prediction.predicted_class.toLowerCase().replace('-', '')}`}>{result.prediction.predicted_class}</span></h4>
                  </div>
                  
                  <div className="prediction-details">
                    <div className="detail-item">
                      <label>Confidence Level:</label>
                      <div className="confidence-bar-container">
                        <div 
                          className="confidence-bar" 
                          style={{ width: `${(result.prediction.confidence * 100).toFixed(2)}%` }}
                        >
                          <span className="confidence-text">{(result.prediction.confidence * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <label>Class Probabilities:</label>
                      <div className="probabilities">
                        {Object.entries(result.prediction.class_probabilities).map(([className, probability]) => (
                          <div key={className} className="probability-item">
                            <span className="probability-label">{className}:</span>
                            <span className="probability-value">{(probability * 100).toFixed(2)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="detail-item">
                      <label>Filename:</label>
                      <p className="filename">{result.filename}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <pre>{JSON.stringify(result, null, 2)}</pre>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
