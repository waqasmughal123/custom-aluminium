/**
 * Timer localStorage management utilities
 */

const STORAGE_KEY_PREFIX = 'jobTimer_';

/**
 * Clear all timer localStorage data
 * Should be called on user logout to prevent timer state leakage
 */
export const clearAllTimerStorage = (): void => {
  try {
    if (typeof window === 'undefined') {
      console.log('⚠️ Cannot clear timer storage: window is undefined (SSR)');
      return;
    }

    const keys = Object.keys(localStorage);
    const timerKeys = keys.filter(key => key.startsWith(STORAGE_KEY_PREFIX));
    
    timerKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log('🧹 Cleared timer localStorage:', key);
    });
    
    console.log(`🧹 Cleared ${timerKeys.length} timer localStorage entries on logout`);
  } catch (error) {
    console.error('❌ Failed to clear timer localStorage:', error);
  }
};

/**
 * Clear timer localStorage for a specific job
 */
export const clearJobTimerStorage = (jobId: string): void => {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    const storageKey = STORAGE_KEY_PREFIX + jobId;
    localStorage.removeItem(storageKey);
    console.log('🧹 Cleared timer localStorage for job:', jobId);
  } catch (error) {
    console.error('❌ Failed to clear job timer localStorage:', error);
  }
};

/**
 * Get timer localStorage key for a job
 */
export const getTimerStorageKey = (jobId: string): string => {
  return STORAGE_KEY_PREFIX + jobId;
};

/**
 * Check if timer localStorage exists for a job
 */
export const hasTimerStorage = (jobId: string): boolean => {
  try {
    if (typeof window === 'undefined') {
      return false;
    }

    const storageKey = STORAGE_KEY_PREFIX + jobId;
    const savedState = localStorage.getItem(storageKey);
    
    if (!savedState) {
      return false;
    }

    const parsed = JSON.parse(savedState);
    return !!(parsed.isRunning && parsed.startTime);
  } catch (error) {
    console.error('❌ Failed to check timer localStorage:', error);
    return false;
  }
};
