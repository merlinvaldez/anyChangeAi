'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFileLimits } from '@/hooks/useFileLimits';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
}

interface FilePreview {
  file: File;
  previewUrl?: string;
  isImage: boolean;
  isPdf: boolean;
  isLoading?: boolean;
  error?: string;
}

export function FileUpload({ onFileSelect, maxFiles = 1 }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Fetch file limits from API configuration
  const fileLimits = useFileLimits();

  // Helper function to create file previews
  const createFilePreview = useCallback((file: File): FilePreview => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    let previewUrl: string | undefined;

    // Create preview URL for images
    if (isImage) {
      previewUrl = URL.createObjectURL(file);
    }

    return {
      file,
      previewUrl,
      isImage,
      isPdf,
      isLoading: isPdf, // PDFs start in loading state
    };
  }, []);

  // Generate PDF thumbnail from first page
  const generatePdfThumbnail = useCallback(
    async (file: File): Promise<string> => {
      try {
        // Dynamically import PDF.js only on the client side
        const pdfjs = await import('pdfjs-dist');

        // Configure PDF.js worker (only needs to be done once)
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
        }

        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Load the PDF document
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        // Get the first page
        const page = await pdf.getPage(1);

        // Set up canvas for rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Could not get canvas context');
        }

        // Calculate scale to fit thumbnail size (48px is our thumbnail size)
        const viewport = page.getViewport({ scale: 1 });
        const scale = 48 / Math.max(viewport.width, viewport.height);
        const scaledViewport = page.getViewport({ scale });

        // Set canvas dimensions
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // Render the page
        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
          canvas: canvas,
        }).promise;

        // Convert canvas to blob and create URL
        return new Promise((resolve, reject) => {
          canvas.toBlob(blob => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          }, 'image/png');
        });
      } catch (error) {
        console.error('Error generating PDF thumbnail:', error);
        throw error;
      }
    },
    []
  );

  // Clean up preview URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      // Clean up all preview URLs to prevent memory leaks
      filePreviews.forEach(preview => {
        if (preview.previewUrl) {
          URL.revokeObjectURL(preview.previewUrl);
        }
      });
    };
  }, [filePreviews]);

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

        // Create previews for valid files
        const previews = validFiles.map(createFilePreview);
        setFilePreviews(previews);

        // Generate PDF thumbnails asynchronously
        validFiles.forEach(async (file, index) => {
          if (file.type === 'application/pdf') {
            try {
              const thumbnailUrl = await generatePdfThumbnail(file);

              // Update the specific preview with the generated thumbnail
              setFilePreviews(currentPreviews =>
                currentPreviews.map((preview, i) =>
                  i === index && preview.isPdf
                    ? { ...preview, previewUrl: thumbnailUrl, isLoading: false }
                    : preview
                )
              );
            } catch (error) {
              console.error('Failed to generate PDF thumbnail:', error);

              // Update preview with error state
              setFilePreviews(currentPreviews =>
                currentPreviews.map((preview, i) =>
                  i === index && preview.isPdf
                    ? {
                        ...preview,
                        isLoading: false,
                        error: 'Failed to generate preview',
                      }
                    : preview
                )
              );
            }
          }
        });

        onFileSelect(validFiles);
      }
    },
    [
      fileLimits,
      maxFiles,
      onFileSelect,
      createFilePreview,
      generatePdfThumbnail,
    ]
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
      {filePreviews.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-gray-800 dark:text-gray-200 font-medium">
            Selected Files:
          </h4>
          {filePreviews.map((preview, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center space-x-3">
                {/* File Preview Thumbnail */}
                <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {preview.isImage && preview.previewUrl ? (
                    <img
                      src={preview.previewUrl}
                      alt={`Preview of ${preview.file.name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : preview.isPdf ? (
                    preview.isLoading ? (
                      <div className="text-blue-500 text-xs animate-pulse">
                        ⏳
                      </div>
                    ) : preview.previewUrl ? (
                      <img
                        src={preview.previewUrl}
                        alt={`PDF preview of ${preview.file.name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : preview.error ? (
                      <span
                        className="text-red-500 text-lg"
                        title={preview.error}
                      >
                        ❌
                      </span>
                    ) : (
                      <span className="text-red-500 text-lg">📄</span>
                    )
                  ) : (
                    <span className="text-gray-500 text-lg">📎</span>
                  )}
                </div>
                <div>
                  <p className="text-green-800 dark:text-green-300 font-medium">
                    {preview.file.name}
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    {(preview.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();

                  // Clean up the preview URL for the removed file
                  if (filePreviews[index].previewUrl) {
                    URL.revokeObjectURL(filePreviews[index].previewUrl);
                  }

                  const newFiles = selectedFiles.filter((_, i) => i !== index);
                  const newPreviews = filePreviews.filter(
                    (_, i) => i !== index
                  );

                  setSelectedFiles(newFiles);
                  setFilePreviews(newPreviews);
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
