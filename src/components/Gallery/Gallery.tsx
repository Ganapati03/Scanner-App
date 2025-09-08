import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Dialog,
  DialogContent,
  useTheme,
  useMediaQuery,
  Skeleton,
  Fade,
  Grow,
} from '@mui/material';
import ZoomableImage from './ZoomableImage';
import ErrorBoundary from '../ErrorBoundary'; // ✅ moved here

interface DocumentItem {
  id: string;
  originalFileName: string;
  originalFileUrl: string;
  processedFileUrl: string;
  createdAt: any;
  fileType: string;
}

const Gallery: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
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

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        console.log('Fetched documents:', data); // Debug log for URLs

        setDocuments(
          (data || []).map((doc: any) => {
            // Use URLs directly from the database without calling getPublicUrl
            const originalFileUrl = doc.original_file_url || '';
            const processedFileUrl = doc.processed_file_url || '';

            console.log('Using direct URL:', processedFileUrl);

            return {
              id: doc.id,
              originalFileName: doc.original_file_name,
              originalFileUrl,
              processedFileUrl,
              createdAt: doc.created_at,
              fileType: doc.file_type,
            };
          })
        );
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
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          Your Documents
        </Typography>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index} component="div">
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              <Skeleton variant="text" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="60%" />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom sx={{ fontWeight: 600 }}>
          ❌ Error Loading Documents
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 600 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (documents.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
          📂 No Documents Found
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3, fontSize: '1.1rem' }}>
          Upload your first document to see it here.
        </Typography>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            📁 Your Documents ({documents.length})
          </Typography>
        </Box>

        <Grid container spacing={isMobile ? 2 : 3}>
          {documents.map((doc, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={doc.id} component="div">
              <Grow in={true} timeout={500 + index * 100} style={{ transformOrigin: '0 0 0' }}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transform: 'scale(1)',
                    '&:hover': {
                      transform: 'scale(1.03) translateY(-6px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                    },
                    '&:active': {
                      transform: 'scale(0.98) translateY(-2px)',
                      transition: 'transform 0.1s ease',
                    },
                  }}
                  onClick={() => handleDocumentClick(doc)}
                >
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height={isMobile ? 140 : 180}
                      image={doc.processedFileUrl}
                      alt={doc.originalFileName}
                      sx={{
                        objectFit: 'cover',
                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          'linear-gradient(135deg, rgba(102,126,234,0) 0%, rgba(102,126,234,0.1) 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        '.MuiCard-root:hover &': {
                          opacity: 1,
                        },
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        transition: 'color 0.3s ease',
                        '.MuiCard-root:hover &': {
                          color: 'primary.main',
                        },
                      }}
                    >
                      {doc.originalFileName}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        transition: 'color 0.3s ease',
                        '.MuiCard-root:hover &': {
                          color: 'primary.main',
                        },
                      }}
                    >
                      📅{' '}
                      {doc.createdAt
                        ? new Date(doc.createdAt).toLocaleDateString()
                        : 'Unknown date'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
          <DialogContent>
            {selectedDocument && (
              <>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <ZoomableImage
                      src={selectedDocument.originalFileUrl}
                      alt="Original"
                      title="Original Document"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} component="div">
                    <ZoomableImage
                      src={selectedDocument.processedFileUrl}
                      alt="Processed"
                      title="Processed Document"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button onClick={handleCloseDialog} variant="contained">
                    Close
                  </Button>
                </Box>
              </>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </ErrorBoundary>
  );
};

export default Gallery;
