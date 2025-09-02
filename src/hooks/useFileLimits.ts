import { useState, useEffect } from 'react';

interface ApiStatus {
  limits: {
    maxFileSize: string;
    maxPages: number;
    allowedTypes: string[];
  };
}

interface FileLimits {
  maxSize: number; // in bytes
  maxPages: number;
  allowedTypes: string[];
}

/**
 * Hook to fetch file upload limits from the API
 * This ensures client-side validation matches server-side configuration
 */
export function useFileLimits(): FileLimits | null {
  const [limits, setLimits] = useState<FileLimits | null>(null);

  useEffect(() => {
    async function fetchLimits() {
      try {
        const response = await fetch('/api/status');
        if (!response.ok) {
          throw new Error('Failed to fetch API status');
        }

        const data: ApiStatus = await response.json();

        // Convert maxFileSize from "50.0MB" format to bytes
        const maxSizeMB = parseFloat(data.limits.maxFileSize.replace('MB', ''));
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        setLimits({
          maxSize: maxSizeBytes,
          maxPages: data.limits.maxPages,
          allowedTypes: data.limits.allowedTypes,
        });
      } catch (error) {
        console.error('Failed to fetch file limits:', error);
        // Fallback to default values if API is unavailable
        setLimits({
          maxSize: 50 * 1024 * 1024, // 50MB fallback
          maxPages: 0, // No page limit fallback
          allowedTypes: [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
          ],
        });
      }
    }

    fetchLimits();
  }, []);

  return limits;
}
