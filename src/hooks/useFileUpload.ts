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

  // Helper function to upload a single file with progress tracking
  const uploadFileWithProgress = async (
    file: File,
    uploadUrl: string,
    filePath: string,
    onProgress: (progress: number) => void
  ): Promise<UploadedFile> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', event => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Upload successful - create our file record
          const uploadedFile: UploadedFile = {
            originalName: file.name,
            size: file.size,
            type: file.type,
            storagePath: filePath,
            bucket: 'documents', // This should match your bucket name
            uploadedAt: new Date().toISOString(),
          };
          resolve(uploadedFile);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      // For Supabase Storage, we use PUT with the file directly
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }));

    try {
      const uploadedFiles: UploadedFile[] = [];
      let totalProgress = 0;

      // Upload files sequentially to track progress better
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(
          `📤 Starting upload for file ${i + 1}/${files.length}: ${file.name}`
        );

        // Step 1: Get presigned URL
        const presignResponse = await fetch('/api/storage/presign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });

        const presignResult = await presignResponse.json();

        if (!presignResult.success) {
          throw new Error(presignResult.error || 'Failed to get upload URL');
        }

        console.log(`🔗 Got presigned URL for ${file.name}`);

        // Extract data from the response structure
        const { url: uploadUrl, path: filePath } = presignResult.data;

        // Step 2: Upload directly to storage with progress tracking
        const uploadedFile = await uploadFileWithProgress(
          file,
          uploadUrl,
          filePath,
          (fileProgress: number) => {
            // Calculate overall progress
            const fileWeight = 100 / files.length;
            const currentFileProgress =
              i * fileWeight + (fileProgress * fileWeight) / 100;

            setState(prev => ({
              ...prev,
              progress: Math.round(currentFileProgress),
            }));
          }
        );

        uploadedFiles.push(uploadedFile);
        totalProgress = Math.round(((i + 1) / files.length) * 100);

        setState(prev => ({
          ...prev,
          progress: totalProgress,
        }));

        console.log(
          `✅ File ${i + 1}/${files.length} uploaded successfully: ${file.name}`
        );
      }

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
