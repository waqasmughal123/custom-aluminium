import type { Worker } from '@/models/job';
import type { WorkerFormValues } from '../constants';

export interface AddWorkerModalProps {
  open: boolean;
  mode: "add" | "edit";
  worker?: Worker | null;
  onClose: () => void;
  onSubmit: (data: Omit<WorkerFormValues, 'is_active' | 'hire_date'> & { 
    is_active: boolean; 
    hire_date?: string; 
  }) => Promise<void>;
  onUpdate?: (data: Partial<Worker> & { id: string }) => Promise<void>;
}

export type { WorkerFormValues } from '../constants';
