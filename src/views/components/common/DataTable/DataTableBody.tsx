import {
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import React from 'react';
import { TableColumn } from './types';

interface DataTableBodyProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading: boolean;
  noDataText: string;
  dense: boolean;
  actions: Array<{
    icon: React.ReactNode;
    tooltip: string;
    onClick: (row: T) => void;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  }>;
  onRowClick?: (row: T) => void;
  getRowStyle?: (row: T) => React.CSSProperties;
}

export default function DataTableBody<T extends Record<string, unknown>>({
  data,
  columns,
  loading,
  noDataText,
  dense,
  actions,
  onRowClick,
  getRowStyle
}: DataTableBodyProps<T>) {
  if (loading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Loading...
              </Typography>
            </Box>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (data.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center" sx={{ py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {noDataText}
            </Typography>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {data.map((row, index) => (
        <TableRow
          key={index}
          hover={!!onRowClick}
          onClick={() => onRowClick?.(row)}
          sx={{
            cursor: onRowClick ? 'pointer' : 'default',
            ...(getRowStyle ? getRowStyle(row) : {})
          }}
        >
          {columns.map((column) => (
            <TableCell
              key={String(column.id)}
              align={column.align}
              size={dense ? 'small' : 'medium'}
              style={{
                minWidth: column.minWidth,
                maxWidth: column.maxWidth
              }}
            >
              {column.render ? (
                column.render(row[column.id], row)
              ) : (
                String(row[column.id] || '')
              )}
            </TableCell>
          ))}
          
          {/* Actions */}
          {actions.length > 0 && (
            <TableCell align="center" size={dense ? 'small' : 'medium'}>
              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                {actions.map((action, actionIndex) => (
                  <Tooltip key={actionIndex} title={action.tooltip}>
                    <IconButton
                      size="small"
                      color={action.color}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(row);
                      }}
                    >
                      {action.icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </Box>
            </TableCell>
          )}
        </TableRow>
      ))}
    </TableBody>
  );
}
