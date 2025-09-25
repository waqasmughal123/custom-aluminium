export interface TableColumn<T = Record<string, unknown>> {
  id: keyof T;
  label: string;
  align?: 'left' | 'center' | 'right';
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  renderFilter?: () => React.ReactNode;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'text' | 'checkbox' | 'date' | 'number';
  options?: Array<{ value: string; label: string }>;
  defaultValue?: unknown;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ApiParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DataTableProps<T = Record<string, unknown>> {
  // Data and API
  data?: T[];
  loading?: boolean;
  total?: number;
  onParamsChange?: (params: ApiParams) => void;
  apiMode?: boolean; // true for server-side, false for client-side
  
  // Table configuration
  columns: TableColumn<T>[];
  title?: string;
  
  // Search configuration
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  searchDebounce?: number;
  
  // Filter configuration
  filterable?: boolean;
  filters?: FilterConfig[];
  
  // External filter state control (optional - if not provided, uses internal state)
  externalSearchTerm?: string;
  externalShowFilters?: boolean;
  externalFilterValues?: Record<string, unknown>;
  onSearchTermChange?: (searchTerm: string) => void;
  onShowFiltersChange?: (showFilters: boolean) => void;
  onFilterValuesChange?: (filterValues: Record<string, unknown>) => void;
  
  // Sorting configuration
  sortable?: boolean;
  defaultSort?: SortConfig;
  
  // Pagination configuration
  paginated?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  rowsPerPageText?: string;
  currentPage?: number; // External page control
  onPageChange?: (page: number) => void; // External page change handler
  onPageSizeChange?: (pageSize: number) => void; // External page size change handler
  
  // UI configuration
  noDataText?: string;
  dense?: boolean;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  
  // Actions and interactions
  actions?: Array<{
    icon: React.ReactNode;
    tooltip: string;
    onClick: (row: T) => void;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  }>;
  onRowClick?: (row: T) => void;
  getRowStyle?: (row: T) => React.CSSProperties;
}

