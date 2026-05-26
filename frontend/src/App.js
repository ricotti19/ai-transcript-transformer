import React, { useState } from 'react';
import axios from 'axios'; // Integrated for streaming upload metrics
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState('');
  const [corridor, setCorridor] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // New state to manage progress percentage

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      console.log(`[DRAG & DROP FORCE SUCCESS] Injected asset state container: ${droppedFile.name}`);
    }
  };

  // ISOLATED IN-MEMORY PRINT ENGINE FOR PDF LAYOUTS
  const generatePDF = async (transcriptText, clientName, operationalCorridor) => {
    const printContainer = document.createElement('div');
   
    printContainer.style.position = 'fixed';
    printContainer.style.top = '-9999px';
    printContainer.style.left = '-9999px';
    printContainer.style.width = '794px';
    printContainer.style.padding = '60px';
    printContainer.style.backgroundColor = '#ffffff';
    printContainer.style.color = '#1e293b';
    printContainer.style.fontFamily = "'Manrope', sans-serif";
    printContainer.style.boxSizing = 'border-box';

    printContainer.innerHTML = `
      <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 8px 0; color: #0f172a; letter-spacing: -0.02em;">
        AI TRANSCRIPT ARCHIVE REPORT
      </h1>
      <div style="width: 100%; height: 3px; background-color: #10b981; margin-bottom: 24px;"></div>
     
      <div style="font-size: 14px; color: #10b981; line-height: 1.8; margin-bottom: 24px;">
        <div><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</div>
        <div><strong>Assigned Lead:</strong> ${clientName || "Unassigned Inbound"}</div>
        <div><strong>Routing Infrastructure:</strong> ${operationalCorridor || "Standard Route"}</div>
      </div>

      <div style="width: 100%; height: 1px; background-color: #e2e2e2; margin-bottom: 24px;"></div>
     
      <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 12px 0;">
        Voice-to-Text Transcript
      </h2>
      <p style="font-size: 14px; color: #334155; line-height: 1.8; text-align: justify; white-space: pre-wrap; margin: 0;">${transcriptText}</p>
    `;

    document.body.appendChild(printContainer);

    try {
      const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(printContainer);

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const cleanFileName = `Transcript_${(clientName || "Export").replace(/\s+/g, '_')}.pdf`;
      pdf.save(cleanFileName);

    } catch (error) {
      console.error("PDF generation layout runtime crash:", error);
      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
    }
  };


const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !username || !corridor) {
      return alert('Please ensure all required fields are filled out properly!');
    }

    setLoading(true);
    setTranscript('');
    setUploadProgress(0); // Clear track on run

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('username', username);
    formData.append('corridor', corridor);

    // UNIFORM DECAY ENGINE
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 99) {
          clearInterval(progressInterval);
          return 99; // Smooth ceiling until network completely settles
        }
       
        // Uniform dynamic stepping logic
        if (prev < 50) return prev + 2;      // Steady crawl to 50%
        if (prev < 80) return prev + 1;      // Gradual crawl to 80%
        return prev + 0.5;                   // Micro-crawls through heavy AI computation
      });
    }, 150); // Updates every 150ms for uniform frame steps

    try {
      const response = await axios.post('http://localhost:5000/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      // Instantly wipe the loop context 
      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = response.data;
     
      const cleanStartText = data.text.replace(/^[\s\u00A0\t]+/, '');
      const formattedText = cleanStartText.replace(/\.\s+/g, '.\n\n');
     
      setTranscript(formattedText);
      await generatePDF(formattedText, username, corridor);

    } catch (err) {
      clearInterval(progressInterval);
      console.error("API Server Connection Lost:", err);
      setTranscript("Error: Could not process network request or complete AI transcription loop.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Transcript Transformer</h1>
        <p>Convert your audio files into clean documents</p>
        <h2 className="app-subheader">Automatic PDF Export</h2>
      </header>

      <main className="main-content">
        <form onSubmit={handleSubmit} className="upload-form">
         
          <div className="input-group">
            <label>Lead / User Name <span style={{ color: '#dc3545' }}>*</span></label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter client username"
              className="text-field"
              required
            />
          </div>

          <div className="input-group">
            <label>Regional Corridor Origin <span style={{ color: '#dc3545' }}>*</span></label>
            <select
              value={corridor}
              onChange={(e) => setCorridor(e.target.value)}
              className="select-field"
              required
            >
              <option value="" disabled hidden>-- Select a Corridor --</option>
              <option value="US-India Regional Trunk">US-India Regional Trunk</option>
              <option value="US-UAE Regional Trunk">US-UAE Regional Trunk</option>
              <option value="US-Singapore Regional Trunk">US-Singapore Regional Trunk</option>
            </select>
          </div>

          <div className="input-group file-group">
            <label>Audio File Recording <span style={{ color: '#dc3545' }}>*</span></label>
            <label
              className={`custom-file-upload ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden-file-input"
                required={!file}
              />
              <div className="upload-dropzone-content">
                <span className="upload-icon"></span>
                <p className="upload-text">
                  {file ? `Selected: ${file.name}` : "Click to Upload or Drag & Drop Audio File"}
                </p>
              </div>
            </label>
          </div>

          {/* DYNAMIC PROGRESS BAR TRACKING ENGINE */}
          {loading && (
            <div style={{ width: '100%', marginBottom: '25px', marginTop: '5px' }}>
              <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', height: '8px' }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  backgroundColor: '#10b981',
                  height: '100%',
                  transition: 'width 0.1s ease-out'
                }} />
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', textAlign: 'center', fontWeight: '500' }}>
                {uploadProgress < 100
                  ? `Streaming Network Payload: ${uploadProgress}%`
                  : 'Payload Received. Waiting for Core AI Pipeline Execution...'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Processing Pipeline...' : 'Transform Audio & Export'}
          </button>
        </form>

        {transcript && (
          <div className="transcript-box">
            <h3>Output Transcript:</h3>
            <p>{transcript}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
