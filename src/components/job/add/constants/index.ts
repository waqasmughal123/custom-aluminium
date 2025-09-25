import * as z from "zod";
import { type SelectOption } from '@/views/components/common';

// Modal style that preserves absolute positioning required for centering
export const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 1,
  maxHeight: "90vh",
  overflow: "auto",
};

// Status color mapping for visual indicators
export const statusColors: Record<string, { main: string; background: string }> = {
  'NOT_STARTED': {
    main: "#FFFFFF", // White
    background: "#F5F5F5", // Light gray background for visibility
  },
  'IN_PROGRESS': {
    main: "#FFEB3B", // Yellow
    background: "rgba(255, 235, 59, 0.1)",
  },
  'PICNIC_BENCH': {
    main: "#2196F3", // Blue
    background: "rgba(33, 150, 243, 0.1)",
  },
  'COMPLETE': {
    main: "#4CAF50", // Green
    background: "rgba(76, 175, 80, 0.1)",
  },
  'PICKED_UP': {
    main: "#9C27B0", // Purple
    background: "rgba(156, 39, 176, 0.1)",
  },
  'OUTSOURCED': {
    main: "#FF9800", // Orange
    background: "rgba(255, 152, 0, 0.1)",
  },
  'URGENT': {
    main: "#F44336", // Red
    background: "rgba(244, 67, 54, 0.1)",
  },
} as const;

// Status options for Select component
export const statusOptions: SelectOption[] = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PICNIC_BENCH', label: 'Picnic Bench' },
  { value: 'COMPLETE', label: 'Complete' },
  { value: 'PICKED_UP', label: 'Picked Up' },
  { value: 'OUTSOURCED', label: 'Outsourced' },
  { value: 'URGENT', label: 'Urgent' },
];

// Priority options for Select component
export const priorityOptions: SelectOption[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

// Priority colors for chips
export const priorityColors = {
  'LOW': { main: '#4CAF50', background: 'rgba(76, 175, 80, 0.1)' },
  'MEDIUM': { main: '#FF9800', background: 'rgba(255, 152, 0, 0.1)' },
  'HIGH': { main: '#F44336', background: 'rgba(244, 67, 54, 0.1)' },
};

// Job schema for form validation
export const jobSchema = z.object({
  job: z.string().min(1, "Job title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.string(),
  priority: z.string(),
  amount: z.string().optional().or(z.literal("")),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  materialUnits: z.string().min(1, "Material units are required").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Material units must be a valid positive number"),
  labourUnits: z.string().min(1, "Labour units are required").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Labour units must be a valid positive number"),
  labourUnitsElapsed: z.string().min(1, "Labour units elapsed are required").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Labour units elapsed must be a valid positive number"),
  customer: z.string().min(1, "Customer is required"),
  contact: z.string().min(1, "Contact is required"),
  customerPO: z.string().optional(),
  startDate: z.date().optional().nullable().or(z.literal(null)),
  endDate: z.date().optional().nullable().or(z.literal(null)),
  scheduleDueDate: z.date().optional().nullable().or(z.literal(null)),
  scheduleConfirmed: z.boolean().default(false),
  finishColour: z.string().min(1, "Finish/Colour is required"),
  invoice: z.string().optional(),
  invoiceSent: z.boolean().default(false),
  stockAvailable: z.boolean().default(false),
  contacted: z.boolean().default(false),
  delCollection: z.date().optional().nullable().or(z.literal(null)),
  locationCode: z.string().optional(),
  notes: z.string().optional(),
  materialsText: z.string().min(1, "Materials information is required"),
  selectedProcesses: z.array(z.object({
    processId: z.string(),
    name: z.string(),
    category: z.enum(['FIRST', 'SECONDARY', 'FINAL']),
    selected: z.boolean(),
    estimatedHours: z.coerce.number().min(0.25, "Estimated hours must be at least 0.25").max(999, "Estimated hours cannot exceed 999"),
    assigneeId: z.preprocess(val => val === "" ? null : val, z.string().nullable()),
  })).optional(),
});

export type JobFormValues = z.infer<typeof jobSchema>; 