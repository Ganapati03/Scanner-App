import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        py: 3,
        px: 2,
        backgroundColor: '#1976d2', // MUI primary blue
        color: 'white',
        textAlign: 'center',
        fontSize: '0.9rem',
        boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="body2" component="p">
        &copy; {new Date().getFullYear()} Document Scanner. All rights reserved.
      </Typography>
      <Typography variant="body2" component="p" sx={{ mt: 1 }}>
        Developed by Your Company.{' '}
        <Link href="https://yourcompany.com" target="_blank" rel="noopener" color="inherit" underline="hover">
          Visit our website
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
