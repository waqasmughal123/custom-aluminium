import { BaseModel } from './index';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

// Nested interfaces for processes and documents
export interface WorkshopProcess extends BaseModel {
  name: string;
  process_type: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

// Process update request interface
export interface UpdateProcessRequest {
  name: string;
  process_type: 'cut' | 'weld' | 'assemble' | 'finish' | 'inspect' | 'package';
  description: string;
  is_active: boolean;
  estimated_hours?: number;
}

// Job Process for job creation
export interface CreateJobProcess {
  name?: string;
  assignee_id?: string;
  estimated_hours: number | string;
  actual_hours?: number | string;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETE' | 'ON_HOLD' | 'CANCELLED' | 'PENDING';
  description?: string;
  started_at?: string;
  completed_at?: string;
}

// Interface for updating existing job processes (includes ID)
export interface UpdateJobProcess {
  id: string; // Required JobProcess ID for updating existing processes
  estimated_hours?: number | string;
  actual_hours?: number | string;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETE' | 'ON_HOLD' | 'CANCELLED';
  description?: string;
  assignee_id?: string; // Optional worker assignment
  order?: number; // Process order/sequence
}

export interface Worker {
  id: string;
  user: User;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  skills: string | string[];
  hire_date?: string;
  is_active: boolean;
  created_at: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobProcess extends BaseModel {
  process: WorkshopProcess;
  assignee: Worker | null;
  estimated_hours: string;
  actual_hours: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETE' | 'ON_HOLD' | 'CANCELLED';
  description: string;
  order: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  job: string;
}

export interface JobDocument extends BaseModel {
  uploaded_by: User;
  file_url: string;
  upload_url: string;
  name: string;
  document_type: 'file' | 'link';
  file?: string; // Base64 encoded file or file reference
  url?: string; // URL for link type documents
  size?: number;
  created_at: string;
  job: string;
}

// Interface for creating job documents
export interface CreateJobDocument {
  name: string;
  document_type: 'file' | 'link';
  file?: string; // Base64 encoded file content for file uploads
  url?: string; // URL for link type documents
  size?: number; // File size in bytes
}

// Selected process structure for the new format
export interface SelectedProcessCategory {
  process_type: string;
  name?: string;
  estimated_hours: number;
  assignee_id: number | null;
  assignee_name?: string;
  description?: string;
  status?: string;
  order?: number;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  id?: string;
  actual_hours?: number;
}

export interface SelectedProcesses {
  FIRST: SelectedProcessCategory[];
  SECONDARY: SelectedProcessCategory[];
  FINAL: SelectedProcessCategory[];
}

// Job interface matching Django API response
export interface Job {
  id: string;
  job_number: string;
  job: string;
  description: string;
  status: string;
  priority: string;
  amount: string;
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
  selected_processes?: SelectedProcesses;
  created_by: User;
  assigned_to: User | null;
  processes: JobProcess[];
  documents: JobDocument[];
}

// API Response interface for Django REST framework pagination
export interface JobsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Job[];
}

// Request interfaces for creating/updating jobs
export interface CreateJobRequest {
  processes?: CreateJobProcess[];
  documents?: CreateJobDocument[];
  job: string;
  description: string;
  status: string;
  priority: string;
  amount?: string;
  quantity: number;
  material_units?: number;
  labour_units?: number;
  labour_units_elapsed?: number;
  customer: string;
  contact: string;
  customer_po?: string;
  finish_colour: string;
  start_date?: string;
  end_date?: string;
  schedule_due_date?: string;
  delivery_collection_date?: string;
  schedule_confirmed?: boolean;
  invoice_sent?: boolean;
  stock_available?: boolean;
  contacted?: boolean;
  materials_text?: string;
  location_code?: string;
  reference_number?: string;
  invoice?: string;
  notes?: string;
  assigned_to?: string;
}

// Separate interface for updating jobs with process IDs
export interface UpdateJobRequest {
  processes?: UpdateJobProcess[];
  documents?: CreateJobDocument[];
  job?: string;
  description?: string;
  status?: string;
  priority?: string;
  amount?: string;
  quantity?: number;
  material_units?: number;
  labour_units?: number;
  labour_units_elapsed?: number;
  customer?: string;
  contact?: string;
  customer_po?: string;
  finish_colour?: string;
  start_date?: string;
  end_date?: string;
  schedule_due_date?: string;
  delivery_collection_date?: string;
  schedule_confirmed?: boolean;
  invoice_sent?: boolean;
  stock_available?: boolean;
  contacted?: boolean;
  materials_text?: string;
  location_code?: string;
  reference_number?: string;
  invoice?: string;
  notes?: string;
  assigned_to?: string;
}

// Filters interface for job listing
export interface JobFilters {
  status?: string;
  customer?: string;
  created_by?: string;
  assigned_to?: string;
  start_date_after?: string;
  start_date_before?: string;
  end_date_after?: string;
  end_date_before?: string;
  delivery_date_from?: string;
  delivery_date_to?: string;
  search?: string;
}

// Job status and priority enums
export const JOB_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  PICNIC_BENCH: 'PICNIC_BENCH',
  COMPLETE: 'COMPLETE',
  PICKED_UP: 'PICKED_UP',
  OUTSOURCED: 'OUTSOURCED',
  URGENT: 'URGENT'
} as const;

export const JOB_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
} as const;

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];
export type JobPriority = typeof JOB_PRIORITY[keyof typeof JOB_PRIORITY];