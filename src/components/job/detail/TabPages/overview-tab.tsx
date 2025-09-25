'use client';

import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import { 
  Box, 
  Typography, 
  Paper,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { priorityColors } from '@/components/job/add/constants';
import { statusColors, ALL_MANUFACTURING_PROCESSES } from '@/components/job/constant';
import type { Job } from '@/models/job';

interface JobOverviewTabProps {
  job: Job;
  onUpdateJob: (updatedData: Partial<Job>) => void;
}

export default function JobOverviewTab({ job }: JobOverviewTabProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  
  // Function to get status color
  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors]?.main || theme.palette.grey[500];
  };

  // Function to get priority color
  const getPriorityColor = (priority: string) => {
    return priorityColors[priority as keyof typeof priorityColors]?.main || theme.palette.grey[500];
  };

  const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mb: 3, 
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
      pb: 1,
    }}>
      <Box sx={{ 
        mr: 1.5, 
        color: theme.palette.primary.main,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </Box>
      <Typography variant="h6" fontWeight="500" color="text.primary">
        {title}
      </Typography>
    </Box>
  );

  const InfoRow = ({ label, value, icon }: { label: string, value: React.ReactNode, icon?: React.ReactNode }) => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      mb: 2,
      '&:last-child': { mb: 0 }
    }}>
      {icon && (
        <Box sx={{ 
          color: theme.palette.text.secondary,
          mr: 1.5,
          mt: 0.25
        }}>
          {icon}
        </Box>
      )}
      <Box>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          component="div"
          sx={{ mb: 0.5 }}
        >
          {label}
              </Typography>
        <Typography 
          variant="body1" 
          fontWeight="medium"
          sx={{ wordBreak: 'break-word' }}
        >
          {value || 'N/A'}
              </Typography>
      </Box>
    </Box>
  );

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ 
      maxWidth: '100%', 
      animation: 'fadeIn 0.5s ease-in-out',
      '@keyframes fadeIn': {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      }
    }}>
      {/* Header with Status and Priority */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5, 
                height: '100%',
                borderRadius: 2,
                boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.07)}`,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.09)}`,
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon color="primary" sx={{ mr: 1.5 }} />
                <Typography variant="h5" fontWeight="500">
                  {job.job || t('jobs.detail.overview.jobNumber')}
              </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Chip 
                  label={job.status} 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    bgcolor: getStatusColor(job.status),
                    '& .MuiChip-label': { px: 1.5 }
                  }} 
                />
                <Chip 
                  label={job.priority} 
                  sx={{ 
                    color: 'white',
                    fontWeight: 500,
                    bgcolor: getPriorityColor(job.priority),
                    '& .MuiChip-label': { px: 1.5 }
                  }} 
                />
              </Box>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '250px' }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5,
                height: '100%',
                borderRadius: 2,
                boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.07)}`,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.09)}`,
                },
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon color="primary" sx={{ mr: 1.5 }} />
                <Typography variant="h6" fontWeight="500">
                  {t('jobs.detail.overview.sections.customerDetails')}
              </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium" gutterBottom>
                {job.customer || t('jobs.detail.overview.values.customerName')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('jobs.detail.overview.contact')}: {job.contact || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                PO: {job.customer_po || 'N/A'}
              </Typography>
        </Paper>
      </Box>
        </Box>
      </Box>

      {/* Basic Information */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.07)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.09)}`,
          }
        }}
      >
        <SectionHeader icon={<InfoIcon />} title={t('jobs.detail.overview.sections.basicInfo')} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 100%' }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              {t('jobs.detail.overview.description')}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {job.description || t('jobs.detail.overview.values.noDescription')}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Financial Details */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.07)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.09)}`,
          }
        }}
      >
        <SectionHeader icon={<AttachMoneyIcon />} title={t('jobs.detail.overview.sections.financialDetails')} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <InfoRow label={t('jobs.detail.overview.amount')} value={job.amount !== null && job.amount !== undefined ? `$${(parseFloat(job.amount) || 0).toFixed(2)}` : ''} />
          <InfoRow label={t('jobs.detail.overview.quantity')} value={job.quantity} />
          <InfoRow label={t('jobs.detail.overview.materialUnits')} value={job.material_units} />
          <InfoRow label={t('jobs.detail.overview.labourUnits')} value={job.labour_units} />
          <InfoRow label={t('jobs.detail.overview.labourUnitsElapsed')} value={job.labour_units_elapsed} />
          <InfoRow label={t('jobs.detail.overview.invoice')} value={job.invoice} />
          <InfoRow 
            label={t('jobs.detail.overview.invoiceStatus')} 
            value={job.invoice_sent ? t('jobs.detail.overview.values.sent') : t('jobs.detail.overview.values.notSent')} 
            icon={job.invoice_sent ? <CheckCircleIcon color="success" fontSize="small" /> : <EmailIcon fontSize="small" />} 
          />
        </Box>
      </Paper>

      {/* Customer Details */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.07)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.09)}`,
          }
        }}
      >
        <SectionHeader icon={<PersonIcon />} title={t('jobs.detail.overview.sections.customerDetails')} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <InfoRow label={t('jobs.detail.overview.customer')} value={job.customer} />
          <InfoRow label={t('jobs.detail.overview.contactPerson')} value={job.contact} />
          <InfoRow label={t('jobs.detail.overview.customerPO')} value={job.customer_po} />
          <InfoRow label={t('jobs.detail.overview.finishColour')} value={job.finish_colour} />
          <InfoRow 
            label={t('jobs.detail.overview.contacted')} 
            value={job.contacted ? t('jobs.detail.overview.values.yes') : t('jobs.detail.overview.values.no')} 
            icon={job.contacted ? <CheckCircleIcon color="success" fontSize="small" /> : null}
          />
        </Box>
      </Paper>

      {/* Scheduling & Location */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.07)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.09)}`,
          }
        }}
      >
        <SectionHeader icon={<CalendarTodayIcon />} title={t('jobs.detail.overview.sections.schedulingLocation')} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <InfoRow label={t('jobs.detail.overview.startDate')} value={formatDate(job.start_date)} />
          <InfoRow label={t('jobs.detail.overview.endDate')} value={formatDate(job.end_date)} />
          <InfoRow label={t('jobs.detail.overview.scheduleDueDate')} value={formatDate(job.schedule_due_date)} />
          <InfoRow label={t('jobs.detail.overview.delCollection')} value={formatDate(job.delivery_collection_date)} />
          <InfoRow 
            label={t('jobs.detail.overview.scheduleConfirmed')} 
            value={job.schedule_confirmed ? t('jobs.detail.overview.values.yes') : t('jobs.detail.overview.values.no')} 
            icon={job.schedule_confirmed ? <CheckCircleIcon color="success" fontSize="small" /> : null}
          />
          <InfoRow 
            label={t('jobs.detail.overview.stockAvailable')} 
            value={job.stock_available ? t('jobs.detail.overview.values.yes') : t('jobs.detail.overview.values.no')} 
            icon={job.stock_available ? <InventoryIcon color="primary" fontSize="small" /> : null}
          />
          <InfoRow label={t('jobs.detail.overview.locationCode')} value={job.location_code} icon={<LocationOnIcon fontSize="small" />} />
          <InfoRow label={t('jobs.detail.overview.referenceNumber')} value={job.reference_number} />
        </Box>
      </Paper>

      {/* Required Processes */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.07)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.09)}`,
          }
        }}
      >
        <SectionHeader icon={<AssignmentIcon />} title="Required Processes" />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {job.processes && job.processes.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {job.processes.map((jobProcess) => {
                const processInfo = ALL_MANUFACTURING_PROCESSES.find(p => p.name === jobProcess.process.name);
                const categoryColor = processInfo?.category === 'FIRST' ? '#2196F3' : 
                                    processInfo?.category === 'SECONDARY' ? '#FF9800' : 
                                    processInfo?.category === 'FINAL' ? '#4CAF50' : '#757575';
                
                return (
                  <Chip
                    key={jobProcess.id}
                    label={jobProcess.process.name}
                    size="small"
                    sx={{
                      backgroundColor: alpha(categoryColor, 0.1),
                      color: categoryColor,
                      border: `1px solid ${alpha(categoryColor, 0.3)}`,
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: alpha(categoryColor, 0.2),
                      }
                    }}
                  />
                );
              })}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No processes defined for this job
            </Typography>
          )}
          
          {job.processes && job.processes.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <Box component="span" sx={{ color: '#2196F3', fontWeight: 500 }}>●</Box> FIRST processes &nbsp;&nbsp;
                <Box component="span" sx={{ color: '#FF9800', fontWeight: 500 }}>●</Box> SECONDARY processes &nbsp;&nbsp;
                <Box component="span" sx={{ color: '#4CAF50', fontWeight: 500 }}>●</Box> FINAL processes
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Additional Information */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          borderRadius: 2,
          boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.07)}`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.09)}`,
          }
        }}
      >
        <SectionHeader icon={<DescriptionIcon />} title={t('jobs.detail.overview.sections.additionalInfo')} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              {t('jobs.detail.overview.materialsText')}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {job.materials_text || t('jobs.detail.overview.values.noMaterials')}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              {t('jobs.detail.overview.notes')}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {job.notes || t('jobs.detail.overview.values.noNotes')}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
} 