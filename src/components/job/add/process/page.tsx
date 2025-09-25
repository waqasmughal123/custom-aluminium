"use client";

import AddIcon from "@mui/icons-material/Add";
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
} from "@mui/material";
import type { SelectChangeEvent } from '@mui/material';
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PROCESS_STATUS } from '@/components/job/constant';
import { InputText, Select, TextArea, type SelectOption } from '@/views/components/common';
import { ProcessConfigItem, Worker, itemVariants } from '../types';

interface DraggableProcessItemProps {
  process: ProcessConfigItem;
  index: number;
  onUpdate: (index: number, field: keyof ProcessConfigItem, value: string | number | null) => void;
  // onRemove: (index: number) => void;
  workers: Worker[];
  canStartProcess: boolean;
  mode: "add" | "edit";
}

function DraggableProcessItem({
  process,
  index,
  onUpdate,
  // onRemove,
  workers,
  canStartProcess,
  mode,
}: DraggableProcessItemProps) {
  const [showNoteField, setShowNoteField] = useState(!!process.description);

  // Worker options for assignee select
  const workerOptions: SelectOption[] = [
    { value: '', label: 'None' },
    ...workers
      .filter(worker => worker.is_active) // Only show active workers
      .map(worker => ({
        value: worker.id,
        label: `${worker.first_name} ${worker.last_name} (${worker.skills || 'No skills listed'})`
      }))
  ];

  // Status options
  const statusOptions: SelectOption[] = PROCESS_STATUS.map(status => ({
    value: status,
    label: status.replace(/_/g, ' ')
  }));


  // Check if process can be started (previous process must be completed)
  // Only apply workflow restrictions in edit mode
  const isProcessStartable = mode === "add" ? true : (canStartProcess || process.status === 'IN_PROGRESS' || process.status === 'COMPLETED');

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        mb: 2,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        transition: "all 0.2s ease",
        opacity: isProcessStartable ? 1 : 0.6,
        '&:hover': {
          boxShadow: 2,
        }
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Header Row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%', 
            bgcolor: 'primary.main', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}>
            {index + 1}
          </Box>
          
          <Typography variant="h6" sx={{ 
            minWidth: 120, 
            fontWeight: 600,
            color: 'text.primary'
          }}>
            {process.name}
          </Typography>
        </Box>

        {/* Form Fields Row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: 'wrap' }}>
          <InputText
            type="number"
            label="Estimated Hours"
            value={process.estimatedHours.toString()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(index, "estimatedHours", Number(e.target.value))}
            size="small"
            sx={{ width: 150 }}
            inputProps={{ min: 0.25, step: 0.25 }}
            disabled={!isProcessStartable}
          />
          
          <Select
            label="Status"
            value={process.status || "TODO"}
            options={statusOptions}
            onChange={(e: SelectChangeEvent) => onUpdate(index, "status", e.target.value)}
            FormControlProps={{ size: 'small', sx: { width: 140 } }}
            disabled={!isProcessStartable}
          />
          
          <Select
            label="Assignee"
            value={process.assigneeId || ""}
            options={workerOptions}
            onChange={(e: SelectChangeEvent) => onUpdate(index, "assigneeId", e.target.value || null)}
            FormControlProps={{ size: 'small', sx: { width: 200 } }}
            disabled={!isProcessStartable}
          />
        </Box>

        {/* Notes Section */}
        <Box sx={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
          {!showNoteField ? (
            <Button
              startIcon={<AddIcon />}
              onClick={() => setShowNoteField(true)}
              size="small"
              variant="outlined"
              disabled={!isProcessStartable}
              sx={{ 
                color: 'primary.main',
                borderColor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText'
                }
              }}
            >
              Add note
            </Button>
          ) : (
            <TextArea
              label="Note"
              value={process.description || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate(index, "description", e.target.value)}
              rows={2}
              sx={{ width: "100%", maxWidth: 600 }}
              disabled={!isProcessStartable}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
}

interface ProcessManagementProps {
  selectedProcesses: ProcessConfigItem[];
  availableProcesses: { id: string; name: string; description: string | null; isActive: boolean }[];
  workers: Worker[];
  onUpdateProcess: (index: number, field: keyof ProcessConfigItem, value: string | number | null) => void;
  // onRemoveProcess: (index: number) => void;
  onInitializeStandardProcesses: () => void;
  mode: "add" | "edit";
}

export default function ProcessManagement({
  selectedProcesses,
  workers,
  onUpdateProcess,
  // onRemoveProcess,
  onInitializeStandardProcesses,
  mode,
}: ProcessManagementProps) {
  // Initialize standard processes on component mount if no processes are selected
  useEffect(() => {
    if (selectedProcesses.length === 0) {
      onInitializeStandardProcesses();
    }
  }, [selectedProcesses.length, onInitializeStandardProcesses]);

  return (
    <Box
      sx={{ mt: 3, mb: 3 }}
      component={motion.div}
      variants={itemVariants}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          Job Processes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Standard aluminum fabrication process sequence. Assign workers and adjust estimated hours.
          {mode === "edit" && " Workflow restrictions apply in edit mode."}
        </Typography>
      </Box>

      {/* Process selection using Select component - only show if there are additional processes available */}
      {/* {processOptions.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Select
            label="Add Additional Process"
            value=""
            options={processOptions}
            onChange={(e: SelectChangeEvent) => onAddProcess(e.target.value as string)}
            disabled={loadingProcesses}
            error={!!processError}
            helperText={processError || "Add custom processes beyond the standard sequence"}
            FormControlProps={{ sx: { mb: 2 } }}
          />
        </Box>
      )} */}

      {/* Process list */}
      <Box sx={{ mb: 3 }}>
        {selectedProcesses.length === 0 && (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: "background.default",
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography color="text.secondary" variant="body1">
              Loading standard process sequence...
            </Typography>
          </Paper>
        )}

        {selectedProcesses.map((process, index) => (
          <DraggableProcessItem
            key={`process-${index}`}
            process={process}
            index={index}
            onUpdate={onUpdateProcess}
            // onRemove={onRemoveProcess}
            workers={workers}
            canStartProcess={index === 0 || selectedProcesses[index - 1].status === 'COMPLETED'}
            mode={mode}
          />
        ))}
      </Box>

      {/* Summary */}
      {selectedProcesses.length > 0 && (
        <Paper sx={{ 
          p: 3, 
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="body1" color="text.secondary">
            Total estimated hours: <strong>{selectedProcesses.reduce((sum, process) => sum + process.estimatedHours, 0).toFixed(1)} hours</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedProcesses.filter(p => p.status === 'COMPLETED').length} of {selectedProcesses.length} processes completed
          </Typography>
        </Paper>
      )}
    </Box>
  );
} 