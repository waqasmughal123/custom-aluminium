
"use client";

import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import React, { useState, useRef } from "react";
import { useToastActions, useGlobalLoading } from '@/viewmodels/hooks';
import { modalStyle } from './constants';
import * as XLSX from 'xlsx'; // Import xlsx library

// Interface for parsed job data remains the same
interface ParsedJobData {
  job: string;
  description: string;
  customer: string;
  contact: string;
  quantity: number;
  materialUnits: string;
  labourUnits: string;
  labourUnitsElapsed: string;
  materialsText: string;
  finishColour: string;
  status: string;
  priority: string;
  amount?: string;
  customerPO?: string;
  locationCode?: string;
  notes?: string;
}

interface ImportJobModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (jobs: ParsedJobData[]) => Promise<void>;
}

// Updated parser function for Excel files
const parseExcelFile = (file: File): Promise<ParsedJobData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length < 2) {
          resolve([]);
          return;
        }

        const headers = jsonData[0].map((h: any) => String(h).trim());
        const jobs: ParsedJobData[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;
          
          const values = row.map((v: any) => (v !== undefined && v !== null) ? String(v).trim() : '');
          const job: Partial<ParsedJobData> = {};
          
          // Map Excel columns to job fields
          headers.forEach((header, index) => {
            const value = values[index] || '';
            switch (header.toLowerCase()) {
              case 'job':
              case 'job title':
              case 'title':
                job.job = value;
                break;
              case 'description':
                job.description = value;
                break;
              case 'customer':
                job.customer = value;
                break;
              case 'contact':
                job.contact = value;
                break;
              case 'quantity':
                job.quantity = parseInt(value) || 1;
                break;
              case 'material units':
              case 'materialunits':
                job.materialUnits = value;
                break;
              case 'labour units':
              case 'labourunits':
                job.labourUnits = value;
                break;
              case 'labour units elapsed':
              case 'labourunitselapsed':
                job.labourUnitsElapsed = value;
                break;
              case 'materials':
              case 'materials text':
              case 'materialstext':
                job.materialsText = value;
                break;
              case 'finish colour':
              case 'finishcolour':
                job.finishColour = value;
                break;
              case 'status':
                job.status = value || 'NOT_STARTED';
                break;
              case 'priority':
                job.priority = value || 'MEDIUM';
                break;
              case 'amount':
                job.amount = value;
                break;
              case 'customer po':
              case 'customerpo':
                job.customerPO = value;
                break;
              case 'location code':
              case 'locationcode':
                job.locationCode = value;
                break;
              case 'notes':
                job.notes = value;
                break;
            }
          });
          
          // Validate required fields
          if (job.job && job.description && job.customer && job.contact && 
              job.materialUnits && job.labourUnits && job.labourUnitsElapsed && 
              job.materialsText && job.finishColour) {
            jobs.push(job as ParsedJobData);
          }
        }
        
        resolve(jobs);
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please check the format.'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export default function ImportJobModal({ 
  open, 
  onClose, 
  onImport 
}: ImportJobModalProps): React.JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedJobs, setParsedJobs] = useState<ParsedJobData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToastActions();
  const { withLoading } = useGlobalLoading();

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setParsedJobs([]);
    
    // Updated to accept Excel files
    const allowedTypes = ['.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      setError('Please select an Excel file (.xlsx or .xls)');
      return;
    }
    
    try {
      setIsProcessing(true);
      const jobs = await parseExcelFile(file);
      setParsedJobs(jobs);
      
      if (jobs.length === 0) {
        setError('No valid job data found in the file');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleImport = async () => {
    if (parsedJobs.length === 0) return;
    
    try {
      await withLoading(async () => {
        await onImport(parsedJobs);
        showSuccess(`Successfully imported ${parsedJobs.length} jobs!`);
        handleClose();
      }, 'Importing jobs...');
    } catch (error) {
      showError('Failed to import jobs. Please try again.');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParsedJobs([]);
    setError(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="import-jobs-modal"
    >
      <Box sx={{ ...modalStyle, width: 600, maxHeight: '80vh' }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Import Jobs from Excel
        </Typography>

        {/* File Upload Area */}
        {!selectedFile && (
          <Box
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drop your Excel file here or click to browse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports .xlsx and .xls files with job data
            </Typography>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              sx={{ mt: 2 }}
            >
              Select Excel File
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".xlsx, .xls" // Updated to accept Excel files
              style={{ display: 'none' }}
            />
          </Box>
        )}

        {/* Processing State */}
        {isProcessing && (
          <Box sx={{ my: 3 }}>
            <Typography variant="body1" gutterBottom>
              Processing file...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {/* File Info */}
        {selectedFile && !isProcessing && (
          <Box sx={{ my: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>File:</strong> {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </Typography>
              <Typography variant="body2">
                <strong>Found:</strong> {parsedJobs.length} valid job records
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          {selectedFile && (
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedFile(null);
                setParsedJobs([]);
                setError(null);
              }}
            >
              Choose Different File
            </Button>
          )}
          <Button 
            variant="contained"
            onClick={handleImport}
            disabled={parsedJobs.length === 0}
            startIcon={<CheckCircleIcon />}
          >
            Import {parsedJobs.length} Jobs
          </Button>
        </Stack>

        {/* Excel Format Help */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Expected Excel Format:
          </Typography>
          <Typography variant="body2" component="div">
            Required columns: job, description, customer, contact, quantity, material units, labour units, labour units elapsed, materials text, finish colour
            <br />
            Optional columns: status, priority, amount, customer po, location code, notes
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
}
