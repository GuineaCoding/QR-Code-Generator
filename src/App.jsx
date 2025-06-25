import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  const [text, setText] = useState('https://github.com');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#5d4037');
  const [bgColor, setBgColor] = useState('#fff3e0');
  const [border, setBorder] = useState(false);
  const [borderColor, setBorderColor] = useState('#ffab91');
  const [borderWidth, setBorderWidth] = useState(10);
  
  // Custom Text State
  const [customText, setCustomText] = useState('');
  const [customTextColor, setCustomTextColor] = useState('#5d4037');
  const [customTextBgColor, setCustomTextBgColor] = useState('#fff3e0');
  const [customTextBorder, setCustomTextBorder] = useState(false);
  const [customTextBorderColor, setCustomTextBorderColor] = useState('#ffab91');
  const [customTextBorderWidth, setCustomTextBorderWidth] = useState(2);
  const [customTextFontSize, setCustomTextFontSize] = useState(14);
  
  const [selectedPreset, setSelectedPreset] = useState('warm');
  
  // PNG image state
  const [pngImage, setPngImage] = useState(null);
  const [isGeneratingPNG, setIsGeneratingPNG] = useState(false);
  
  const qrRef = useRef();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  
  // View mode: 'svg' or 'png'
  const [viewMode, setViewMode] = useState('svg');
  
  // Track previous text to detect changes
  const [prevText, setPrevText] = useState(text);

  const sampleLinks = [
    { label: 'GitHub', url: 'https://github.com' },
    { label: 'YouTube', url: 'https://youtube.com' },
    { label: 'Twitter', url: 'https://twitter.com' },
    { label: 'Portfolio', url: 'https://yourportfolio.com' },
    { label: 'LinkedIn', url: 'https://linkedin.com' },
  ];

  const colorPresets = [
    { id: 'warm', name: 'Sunset', fgColor: '#5d4037', bgColor: '#fff3e0', borderColor: '#ffab91' },
    { id: 'autumn', name: 'Autumn', fgColor: '#bf360c', bgColor: '#fbe9e7', borderColor: '#ff8a65' },
    { id: 'blossom', name: 'Blossom', fgColor: '#880e4f', bgColor: '#fce4ec', borderColor: '#f48fb1' },
    { id: 'honey', name: 'Honey', fgColor: '#ff6f00', bgColor: '#fff8e1', borderColor: '#ffd54f' },
    { id: 'forest', name: 'Forest', fgColor: '#1b5e20', bgColor: '#f1f8e9', borderColor: '#aed581' },
    { id: 'ocean', name: 'Ocean', fgColor: '#01579b', bgColor: '#e1f5fe', borderColor: '#4fc3f7' },
    { id: 'midnight', name: 'Midnight', fgColor: '#0d47a1', bgColor: '#e3f2fd', borderColor: '#90caf9' },
    { id: 'berry', name: 'Berry', fgColor: '#4a148c', bgColor: '#f3e5f5', borderColor: '#ce93d8' },
  ];

  // Switch to SVG view when QR properties change
  useEffect(() => {
    if (prevText !== text && viewMode === 'png') {
      setViewMode('svg');
      showMessage('Switched to SVG view - Generate PNG to see updated image');
    }
    setPrevText(text);
  }, [text, viewMode]);

  // Also switch to SVG when other QR properties change
  useEffect(() => {
    if (viewMode === 'png') {
      setViewMode('svg');
      showMessage('Switched to SVG view - Generate PNG to see updated image');
    }
  }, [size, fgColor, bgColor, border, borderColor, borderWidth, customText]);

  const applyPreset = (preset) => {
    setSelectedPreset(preset.id);
    setFgColor(preset.fgColor);
    setBgColor(preset.bgColor);
    setBorderColor(preset.borderColor);
  };

  const resetToDefaults = () => {
    setText('https://github.com');
    setSize(256);
    setFgColor('#5d4037');
    setBgColor('#fff3e0');
    setBorder(false);
    setBorderColor('#ffab91');
    setBorderWidth(10);
    
    setCustomText('');
    setCustomTextColor('#5d4037');
    setCustomTextBgColor('#fff3e0');
    setCustomTextBorder(false);
    setCustomTextBorderColor('#ffab91');
    setCustomTextBorderWidth(2);
    setCustomTextFontSize(14);
    
    setSelectedPreset('warm');
    setPngImage(null);
    setViewMode('svg');
  };

  const generatePNGPreview = async () => {
    if (!qrRef.current) {
      showMessage('Please generate a QR code first');
      return;
    }
    
    setIsGeneratingPNG(true);
    
    try {
      const canvas = await html2canvas(qrRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });
      
      const pngDataUrl = canvas.toDataURL('image/png');
      setPngImage(pngDataUrl);
      setViewMode('png');
      showMessage('PNG preview generated!');
    } catch (error) {
      console.error('Error generating PNG:', error);
      showMessage('Failed to generate PNG preview');
    } finally {
      setIsGeneratingPNG(false);
    }
  };

  const downloadPNG = async () => {
    if (!qrRef.current) return;
    
    try {
      const canvas = await html2canvas(qrRef.current, {
        scale: 2,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showMessage('QR Code downloaded as PNG!');
    } catch (error) {
      console.error('Error downloading:', error);
      showMessage('Failed to download PNG');
    }
  };

  const downloadSVG = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    
    try {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const blob = new Blob([source], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.svg`;
      link.href = url;
      link.click();
      showMessage('QR Code downloaded as SVG!');
    } catch (error) {
      console.error('Error downloading SVG:', error);
      showMessage('Failed to download SVG');
    }
  };

  const copyQRToClipboard = async () => {
    if (!qrRef.current) {
      showMessage('Please generate a QR code first');
      return;
    }
    
    try {
      const canvas = await html2canvas(qrRef.current);
      
      canvas.toBlob(async (blob) => {
        try {
          const item = new ClipboardItem({
            'image/png': blob
          });
          
          await navigator.clipboard.write([item]);
          showMessage('✅ QR Code copied to clipboard!');
        } catch (err) {
          console.error('Clipboard write failed:', err);
          fallbackCopy(canvas);
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Canvas conversion failed:', error);
      showMessage('Failed to copy QR code');
    }
  };

  const fallbackCopy = (canvas) => {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'qr-code-copy.png';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('📋 QR downloaded! You can now paste it from your downloads folder');
  };

  const shareQR = async () => {
    if (!qrRef.current) {
      showMessage('Please generate a QR code first');
      return;
    }
    
    setIsSharing(true);
    
    const canvas = await html2canvas(qrRef.current);
    const imgUrl = canvas.toDataURL('image/png');
    
    const img = document.createElement('img');
    img.src = imgUrl;
    img.style.maxWidth = '100%';
    img.style.borderRadius = '8px';
    img.style.margin = '10px 0';
    
    const preview = document.createElement('div');
    preview.style.textAlign = 'center';
    preview.style.padding = '20px';
    preview.appendChild(img);
    
    if (navigator.share) {
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'qr-code.png', { type: 'image/png' });
        
        try {
          await navigator.share({
            files: [file],
            title: 'QR Code',
            text: `QR Code: ${text}`
          });
          showMessage('✅ QR Code shared!');
        } catch (error) {
          const link = document.createElement('a');
          link.href = imgUrl;
          link.download = 'qr-code.png';
          link.click();
          showMessage('📱 Image saved to downloads!');
        }
      });
    } else {
      copyQRToClipboard();
    }
    
    setIsSharing(false);
  };

  const showMessage = (message) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
    setTimeout(() => {
      setShowSnackbar(false);
    }, 3000);
  };

  const handleTextChange = (newText) => {
    setText(newText);
  };

  const handlePresetClick = (preset) => {
    applyPreset(preset);
  };

  const handleColorChange = (setter, value) => {
    setter(value);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="pixel-text">Welcome to QR Code Generator</h1>
        <p className="subtitle">Create beautiful QR codes with warm, soft designs</p>
      </header>

      <main className="main-content">
        <div className="panels-container">
          <section className="controls-panel pixel-border">
            <div className="panel-header">
              <h2 className="panel-title">🎨 Customize Your QR Code</h2>
              <p className="panel-subtitle">Adjust colors, size, and style</p>
            </div>
            
            <div className="input-group">
              <label className="input-label">Website URL</label>
              <input
                type="text"
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="https://example.com"
                className="text-input pixel-input"
              />
              
              <div className="sample-links">
                <span className="sample-label">Quick Links:</span>
                <div className="link-chips">
                  {sampleLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => handleTextChange(link.url)}
                      className="link-chip pixel-button"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

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

            <div className="input-group">
              <label className="input-label">Preset Styles</label>
              <div className="preset-grid">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    className={`preset-button ${selectedPreset === preset.id ? 'selected' : ''}`}
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

            <div className="color-controls">
              <div className="color-group">
                <label className="input-label">QR Code Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => handleColorChange(setFgColor, e.target.value)}
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
                    onChange={(e) => handleColorChange(setBgColor, e.target.value)}
                    className="color-input"
                  />
                  <span className="color-hex">{bgColor}</span>
                </div>
              </div>
            </div>

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

            <div className="input-group">
              <label className="input-label">Custom Text (appears below QR)</label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Scan to visit our website!"
                className="text-input pixel-input"
              />
              
              {customText && (
                <div className="custom-text-controls">
                  <div className="color-controls">
                    <div className="color-group">
                      <label className="input-label">Text Color</label>
                      <div className="color-input-wrapper">
                        <input
                          type="color"
                          value={customTextColor}
                          onChange={(e) => setCustomTextColor(e.target.value)}
                          className="color-input"
                        />
                        <span className="color-hex">{customTextColor}</span>
                      </div>
                    </div>
                    
                    <div className="color-group">
                      <label className="input-label">Background Color</label>
                      <div className="color-input-wrapper">
                        <input
                          type="color"
                          value={customTextBgColor}
                          onChange={(e) => setCustomTextBgColor(e.target.value)}
                          className="color-input"
                        />
                        <span className="color-hex">{customTextBgColor}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={customTextBorder}
                        onChange={(e) => setCustomTextBorder(e.target.checked)}
                        className="checkbox-input"
                      />
                      <span className="checkbox-custom"></span>
                      Add Border to Text
                    </label>
                    
                    {customTextBorder && (
                      <div className="border-controls">
                        <div className="color-group">
                          <label className="input-label">Border Color</label>
                          <div className="color-input-wrapper">
                            <input
                              type="color"
                              value={customTextBorderColor}
                              onChange={(e) => setCustomTextBorderColor(e.target.value)}
                              className="color-input"
                            />
                            <span className="color-hex">{customTextBorderColor}</span>
                          </div>
                        </div>
                        
                        <div className="input-group">
                          <label className="input-label">
                            Border Width: <span className="size-value">{customTextBorderWidth}px</span>
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={customTextBorderWidth}
                            onChange={(e) => setCustomTextBorderWidth(parseInt(e.target.value))}
                            className="slider pixel-slider"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">
                      Font Size: <span className="size-value">{customTextFontSize}px</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={customTextFontSize}
                      onChange={(e) => setCustomTextFontSize(parseInt(e.target.value))}
                      className="slider pixel-slider"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button onClick={resetToDefaults} className="pixel-button secondary">
                Reset
              </button>
              <button 
                onClick={generatePNGPreview}
                className="pixel-button primary"
                disabled={isGeneratingPNG}
              >
                {isGeneratingPNG ? 'Generating...' : 'Generate PNG'}
              </button>
            </div>
          </section>

          <section className="preview-panel pixel-border">
            <div className="panel-header">
              <h2 className="panel-title">📱 Live Preview</h2>
              <p className="panel-subtitle">Scan with any QR app</p>
              
              <div className="view-toggle">
                <button 
                  onClick={() => setViewMode('svg')} 
                  className={`view-toggle-btn ${viewMode === 'svg' ? 'active' : ''}`}
                >
                  SVG
                </button>
                <button 
                  onClick={() => setViewMode('png')} 
                  className={`view-toggle-btn ${viewMode === 'png' ? 'active' : ''}`}
                  disabled={isGeneratingPNG && !pngImage}
                >
                  {isGeneratingPNG ? 'Generating...' : 'PNG'}
                </button>
              </div>
              
              <div className="view-mode-hint">
                {viewMode === 'png' && (
                  <small>PNG view: Changes will switch back to SVG</small>
                )}
              </div>
            </div>
            
            <div 
              className="qr-display"
              style={{
                backgroundColor: bgColor,
                border: border ? `${borderWidth}px solid ${borderColor}` : 'none',
                padding: border ? '20px' : '0',
                minHeight: '300px'
              }}
              ref={qrRef}
            >
              {viewMode === 'svg' ? (
                <>
                  <QRCodeSVG
                    value={text}
                    size={Math.min(size, 410 - (border ? borderWidth * 2 + 40 : 0))}
                    fgColor={fgColor}
                    bgColor="transparent"
                    level="M"
                    includeMargin={true}
                  />
                  
                  {customText && (
                    <div 
                      className="custom-text"
                      style={{
                        color: customTextColor,
                        backgroundColor: customTextBgColor,
                        border: customTextBorder ? `${customTextBorderWidth}px solid ${customTextBorderColor}` : 'none',
                        fontSize: `${customTextFontSize}px`
                      }}
                    >
                      {customText}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {pngImage ? (
                    <img 
                      src={pngImage} 
                      alt="QR Code PNG Preview" 
                      className="qr-png-preview"
                    />
                  ) : (
                    <div className="png-placeholder">
                      <p>Click "Generate PNG" to create preview</p>
                    </div>
                  )}
                  
                  {isGeneratingPNG && (
                    <div className="generating-overlay">
                      <div className="spinner"></div>
                      <p>Generating PNG...</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="download-options">
              <h3 className="options-title">Export Options</h3>
              <div className="download-buttons">
                <button onClick={downloadPNG} className="pixel-button download-btn png">
                  <span className="btn-icon">🖼️</span>
                  Download PNG
                </button>
                
                <button onClick={downloadSVG} className="pixel-button download-btn svg">
                  <span className="btn-icon">📐</span>
                  Download SVG
                </button>
                
                <button 
                  onClick={shareQR} 
                  className={`pixel-button download-btn share ${isSharing ? 'sharing' : ''}`}
                  disabled={isSharing}
                >
                  <span className="btn-icon">📤</span>
                  <span>{isSharing ? 'Processing...' : 'Share/Copy'}</span>
                </button>
              </div>
              
              <div className="download-info">
                <small>
                  • PNG: High-quality image with background<br/>
                  • SVG: Vector format for unlimited scaling<br/>
                  • {navigator.share 
                      ? 'Share: Mobile native image sharing' 
                      : 'Copy: Desktop clipboard image'
                    }
                </small>
              </div>
            </div>
          </section>
        </div>
      </main>

      {showSnackbar && (
        <div className="snackbar">
          {snackbarMessage}
        </div>
      )}

      <footer className="app-footer">
        <p>Made with ❤️ by Andrian • All processing happens in your browser</p>
        <p className="footer-note">Scan with any QR scanner app</p>
      </footer>
    </div>
  );
}

export default App;