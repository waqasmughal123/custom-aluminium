"use client";

import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import React, { useState } from 'react';
import { modalStyle } from '../constants';
import type { JobFormValues } from '../constants';
import type { JobDisplay } from '../../list/types';
import { ALL_MANUFACTURING_PROCESSES } from '../../constant';

interface DuplicateFieldModalProps {
  open: boolean;
  onClose: () => void;
  sourceJob: JobDisplay | null;
  onDuplicate: (selectedFields: Partial<JobFormValues>) => void;
}

// Define field groups according to acceptance criteria
const FIELD_GROUPS = {
  processes: {
    title: 'Processes',
    description: 'Manufacturing processes and workflow steps',
    fields: [
      { key: 'selectedProcesses', label: 'Selected Processes' },
    ]
  },
  timeEstimates: {
    title: 'Time Estimates',
    description: 'Labour time and scheduling estimates',
    fields: [
      { key: 'labourUnits', label: 'Labour Units' },
      { key: 'labourUnitsElapsed', label: 'Labour Units Elapsed' },
    ]
  },
  materialRequirements: {
    title: 'Material Requirements', 
    description: 'Material specifications and quantities',
    fields: [
      { key: 'materialUnits', label: 'Material Units' },
      { key: 'materialsText', label: 'Materials Text' },
      { key: 'finishColour', label: 'Finish/Colour' },
      { key: 'quantity', label: 'Quantity' },
    ]
  },
  customerInfo: {
    title: 'Customer Info',
    description: 'Customer details and contact information',
    fields: [
      { key: 'customer', label: 'Customer' },
      { key: 'customerPO', label: 'Customer PO' },
    ]
  },
  contactInfo: {
    title: 'Contact Info', 
    description: 'Contact person and communication details',
    fields: [
      { key: 'contact', label: 'Contact' },
      { key: 'contacted', label: 'Contacted Status' },
    ]
  },
  jobDetails: {
    title: 'Job Details',
    description: 'Basic job information and specifications',
    fields: [
      { key: 'job', label: 'Job Title' },
      { key: 'description', label: 'Description' },
      { key: 'priority', label: 'Priority' },
      { key: 'amount', label: 'Amount' },
      { key: 'locationCode', label: 'Location Code' },
      { key: 'notes', label: 'Notes' },
    ]
  }
};

export default function DuplicateFieldModal({
  open,
  onClose,
  sourceJob,
  onDuplicate,
}: DuplicateFieldModalProps) {
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});
  const [selectAllGroups, setSelectAllGroups] = useState<Record<string, boolean>>({});

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  const handleGroupToggle = (groupKey: string) => {
    const group = FIELD_GROUPS[groupKey as keyof typeof FIELD_GROUPS];
    const isGroupSelected = selectAllGroups[groupKey];
    
    const newSelectedFields = { ...selectedFields };
    group.fields.forEach(field => {
      if (!isGroupSelected) {
        // Select all fields in group that have values
        const value = getFieldValue(sourceJob!, field.key);
        if (value !== undefined && value !== null && value !== '') {
          newSelectedFields[field.key] = true;
        }
      } else {
        // Deselect all fields in group
        newSelectedFields[field.key] = false;
      }
    });
    
    setSelectedFields(newSelectedFields);
    setSelectAllGroups(prev => ({
      ...prev,
      [groupKey]: !isGroupSelected
    }));
  };

  const handleCopyAll = () => {
    if (!sourceJob) return;

    const newSelectedFields: Record<string, boolean> = {};
    const newSelectAllGroups: Record<string, boolean> = {};
    
    Object.entries(FIELD_GROUPS).forEach(([groupKey, group]) => {
      let hasValidFields = false;
      group.fields.forEach(field => {
        const value = getFieldValue(sourceJob, field.key);
        if (value !== undefined && value !== null && value !== '') {
          newSelectedFields[field.key] = true;
          hasValidFields = true;
        }
      });
      newSelectAllGroups[groupKey] = hasValidFields;
    });
    
    setSelectedFields(newSelectedFields);
    setSelectAllGroups(newSelectAllGroups);
  };

  const handleClearAll = () => {
    setSelectedFields({});
    setSelectAllGroups({});
  };

  const getFieldValue = (job: JobDisplay, fieldKey: string) => {
    if (!job) return null;
    
    switch (fieldKey) {
      case 'job': return job.job;
      case 'description': return job.description;
      case 'status': return job.status;
      case 'priority': return job.priority;
      case 'amount': return job.amount?.toString();
      case 'quantity': return job.quantity;
      case 'customer': return job.customer;
      case 'contact': return job.contact;
      case 'customerPO': return job.customer_po;
      case 'materialUnits': return job.material_units?.toString();
      case 'labourUnits': return job.labour_units?.toString();
      case 'labourUnitsElapsed': return job.labour_units_elapsed?.toString();
      case 'materialsText': return job.materials_text;
      case 'finishColour': return job.finish_colour;
      case 'startDate': return job.start_date;
      case 'endDate': return job.end_date;
      case 'scheduleDueDate': return job.schedule_due_date;
      case 'delCollection': return job.delivery_collection_date;
      case 'scheduleConfirmed': return job.schedule_confirmed;
      case 'invoiceSent': return job.invoice_sent;
      case 'stockAvailable': return job.stock_available;
      case 'contacted': return job.contacted;
      case 'locationCode': return job.location_code;
      case 'notes': return job.notes;
      case 'selectedProcesses': 
        // Transform processes to the format expected by the main form
        if (job.processes && Array.isArray(job.processes)) {
          return job.processes.map((process: any) => {
            const processInfo = ALL_MANUFACTURING_PROCESSES.find(p => 
              p.name === (process.process?.name || process.name) ||
              p.id === (process.process?.id || process.id)
            );
            
            return {
              processId: process.process?.id || process.id,
              name: process.process?.name || process.name,
              category: processInfo?.category || 'SECONDARY',
              selected: true,
              estimatedHours: parseFloat(process.estimated_hours) || 1,
              assigneeId: process.assignee?.id ? String(process.assignee.id) : null,
            };
          });
        }
        return [];
      default: return null;
    }
  };

  const handleDuplicate = () => {
    if (!sourceJob) return;

    const duplicatedData: Partial<JobFormValues> = {};
    
    Object.entries(selectedFields).forEach(([fieldKey, isSelected]) => {
      if (isSelected) {
        const value = getFieldValue(sourceJob, fieldKey);
        if (value !== undefined && value !== null && value !== '') {
          // Convert values to JobFormValues format
          switch (fieldKey) {
            case 'startDate':
            case 'endDate':
            case 'scheduleDueDate':
            case 'delCollection':
              duplicatedData[fieldKey as keyof JobFormValues] = value ? new Date(value as string) : undefined as any;
              break;
            case 'selectedProcesses':
              // Convert processes - simplified for now, will be handled in main component
              if (Array.isArray(value) && value.length > 0) {
                duplicatedData[fieldKey as keyof JobFormValues] = value as JobFormValues[keyof JobFormValues];
              }
              break;
            default:
              duplicatedData[fieldKey as keyof JobFormValues] = value as JobFormValues[keyof JobFormValues];
              break;
          }
        }
      }
    });

    console.log('Duplicate modal sending data:', duplicatedData); // Debug log
    onDuplicate(duplicatedData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedFields({});
    setSelectAllGroups({});
    onClose();
  };

  if (!sourceJob) return null;

  const selectedCount = Object.values(selectedFields).filter(Boolean).length;
  const allFields = Object.values(FIELD_GROUPS).flatMap(group => group.fields);
  const availableFieldsCount = allFields.filter(field => {
    const value = getFieldValue(sourceJob, field.key);
    return value !== undefined && value !== null && value !== '';
  }).length;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="duplicate-fields-modal"
    >
      <Box sx={{ ...modalStyle, width: 800, maxHeight: '90vh' }}>
        <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
          Copy Previous Job Data
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
          From: {sourceJob.job_number} - {sourceJob.job}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select which data categories you want to copy from the previous job. Quantity and dates will be updated to current values automatically.
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button 
            variant="contained"
            onClick={handleCopyAll}
            size="small"
          >
            Copy All
          </Button>
          <Button 
            variant="outlined"
            onClick={handleClearAll}
            size="small"
          >
            Clear All
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', ml: 2 }}>
            {selectedCount} of {availableFieldsCount} fields selected
          </Typography>
        </Stack>

        <Box sx={{ maxHeight: '450px', overflow: 'auto', mb: 3 }}>
          {Object.entries(FIELD_GROUPS).map(([groupKey, group]) => {
            const fieldsWithValues = group.fields.filter(field => {
              const value = getFieldValue(sourceJob, field.key);
              return value !== undefined && value !== null && value !== '';
            });

            if (fieldsWithValues.length === 0) return null;

            const groupFieldsSelected = group.fields.some(field => selectedFields[field.key]);
            const allGroupFieldsSelected = group.fields.every(field => 
              selectedFields[field.key] || !fieldsWithValues.some(f => f.key === field.key)
            );

            return (
              <Box key={groupKey} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Checkbox
                    checked={allGroupFieldsSelected && fieldsWithValues.length > 0}
                    indeterminate={groupFieldsSelected && !allGroupFieldsSelected}
                    onChange={() => handleGroupToggle(groupKey)}
                    color="primary"
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'primary.main' }}>
                      {group.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {group.description}
                    </Typography>
                  </Box>
                </Stack>
                
                <FormGroup sx={{ ml: 4 }}>
                  <Box>
                    {fieldsWithValues.map((field) => {
                      const value = getFieldValue(sourceJob, field.key);
                      let displayValue = '';
                      
                      if (field.key === 'selectedProcesses' && Array.isArray(value)) {
                        displayValue = `${value.length} processes configured`;
                      } else if (field.key.includes('Date') && value) {
                        displayValue = new Date(value as string).toLocaleDateString();
                      } else if (typeof value === 'boolean') {
                        displayValue = value ? 'Yes' : 'No';
                      } else {
                        displayValue = String(value);
                      }

                      return (
                        <Box key={field.key} sx={{ mb: 1 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedFields[field.key] || false}
                                onChange={() => handleFieldToggle(field.key)}
                                size="small"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {field.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {displayValue.length > 60 ? `${displayValue.substring(0, 60)}...` : displayValue}
                                </Typography>
                              </Box>
                            }
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </FormGroup>
              </Box>
            );
          })}
        </Box>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleDuplicate}
            disabled={selectedCount === 0}
          >
            Copy Selected Data ({selectedCount})
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
