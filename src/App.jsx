// App.jsx - UPDATED SHARE FUNCTION
import React, { useState, useRef } from 'react';
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
  
  const qrRef = useRef();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);

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
  };

  const downloadPNG = async () => {
    if (!qrRef.current) return;
    
    try {
      const canvas = await html2canvas(qrRef.current);
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

  // FIXED: Copy QR Code IMAGE to clipboard on desktop
  const copyQRToClipboard = async () => {
    if (!qrRef.current) {
      showMessage('Please generate a QR code first');
      return;
    }
    
    try {
      // Convert QR element to canvas
      const canvas = await html2canvas(qrRef.current);
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        try {
          // Create ClipboardItem with the image
          const item = new ClipboardItem({
            'image/png': blob
          });
          
          // Write to clipboard
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

  // Fallback copy method for browsers that don't support ClipboardItem
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

  // ========== FIXED: Share QR as IMAGE on Mobile ==========
  const shareQR = async () => {
    if (!qrRef.current) {
      showMessage('Please generate a QR code first');
      return;
    }
    
    setIsSharing(true);
    
    try {
      // Create canvas from QR element
      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: null, // Transparent background
        scale: 2, // High resolution for sharing
        useCORS: true,
        logging: false
      });
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showMessage('Failed to create image');
          setIsSharing(false);
          return;
        }
        
        // Create file from blob
        const file = new File([blob], 'qr-code.png', {
          type: 'image/png',
          lastModified: Date.now()
        });
        
        // Check if Web Share API is available (mobile)
        if (navigator.share) {
          try {
            // Check if browser can share files
            const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] });
            
            if (canShareFiles) {
              // Share with image file
              await navigator.share({
                title: 'QR Code',
                text: `Check out this QR code!\nLink: ${text}`,
                files: [file]
              });
              showMessage('✅ QR Code image shared!');
            } else {
              // If file sharing not supported, share data URL
              const dataUrl = canvas.toDataURL('image/png');
              
              // Create a temporary link for download
              const link = document.createElement('a');
              link.href = dataUrl;
              link.download = 'qr-code.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              // Then share text with instructions
              await navigator.share({
                title: 'QR Code',
                text: `Check out this QR code!\nLink: ${text}\n\nImage has been downloaded to your device.`
              });
              showMessage('✅ QR Code saved to downloads!');
            }
          } catch (shareError) {
            console.log('Share error:', shareError);
            
            // Fallback: Create download link
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'qr-code.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showMessage('📱 QR Code saved to downloads!');
          }
        } else {
          // Desktop: Copy to clipboard
          copyQRToClipboard();
        }
        
        setIsSharing(false);
        
      }, 'image/png', 0.95); // 95% quality
      
    } catch (error) {
      console.error('Share failed:', error);
      setIsSharing(false);
      showMessage('❌ Failed to share QR code');
    }
  };

  // Alternative: Simple mobile image share (works on most devices)
  const shareQRAsImage = async () => {
    if (!qrRef.current) {
      showMessage('Please generate a QR code first');
      return;
    }
    
    setIsSharing(true);
    
    try {
      // Create high-quality canvas
      const canvas = await html2canvas(qrRef.current, {
        scale: 3, // Very high resolution for mobile
        backgroundColor: null,
        useCORS: true
      });
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Create temporary link for download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'qr-code-share.png';
      
      // For mobile browsers that support share API
      if (navigator.share) {
        try {
          // Convert data URL to blob
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], 'qr-code.png', { type: 'image/png' });
          
          // Try to share as file
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'QR Code',
              text: `Check out this QR code!\nLink: ${text}`
            });
            showMessage('✅ QR Code image shared!');
          } else {
            // Fallback: Save image first
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Wait a moment then share text
            setTimeout(async () => {
              await navigator.share({
                title: 'QR Code',
                text: `Check out this QR code!\nLink: ${text}\n\nImage saved to your photos.`
              });
            }, 500);
            
            showMessage('✅ QR Code saved! Now sharing...');
          }
        } catch (shareError) {
          console.log('Direct share failed:', shareError);
          
          // Fallback: Just download the image
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          showMessage('📱 QR Code saved to your photos!');
        }
      } else {
        // Desktop: Copy to clipboard
        copyQRToClipboard();
      }
      
    } catch (error) {
      console.error('Image share failed:', error);
      showMessage('❌ Failed to share image');
    } finally {
      setIsSharing(false);
    }
  };

  // Show snackbar message
  const showMessage = (message) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
    setTimeout(() => {
      setShowSnackbar(false);
    }, 3000);
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
                onChange={(e) => setText(e.target.value)}
                placeholder="https://example.com"
                className="text-input pixel-input"
              />
              
              <div className="sample-links">
                <span className="sample-label">Quick Links:</span>
                <div className="link-chips">
                  {sampleLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => setText(link.url)}
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
                    onClick={() => applyPreset(preset)}
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

            {/* Custom Text Controls */}
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
                onClick={() => showMessage('QR Code generated! Changes update in real-time.')}
                className="pixel-button primary"
              >
                Generate QR Code
              </button>
            </div>
          </section>

          <section className="preview-panel pixel-border">
            <div className="panel-header">
              <h2 className="panel-title">📱 Live Preview</h2>
              <p className="panel-subtitle">Scan with any QR app</p>
            </div>
            
            <div 
              className="qr-display"
              style={{
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
                  {isSharing ? 'Sharing...' : (navigator.share ? 'Share Image' : 'Copy Image')}
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

      {/* Snackbar Notification */}
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