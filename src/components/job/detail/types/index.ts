export interface JobProcess {
  id: string;
  processId: string;
  order: number;
  estimatedHours: number;
  assigneeId: string | null;
  status?: string;
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