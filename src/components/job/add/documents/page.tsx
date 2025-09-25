"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LinkIcon from "@mui/icons-material/Link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress,
  Stack,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { InputText, RadioGroup, type RadioOption } from '@/views/components/common';
import { DocumentLink } from '../types';

interface DocumentListProps {
  documents: (DocumentLink & { _isPending?: boolean })[];
  onAddClick: () => void;
  onDeleteDocument: (id: string) => Promise<void>;
  isLoading: boolean;
}

function DocumentList({ documents, onAddClick, onDeleteDocument, isLoading }: DocumentListProps) {
  // Function to handle opening documents
  const handleOpenDocument = (doc: DocumentLink & { _isPending?: boolean }) => {
    // Only allow opening existing documents, not new pending ones
    if (!doc._isExisting) {
      return;
    }

    if (doc.document_type === 'link' && doc.url) {
      // For link type documents
      window.open(doc.url, '_blank', 'noopener,noreferrer');
    } else if (doc.document_type === 'file' && doc.file_url) {
      // For file type documents, use the S3 file_url from API
      window.open(doc.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Box>
      {/* Simple Add File or Link button */}
      <Box 
        onClick={onAddClick}
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          p: 3,
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          cursor: 'pointer',
          bgcolor: 'background.paper',
          color: 'text.secondary',
          '&:hover': {
            borderColor: 'primary.main',
            color: 'primary.main',
            bgcolor: 'action.hover'
          },
          transition: 'all 0.2s ease'
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'medium',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <AddIcon fontSize="small" />
          Add File or Link
        </Typography>
      </Box>
      
      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {/* Documents list - only show if there are documents */}
      {documents.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
            Attached Documents ({documents.length})
          </Typography>
          
          <Stack spacing={1}>
            {documents.map((doc) => (
              <Box 
                key={doc.id}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: doc._isPending ? 'action.hover' : 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    flex: 1, 
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: doc._isExisting ? 'pointer' : 'default',
                    '&:hover': doc._isExisting ? {
                      '& .document-name': {
                        color: 'primary.main',
                        textDecoration: 'underline'
                      }
                    } : {}
                  }}
                  onClick={() => handleOpenDocument(doc)}
                >
                  {/* Document type icon */}
                  {doc.document_type === 'link' || doc.type === 'LINK' ? (
                    <LinkIcon fontSize="small" color="primary" />
                  ) : (
                    <InsertDriveFileIcon fontSize="small" color="action" />
                  )}
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      className="document-name"
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'medium',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {doc.name}
                    </Typography>
                    
                    {/* Document metadata */}
                    <Typography variant="caption" color="text.secondary">
                      {doc.document_type === 'link' || doc.type === 'LINK' ? 'Link' : 'File'}
                      {doc.size && ` • ${(doc.size / 1024).toFixed(1)} KB`}
                      {doc._isPending ? ' • Pending' : doc._isExisting ? ' • Existing' : ''}
                    </Typography>
                  </Box>
                  
                  {/* Only show open icon for existing documents */}
                  {doc._isExisting && (
                    <Tooltip title="Open document">
                      <OpenInNewIcon fontSize="small" sx={{ opacity: 0.6 }} />
                    </Tooltip>
                  )}
                </Box>
                
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDocument(doc.id);
                  }}
                  size="small"
                  sx={{ 
                    ml: 1,
                    opacity: 0.7,
                    '&:hover': {
                      opacity: 1,
                      color: 'error.main'
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

interface DocumentAttachmentsProps {
  onAddDocument: (doc: Omit<DocumentLink, "id" | "jobId" | "createdAt">) => Promise<void>;
  isLoading: boolean;
  autoOpenFilePicker: boolean;
}

function DocumentAttachments({ 
  onAddDocument, 
  isLoading, 
  autoOpenFilePicker 
}: DocumentAttachmentsProps) {
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Radio options for upload type
  const uploadTypeOptions: RadioOption[] = [
    { value: 'file', label: 'File Upload' },
    { value: 'link', label: 'External Link' },
  ];

  // Auto-open file picker if requested
  useEffect(() => {
    if (autoOpenFilePicker && uploadType === 'file') {
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
    }
  }, [autoOpenFilePicker, uploadType]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setFileName(file.name);
      setUploadError('');
    }
  };

  const handleAddFile = async () => {
    if (!selectedFile) return;
    
    try {
      setUploadError('');
      const fileDoc: Omit<DocumentLink, "id" | "jobId" | "createdAt"> & { _file?: File } = {
        name: fileName.trim() || selectedFile.name,
        url: '', // Will be set after upload
        type: 'FILE',
        document_type: 'file',
        _file: selectedFile
      };

      await onAddDocument(fileDoc);
      
      // Reset form
      setSelectedFile(null);
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to add file');
    }
  };

  const handleAddLink = async () => {
    if (!linkName.trim() || !linkUrl.trim()) {
      setUploadError('Please provide both name and URL for the link');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(linkUrl.trim());
    } catch {
      setUploadError('Please provide a valid URL');
      return;
    }
    
    try {
      setUploadError('');
      const linkDoc: Omit<DocumentLink, "id" | "jobId" | "createdAt"> = {
        name: linkName.trim(),
        url: linkUrl.trim(),
        type: 'LINK',
        document_type: 'link'
      };

      await onAddDocument(linkDoc);
      
      // Reset form
      setLinkName('');
      setLinkUrl('');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to add link');
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFileName('');
    setLinkName('');
    setLinkUrl('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      {/* Modal content using RadioGroup */}
      <Box sx={{ mb: 3 }}>
        {/* Radio button selection using custom RadioGroup */}
        <RadioGroup
          options={uploadTypeOptions}
          value={uploadType}
          onChange={(value) => {
            setUploadType(value as 'file' | 'link');
            resetForm();
          }}
          customRadios={true}
          row={true}
        />

        {/* Error display */}
        {uploadError && (
          <Alert severity="error" sx={{ mb: 3, mt: 3 }}>
            {uploadError}
          </Alert>
        )}

        {uploadType === 'file' ? (
          <Box sx={{ mt: 3 }}>
            {/* Name field with file icon */}
            <InputText
              label="Name *"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              startIcon={
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: '#FFC107',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  📄
                </Box>
              }
              sx={{ mb: 3 }}
            />

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
            />
            
            {/* Choose File button */}
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              fullWidth
              size="large"
              sx={{ 
                mb: 3,
                py: 2,
                borderColor: '#FFC107',
                borderStyle: 'dashed',
                borderWidth: 2,
                color: '#FFC107',
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '16px',
                '&:hover': {
                  borderColor: '#FFB300',
                  bgcolor: 'rgba(255, 193, 7, 0.04)',
                  borderStyle: 'dashed'
                }
              }}
              startIcon={<AddIcon sx={{ color: '#FFC107' }} />}
            >
              Choose File
            </Button>

            {/* Helper text */}
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Files will be attached to this job and available to all users with access.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 3 }}>
            {/* Link name input */}
            <InputText
              label="Name *"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              placeholder="Enter link name"
              startIcon={
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#666'
                  }}
                >
                  🔗
                </Box>
              }
              sx={{ mb: 3 }}
            />

            {/* URL field with link icon */}
            <InputText
              label="URL *"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://"
              startIcon={
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#666'
                  }}
                >
                  🔗
                </Box>
              }
              sx={{ mb: 3 }}
            />
          </Box>
        )}
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <Button
          variant="contained"
          onClick={uploadType === 'file' ? handleAddFile : handleAddLink}
          disabled={
            isLoading || 
            (uploadType === 'file' && !selectedFile) ||
            (uploadType === 'link' && (!linkName.trim() || !linkUrl.trim()))
          }
          sx={{
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 500,
            bgcolor: '#9E9E9E',
            color: 'white',
            '&:hover': {
              bgcolor: '#757575'
            },
            '&:disabled': {
              bgcolor: '#E0E0E0',
              color: '#BDBDBD'
            }
          }}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading 
            ? (uploadType === 'file' ? 'Uploading...' : 'Adding Link...') 
            : (uploadType === 'file' ? 'Upload File' : 'Add Link')
          }
        </Button>
      </Box>
    </Box>
  );
}

export { DocumentList, DocumentAttachments }; 