import { z } from 'zod';

// Modal styling
export const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: 800,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  overflow: 'auto',
  p: 0,
};

// Worker form validation schema
export const workerSchema = z.object({
  first_name: z.string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  last_name: z.string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  phone: z.string()
    .optional()
    .refine((val) => !val || /^[\+]?[0-9\s\-\(\)]{10,15}$/.test(val), {
      message: 'Please enter a valid phone number (10-15 digits)'
    }),
  address: z.string()
    .optional()
    .refine((val) => !val || val.length <= 200, {
      message: 'Address must be less than 200 characters'
    }),
    skills: z.array(z.enum(['Saw cutting', 'Guillotine cutting', 'Laser', 'Waterjet', 'Turret punch', 'Folding', 'TIG welding', 'MIG welding', 'Cleanup/Deburr', 'Breakout', 'Powdercoating', 'Inserts/components', 'Drilling', 'Sanding', 'Packaging', 'Delivery', 'Deburr machine operation', 'Fold setup', 'Fold repeat', 'Powder coat', 'DXF drafting/drawing', 'Assembly'], {
      message: 'Please select valid skills from the available options'
    }))
    .min(1, 'Please select at least one skill'),
  hire_date: z.date()
    .optional()
    .refine((val) => !val || val <= new Date(), {
      message: 'Hire date cannot be in the future'
    }),
  is_active: z.string()
    .min(1, 'Status is required'),
});

export type WorkerFormValues = z.infer<typeof workerSchema>;

// Type for creating a worker (matches API requirements)
export type CreateWorkerData = Omit<WorkerFormValues, 'hire_date'> & {
  hire_date?: string; // API expects string format
};


// Worker skills options - manufacturing processes
export const WORKER_SKILLS = [
  { value: 'Saw cutting', label: 'Saw cutting' },
  { value: 'Guillotine cutting', label: 'Guillotine cutting' },
  { value: 'Laser', label: 'Laser' },
  { value: 'Waterjet', label: 'Waterjet' },
  { value: 'Turret punch', label: 'Turret punch' },
  { value: 'Folding', label: 'Folding' },
  { value: 'TIG welding', label: 'TIG welding' },
  { value: 'MIG welding', label: 'MIG welding' },
  { value: 'Cleanup/Deburr', label: 'Cleanup/Deburr' },
  { value: 'Breakout', label: 'Breakout' },
  { value: 'Powdercoating', label: 'Powdercoating' },
  { value: 'Inserts/components', label: 'Inserts/components' },
  { value: 'Drilling', label: 'Drilling' },
  { value: 'Sanding', label: 'Sanding' },
  { value: 'Packaging', label: 'Packaging' },
  { value: 'Delivery', label: 'Delivery' },
  { value: 'Deburr machine operation', label: 'Deburr machine operation' },
  { value: 'Fold setup', label: 'Fold setup' },
  { value: 'Fold repeat', label: 'Fold repeat' },
  { value: 'Powder coat', label: 'Powder coat' },
  { value: 'DXF drafting/drawing', label: 'DXF drafting/drawing' },
  { value: 'Assembly', label: 'Assembly' },
];

// Status options
export const STATUS_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];
