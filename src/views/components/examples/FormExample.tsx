import { Person, Email, AttachMoney } from '@mui/icons-material';
import { Box, Typography, Stack } from '@mui/material';
import React, { useState } from 'react';
import { 
  InputText, 
  Select, 
  DatePicker, 
  Checkbox, 
  TextArea, 
  RadioGroup,
  type SelectOption,
  type RadioOption 
} from '@/views/components/common';


const FormExample: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    amount: '',
    status: '',
    priority: '',
    startDate: null as Date | null,
    description: '',
    isActive: false,
    uploadType: ''
  });

  // Select options for status
  const statusOptions: SelectOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ];

  // Select options for priority with chips
  const priorityOptions: SelectOption[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  // Priority chip colors
  const priorityColors = {
    low: { main: '#4CAF50', background: 'rgba(76, 175, 80, 0.1)' },
    medium: { main: '#FF9800', background: 'rgba(255, 152, 0, 0.1)' },
    high: { main: '#F44336', background: 'rgba(244, 67, 54, 0.1)' },
  };

  // Radio options for upload type
  const uploadTypeOptions: RadioOption[] = [
    { value: 'file', label: 'File Upload' },
    { value: 'link', label: 'External Link' },
  ];

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Generic Form Components Example
      </Typography>
      
      <Stack spacing={3}>
        {/* InputText with icon */}
        <InputText
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          startIcon={<Person />}
          placeholder="Enter your full name"
          helperText="This is a generic InputText component with start icon"
        />

        {/* InputText with end icon */}
        <InputText
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          endIcon={<Email />}
          placeholder="your.email@example.com"
          helperText="InputText with end icon"
        />

        {/* InputText for numbers */}
        <InputText
          label="Amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          startIcon={<AttachMoney />}
          placeholder="0.00"
          helperText="Numeric input with currency icon"
        />

        {/* Regular Select */}
        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as string }))}
          options={statusOptions}
          helperText="Basic select component"
        />

        {/* Select with chips */}
        <Select
          label="Priority"
          value={formData.priority}
          onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as string }))}
          options={priorityOptions}
          showChips={true}
          chipColors={priorityColors}
          helperText="Select with colored chips"
        />

        {/* DatePicker */}
        <DatePicker
          label="Start Date"
          value={formData.startDate}
          onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
          helperText="Generic DatePicker component"
        />

        {/* TextArea */}
        <TextArea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          maxLength={500}
          showCharacterCount={true}
          placeholder="Enter a detailed description..."
          helperText="TextArea with character count"
        />

        {/* Checkbox */}
        <Checkbox
          label="Is Active"
          checked={formData.isActive}
          onChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          helperText="Generic Checkbox component"
        />

        {/* RadioGroup with custom styling */}
        <RadioGroup
          label="Upload Type"
          options={uploadTypeOptions}
          value={formData.uploadType}
          onChange={(value) => setFormData(prev => ({ ...prev, uploadType: value }))}
          customRadios={true}
          row={true}
          helperText="Custom yellow radio buttons like in the modal"
        />

        {/* Display form data */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Form Data:
          </Typography>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(formData, null, 2)}
          </pre>
        </Box>
      </Stack>
    </Box>
  );
};

export default FormExample; 