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
import PauseIcon from '@mui/icons-material/Pause';
import PersonIcon from '@mui/icons-material/Person';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import TimerIcon from '@mui/icons-material/Timer';
import { 
  Box, 
  Typography, 
  Paper,
  Chip,
  alpha,
  useTheme,
  Button,
  LinearProgress,
  Alert,
  Stack,
  CircularProgress,
  Skeleton
} from '@mui/material';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { priorityColors } from '@/components/job/add/constants';
import { statusColors, ALL_MANUFACTURING_PROCESSES } from '@/components/job/constant';
import { jobApiService } from '@/services/api/jobApi';
import { getTimerStorageKey, hasTimerStorage, clearJobTimerStorage } from '@/utils/timerStorage';
import { useToastActions } from '@/views/components/providers';
import { 
  JobOverviewTabProps, 
  TimerState, 
  TimerResponse 
} from '../types';

export default function JobOverviewTab({ job, onUpdateJob, isActive = true }: JobOverviewTabProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { showSuccess, showError } = useToastActions();

  // Timer constants


  const UPDATE_INTERVAL = 1000; // Update every second
  const SAVE_INTERVAL = 60000;
  const STORAGE_KEY_PREFIX = 'jobTimer_';

  // Timer state and refs
  const displayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTimerLoading, setIsTimerLoading] = useState(true);
  
  const [timerState, setTimerState] = useState<TimerState>(() => {
    const savedState = localStorage.getItem(STORAGE_KEY_PREFIX + job.id);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        const totalElapsed = job.labour_units_elapsed * 3600;
        
        if (parsed.isRunning && parsed.serverStartTime) {
          // Calculate time based on server timestamps for accuracy
          const serverStartTime = new Date(parsed.serverStartTime).getTime();
          const currentTime = Date.now();
          const currentSessionTime = (currentTime - serverStartTime) / 1000;
          
          return {
            ...parsed,
            displaySeconds: totalElapsed + currentSessionTime,
            totalElapsed,
            labourUnitsElapsed: parsed.labourUnitsElapsed || job.labour_units_elapsed,
          };
        }
        
        return {
          ...parsed,
          displaySeconds: totalElapsed,
          totalElapsed,
          labourUnitsElapsed: parsed.labourUnitsElapsed || job.labour_units_elapsed,
        };
      } catch (error) {
        console.error('Failed to parse saved timer state:', error);
      }
    }
    
    const totalElapsed = job.labour_units_elapsed * 3600;
    return {
      isRunning: false,
      startTime: null,
      displaySeconds: totalElapsed,
      totalElapsed,
      serverStartTime: null,
      serverCurrentTime: null,
      labourUnitsElapsed: job.labour_units_elapsed,
    };
  });
  
  // Function to get status color
  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors]?.main || theme.palette.grey[500];
  };

  // Function to get priority color
  const getPriorityColor = (priority: string) => {
    return priorityColors[priority as keyof typeof priorityColors]?.main || theme.palette.grey[500];
  };

  // Timer functions
  const saveToLocalStorage = useCallback((state: TimerState) => {
    try {
      const storageKey = getTimerStorageKey(job.id);
      localStorage.setItem(storageKey, JSON.stringify({
        isRunning: state.isRunning,
        startTime: state.startTime,
        displaySeconds: state.displaySeconds,
        totalElapsed: state.totalElapsed,
        serverStartTime: state.serverStartTime,
        serverCurrentTime: state.serverCurrentTime,
        labourUnitsElapsed: state.labourUnitsElapsed,
      }));
    } catch (error) {
      console.error('Failed to save timer state to localStorage:', error);
    }
  }, [job.id]);

  // Function to update timer state from backend data  
  const updateTimerFromBackend = useCallback((response: TimerResponse) => {
    // Handle different response structures
    const timerData = response.timer_data || response;
    const activeSession = response.active_session;
    
    const isRunning = timerData.status === "ACTIVE";
    
    // Get start time from active_session or response
    const startTimeStr = activeSession?.start_time || response.start_time || ('timer_start_time' in timerData ? timerData.timer_start_time : undefined);
    let serverStartTime = null;
    let adjustedStartTime = null;
    
    if (startTimeStr && startTimeStr !== "Invalid Date") {
      serverStartTime = new Date(startTimeStr).getTime();
      if (!isNaN(serverStartTime)) {
        adjustedStartTime = serverStartTime; // Use server time directly for now
      }
    }
    
    // Get total elapsed hours from response
    const totalElapsedHours = timerData.total_elapsed_hours || response.total_elapsed_hours || 0;
    const totalElapsed = totalElapsedHours * 3600; // Convert hours to seconds
    
    // Calculate current session time if timer is running
    let currentSessionTime = 0;
    let finalStartTime = adjustedStartTime;
    
    if (isRunning && adjustedStartTime) {
      // Use server start time for accurate calculation
      currentSessionTime = (Date.now() - adjustedStartTime) / 1000;
    } else if (isRunning && (activeSession?.current_duration_hours || ('current_session_hours' in timerData && timerData.current_session_hours))) {
      // Prefer active_session.current_duration_hours over timer_data.current_session_hours
      const backendSessionHours = activeSession?.current_duration_hours || 
        ('current_session_hours' in timerData ? timerData.current_session_hours : 0) || 0;
      currentSessionTime = backendSessionHours * 3600;
      
      // Calculate what the start time should be based on backend time
      // This ensures continuity without jumps
      finalStartTime = Date.now() - (currentSessionTime * 1000);
      
      console.log('📊 Timer sync from backend:', {
        source: activeSession?.current_duration_hours ? 'active_session' : 'timer_data',
        backendSessionHours: backendSessionHours,
        backendSessionSeconds: currentSessionTime,
        calculatedStartTime: new Date(finalStartTime).toLocaleTimeString(),
        currentTime: new Date().toLocaleTimeString()
      });
    } else if (isRunning && !adjustedStartTime) {
      // If timer is running but no start time, use current time as start
      finalStartTime = Date.now();
      currentSessionTime = 0;
    }
    
    const displaySeconds = totalElapsed + currentSessionTime;
    
    const newState: TimerState = {
      isRunning,
      startTime: finalStartTime,
      displaySeconds: displaySeconds,
      totalElapsed: totalElapsed,
      serverStartTime: startTimeStr || null,
      serverCurrentTime: new Date().toISOString(), // Current time
      labourUnitsElapsed: totalElapsedHours,
    };
    
    setTimerState(newState);
    saveToLocalStorage(newState);
    
    console.log('Timer updated from backend:', {
      status: timerData.status,
      startTime: startTimeStr,
      finalStartTime: finalStartTime,
      totalElapsedHours: totalElapsedHours,
      activeSessionHours: activeSession?.current_duration_hours,
      timerDataSessionHours: 'current_session_hours' in timerData ? timerData.current_session_hours : undefined,
      currentSessionTime: currentSessionTime,
      displaySeconds: displaySeconds,
      isRunning: isRunning,
      willStartInterval: isRunning && !!finalStartTime,
      timeDifference: finalStartTime ? (Date.now() - finalStartTime) / 1000 : 0
    });
  }, [saveToLocalStorage]);

  // Save elapsed time to backend - only call during ACTIVE timer sessions
  // pause/complete APIs handle their own elapsed time updates
  const saveToBackend = useCallback(async (elapsedHours: number) => {
    try {
      console.log(`💾 Saving timer progress: ${elapsedHours.toFixed(2)} hours`);
      const response = await jobApiService.updateElapsedTime(job.id, elapsedHours);
      
      // If the response contains updated job data, use it
      if (response.job) {
        onUpdateJob(response.job);
      } else if (response.timer_data) {
        // Update timer state if timer_data is returned
        updateTimerFromBackend(response.timer_data);
      }
    } catch (error) {
      console.error('Failed to save timer to backend:', error);
    }
  }, [job.id, onUpdateJob, updateTimerFromBackend]);

  const handleStart = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Call backend API to start timer - this should return timer_data structure
      const response = await jobApiService.startTimer(job.id);
      
      // Handle the actual response structure
      if (response && (response.timer_data || response.status)) {
        updateTimerFromBackend(response);
        showSuccess('Timer started');
      } else {
        // Fallback for unexpected response structure
        const now = Date.now();
        const newState: TimerState = {
          ...timerState,
          isRunning: true,
          startTime: now,
          serverStartTime: new Date().toISOString(),
          serverCurrentTime: new Date().toISOString(),
        };
        
        setTimerState(newState);
        saveToLocalStorage(newState);
        showSuccess('Timer started');
      }
      
      console.log('✅ Timer started for job:', job.id);
    } catch (error) {
      console.error('Failed to start timer:', error);
      showError('Failed to start timer');
    } finally {
      setIsLoading(false);
    }
  }, [timerState, saveToLocalStorage, showSuccess, showError, job.id, isLoading, updateTimerFromBackend]);

  const handlePause = useCallback(async () => {
    if (isLoading || !timerState.isRunning || !timerState.startTime) return;
    
    setIsLoading(true);
    
    try {
      // Call backend API to pause timer - this should return updated timer_data
      const response = await jobApiService.pauseTimer(job.id);
      
      // Handle the actual response structure
      if (response && (response.timer_data || response.status)) {
        updateTimerFromBackend(response);
        const elapsedHours = response.timer_data?.total_elapsed_hours || response.total_elapsed_hours || 0;
        
        showSuccess(`Timer paused. Total elapsed: ${elapsedHours.toFixed(2)} hours`);
      } else {
        // Fallback for old API response structure
        const currentSessionTime = (Date.now() - timerState.startTime) / 1000;
        const newTotalElapsed = timerState.totalElapsed + currentSessionTime;
        const elapsedHours = newTotalElapsed / 3600;
        
        const newState: TimerState = {
          ...timerState,
          isRunning: false,
          startTime: null,
          displaySeconds: newTotalElapsed,
          totalElapsed: newTotalElapsed,
        };
        
        setTimerState(newState);
        saveToLocalStorage(newState);
        await saveToBackend(elapsedHours);
        showSuccess(`Timer paused. Total elapsed: ${elapsedHours.toFixed(2)} hours`);
      }
      
      console.log('⏸️ Timer paused for job:', job.id);
    } catch (error) {
      console.error('Failed to pause timer:', error);
      showError('Failed to save timer progress');
    } finally {
      setIsLoading(false);
    }
  }, [timerState, saveToLocalStorage, saveToBackend, showSuccess, showError, job.id, isLoading, updateTimerFromBackend]);

  const handleComplete = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Call backend API to complete job - this should return updated timer_data and job
      const response = await jobApiService.completeJob(job.id);
      
      // Handle the actual response structure
      if (response && (response.timer_data || response.status)) {
        updateTimerFromBackend(response);
        const elapsedHours = response.timer_data?.total_elapsed_hours || response.total_elapsed_hours || 0;
        
        // Clear localStorage for completed job
        clearJobTimerStorage(job.id);
        
        // Update job data if provided
        if (response.job) {
          onUpdateJob(response.job);
        }
        
        showSuccess(`Job completed! Total time: ${elapsedHours.toFixed(2)} hours`);
      } else {
        // Fallback for old API response structure
        let finalElapsed = timerState.totalElapsed;
        if (timerState.isRunning && timerState.startTime) {
          const currentSessionTime = (Date.now() - timerState.startTime) / 1000;
          finalElapsed = timerState.totalElapsed + currentSessionTime;
        }
        
        const elapsedHours = finalElapsed / 3600;
        
        const updatedJob = await jobApiService.updateJob(job.id, {
          labour_units_elapsed: elapsedHours,
          status: 'COMPLETE'
        });
        
        const newState: TimerState = {
          ...timerState,
          isRunning: false,
          startTime: null,
          displaySeconds: finalElapsed,
          totalElapsed: finalElapsed,
        };
        
        setTimerState(newState);
        clearJobTimerStorage(job.id);
        onUpdateJob(updatedJob);
        showSuccess(`Job completed! Total time: ${elapsedHours.toFixed(2)} hours`);
      }
      
      console.log('🏁 Job completed for job:', job.id);
    } catch (error) {
      console.error('Failed to complete job:', error);
      showError('Failed to complete job');
    } finally {
      setIsLoading(false);
    }
  }, [timerState, job.id, onUpdateJob, showSuccess, showError, isLoading, updateTimerFromBackend]);

  const formatTime = (seconds: number): string => {
    // Handle NaN, undefined, null, or invalid values
    if (!seconds || isNaN(seconds) || seconds < 0) {
      return "00:00:00";
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effects
  useEffect(() => {
    if (timerState.isRunning && timerState.startTime) {
      console.log('🚀 Starting timer interval, isRunning:', timerState.isRunning, 'startTime:', timerState.startTime);
      
      displayIntervalRef.current = setInterval(() => {
        const currentSessionTime = (Date.now() - timerState.startTime!) / 1000;
        const totalDisplayTime = timerState.labourUnitsElapsed * 3600 + currentSessionTime;
        
        console.log('⏱️ Timer tick - currentSessionTime:', currentSessionTime.toFixed(1), 'totalDisplayTime:', totalDisplayTime.toFixed(1));
        
        setTimerState(prev => ({
          ...prev,
          displaySeconds: totalDisplayTime,
        }));
      }, UPDATE_INTERVAL);
      
      // Also update immediately when timer starts
      const currentSessionTime = (Date.now() - timerState.startTime!) / 1000;
      const totalDisplayTime = timerState.labourUnitsElapsed * 3600 + currentSessionTime;
      setTimerState(prev => ({
        ...prev,
        displaySeconds: totalDisplayTime,
      }));
      
    } else {
      console.log('⏹️ Stopping timer interval, isRunning:', timerState.isRunning, 'startTime:', timerState.startTime);
      if (displayIntervalRef.current) {
        clearInterval(displayIntervalRef.current);
        displayIntervalRef.current = null;
      }
    }

    return () => {
      if (displayIntervalRef.current) {
        clearInterval(displayIntervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.startTime, timerState.labourUnitsElapsed]);

  useEffect(() => {
    if (timerState.isRunning && timerState.startTime) {
      saveIntervalRef.current = setInterval(() => {
        const currentSessionTime = (Date.now() - timerState.startTime!) / 1000;
        const totalElapsed = timerState.totalElapsed + currentSessionTime;
        const elapsedHours = totalElapsed / 3600;
        saveToBackend(elapsedHours);
      }, SAVE_INTERVAL);
    } else {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    }

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.startTime, timerState.totalElapsed, saveToBackend]);

  useEffect(() => {
    return () => {
      if (displayIntervalRef.current) clearInterval(displayIntervalRef.current);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, []);

  // Load timer state from localStorage first, then backend only if needed
  useEffect(() => {
    const loadTimerState = async () => {
      setIsTimerLoading(true);
      
      try {
        // First check if we have valid timer state in localStorage
        if (hasTimerStorage(job.id)) {
          try {
            const storageKey = getTimerStorageKey(job.id);
            const savedState = localStorage.getItem(storageKey);
            const parsed = JSON.parse(savedState!);
            
            console.log('📱 Loading timer state from localStorage:', {
              isRunning: parsed.isRunning,
              startTime: new Date(parsed.startTime).toLocaleTimeString(),
              labourUnitsElapsed: parsed.labourUnitsElapsed
            });
            
            // Use localStorage state and skip API call
            setTimerState({
              isRunning: parsed.isRunning,
              startTime: parsed.startTime,
              displaySeconds: parsed.displaySeconds || 0,
              totalElapsed: parsed.totalElapsed || 0,
              serverStartTime: parsed.serverStartTime || null,
              serverCurrentTime: parsed.serverCurrentTime || null,
              labourUnitsElapsed: parsed.labourUnitsElapsed || 0,
            });
            
            // Small delay to ensure timer display is rendered
            setTimeout(() => setIsTimerLoading(false), 100);
            return; // Skip API call
          } catch (error) {
            console.log('⚠️ Failed to parse localStorage timer state:', error);
            // Continue to API call if localStorage is corrupted
          }
        }
        
        // Only make API call if no valid localStorage state found
        try {
          console.log('🔄 No valid localStorage state, loading from backend...', { jobId: job.id, isActive });
          const response = await jobApiService.getActiveTimerSession(job.id);
          if (response && (response.timer_data || response.status || response.active_session)) {
            updateTimerFromBackend(response);
            const status = response.timer_data?.status || response.status || 'UNKNOWN';
            console.log('✅ Timer state loaded from backend:', status);
          } else {
            console.log('ℹ️ No active timer session found');
          }
        } catch (error) {
          console.log('⚠️ No active timer session found or failed to load:', error);
          // This is expected for jobs without active timers
        }
      } finally {
        // Ensure loader is hidden after timer initialization
        setTimeout(() => setIsTimerLoading(false), 200);
      }
    };

    // Only load timer state when the tab is active
    if (isActive) {
      loadTimerState();
    } else {
      // Hide loader when tab is not active
      setIsTimerLoading(false);
    }
  }, [job.id, updateTimerFromBackend, isActive]);

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

  // Calculate total estimated hours from all processes
  const calculateTotalEstimatedHours = (): number => {
    let totalHours = 0;
    
    // Check new format first (selected_processes)
    if (job.selected_processes) {
      const { FIRST = [], SECONDARY = [], FINAL = [] } = job.selected_processes;
      const allProcesses = [...FIRST, ...SECONDARY, ...FINAL];
      totalHours = allProcesses.reduce((sum, process) => sum + (process.estimated_hours || 0), 0);
    }
    // Fallback to legacy format (processes)
    else if (job.processes && job.processes.length > 0) {
      totalHours = job.processes.reduce((sum, process) => {
        const hours = typeof process.estimated_hours === 'string' 
          ? parseFloat(process.estimated_hours) || 0 
          : process.estimated_hours || 0;
        return sum + hours;
      }, 0);
    }
    // Final fallback to labour_units
    else {
      totalHours = job.labour_units || 0;
    }
    
    console.log('📊 Estimated hours calculation:', {
      hasSelectedProcesses: !!job.selected_processes,
      hasLegacyProcesses: !!job.processes?.length,
      totalHours: totalHours,
      labourUnits: job.labour_units,
      finalEstimatedHours: totalHours || 1
    });
    
    return totalHours || 1; // Ensure we never divide by zero
  };

  // Calculate timer values with proper validation
  const displaySeconds = timerState.displaySeconds || 0;
  const elapsedHours = !isNaN(displaySeconds) && displaySeconds >= 0 ? displaySeconds / 3600 : 0;
  const estimatedHours = calculateTotalEstimatedHours();
  const progressPercentage = Math.min((elapsedHours / estimatedHours) * 100, 100);
  const isOverTime = elapsedHours > estimatedHours;
  const timeStatus = isOverTime ? 'error' : 'success';

  return (
    <Box sx={{ 
      maxWidth: '100%', 
      animation: 'fadeIn 0.5s ease-in-out',
      '@keyframes fadeIn': {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      }
    }}>
      {/* Job Timer Component */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3, 
          border: `2px solid ${isOverTime ? '#f44336' : '#4caf50'}`,
          borderRadius: 2,
          background: isOverTime 
            ? 'linear-gradient(135deg, #ffebee 0%, #ffffff 100%)'
            : 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)',
          opacity: isLoading ? 0.7 : 1,
          transition: 'all 0.2s ease-in-out',
          position: 'relative',
        }}
      >
        {isTimerLoading ? (
          /* Timer Loading State */
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Loading Timer...
              </Typography>
            <Typography variant="body2" color="text.secondary">
              Initializing job timer data
              </Typography>
            
            {/* Skeleton placeholders */}
            <Box sx={{ mt: 3 }}>
              <Skeleton 
                variant="text" 
                width="60%" 
                height={80} 
                sx={{ mx: 'auto', mb: 2 }} 
              />
              <Skeleton 
                variant="text" 
                width="80%" 
                height={30} 
                sx={{ mx: 'auto', mb: 1 }} 
              />
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={8} 
                sx={{ mb: 2, borderRadius: 1 }} 
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 1 }} />
              </Box>
            </Box>
          </Box>
        ) : (
          <>
            {/* Timer Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TimerIcon color={timeStatus} sx={{ mr: 1.5, fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600} color={timeStatus}>
                Job Timer
              </Typography>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Chip 
                  label={timerState.isRunning ? 'RUNNING' : 'STOPPED'} 
                  color={timerState.isRunning ? 'success' : 'default'}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                {job.status === 'COMPLETE' && (
                  <Chip label="COMPLETED" color="success" size="small" />
                )}
              </Box>
            </Box>

            {/* Time Display */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography 
                variant="h2" 
                fontWeight={700} 
                color={timeStatus} 
                sx={{ 
                  mb: 1,
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em'
                }}
              >
                {formatTime(timerState.displaySeconds)}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Elapsed: {elapsedHours.toFixed(2)} hours / Estimated: {estimatedHours.toFixed(2)} hours
              </Typography>
              {timerState.isRunning && (
                <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>
                  ⏱️ Timer running since {new Date(timerState.startTime!).toLocaleTimeString()}
                  </Typography>
              )}
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Progress
              </Typography>
                <Typography variant="body2" color={timeStatus} fontWeight={600}>
                  {progressPercentage.toFixed(1)}%
              </Typography>
      </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(progressPercentage, 100)}
            color={timeStatus}
            sx={{ 
              height: 12, 
              borderRadius: 6,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
                transition: 'transform 0.2s ease-in-out',
              }
            }} 
          />
        </Box>

        {/* Status Alerts */}
        {isOverTime && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={500}>
              ⚠️ Job is running over the estimated time by {(elapsedHours - estimatedHours).toFixed(2)} hours
              </Typography>
          </Alert>
        )}

        {job.status === 'COMPLETE' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={500}>
              ✅ Job completed! Final time: {elapsedHours.toFixed(2)} hours
              </Typography>
          </Alert>
        )}

        {/* Control Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center">
          {!timerState.isRunning ? (
          <Button 
              variant="contained"
              color="success"
              startIcon={<PlayArrowIcon />}
              onClick={handleStart}
              disabled={isLoading || job.status === 'COMPLETE'}
              size="large"
              sx={{ minWidth: 140, py: 1.5 }}
            >
              {elapsedHours === 0 ? 'Start Job' : 'Resume'}
          </Button>
          ) : (
          <Button 
            variant="contained" 
              color="warning"
              startIcon={<PauseIcon />}
              onClick={handlePause}
              disabled={isLoading}
              size="large"
              sx={{ minWidth: 140, py: 1.5 }}
            >
              Pause Job
          </Button>
          )}
          
          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleComplete}
            disabled={isLoading || job.status === 'COMPLETE'}
            size="large"
            sx={{ minWidth: 140, py: 1.5 }}
          >
            Complete Job
          </Button>
            </Stack>
          </>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 2,
          }}>
            <Typography variant="body2" color="text.secondary">
              Processing timer action...
              </Typography>
          </Box>
        )}
      </Paper>

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
          <InfoRow label={t('jobs.detail.overview.labourUnits')} value={`${estimatedHours.toFixed(2)} hours`} />
          <InfoRow label={t('jobs.detail.overview.labourUnitsElapsed')} value={formatTime(timerState.displaySeconds)} />
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