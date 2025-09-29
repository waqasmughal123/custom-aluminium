"use client";

import { Search as SearchIcon } from '@mui/icons-material';
import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import React, { useState, useMemo } from 'react';
import { modalStyle, statusColors } from '../constants';
import type { JobDisplay } from '../../list/types';

interface JobTableModalProps {
  open: boolean;
  onClose: () => void;
  jobs: JobDisplay[];
  onSelectJob: (job: JobDisplay) => void;
  currentCustomer?: string;
}

export default function JobTableModal({
  open,
  onClose,
  jobs,
  onSelectJob,
  currentCustomer,
}: JobTableModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(currentCustomer || '');

  // Get unique customers for filter dropdown
  const customers = useMemo(() => {
    if (!jobs || !Array.isArray(jobs)) return [];
    const uniqueCustomers = [...new Set(jobs.map(job => job.customer).filter(Boolean))];
    return uniqueCustomers.sort();
  }, [jobs]);

  // Filter jobs based on search term and customer
  const filteredJobs = useMemo(() => {
    if (!jobs || !Array.isArray(jobs)) return [];
    
    let filtered = jobs;

    // Filter by customer if selected
    if (selectedCustomer) {
      filtered = filtered.filter(job => job && job.customer === selectedCustomer);
    }

    // Filter by search term (job title, description)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job && (
          (job.job && job.job.toLowerCase().includes(search)) ||
          (job.description && job.description.toLowerCase().includes(search)) ||
          (job.job_number && job.job_number.toLowerCase().includes(search))
        )
      );
    }

    // Sort by most recent first
    return filtered
      .filter(job => job && job.created_at) // Filter out jobs without created_at
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [jobs, searchTerm, selectedCustomer]);

  const handleClose = () => {
    setSearchTerm('');
    setSelectedCustomer(currentCustomer || '');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="job-table-modal"
    >
      <Box sx={{ ...modalStyle, width: 1000, maxHeight: '90vh' }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          Use Previous Job
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select a previous job to copy data from. Jobs are filtered by customer and sorted by most recent.
        </Typography>

        {/* Search and Filter Controls */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Search jobs"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by job title, description, or job number..."
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Customer</InputLabel>
            <Select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              label="Filter by Customer"
            >
              <MenuItem value="">All Customers</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer} value={customer}>
                  {customer}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {filteredJobs.length} job(s)
        </Typography>

        <Box sx={{ maxHeight: '500px', overflow: 'auto', mb: 3 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0, zIndex: 1 }}>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'left' }}>Job #</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'left' }}>Job Title</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    {searchTerm || selectedCustomer ? 'No jobs found matching your criteria' : 'No jobs available'}
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} style={{ 
                    cursor: 'pointer',
                    backgroundColor: job.customer === currentCustomer ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                  }}>
                    <td style={{ padding: '12px 8px', border: '1px solid #ddd', fontWeight: 500 }}>
                      {job.job_number || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 8px', border: '1px solid #ddd', fontWeight: 500 }}>
                      {(job.job && job.job.length > 30) ? `${job.job.substring(0, 30)}...` : (job.job || 'N/A')}
                    </td>
                    <td style={{ padding: '12px 8px', border: '1px solid #ddd' }}>
                      {(job.description && job.description.length > 40) ? `${job.description.substring(0, 40)}...` : (job.description || 'N/A')}
                    </td>
                    <td style={{ padding: '12px 8px', border: '1px solid #ddd' }}>{job.customer || 'N/A'}</td>
                    <td style={{ padding: '12px 8px', border: '1px solid #ddd' }}>
                      {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 8px', border: '1px solid #ddd' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: (job.status && statusColors[job.status]) ? statusColors[job.status].background : '#f5f5f5',
                        color: (job.status && statusColors[job.status]) ? statusColors[job.status].main : '#000'
                      }}>
                        {job.status ? job.status.replace('_', ' ') : 'Unknown'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onSelectJob(job)}
                      >
                        Use This Job
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
