import type { Worker } from '@/models/job';

// Worker display interface for the table
export interface WorkerDisplay extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
  skills: string;
  hireDate: string;
  active: boolean;
  role: string;
  actions?: string;
}

// Transform API Worker to WorkerDisplay
export function transformWorkerForDisplay(worker: Worker): WorkerDisplay {
  return {
    id: worker.id,
    name: `${worker.first_name} ${worker.last_name}`.trim(),
    email: worker.email,
    phone: worker.phone || 'N/A',
    address: worker.address || 'N/A',
    status: worker.is_active ? 'ACTIVE' : 'INACTIVE',
    skills: Array.isArray(worker.skills) ? worker.skills.join(', ') : (worker.skills || 'No skills listed'),
    hireDate: worker.hire_date ? 
      (() => {
        try {
          return new Date(worker.hire_date).toLocaleDateString();
        } catch {
          return 'Invalid Date';
        }
      })() : 
      (() => {
        try {
          return new Date(worker.created_at).toLocaleDateString();
        } catch {
          return 'Invalid Date';
        }
      })(),
    active: worker.is_active,
    role: worker.role
  };
}
