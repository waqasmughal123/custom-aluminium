"use client";

import { Box, Typography } from "@mui/material";
import React from "react";
import { Control, FieldErrors, Controller } from "react-hook-form";
import { useTranslation } from 'react-i18next';
import { InputText, Select, TextArea, DatePicker } from '@/views/components/common';
import { WORKER_SKILLS, STATUS_OPTIONS, type WorkerFormValues } from '../constants';

interface WorkerFormFieldsProps {
  control: Control<WorkerFormValues>;
  errors: FieldErrors<WorkerFormValues>;
}

export default function WorkerFormFields({ control, errors }: WorkerFormFieldsProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        {t('workers.form.personalInfo')}
      </Typography>

      {/* Personal Information Row 1 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Controller
          name="first_name"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              label={t('workers.form.firstName')}
              placeholder={t('workers.form.firstNamePlaceholder')}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
              required
              fullWidth
            />
          )}
        />
        <Controller
          name="last_name"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              label={t('workers.form.lastName')}
              placeholder={t('workers.form.lastNamePlaceholder')}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
              required
              fullWidth
            />
          )}
        />
      </Box>

      {/* Personal Information Row 2 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              label={t('workers.form.email')}
              placeholder={t('workers.form.emailPlaceholder')}
              error={!!errors.email}
              helperText={errors.email?.message}
              required
              fullWidth
            />
          )}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              label={t('workers.form.phone')}
              placeholder={t('workers.form.phonePlaceholder')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              fullWidth
            />
          )}
        />
      </Box>

      {/* Address - Full Width */}
      <Box sx={{ mb: 3 }}>
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              label={t('workers.form.address')}
              placeholder={t('workers.form.addressPlaceholder')}
              error={!!errors.address}
              helperText={errors.address?.message}
              rows={2}
              fullWidth
            />
          )}
        />
      </Box>

      {/* Work Information Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 3 }}>
        {t('workers.form.workInfo')}
      </Typography>

      {/* Work Information Row 1 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Controller
          name="skills"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label={t('workers.form.skills')}
              options={WORKER_SKILLS}
              error={!!errors.skills}
              helperText={errors.skills?.message}
              required
              multiple={true}
              showChips={true}
              fullWidth
            />
          )}
        />
        <Controller
          name="hire_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              {...field}
              label={t('workers.form.hireDate')}
              error={!!errors.hire_date}
              helperText={errors.hire_date?.message}
              fullWidth
            />
          )}
        />
      </Box>


      {/* Status */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label={t('workers.form.status')}
              options={STATUS_OPTIONS}
              error={!!errors.is_active}
              helperText={errors.is_active?.message}
              required
              fullWidth
              FormControlProps={{ sx: { maxWidth: 300 } }}
            />
          )}
        />
        <Box sx={{ flex: 1 }} /> {/* Spacer */}
      </Box>
    </Box>
  );
}
