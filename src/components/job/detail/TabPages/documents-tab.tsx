'use client';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LinkIcon from '@mui/icons-material/Link';
import { 
  Box, 
  Typography, 
  Paper,
  Button,
  CircularProgress,
  TextField,
  Alert,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Chip
} from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateJobDocument } from '@/models/job';
import { jobApiService } from '@/services/api/jobApi';
import { useDeleteDocument } from '@/viewmodels/hooks/useDocuments';
import LoadingSpinner from '@/views/components/common/LoadingSpinner';
import { useToastActions } from '@/views/components/providers';
import { Document, JobDocumentsTabProps } from '../types';

export default function JobDocumentsTab({ job, onUpdateDocuments }: JobDocumentsTabProps) {
  const { t } = useTranslation();
  
  // Helper function to safely convert to number (supports decimals)
  const toNumberOrUndefined = (value: unknown): number | undefined => {
    if (value === null || value === undefined || value === '') return undefined;
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? undefined : parsed;
  };
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  
  // Document management hooks
  const deleteDocumentMutation = useDeleteDocument();
  const { showSuccess, showError } = useToastActions();
  
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch job documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!job || !job.id) return;

      try {
        setIsLoading(true);
        
        // Use real document data from API
        const jobDocuments: Document[] = (job.documents || []).map(jobDocument => ({
          id: jobDocument.id,
          name: jobDocument.name,
          url: jobDocument.document_type === 'link' ? (jobDocument.url || '') : (jobDocument.file_url || ''),
          type: jobDocument.document_type === 'file' ? 'FILE' : 'LINK',
          createdAt: jobDocument.created_at || new Date().toISOString(),
          jobId: job.id,
          size: jobDocument.size
        }));
        
        setDocuments(jobDocuments);
      } catch (error) {
        console.error('Error fetching documents:', error);
        showError(t('jobs.detail.documents.messages.failedToLoad'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [job, t, showError]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Auto-populate document name from file name
      if (!documentName) {
        setDocumentName(file.name);
      }
    }
  };

  // Handle file upload using job PATCH API
  const handleFileUpload = async () => {
    if (!selectedFile || !documentName || !job?.id) return;

    setIsProcessing(true);
    setProcessingMessage(t('jobs.detail.documents.messages.uploadingDocument'));
    try {
        // Convert file to base64
        const base64File = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              // Remove data:mime;base64, prefix
              const base64 = reader.result.split(',')[1];
              resolve(base64);
            } else {
              reject(new Error(t('jobs.detail.documents.messages.failedToReadFile', 'Failed to read file')));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        // Create new document data
        const newDocument: CreateJobDocument = {
          name: documentName,
          document_type: 'file',
          file: base64File,
          size: selectedFile.size
        };

        // Use job PATCH API with ALL job data including ONLY new document
        const jobUpdatePayload: import('@/models/job').UpdateJobRequest = {
          // Core required fields
          job: job.job,
          customer: job.customer,
          contact: job.contact,
          finish_colour: job.finish_colour || '',
          
          // All other current job fields
          description: job.description || '',
          status: job.status,
          priority: job.priority,
          amount: job.amount,
          quantity: job.quantity,
          material_units: toNumberOrUndefined(job.material_units),
          labour_units: toNumberOrUndefined(job.labour_units),
          labour_units_elapsed: toNumberOrUndefined(job.labour_units_elapsed),
          materials_text: job.materials_text || undefined,
          customer_po: job.customer_po || undefined,
          start_date: job.start_date,
          end_date: job.end_date,
          schedule_due_date: job.schedule_due_date || undefined,
          delivery_collection_date: job.delivery_collection_date || undefined,
          schedule_confirmed: job.schedule_confirmed,
          invoice: job.invoice || undefined,
          invoice_sent: job.invoice_sent,
          stock_available: job.stock_available,
          contacted: job.contacted,
          location_code: job.location_code || undefined,
          reference_number: job.reference_number || undefined,
          notes: job.notes || undefined,
          assigned_to: job.assigned_to?.id || undefined,
          
          // Document updates - ONLY new document (not existing ones)
          documents: [newDocument]
        };

        await jobApiService.updateJob(job.id, jobUpdatePayload);

        // Reload fresh job data to get updated documents
        const freshJobData = await jobApiService.getJobById(job.id);
        
        // Update local documents state
        const updatedDocuments: Document[] = (freshJobData.documents || []).map(jobDocument => ({
          id: jobDocument.id,
          name: jobDocument.name,
          url: jobDocument.document_type === 'link' ? (jobDocument.url || '') : (jobDocument.file_url || ''),
          type: jobDocument.document_type === 'file' ? 'FILE' : 'LINK',
          createdAt: jobDocument.created_at || new Date().toISOString(),
          jobId: job.id,
          size: jobDocument.size
        }));
        
        setDocuments(updatedDocuments);
        onUpdateDocuments(updatedDocuments, freshJobData);
        
        // Reset form and close dialog
        setSelectedFile(null);
        setDocumentName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setIsUploadDialogOpen(false);
        
        showSuccess(t('jobs.detail.documents.messages.uploadSuccess'));
      } catch (error) {
        console.error('Error uploading document:', error);
        showError(t('jobs.detail.documents.messages.failedToUpload'));
      } finally {
        setIsProcessing(false);
        setProcessingMessage('');
      }
  };

  // Handle link addition using job PATCH API
  const handleAddLink = async () => {
    if (!documentName || !documentUrl || !job?.id) return;

    setIsProcessing(true);
    setProcessingMessage(t('jobs.detail.documents.messages.addingLink'));
    try {
        // Create new document data
        const newDocument: CreateJobDocument = {
          name: documentName,
          document_type: 'link',
          url: documentUrl
        };

        // Use job PATCH API with ALL job data including ONLY new document
        const jobUpdatePayload: import('@/models/job').UpdateJobRequest = {
          // Core required fields
          job: job.job,
          customer: job.customer,
          contact: job.contact,
          finish_colour: job.finish_colour || '',
          
          // All other current job fields
          description: job.description || '',
          status: job.status,
          priority: job.priority,
          amount: job.amount,
          quantity: job.quantity,
          material_units: toNumberOrUndefined(job.material_units),
          labour_units: toNumberOrUndefined(job.labour_units),
          labour_units_elapsed: toNumberOrUndefined(job.labour_units_elapsed),
          materials_text: job.materials_text || undefined,
          customer_po: job.customer_po || undefined,
          start_date: job.start_date,
          end_date: job.end_date,
          schedule_due_date: job.schedule_due_date || undefined,
          delivery_collection_date: job.delivery_collection_date || undefined,
          schedule_confirmed: job.schedule_confirmed,
          invoice: job.invoice || undefined,
          invoice_sent: job.invoice_sent,
          stock_available: job.stock_available,
          contacted: job.contacted,
          location_code: job.location_code || undefined,
          reference_number: job.reference_number || undefined,
          notes: job.notes || undefined,
          assigned_to: job.assigned_to?.id || undefined,
          
          // Document updates - ONLY new document (not existing ones)
          documents: [newDocument]
        };

        await jobApiService.updateJob(job.id, jobUpdatePayload);

        // Reload fresh job data to get updated documents
        const freshJobData = await jobApiService.getJobById(job.id);
        
        // Update local documents state
        const updatedDocuments: Document[] = (freshJobData.documents || []).map(jobDocument => ({
          id: jobDocument.id,
          name: jobDocument.name,
          url: jobDocument.document_type === 'link' ? (jobDocument.url || '') : (jobDocument.file_url || ''),
          type: jobDocument.document_type === 'file' ? 'FILE' : 'LINK',
          createdAt: jobDocument.created_at || new Date().toISOString(),
          jobId: job.id,
          size: jobDocument.size
        }));
        
        setDocuments(updatedDocuments);
        onUpdateDocuments(updatedDocuments, freshJobData);
        
        // Reset form and close dialog
        setDocumentName('');
        setDocumentUrl('');
        setIsLinkDialogOpen(false);
        
        showSuccess(t('jobs.detail.documents.messages.linkAddedSuccess'));
      } catch (error) {
        console.error('Error adding link:', error);
        showError(t('jobs.detail.documents.messages.failedToAddLink'));
      } finally {
        setIsProcessing(false);
        setProcessingMessage('');
      }
  };

  // Handle document deletion using separate delete API
  const handleDeleteDocument = async (documentId: string) => {
    if (!job?.id) return;
    
    setDeletingDocumentId(documentId);
    setIsProcessing(true);
    setProcessingMessage(t('jobs.detail.documents.messages.deletingDocument'));
    try {
        
        // Call the separate delete API for document deletion
        await deleteDocumentMutation.mutateAsync(documentId);
        
        // Reload fresh job data to get updated documents
        const freshJobData = await jobApiService.getJobById(job.id);
        
        // Update local documents state
        const updatedDocuments: Document[] = (freshJobData.documents || []).map(jobDocument => ({
          id: jobDocument.id,
          name: jobDocument.name,
          url: jobDocument.document_type === 'link' ? (jobDocument.url || '') : (jobDocument.file_url || ''),
          type: jobDocument.document_type === 'file' ? 'FILE' : 'LINK',
          createdAt: jobDocument.created_at || new Date().toISOString(),
          jobId: job.id,
          size: jobDocument.size
        }));
        
        setDocuments(updatedDocuments);
        onUpdateDocuments(updatedDocuments, freshJobData);
        
        showSuccess(t('jobs.detail.documents.messages.deleteSuccess'));
      } catch (error) {
        console.error('Error deleting document:', error);
        showError(t('jobs.detail.documents.messages.failedToDelete'));
      } finally {
        setDeletingDocumentId(null);
        setIsProcessing(false);
        setProcessingMessage('');
      }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = [t('common.bytes'), t('common.kb'), t('common.mb'), t('common.gb')];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading && documents.length === 0) {
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
        open={isProcessing} 
        message={processingMessage || t('common.processing')} 
        size={50}
      />
      

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('jobs.detail.documents.uploadDocuments')}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 100%', flexBasis: { xs: '100%', md: '48%' } }}>
        <Button 
              fullWidth
          variant="contained" 
              startIcon={<FileUploadIcon />}
              onClick={() => setIsUploadDialogOpen(true)}
              sx={{ height: '56px' }}
            >
              {t('jobs.detail.documents.uploadFile')}
            </Button>
          </Box>
          <Box sx={{ flex: '1 1 100%', flexBasis: { xs: '100%', md: '48%' } }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LinkIcon />}
              onClick={() => setIsLinkDialogOpen(true)}
              sx={{ height: '56px' }}
            >
              {t('jobs.detail.documents.addLink')}
        </Button>
      </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('jobs.detail.documents.documentLibrary')}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {documents.length === 0 ? (
          <Alert severity="info">
            {t('jobs.detail.documents.noDocuments')}
          </Alert>
      ) : (
          <List>
            {documents.map((document) => (
              <ListItem
                key={document.id}
                sx={{
                  mb: 1,
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  {document.type === 'FILE' ? (
                    <InsertDriveFileIcon color="primary" />
                  ) : (
                    <LinkIcon color="secondary" />
                  )}
                </ListItemIcon>
                
                <ListItemText
                  primary={document.name}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip 
                        label={document.type} 
                        size="small" 
                        color={document.type === 'FILE' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {t('jobs.detail.documents.added')}: {formatDate(document.createdAt)}
                      </Typography>
                      {document.size && (
                        <Typography variant="body2" color="text.secondary">
                          • {t('jobs.detail.documents.size')}: {formatFileSize(document.size)}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    component={Link}
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {document.type === 'FILE' ? t('jobs.detail.documents.viewFile') : t('jobs.detail.documents.openLink')}
                  </Button>
                  
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => handleDeleteDocument(document.id)}
                      disabled={deletingDocumentId === document.id}
                      color="error"
                    >
                      {deletingDocumentId === document.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <DeleteIcon />
                      )}
                    </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
        </Paper>

      {/* File Upload Dialog */}
      <Dialog 
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('jobs.detail.documents.uploadDocument')}
          <IconButton
            aria-label="close"
            onClick={() => setIsUploadDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <TextField
                    fullWidth
                label={t('jobs.detail.documents.documentName')}
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                required
                margin="normal"
              />
                </Box>

            <Box>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                sx={{ py: 1.5, px: 2, textAlign: 'center' }}
                    >
                {selectedFile ? selectedFile.name : t('jobs.detail.documents.chooseFile')}
                      <input
                        type="file"
                        hidden
                  onChange={handleFileChange}
                  ref={fileInputRef}
                      />
                    </Button>
                  {selectedFile && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {t('jobs.detail.documents.size')}: {formatFileSize(selectedFile.size)}
                      </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setIsUploadDialogOpen(false)}>
            {t('jobs.detail.documents.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleFileUpload}
            disabled={!selectedFile || !documentName || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <FileUploadIcon />}
          >
            {t('jobs.detail.documents.upload')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Link Dialog */}
      <Dialog
        open={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('jobs.detail.documents.addLink')}
          <IconButton
            aria-label="close"
            onClick={() => setIsLinkDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <TextField
                      fullWidth
                label={t('jobs.detail.documents.linkName')}
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                required
                margin="normal"
              />
            </Box>
            
            <Box>
              <TextField
                        fullWidth
                label={t('jobs.detail.documents.url')}
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                required
                margin="normal"
                placeholder="https://"
              />
            </Box>
          </Box>
          </DialogContent>
        
          <DialogActions>
          <Button onClick={() => setIsLinkDialogOpen(false)}>
            {t('jobs.detail.documents.cancel')}
            </Button>
            <Button 
              variant="contained"
            onClick={handleAddLink}
            disabled={!documentUrl || !documentName || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <AddIcon />}
            >
            {t('jobs.detail.documents.addLink')}
            </Button>
          </DialogActions>
      </Dialog>
    </Box>
  );
} 