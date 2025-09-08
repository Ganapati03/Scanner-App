import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { AppBar, Box, Button, Container, Grid, Toolbar, Typography, Paper, useTheme, useMediaQuery, Fade, Slide } from '@mui/material';
import UploadComponent from '../Upload/UploadComponent';
import Gallery from '../Gallery/Gallery';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AppBar
        position="static"
        elevation={2}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              fontSize: isMobile ? '1.1rem' : '1.25rem',
              letterSpacing: '-0.02em'
            }}
          >
            📄 Document Scanner
          </Typography>
          <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2, alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={() => setActiveTab('upload')}
              variant={activeTab === 'upload' ? 'contained' : 'text'}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                borderRadius: 2,
                px: isMobile ? 2 : 3,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: isMobile ? '0.875rem' : '1rem',
                backgroundColor: activeTab === 'upload' ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'scale(1)',
                '&:hover': {
                  backgroundColor: activeTab === 'upload' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                  transition: 'transform 0.1s ease',
                }
              }}
            >
              📤 Upload
            </Button>
            <Button
              color="inherit"
              onClick={() => setActiveTab('gallery')}
              variant={activeTab === 'gallery' ? 'contained' : 'text'}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                borderRadius: 2,
                px: isMobile ? 2 : 3,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: isMobile ? '0.875rem' : '1rem',
                backgroundColor: activeTab === 'gallery' ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'scale(1)',
                '&:hover': {
                  backgroundColor: activeTab === 'gallery' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                  transition: 'transform 0.1s ease',
                }
              }}
            >
              🖼️ Gallery
            </Button>
            <Button
              color="inherit"
              onClick={handleLogout}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                borderRadius: 2,
                px: isMobile ? 2 : 3,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: isMobile ? '0.875rem' : '1rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'scale(1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                  transition: 'transform 0.1s ease',
                }
              }}
            >
              🚪 Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: isMobile ? 2 : 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }} component="div">
            <Paper
              elevation={1}
              sx={{
                p: isMobile ? 2 : 3,
                borderRadius: 3,
                backgroundColor: 'white',
                minHeight: '60vh',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }}
            >
              <Fade in={activeTab === 'upload'} timeout={400} unmountOnExit>
                <Box sx={{ animation: activeTab === 'upload' ? 'slideInLeft 0.4s ease-out' : 'none' }}>
                  {activeTab === 'upload' && <UploadComponent />}
                </Box>
              </Fade>
              <Fade in={activeTab === 'gallery'} timeout={400} unmountOnExit>
                <Box sx={{ animation: activeTab === 'gallery' ? 'slideInRight 0.4s ease-out' : 'none' }}>
                  {activeTab === 'gallery' && <Gallery />}
                </Box>
              </Fade>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;