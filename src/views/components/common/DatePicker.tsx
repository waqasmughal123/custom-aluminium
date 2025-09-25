
import { TextFieldProps } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React from 'react';

export interface DatePickerProps {
  label?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  format?: string;
  TextFieldProps?: Omit<TextFieldProps, 'value' | 'onChange'>;
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ 
    label, 
    value, 
    onChange, 
    error, 
    helperText, 
    disabled, 
    required,
    fullWidth = true,
    format = 'dd/MM/yyyy',
    TextFieldProps,
    ...props 
  }, ref) => {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MuiDatePicker
          label={label}
          value={value}
          onChange={onChange}
          disabled={disabled}
          format={format}
          views={['year', 'month', 'day']}
          slotProps={{
            textField: {
              ref,
              fullWidth,
              error,
              helperText,
              required,
              placeholder: format,
              ...TextFieldProps,
            },
          }}
          {...props}
        />
      </LocalizationProvider>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker; 