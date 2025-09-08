import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import { CircularProgress, Box, CssBaseline, ThemeProvider, createTheme, Fade } from '@mui/material';
import Auth from './components/Auth/Auth';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Dashboard from './components/Dashboard/Dashboard';
import Footer from './components/Footer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <Fade in={true} timeout={800}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress
                size={60}
                sx={{
                  color: 'white',
                  mb: 2,
                  animation: 'pulse 2s infinite'
                }}
              />
              <Box
                sx={{
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  animation: 'fadeIn 1s ease-in'
                }}
              >
                Loading Document Scanner...
              </Box>
            </Box>
          </Fade>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: '1 0 auto' }}>
            <Routes>
              <Route path="/auth" element={
                <Fade in={true} timeout={600}>
                  <Box>
                    {user ? <Navigate to="/" replace /> : <Auth />}
                  </Box>
                </Fade>
              } />
              <Route path="/" element={
                <Fade in={true} timeout={600}>
                  <Box>
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  </Box>
                </Fade>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <Footer />
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
