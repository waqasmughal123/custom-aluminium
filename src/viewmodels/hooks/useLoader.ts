'use client';

import { useState, useCallback } from 'react';

export interface UseLoaderResult {
  isLoading: boolean;
  message: string;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  setLoaderMessage: (message: string) => void;
}

export const useLoader = (initialMessage: string = 'Loading...'): UseLoaderResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(initialMessage);

  const showLoader = useCallback((newMessage?: string) => {
    if (newMessage) {
      setMessage(newMessage);
    }
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoaderMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  return {
    isLoading,
    message,
    showLoader,
    hideLoader,
    setLoaderMessage,
  };
}; 