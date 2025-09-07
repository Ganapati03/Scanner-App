import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { AppBar, Box, Button, Container, Grid, Toolbar, Typography, Paper } from '@mui/material';
import UploadComponent from '../Upload/UploadComponent';
import Gallery from '../Gallery/Gallery';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Document Scanner
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              color="inherit" 
              onClick={() => setActiveTab('upload')}
              variant={activeTab === 'upload' ? 'outlined' : 'text'}
            >
              Upload
            </Button>
            <Button 
              color="inherit" 
              onClick={() => setActiveTab('gallery')}
              variant={activeTab === 'gallery' ? 'outlined' : 'text'}
            >
              Gallery
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }} component="div">
            <Paper sx={{ p: 2 }}>
              {activeTab === 'upload' ? <UploadComponent /> : <Gallery />}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;