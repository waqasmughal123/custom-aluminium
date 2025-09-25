import type { Job } from '@/models/job';

// Job extended type for the modal (same as Job from API)
export type JobExtended = Job;

// Document interface
export interface DocumentLink {
  id: string;
  jobId: string;
  name: string;
  url?: string; // For link type documents
  file?: string; // For file uploads (base64 or file reference)
  file_url?: string; // S3 URL for existing files from API
  document_type: 'file' | 'link';
  type: "LINK" | "FILE"; // Keep for backward compatibility
  size?: number;
  createdAt: Date;
  _file?: File; // Temporary file object for uploads
  _isPending?: boolean;
  _isExisting?: boolean; // Mark existing documents (read-only)
}

// Interface for document form data
export interface DocumentConfigItem {
  id?: string; // For existing documents (updates)
  name: string;
  document_type: 'file' | 'link';
  file?: File | string; // File object or base64 string
  url?: string; // URL for link type documents
  size?: number; // File size in bytes
}

// Priority options
export const JobPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM', 
  HIGH: 'HIGH'
} as const;

// Manufacturing process interface
export interface ManufacturingProcess {
  id: string;
  name: string;
  category: 'FIRST' | 'SECONDARY' | 'FINAL';
  description: string;
}

// Selected process for job creation
export interface SelectedProcess {
  processId: string;
  name: string;
  category: 'FIRST' | 'SECONDARY' | 'FINAL';
  selected: boolean;
  estimatedHours: number;
  assigneeId: string | null;
}

// Legacy process item interface (for backward compatibility)
export interface ProcessConfigItem {
  id?: string; // JobProcess ID for existing processes (for updates)
  processId: string; // WorkshopProcess ID (process template)
  name: string;
  order: number;
  estimatedHours: number;
  actualHours?: number; // Actual hours worked on the process
  assigneeId: string | null;
  description?: string;
  status?: string;
}

// Workshop process interface
export interface WorkshopProcess {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

// Worker interface
export interface Worker {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  skills: string | string[];
  is_active: boolean;
}

export interface AddJobModalProps {
  open: boolean;
  mode: "add" | "edit";
  job?: JobExtended;
  onClose: () => void;
  onSubmit: (job: Omit<JobExtended, 'id'>) => void;
  onUpdate?: (job: JobExtended) => void;
}

// Update CreateJobData to include processes
export interface CreateJobData {
  job: string;
  description: string;
  status: string;
  priority: string;
  amount?: number;
  quantity: number;
  materialUnits?: number;
  labourUnits?: number;
  labourUnitsElapsed?: number;
  customer: string;
  contact: string;
  customerPO?: string;
  startDate?: Date;
  endDate?: Date;
  scheduleDueDate?: Date;
  scheduleConfirmed: boolean;
  finishColour: string;
  invoice?: string;
  invoiceSent: boolean;
  stockAvailable: boolean;
  contacted: boolean;
  delCollection?: Date;
  locationCode?: string;
  notes?: string;
  materialsText: string;
  selectedProcesses?: SelectedProcess[]; // Array of selected processes with details
  processes?: {
    id?: string;
    processId: string;
    order: number;
    estimatedHours: number;
    assigneeId: string | null;
    processNumber?: number;
  }[];
}

// Animation variants
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}; 