import {
  Box,
  Typography,
  Pagination,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import React from 'react';

interface DataTablePaginationProps {
  paginated: boolean;
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions: number[];
  rowsPerPageText: string;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  apiMode: boolean;
}

export default function DataTablePagination({
  paginated,
  page,
  pageSize,
  total,
  pageSizeOptions,
  rowsPerPageText,
  onPageChange,
  onPageSizeChange,
  apiMode
}: DataTablePaginationProps) {
  if (!paginated) return null;

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mt: 3,
      flexWrap: 'wrap',
      gap: 2
    }}>
      {/* Results info */}
      <Typography variant="body2" color="text.secondary">
        Showing {Math.min((page - 1) * pageSize + 1, total)} to {Math.min(page * pageSize, total)} of {total} entries
        {apiMode && " (server-side)"}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Page size selector */}
        {onPageSizeChange && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {rowsPerPageText}
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              >
                {pageSizeOptions.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
        
        {/* Pagination */}
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, newPage) => onPageChange(newPage)}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
}

