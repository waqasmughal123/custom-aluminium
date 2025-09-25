'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';
import { Button } from '../common';
import { useToastActions } from '../providers';

export const ToastExample: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToastActions();
  const [customMessage, setCustomMessage] = useState('');

  const handleShowSuccess = () => {
    showSuccess('Operation completed successfully!');
  };

  const handleShowError = () => {
    showError('Something went wrong. Please try again.');
  };

  const handleShowWarning = () => {
    showWarning('This action requires your attention.');
  };

  const handleShowInfo = () => {
    showInfo('Here is some useful information for you.');
  };

  const handleShowCustom = () => {
    if (customMessage.trim()) {
      showInfo(customMessage);
      setCustomMessage('');
    } else {
      showWarning('Please enter a message first!');
    }
  };

  const handleShowMultiple = () => {
    showInfo('First notification...');
    setTimeout(() => showSuccess('Second notification!'), 500);
    setTimeout(() => showWarning('Third notification!'), 1000);
    setTimeout(() => showError('Final notification!'), 1500);
  };

  const handleShowLongMessage = () => {
    showInfo(
      'This is a very long notification message that demonstrates how the toast system handles lengthy content. It should wrap properly and remain readable while maintaining good visual hierarchy.'
    );
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            🍞 Toast Notification Demo
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click the buttons below to see different types of toast notifications in action.
          </Typography>

          <Stack spacing={2}>
            {/* Basic Toast Types */}
            <Typography variant="h6" component="h3">
              Basic Toast Types
            </Typography>
            
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button 
                variant="contained" 
                color="success" 
                onClick={handleShowSuccess}
              >
                Success Toast
              </Button>
              
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleShowError}
              >
                Error Toast
              </Button>
              
              <Button 
                variant="contained" 
                color="warning" 
                onClick={handleShowWarning}
              >
                Warning Toast
              </Button>
              
              <Button 
                variant="contained" 
                color="info" 
                onClick={handleShowInfo}
              >
                Info Toast
              </Button>
            </Stack>

            <Divider />

            {/* Custom Message */}
            <Typography variant="h6" component="h3">
              Custom Message
            </Typography>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                fullWidth
                size="small"
                placeholder="Enter your custom message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleShowCustom();
                  }
                }}
              />
              <Button 
                variant="outlined" 
                onClick={handleShowCustom}
                disabled={!customMessage.trim()}
              >
                Show Toast
              </Button>
            </Stack>

            <Divider />

            {/* Advanced Examples */}
            <Typography variant="h6" component="h3">
              Advanced Examples
            </Typography>
            
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button 
                variant="outlined" 
                onClick={handleShowMultiple}
              >
                Multiple Toasts
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={handleShowLongMessage}
              >
                Long Message
              </Button>
            </Stack>

            <Divider />

            {/* Usage Information */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                💡 Usage in your components:
              </Typography>
              <Typography 
                variant="body2" 
                component="pre" 
                sx={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.8rem',
                  backgroundColor: 'grey.100',
                  p: 1,
                  borderRadius: 0.5,
                  overflow: 'auto'
                }}
              >
{`import { useToastActions } from '../providers';

function MyComponent() {
  const { showSuccess, showError } = useToastActions();
  
  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('Data saved successfully!');
    } catch (error) {
      showError('Failed to save data');
    }
  };
}`}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}; 