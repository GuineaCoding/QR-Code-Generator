import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QRCodeCanvas } from 'qrcode.react';
import * as QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';
import {
  Container,
  TextField,
  Button,
  Slider,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  Download,
  Share,
  ContentCopy,
  Refresh,
  Link,
  Palette,
  ZoomIn,
  ZoomOut,
  History,
  Delete,
  QrCodeScanner,
  ColorLens,
  Image
} from '@mui/icons-material';
import './App.css';

function App() {
  // State management
  const [text, setText] = useState('https://github.com');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [includeMargin, setIncludeMargin] = useState(true);
  const [errorCorrection, setErrorCorrection] = useState('M'); // L, M, Q, H
  const [qrHistory, setQrHistory] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [logo, setLogo] = useState(null);
  
  const qrRef = useRef();
  
  // Error correction levels
  const errorLevels = [
    { value: 'L', label: 'Low (7%)' },
    { value: 'M', label: 'Medium (15%)' },
    { value: 'Q', label: 'Quartile (25%)' },
    { value: 'H', label: 'High (30%)' }
  ];
  
  // Preset colors
  const colorPresets = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FF6B35', '#004E89', '#FFD166', '#06D6A0'
  ];
  
  // Sample URLs for quick generation
  const sampleLinks = [
    { label: 'GitHub', url: 'https://github.com' },
    { label: 'Google', url: 'https://google.com' },
    { label: 'YouTube', url: 'https://youtube.com' },
    { label: 'Twitter', url: 'https://twitter.com' },
  ];

  // Generate QR Code
  const generateQR = () => {
    if (!text.trim()) {
      showSnackbar('Please enter some text or URL');
      return;
    }
    
    // Add to history
    const newQR = {
      id: Date.now(),
      text,
      size,
      fgColor,
      bgColor,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setQrHistory(prev => [newQR, ...prev.slice(0, 9)]); // Keep last 10
    showSnackbar('QR Code Generated!');
  };

  // Download as PNG
  const downloadPNG = async () => {
    if (!qrRef.current) return;
    
    try {
      const canvas = await html2canvas(qrRef.current);
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showSnackbar('QR Code downloaded as PNG!');
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
    link.download = `qrcode-${Date.now()}.svg`;
    link.href = url;
    link.click();
    showSnackbar('QR Code downloaded as SVG!');
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text)
      .then(() => showSnackbar('Text copied to clipboard!'))
      .catch(err => console.error('Copy failed:', err));
  };

  // Share QR Code
  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR Code I generated!',
          url: text
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      showSnackbar('Web Share API not supported in your browser');
    }
  };

  // Load from history
  const loadFromHistory = (item) => {
    setText(item.text);
    setSize(item.size);
    setFgColor(item.fgColor);
    setBgColor(item.bgColor);
    showSnackbar('QR Code loaded from history');
  };

  // Clear history
  const clearHistory = () => {
    setQrHistory([]);
    showSnackbar('History cleared');
  };

  // Snackbar helper
  const showSnackbar = (message) => {
    setSnackbar({ open: true, message });
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setText('https://github.com');
    setSize(256);
    setFgColor('#000000');
    setBgColor('#FFFFFF');
    setErrorCorrection('M');
    showSnackbar('Reset to defaults');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          <QrCodeScanner sx={{ fontSize: 48, verticalAlign: 'middle', mr: 2 }} />
          QR Code Generator
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Convert any URL or text into a QR code instantly
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Panel - Controls */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            {/* Input Section */}
            <Typography variant="h6" gutterBottom>
              <Link sx={{ mr: 1 }} /> Content to Encode
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter URL, text, email, phone number..."
              variant="outlined"
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={copyToClipboard}>
                      <ContentCopy />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Quick Links */}
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Try sample links:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {sampleLinks.map((link) => (
                <Chip
                  key={link.label}
                  label={link.label}
                  onClick={() => setText(link.url)}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>

            {/* Size Control */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              <ZoomIn sx={{ mr: 1 }} /> Size
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Slider
                value={size}
                onChange={(e, value) => setSize(value)}
                min={100}
                max={500}
                step={10}
                sx={{ flex: 1 }}
              />
              <Typography variant="body2" sx={{ minWidth: 60 }}>
                {size}px
              </Typography>
            </Box>

            {/* Colors */}
            <Typography variant="h6" gutterBottom>
              <Palette sx={{ mr: 1 }} /> Colors
            </Typography>
            
            <Grid container spacing={2} mb={3}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2">Foreground:</Typography>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    style={{ width: 40, height: 40, cursor: 'pointer' }}
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2">Background:</Typography>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{ width: 40, height: 40, cursor: 'pointer' }}
                  />
                </Box>
              </Grid>
            </Grid>

            {/* Color Presets */}
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Color presets:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {colorPresets.map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: color,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: fgColor === color ? '3px solid #1976d2' : '1px solid #ccc',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                  onClick={() => setFgColor(color)}
                />
              ))}
            </Box>

            {/* Error Correction */}
            <Typography variant="h6" gutterBottom>
              Error Correction Level
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              {errorLevels.map((level) => (
                <Chip
                  key={level.value}
                  label={level.label}
                  onClick={() => setErrorCorrection(level.value)}
                  color={errorCorrection === level.value ? 'primary' : 'default'}
                  variant={errorCorrection === level.value ? 'filled' : 'outlined'}
                />
              ))}
            </Box>

            {/* Margin Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={includeMargin}
                  onChange={(e) => setIncludeMargin(e.target.value)}
                />
              }
              label="Include Margin"
              sx={{ mb: 3 }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<QrCodeScanner />}
                onClick={generateQR}
                size="large"
              >
                Generate QR Code
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={resetToDefaults}
              >
                Reset
              </Button>

              <Button
                variant="outlined"
                startIcon={<History />}
                onClick={() => setOpenDialog(true)}
              >
                History
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel - QR Display */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              QR Code Preview
            </Typography>
            
            {/* QR Code Display */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 400,
                bgcolor: bgColor,
                borderRadius: 2,
                p: 4,
                mb: 3
              }}
            >
              <div ref={qrRef}>
                <QRCode
                  value={text}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={errorCorrection}
                  includeMargin={includeMargin}
                  imageSettings={logo ? {
                    src: logo,
                    height: size * 0.2,
                    width: size * 0.2,
                    excavate: true,
                  } : undefined}
                />
              </div>
            </Box>

            {/* QR Info */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Encoded:</strong> {text.length > 50 ? text.substring(0, 50) + '...' : text}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Size:</strong> {size}px × {size}px
              </Typography>
            </Box>

            {/* Download & Share Buttons */}
            <Typography variant="h6" gutterBottom>
              <Download sx={{ mr: 1 }} /> Export
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={downloadPNG}
                color="success"
              >
                Download PNG
              </Button>
              
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={downloadSVG}
                color="info"
              >
                Download SVG
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={shareQR}
              >
                Share
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* History Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <History sx={{ mr: 1, verticalAlign: 'middle' }} />
          Recent QR Codes
        </DialogTitle>
        <DialogContent>
          {qrHistory.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No history yet. Generate some QR codes first!
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {qrHistory.map((item) => (
                <Card key={item.id} variant="outlined">
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.text.substring(0, 40)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.timestamp} | {item.size}px
                      </Typography>
                    </Box>
                    <Box>
                      <Button
                        size="small"
                        onClick={() => loadFromHistory(item)}
                      >
                        Load
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={clearHistory} color="error">
            Clear All
          </Button>
          <Button onClick={() => setOpenDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />

      {/* Footer */}
      <Box sx={{ mt: 6, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">
          Made with ❤️ using React & MUI
        </Typography>
        <Typography variant="caption">
          Scan with any QR scanner app | All processing happens in your browser
        </Typography>
      </Box>
    </Container>
  );
}

export default App;