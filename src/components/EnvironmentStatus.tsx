/**
 * Environment Status Component
 *
 * This component displays the current environment configuration
 * and helps verify that environment variables are loading correctly.
 *
 * This is great for development and debugging!
 */

import { env } from '@/lib/env';

export function EnvironmentStatus() {
  return (
    <div className="bg-gray-100 border rounded-lg p-4 my-4">
      <h3 className="font-semibold text-lg mb-3">🔧 Environment Status</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">App Configuration</h4>
          <ul className="space-y-1">
            <li>
              <strong>Name:</strong> {env.app.name}
            </li>
            <li>
              <strong>Environment:</strong> {env.app.nodeEnv}
            </li>
            <li>
              <strong>URL:</strong> {env.app.url}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">OCR Configuration</h4>
          <ul className="space-y-1">
            <li>
              <strong>Provider:</strong> {env.ocr.provider}
            </li>
            <li>
              <strong>Mistral API:</strong>{' '}
              {env.ocr.mistral.apiKey ? '✅ Configured' : '❌ Not set'}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">File Processing</h4>
          <ul className="space-y-1">
            <li>
              <strong>Max Size:</strong>{' '}
              {(env.files.maxSize / 1024 / 1024).toFixed(1)}MB
            </li>
            <li>
              <strong>Max Pages:</strong> {env.files.maxPages}
            </li>
            <li>
              <strong>Allowed Types:</strong>{' '}
              {env.files.allowedTypes.join(', ')}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Debug Settings</h4>
          <ul className="space-y-1">
            <li>
              <strong>Debug Logging:</strong>{' '}
              {env.debug.logging ? '✅ Enabled' : '❌ Disabled'}
            </li>
            <li>
              <strong>API Key:</strong>{' '}
              {env.api.secretKey ? '✅ Set' : '❌ Missing'}
            </li>
          </ul>
        </div>
      </div>

      {env.app.isDevelopment && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            💡 <strong>Development Mode:</strong> This component is only visible
            in development. It helps you verify your environment configuration
            is working correctly.
          </p>
        </div>
      )}
    </div>
  );
}
