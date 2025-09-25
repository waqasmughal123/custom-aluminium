import { Box, Tooltip, Chip, Checkbox } from "@mui/material";
import React from 'react';
import { formatDate } from "@/utils/helpers/dateFormat";
import { TableColumn, FilterConfig } from "@/views/components/common";

// Worker display interface for the table
export interface WorkerDisplay {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  skills: string;
  hireDate: string;
  active: boolean;
  role: string;
  actions?: string;
}



// Status colors for chips
export const statusColors = {
  ACTIVE: { main: "#4CAF50", background: "rgba(76, 175, 80, 0.1)" },
  INACTIVE: { main: "#F44336", background: "rgba(244, 67, 54, 0.1)" }
};

// Table columns configuration
export const columns = (handleCheckboxChange: (workerId: string, field: string, checked: boolean) => void): TableColumn<WorkerDisplay>[] => [
  {
    id: 'name',
    label: 'Name',
    sortable: true,
    minWidth: 150,
    render: (value, row) => (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ fontWeight: 'medium' }}>{String(value)}</Box>
        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{row.role}</Box>
      </Box>
    )
  },
  {
    id: 'email',
    label: 'Email',
    sortable: true,
    minWidth: 200
  },
  {
    id: 'phone',
    label: 'Phone',
    sortable: true,
    minWidth: 120
  },
  {
    id: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => (
      <Chip
        label={String(value)}
        size="small"
        sx={{
          backgroundColor: statusColors[value as keyof typeof statusColors]?.main,
          color: '#fff',
          fontWeight: 'medium'
        }}
      />
    ),
    minWidth: 100
  },
  {
    id: 'skills',
    label: 'Skills',
    sortable: true,
    maxWidth: 250,
    render: (value) => (
      <Tooltip title={String(value)} arrow>
        <Box sx={{ 
          maxWidth: 250, 
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
    id: 'hireDate',
    label: 'Hire Date',
    sortable: true,
    render: (value) => value ? formatDate(value as string) : 'N/A',
    minWidth: 120
  },
  {
    id: 'active',
    label: 'Active',
    align: 'center',
    sortable: true,
    render: (value, row) => {
      console.log('Checkbox render:', { value, rowId: row.id, rowActive: row.active });
      return (
        <Checkbox
          checked={Boolean(value)}
          onChange={(e) => {
            console.log('Checkbox onChange:', { 
              checked: e.target.checked, 
              currentValue: value, 
              rowId: row.id 
            });
            handleCheckboxChange(String(row.id), 'active', e.target.checked);
          }}
          size="small"
          color="primary"
        />
      );
    },
    minWidth: 80
  }
];

// Filter configuration
export const filters: FilterConfig[] = [
  {
    id: 'is_active',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' }
    ]
  },
  {
    id: 'skills',
    label: 'Skills',
    type: 'select',
    options: [
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
      { value: 'Delivery', label: 'Delivery' }
    ]
  }
];
