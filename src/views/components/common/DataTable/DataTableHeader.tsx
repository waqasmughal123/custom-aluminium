import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Box
} from '@mui/material';
import React from 'react';
import { TableColumn, SortConfig } from './types';

interface DataTableHeaderProps<T> {
  columns: TableColumn<T>[];
  sortable: boolean;
  sortConfig: SortConfig | null;
  onSort: (columnId: keyof T) => void;
  stickyHeader: boolean;
  actions: Array<{
    icon: React.ReactNode;
    tooltip: string;
    onClick: (row: T) => void;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  }>;
}

export default function DataTableHeader<T extends Record<string, unknown>>({
  columns,
  sortable,
  sortConfig,
  onSort,
  stickyHeader,
  actions
}: DataTableHeaderProps<T>) {
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={String(column.id)}
            align={column.align}
            style={{
              minWidth: column.minWidth,
              maxWidth: column.maxWidth,
              ...(stickyHeader && {
                position: 'sticky',
                top: 0,
                backgroundColor: 'background.paper',
                zIndex: 1
              })
            }}
          >
            {sortable && column.sortable ? (
              <TableSortLabel
                active={sortConfig?.field === String(column.id)}
                direction={sortConfig?.field === String(column.id) ? sortConfig.direction : 'asc'}
                onClick={() => onSort(column.id)}
                sx={{ fontWeight: 'bold' }}
              >
                {column.label}
              </TableSortLabel>
            ) : (
              <Box sx={{ fontWeight: 'bold' }}>
                {column.label}
              </Box>
            )}
          </TableCell>
        ))}
        
        {/* Actions column */}
        {actions.length > 0 && (
          <TableCell
            align="center"
            style={{
              minWidth: 120,
              ...(stickyHeader && {
                position: 'sticky',
                top: 0,
                backgroundColor: 'background.paper',
                zIndex: 1
              })
            }}
          >
            <Box sx={{ fontWeight: 'bold' }}>Actions</Box>
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
}
