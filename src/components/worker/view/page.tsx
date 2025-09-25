"use client";

import {
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import {
  Modal,
  Box,
  Typography,
  Chip,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Stack,
  Paper,
} from "@mui/material";
import React from "react";
import type { Worker } from '@/models/job';
import { Button } from '@/views/components/common';

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '95vw',
  maxWidth: 1000,
  maxHeight: '95vh',
  bgcolor: 'background.paper',
  borderRadius: 4,
  boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.2)',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'divider',
};

interface WorkerViewModalProps {
  open: boolean;
  worker: Worker | null;
  onClose: () => void;
}

export default function WorkerViewModal({ 
  open, 
  worker, 
  onClose 
}: WorkerViewModalProps): React.JSX.Element {
  if (!worker) return <></>;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const skillsArray = Array.isArray(worker.skills) 
    ? worker.skills 
    : (worker.skills ? worker.skills.split(', ') : []);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="worker-view-modal-title"
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backdropFilter: 'blur(3px)',
        bgcolor: 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <Box sx={modalStyle}>
        {/* Enhanced Header with Primary Background */}
        <Box sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          p: 4,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            opacity: 0.1,
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            position: 'relative',
            zIndex: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 700,
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                }}
              >
                {getInitials(worker.first_name, worker.last_name)}
              </Avatar>
              <Box>
                <Typography variant="h4" component="h2" sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                  {worker.first_name} {worker.last_name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Chip
                    icon={<BadgeIcon />}
                    label={worker.role}
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                  <Chip
                    icon={<PersonIcon />}
                    label={worker.is_active ? 'ACTIVE' : 'INACTIVE'}
                    sx={{ 
                      bgcolor: worker.is_active ? 'rgba(76, 175, 80, 0.8)' : 'rgba(158, 158, 158, 0.8)',
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                </Box>
                <Typography variant="body1" sx={{ 
                  opacity: 0.9,
                  fontWeight: 400
                }}>
                  Member since {formatDate(worker.created_at)}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={onClose} 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Enhanced Content Area */}
        <Box sx={{ 
          maxHeight: 'calc(95vh - 200px)', 
          overflowY: 'auto',
          bgcolor: '#fafafa'
        }}>
          <Box sx={{ p: 4 }}>
            <Stack spacing={3}>
              {/* Contact Information Card */}
              <Card sx={{ 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                borderRadius: 3,
                border: '1px solid rgba(0, 0, 0, 0.06)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <EmailIcon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Contact Information
                    </Typography>
                  </Box>
                  
                  <Stack spacing={2.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '10px', 
                        bgcolor: 'rgba(103, 126, 234, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <EmailIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Email Address
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {worker.email}
                        </Typography>
                      </Box>
                    </Box>

                    {worker.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '10px', 
                          bgcolor: 'rgba(76, 175, 80, 0.1)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <PhoneIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Phone Number
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {worker.phone}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {worker.address && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '10px', 
                          bgcolor: 'rgba(255, 152, 0, 0.1)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mt: 0.5
                        }}>
                          <LocationIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Address
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {worker.address}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {/* Skills Card */}
                <Card sx={{ 
                  flex: 1,
                  minWidth: 300,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  borderRadius: 3,
                  border: '1px solid rgba(0, 0, 0, 0.06)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        bgcolor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <WorkIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Skills & Expertise
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {skillsArray.length > 0 ? (
                        skillsArray.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            sx={{ 
                              bgcolor: 'primary.main',
                              color: 'white',
                              fontWeight: 600,
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: 'primary.dark',
                                transform: 'translateY(-1px)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                          />
                        ))
                      ) : (
                        <Paper sx={{ 
                          p: 2, 
                          bgcolor: 'grey.50',
                          borderRadius: 2,
                          width: '100%'
                        }}>
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            No skills listed
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {/* Worker Details Card */}
                <Card sx={{ 
                  flex: 1,
                  minWidth: 300,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  borderRadius: 3,
                  border: '1px solid rgba(0, 0, 0, 0.06)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        bgcolor: 'info.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Worker Details
                      </Typography>
                    </Box>

                    <Stack spacing={2.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '10px', 
                          bgcolor: worker.is_active ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <BadgeIcon sx={{ color: worker.is_active ? 'success.main' : 'grey.500', fontSize: 20 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Employment Status
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {worker.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </Typography>
                        </Box>
                      </Box>

                      {worker.hire_date && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '10px', 
                            bgcolor: 'rgba(103, 126, 234, 0.1)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <CalendarIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Hire Date
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {formatDate(worker.hire_date)}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '10px', 
                          bgcolor: 'rgba(156, 39, 176, 0.1)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <AccessTimeIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Last Updated
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {formatDate(worker.updatedAt || worker.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

            </Stack>
          </Box>
        </Box>

        {/* Enhanced Footer */}
        <Box sx={{ 
          p: 3,
          bgcolor: 'white',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: 2
        }}>
          <Button 
            variant="outlined" 
            onClick={onClose}
            sx={{
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.95rem',
              borderColor: 'grey.300',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'grey.400',
                bgcolor: 'grey.50'
              }
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
