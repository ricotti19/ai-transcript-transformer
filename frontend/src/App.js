import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState('');
  const [corridor, setCorridor] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // New state to manage hover visualization

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Drag and Drop Event Interceptors with Propagation Overrides
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stops the browser from intercepting the asset natively
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Forces the element box to maintain capture authority
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      // FORCE ACCEPT PIPELINE: Bypasses rigid internal browser MIME type string maps
      setFile(droppedFile);
      console.log(`[DRAG & DROP FORCE SUCCESS] Injected asset state container: ${droppedFile.name}`);
    }
  };

  // ISOLATED IN-MEMORY PRINT ENGINE FOR PDF LAYOUTS
  const generatePDF = async (transcriptText, clientName, operationalCorridor) => {
    // 1. Create a decoupled print structural container dynamically inside isolated script memory
    const printContainer = document.createElement('div');
    
    // 2. Map strict layout styles to emulate a proper high-fidelity A4 page frame layout
    printContainer.style.position = 'fixed';
    printContainer.style.top = '-9999px';
    printContainer.style.left = '-9999px';
    printContainer.style.width = '794px'; // Standard pixel width ratio for precise printing layouts
    printContainer.style.padding = '60px';
    printContainer.style.backgroundColor = '#ffffff';
    printContainer.style.color = '#1e293b';
    printContainer.style.fontFamily = "'Manrope', sans-serif";
    printContainer.style.boxSizing = 'border-box';

    // 3. Inject the clean structure markup with customizable inline font sizes
    // Keep the transcript paragraph tag on a single flat line to prevent pre-wrap indentation bugs
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

    // 4. Attach container frame context directly to body layer
    document.body.appendChild(printContainer);

    try {
      const canvas = await html2canvas(printContainer, {
        scale: 2, // High resolution pixel scaling ratio
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // 5. Instantly wipe container completely from the live app DOM tree
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

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('username', username);
    formData.append('corridor', corridor);

    try {
      const response = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        // Strips hidden tabs, non-breaking spaces, and normal spaces from the very start of sentence 1
        const cleanStartText = data.text.replace(/^[\s\u00A0\t]+/, '');
        const formattedText = cleanStartText.replace(/\.\s+/g, '.\n\n');
        
        setTranscript(formattedText);
        await generatePDF(formattedText, username, corridor);
      } else {
        setTranscript(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("API Server Connection Lost:", err);
      setTranscript("Error: Could not connect to transcription server.");
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

          {/* DRAG AND DROP CAPABLE UPLOAD FIELD TARGET BOUNDARY */}
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

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Transcribing...' : 'Transform Audio & Export'}
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