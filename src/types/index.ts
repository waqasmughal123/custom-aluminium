// Job related types
export interface JobExtended {
  id: string;
  job: string;
  customer: string;
  customerPO: string;
  contact: string;
  startDate: Date | null;
  endDate: Date | null;
  scheduleDueDate: Date | null;
  scheduleConfirmed: boolean;
  quantity: number;
  amount: number;
  materialUnits?: number;
  labourUnits?: number;
  labourUnitsElapsed: number;
  priority: string;
  description: string;
  notes: string;
  materialsText: string;
  finishColour: string;
  status: string;
  delCollection: Date | null;
  invoice?: string;
  invoiceSent: boolean;
  stockAvailable: boolean;
  contacted: boolean;
  locationCode?: string;
  referenceNumber?: string;
  isCompleted: boolean;
  processes: WorkshopProcess[];
  documents: DocumentLink[];
  createdAt: Date;
  updatedAt: Date;
}

// Job status constants
export const JOB_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETE: 'COMPLETE',
  URGENT: 'URGENT',
  PICKED_UP: 'PICKED_UP',
  OUTSOURCED: 'OUTSOURCED',
  PICNIC_BENCH: 'PICNIC_BENCH'
} as const;

// Job priority constants  
export const JOB_PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
} as const;

export interface WorkshopProcess {
  id: string;
  processName: string;
  assignedWorker: string;
  estimatedHours: number;
  actualHours: number;
  status: 'pending' | 'in_progress' | 'completed';
  notes: string;
  order: number;
}

export interface DocumentLink {
  id: string;
  name: string;
  type: 'file' | 'link';
  url?: string;
  file?: File;
  uploadedAt: Date;
  size?: number;
} 