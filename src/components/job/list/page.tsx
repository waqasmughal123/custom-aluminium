"use client";

import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileCopy as FileCopyIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Upload as UploadIcon
} from "@mui/icons-material";
import { Box, Alert, CircularProgress } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import type { CreateJobRequest, CreateJobProcess, UpdateJobRequest, UpdateJobProcess, CreateJobDocument } from '@/models/job';
import { jobApiService } from '@/services/api/jobApi';
import type { ApiError } from '@/utils/types/api';
import { useGlobalLoading } from '@/viewmodels/hooks';
import { 
  useJobs, 
  useCreateJob, 
  useUpdateJob, 
  useDeleteJob 
} from '@/viewmodels/hooks/useJobs';
import { DataTable, Button, LoadingSpinner } from '@/views/components/common';
import { useToastActions } from '@/views/components/providers';
import ImportJobModal from "../add/import";
import AddJobModal from "../add/page";
import type { JobExtended, ProcessConfigItem, DocumentConfigItem } from "../add/types";
import { columns, filters, statusColors, JobStatus, JobPriority, PROCESS_STATUS } from "../constant";
import { JobDisplay, transformJobForDisplay, transformJobForApi } from "./types";

// Interface for parsed job data from import
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

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export default function JobList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobDisplay | null>(null);
  
  const { showSuccess, showError } = useToastActions();
  const { isLoading: isGlobalLoading, loadingMessage, withLoading } = useGlobalLoading();
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchFilters, setSearchFilters] = useState<Record<string, unknown>>({});
  
  // DataTable filter states - lifted up from DataTable component
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});

  // Handle URL parameters for filtering (from dashboard navigation)
  useEffect(() => {
    if (!searchParams) return;
    
    const statusParam = searchParams.get('status');
    if (statusParam) {
      // Parse comma-separated status values
      const statusValues = statusParam.split(',');
      const initialFilters: Record<string, unknown> = {
        status: statusValues.length === 1 ? statusValues[0] : statusValues
      };
      
      // Set initial filter values for the UI
      setFilterValues(initialFilters);
      setShowFilters(true); // Show filters when coming from dashboard
      
      // Set search filters for API
      setSearchFilters(initialFilters);
    }
  }, [searchParams]);

  // Handle params change from DataTable
  const handleParamsChange = useCallback((params: { search?: string; sortField?: string; sortDirection?: string; filters?: Record<string, unknown> }) => {
    // Build new filters object
    const newFilters: Record<string, unknown> = {};
    
    // Handle search
    if (params.search !== undefined) {
      newFilters.search = params.search;
    }
    
    // Handle sorting
    if (params.sortField && params.sortDirection) {
      newFilters.sort = params.sortField;
      newFilters.order = params.sortDirection;
    }
    
    // Handle filters
    if (params.filters) {
      Object.assign(newFilters, params.filters);
    }
    
    // Always update searchFilters - this handles both adding filters and clearing them
    setSearchFilters(newFilters);
    setPage(1); // Reset page when filters change
  }, []);

  const { 
    data: jobsResponse, 
    isLoading, 
    error, 
    refetch,
    isFetching
  } = useJobs({ 
    ...searchFilters, 
    page, 
    limit: pageSize 
  });
  
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();

  const jobs: JobDisplay[] = useMemo(() => {
    if (!jobsResponse?.results) return [];
    return jobsResponse.results.map(transformJobForDisplay);
  }, [jobsResponse]);

  const resetPagination = () => {
    setPage(1);
  };

  const handleCheckboxChange = async (jobId: string, field: string, checked: boolean) => {
    await withLoading(async () => {
      try {
        const fieldMapping: Record<string, string> = {
          'scheduleConfirmed': 'schedule_confirmed',
          'invoiceSent': 'invoice_sent',
          'contacted': 'contacted',
          'stockAvailable': 'stock_available'
        };

        const apiFieldName = fieldMapping[field] || field;
        const updateData = { [apiFieldName]: checked };
        
        await updateJobMutation.mutateAsync({ id: jobId, data: updateData });
      
        const fieldDisplayName = field === 'scheduleConfirmed' ? 'Schedule' : 
                                field === 'invoiceSent' ? 'Invoice' :
                                field === 'contacted' ? 'Contacted' :
                                field === 'stockAvailable' ? 'Stock Available' : field;
      
        showSuccess(`${fieldDisplayName} ${checked ? 'marked' : 'unmarked'} successfully`);
        
      } catch (error: unknown) {
        const apiError = error as ApiError;
        const errorMessage = apiError?.message || 'Failed to update job. Please try again.';
        showError(`Update failed: ${errorMessage}`);
      }
    }, `Updating ${field}...`);
  };

  const handleAddJob = async (newJobData: Record<string, unknown>) => {
    await withLoading(async () => {
      try {
        const jobData = transformJobForApi(newJobData);
        
        const processes = newJobData.processes as ProcessConfigItem[];
        if (processes && processes.length > 0) {
          const jobProcesses: CreateJobProcess[] = processes.map((process) => ({
            name: process.name,
            assignee_id: process.assigneeId || undefined,
            estimated_hours: process.estimatedHours || 0,
            actual_hours: 0,
            status: (process.status as CreateJobProcess['status']) || 'TODO',
            description: process.description
          }));
          
          jobData.processes = jobProcesses;
        }

        const documents = newJobData.documents as DocumentConfigItem[];
        if (documents && documents.length > 0) {
          const jobDocuments = await Promise.all(documents.map(async (doc) => {
            const transformedDoc: CreateJobDocument = {
              name: doc.name,
              document_type: doc.document_type,
            };

            if (doc.document_type === 'file' && doc.file) {
              if (doc.file instanceof File) {
                transformedDoc.file = await fileToBase64(doc.file);
                transformedDoc.size = doc.file.size;
              } else {
                transformedDoc.file = doc.file;
                transformedDoc.size = doc.size;
              }
            } else if (doc.document_type === 'link' && doc.url) {
              transformedDoc.url = doc.url;
            }

            return transformedDoc;
          }));
          
          (jobData as CreateJobRequest).documents = jobDocuments;
        }
        
        const createdJob = await createJobMutation.mutateAsync(jobData as CreateJobRequest);
        
        const processCount = processes?.length || 0;
        const documentCount = documents?.length || 0;
        let successMessage = `Job "${createdJob.job_number}" created successfully`;
        
        if (processCount > 0 && documentCount > 0) {
          successMessage += ` with ${processCount} processes and ${documentCount} documents!`;
        } else if (processCount > 0) {
          successMessage += ` with ${processCount} processes!`;
        } else if (documentCount > 0) {
          successMessage += ` with ${documentCount} documents!`;
        } else {
          successMessage += '!';
        }
        
        showSuccess(successMessage);
        setIsAddModalOpen(false);
        resetPagination();
      } catch (error: unknown) {
        const apiError = error as ApiError;
        let errorMessage = 'Failed to create job. Please try again.';
        
        if (apiError?.details) {
          const fieldErrors = Object.entries(apiError.details)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = `Validation errors: ${fieldErrors}`;
        } else if (apiError?.message) {
          errorMessage = apiError.message;
        }
        
        showError(errorMessage);
      }
    }, 'Creating job...');
  };

  const handleImportJobs = async (jobs: ParsedJobData[]) => {
    try {
      for (const jobData of jobs) {
        const createData = {
          job: jobData.job,
          description: jobData.description,
          status: jobData.status || 'NOT_STARTED',
          priority: jobData.priority || 'MEDIUM',
          amount: jobData.amount || undefined,
          quantity: jobData.quantity || 1,
          material_units: parseFloat(jobData.materialUnits) || 0,
          labour_units: parseFloat(jobData.labourUnits) || 0,
          labour_units_elapsed: parseFloat(jobData.labourUnitsElapsed) || 0,
          customer: jobData.customer,
          contact: jobData.contact,
          customer_po: jobData.customerPO || '',
          finish_colour: jobData.finishColour,
          materials_text: jobData.materialsText,
          location_code: jobData.locationCode || '',
          notes: jobData.notes || '',
          schedule_confirmed: false,
          invoice_sent: false,
          stock_available: false,
          contacted: false,
          user: {
            id: '',
            email: '',
            first_name: '',
            last_name: '',
            role: 'worker',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await createJobMutation.mutateAsync(createData);
      }
      
      showSuccess(`Successfully imported ${jobs.length} jobs!`);
      setIsImportModalOpen(false);
      resetPagination();
    } catch (error) {
      console.error('Error importing jobs:', error);
      showError('Failed to import jobs. Please try again.');
      throw error;
    }
  };

  const handleEditJob = async (job: JobDisplay) => {
    await withLoading(async () => {
      try {
        const fullJobData = await jobApiService.getJobById(String(job.id));
        setEditingJob(fullJobData as unknown as JobDisplay);
        setIsEditModalOpen(true);
      } catch {
        const originalJob = jobsResponse?.results.find(apiJob => apiJob.id === job.id);
        if (originalJob) {
          setEditingJob(originalJob as unknown as JobDisplay);
        } else {
          setEditingJob(job);
        }
        setIsEditModalOpen(true);
        showError('Failed to load job processes. You can still edit the job but processes may not be available.');
      }
    }, 'Loading job data...');
  };

  const handleUpdateJob = async (updatedJobData: JobExtended) => {
    if (!editingJob) return;
    await withLoading(async () => {
      try {
        const jobData = transformJobForApi(updatedJobData as unknown as Record<string, unknown>);
        
        const processes = (updatedJobData as unknown as Record<string, unknown>).processes as ProcessConfigItem[];
        
        if (processes && processes.length > 0) {
          const existingProcesses = processes.filter(process => process.id);
          
          if (existingProcesses.length > 0) {
            const jobProcesses: UpdateJobProcess[] = existingProcesses.map((process) => ({
              id: process.id!,
              estimated_hours: process.estimatedHours || 0,
              actual_hours: process.actualHours || 0,
              status: (process.status as UpdateJobProcess['status']) || 'TODO',
              description: process.description || '',
              assignee_id: process.assigneeId || undefined,
            }));
            
            (jobData as Record<string, unknown>).processes = jobProcesses;
          }
        }

        const documents = (updatedJobData as unknown as Record<string, unknown>).documents as DocumentConfigItem[];
        if (documents && documents.length > 0) {
          const jobDocuments = await Promise.all(documents.map(async (doc) => {
            const transformedDoc: CreateJobDocument = {
              name: doc.name,
              document_type: doc.document_type,
            };

            if (doc.document_type === 'file' && doc.file) {
              if (doc.file instanceof File) {
                transformedDoc.file = await fileToBase64(doc.file);
                transformedDoc.size = doc.file.size;
              } else {
                transformedDoc.file = doc.file;
                transformedDoc.size = doc.size;
              }
            } else if (doc.document_type === 'link' && doc.url) {
              transformedDoc.url = doc.url;
            }

            return transformedDoc;
          }));
          
          (jobData as Record<string, unknown>).documents = jobDocuments;
        }
        
        const updatedJob = await updateJobMutation.mutateAsync({ id: String(editingJob.id), data: jobData as UpdateJobRequest });
        
        const processCount = processes?.length || 0;
        const documentCount = documents?.length || 0;
        let successMessage = `Job "${updatedJob.job_number}" updated successfully`;
        
        if (processCount > 0 && documentCount > 0) {
          successMessage += ` with ${processCount} processes and ${documentCount} documents!`;
        } else if (processCount > 0) {
          successMessage += ` with ${processCount} processes!`;
        } else if (documentCount > 0) {
          successMessage += ` with ${documentCount} documents!`;
        } else {
          successMessage += '!';
        }
        showSuccess(successMessage);
        
        setIsEditModalOpen(false);
        setEditingJob(null);
      } catch (error: unknown) {
        const apiError = error as ApiError;
        let errorMessage = 'Failed to update job. Please try again.';
        
        if (apiError?.details) {
          const fieldErrors = Object.entries(apiError.details)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = `Validation errors: ${fieldErrors}`;
        } else if (apiError?.message) {
          errorMessage = apiError.message;
        }
        
        showError(errorMessage);
      }
    }, 'Updating job...');
  };

  const handleDeleteJob = async (job: JobDisplay) => {
    await withLoading(async () => {
      try {
        await deleteJobMutation.mutateAsync(String(job.id));
        showSuccess(`Job "${job.job_number}" deleted successfully!`);
      } catch (error: unknown) {
        const apiError = error as ApiError;
        const errorMessage = apiError?.message || 'Failed to delete job. Please try again.';
        showError(`Delete failed: ${errorMessage}`);
      }
    }, 'Deleting job...');
  };

  const handleDuplicateJob = async (job: JobDisplay) => {
    await withLoading(async () => {
      try {
        // Fetch the complete job data with processes and documents
        const fullJobData = await jobApiService.getJobById(String(job.id));
        
        // Prepare the job data for duplication - include ALL fields from original job
        const duplicateJobData: Record<string, unknown> = {
          // ALL job fields from Job interface (excluding only unique/system fields)
          // Excluded: id, job_number, created_at, updated_at (auto-generated)
          
          // Basic job information
          job: `${fullJobData.job} (Copy)`, // Add "Copy" to distinguish
          description: fullJobData.description,
          status: JobStatus.includes(fullJobData.status) 
            ? fullJobData.status 
            : 'NOT_STARTED', // Validate status and default to NOT_STARTED if invalid
          priority: JobPriority.includes(fullJobData.priority) 
            ? fullJobData.priority 
            : 'MEDIUM', // Validate priority and default to MEDIUM if invalid
          amount: fullJobData.amount,
          quantity: fullJobData.quantity,
          
          // Units and measurements
          material_units: fullJobData.material_units,
          labour_units: fullJobData.labour_units,
          labour_units_elapsed: fullJobData.labour_units_elapsed, // Keep original elapsed time
          
          // Customer information
          customer: fullJobData.customer,
          contact: fullJobData.contact,
          customer_po: fullJobData.customer_po,
          
          // Product specifications
          finish_colour: fullJobData.finish_colour,
          materials_text: fullJobData.materials_text,
          
          // Dates
          start_date: fullJobData.start_date,
          end_date: fullJobData.end_date,
          schedule_due_date: fullJobData.schedule_due_date,
          delivery_collection_date: fullJobData.delivery_collection_date,
          
          // Status flags - keep original values
          schedule_confirmed: fullJobData.schedule_confirmed,
          invoice_sent: fullJobData.invoice_sent,
          stock_available: fullJobData.stock_available,
          contacted: fullJobData.contacted,
          
          // References and metadata
          location_code: fullJobData.location_code,
          reference_number: fullJobData.reference_number,
          invoice: fullJobData.invoice, // Keep original invoice reference
          notes: fullJobData.notes,
          
          // Assignment
          assigned_to: fullJobData.assigned_to?.id || null,
        };

        // Include processes if they exist - keep ALL original process data
        if (fullJobData.processes && Array.isArray(fullJobData.processes)) {
          const processesForDuplicate = (fullJobData.processes as unknown as Record<string, unknown>[]).map((jobProcess) => {
            const process = jobProcess.process as Record<string, unknown>;
            const assignee = jobProcess.assignee as Record<string, unknown> | null;
            
            return {
              // Process identification
              name: String(process.name),
              
              // Assignment and timing - keep original values
              assignee_id: assignee?.id ? String(assignee.id) : null,
              estimated_hours: parseFloat(String(jobProcess.estimated_hours)) || 0,
              actual_hours: parseFloat(String(jobProcess.actual_hours)) || 0, // Keep original actual hours
              
              // Status and workflow - keep original values with validation
              status: PROCESS_STATUS.includes(String(jobProcess.status)) 
                ? String(jobProcess.status) 
                : 'TODO', // Validate process status and default to TODO if invalid
              description: String(jobProcess.description || ''),
              
              // Timestamps - keep if they exist
              started_at: jobProcess.started_at ? String(jobProcess.started_at) : undefined,
              completed_at: jobProcess.completed_at ? String(jobProcess.completed_at) : undefined,
            };
          });
          duplicateJobData.processes = processesForDuplicate;
        }

        // Include documents if they exist (excluding file content - only structure)
        if (fullJobData.documents && Array.isArray(fullJobData.documents)) {
          const documentsForDuplicate = (fullJobData.documents as unknown as Record<string, unknown>[]).map((jobDocument) => {
            const baseDoc = {
              name: `${String(jobDocument.name)} (Copy)`, // Add "Copy" to distinguish
              document_type: String(jobDocument.document_type),
            };

            // Handle different document types
            if (jobDocument.document_type === 'link' && jobDocument.url) {
              return {
                ...baseDoc,
                url: String(jobDocument.url),
              };
            } else if (jobDocument.document_type === 'file') {
              // For file documents, we'll create a reference but not duplicate the actual file
              // This is because duplicating files would require re-uploading them
              return {
                ...baseDoc,
                document_type: 'link', // Convert to link type
                url: jobDocument.file_url ? String(jobDocument.file_url) : undefined,
              };
            }
            return baseDoc;
          }).filter(doc => 'url' in doc && doc.url); // Only include documents with URLs
          
          if (documentsForDuplicate.length > 0) {
            duplicateJobData.documents = documentsForDuplicate;
          }
        }

        // Debug: Log the data being sent to the API
        console.log('Original job data:', fullJobData);
        console.log('Duplicate job data being sent to API:', duplicateJobData);
        
        // Create the duplicated job using the create API
        const duplicatedJob = await createJobMutation.mutateAsync(duplicateJobData as unknown as CreateJobRequest);
        
        const processCount = duplicateJobData.processes ? (duplicateJobData.processes as unknown[]).length : 0;
        const documentCount = duplicateJobData.documents ? (duplicateJobData.documents as unknown[]).length : 0;
        
        let successMessage = `Job duplicated as "${duplicatedJob.job_number}" with all original data`;
        if (processCount > 0 && documentCount > 0) {
          successMessage += ` including ${processCount} processes and ${documentCount} document references!`;
        } else if (processCount > 0) {
          successMessage += ` including ${processCount} processes!`;
        } else if (documentCount > 0) {
          successMessage += ` including ${documentCount} document references!`;
        } else {
          successMessage += '!';
        }
        
        showSuccess(successMessage);
        resetPagination();
      } catch (error: unknown) {
        const apiError = error as ApiError;
        let errorMessage = 'Failed to duplicate job. Please try again.';
        
        if (apiError?.details) {
          // Handle field-specific errors from Django
          const fieldErrors = Object.entries(apiError.details)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = `Validation errors: ${fieldErrors}`;
        } else if (apiError?.message) {
          errorMessage = apiError.message;
        }
        
        showError(`Duplicate failed: ${errorMessage}`);
      }
    }, 'Duplicating job...');
  };

  // Table actions
  const actions = [
    {
      icon: <VisibilityIcon fontSize="small" />,
      tooltip: "View Details",
      onClick: (row: JobDisplay) => router.push(`/job/view/${row.id}`),
      color: 'primary' as const
    },
    {
      icon: <EditIcon fontSize="small" />,
      tooltip: "Edit",
      onClick: (row: JobDisplay) => handleEditJob(row),
      color: 'default' as const
    },
    {
      icon: <FileCopyIcon fontSize="small" />,
      tooltip: "Duplicate",
      onClick: (row: JobDisplay) => handleDuplicateJob(row),
      color: 'default' as const
    },
    {
      icon: <DeleteIcon fontSize="small" />,
      tooltip: "Delete",
      onClick: (row: JobDisplay) => handleDeleteJob(row),
      color: 'error' as const
    }
  ];

  // Row styling based on status
  const getRowStyle = (row: JobDisplay) => ({
    backgroundColor: statusColors[row.status as keyof typeof statusColors]?.background
  });

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Failed to load jobs: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: 'calc(100vh - 64px)', // Allow content to expand beyond viewport
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with Add Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        flexShrink: 0,
        px: 3,
        pt: 3
      }}>
        <Box />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<UploadIcon />}
            onClick={() => setIsImportModalOpen(true)}
            disabled={createJobMutation.isPending}
          >
            Import Jobs
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsAddModalOpen(true)}
            sx={{ alignSelf: 'flex-end' }}
            disabled={createJobMutation.isPending}
          >
            {createJobMutation.isPending ? 'Creating...' : 'Add Job'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ 
        width: '100%',
        maxWidth: '100%',
        px: 3,
        pb: 3,
        height: 'auto'
      }}>
        <DataTable<JobDisplay>
          title={`Jobs (${jobsResponse?.count || 0})`}
          data={jobs}
          columns={columns(handleCheckboxChange)}
          filters={filters}
          actions={actions}
          searchFields={['jobNumber', 'job', 'customer']}
          searchPlaceholder="Search by job number, description, or customer..."
          getRowStyle={getRowStyle}
          // Server-side pagination props
          apiMode={true}
          loading={isLoading || isFetching}
          total={jobsResponse?.count || 0}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 25, 50]}
          // External pagination control
          currentPage={page}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(1);
          }}
          // External filter state control
          externalSearchTerm={searchTerm}
          externalShowFilters={showFilters}
          externalFilterValues={filterValues}
          onSearchTermChange={setSearchTerm}
          onShowFiltersChange={setShowFilters}
          onFilterValuesChange={setFilterValues}
          onParamsChange={handleParamsChange}
          dense={true}
          stickyHeader={true}
        />
      </Box>

      {/* Add Job Modal */}
      <AddJobModal
        open={isAddModalOpen}
        mode="add"
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddJob}
      />

      {/* Edit Job Modal */}
      <AddJobModal
        open={isEditModalOpen}
        mode="edit"
        job={editingJob as unknown as JobExtended || undefined}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handleAddJob} // Not used in edit mode
        onUpdate={handleUpdateJob}
      />

      {/* Import Job Modal */}
      <ImportJobModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportJobs}
      />
      
      {/* Global Loading Spinner */}
      <LoadingSpinner 
        open={isGlobalLoading} 
        message={loadingMessage}
        zIndex={10000}
      />
    </Box>
  );
} 
