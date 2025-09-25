import { TextField, TextFieldProps } from '@mui/material';
import React from 'react';


export interface TextAreaProps extends Omit<TextFieldProps, 'multiline' | 'rows' | 'minRows' | 'maxRows'> {
  rows?: number;
  minRows?: number;
  maxRows?: number;
  autoResize?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
}

const TextArea = React.forwardRef<HTMLDivElement, TextAreaProps>(
  ({ 
    rows = 4,
    minRows,
    maxRows,
    autoResize = false,
    maxLength,
    showCharacterCount = false,
    helperText,
    value,
    ...props 
  }, ref) => {
    const characterCount = value ? String(value).length : 0;
    const isOverLimit = maxLength ? characterCount > maxLength : false;

    const getHelperText = () => {
      const parts = [];
      
      if (helperText) {
        parts.push(helperText);
      }
      
      if (showCharacterCount && maxLength) {
        parts.push(`${characterCount}/${maxLength}`);
      } else if (showCharacterCount) {
        parts.push(`${characterCount} characters`);
      }
      
      return parts.join(' • ');
    };

    return (
      <TextField
        ref={ref}
        multiline
        rows={autoResize ? undefined : rows}
        minRows={autoResize ? minRows || 2 : undefined}
        maxRows={autoResize ? maxRows || 6 : undefined}
        value={value}
        error={isOverLimit || props.error}
        helperText={getHelperText() || undefined}
        inputProps={{
          maxLength,
          ...props.inputProps,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#FAFAFA',
            alignItems: 'flex-start',
            '& textarea': {
              resize: autoResize ? 'none' : 'vertical',
            },
          },
          ...props.sx,
        }}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea; 