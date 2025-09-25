import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Collapse,
  IconButton
} from '@mui/material';
import React from 'react';
import DatePicker from '../DatePicker';
import { FilterConfig } from './types';

interface DataTableFiltersProps {
  // Search configuration
  searchable: boolean;
  searchPlaceholder: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  
  // Filter configuration
  filterable: boolean;
  filters: FilterConfig[];
  showFilters: boolean;
  onShowFiltersChange: () => void;
  filterValues: Record<string, unknown>;
  onFilterChange: (filterId: string, value: unknown) => void;
  onClearFilters: () => void;
  
  // State indicators
  hasActiveFilters: boolean;
  shouldShowFilters: boolean;
}

export default function DataTableFilters({
  searchable,
  searchPlaceholder,
  searchTerm,
  onSearchChange,
  filterable,
  filters,
  showFilters,
  onShowFiltersChange,
  filterValues,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  shouldShowFilters
}: DataTableFiltersProps) {
  return (
    <>
      {/* Search and Filter Controls */}
      {(searchable || filterable) && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {searchable && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => onSearchChange("")}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 300 }}
            />
          )}
          
          {filterable && filters.length > 0 && (
            <Button
              startIcon={<FilterListIcon />}
              onClick={onShowFiltersChange}
              variant={shouldShowFilters ? "contained" : "outlined"}
              size="small"
              color="secondary"
            >
              Filters {hasActiveFilters && !showFilters ? "(Auto)" : ""}
            </Button>
          )}

          {hasActiveFilters && (
            <Button
              startIcon={<ClearIcon />}
              onClick={onClearFilters}
              size="small"
              color="inherit"
            >
              Clear All
            </Button>
          )}
        </Box>
      )}

      {/* Filter Options */}
      {filterable && filters.length > 0 && (
        <Collapse in={shouldShowFilters}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {filters.map((filter) => (
              <Box key={filter.id} sx={{ minWidth: 180 }}>
                {filter.type === 'select' ? (
                  <FormControl size="small" fullWidth>
                    <InputLabel>{filter.label}</InputLabel>
                    <Select
                      value={filterValues[filter.id] || ''}
                      label={filter.label}
                      onChange={(e) => onFilterChange(filter.id, e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {filter.options?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : filter.type === 'date' ? (
                  <DatePicker
                    label={filter.label}
                    value={filterValues[filter.id] ? new Date(filterValues[filter.id] as string) : null}
                    onChange={(date: Date | null) => onFilterChange(filter.id, date ? date.toISOString().split('T')[0] : '')}
                    format="dd/MM/yyyy"
                    TextFieldProps={{ 
                      size: 'small',
                      fullWidth: true
                    }}
                  />
                ) : (
                  <TextField
                    size="small"
                    label={filter.label}
                    type={filter.type === 'number' ? 'number' : 'text'}
                    value={filterValues[filter.id] || ''}
                    onChange={(e) => onFilterChange(filter.id, e.target.value)}
                    fullWidth
                  />
                )}
              </Box>
            ))}
          </Box>
        </Collapse>
      )}
    </>
  );
}

