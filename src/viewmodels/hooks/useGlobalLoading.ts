import { useState, useCallback } from 'react';

export interface UseGlobalLoadingReturn {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(
    operation: () => Promise<T>,
    message?: string
  ) => Promise<T>;
}

export function useGlobalLoading(): UseGlobalLoadingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const showLoading = useCallback((message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('Loading...');
  }, []);

  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    message = 'Loading...'
  ): Promise<T> => {
    try {
      showLoading(message);
      const result = await operation();
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  return {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading,
    withLoading,
  };
}
