import React, { useState, useRef, useCallback } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';

interface ZoomableImageProps {
  src: string;
  alt: string;
  title: string;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt, title }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1 && e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1 && e.currentTarget) {
      const newPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setPan(newPan);
    }
  }, [isDragging, zoom, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>

      {/* Zoom Controls */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 1 }}>
        <IconButton
          size="small"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          sx={{
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
            boxShadow: 1
          }}
        >
          <ZoomOutIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleZoomIn}
          disabled={zoom >= 3}
          sx={{
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
            boxShadow: 1
          }}
        >
          <ZoomInIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleReset}
          sx={{
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
            boxShadow: 1
          }}
        >
          <RotateLeftIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Zoom Level Indicator */}
      <Box sx={{
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
        bgcolor: 'rgba(0,0,0,0.7)',
        color: 'white',
        px: 1,
        py: 0.5,
        borderRadius: 1,
        fontSize: '0.75rem',
        fontWeight: 600
      }}>
        {Math.round(zoom * 100)}%
      </Box>

      {/* Image Container */}
      <Box
        sx={{
          width: '100%',
          height: '70vh',
          overflow: 'hidden',
          border: '1px solid #eee',
          borderRadius: 2,
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          position: 'relative'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <Box
          ref={imageRef}
          component="img"
          src={src}
          alt={alt}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            userSelect: 'none',
            pointerEvents: 'none'
          }}
          draggable={false}
        />
      </Box>
    </Box>
  );
};

export default ZoomableImage;
