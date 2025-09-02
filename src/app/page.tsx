'use client';

import { EnvironmentStatus } from '@/components/EnvironmentStatus';
import { HealthStatus } from '@/components/HealthStatus';
import { FileUpload } from '@/components/FileUpload';
import { useFileUpload } from '@/hooks/useFileUpload';

export default function Home() {
  const {
    uploadFiles,
    isUploading,
    progress,
    error,
    uploadedFiles,
    clearError,
  } = useFileUpload();

  const handleFileSelect = (files: File[]) => {
    console.log('Files selected:', files);
    // Start the upload process
    uploadFiles(files);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              📄 AnyChange AI
            </h1>
            <nav className="hidden md:flex space-x-6">
              <a
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Features
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Pricing
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Convert Documents to
            <span className="text-blue-600 dark:text-blue-400">
              {' '}
              Editable Text
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Upload any PDF, image, or scan. Our AI extracts the text, lets you
            edit it, and exports clean documents in seconds.
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📤</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Upload
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Drag & drop PDFs, JPGs, or PNGs up to 50MB
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              OCR Extract
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI reads your document and extracts all text
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✏️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Edit
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Clean up text with our rich editor
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💾</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Export
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Download as TXT, DOCX, or PDF
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <FileUpload onFileSelect={handleFileSelect} />

        {/* Upload Progress & Status */}
        {isUploading && (
          <div className="max-w-2xl mx-auto mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">
                Uploading Files...
              </h3>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                {progress}% complete
              </p>
            </div>
          </div>
        )}

        {/* Upload Error */}
        {error && (
          <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
                  Upload Failed
                </h3>
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Upload Success */}
        {uploadedFiles.length > 0 && !isUploading && (
          <div className="max-w-2xl mx-auto mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-4">
              ✅ Upload Complete
            </h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-800/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600 dark:text-green-400">
                      📄
                    </span>
                    <div>
                      <p className="text-green-800 dark:text-green-200 font-medium">
                        {file.originalName}
                      </p>
                      <p className="text-green-600 dark:text-green-400 text-sm">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Uploaded{' '}
                        {new Date(file.uploadedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                    Ready for OCR
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Environment Status (Development Only) */}
        <div className="max-w-4xl mx-auto mt-16">
          {process.env.NODE_ENV === 'development' && <EnvironmentStatus />}
          <HealthStatus />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>
              &copy; 2025 AnyChange AI. Built with Next.js and Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
