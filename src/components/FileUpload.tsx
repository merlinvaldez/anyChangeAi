'use client';

import { useState, useCallback } from 'react';
import { useFileLimits } from '@/hooks/useFileLimits';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
}

export function FileUpload({ onFileSelect, maxFiles = 1 }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Fetch file limits from API configuration
  const fileLimits = useFileLimits();

  // Validate and process selected files
  const handleFileSelection = useCallback(
    (files: File[]) => {
      if (!fileLimits) return; // Wait for config to load

      const newErrors: string[] = [];
      const validFiles: File[] = [];

      // Check file count
      if (files.length > maxFiles) {
        newErrors.push(
          `Maximum ${maxFiles} ${maxFiles === 1 ? 'file' : 'files'} allowed`
        );
      }

      // Validate each file (even if there are too many, so users see all issues)
      files.forEach(file => {
        // Convert MIME type to extension for comparison
        const getFileExtension = (mimeType: string): string | null => {
          const mimeToExtension: Record<string, string> = {
            'application/pdf': 'pdf',
            'image/jpeg': 'jpg', // JPEG files should map to 'jpg' extension
            'image/jpg': 'jpg', // Some browsers might use this
            'image/png': 'png',
          };
          return mimeToExtension[mimeType.toLowerCase()] || null;
        };

        // Check file type
        const fileExtension = getFileExtension(file.type);
        if (
          !fileExtension ||
          !fileLimits.allowedTypes.includes(fileExtension)
        ) {
          newErrors.push(`${file.name}: File type not supported`);
          return;
        }

        // Check file size
        if (file.size > fileLimits.maxSize) {
          const maxSizeMB = Math.round(fileLimits.maxSize / (1024 * 1024));
          newErrors.push(
            `${file.name}: File size exceeds ${maxSizeMB}MB limit`
          );
          return;
        }

        // Only add to valid files if we haven't exceeded the count limit
        if (files.length <= maxFiles) {
          validFiles.push(file);
        }
      });

      setErrors(newErrors);

      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        onFileSelect(validFiles);
      }
    },
    [fileLimits, maxFiles, onFileSelect]
  );

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      handleFileSelection(files);
    },
    [handleFileSelection]
  );

  // Handle file input click
  const handleClick = () => {
    if (!fileLimits) return; // Wait for config to load

    // Convert extensions to MIME types for the file input accept attribute
    const extensionToMime = (ext: string): string => {
      const extToMime: Record<string, string> = {
        pdf: 'application/pdf',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        png: 'image/png',
      };
      return extToMime[ext.toLowerCase()] || '';
    };

    const acceptedMimeTypes = fileLimits.allowedTypes
      .map(extensionToMime)
      .filter(Boolean);

    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = maxFiles > 1;
    input.accept = acceptedMimeTypes.join(',');
    input.onchange = e => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files);
        handleFileSelection(files);
      }
    };
    input.click();
  };

  // We'll add the drag and drop logic here step by step

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
          ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📎</span>
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Drop your document here
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          or click to browse files
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          {fileLimits ? (
            <>
              Supports{' '}
              {fileLimits.allowedTypes
                .map(type => {
                  // Safely extract file extension from MIME type
                  const parts = type.split('/');
                  if (parts.length >= 2 && parts[1]) {
                    return parts[1].toUpperCase();
                  }
                  // Fallback for non-standard formats
                  return type.toUpperCase();
                })
                .join(', ')}{' '}
              • Max {Math.round(fileLimits.maxSize / (1024 * 1024))}MB • Up to{' '}
              {maxFiles} {maxFiles === 1 ? 'file' : 'files'}
            </>
          ) : (
            'Loading file requirements...'
          )}
        </p>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h4 className="text-red-800 dark:text-red-400 font-medium mb-2">
            Upload Errors:
          </h4>
          <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-gray-800 dark:text-gray-200 font-medium">
            Selected Files:
          </h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center space-x-3">
                <span className="text-green-600 dark:text-green-400">📄</span>
                <div>
                  <p className="text-green-800 dark:text-green-300 font-medium">
                    {file.name}
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  const newFiles = selectedFiles.filter((_, i) => i !== index);
                  setSelectedFiles(newFiles);
                  onFileSelect(newFiles);
                }}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
