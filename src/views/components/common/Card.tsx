import { 
  Card as MuiCard, 
  CardContent, 
  CardActions,
  CardHeader,
  Typography,
  Box
} from '@mui/material';
import React from 'react';
import { BaseComponentProps } from '@/utils/types';

interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  elevation?: number;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  actions,
  className = '',
  elevation = 2,
  ...props
}) => {
  return (
    <MuiCard elevation={elevation} className={className} {...props}>
      {(title || subtitle) && (
        <CardHeader
          title={title && (
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          )}
          subheader={subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        />
      )}
      
      {children && (
        <CardContent>
          {children}
        </CardContent>
      )}
      
      {actions && (
        <CardActions>
          <Box sx={{ ml: 'auto' }}>
            {actions}
          </Box>
        </CardActions>
      )}
    </MuiCard>
  );
}; 