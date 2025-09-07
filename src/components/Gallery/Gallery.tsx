import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { Box, Grid, Typography, Card, CardMedia, CardContent, CircularProgress, Button, Dialog, DialogContent } from '@mui/material';

interface DocumentItem {
  id: string;
  originalFileName: string;
  originalFileUrl: string;
  processedFileUrl: string;
  createdAt: any;
  fileType: string;
}

const Gallery: React.FC = () => {
  const [user] = useAuthState(auth);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const q = query(
          collection(db, 'documents'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const docs: DocumentItem[] = [];
        
        querySnapshot.forEach((doc) => {
          docs.push({
            id: doc.id,
            ...doc.data() as Omit<DocumentItem, 'id'>
          });
        });
        
        setDocuments(docs);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Error loading your documents. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [user]);

  const handleDocumentClick = (document: DocumentItem) => {
    setSelectedDocument(document);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (documents.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          No Documents Found
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Upload your first document to see it here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Your Documents
      </Typography>
      
      <Grid container spacing={3}>
        {documents.map((doc) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id} component="div">
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
              onClick={() => handleDocumentClick(doc)}
            >
              <CardMedia
                component="img"
                height="180"
                image={doc.processedFileUrl}
                alt={doc.originalFileName}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="body2" noWrap>
                  {doc.originalFileName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {doc.createdAt?.toDate().toLocaleDateString() || 'Unknown date'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          {selectedDocument && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }} component="div">
                <Typography variant="subtitle1" gutterBottom>
                  Original
                </Typography>
                <Box
                  component="img"
                  src={selectedDocument.originalFileUrl}
                  alt="Original"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    border: '1px solid #eee'
                  }}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }} component="div">
                <Typography variant="subtitle1" gutterBottom>
                  Processed
                </Typography>
                <Box
                  component="img"
                  src={selectedDocument.processedFileUrl}
                  alt="Processed"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    border: '1px solid #eee'
                  }}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }} component="div">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button onClick={handleCloseDialog}>Close</Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Gallery;