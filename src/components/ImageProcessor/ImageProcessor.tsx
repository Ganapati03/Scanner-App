import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, CircularProgress, Typography, Grid, Paper } from '@mui/material';

interface ImageProcessorProps {
  imageData: string;
  onProcessed: (processedDataUrl: string) => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({ imageData, onProcessed }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Load and display the original image
  useEffect(() => {
    if (!imageData) return;
    
    const img = new Image();
    img.onload = () => {
      if (originalCanvasRef.current) {
        const canvas = originalCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, img.width, img.height);
      }
    };
    img.src = imageData;
  }, [imageData]);
  
  const processImage = async () => {
    if (!originalCanvasRef.current) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      // In a real implementation, we would use OpenCV.js for document detection
      // and perspective correction. For this demo, we'll simulate the processing
      // with a simple transformation.
      
      const originalCanvas = originalCanvasRef.current;
      const processedCanvas = processedCanvasRef.current;
      if (!processedCanvas) return;
      
      const ctx = processedCanvas.getContext('2d');
      if (!ctx) return;
      
      // Set processed canvas dimensions
      processedCanvas.width = originalCanvas.width;
      processedCanvas.height = originalCanvas.height;
      
      // Get original image data
      const originalCtx = originalCanvas.getContext('2d');
      if (!originalCtx) return;
      
      // Simulate document detection and perspective correction
      // In a real implementation, this would use computer vision algorithms
      
      // For demo purposes, we'll just apply a simple transformation
      // that simulates a perspective correction
      
      // Draw a slightly transformed version of the original image
      ctx.save();
      
      // Clear the canvas
      ctx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
      
      // Apply a simulated perspective correction
      // This is a simplified version - in a real app, you would use OpenCV.js
      // to detect document corners and apply proper perspective transformation
      ctx.beginPath();
      ctx.rect(0, 0, processedCanvas.width, processedCanvas.height);
      ctx.fillStyle = '#f0f0f0';
      ctx.fill();
      
      // Draw the "corrected" image slightly smaller to simulate cropping
      const margin = originalCanvas.width * 0.1;
      ctx.drawImage(
        originalCanvas,
        margin, margin, // Source position
        originalCanvas.width - margin * 2, originalCanvas.height - margin * 2, // Source dimensions
        margin / 2, margin / 2, // Destination position
        processedCanvas.width - margin, processedCanvas.height - margin // Destination dimensions
      );
      
      // Add a subtle border to make it look like a document
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        margin / 2, margin / 2,
        processedCanvas.width - margin, processedCanvas.height - margin
      );
      
      ctx.restore();
      
      // Get the processed image data URL
      const processedDataUrl = processedCanvas.toDataURL('image/jpeg');
      setProcessedImage(processedDataUrl);
      onProcessed(processedDataUrl);
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Error processing image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {/* Hidden canvas elements for image processing */}
      <Box sx={{ display: 'none' }}>
        <canvas ref={originalCanvasRef} />
        <canvas ref={processedCanvasRef} />
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Original Image</Typography>
            <Box
              component="img"
              src={imageData}
              alt="Original"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '500px',
                objectFit: 'contain'
              }}
            />
          </Paper>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Processed Image</Typography>
            {processedImage ? (
              <Box
                component="img"
                src={processedImage}
                alt="Processed"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '500px',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="textSecondary">Process an image to see the result</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={processImage}
          disabled={processing || !imageData}
        >
          {processing ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
              Processing...
            </>
          ) : (
            'Process Image'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ImageProcessor;