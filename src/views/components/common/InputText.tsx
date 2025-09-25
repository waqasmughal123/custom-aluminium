import { TextField, TextFieldProps } from '@mui/material';
import React from 'react';

export interface InputTextProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const InputText = React.forwardRef<HTMLDivElement, InputTextProps>(
  ({ startIcon, endIcon, variant = 'outlined', sx, ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        variant={variant}
        InputProps={{
          startAdornment: startIcon && (
            <div style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
              {startIcon}
            </div>
          ),
          endAdornment: endIcon && (
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: 8 }}>
              {endIcon}
            </div>
          ),
          ...props.InputProps,
        }}
        InputLabelProps={{
          shrink: true, // Always keep label at the top
          ...props.InputLabelProps,
        }}
        sx={sx}
        {...props}
      />
    );
  }
);

InputText.displayName = 'InputText';

export default InputText; 