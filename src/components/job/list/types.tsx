// Import constants first
import { ALL_MANUFACTURING_PROCESSES } from '@/components/job/constant';
// Import types from models
import type { 
  Job, 
  JobProcess,
  User, 
  JobsApiResponse, 
  JobFilters, 
  CreateJobRequest, 
  UpdateJobRequest,
  UpdateJobProcess
} from '@/models/job';
import type { ProcessConfigItem } from '../add/types';

// Re-export for component usage
export type { 
  Job, 
  JobProcess,
  User, 
  JobsApiResponse, 
  JobFilters, 
  CreateJobRequest, 
  UpdateJobRequest,
  UpdateJobProcess
};

// Additional types specific to the job list component
export interface JobListProps {
  initialFilters?: JobFilters;
  onJobSelect?: (job: Job) => void;
}

// Display job interface with string index signature for DataTable compatibility
export interface JobDisplay {
  // Core properties from Job interface (transformed)
  id: string;
  job_number: string;
  job: string;
  description: string;
  status: string;
  priority: string;
  amount: number; // Transformed from string to number
  quantity: number;
  material_units: number | null;
  labour_units: number | null;
  labour_units_elapsed: number;
  customer: string;
  contact: string;
  customer_po: string | null;
  finish_colour: string;
  start_date: string;
  end_date: string;
  schedule_due_date: string | null;
  delivery_collection_date: string | null;
  schedule_confirmed: boolean;
  invoice_sent: boolean;
  stock_available: boolean;
  contacted: boolean;
  materials_text: string | null;
  location_code: string | null;
  reference_number: string | null;
  invoice: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: User;
  assigned_to: User | null;
  processes: unknown[];
  documents: unknown[];
  
  // Additional computed fields for display (camelCase versions)
  jobNumber: string;
  materialUnits: number | null;
  labourUnits: number | null;
  labourUnitsElapsed: number;
  scheduleConfirmed: boolean;
  invoiceSent: boolean;
  startDate: string;
  endDate: string;
  delCollection: string | null;
  
  // Add string index signature for DataTable compatibility
  [key: string]: unknown;
}

// Transform function to convert API response to display format
export function transformJobForDisplay(apiJob: Job): JobDisplay {
  return {
    // Core properties from API
    id: apiJob.id,
    job_number: apiJob.job_number,
    job: apiJob.job,
    description: apiJob.description,
    status: apiJob.status,
    priority: apiJob.priority,
    amount: parseFloat(apiJob.amount) || 0, // Convert string to number
    quantity: apiJob.quantity,
    material_units: apiJob.material_units,
    labour_units: apiJob.labour_units,
    labour_units_elapsed: apiJob.labour_units_elapsed,
    customer: apiJob.customer,
    contact: apiJob.contact,
    customer_po: apiJob.customer_po,
    finish_colour: apiJob.finish_colour,
    start_date: apiJob.start_date,
    end_date: apiJob.end_date,
    schedule_due_date: apiJob.schedule_due_date,
    delivery_collection_date: apiJob.delivery_collection_date,
    schedule_confirmed: apiJob.schedule_confirmed,
    invoice_sent: apiJob.invoice_sent,
    stock_available: apiJob.stock_available,
    contacted: apiJob.contacted,
    materials_text: apiJob.materials_text,
    location_code: apiJob.location_code,
    reference_number: apiJob.reference_number,
    invoice: apiJob.invoice,
    notes: apiJob.notes,
    created_at: apiJob.created_at,
    updated_at: apiJob.updated_at,
    created_by: apiJob.created_by,
    assigned_to: apiJob.assigned_to,
    processes: apiJob.processes,
    documents: apiJob.documents,
    
    // Additional computed fields for display (camelCase versions)
    jobNumber: apiJob.job_number,
    materialUnits: apiJob.material_units,
    labourUnits: apiJob.labour_units,
    labourUnitsElapsed: apiJob.labour_units_elapsed,
    scheduleConfirmed: apiJob.schedule_confirmed,
    invoiceSent: apiJob.invoice_sent,
    startDate: apiJob.start_date,
    endDate: apiJob.end_date,
    delCollection: apiJob.delivery_collection_date,
  };
}

// Transform API job processes to ProcessConfigItem format for editing
export function transformJobProcessesToForm(jobProcesses: JobProcess[]): ProcessConfigItem[] {
  return jobProcesses.map((jobProcess) => ({
    processId: jobProcess.process.id,
    name: jobProcess.process.name,
    order: jobProcess.order,
    estimatedHours: parseFloat(jobProcess.estimated_hours) || 0,
    assigneeId: jobProcess.assignee?.id || null,
    description: jobProcess.description || '',
    status: jobProcess.status,
  }));
}

// Transform function to convert display format back to API format
export function transformJobForApi(displayJob: Partial<Record<string, unknown>>): Partial<CreateJobRequest | UpdateJobRequest> {
  // Helper function to format dates
  const formatDate = (date: unknown): string | undefined => {
    if (!date) return undefined;
    if (date instanceof Date) {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    if (typeof date === 'string') {
      return date;
    }
    return undefined;
  };

  // Helper function to safely convert to number (supports decimals)
  const toNumberOrUndefined = (value: unknown): number | undefined => {
    if (value === null || value === undefined || value === '') return undefined;
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? undefined : parsed;
  };

  // Helper function to convert camelCase to snake_case for form fields
  const fieldMapping: Record<string, string> = {
    'materialUnits': 'material_units',
    'labourUnits': 'labour_units',
    'labourUnitsElapsed': 'labour_units_elapsed',
    'customerPO': 'customer_po',
    'finishColour': 'finish_colour',
    'startDate': 'start_date',
    'endDate': 'end_date',
    'scheduleDueDate': 'schedule_due_date',
    'delCollection': 'delivery_collection_date',
    'scheduleConfirmed': 'schedule_confirmed',
    'invoiceSent': 'invoice_sent',
    'stockAvailable': 'stock_available',
    'materialsText': 'materials_text',
    'locationCode': 'location_code',
    'referenceNumber': 'reference_number'
  };

  const apiJob: Partial<CreateJobRequest | UpdateJobRequest> = {};

  // Map basic string fields
  if (displayJob.job) apiJob.job = displayJob.job as string;
  if (displayJob.description) apiJob.description = displayJob.description as string;
  if (displayJob.status) apiJob.status = displayJob.status as string;
  if (displayJob.priority) apiJob.priority = displayJob.priority as string;
  if (displayJob.customer) apiJob.customer = displayJob.customer as string;
  if (displayJob.contact) apiJob.contact = displayJob.contact as string;

  // Handle amount (convert string to number for API)
  if (displayJob.amount !== undefined && displayJob.amount !== "") {
    const amountValue = toNumberOrUndefined(displayJob.amount);
    if (amountValue !== undefined) {
      apiJob.amount = amountValue.toString();
    }
  }

  // Handle numeric fields
  if (displayJob.quantity !== undefined) apiJob.quantity = displayJob.quantity as number;

  // Handle optional numeric fields (camelCase from form) - convert strings to numbers
  if (displayJob.materialUnits !== undefined && displayJob.materialUnits !== "") {
    const value = toNumberOrUndefined(displayJob.materialUnits);
    if (value !== undefined) {
      apiJob.material_units = value;
    }
  }
  if (displayJob.labourUnits !== undefined && displayJob.labourUnits !== "") {
    const value = toNumberOrUndefined(displayJob.labourUnits);
    if (value !== undefined) {
      apiJob.labour_units = value;
    }
  }
  if (displayJob.labourUnitsElapsed !== undefined && displayJob.labourUnitsElapsed !== "") {
    const value = toNumberOrUndefined(displayJob.labourUnitsElapsed);
    if (value !== undefined) {
      apiJob.labour_units_elapsed = value;
    }
  }

  // Handle optional string fields (camelCase from form)
  if (displayJob.customerPO) apiJob.customer_po = displayJob.customerPO as string;
  if (displayJob.finishColour) apiJob.finish_colour = displayJob.finishColour as string;
  if (displayJob.materialsText) apiJob.materials_text = displayJob.materialsText as string;
  if (displayJob.locationCode) apiJob.location_code = displayJob.locationCode as string;
  if (displayJob.referenceNumber) apiJob.reference_number = displayJob.referenceNumber as string;
  if (displayJob.invoice) apiJob.invoice = displayJob.invoice as string;
  if (displayJob.notes) apiJob.notes = displayJob.notes as string;

  // Handle date fields (camelCase from form)
  const startDate = formatDate(displayJob.startDate);
  if (startDate) apiJob.start_date = startDate;
  
  const endDate = formatDate(displayJob.endDate);
  if (endDate) apiJob.end_date = endDate;
  
  const scheduleDueDate = formatDate(displayJob.scheduleDueDate);
  if (scheduleDueDate) apiJob.schedule_due_date = scheduleDueDate;
  
  const deliveryDate = formatDate(displayJob.delCollection);
  if (deliveryDate) apiJob.delivery_collection_date = deliveryDate;

  // Handle boolean fields (camelCase from form)
  if (displayJob.scheduleConfirmed !== undefined) apiJob.schedule_confirmed = displayJob.scheduleConfirmed as boolean;
  if (displayJob.invoiceSent !== undefined) apiJob.invoice_sent = displayJob.invoiceSent as boolean;
  if (displayJob.stockAvailable !== undefined) apiJob.stock_available = displayJob.stockAvailable as boolean;
  if (displayJob.contacted !== undefined) apiJob.contacted = displayJob.contacted as boolean;

  // Handle selectedProcesses - convert to processes array for API
  if (displayJob.selectedProcesses && Array.isArray(displayJob.selectedProcesses)) {
    // Check if it's the new SelectedProcess[] format or old string[] format
    const selectedProcesses = displayJob.selectedProcesses as (string | Record<string, unknown>)[];
    
    if (selectedProcesses.length > 0 && typeof selectedProcesses[0] === 'object') {
      // New format: SelectedProcess[]
      const processes = (selectedProcesses as Record<string, unknown>[]).map((selectedProcess) => ({
        name: selectedProcess.name as string,
        estimated_hours: (selectedProcess.estimatedHours as number) || 1,
        assignee_id: (selectedProcess.assigneeId as string) || undefined,
        status: 'TODO' as const,
      }));
      apiJob.processes = processes;
    } else {
      // Legacy format: string[] (process IDs)
      const processes = (selectedProcesses as string[]).map((processId) => {
        const processInfo = ALL_MANUFACTURING_PROCESSES.find(p => p.id === processId);
        return {
          name: processInfo?.name || processId,
          estimated_hours: 1,
          status: 'TODO' as const,
        };
      });
      apiJob.processes = processes;
    }
  }

  // Handle snake_case fields (direct from API)
  Object.keys(displayJob).forEach(key => {
    if (key.includes('_') && !Object.values(fieldMapping).includes(key)) {
      // Direct snake_case field, pass through
      const value = displayJob[key];
      if (value !== undefined) {
        (apiJob as Record<string, unknown>)[key] = value;
      }
    }
  });

  return apiJob;
}