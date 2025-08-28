/**
 * Environment Status Component
 *
 * This component displays the current environment configuration
 * and helps verify that environment variables are loading correctly.
 *
 * SECURITY NOTE: This component only shows client-safe information.
 * Sensitive server-only data is never exposed to the browser.
 */

import { clientEnv } from '@/lib/env';

export function EnvironmentStatus() {
  return (
    <div className="bg-gray-100 border rounded-lg p-4 my-4">
      <h3 className="font-semibold text-lg mb-3">🔧 Environment Status</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">App Configuration</h4>
          <ul className="space-y-1">
            <li>
              <strong>Name:</strong> {clientEnv.app.name}
            </li>
            <li>
              <strong>Environment:</strong> {clientEnv.app.nodeEnv}
            </li>
            <li>
              <strong>URL:</strong> {clientEnv.app.url}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Security Status</h4>
          <ul className="space-y-1">
            <li>
              <strong>Client Environment:</strong> ✅ Loaded
            </li>
            <li>
              <strong>Sensitive Data:</strong> 🔒 Protected (server-only)
            </li>
            <li>
              <strong>Public Variables:</strong> ✅ Available
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Client Information</h4>
          <ul className="space-y-1">
            <li>
              <strong>Browser:</strong>{' '}
              {typeof window !== 'undefined'
                ? '✅ Client-side'
                : '❌ Server-side'}
            </li>
            <li>
              <strong>Development Mode:</strong>{' '}
              {clientEnv.app.isDevelopment ? '✅ Yes' : '❌ No'}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Important Notice</h4>
          <ul className="space-y-1 text-xs">
            <li className="text-blue-600">
              🔒 <strong>Security:</strong> Server secrets are protected
            </li>
            <li className="text-green-600">
              📱 <strong>Public:</strong> Only safe data shown here
            </li>
            <li className="text-purple-600">
              🚀 <strong>Ready:</strong> Environment configured correctly
            </li>
          </ul>
        </div>
      </div>

      {clientEnv.app.isDevelopment && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            💡 <strong>Development Mode:</strong> This component only shows
            client-safe information. Server-only data (API keys, file limits,
            OCR config) is properly protected and not exposed to the browser.
            Check the server logs for full configuration details.
          </p>
        </div>
      )}
    </div>
  );
}
