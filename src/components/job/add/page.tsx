"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Modal, 
  Box, 
  Typography, 
  Button, 
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Job as ApiJob, SelectedProcessCategory } from '@/models/job';
import { useToastActions, useGlobalLoading } from '@/viewmodels/hooks';
import { useDeleteDocument } from '@/viewmodels/hooks/useDocuments';
import { useAllWorkers } from '@/viewmodels/hooks/useWorkers';
import { FIRST_PROCESSES, SECONDARY_PROCESSES, FINAL_PROCESSES, ALL_MANUFACTURING_PROCESSES } from '../constant';
import { modalStyle, jobSchema, JobFormValues } from './constants';
import { DocumentList, DocumentAttachments } from './documents/page';
import JobFormFields from './form/page';
import { ProcessSelection, validateProcessSequence } from './process-selection';
import type { DocumentConfigItem } from "./types";
// Utility function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data:type/subtype;base64, prefix
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};
import { 
  AddJobModalProps, 
  DocumentLink,
  SelectedProcess
} from './types';

// Transform API job data to form-compatible format
function transformApiJobToFormData(apiJob: ApiJob) {
  return {
    job: apiJob.job || "",
    description: apiJob.description || "",
    status: apiJob.status,
    priority: apiJob.priority,
    amount: apiJob.amount ? parseFloat(apiJob.amount).toString() : "",
    quantity: apiJob.quantity || 1,
    materialUnits: apiJob.material_units ? apiJob.material_units.toString() : "",
    labourUnits: apiJob.labour_units ? apiJob.labour_units.toString() : "",
    labourUnitsElapsed: apiJob.labour_units_elapsed ? apiJob.labour_units_elapsed.toString() : "0",
    materialsText: apiJob.materials_text || "",
    customer: apiJob.customer || "",
    contact: apiJob.contact || "",
    customerPO: apiJob.customer_po || "",
    startDate: apiJob.start_date ? new Date(apiJob.start_date) : null,
    endDate: apiJob.end_date ? new Date(apiJob.end_date) : null,
    scheduleDueDate: apiJob.schedule_due_date ? new Date(apiJob.schedule_due_date) : null,
    scheduleConfirmed: apiJob.schedule_confirmed || false,
    finishColour: apiJob.finish_colour || "",
    invoice: apiJob.invoice || "",
    invoiceSent: apiJob.invoice_sent || false,
    stockAvailable: apiJob.stock_available || false,
    contacted: apiJob.contacted || false,
    delCollection: apiJob.delivery_collection_date ? new Date(apiJob.delivery_collection_date) : null,
    locationCode: apiJob.location_code || "",
    notes: apiJob.notes || "",
  };
}

export default function AddJobModal({ open, mode = "add", job, onClose, onSubmit, onUpdate }: AddJobModalProps): React.JSX.Element {
  const [isLoadingDocuments] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [pendingDocuments, setPendingDocuments] = useState<
    Array<Omit<DocumentLink, "id" | "jobId" | "createdAt"> & { _file?: File }>
  >([]);
  const [existingDocuments, setExistingDocuments] = useState<DocumentLink[]>([]); // For display only

  // Process selection state
  const [selectedProcesses, setSelectedProcesses] = useState<SelectedProcess[]>([]);
  
  // Fetch workers from API
  const { data: workers = [] } = useAllWorkers();

  // Document management hooks
  const deleteDocumentMutation = useDeleteDocument();
  const { showError } = useToastActions();
  const { withLoading } = useGlobalLoading();

  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    reset,
    setError,
  } = useForm<JobFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(jobSchema) as any,
    mode: 'onChange', // Validate on every change
    reValidateMode: 'onChange', // Re-validate on every change
    defaultValues: {
      job: "",
      description: "",
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      amount: "",
      quantity: 1,
      materialUnits: "",
      labourUnits: "",
      labourUnitsElapsed: "0",
      materialsText: "",
      customer: "",
      contact: "",
      customerPO: "",
      startDate: null,
      endDate: null,
      scheduleDueDate: null,
      scheduleConfirmed: false,
      finishColour: "",
      invoice: "",
      invoiceSent: false,
      stockAvailable: false,
      contacted: false,
      delCollection: null,
      locationCode: "",
      notes: "",
      selectedProcesses: [],
    },
  });

  // Reset form when job prop changes (for edit mode)
  useEffect(() => {
    if (job && mode === "edit") {
      // Transform job data if it's coming from API (snake_case)
      const formData = transformApiJobToFormData(job as unknown as ApiJob);
      reset({
        ...formData,
        status: (formData.status as JobFormValues['status']) || 'NOT_STARTED',
        priority: (formData.priority as JobFormValues['priority']) || 'MEDIUM',
      });

      // Load selected processes if available in job data
      const apiJob = job as unknown as ApiJob;
      
      // Handle new selected_processes structure (preferred)
      if (apiJob.selected_processes && typeof apiJob.selected_processes === 'object') {
        try {
          const selectedProcessesFromApi: SelectedProcess[] = [];
          
          
          // Process each category (FIRST, SECONDARY, FINAL)
          Object.entries(apiJob.selected_processes).forEach(([category, processes]) => {
            if (Array.isArray(processes)) {
              processes.forEach((process: SelectedProcessCategory) => {
                
                // Find the process info from our constants to get the processId
                const processInfo = ALL_MANUFACTURING_PROCESSES.find(p => 
                  p.name === process.name || 
                  p.id === process.process_type ||
                  p.name.toLowerCase() === process.name?.toLowerCase()
                );
                
                if (processInfo) {
                  selectedProcessesFromApi.push({
                    processId: processInfo.id,
                    name: process.name || processInfo.name,
                    category: category as 'FIRST' | 'SECONDARY' | 'FINAL',
                    selected: true,
                    estimatedHours: parseFloat(String(process.estimated_hours)) || 1,
                    assigneeId: process.assignee_id ? String(process.assignee_id) : null,
                    status: (String(process.status) as 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED') || 'TODO',
                  });
                } else {
                  console.warn('Process not found in constants:', process);
                }
              });
            }
          });
          
          setSelectedProcesses(selectedProcessesFromApi);
        } catch (error) {
          console.error('Error loading selected_processes:', error);
          setSelectedProcesses([]);
        }
      }
      // Fallback to old processes format if new format not available
      else if (apiJob.processes && Array.isArray(apiJob.processes)) {
        try {
          // Transform job processes to selected process format
          const selectedProcessesFromApi = (apiJob.processes as unknown as Record<string, unknown>[]).map((jobProcess) => {
            const process = jobProcess.process as Record<string, unknown>;
            const assignee = jobProcess.assignee as Record<string, unknown> | null;
            
            // Find the process info to determine category
            const processInfo = ALL_MANUFACTURING_PROCESSES.find(p => p.name === String(process.name));
            
            return {
              processId: processInfo?.id || String(process.id),
              name: String(process.name),
              category: (processInfo?.category as 'FIRST' | 'SECONDARY' | 'FINAL') || 'SECONDARY',
              selected: true,
              estimatedHours: parseFloat(String(jobProcess.estimated_hours)) || 1,
              assigneeId: assignee?.id ? String(assignee.id) : null,
              status: (String(jobProcess.status) as 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED') || 'TODO',
            };
          });
          
          setSelectedProcesses(selectedProcessesFromApi);
        } catch (error) {
          console.error('Error loading job processes:', error);
          setSelectedProcesses([]);
        }
      } else {
        setSelectedProcesses([]);
      }

      // Load existing documents for display but keep pendingDocuments empty for new documents only
      if (apiJob.documents && Array.isArray(apiJob.documents)) {
        try {
          // Transform API documents to display format
          const documentsForDisplay = (apiJob.documents as unknown as Record<string, unknown>[]).map((jobDocument, index) => {
            return {
              id: String(jobDocument.id || `existing-${index}`),
              jobId: String(apiJob.id),
              name: String(jobDocument.name),
              url: jobDocument.url ? String(jobDocument.url) : undefined,
              file: jobDocument.file ? String(jobDocument.file) : undefined,
              file_url: jobDocument.file_url ? String(jobDocument.file_url) : undefined, // Use file_url from API
              document_type: String(jobDocument.document_type) as 'file' | 'link',
              type: jobDocument.document_type === 'file' ? 'FILE' as const : 'LINK' as const,
              size: jobDocument.size ? Number(jobDocument.size) : undefined,
              createdAt: new Date(String(jobDocument.created_at || new Date().toISOString())),
              _isPending: false,
              _isExisting: true, // Mark as existing for proper icon/open handling
            };
          });
          
          setExistingDocuments(documentsForDisplay);
        } catch (error) {
          console.error('Error loading existing documents:', error);
          setExistingDocuments([]);
        }
      } else {
        setExistingDocuments([]);
      }
      
      // Always start with empty pending documents (for new documents only)
      setPendingDocuments([]);
    }
  }, [job, mode, reset]);

  // Handle process selection toggle
  const handleProcessToggle = (processId: string, selected: boolean) => {
    setSelectedProcesses(prev => {
      let newProcesses: SelectedProcess[];
      
      if (selected) {
        // Find process info from constants
        const processInfo = [...FIRST_PROCESSES, ...SECONDARY_PROCESSES, ...FINAL_PROCESSES]
          .find(p => p.id === processId);
        
        if (processInfo) {
          const newProcess: SelectedProcess = {
            processId: processInfo.id,
            name: processInfo.name,
            category: processInfo.category as 'FIRST' | 'SECONDARY' | 'FINAL',
            selected: true,
            estimatedHours: 1, // Default estimated hours
            assigneeId: null, // No worker assigned initially
            status: 'TODO', // Default status
          };
          newProcesses = [...prev, newProcess];
        } else {
          newProcesses = prev;
        }
      } else {
        newProcesses = prev.filter(p => p.processId !== processId);
      }
      
      // Note: We manage selectedProcesses in component state, form will update on re-render
      
      return newProcesses;
    });
  };

  // Handle process detail updates (estimated hours, worker assignment, status)
  const handleProcessUpdate = (processId: string, field: 'estimatedHours' | 'assigneeId' | 'status', value: number | string | null) => {
    console.log(`Process update: ${field} = ${value} for process ${processId}`);
    
    setSelectedProcesses(prev => {
      const newProcesses = prev.map(process => {
        if (process.processId === processId) {
          let updatedValue = value;
          
          if (field === 'estimatedHours') {
            updatedValue = typeof value === 'number' ? value : parseFloat(String(value)) || 1;
          } else if (field === 'status') {
            updatedValue = String(value) as 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
          }
          
          const updatedProcess = {
            ...process,
            [field]: updatedValue,
          };
          
          console.log(`✅ Updated process ${process.name}: ${field} = ${updatedValue}`);
          return updatedProcess;
        }
        return process;
      });
      
      // Note: We manage selectedProcesses in component state, form will update on re-render
      return newProcesses;
    });
  };

  // Check if form is valid for submit button state
  const isFormValid = () => {
    if (selectedProcesses.length === 0) return false;
    const sequenceValidation = validateProcessSequence(selectedProcesses);
    if (!sequenceValidation.isValid) return false;
    
    // Check only for critical form errors (ignore optional field errors and selectedProcesses internal errors)
    const criticalFields = ['job', 'customer', 'contact', 'finishColour', 'materialsText', 'materialUnits', 'labourUnits', 'labourUnitsElapsed'];
    const hasCriticalErrors = criticalFields.some(field => errors[field as keyof typeof errors]);
    
    // Ignore selectedProcesses validation errors as they're handled separately
    const filteredErrors = { ...errors } as Record<string, unknown>;
    delete (filteredErrors as Record<string, unknown>).selectedProcesses;
    if ("" in filteredErrors) {
      delete (filteredErrors as Record<string, unknown>)[""]; // Remove empty field error
    }
    
    const hasOtherErrors = Object.keys(filteredErrors).some(key => !criticalFields.includes(key) && filteredErrors[key as keyof typeof filteredErrors]);
    
    return !hasCriticalErrors && !hasOtherErrors;
  };

  const handleClose = () => {
    // Reset form to default values
    reset({
      job: "",
      description: "",
      status: "NOT_STARTED",
      priority: "MEDIUM",
      amount: "",
      quantity: 1,
      materialUnits: "",
      labourUnits: "",
      labourUnitsElapsed: "",
      customer: "",
      contact: "",
      customerPO: "",
      finishColour: "",
      startDate: null,
      endDate: null,
      scheduleDueDate: null,
      scheduleConfirmed: false,
      invoiceSent: false,
      stockAvailable: false,
      contacted: false,
      delCollection: null,
      locationCode: "",
      notes: "",
      materialsText: "",
      selectedProcesses: [],
    });
    
    // Clear component state
    setSelectedProcesses([]);
    setPendingDocuments([]);
    setDocumentDialogOpen(false);
    
    // Close modal
    onClose();
  };

  const handleDeleteDocument = (index: number) => {
    const updatedDocuments = pendingDocuments.filter((_, i) => i !== index);
    setPendingDocuments(updatedDocuments);
  };



  const validateForm = (data: JobFormValues): boolean => {
    let isValid = true;

    // Check for at least one process (use state, not form data)
    if (selectedProcesses.length === 0) {
      showError("At least one process is required");
      isValid = false;
    }

    // Validate process sequence (use state, not form data)
    const sequenceValidation = validateProcessSequence(selectedProcesses);
    if (!sequenceValidation.isValid) {
      // Show the first sequence validation error
      showError(sequenceValidation.errors[0]);
      isValid = false;
    }

    // Validate required fields
    if (!data.job?.trim()) {
      setError("job", { message: "Job title is required" });
      isValid = false;
    }

    if (!data.customer?.trim()) {
      setError("customer", { message: "Customer is required" });
      isValid = false;
    }

    if (!data.contact?.trim()) {
      setError("contact", { message: "Contact is required" });
      isValid = false;
    }

    if (!data.finishColour?.trim()) {
      setError("finishColour", { message: "Finish/Colour is required" });
      isValid = false;
    }

    if (!data.materialsText?.trim()) {
      setError("materialsText", { message: "Materials description is required" });
      isValid = false;
    }

    // Note: materialUnits, labourUnits, and labourUnitsElapsed are now required fields
    // and are validated by the Zod schema

    return isValid;
  };

  const onFormSubmit = async (data: JobFormValues) => {
    if (!validateForm(data)) {
      return;
    }

    await withLoading(async () => {
      try {
        // Transform ONLY new documents (pendingDocuments) for API payload
        const transformedDocuments: DocumentConfigItem[] = await Promise.all(
          pendingDocuments.map(async (doc) => {
            const transformed: DocumentConfigItem = {
              name: doc.name,
              document_type: doc.type === 'FILE' ? 'file' as const : 'link' as const,
              url: doc.url,
              size: doc.size,
            };

            // Convert file to base64 if it's a File object
            if (doc.type === 'FILE' && doc._file instanceof File) {
              try {
                transformed.file = await fileToBase64(doc._file);
                transformed.size = doc._file.size;
              } catch {
                throw new Error(`Failed to convert file "${doc.name}" to base64`);
              }
            } else if (doc.type === 'FILE' && doc.file) {
              // File is already a string (base64 or file reference)
              transformed.file = doc.file;
            }

            return transformed;
          })
        );

      // Transform selected processes to the format expected by API
      const processesForApi = selectedProcesses.map((process) => ({
        name: process.name,
        estimated_hours: process.estimatedHours,
        assignee_id: process.assigneeId,
        status: process.status,
      }));
      
      console.log('API Payload - Processes:', processesForApi.map(p => ({ name: p.name, status: p.status })));

      // Create selected_processes object grouped by category
      const selectedProcessesByCategory = {
        FIRST: [] as Array<{
          process_type: string;
          estimated_hours: number;
          assignee_id: string | null;
          status: string;
        }>,
        SECONDARY: [] as Array<{
          process_type: string;
          estimated_hours: number;
          assignee_id: string | null;
          status: string;
        }>,
        FINAL: [] as Array<{
          process_type: string;
          estimated_hours: number;
          assignee_id: string | null;
          status: string;
        }>,
      };

      // Group selected processes by category
      selectedProcesses.forEach((process) => {
        const processDetail = {
          process_type: process.processId, // Use processId as process_type
          estimated_hours: process.estimatedHours,
          assignee_id: process.assigneeId,
          status: process.status,
        };

        selectedProcessesByCategory[process.category].push(processDetail);
      });

      const formData = {
        ...data,
        labourUnitsElapsed: mode === "add" ? "0" : data.labourUnitsElapsed, // Always start at 0 for new jobs
        selected_processes: selectedProcessesByCategory,
        processes: processesForApi, // Keep legacy format for backward compatibility
        documents: transformedDocuments,
      };


      if (mode === "edit" && job && onUpdate) {
        const apiJob = job as unknown as ApiJob;
        const dataToUpdate = {
          ...job,
          ...formData,
          startDate: formData.startDate ? formData.startDate.toISOString().split('T')[0] : apiJob.start_date,
          endDate: formData.endDate ? formData.endDate.toISOString().split('T')[0] : apiJob.end_date,
          scheduleDueDate: formData.scheduleDueDate ? formData.scheduleDueDate.toISOString().split('T')[0] : apiJob.schedule_due_date,
          delCollection: formData.delCollection ? formData.delCollection.toISOString().split('T')[0] : apiJob.delivery_collection_date,
          selected_processes: selectedProcessesByCategory, // New structured format
          processes: processesForApi, // Keep legacy format for backward compatibility
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await onUpdate(dataToUpdate as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await onSubmit(formData as any);
      }
      
      // Reset form and close modal on successful submission
      handleClose();
      } catch (error: unknown) {
        console.error('Job submission error:', error);
        
        let errorMessage = `Failed to ${mode === "edit" ? "update" : "create"} job. Please try again.`;
        
        // Extract API error messages
        if (error && typeof error === 'object') {
          // Handle Axios/API response errors
          if ('response' in error && error.response && typeof error.response === 'object') {
            const response = error.response as { status?: number; data?: Record<string, unknown> };
            
            if (response.data) {
              // Handle validation errors (field-specific errors)
              if (response.data.errors || response.data.detail || response.data.message) {
                const apiError = response.data.errors || response.data.detail || response.data.message;
                
                if (typeof apiError === 'string') {
                  errorMessage = apiError;
                } else if (typeof apiError === 'object' && apiError !== null) {
                  // Handle field validation errors
                  const fieldErrors = Object.entries(apiError)
                    .map(([field, messages]) => {
                      if (Array.isArray(messages)) {
                        return `${field}: ${messages.join(', ')}`;
                      }
                      return `${field}: ${messages}`;
                    })
                    .join('\n');
                  
                  if (fieldErrors) {
                    errorMessage = `Validation errors:\n${fieldErrors}`;
                  }
                }
              }
              
              // Handle status-specific messages
              if (response.status === 400) {
                errorMessage = `Invalid data: ${errorMessage}`;
              } else if (response.status === 401) {
                errorMessage = 'Unauthorized. Please log in again.';
              } else if (response.status === 403) {
                errorMessage = 'You do not have permission to perform this action.';
              } else if (response.status === 500) {
                errorMessage = 'Server error. Please try again later.';
              }
            }
          }
          
          // Handle regular Error objects
          if ('message' in error && typeof error.message === 'string') {
            // Check if it's a file conversion error
            if (error.message.includes('convert file')) {
              errorMessage = `File conversion failed: ${error.message}`;
            } else if (!errorMessage.includes('validation') && !errorMessage.includes('Invalid data')) {
              errorMessage = error.message;
            }
          }
        }
        
        showError(errorMessage);
      }
    }, mode === "edit" ? "Updating job..." : "Creating job...");
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="add-job-modal-title"
        aria-describedby="add-job-modal-description"
      >
        <Box sx={modalStyle}>

          <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
            {mode === "edit" ? "Edit Job" : "Add New Job"}
          </Typography>

          <form onSubmit={handleSubmit(onFormSubmit)}>
            <Stack spacing={4}>
              {/* Job Form Fields */}
              <JobFormFields 
                control={control} 
                errors={errors}
              />

              <Divider />

              {/* Process Selection */}
              <ProcessSelection
                selectedProcesses={selectedProcesses}
                workers={workers}
                onProcessToggle={handleProcessToggle}
                onProcessUpdate={handleProcessUpdate}
              />

              <Divider />

              {/* Document Management */}
              <DocumentList 
                documents={[
                  // Show existing documents (read-only)
                  ...existingDocuments.map(doc => ({
                    ...doc,
                    _isPending: false,
                    _isExisting: true, // Mark as existing for different styling
                  })),
                  // Show new documents (can be deleted)
                  ...pendingDocuments.map((doc, index) => ({
                    ...doc,
                    id: `pending-${index}`,
                    jobId: "new",
                    createdAt: new Date(),
                    _isPending: true,
                    _isExisting: false,
                  }))
                ]} 
                onAddClick={() => setDocumentDialogOpen(true)}
                onDeleteDocument={async (id: string) => {
                  if (id.startsWith('pending-')) {
                    // Delete new documents (not yet saved to server)
                    const index = parseInt(id.replace('pending-', ''));
                    handleDeleteDocument(index);
                  } else {
                    // Delete existing documents via API
                    await withLoading(async () => {
                      try {
                        await deleteDocumentMutation.mutateAsync(id);
                        
                        // Remove from existingDocuments state
                        setExistingDocuments(prev => prev.filter(doc => doc.id !== id));
                        
                      } catch {
                        showError('Failed to delete document. Please try again.');
                      }
                    }, 'Deleting document...');
                  }
                }}
                isLoading={isLoadingDocuments}
              />

            </Stack>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                variant="contained"
                disabled={!isFormValid()}
                onClick={async () => {
                  // Get form values and submit directly
                  const formValues = control._formValues;
                  await onFormSubmit(formValues as JobFormValues);
                }}
              >
                {mode === "edit" ? "Update Job" : "Create Job"}
              </Button>
            </Stack>
          </form>
        </Box>
      </Modal>

      {/* Document Attachment Dialog */}
      <Dialog 
        open={documentDialogOpen} 
        onClose={() => setDocumentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Attach Documents</DialogTitle>
        <DialogContent>
          <DocumentAttachments
            onAddDocument={async (doc) => {
              setPendingDocuments(prev => [...prev, doc]);
              setDocumentDialogOpen(false);
            }}
            isLoading={isLoadingDocuments}
            autoOpenFilePicker={false}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>


    </>
  );
}