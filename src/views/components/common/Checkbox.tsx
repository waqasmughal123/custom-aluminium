import { 
    FormControlLabel, 
    Checkbox as MuiCheckbox, 
    CheckboxProps as MuiCheckboxProps,
    FormHelperText,
    Box
  } from '@mui/material';
import React from 'react';


export interface CheckboxProps extends Omit<MuiCheckboxProps, 'onChange'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ 
    label, 
    helperText, 
    error, 
    onChange, 
    labelPlacement = 'end',
    ...props 
  }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event.target.checked, event);
      }
    };

    const checkbox = (
      <MuiCheckbox
        ref={ref}
        onChange={handleChange}
        sx={{
          color: error ? 'error.main' : 'primary.main',
          '&.Mui-checked': {
            color: 'primary.main',
          },
          ...props.sx,
        }}
        {...props}
      />
    );

    if (!label) {
      return (
        <Box>
          {checkbox}
          {helperText && (
            <FormHelperText error={error}>{helperText}</FormHelperText>
          )}
        </Box>
      );
    }

    return (
      <Box>
        <FormControlLabel
          control={checkbox}
          label={label}
          labelPlacement={labelPlacement}
          sx={{
            margin: 0,
            '& .MuiFormControlLabel-label': {
              color: error ? 'error.main' : 'text.primary',
            },
          }}
        />
        {helperText && (
          <FormHelperText error={error} sx={{ ml: labelPlacement === 'end' ? 4 : 0 }}>
            {helperText}
          </FormHelperText>
        )}
      </Box>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox; 