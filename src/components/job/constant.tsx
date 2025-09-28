import { Box, Tooltip, Chip, Checkbox } from "@mui/material";
import React from 'react';
import { formatDate } from "@/utils/helpers/dateFormat";
import { TableColumn, FilterConfig } from "@/views/components/common";
import { JobDisplay } from "./list/types";

// Time formatting utility for labour units elapsed
export const formatTimeFromHours = (hours: number): string => {
  const totalSeconds = hours * 3600;
  const hoursDisplay = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${hoursDisplay.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

 
  export const JobStatus = [
    "NOT_STARTED",
    "IN_PROGRESS", 
    "PICNIC_BENCH",
    "COMPLETE",
    "PICKED_UP",
    "OUTSOURCED",
    "URGENT"
  ];

  export const JobPriority = [
    "LOW",
    "MEDIUM",
    "HIGH"
  ];

  export const statusColors = {
    NOT_STARTED: { main: "#FFFFFF", background: "#F5F5F5" },
    IN_PROGRESS: { main: "#FFEB3B", background: "rgba(255, 235, 59, 0.1)" },
    PICNIC_BENCH: { main: "#2196F3", background: "rgba(33, 150, 243, 0.1)" },
    COMPLETE: { main: "#4CAF50", background: "rgba(76, 175, 80, 0.1)" },
    PICKED_UP: { main: "#9C27B0", background: "rgba(156, 39, 176, 0.1)" },
    OUTSOURCED: { main: "#FF9800", background: "rgba(255, 152, 0, 0.1)" },
    URGENT: { main: "#F44336", background: "rgba(244, 67, 54, 0.1)" }
  };

  // Manufacturing Process Categories
  export const FIRST_PROCESSES = [
    {
      id: "dxf_drafting",
      name: "DXF drafting/drawing",
      category: "FIRST",
      description: "Create technical drawings and DXF files"
    },
    {
      id: "laser_operation",
      name: "Laser operation",
      category: "FIRST",
      description: "Laser cutting operations"
    },
    {
      id: "turret_punch",
      name: "Turret punch operation",
      category: "FIRST",
      description: "Turret punch cutting and forming"
    },
    {
      id: "waterjet_operation",
      name: "Waterjet operation",
      category: "FIRST",
      description: "Waterjet cutting operations"
    }
  ];

  export const SECONDARY_PROCESSES = [
    {
      id: "deburr_machine",
      name: "Deburr machine operation",
      category: "SECONDARY",
      description: "Machine deburring operations"
    },
    {
      id: "saw_cutting",
      name: "Saw cutting",
      category: "SECONDARY",
      description: "Manual or machine saw cutting"
    },
    {
      id: "guillotine_cutting",
      name: "Guillotine cutting",
      category: "SECONDARY",
      description: "Guillotine shearing operations"
    },
    {
      id: "deburring_manual",
      name: "Deburring (manual)",
      category: "SECONDARY",
      description: "Manual deburring and edge finishing"
    },
    {
      id: "sand",
      name: "Sand",
      category: "SECONDARY",
      description: "Sanding and surface preparation"
    },
    {
      id: "fold_setup",
      name: "Fold setup",
      category: "SECONDARY",
      description: "Press brake setup and first article"
    },
    {
      id: "fold_repeat",
      name: "Fold repeat",
      category: "SECONDARY",
      description: "Production folding operations"
    },
    {
      id: "tig_weld",
      name: "TIG weld",
      category: "SECONDARY",
      description: "TIG welding operations"
    },
    {
      id: "mig_weld",
      name: "MIG weld",
      category: "SECONDARY",
      description: "MIG welding operations"
    },
    {
      id: "drill",
      name: "Drill",
      category: "SECONDARY",
      description: "Drilling operations"
    },
    {
      id: "powder_coat",
      name: "Powder coat",
      category: "SECONDARY",
      description: "Powder coating and finishing"
    },
    {
      id: "inserts_nuts",
      name: "Inserts/nuts",
      category: "SECONDARY",
      description: "Insert installation and hardware"
    }
  ];

  export const FINAL_PROCESSES = [
    {
      id: "assembly",
      name: "Assembly",
      category: "FINAL",
      description: "Final assembly operations"
    },
    {
      id: "pack",
      name: "Pack",
      category: "FINAL",
      description: "Packaging for delivery"
    },
    {
      id: "delivery",
      name: "Delivery",
      category: "FINAL",
      description: "Delivery to customer"
    }
  ];

  // Combined process list for easy access
  export const ALL_MANUFACTURING_PROCESSES = [
    ...FIRST_PROCESSES,
    ...SECONDARY_PROCESSES,
    ...FINAL_PROCESSES
  ];

  // Legacy Standard Process Sequence (for backward compatibility)
  export const STANDARD_PROCESS_SEQUENCE = [
    {
      id: "cut",
      name: "Cut",
      description: "",
      order: 1,
      estimatedHours: 0,
      isActive: true
    },
    {
      id: "fold",
      name: "Fold",
      description: "",
      order: 2,
      estimatedHours: 0,
      isActive: true
    },
    {
      id: "weld",
      name: "Weld",
      description: "",
      order: 3,
      estimatedHours: 0,
      isActive: true
    },
    {
      id: "drill_nut",
      name: "Drill/Nut",
      description: "",
      order: 4,
      estimatedHours: 0,
      isActive: true
    },
    {
      id: "cleanup",
      name: "Cleanup",
      description: "",
      order: 5,
      estimatedHours: 0,
      isActive: true
    },
    {
      id: "powder_coat",
      name: "Powder Coat",
      description: "",
      order: 6,
      estimatedHours: 0,
      isActive: true
    },
    {
      id: "assemble",
      name: "Assemble",
      description: "",
      order: 7,
      estimatedHours: 0,
      isActive: true
    }
  ];

  // Process status options
  export const PROCESS_STATUS = [
    "TODO",
    "IN_PROGRESS", 
    "COMPLETED",
    "ON_HOLD",
    "CANCELLED"
  ];

  // Process status colors
  export const processStatusColors = {
    TODO: { main: "#F5F5F5", background: "#F5F5F5", text: "#000000" },
    IN_PROGRESS: { main: "#FFEB3B", background: "#FFEB3B", text: "#000000" },
    COMPLETE: { main: "#4CAF50", background: "#4CAF50", text: "#FFFFFF" },
    ON_HOLD: { main: "#FF9800", background: "#FF9800", text: "#FFFFFF" },
    CANCELLED: { main: "#F44336", background: "#F44336", text: "#FFFFFF" }
  };
 // Table columns configuration
  export const columns = (handleCheckboxChange: (jobId: string, field: string, checked: boolean) => void): TableColumn<JobDisplay>[] => [
    {
      id: 'jobNumber',
      label: 'Job No',
      sortable: true,
      minWidth: 100
    },
    {
      id: 'startDate',
      label: 'Date In',
      sortable: true,
      render: (value) => formatDate(value as string | null),
      minWidth: 110
    },
    {
      id: 'endDate',
      label: 'Date Due',
      sortable: true,
      render: (value) => formatDate(value as string | null),
      minWidth: 110
    },
    {
      id: 'customer',
      label: 'Customer Name',
      sortable: true,
      minWidth: 150
    },
    {
      id: 'job',
      label: 'Job',
      sortable: true,
      maxWidth: 200,
      render: (value) => (
        <Tooltip title={String(value)} arrow>
          <Box sx={{ 
            maxWidth: 200, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {String(value)}
          </Box>
        </Tooltip>
      )
    },
    {
      id: 'quantity',
      label: 'QTY',
      align: 'center',
      sortable: true,
      minWidth: 80
    },
    {
      id: 'amount',
      label: 'Amount (ex GST)',
      align: 'right',
      sortable: true,
      render: (value) => `$${(value as number)?.toFixed(2)}`,
      minWidth: 130
    },
    {
      id: 'materialUnits',
      label: 'Material Units',
      align: 'center',
      sortable: true,
      minWidth: 120
    },
    {
      id: 'labourUnits',
      label: 'Labour Units',
      align: 'center',
      sortable: true,
      minWidth: 110
    },
    {
      id: 'labourUnitsElapsed',
      label: 'Units Elapsed',
      align: 'center',
      sortable: true,
      render: (value) => formatTimeFromHours(value as number || 0),
      minWidth: 120
    },
    {
      id: 'status',
      label: 'Progress',
      sortable: true,
      render: (value) => (
        <Chip
          label={String(value).replace(/_/g, ' ')}
          size="small"
          sx={{
            backgroundColor: statusColors[value as keyof typeof statusColors]?.main,
            color: value === 'NOT_STARTED' ? '#000' : '#fff',
            border: value === 'NOT_STARTED' ? '1px solid #ccc' : 'none',
            fontWeight: 'medium'
          }}
        />
      ),
      minWidth: 130
    },
    {
      id: 'scheduleConfirmed',
      label: 'Scheduled',
      align: 'center',
      sortable: true,
      render: (value, row) => (
        <Checkbox
          checked={Boolean(value)}
          onChange={(e) => handleCheckboxChange(String(row.id), 'scheduleConfirmed', e.target.checked)}
          size="small"
          color="primary"
        />
      ),
      minWidth: 100
    },
    {
      id: 'invoiceSent',
      label: 'Invoice',
      align: 'center',
      sortable: true,
      render: (value, row) => (
        <Checkbox
          checked={Boolean(value)}
          onChange={(e) => handleCheckboxChange(String(row.id), 'invoiceSent', e.target.checked)}
          size="small"
          color="primary"
        />
      ),
      minWidth: 90
    },
    {
      id: 'contacted',
      label: 'Contacted',
      align: 'center',
      sortable: true,
      render: (value, row) => (
        <Checkbox
          checked={Boolean(value)}
          onChange={(e) => handleCheckboxChange(String(row.id), 'contacted', e.target.checked)}
          size="small"
          color="primary"
        />
      ),
      minWidth: 110
    },
    {
      id: 'delCollection',
      label: 'Del/Collection',
      sortable: true,
      render: (value) => formatDate(value as string | null),
      minWidth: 130
    }
  ];

  // Filter configuration
 export const filters: FilterConfig[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: JobStatus.map(status => ({
        value: status,
        label: status.replace(/_/g, ' ')
      }))
    },
    {
      id: 'delivery_date_from',
      label: 'Delivery From',
      type: 'date'
    },
    {
      id: 'delivery_date_to',
      label: 'Delivery To',
      type: 'date'
    }
  ];