"use client";

import { Box, Typography, Stack, Divider } from "@mui/material";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { InputText, Select, DatePicker, Checkbox, TextArea } from '@/views/components/common';
import { statusOptions, JobFormValues } from '../constants';

interface JobFormFieldsProps {
  control: Control<JobFormValues>;
  errors: FieldErrors<JobFormValues>;
}

export default function JobFormFields({ control, errors }: JobFormFieldsProps) {
  return (
    <Stack spacing={2}>
      {/* Row 1: Job Title and Customer */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Controller
          name="job"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              label="Job Title *"
              error={!!errors.job}
              helperText={errors.job?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="customer"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              label="Customer *"
              error={!!errors.customer}
              helperText={errors.customer?.message}
              fullWidth
            />
          )}
        />
      </Box>

      {/* Row 2: Customer PO and Contact */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Controller
          name="customerPO"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              label="Customer PO"
              error={!!errors.customerPO}
              helperText={errors.customerPO?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="contact"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              label="Contact *"
              error={!!errors.contact}
              helperText={errors.contact?.message}
              fullWidth
            />
          )}
        />
      </Box>

      {/* Row 3: Date In and Date Due */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              {...field}
              label="Date In"
              error={!!errors.startDate}
              helperText={errors.startDate?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              {...field}
              label="Date Due"
              error={!!errors.endDate}
              helperText={errors.endDate?.message}
              fullWidth
            />
          )}
        />
      </Box>

      {/* Row 4: Quantity and Amount */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Controller
          name="quantity"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              type="number"
              label="Quantity *"
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
              inputProps={{ min: 1 }}
              fullWidth
            />
          )}
        />
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              type="number"
              label="Amount (ex GST)"
              error={!!errors.amount}
              helperText={errors.amount?.message}
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth
            />
          )}
        />
      </Box>

      {/* Row 5: Material Units and Labour Units */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Controller
          name="materialUnits"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              type="number"
              label="Material Units *"
              error={!!errors.materialUnits}
              helperText={errors.materialUnits?.message}
              inputProps={{ min: 0, step: 1 }}
              fullWidth
            />
          )}
        />
        <Controller
          name="labourUnits"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              type="number"
              label="Labour Units *"
              error={!!errors.labourUnits}
              helperText={errors.labourUnits?.message}
              inputProps={{ min: 0, step: 1 }}
              fullWidth
            />
          )}
        />
      </Box>

      {/* Row 6: Units Elapsed and Finish/Colour */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Controller
          name="labourUnitsElapsed"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              type="number"
              label="Units Elapsed *"
              error={!!errors.labourUnitsElapsed}
              helperText={errors.labourUnitsElapsed?.message}
              inputProps={{ min: 0, step: 1 }}
              fullWidth
            />
          )}
        />
        <Controller
          name="finishColour"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              label="Finish/Colour *"
              error={!!errors.finishColour}
              helperText={errors.finishColour?.message}
              fullWidth
            />
          )}
        />
      </Box>

      {/* Row 7: Progress and Del/Collection */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Progress"
              options={statusOptions}
              error={!!errors.status}
              helperText={errors.status?.message}
              fullWidth
            />
          )}
        />
        <Controller
          name="delCollection"
          control={control}
          render={({ field }) => (
            <DatePicker
              {...field}
              label="Del/Collection"
              error={!!errors.delCollection}
              helperText={errors.delCollection?.message}
              fullWidth
            />
          )}
        />
      </Box>

      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextArea
            {...field}
            label="Description *"
            error={!!errors.description}
            helperText={errors.description?.message}
            rows={2}
            fullWidth
          />
        )}
      />

      {/* Status Information Section */}
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Status Information
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 2,
        }}
      >
        <Controller
          name="scheduleConfirmed"
          control={control}
          render={({ field }) => (
            <Checkbox
              {...field}
              label="Schedule Confirmed"
              checked={field.value}
            />
          )}
        />
        
        <Controller
          name="invoiceSent"
          control={control}
          render={({ field }) => (
            <Checkbox
              {...field}
              label="Invoice Sent"
              checked={field.value}
            />
          )}
        />

        <Controller
          name="stockAvailable"
          control={control}
          render={({ field }) => (
            <Checkbox
              {...field}
              label="Stock Available"
              checked={field.value}
            />
          )}
        />
        
        <Controller
          name="contacted"
          control={control}
          render={({ field }) => (
            <Checkbox
              {...field}
              label="Contacted"
              checked={field.value}
            />
          )}
        />
      </Box>

      {/* Materials Section */}
      <Box sx={{ mt: 3 }}>
        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Materials
          </Typography>
        </Divider>
        
        <Controller
          name="materialsText"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              label="Materials *"
              rows={3}
              placeholder="Enter materials information here"
              error={!!errors.materialsText}
              helperText={errors.materialsText?.message}
              fullWidth
            />
          )}
        />
      </Box>
    </Stack>
  );
} 