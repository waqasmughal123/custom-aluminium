import { 
    FormControl,
    FormControlLabel,
    FormLabel,
    RadioGroup as MuiRadioGroup,
    Radio,
    FormHelperText,
    Box
  } from '@mui/material';
import React from 'react';


export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  row?: boolean;
  name?: string;
  customRadios?: boolean; // For custom yellow radio buttons like in the modal
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ 
    label, 
    options, 
    value, 
    onChange, 
    error, 
    helperText, 
    required,
    disabled,
    row = false,
    name,
    customRadios = false,
    ...props 
  }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event.target.value, event);
      }
    };

    if (customRadios) {
      return (
        <Box ref={ref}>
          {label && (
            <FormLabel 
              component="legend" 
              error={error}
              required={required}
              sx={{ mb: 2, display: 'block' }}
            >
              {label}
            </FormLabel>
          )}
          <Box sx={{ display: 'flex', gap: 4, flexDirection: row ? 'row' : 'column' }}>
            {options.map((option) => (
              <Box 
                key={option.value}
                onClick={() => !disabled && !option.disabled && onChange?.(option.value, {} as React.ChangeEvent<HTMLInputElement>)}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  cursor: disabled || option.disabled ? 'default' : 'pointer',
                  opacity: disabled || option.disabled ? 0.6 : 1,
                  '&:hover': disabled || option.disabled ? {} : {
                    '& .radio-circle': {
                      borderColor: '#FFC107'
                    }
                  }
                }}
              >
                <Box
                  className="radio-circle"
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: value === option.value ? '#FFC107' : '#E0E0E0',
                    backgroundColor: value === option.value ? '#FFC107' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {value === option.value && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'white'
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {option.icon}
                  <span style={{ 
                    fontWeight: 500,
                    color: value === option.value ? '#1976d2' : '#666'
                  }}>
                    {option.label}
                  </span>
                </Box>
              </Box>
            ))}
          </Box>
          {helperText && (
            <FormHelperText error={error} sx={{ mt: 1 }}>
              {helperText}
            </FormHelperText>
          )}
        </Box>
      );
    }

    return (
      <FormControl component="fieldset" error={error} disabled={disabled} ref={ref as React.Ref<HTMLFieldSetElement>}>
        {label && (
          <FormLabel component="legend" required={required}>
            {label}
          </FormLabel>
        )}
        <MuiRadioGroup
          name={name}
          value={value}
          onChange={handleChange}
          row={row}
          {...props}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {option.icon}
                  {option.label}
                </Box>
              }
              disabled={option.disabled}
            />
          ))}
        </MuiRadioGroup>
        {helperText && (
          <FormHelperText>{helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup; 