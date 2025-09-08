import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../supabase';
import { Box, Button, CircularProgress, Typography, Paper, Alert, LinearProgress, Chip, Fade, Zoom } from '@mui/material';
// import { PDFDocument } from 'pdf-lib';
import ImageProcessor from '../ImageProcessor/ImageProcessor';


import * as pdfjsLib from "pdfjs-dist";

// Tell pdf.js where to find the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;






const UploadComponent: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  const [file, setFile] = useState<File | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [processedImageData, setProcessedImageData] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setError(null);
    setSuccess(false);
    setProcessedImageData(null);
    
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);

    try {
      if (selectedFile.type === "application/pdf") {
        const arrayBuffer = await selectedFile.arrayBuffer();

        // Load PDF with pdf.js
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        // Render first page to canvas
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
          canvas,
        }).promise;

        // Convert canvas to image
        const imageDataUrl = canvas.toDataURL("image/png");
        setImageData(imageDataUrl);

      } else if (selectedFile.type.startsWith('image/')) {
        // Handle image file
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            setImageData(e.target.result as string);
          }
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setError('Unsupported file type. Please upload a PNG, JPEG, or PDF file.');
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Error processing file. Please try again.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/pdf': []
    },
    maxFiles: 1,
    multiple: false
  });

  const handleUpload = async () => {
    if (!user || !file || !processedImageData) {
      setError('Please process an image before uploading');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const timestamp = Date.now();

      // Upload original file
      setUploadProgress(10);
      const originalFileName = `${user.id}/${timestamp}_original_${file.name}`;
      const { data: originalData, error: originalError } = await supabase.storage
        .from('documents')
        .upload(originalFileName, file);

      if (originalError) throw originalError;
      setUploadProgress(40);

      // Upload processed image
      const processedImageBlob = await fetch(processedImageData).then(r => r.blob());
      const processedFileName = `${user.id}/${timestamp}_processed_${file.name}`;
      const { data: processedData, error: processedError } = await supabase.storage
        .from('documents')
        .upload(processedFileName, processedImageBlob);

      if (processedError) throw processedError;
      setUploadProgress(70);

      // Get public URLs
      const { data: originalUrlData } = supabase.storage.from('documents').getPublicUrl(originalFileName);
      const { data: processedUrlData } = supabase.storage.from('documents').getPublicUrl(processedFileName);

      // Save metadata to Supabase database
      const { error: dbError } = await supabase
        .from('documents')
        .insert([
          {
            user_id: user.id,
            original_file_name: file.name,
            original_file_url: originalUrlData.publicUrl,
            processed_file_url: processedUrlData.publicUrl,
            file_type: file.type,
            status: 'completed',
            created_at: new Date().toISOString(),
          },
        ]);

      if (dbError) throw dbError;

      setUploadProgress(100);
      setSuccess(true);

      // Reset form after successful upload
      setTimeout(() => {
        setFile(null);
        setImageData(null);
        setProcessedImageData(null);
        setUploadProgress(0);
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Error uploading files');
      setUploading(false);
    }
  };

  const handleProcessedImage = (processedDataUrl: string) => {
    setProcessedImageData(processedDataUrl);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Upload Document
      </Typography>

      {!imageData ? (
        <Zoom in={true} timeout={500}>
          <Paper
            {...getRootProps()}
            sx={{
              p: 5,
              border: '3px dashed #667eea',
              borderRadius: 3,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? '#e6f0ff' : 'inherit',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isDragActive ? 'scale(1.02)' : 'scale(1)',
              boxShadow: isDragActive ? '0 8px 25px rgba(102, 126, 234, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: '#d0e2ff',
                transform: 'scale(1.01)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.2)',
              },
            }}
          >
            <input {...getInputProps()} />
            <Fade in={true} timeout={800}>
              <Box>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    fontSize: '1.2rem',
                    mb: 2,
                    transition: 'color 0.3s ease',
                    color: isDragActive ? '#667eea' : 'inherit'
                  }}
                >
                  {isDragActive
                    ? '📂 Drop the file here...'
                    : '📤 Drag & drop a file here, or click to select a file'}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    transition: 'color 0.3s ease',
                    color: isDragActive ? '#667eea' : 'textSecondary'
                  }}
                >
                  Supported formats: PNG, JPEG, PDF (first page will be extracted)
                </Typography>
              </Box>
            </Fade>
          </Paper>
        </Zoom>
      ) : (
        <Box>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              ❌ {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 2,
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              ✅ Document uploaded successfully!
            </Alert>
          )}

          <ImageProcessor imageData={imageData} onProcessed={handleProcessedImage} />

          {processedImageData && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={uploading}
                sx={{
                  mr: 2,
                  py: 1.5,
                  px: 4,
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.5)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.7)',
                  },
                }}
              >
                {uploading ? 'Uploading...' : 'Save Document'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setFile(null);
                  setImageData(null);
                  setProcessedImageData(null);
                  setError(null);
                }}
                disabled={uploading}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Cancel
              </Button>
            </Box>
          )}

          {uploading && (
            <Fade in={uploading} timeout={300}>
              <Box sx={{ mt: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                    sx={{
                      borderRadius: 2,
                      height: 12,
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        animation: 'shimmer 2s infinite linear',
                      }
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        animation: 'pulse 1.5s infinite',
                        fontSize: '0.9rem'
                      }}
                    >
                      {Math.round(uploadProgress)}%
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1.5,
                    fontWeight: 600,
                    textAlign: 'center',
                    color: 'primary.main',
                    animation: 'fadeIn 0.5s ease-in'
                  }}
                >
                  Uploading your document...
                </Typography>
              </Box>
            </Fade>
          )}
        </Box>
      )}
    </Box>
  );
};

export default UploadComponent;