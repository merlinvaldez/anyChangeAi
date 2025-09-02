/**
 * Custom hook for handling file uploads to Supabase Storage
 *
 * This hook provides upload functionality with progress tracking,
 * error handling, and success callbacks.
 */

import { useState, useCallback } from 'react';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFiles: UploadedFile[];
}

interface UploadedFile {
  originalName: string;
  size: number;
  type: string;
  storagePath: string;
  bucket: string;
  uploadedAt: string;
}

interface UseFileUploadResult extends UploadState {
  uploadFiles: (files: File[]) => Promise<void>;
  clearUploads: () => void;
  clearError: () => void;
}

export function useFileUpload(): UseFileUploadResult {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFiles: [],
  });

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }));

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        // Update progress
        const progressPercent = Math.round(((index + 1) / files.length) * 100);
        setState(prev => ({
          ...prev,
          progress: progressPercent,
        }));

        return result.file as UploadedFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadedFiles: [...prev.uploadedFiles, ...uploadedFiles],
      }));

      console.log('✅ All files uploaded successfully:', uploadedFiles);
    } catch (error) {
      console.error('❌ Upload failed:', error);

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
      }));
    }
  }, []);

  const clearUploads = useCallback(() => {
    setState(prev => ({
      ...prev,
      uploadedFiles: [],
      error: null,
      progress: 0,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    uploadFiles,
    clearUploads,
    clearError,
  };
}
