/**
 * Health Status Component
 *
 * This component fetches live health data from our backend API
 * and displays it to users. Think of it as a "dashboard light"
 * that shows whether our server is running properly.
 */

'use client';
import { useState, useEffect } from 'react';

// TypeScript interface - this defines what shape our health data has
interface HealthData {
  status: string;
  message: string;
  timestamp: string;
  environment: string;
  version: string;
  uptime: number;
  service: string;
  system: {
    platform: string;
    nodeVersion: string;
    memory: {
      used: number;
      total: number;
    };
  };
}

export function HealthStatus() {
  // State to store our health data (starts as null = no data yet)
  const [healthData, setHealthData] = useState<HealthData | null>(null);

  // State to track if we're currently loading data
  const [isLoading, setIsLoading] = useState(true);

  // State to track if there was an error
  const [error, setError] = useState<string | null>(null);

  // Function to fetch health data from our API
  const fetchHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Make the API call - this is like "placing an order"
      const response = await fetch('/api/health');

      // Check if the response was successful
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      // Convert the response to JSON - this is like "unpacking the food"
      const data = await response.json();

      // Save the data to our component's state
      setHealthData(data);
    } catch (err) {
      // If something went wrong, save the error message
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      // Always stop the loading spinner, whether we succeeded or failed
      setIsLoading(false);
    }
  };

  // This hook runs when the component first loads
  useEffect(() => {
    fetchHealth();

    // Set up automatic refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);

    // Cleanup function - stops the interval when component unmounts
    return () => clearInterval(interval);
  }, []); // Empty array means "run once when component loads"

  // Loading state
  if (isLoading && !healthData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
          <span className="text-yellow-800">Checking server health...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <div className="flex items-center">
          <span className="text-red-600 mr-2">❌</span>
          <div>
            <h4 className="font-medium text-red-800">
              Server Health Check Failed
            </h4>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchHealth}
              className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show the health data
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg text-green-800">
          <span className="mr-2">✅</span>
          Server Health Status
        </h3>
        <button
          onClick={fetchHealth}
          disabled={isLoading}
          className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-green-700 mb-2">API Status</h4>
            <ul className="space-y-1">
              <li>
                <strong>Status:</strong> {healthData.status}
              </li>
              <li>
                <strong>Message:</strong> {healthData.message}
              </li>
              <li>
                <strong>Version:</strong> {healthData.version}
              </li>
              <li>
                <strong>Environment:</strong> {healthData.environment}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-green-700 mb-2">System Info</h4>
            <ul className="space-y-1">
              <li>
                <strong>Platform:</strong> {healthData.system.platform}
              </li>
              <li>
                <strong>Node Version:</strong> {healthData.system.nodeVersion}
              </li>
              <li>
                <strong>Memory Used:</strong> {healthData.system.memory.used} MB
              </li>
              <li>
                <strong>Uptime:</strong> {Math.round(healthData.uptime)} seconds
              </li>
            </ul>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-green-600">
        Last updated:{' '}
        {healthData?.timestamp
          ? new Date(healthData.timestamp).toLocaleTimeString()
          : 'Unknown'}
      </div>
    </div>
  );
}
