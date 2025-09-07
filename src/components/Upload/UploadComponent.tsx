import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// Remove unused type imports
import { auth, storage, db } from '../../firebase';
import { Box, Button, CircularProgress, Typography, Paper, Alert } from '@mui/material';
// import { PDFDocument } from 'pdf-lib';
import ImageProcessor from '../ImageProcessor/ImageProcessor';


import * as pdfjsLib from "pdfjs-dist";

// Tell pdf.js where to find the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;






const UploadComponent: React.FC = () => {
  const [user] = useAuthState(auth);
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
      // Upload original image
      const originalStorageRef = ref(storage, `images/${user.uid}/${Date.now()}_original_${file.name}`);
      const originalUploadTask = uploadBytesResumable(originalStorageRef, file);

      originalUploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Error uploading original file');
          setUploading(false);
        },
        async () => {
          // Get original image URL
          const originalUrl = await getDownloadURL(originalUploadTask.snapshot.ref);
          
          // Upload processed image
          const processedImageBlob = await fetch(processedImageData).then(r => r.blob());
          const processedStorageRef = ref(storage, `images/${user.uid}/${Date.now()}_processed_${file.name}`);
          const processedUploadTask = uploadBytesResumable(processedStorageRef, processedImageBlob);
          
          processedUploadTask.on('state_changed',
            (snapshot) => {
              const progress = 50 + (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
              setUploadProgress(progress);
            },
            (error) => {
              console.error('Upload error:', error);
              setError('Error uploading processed file');
              setUploading(false);
            },
            async () => {
              // Get processed image URL
              const processedUrl = await getDownloadURL(processedUploadTask.snapshot.ref);
              
              // Save metadata to Firestore
              await addDoc(collection(db, 'documents'), {
                userId: user.uid,
                originalFileName: file.name,
                originalFileUrl: originalUrl,
                processedFileUrl: processedUrl,
                createdAt: serverTimestamp(),
                fileType: file.type
              });
              
              setUploading(false);
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
            }
          );
        }
      );
    } catch (err) {
      console.error('Upload error:', err);
      setError('Error uploading files');
      setUploading(false);
    }
  };

  const handleProcessedImage = (processedDataUrl: string) => {
    setProcessedImageData(processedDataUrl);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Upload Document
      </Typography>
      
      {!imageData ? (
        <Paper
          {...getRootProps()}
          sx={{
            p: 4,
            border: '2px dashed #ccc',
            borderRadius: 2,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? '#f0f8ff' : 'inherit',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          <input {...getInputProps()} />
          <Typography variant="body1" gutterBottom>
            {isDragActive
              ? 'Drop the file here...'
              : 'Drag & drop a file here, or click to select a file'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Supported formats: PNG, JPEG, PDF (first page will be extracted)
          </Typography>
        </Paper>
      ) : (
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Document uploaded successfully!
            </Alert>
          )}
          
          <ImageProcessor 
            imageData={imageData} 
            onProcessed={handleProcessedImage} 
          />
          
          {processedImageData && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={uploading}
                sx={{ mr: 2 }}
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
              >
                Cancel
              </Button>
            </Box>
          )}
          
          {uploading && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <CircularProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {Math.round(uploadProgress)}%
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default UploadComponent;