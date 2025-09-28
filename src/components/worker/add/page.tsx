"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Modal, 
  Box, 
  Typography, 
  Button, 
  Stack,
} from "@mui/material";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from 'react-i18next';
import type { Worker } from '@/models/job';
import { useGlobalLoading } from '@/viewmodels/hooks';
import { modalStyle, workerSchema, type WorkerFormValues } from './constants';
import WorkerFormFields from './form/page';
import type { AddWorkerModalProps } from './types';

// Transform API worker data to form-compatible format
function transformApiWorkerToFormData(apiWorker: Worker): WorkerFormValues {
  return {
    first_name: apiWorker.first_name || "",
    last_name: apiWorker.last_name || "",
    email: apiWorker.email || "",
    phone: apiWorker.phone || "",
    address: apiWorker.address || "",
    skills: (() => {
      
      
      if (Array.isArray(apiWorker.skills)) {
        // Filter to only include valid skills
        return apiWorker.skills as WorkerFormValues['skills'];
      } else if (apiWorker.skills && typeof apiWorker.skills === 'string') {
        const skillsArray = apiWorker.skills.split(', ').filter(s => s.trim());
        return skillsArray as WorkerFormValues['skills'];
      }
      return [];
    })(),
    hire_date: apiWorker.hire_date ? new Date(apiWorker.hire_date) : undefined,
    is_active: apiWorker.is_active ? 'true' : 'false',
  };
}

export default function AddWorkerModal({ 
  open, 
  mode = "add", 
  worker, 
  onClose, 
  onSubmit, 
  onUpdate 
}: AddWorkerModalProps): React.JSX.Element {
  const { t } = useTranslation();
  const { withLoading } = useGlobalLoading();

  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    reset,
  } = useForm<WorkerFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(workerSchema) as any,
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      skills: [],
      hire_date: undefined,
      is_active: 'true',
    },
  });

  // Reset form when worker prop changes (for edit mode)
  useEffect(() => {
    if (worker && mode === "edit") {
      const formData = transformApiWorkerToFormData(worker);
      reset(formData);
    } else if (mode === "add") {
      reset({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        skills: [],
        hire_date: undefined,
        is_active: 'true',
      });
    }
  }, [worker, mode, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onFormSubmit = async (data: WorkerFormValues) => {
    // Zod validation is handled automatically by react-hook-form

    try {
      await withLoading(async () => {
        if (mode === "edit" && worker && onUpdate) {
          // For edit mode, pass form data with proper conversions for Worker type
          await onUpdate({
            id: worker.id,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            skills: Array.isArray(data.skills) ? data.skills : [data.skills], // Keep skills as array for API
            hire_date: data.hire_date ? data.hire_date.toISOString().split('T')[0] : undefined,
            is_active: data.is_active === 'true',
          });
        } else {
          // For create mode, convert form data to expected format
          const submitData = {
            ...data,
            hire_date: data.hire_date ? data.hire_date.toISOString().split('T')[0] : undefined,
            is_active: data.is_active === 'true',
          };
          await onSubmit(submitData);
        }
      }, mode === "edit" ? t('workers.messages.updating') : t('workers.messages.creating'));
      
      // Only close modal if we reach here (no errors thrown)
      handleClose();
    } catch (error: unknown) {
      console.error('Form submission error:', error);
      // Modal stays open on error - don't call handleClose()
      // Error handling is already done in the parent component (handleCreateWorker/handleUpdateWorker)
      // so we don't need to show additional error messages here
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="add-worker-modal-title"
      aria-describedby="add-worker-modal-description"
    >
      <Box sx={modalStyle}>
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
            {mode === "edit" ? t('workers.form.editWorker') : t('workers.form.addNewWorker')}
          </Typography>

          <form onSubmit={handleSubmit(onFormSubmit)}>
            <Stack spacing={4}>
              {/* Worker Form Fields */}
              <WorkerFormFields 
                control={control} 
                errors={errors}
              />
            </Stack>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleClose}>
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                variant="contained"
              >
                {mode === "edit" ? t('workers.actions.update') : t('workers.actions.create')}
              </Button>
            </Stack>
          </form>
        </Box>
      </Box>
    </Modal>
  );
}
