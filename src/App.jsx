// App.jsx
import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  // State
  const [text, setText] = useState('https://github.com');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#5d4037');
  const [bgColor, setBgColor] = useState('#fff3e0'); 
  const [border, setBorder] = useState(false);
  const [borderColor, setBorderColor] = useState('#ffab91'); 
  const [borderWidth, setBorderWidth] = useState(10);
  const [customText, setCustomText] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('warm');
  
  const qrRef = useRef();


  const colorPresets = [
    {
      id: 'warm',
      name: 'Sunset',
      fgColor: '#5d4037',
      bgColor: '#fff3e0',
      borderColor: '#ffab91'
    },
    {
      id: 'autumn',
      name: 'Autumn',
      fgColor: '#bf360c',
      bgColor: '#fbe9e7',
      borderColor: '#ff8a65'
    },
    {
      id: 'blossom',
      name: 'Blossom',
      fgColor: '#880e4f',
      bgColor: '#fce4ec',
      borderColor: '#f48fb1'
    },
    {
      id: 'honey',
      name: 'Honey',
      fgColor: '#ff6f00',
      bgColor: '#fff8e1',
      borderColor: '#ffd54f'
    },
    {
      id: 'forest',
      name: 'Forest',
      fgColor: '#1b5e20',
      bgColor: '#f1f8e9',
      borderColor: '#aed581'
    },
    {
      id: 'ocean',
      name: 'Ocean',
      fgColor: '#01579b',
      bgColor: '#e1f5fe',
      borderColor: '#4fc3f7'
    },
    {
      id: 'midnight',
      name: 'Midnight',
      fgColor: '#0d47a1',
      bgColor: '#e3f2fd',
      borderColor: '#90caf9'
    },
    {
      id: 'berry',
      name: 'Berry',
      fgColor: '#4a148c',
      bgColor: '#f3e5f5',
      borderColor: '#ce93d8'
    },
  ];

  // Apply preset
  const applyPreset = (preset) => {
    setSelectedPreset(preset.id);
    setFgColor(preset.fgColor);
    setBgColor(preset.bgColor);
    setBorderColor(preset.borderColor);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setText('https://github.com');
    setSize(256);
    setFgColor('#5d4037');
    setBgColor('#fff3e0');
    setBorder(false);
    setBorderColor('#ffab91');
    setBorderWidth(10);
    setCustomText('');
    setSelectedPreset('warm');
  };

  // Download as PNG
  const downloadPNG = async () => {
    if (!qrRef.current) return;
    
    try {
      const canvas = await html2canvas(qrRef.current);
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  // Download as SVG
  const downloadSVG = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.svg`;
    link.href = url;
    link.click();
  };

  // Share QR Code
  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR code I created!',
          url: text
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      alert('Web Share API not supported in your browser');
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1 className="pixel-text">Welcome to QR Code Generator</h1>
        <p className="subtitle">Create beautiful QR codes with warm, soft designs</p>
      </header>

      <main className="main-content">
        {/* Left Panel - Controls */}
        <section className="controls-panel pixel-border">
          <h2 className="panel-title">Customize Your QR Code</h2>
          
          {/* URL Input */}
          <div className="input-group">
            <label className="input-label">Website URL</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com"
              className="text-input pixel-input"
            />

          </div>

          {/* Size Control */}
          <div className="input-group">
            <label className="input-label">
              Size: <span className="size-value">{size}px</span>
            </label>
            <input
              type="range"
              min="100"
              max="500"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="slider pixel-slider"
            />
            <div className="size-hint">
              <small>Preview limited to 410px, download supports up to 500px</small>
            </div>
          </div>

          {/* Color Presets */}
          <div className="input-group">
            <label className="input-label">Preset Styles</label>
            <div className="preset-grid">
              {colorPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`preset-button ${selectedPreset === preset.id ? 'selected' : ''}`}
                  style={{
                    '--fg-color': preset.fgColor,
                    '--bg-color': preset.bgColor
                  }}
                  title={preset.name}
                >
                  <div className="preset-preview">
                    <div className="preset-fg" style={{ backgroundColor: preset.fgColor }}></div>
                    <div className="preset-bg" style={{ backgroundColor: preset.bgColor }}></div>
                  </div>
                  <span className="preset-name">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Color Controls */}
          <div className="color-controls">
            <div className="color-group">
              <label className="input-label">QR Code Color</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="color-input"
                />
                <span className="color-hex">{fgColor}</span>
              </div>
            </div>
            
            <div className="color-group">
              <label className="input-label">Background Color</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="color-input"
                />
                <span className="color-hex">{bgColor}</span>
              </div>
            </div>
          </div>

          {/* Border Options */}
          <div className="input-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={border}
                onChange={(e) => setBorder(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              Add Border
            </label>
            
            {border && (
              <div className="border-controls">
                <div className="color-group">
                  <label className="input-label">Border Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="color-input"
                    />
                    <span className="color-hex">{borderColor}</span>
                  </div>
                </div>
                
                <div className="input-group">
                  <label className="input-label">
                    Border Width: <span className="size-value">{borderWidth}px</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                    className="slider pixel-slider"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Custom Text */}
          <div className="input-group">
            <label className="input-label">Custom Text (appears below QR)</label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Scan to visit our website!"
              className="text-input pixel-input"
            />
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              onClick={resetToDefaults}
              className="pixel-button secondary"
            >
              Reset
            </button>
            <button 
              onClick={() => {}} // Generate is automatic
              className="pixel-button primary"
            >
              Generate QR Code
            </button>
          </div>
        </section>

        {/* Right Panel - Preview */}
        <section className="preview-panel pixel-border">
          <h2 className="panel-title">Preview</h2>
          
          {/* QR Code Display */}
          <div 
            className="qr-display"
            style={{
              maxWidth: '410px',
              maxHeight: '410px',
              backgroundColor: bgColor,
              border: border ? `${borderWidth}px solid ${borderColor}` : 'none',
              padding: border ? '20px' : '0'
            }}
            ref={qrRef}
          >
            <QRCodeSVG
              value={text}
              size={Math.min(size, 410 - (border ? borderWidth * 2 + 40 : 0))}
              fgColor={fgColor}
              bgColor="transparent"
              level="M"
              includeMargin={true}
            />
            
            {/* Custom Text Below QR */}
            {customText && (
              <div className="custom-text">
                {customText}
              </div>
            )}
          </div>

          {/* Download Options */}
          <div className="download-options">
            <h3 className="options-title">Export Options</h3>
            <div className="download-buttons">
              <button 
                onClick={downloadPNG}
                className="pixel-button download-btn png"
              >
                <span className="btn-icon">🖼️</span>
                Download PNG
              </button>
              
              <button 
                onClick={downloadSVG}
                className="pixel-button download-btn svg"
              >
                <span className="btn-icon">📐</span>
                Download SVG
              </button>
              
              <button 
                onClick={shareQR}
                className="pixel-button download-btn share"
              >
                <span className="btn-icon">📤</span>
                Share
              </button>
            </div>
            
            <div className="download-info">
              <small>
                • PNG: High-quality image with background<br/>
                • SVG: Vector format for unlimited scaling<br/>
                • Share: Direct link to generated QR
              </small>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Made with ❤️ • All processing happens in your browser</p>
        <p className="footer-note">Scan with any QR scanner app</p>
      </footer>
    </div>
  );
}

export default App;