"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Button, 
  Divider,
  Alert,
  IconButton
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import JobDocumentsTab from "@/components/job/detail/TabPages/documents-tab";
import JobOverviewTab from "@/components/job/detail/TabPages/overview-tab";
import JobProcessesTab from "@/components/job/detail/TabPages/processes-tab";
import { JobProcess, Document } from "@/components/job/detail/types";
import type { Job } from "@/models/job";
import { jobApiService } from "@/services/api/jobApi";
import LoadingSpinner from "@/views/components/common/LoadingSpinner";
import { useToastActions } from "@/views/components/providers";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`job-tabpanel-${index}`}
      aria-labelledby={`job-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `job-tab-${index}`,
    'aria-controls': `job-tabpanel-${index}`,
  };
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.jobId as string;
  const { t } = useTranslation();
  
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Use toast actions for error messages only (success messages handled by child components)
  const { showError } = useToastActions();

  // Redirect if no jobId is provided
  useEffect(() => {
    if (!jobId) {
      router.push('/job/list');
      return;
    }
  }, [jobId, router]);

  // Fetch job data from API
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch job data with all related data (processes, documents)
        const jobData = await jobApiService.getJobById(jobId);
        
        setJob(jobData);
      } catch (error) {
        console.error('Error fetching job:', error);
        setError(t('jobs.detail.messages.failedToLoad'));
        showError('Failed to load job details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId, t, showError]);

  // Early return if no jobId to prevent rendering (after all hooks)
  if (!jobId) {
    return null;
  }

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBackToJobs = () => {
    router.push('/job/list');
  };



  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Update processes
  const handleUpdateProcesses = async (processes: JobProcess[], fullJobData?: Job) => {
    if (!job) return;
    
    try {
      // If full job data is provided, use it to update the entire job state
      if (fullJobData) {
        setJob(fullJobData);
        // Don't show success message here as child components handle their own success messages
      } else {
        // Fallback: Update local state with just processes for immediate UI feedback
        const updatedJob = {
          ...job,
          processes: processes as unknown as Job['processes'] // Keep the JobProcess format
        };
        
        setJob(updatedJob);
        // Don't show success message here as child components handle their own success messages
      }
    } catch (error) {
      console.error('Error updating job processes:', error);
      showError(t('jobs.detail.messages.processesUpdateError'));
    }
  };

  // Update documents
  const handleUpdateDocuments = (documents: Document[], fullJobData?: Job) => {
    if (!job) return;
    
    try {
      // If full job data is provided, use it to update the entire job state
      if (fullJobData) {
        setJob(fullJobData);
        // Don't show success message here as child components handle their own success messages
      } else {
        // Fallback: Update local state with just documents for immediate UI feedback
        const updatedJob = {
          ...job,
          documents: documents as unknown as Job['documents'] // Keep the Document format
        };
        
        setJob(updatedJob);
        // Don't show success message here as child components handle their own success messages
      }
    } catch (error) {
      console.error('Error updating documents:', error);
      showError(t('jobs.detail.messages.documentsUpdateError'));
    }
  };

  if (isLoading) {
    return (
      <LoadingSpinner 
        open={isLoading} 
        message={t('jobs.detail.messages.loadingJob')} 
        size={60}
      />
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={handleBackToJobs}>
          {t('jobs.detail.backToJobs')}
        </Button>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('jobs.detail.messages.jobNotFound')}
        </Alert>
        <Button variant="outlined" onClick={handleBackToJobs}>
          {t('jobs.detail.backToJobs')}
        </Button>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      sx={{ 
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ px: 3, pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={handleBackToJobs}
              sx={{ mr: 1 }}
              component={motion.button}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h4" 
              component={motion.h1}
              variants={itemVariants}
            >
              {job.job}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />
      </Box>

      <Box sx={{ px: 3, pb: 3, flex: 1, overflow: 'hidden' }}>
        <Paper sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleChangeTab} 
              aria-label="job detail tabs"
              variant="fullWidth"
            >
              <Tab label={t('jobs.detail.tabs.overview')} {...a11yProps(0)} />
              <Tab label={t('jobs.detail.tabs.processes')} {...a11yProps(1)} />
              <Tab label={t('jobs.detail.tabs.documents')} {...a11yProps(2)} />
            </Tabs>
          </Box>
          
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <TabPanel value={tabValue} index={0}>
              <JobOverviewTab 
                job={job} 
                onUpdateJob={(updatedData) => setJob({ ...job, ...updatedData })}
                isActive={tabValue === 0}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <JobProcessesTab 
                job={job}
                onUpdateProcesses={handleUpdateProcesses}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <JobDocumentsTab 
                job={job} 
                onUpdateDocuments={handleUpdateDocuments}
              />
            </TabPanel>
          </Box>
        </Paper>
      </Box>

    </Box>
  );
}