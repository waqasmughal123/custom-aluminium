import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  Chip,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import type { SelectProps as MuiSelectProps } from '@mui/material/Select';
import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label: string;
  value: string | string[];
  options: SelectOption[];
  onChange: (event: SelectChangeEvent) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  multiple?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  required?: boolean;
  FormControlProps?: Record<string, unknown>;
  showChips?: boolean;
  chipColors?: Record<string, { main: string; background: string }>;
  size?: 'small' | 'medium';
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  options,
  onChange,
  error = false,
  helperText,
  disabled = false,
  multiple = false,
  fullWidth = true,
  placeholder,
  required = false,
  FormControlProps = {},
  showChips = false,
  chipColors = {},
  size = 'medium',
}) => {
  // Create a wrapper that matches Material-UI Select's expected onChange signature
  const handleChange: MuiSelectProps['onChange'] = (event) => {
    onChange(event as SelectChangeEvent);
  };

  const renderValue = (selected: string | string[]) => {
    if (showChips && Array.isArray(selected)) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selected.map((val) => {
            const option = options.find((opt) => opt.value === val);
            const chipColor = chipColors[val];
            return (
              <Chip
                key={val}
                label={option?.label || val}
                size="small"
                sx={{
                  backgroundColor: chipColor?.background || 'primary.main',
                  color: chipColor?.main || 'white',
                }}
              />
            );
          })}
        </Box>
      );
    }
    if (Array.isArray(selected)) {
      return selected
        .map((val) => options.find((opt) => opt.value === val)?.label || val)
        .join(', ');
    }
    return options.find((opt) => opt.value === selected)?.label || selected;
  };

  return (
    <FormControl 
      fullWidth={fullWidth} 
      error={error} 
      size={size}
      {...FormControlProps}
    >
      <InputLabel id={`${label}-label`} required={required}>
        {label}
      </InputLabel>
      <MuiSelect
        labelId={`${label}-label`}
        value={multiple ? (Array.isArray(value) ? value : []) : (value || '')}
        label={label}
        onChange={handleChange}
        disabled={disabled}
        multiple={multiple}
        displayEmpty={!!placeholder}
        renderValue={showChips ? renderValue : undefined}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            <em>{placeholder}</em>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default Select; 