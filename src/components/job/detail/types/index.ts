export interface JobProcess {
  id: string;
  processId: string;
  order: number;
  estimatedHours: number;
  assigneeId: string | null;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  processNumber?: number;
  process?: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    skills: string | string[];
  } | null;
  description?: string;
  createdAt?: string;
}

export interface WorkshopProcess {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface Worker {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  skills: string | null;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: 'FILE' | 'LINK';
  createdAt: string;
  jobId: string;
  size?: number;
}

export interface JobProcessesTabProps {
  job: import('@/models/job').Job;
  onUpdateProcesses: (processes: JobProcess[], fullJobData?: import('@/models/job').Job) => void;
}

export interface JobDocumentsTabProps {
  job: import('@/models/job').Job;
  onUpdateDocuments: (documents: Document[], fullJobData?: import('@/models/job').Job) => void;
}

// Timer-related interfaces
export interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  displaySeconds: number;
  totalElapsed: number;
  serverStartTime: string | null; // ISO timestamp from backend
  serverCurrentTime: string | null; // Server time for sync
  labourUnitsElapsed: number; // Previous sessions total from backend
}

export interface ActiveSession {
  start_time: string;
  current_duration_hours: number;
}

export interface TimerData {
  status: "ACTIVE" | "PAUSED" | "STOPPED";
  current_session_hours?: number;
  total_elapsed_hours?: number;
  can_pause?: boolean;
  can_resume?: boolean;
  can_start?: boolean;
  timer_start_time?: string;
  server_current_time?: string;
  labour_units_elapsed?: number;
}

export interface TimerResponse {
  timer_data?: TimerData;
  active_session?: ActiveSession;
  start_time?: string;
  current_duration_hours?: number;
  total_elapsed_hours?: number;
  status?: "ACTIVE" | "PAUSED" | "STOPPED";
}

export interface JobOverviewTabProps {
  job: import('@/models/job').Job;
  onUpdateJob: (updatedData: Partial<import('@/models/job').Job>) => void;
  isActive?: boolean;
} 