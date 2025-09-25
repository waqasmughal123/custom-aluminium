"use client";

import {
  Box,
  Typography,
  Paper,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
  Collapse,
  Alert,
  alpha,
} from "@mui/material";
import type { SelectChangeEvent } from '@mui/material';
import { motion } from "framer-motion";
import React from "react";
import { InputText, Select, type SelectOption } from '@/views/components/common';
import type { ManufacturingProcess, SelectedProcess, Worker } from "../types";
import {
  FIRST_PROCESSES,
  SECONDARY_PROCESSES,
  FINAL_PROCESSES,
} from "../../constant";

// Validation function for process sequence
export function validateProcessSequence(selectedProcesses: SelectedProcess[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  const hasFirstProcesses = selectedProcesses.some(p => p.category === 'FIRST');
  const hasSecondaryProcesses = selectedProcesses.some(p => p.category === 'SECONDARY');
  const hasFinalProcesses = selectedProcesses.some(p => p.category === 'FINAL');

  // Rule 1: SECONDARY processes require at least one FIRST process
  if (hasSecondaryProcesses && !hasFirstProcesses) {
    errors.push('SECONDARY processes require at least one FIRST process to be selected. Please select a FIRST process (drafting, cutting, or material preparation) before selecting SECONDARY processes.');
  }

  // Rule 2: FINAL processes require at least one SECONDARY process
  if (hasFinalProcesses && !hasSecondaryProcesses) {
    errors.push('FINAL processes require at least one SECONDARY process to be selected. Please select a SECONDARY process (fabrication, welding, or finishing) before selecting FINAL processes.');
  }

  // Rule 3: If only FINAL processes are selected (which would trigger both above rules)
  if (hasFinalProcesses && !hasSecondaryProcesses && !hasFirstProcesses) {
    // Replace the individual errors with a comprehensive one
    const finalOnlyError = 'FINAL processes require the complete manufacturing sequence. Please select at least one FIRST process and one SECONDARY process before selecting FINAL processes.';
    return {
      isValid: false,
      errors: [finalOnlyError]
    };
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

interface ProcessSelectionProps {
  selectedProcesses: SelectedProcess[];
  workers: Worker[];
  onProcessToggle: (processId: string, selected: boolean) => void;
  onProcessUpdate: (processId: string, field: 'estimatedHours' | 'assigneeId', value: number | string | null) => void;
}

interface ProcessCategoryProps {
  title: string;
  description: string;
  processes: ManufacturingProcess[];
  selectedProcesses: SelectedProcess[];
  workers: Worker[];
  onProcessToggle: (processId: string, selected: boolean) => void;
  onProcessUpdate: (processId: string, field: 'estimatedHours' | 'assigneeId', value: number | string | null) => void;
  color: string;
}

function ProcessCategory({
  title,
  description,
  processes,
  selectedProcesses,
  workers,
  onProcessToggle,
  onProcessUpdate,
  color,
}: ProcessCategoryProps) {
  const selectedInCategory = selectedProcesses.filter(sp => 
    processes.some(p => p.id === sp.processId)
  );

  // Worker options for assignee select
  const workerOptions: SelectOption[] = [
    { value: '', label: 'Unassigned' },
    ...workers
      .filter(worker => worker.is_active)
      .map(worker => {
        console.log('Worker data for skills:', {
          id: worker.id,
          name: `${worker.first_name} ${worker.last_name}`,
          skills: worker.skills,
          skillsType: typeof worker.skills,
          skillsIsArray: Array.isArray(worker.skills)
        }); // Debug log
        
        let skillsText = 'No skills listed';
        
        if (worker.skills) {
          if (Array.isArray(worker.skills)) {
            skillsText = worker.skills.length > 0 ? worker.skills.join(', ') : 'No skills listed';
          } else if (typeof worker.skills === 'string' && worker.skills.trim()) {
            skillsText = worker.skills.trim();
          }
        }
        
        return {
          value: worker.id,
          label: `${worker.first_name} ${worker.last_name} (${skillsText})`
        };
      })
  ];

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        mb: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        backgroundColor: "background.paper",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: color,
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({selectedInCategory.length} of {processes.length} selected)
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <FormGroup>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {processes.map((process) => {
            const selectedProcess = selectedProcesses.find(sp => sp.processId === process.id);
            const isSelected = Boolean(selectedProcess);

            return (
              <Box key={process.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => onProcessToggle(process.id, e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {process.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {process.description}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    margin: 0,
                    padding: 1,
                    borderRadius: 1,
                    width: "100%",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                />
                
                <Collapse in={isSelected} timeout="auto" unmountOnExit>
                  <Box 
                    sx={{ 
                      ml: 4, 
                      mt: 1, 
                      p: 2, 
                      backgroundColor: alpha(color, 0.05),
                      borderRadius: 1,
                      border: `1px solid ${alpha(color, 0.2)}`,
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                      <InputText
                        type="number"
                        label="Estimated Hours"
                        value={selectedProcess?.estimatedHours?.toString() || '1'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          onProcessUpdate(process.id, 'estimatedHours', parseFloat(e.target.value) || 1)
                        }
                        size="small"
                        sx={{ width: 140 }}
                        inputProps={{ min: 0.25, step: 0.25, max: 999 }}
                      />
                      
                      <Select
                        label="Assign Worker"
                        value={selectedProcess?.assigneeId || ""}
                        options={workerOptions}
                        onChange={(e: SelectChangeEvent) => 
                          onProcessUpdate(process.id, 'assigneeId', e.target.value || null)
                        }
                        FormControlProps={{ size: 'small', sx: { minWidth: 200 } }}
                      />
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </Box>
      </FormGroup>
    </Paper>
  );
}

export default function ProcessSelection({
  selectedProcesses,
  workers,
  onProcessToggle,
  onProcessUpdate,
}: ProcessSelectionProps) {
  const totalSelected = selectedProcesses.length;
  const totalProcesses = FIRST_PROCESSES.length + SECONDARY_PROCESSES.length + FINAL_PROCESSES.length;
  const totalEstimatedHours = selectedProcesses.reduce((sum, process) => sum + (process.estimatedHours || 0), 0);
  
  // Validate process sequence
  const validation = validateProcessSequence(selectedProcesses);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ mt: 3, mb: 3 }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}>
          Required Processes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select the manufacturing processes required for this job and assign estimated time and workers.
        </Typography>
        <Box sx={{ mt: 1, display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Typography variant="body2" color="primary.main">
            {totalSelected} of {totalProcesses} processes selected
          </Typography>
          {totalSelected > 0 && (
            <Typography variant="body2" color="secondary.main">
              Total estimated: {totalEstimatedHours.toFixed(1)} hours
            </Typography>
          )}
        </Box>
      </Box>

      <ProcessCategory
        title="FIRST Processes"
        description="Initial operations including drafting, cutting, and material preparation"
        processes={FIRST_PROCESSES as ManufacturingProcess[]}
        selectedProcesses={selectedProcesses}
        workers={workers}
        onProcessToggle={onProcessToggle}
        onProcessUpdate={onProcessUpdate}
        color="#2196F3" // Blue
      />

      <ProcessCategory
        title="SECONDARY Processes"
        description="Fabrication operations including forming, welding, machining, and finishing"
        processes={SECONDARY_PROCESSES as ManufacturingProcess[]}
        selectedProcesses={selectedProcesses}
        workers={workers}
        onProcessToggle={onProcessToggle}
        onProcessUpdate={onProcessUpdate}
        color="#FF9800" // Orange
      />

      <ProcessCategory
        title="FINAL Processes"
        description="Completion operations including assembly, packaging, and delivery"
        processes={FINAL_PROCESSES as ManufacturingProcess[]}
        selectedProcesses={selectedProcesses}
        workers={workers}
        onProcessToggle={onProcessToggle}
        onProcessUpdate={onProcessUpdate}
        color="#4CAF50" // Green
      />

      {/* Process Sequence Validation Errors */}
      {!validation.isValid && totalSelected > 0 && (
        <Box sx={{ mb: 3 }}>
          {validation.errors.map((error, index) => (
            <Alert 
              key={index}
              severity="error" 
              sx={{ 
                mb: index < validation.errors.length - 1 ? 2 : 0,
                '& .MuiAlert-message': {
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                }
              }}
            >
              <Typography variant="body2" component="div">
                <strong>Invalid Process Sequence:</strong> {error}
              </Typography>
            </Alert>
          ))}
        </Box>
      )}

      {totalSelected === 0 && (
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            backgroundColor: "warning.light",
            border: "1px solid",
            borderColor: "warning.main",
            borderRadius: 2,
          }}
        >
          <Typography color="warning.dark" variant="body1" sx={{ fontWeight: 500 }}>
            Please select at least one process to continue
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
