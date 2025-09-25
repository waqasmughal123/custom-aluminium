import {
  Table,
  TableContainer,
  Paper,
  Typography,
  Box
} from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import DataTableBody from './DataTableBody';
import DataTableFilters from './DataTableFilters';
import DataTableHeader from './DataTableHeader';
import DataTablePagination from './DataTablePagination';
import { DataTableProps, SortConfig, ApiParams } from './types';

export default function DataTable<T extends Record<string, unknown>>({
  // Data and API
  data = [],
  loading = false,
  total = 0,
  onParamsChange,
  apiMode = false,
  
  // Table configuration
  columns,
  title,
  
  // Search configuration
  searchable = true,
  searchPlaceholder = "Search...",
  searchFields,
  searchDebounce = 500,
  
  // Filter configuration
  filterable = true,
  filters = [],
  
  // External filter state control
  externalSearchTerm,
  externalShowFilters,
  externalFilterValues,
  onSearchTermChange,
  onShowFiltersChange,
  onFilterValuesChange,
  
  // Sorting configuration
  sortable = true,
  defaultSort,
  
  // Pagination configuration
  paginated = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  rowsPerPageText = "Rows per page:",
  currentPage,
  onPageChange,
  onPageSizeChange,
  
  // UI configuration
  noDataText = "No data available",
  dense = false,
  stickyHeader = false,
  maxHeight = 'none',
  
  // Actions and interactions
  actions = [],
  onRowClick,
  getRowStyle
}: DataTableProps<T>) {
  
  // State management - use external state if provided, otherwise internal state
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [internalShowFilters, setInternalShowFilters] = useState(false);
  const [internalFilterValues, setInternalFilterValues] = useState<Record<string, unknown>>({});
  
  // Use external state if provided, otherwise use internal state
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const showFilters = externalShowFilters !== undefined ? externalShowFilters : internalShowFilters;
  const filterValues = externalFilterValues !== undefined ? externalFilterValues : internalFilterValues;
  
  // Auto-show filters when there are active filter values
  const hasActiveFilters = Boolean(searchTerm || Object.values(filterValues).some(v => v !== '' && v !== null && v !== undefined));
  const shouldShowFilters = Boolean(showFilters || hasActiveFilters);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null);
  const [internalPage, setInternalPage] = useState(1);
  
  // Use external page state if provided, otherwise use internal state
  const page = currentPage !== undefined ? currentPage : internalPage;
  const pageSize = initialPageSize; // Always use the prop value
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Client-side processed data (when apiMode is false)
  const [clientData, setClientData] = useState<T[]>([]);
  const [clientTotal, setClientTotal] = useState(0);

  // Update client data when data prop changes (for client-side mode)
  useEffect(() => {
    if (!apiMode) {
      let processed = [...data];
      
      // Apply search filter
      if (searchable && searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        processed = processed.filter(row => {
          if (searchFields) {
            return searchFields.some(field => 
              String(row[field]).toLowerCase().includes(searchLower)
            );
          }
          return Object.values(row).some(value => 
            String(value).toLowerCase().includes(searchLower)
          );
        });
      }

      // Apply custom filters
      Object.entries(filterValues).forEach(([filterId, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          const filter = filters.find(f => f.id === filterId);
          if (filter) {
            const column = columns.find(col => col.id === filter.id);
            if (column) {
              processed = processed.filter(row => {
                const cellValue = row[column.id];
                if (filter.type === 'select') {
                  return cellValue === value;
                } else if (filter.type === 'text') {
                  return String(cellValue).toLowerCase().includes(String(value).toLowerCase());
                } else if (filter.type === 'checkbox') {
                  return Boolean(cellValue) === Boolean(value);
                } else if (filter.type === 'number') {
                  return Number(cellValue) === Number(value);
                }
                return true;
              });
            }
          }
        }
      });

      // Apply sorting
      if (sortConfig) {
        processed.sort((a, b) => {
          const aVal = a[sortConfig.field as keyof T];
          const bVal = b[sortConfig.field as keyof T];

          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;

          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      setClientTotal(processed.length);

      // Apply pagination
      if (paginated) {
        const startIndex = (page - 1) * pageSize;
        processed = processed.slice(startIndex, startIndex + pageSize);
      }

      setClientData(processed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, searchTerm, filterValues, sortConfig, page, pageSize, apiMode, searchable, paginated]);

  // Emit params change for API mode
  const emitParamsChange = useCallback(() => {
    if (apiMode && onParamsChange) {
      const params: ApiParams = {
        page,
        pageSize,
        search: searchTerm || undefined,
        sortField: sortConfig?.field,
        sortDirection: sortConfig?.direction,
        filters: Object.keys(filterValues).length > 0 ? filterValues : undefined
      };
      onParamsChange(params);
    }
  }, [apiMode, onParamsChange, page, pageSize, searchTerm, sortConfig, filterValues]);

  // Emit params change when dependencies change (for API mode)
  useEffect(() => {
    if (apiMode) {
      emitParamsChange();
    }
  }, [emitParamsChange, apiMode]);

  // Get current display data
  const displayData = apiMode ? data : clientData;
  const displayTotal = apiMode ? total : clientTotal;

  // Event handlers
  const handleSort = (columnId: keyof T) => {
    const newSortConfig: SortConfig = {
      field: String(columnId),
      direction: sortConfig?.field === String(columnId) && sortConfig?.direction === 'asc' ? 'desc' : 'asc'
    };
    
    setSortConfig(newSortConfig);
    if (onPageChange) {
      onPageChange(1);
    } else {
      setInternalPage(1);
    } // Reset to first page when sorting
  };

  const handleSearchChange = (value: string) => {
    // Update search term using external callback if provided, otherwise internal state
    if (onSearchTermChange) {
      onSearchTermChange(value);
    } else {
      setInternalSearchTerm(value);
    }
    
    if (apiMode) {
      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Set new timeout for debounced search
      const timeout = setTimeout(() => {
        if (onPageChange) {
          onPageChange(1);
        } else {
          setInternalPage(1);
        } // Reset to first page when searching
      }, searchDebounce);
      
      setSearchTimeout(timeout);
    } else {
      if (onPageChange) {
        onPageChange(1);
      } else {
        setInternalPage(1);
      } // Reset to first page when searching
    }
  };

  const handleFilterChange = (filterId: string, value: unknown) => {
    // Update filter values using external callback if provided, otherwise internal state
    if (onFilterValuesChange) {
      const currentValues = externalFilterValues || internalFilterValues;
      onFilterValuesChange({ ...currentValues, [filterId]: value });
    } else {
      setInternalFilterValues(prev => ({ ...prev, [filterId]: value }));
    }
    
    if (onPageChange) {
      onPageChange(1);
    } else {
      setInternalPage(1);
    } // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    // Clear filter values using external callback if provided, otherwise internal state
    if (onFilterValuesChange) {
      onFilterValuesChange({});
    } else {
      setInternalFilterValues({});
    }
    
    // Clear search term using external callback if provided, otherwise internal state
    if (onSearchTermChange) {
      onSearchTermChange("");
    } else {
      setInternalSearchTerm("");
    }
    
    if (onPageChange) {
      onPageChange(1);
    } else {
      setInternalPage(1);
    }
    
    // Immediately emit the cleared state for API mode
    if (apiMode && onParamsChange) {
      const params: ApiParams = {
        page: 1,
        pageSize,
        search: undefined,
        sortField: sortConfig?.field,
        sortDirection: sortConfig?.direction,
        filters: undefined
      };
      onParamsChange(params);
    }
  };

  const handleShowFiltersChange = () => {
    if (onShowFiltersChange) {
      onShowFiltersChange(!showFilters);
    } else {
      setInternalShowFilters(!showFilters);
    }
  };


  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {/* Header */}
      {title && (
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          {title}
        </Typography>
      )}

      {/* Filters */}
      <DataTableFilters
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filterable={filterable}
        filters={filters}
        showFilters={showFilters}
        onShowFiltersChange={handleShowFiltersChange}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        shouldShowFilters={shouldShowFilters}
      />

      {/* Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          ...(maxHeight !== 'none' && { 
            maxHeight: maxHeight,
            overflow: 'auto'
          })
        }}
      >
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <DataTableHeader
            columns={columns}
            sortable={sortable}
            sortConfig={sortConfig}
            onSort={handleSort}
            stickyHeader={stickyHeader}
            actions={actions}
          />
          
          <DataTableBody
            data={displayData}
            columns={columns}
            loading={loading}
            noDataText={noDataText}
            dense={dense}
            actions={actions}
            onRowClick={onRowClick}
            getRowStyle={getRowStyle}
          />
        </Table>
      </TableContainer>

      {/* Pagination */}
      <DataTablePagination
        paginated={paginated}
        page={page}
        pageSize={pageSize}
        total={displayTotal}
        pageSizeOptions={pageSizeOptions}
        rowsPerPageText={rowsPerPageText}
        onPageChange={(newPage) => {
          if (onPageChange) {
            onPageChange(newPage);
          } else {
            setInternalPage(newPage);
          }
        }}
        onPageSizeChange={onPageSizeChange}
        apiMode={apiMode}
      />
    </Box>
  );
}
