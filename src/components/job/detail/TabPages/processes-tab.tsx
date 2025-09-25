// Imports
import { 
  Box, 
  Typography, 
  Paper,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Collapse
} from '@mui/material';
import React, { useState, useEffect, useCallback} from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateJobProcess } from '@/models/job';
import { jobApiService } from '@/services/api/jobApi';
import { useAllWorkers } from '@/viewmodels/hooks/useWorkers';
import { Button, InputText, Select, LoadingSpinner } from '@/views/components/common';
import { useToastActions } from '@/views/components/providers';
import { JobProcess, JobProcessesTabProps } from '../types';
import { ALL_MANUFACTURING_PROCESSES } from '../../constant';

export default function JobProcessesTab({ job, onUpdateProcesses }: JobProcessesTabProps) {
  const { t } = useTranslation();
  
bun   // State management
  const [processes, setProcesses] = useState<JobProcess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Toast actions
  const { showSuccess, showError } = useToastActions();
  
  // Workers data
  const { data: workers = [] } = useAllWorkers();

  // State for tracking changes
  const [hasChanges, setHasChanges] = useState(false);
  
  // Drag and drop state - COMMENTED OUT
  // const [draggedProcessIndex, setDraggedProcessIndex] = useState<number | null>(null);
  // const [dragOverProcessIndex, setDragOverProcessIndex] = useState<number | null>(null);

  // Handle toggling a process on/off (local state only)
  const handleProcessToggle = useCallback((process: { id: string; name: string; category: string }, checked: boolean) => {
    let updatedProcesses: JobProcess[];

    if (checked) {
      // Add the process - create a new JobProcess
      const newJobProcess: JobProcess = {
        id: `temp_${Date.now()}`, // Temporary ID
        processId: process.id,
        order: processes.length + 1,
        estimatedHours: 1,
        assigneeId: null,
        status: 'TODO',
        processNumber: processes.length + 1,
        process: {
          id: process.id,
          name: process.name
        },
        assignee: null,
        description: '',
        createdAt: new Date().toISOString()
      };

      updatedProcesses = [...processes, newJobProcess];
    } else {
      // Remove the process
      updatedProcesses = processes.filter(p => 
        p.processId !== process.id && 
        p.process?.name !== process.name
      );
    }

    // Update local state only
    setProcesses(updatedProcesses);
    setHasChanges(true); // Mark that changes have been made
    
    console.log('Process toggled:', process.name, 'checked:', checked);
    console.log('Updated processes:', updatedProcesses);
  }, [processes]);

  // Handle updating process details (estimated hours, assignee) - local state only
  const handleProcessUpdate = useCallback((processId: string, field: string, value: number | string | null) => {
    const processToUpdate = processes.find(p => p.processId === processId || p.id === processId);
    if (!processToUpdate) return;

    // Update local state only
    const updatedProcesses = processes.map(p => 
      (p.processId === processId || p.id === processId)
        ? { 
            ...p, 
            [field]: value,
            ...(field === 'assigneeId' && value ? {
              assignee: workers.find(w => w.id === value) || null
            } : field === 'assigneeId' && !value ? { assignee: null } : {})
          }
        : p
    );

    setProcesses(updatedProcesses);
    setHasChanges(true); // Mark that changes have been made
    
    console.log('Process updated:', processId, field, value);
    console.log('Updated processes:', updatedProcesses);
  }, [processes, workers]);

  // Helper function to reload processes from job data
  const reloadProcessesFromJob = useCallback(async (jobData: typeof job) => {
    try {
      // Handle both old processes format and new selected_processes format
      let processesToLoad: Record<string, unknown>[] = [];
      
      // Check if job has the new selected_processes structure
      if (jobData.selected_processes && typeof jobData.selected_processes === 'object') {
        // Convert selected_processes to processes format
        const allSelectedProcesses: Record<string, unknown>[] = [];
        Object.entries(jobData.selected_processes).forEach(([category, processes]) => {
          if (Array.isArray(processes)) {
            processes.forEach((process: Record<string, unknown>, index: number) => {
              allSelectedProcesses.push({
                id: process.id || `${category}_${index}`,
                process: {
                  id: process.process_type || process.id,
                  name: process.name || 'Unknown Process'
                },
                estimated_hours: process.estimated_hours || 1,
                assignee: process.assignee_id ? {
                  id: process.assignee_id as string,
                  first_name: (process.assignee_name as string)?.split(' ')[0] || '',
                  last_name: (process.assignee_name as string)?.split(' ').slice(1).join(' ') || '',
                  email: '',
                  skills: ''
                } : null,
                status: process.status || 'TODO',
                order: process.order || allSelectedProcesses.length + 1,
                description: process.description || '',
                created_at: process.created_at || new Date().toISOString()
              });
            });
          }
        });
        processesToLoad = allSelectedProcesses;
      } else {
        // Use old processes format
        processesToLoad = (jobData.processes || []) as unknown as Record<string, unknown>[];
      }
      
      // Use JobProcess data directly from API
      const jobProcesses: JobProcess[] = processesToLoad.map((jobProcess, index) => {
        // Get estimated hours from the API response
        const estimatedHours = parseFloat(String(jobProcess.estimated_hours)) || 1;
        const processData = jobProcess.process as Record<string, unknown> | undefined;
        const assigneeData = jobProcess.assignee as Record<string, unknown> | undefined;
        
        return {
          id: jobProcess.id as string,
          processId: processData?.id as string || jobProcess.id as string,
          order: (jobProcess.order as number) || index + 1,
          estimatedHours: estimatedHours,
          assigneeId: assigneeData?.id as string || null,
          status: (jobProcess.status as string) || 'TODO',
          processNumber: index + 1,
          process: {
            id: processData?.id as string || jobProcess.id as string,
            name: processData?.name as string || t('jobs.detail.processes.unknownProcess', 'Unknown Process')
          },
          assignee: assigneeData ? {
            id: assigneeData.id as string,
            first_name: assigneeData.first_name as string,
            last_name: assigneeData.last_name as string,
            email: assigneeData.email as string,
            skills: Array.isArray(assigneeData.skills) 
              ? (assigneeData.skills as string[]).join(', ') 
              : assigneeData.skills as string
          } : null,
          description: (jobProcess.description as string) || '',
          createdAt: (jobProcess.created_at as string) || new Date().toISOString()
        };
      });
      
      console.log('=== RELOADING PROCESSES AFTER SAVE ===');
      console.log('Fresh job data:', jobData);
      console.log('Reloaded processes:', jobProcesses);
      console.log('=== END RELOAD DEBUG ===');
      
      setProcesses(jobProcesses);
      
    } catch (error) {
      console.error('Error reloading processes from job data:', error);
    }
  }, [t]);

  // Handle saving all changes to API
  const handleSaveChanges = useCallback(async () => {
    if (!hasChanges || isUpdating) return;

    try {
      setIsUpdating(true);

      // Convert processes to both legacy and new structured formats
      const processesForApi: CreateJobProcess[] = processes.map(p => ({
        name: p.process?.name || 'Unknown Process',
        estimated_hours: p.estimatedHours || 1,
        assignee_id: p.assigneeId || undefined,
        status: p.status as CreateJobProcess['status'],
        description: p.description || ''
      }));

      // Create selected_processes object grouped by category (new structured format)
      const selectedProcessesByCategory = {
        FIRST: [] as Array<{ process_type: string; name: string; estimated_hours: number; assignee_id: string | null; }>,
        SECONDARY: [] as Array<{ process_type: string; name: string; estimated_hours: number; assignee_id: string | null; }>,
        FINAL: [] as Array<{ process_type: string; name: string; estimated_hours: number; assignee_id: string | null; }>,
      };

      processes.forEach((process) => {
        // Find the process info to determine category
        const processInfo = ALL_MANUFACTURING_PROCESSES.find(p => 
          p.name === process.process?.name || 
          p.name.toLowerCase() === process.process?.name?.toLowerCase() ||
          p.id === process.processId
        );
        
        const processDetail = {
          process_type: process.processId, // Use processId as process_type
          name: process.process?.name || 'Unknown Process', // Include process name
          estimated_hours: process.estimatedHours || 1,
          assignee_id: process.assigneeId || null,
        };

        if (processInfo) {
          const category = processInfo.category as 'FIRST' | 'SECONDARY' | 'FINAL';
          selectedProcessesByCategory[category].push(processDetail);
    } else {
          // Default to SECONDARY if category not found
          selectedProcessesByCategory.SECONDARY.push(processDetail);
        }
      });

      // Prepare the update payload with both formats
      const updatePayload = {
        processes: processesForApi, // Legacy format for backward compatibility
        selected_processes: selectedProcessesByCategory, // New structured format
      };

      console.log('=== SAVING PROCESSES DEBUG ===');
      console.log('Current processes state:', processes);
      console.log('Processes for API (legacy format):', processesForApi);
      console.log('Selected processes by category (new format):', selectedProcessesByCategory);
      console.log('Final update payload:', updatePayload);
      console.log('=== END DEBUG ===');

      // Update job via API
      await jobApiService.updateJob(job.id, updatePayload as Record<string, unknown>);

      // Fetch the updated job data to get the latest state from API
      console.log('Fetching updated job data after save...');
      const updatedJob = await jobApiService.getJobById(job.id);
      console.log('Updated job data received:', updatedJob);

      // Update parent component with the fresh job data
      onUpdateProcesses(processes, updatedJob);
      
      // Reload the processes from the updated job data to ensure UI shows latest state
      await reloadProcessesFromJob(updatedJob);
      
      // Clear the changes flag
      setHasChanges(false);
      
      showSuccess('Process changes saved successfully');
      
    } catch (error) {
      console.error('Error saving process changes:', error);
      showError('Failed to save process changes. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [job.id, processes, hasChanges, isUpdating, onUpdateProcesses, showSuccess, showError, reloadProcessesFromJob]);

  // Handle discarding changes
  const handleDiscardChanges = useCallback(async () => {
    if (!hasChanges) return;

    try {
      setIsLoading(true);
      
      // Reload processes from the current job data (revert to original state)
      await reloadProcessesFromJob(job);
      
      // Clear the changes flag
      setHasChanges(false);
      
    } catch (error) {
      console.error('Error discarding changes:', error);
      showError('Failed to discard changes');
    } finally {
      setIsLoading(false);
    }
  }, [job, hasChanges, reloadProcessesFromJob, showError]);


  // Fetch job processes when job changes
  useEffect(() => {
    if (!job?.id) return;

    const fetchJobProcesses = async () => {
      try {
        setIsLoading(true);
        
        // Handle both old processes format and new selected_processes format
        let processesToLoad: Record<string, unknown>[] = [];
        
        // Check if job has the new selected_processes structure
        if (job.selected_processes && typeof job.selected_processes === 'object') {
          // Convert selected_processes to processes format
          const allSelectedProcesses: Record<string, unknown>[] = [];
          Object.entries(job.selected_processes).forEach(([category, processes]) => {
            if (Array.isArray(processes)) {
              processes.forEach((process: Record<string, unknown>, index: number) => {
                allSelectedProcesses.push({
                  id: process.id || `${category}_${index}`,
                  process: {
                    id: process.process_type || process.id,
                    name: process.name || 'Unknown Process'
                  },
                  estimated_hours: process.estimated_hours || 1,
                  assignee: process.assignee_id ? {
                    id: process.assignee_id as string,
                    first_name: (process.assignee_name as string)?.split(' ')[0] || '',
                    last_name: (process.assignee_name as string)?.split(' ').slice(1).join(' ') || '',
                    email: '',
                    skills: ''
                  } : null,
                  status: process.status || 'TODO',
                  order: process.order || allSelectedProcesses.length + 1,
                  description: process.description || '',
                  created_at: process.created_at || new Date().toISOString()
                });
              });
            }
          });
          processesToLoad = allSelectedProcesses;
        } else {
          // Use old processes format
          processesToLoad = (job.processes || []) as unknown as Record<string, unknown>[];
        }
        
        // Use JobProcess data directly from API
        const jobProcesses: JobProcess[] = processesToLoad.map((jobProcess, index) => {
          // Get estimated hours from the API response
          const estimatedHours = parseFloat(String(jobProcess.estimated_hours)) || 1;
          const processData = jobProcess.process as Record<string, unknown> | undefined;
          const assigneeData = jobProcess.assignee as Record<string, unknown> | undefined;
          
          return {
            id: jobProcess.id as string,
            processId: processData?.id as string || jobProcess.id as string,
            order: (jobProcess.order as number) || index + 1,
            estimatedHours: estimatedHours,
            assigneeId: assigneeData?.id as string || null,
            status: (jobProcess.status as string) || 'TODO',
            processNumber: index + 1,
            process: {
              id: processData?.id as string || jobProcess.id as string,
              name: processData?.name as string || t('jobs.detail.processes.unknownProcess', 'Unknown Process')
            },
            assignee: assigneeData ? {
              id: assigneeData.id as string,
              first_name: assigneeData.first_name as string,
              last_name: assigneeData.last_name as string,
              email: assigneeData.email as string,
              skills: Array.isArray(assigneeData.skills) 
                ? (assigneeData.skills as string[]).join(', ') 
                : assigneeData.skills as string
            } : null,
            description: (jobProcess.description as string) || '',
            createdAt: (jobProcess.created_at as string) || new Date().toISOString()
          };
        });
        
        console.log('=== INITIAL LOADING PROCESSES DEBUG ===');
        console.log('Raw job data:', job);
        console.log('Processes to load:', processesToLoad);
        console.log('Converted job processes:', jobProcesses);
        console.log('=== END INITIAL LOADING DEBUG ===');
        
        setProcesses(jobProcesses);
        setHasChanges(false);
        
      } catch (error) {
        console.error('Error fetching job processes:', error);
        showError(t('jobs.detail.processes.messages.failedToFetch'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobProcesses();
  }, [job, t, showError]);

  if (isLoading) {
  return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Loading spinner for API operations */}
      <LoadingSpinner 
        open={isUpdating} 
        message={isUpdating ? t('jobs.detail.processes.messages.savingChanges') : t('common.processing')} 
        size={50}
      />
      
      
      

      {/* PROCESS SELECTION SECTION - Same as Add/Edit Modal */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Required Processes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select the manufacturing processes required for this job and assign estimated time and workers.
        </Typography>
        
        {(() => {
          const selectedProcesses = processes.map(p => ({
            processId: p.processId || p.id,
            name: p.process?.name || 'Unknown Process',
            category: ALL_MANUFACTURING_PROCESSES.find(mp => 
              mp.name === p.process?.name || 
              mp.name.toLowerCase() === p.process?.name?.toLowerCase()
            )?.category || 'SECONDARY',
            selected: true,
            estimatedHours: p.estimatedHours || 1,
            assigneeId: p.assigneeId || null
          }));

          const totalEstimated = selectedProcesses.reduce((sum, p) => sum + p.estimatedHours, 0);
          const selectedCount = selectedProcesses.length;

          // Worker options for dropdowns
          const workerOptions = [
            { value: '', label: 'Unassigned' },
            ...workers
              .filter(worker => worker.is_active)
              .map(worker => {
                let skillsText = 'No skills listed';
                
                if (worker.skills) {
                  if (Array.isArray(worker.skills)) {
                    skillsText = worker.skills.length > 0 ? worker.skills.join(', ') : 'No skills listed';
                  } else if (typeof worker.skills === 'string' && worker.skills.trim()) {
                    skillsText = worker.skills.trim();
                  }
                }
                
                return {
                  value: worker.id,
                  label: `${worker.first_name} ${worker.last_name} (${skillsText})`
                };
              })
          ];

          const categories = [
            { key: 'FIRST', title: 'FIRST Processes', color: '#2196F3', description: 'Initial operations including drafting, cutting, and material preparation', processes: ALL_MANUFACTURING_PROCESSES.filter(p => p.category === 'FIRST') },
            { key: 'SECONDARY', title: 'SECONDARY Processes', color: '#FF9800', description: 'Fabrication operations including forming, welding, machining, and finishing', processes: ALL_MANUFACTURING_PROCESSES.filter(p => p.category === 'SECONDARY') },
            { key: 'FINAL', title: 'FINAL Processes', color: '#4CAF50', description: 'Completion operations including assembly, packaging, and delivery', processes: ALL_MANUFACTURING_PROCESSES.filter(p => p.category === 'FINAL') }
          ];

          return (
            <Box>
              {/* Summary */}
              <Box sx={{ mb: 3, p: 2, bgcolor: hasChanges ? 'warning.50' : 'primary.50', borderRadius: 1, border: '1px solid', borderColor: hasChanges ? 'warning.200' : 'primary.200' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: hasChanges ? 'warning.main' : 'primary.main' }}>
                  {selectedCount} of {ALL_MANUFACTURING_PROCESSES.length} processes selected
                  {hasChanges && ' (Unsaved changes)'}
          </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total estimated: {totalEstimated.toFixed(1)} hours
                      </Typography>
                {hasChanges && (
                  <Typography variant="caption" sx={{ color: 'warning.main', fontStyle: 'italic', mt: 0.5, display: 'block' }}>
                    You have unsaved changes. Click &quot;Save Changes&quot; to apply them.
                      </Typography>
                )}
              </Box>

              {/* Process Categories */}
              {categories.map((category) => {
                const categorySelected = selectedProcesses.filter(sp => sp.category === category.key);
                
                return (
                  <Paper key={category.key} sx={{ mb: 3, overflow: 'hidden' }}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        bgcolor: category.color + '10',
                        borderLeft: `4px solid ${category.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ color: category.color, fontWeight: 600 }}>
                          {category.title} ({categorySelected.length} of {category.processes.length} selected)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {category.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ p: 2 }}>
                      <FormGroup>
                        {category.processes.map((process) => {
                          const selectedProcess = selectedProcesses.find(sp => sp.processId === process.id);
                          const isSelected = Boolean(selectedProcess);
                          
                          return (
                            <Box key={process.id} sx={{ 
                              mb: 2, 
                              p: 1, 
                              borderRadius: 1, 
                              bgcolor: isSelected && hasChanges ? 'action.hover' : 'transparent',
                              border: isSelected && hasChanges ? '1px solid' : '1px solid transparent',
                              borderColor: isSelected && hasChanges ? 'warning.light' : 'transparent'
                            }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={(e) => handleProcessToggle(process, e.target.checked)}
                                    disabled={isUpdating}
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {process.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {process.description}
                                    </Typography>
                                  </Box>
                                }
                              />
                              
                              <Collapse in={isSelected}>
                                <Box sx={{ ml: 4, mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <InputText
                      type="number"
                                    label="Estimated Hours"
                                    value={selectedProcess?.estimatedHours?.toString() || '1'}
                                    onChange={(e) => handleProcessUpdate(process.id, 'estimatedHours', parseFloat(e.target.value) || 1)}
                                    size="small"
                                    sx={{ width: 140 }}
                                    inputProps={{ min: 0.25, step: 0.25, max: 999 }}
                                    disabled={isUpdating}
                                  />
                                  
                                  <Select
                                    label="Assign Worker"
                                    value={selectedProcess?.assigneeId || ""}
                                    options={workerOptions}
                                    onChange={(e) => handleProcessUpdate(process.id, 'assigneeId', e.target.value || null)}
                                    FormControlProps={{ size: 'small', sx: { minWidth: 200 } }}
                                    disabled={isUpdating}
                                  />
                                </Box>
                              </Collapse>
                            </Box>
                          );
                        })}
                      </FormGroup>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          );
        })()}

        {/* Save Changes Button */}
        {hasChanges && (
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleDiscardChanges}
              disabled={isUpdating}
              size="medium"
            >
              Discard Changes
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSaveChanges}
              disabled={isUpdating}
              startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : null}
              size="medium"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
} 