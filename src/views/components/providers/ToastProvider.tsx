'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer, ToastProps, ToastSeverity } from '../common/Toast';

// Types
interface ToastData {
  id: string;
  message: string;
  severity: ToastSeverity;
  duration?: number;
}

interface ShowToastOptions {
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastData[];
  showToast: (severity: ToastSeverity, options: ShowToastOptions) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

// Context
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Provider Props
interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

// Generate unique ID for toasts
const generateToastId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Provider Component
export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Generic show toast function
  const showToast = useCallback((severity: ToastSeverity, options: ShowToastOptions) => {
    const id = generateToastId();
    const newToast: ToastData = {
      id,
      severity,
      message: options.message,
      duration: options.duration,
    };

    setToasts(prevToasts => {
      // Limit the number of toasts
      const updatedToasts = [newToast, ...prevToasts];
      return updatedToasts.slice(0, maxToasts);
    });

    // Auto-remove toast if duration is set
    if (options.duration !== null && options.duration !== undefined) {
      setTimeout(() => {
        hideToast(id);
      }, options.duration);
    }
  }, [maxToasts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Convenience methods for different toast types
  const showSuccess = useCallback((message: string, duration = 4000) => {
    showToast('success', { message, duration });
  }, [showToast]);

  const showError = useCallback((message: string, duration = 6000) => {
    showToast('error', { message, duration });
  }, [showToast]);

  const showWarning = useCallback((message: string, duration = 5000) => {
    showToast('warning', { message, duration });
  }, [showToast]);

  const showInfo = useCallback((message: string, duration = 4000) => {
    showToast('info', { message, duration });
  }, [showToast]);

  // Hide specific toast
  const hideToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Context value
  const contextValue: ToastContextValue = {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
    clearAllToasts,
  };

  // Convert toasts to props for ToastContainer
  const toastProps: ToastProps[] = toasts.map(toast => ({
    ...toast,
    open: true,
    onClose: () => hideToast(toast.id),
  }));

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toastProps} />
    </ToastContext.Provider>
  );
};

// Hook to use toast context
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience hooks for specific toast types
export const useToastActions = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  return { showSuccess, showError, showWarning, showInfo };
}; 