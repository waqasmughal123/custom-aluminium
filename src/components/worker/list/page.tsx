"use client";

import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon
} from "@mui/icons-material";
import { Box, Alert } from "@mui/material";
import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import type { Worker } from '@/models/job';
import type { ApiError } from '@/utils/types/api';
import { useGlobalLoading, useToastActions } from '@/viewmodels/hooks';
import { useWorkers, useUpdateWorker, useDeleteWorker, useCreateWorker } from '@/viewmodels/hooks/useWorkers';
import { DataTable, Button } from '@/views/components/common';
import LoadingSpinner from '@/views/components/common/LoadingSpinner';
import { AddWorkerModal, type WorkerFormValues } from '../add';
import { columns, filters } from '../constant';
import { WorkerViewModal } from '../view';
import { transformWorkerForDisplay, type WorkerDisplay } from './types';

export default function WorkerList() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToastActions();
  const { isLoading: isGlobalLoading, loadingMessage, withLoading } = useGlobalLoading();
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerDisplay | null>(null);
  const [viewingWorker, setViewingWorker] = useState<Worker | null>(null);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchFilters, setSearchFilters] = useState<Record<string, unknown>>({});
  
  // DataTable filter states - lifted up from DataTable component
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
  

  // Handle params change from DataTable
  const handleParamsChange = useCallback((params: { search?: string; sortField?: string; sortDirection?: string; filters?: Record<string, unknown> }) => {
    // Build new filters object
    const newFilters: Record<string, unknown> = {};
    
    // Handle search
    if (params.search !== undefined) {
      newFilters.search = params.search;
    }
    
    // Handle sorting
    if (params.sortField && params.sortDirection) {
      newFilters.sort = params.sortField;
      newFilters.order = params.sortDirection;
    }
    
    // Handle filters
    if (params.filters) {
      Object.assign(newFilters, params.filters);
    }
    
    // Always update searchFilters to handle clear all scenario
    // When clearing all filters, newFilters will be empty, which is what we want
    setSearchFilters(newFilters);
    setPage(1); // Reset page when filters change
  }, []);

  const { 
    data: workersResponse, 
    isLoading, 
    error,
    isFetching
  } = useWorkers({ 
    ...searchFilters, 
    page, 
    limit: pageSize 
  });
  
  const createWorkerMutation = useCreateWorker();
  const updateWorkerMutation = useUpdateWorker();
  const deleteWorkerMutation = useDeleteWorker();

  const workers: WorkerDisplay[] = useMemo(() => {
    if (!workersResponse?.results) return [];
    return workersResponse.results.map(transformWorkerForDisplay);
  }, [workersResponse]);

  const handleCheckboxChange = async (workerId: string, field: string, checked: boolean) => {
    console.log('Checkbox change:', { workerId, field, checked });
    try {
      await withLoading(async () => {
        // Map display field to backend field
        const backendField = field === 'active' ? 'is_active' : field;
        const payload = { [backendField]: checked };
        console.log('API payload:', payload);
        
        await updateWorkerMutation.mutateAsync({
          id: workerId,
          data: payload
        });
        showSuccess(t('workers.messages.fieldUpdateSuccess', { field: field === 'active' ? t('workers.form.status') : field }));
      }, t('workers.messages.fieldUpdating', { field: field === 'active' ? t('workers.form.status') : field }));
    } catch (error) {
      console.error(`Error updating worker ${field}:`, error);
      showError(t('workers.messages.fieldUpdateError', { field: field === 'active' ? t('workers.form.status') : field }));
    }
  };

  const handleEdit = (worker: WorkerDisplay) => {
    setEditingWorker(worker);
    setIsEditModalOpen(true);
  };

  const handleView = async (worker: WorkerDisplay) => {
    // Convert WorkerDisplay back to Worker format for the view modal
    const workerData: Worker = {
      id: worker.id,
      first_name: worker.name.split(' ')[0] || '',
      last_name: worker.name.split(' ').slice(1).join(' ') || '',
      email: worker.email,
      phone: worker.phone === 'N/A' ? undefined : worker.phone,
      address: worker.address === 'N/A' ? undefined : worker.address,
      role: worker.role,
      skills: worker.skills,
      hire_date: worker.hireDate && worker.hireDate !== 'Invalid Date' ? worker.hireDate : undefined,
      is_active: worker.active,
      created_at: new Date().toISOString(), // Placeholder
      user: {
        id: '',
        email: worker.email,
        first_name: worker.name.split(' ')[0] || '',
        last_name: worker.name.split(' ').slice(1).join(' ') || '',
        role: 'worker',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setViewingWorker(workerData);
    setIsViewModalOpen(true);
  };


  const handleDelete = async (worker: WorkerDisplay) => {
    if (window.confirm(t('workers.messages.deleteConfirm', { name: worker.name }))) {
      try {
        await withLoading(async () => {
          await deleteWorkerMutation.mutateAsync(worker.id);
          showSuccess(t('workers.messages.deleteSuccess'));
        }, t('workers.messages.deleting'));
      } catch (error: unknown) {
        console.error('Error deleting worker:', error);
        let errorMessage = t('workers.messages.deleteError');
        
        // Handle ApiError type
        if (error && typeof error === 'object' && 'message' in error) {
          const apiError = error as ApiError;
          errorMessage = apiError.message;
        } 
        // Handle Axios error with response
        else if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { message?: string; detail?: string } } };
          if (axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string') {
            errorMessage = axiosError.response.data.message;
          } else if (axiosError.response?.data?.detail && typeof axiosError.response.data.detail === 'string') {
            errorMessage = axiosError.response.data.detail;
          }
        }
        // Handle standard Error
        else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        showError(errorMessage);
      }
    }
  };

  const handleCreateWorker = async (data: Omit<WorkerFormValues, 'is_active' | 'hire_date'> & { 
    is_active: boolean; 
    hire_date?: string; 
  }) => {
    try {
      // Convert the form data to match API requirements
      const createData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
        role: 'worker', // Provide default role for API
        skills: Array.isArray(data.skills) ? data.skills : [data.skills || ''],
        hire_date: data.hire_date || undefined,
        is_active: data.is_active,
        // Add required fields that are missing from the form
        user: {
          id: '',
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: 'worker',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await createWorkerMutation.mutateAsync(createData);
      showSuccess(t('workers.messages.createSuccess', { name: `${data.first_name} ${data.last_name}` }));
      setIsAddModalOpen(false);
    } catch (error: unknown) {
      console.error('Error creating worker:', error);
      let errorMessage = t('workers.messages.createError');
      
      // Handle ApiError type with validation details
      if (error && typeof error === 'object' && 'details' in error) {
        const apiError = error as ApiError;
        if (apiError.details) {
          const fieldErrors = Object.entries(apiError.details)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = `Validation errors: ${fieldErrors}`;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }
      // Handle ApiError type with message
      else if (error && typeof error === 'object' && 'message' in error) {
        const apiError = error as ApiError;
        errorMessage = apiError.message;
      }
      // Handle Axios error with response
      else if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; [key: string]: unknown } } };
        if (axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string') {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.data) {
          // Handle case where API returns field-specific errors directly
          const responseData = axiosError.response.data;
          if (typeof responseData === 'object' && responseData !== null) {
            const fieldErrors = Object.entries(responseData)
              .filter(([key]) => key !== 'message')
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('; ');
            if (fieldErrors) {
              errorMessage = `Validation errors: ${fieldErrors}`;
            }
          }
        }
      }
      // Handle standard Error
      else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
      // Re-throw error so modal knows to stay open
      throw error;
    }
  };

  const handleUpdateWorker = async (data: Partial<Worker> & { id: string }) => {
    try {
      await updateWorkerMutation.mutateAsync({
        id: data.id,
        data: data
      });
      const workerName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Worker';
      showSuccess(t('workers.messages.updateSuccess', { name: workerName }));
      setIsEditModalOpen(false);
      setEditingWorker(null);
    } catch (error: unknown) {
      console.error('Error updating worker:', error);
      let errorMessage = t('workers.messages.updateError');
      
      // Handle ApiError type with validation details
      if (error && typeof error === 'object' && 'details' in error) {
        const apiError = error as ApiError;
        if (apiError.details) {
          const fieldErrors = Object.entries(apiError.details)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = `Validation errors: ${fieldErrors}`;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }
      // Handle ApiError type with message
      else if (error && typeof error === 'object' && 'message' in error) {
        const apiError = error as ApiError;
        errorMessage = apiError.message;
      }
      // Handle Axios error with response
      else if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; [key: string]: unknown } } };
        if (axiosError.response?.data?.message && typeof axiosError.response.data.message === 'string') {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.data) {
          // Handle case where API returns field-specific errors directly
          const responseData = axiosError.response.data;
          if (typeof responseData === 'object' && responseData !== null) {
            const fieldErrors = Object.entries(responseData)
              .filter(([key]) => key !== 'message')
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('; ');
            if (fieldErrors) {
              errorMessage = `Validation errors: ${fieldErrors}`;
            }
          }
        }
      }
      // Handle standard Error
      else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
      // Re-throw error so modal knows to stay open
      throw error;
    }
  };


  const getRowStyle = (worker: WorkerDisplay) => {
    if (!worker.active) {
      return {
        opacity: 0.6,
        backgroundColor: 'rgba(0, 0, 0, 0.04)'
      };
    }
    return {};
  };

  // Table actions
  const actions = [
    {
      icon: <VisibilityIcon />,
      tooltip: t('workers.actions.view'),
      onClick: handleView,
      color: "primary" as const
    },
    {
      icon: <EditIcon />,
      tooltip: t('workers.actions.edit'),
      onClick: handleEdit,
      color: "secondary" as const
    },
    {
      icon: <DeleteIcon />,
      tooltip: t('workers.actions.delete'),
      onClick: handleDelete,
      color: "error" as const
    }
  ];

  // Loading spinner
  if (isGlobalLoading) {
    return <LoadingSpinner open={isGlobalLoading} message={loadingMessage} size={60} />;
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t('workers.messages.loadError')}: {(error as ApiError)?.message || t('common.unknownError')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: 'calc(100vh - 64px)', // Allow content to expand beyond viewport
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with Add Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        flexShrink: 0,
        px: 3,
        pt: 3
      }}>
        <Box />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsAddModalOpen(true)}
          sx={{ alignSelf: 'flex-end' }}
          disabled={createWorkerMutation.isPending}
        >
          {createWorkerMutation.isPending ? t('workers.messages.creating') : t('workers.actions.add')}
        </Button>
      </Box>

      <Box sx={{
        width: '100%',
        maxWidth: '100%',
        px: 3,
        pb: 3
      }}>
        <DataTable<WorkerDisplay>
          title={`Workers (${workersResponse?.count || 0})`}
          data={workers}
          columns={columns(handleCheckboxChange)}
          filters={filters}
          actions={actions}
          searchFields={['name', 'email', 'skills']}
          searchPlaceholder={t('workers.search.placeholder')}
          getRowStyle={getRowStyle}
          // Server-side pagination props
          apiMode={true}
          loading={isLoading || isFetching}
          total={workersResponse?.count || 0}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 25, 50]}
          // External pagination control
          currentPage={page}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(1);
          }}
          // External filter state control
          externalSearchTerm={searchTerm}
          externalShowFilters={showFilters}
          externalFilterValues={filterValues}
          onSearchTermChange={setSearchTerm}
          onShowFiltersChange={setShowFilters}
          onFilterValuesChange={setFilterValues}
          onParamsChange={handleParamsChange}
          dense={true}
          stickyHeader={true}
        />
      </Box>

      {/* View Worker Modal */}
        <WorkerViewModal
          open={isViewModalOpen}
          worker={viewingWorker}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingWorker(null);
          }}
        />

      {/* Add Worker Modal */}
      <AddWorkerModal
        open={isAddModalOpen}
        mode="add"
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateWorker}
      />

      {/* Edit Worker Modal */}
      <AddWorkerModal
        open={isEditModalOpen}
        mode="edit"
        worker={editingWorker ? {
          id: editingWorker.id,
          first_name: editingWorker.name.split(' ')[0] || '',
          last_name: editingWorker.name.split(' ').slice(1).join(' ') || '',
          email: editingWorker.email,
          phone: editingWorker.phone,
          address: editingWorker.address,
          role: editingWorker.role,
          skills: (() => {
            if (typeof editingWorker.skills === 'string') {
              const skillsArray = editingWorker.skills.split(', ').filter(s => s.trim());
              return skillsArray.length > 0 ? skillsArray : ['Saw cutting'];
            }
            return Array.isArray(editingWorker.skills) ? editingWorker.skills : ['Saw cutting'];
          })(),
          hire_date: editingWorker.hireDate,
          is_active: editingWorker.active,
          user: { 
            id: '', 
            email: editingWorker.email, 
            first_name: editingWorker.name.split(' ')[0] || '', 
            last_name: editingWorker.name.split(' ').slice(1).join(' ') || '', 
            role: 'worker',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } : null}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingWorker(null);
        }}
        onSubmit={handleCreateWorker}
        onUpdate={handleUpdateWorker}
      />
    </Box>
  );
}
