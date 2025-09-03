// Job Management System for OCR Processing
// This tracks the status of OCR jobs through their lifecycle

// First, let's define what a job looks like
export interface Job {
  id: string; // Unique identifier like "job_123"
  status: 'queued' | 'processing' | 'done' | 'failed'; // Current state
  filePath: string; // Path to the file being processed
  createdAt: Date; // When this job was created
  progress: number; // 0-100, how complete is the job
  error?: string; // If failed, what went wrong?
  completedAt?: Date; // When did it finish (if it did)
}

// Simple job manager using a Map (our "filing cabinet")
export class JobManager {
  private jobs: Map<string, Job> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map(); // Track active timers
  private cleanupTimers: Map<string, NodeJS.Timeout> = new Map(); // Track cleanup timers
  private readonly defaultTimeoutMs = 2 * 60 * 1000; // 2 minutes in milliseconds
  private readonly cleanupDelayMs = 5 * 60 * 1000; // Clean up completed jobs after 5 minutes

  // Create a new job and put it in our filing cabinet
  createJob(filePath: string): string {
    // Step 1: Generate unique ID using crypto for guaranteed uniqueness
    const jobId = `job_${crypto.randomUUID()}`;

    // Step 2: Create the job object with all required fields
    const job: Job = {
      id: jobId,
      status: 'queued', // All new jobs start as queued
      filePath: filePath, // The file path passed in
      createdAt: new Date(), // Right now!
      progress: 0, // Starting at 0%
      // error and completedAt are optional, so we don't set them
    };

    // Step 3: Store in our Map (filing cabinet)
    this.jobs.set(jobId, job);

    // Step 4: Return the ID so caller knows which job was created
    return jobId;
  }

  // Look up a job by its ID
  getJob(jobId: string): Job | undefined {
    // Simple! Just ask our Map for the job with this ID
    return this.jobs.get(jobId);
  }

  // Update a job's status
  updateJobStatus(
    jobId: string,
    status: Job['status'],
    progress?: number
  ): boolean {
    // Step 1: Find the job in our Map
    const job = this.jobs.get(jobId);

    // Step 2: If job doesn't exist, return false
    if (!job) {
      return false;
    }

    // Step 3: Update the job's status
    job.status = status;

    // Step 4: Update progress if provided
    if (progress !== undefined) {
      job.progress = progress;
    }

    // Step 5: Handle status-specific logic
    if (status === 'processing') {
      // When a job starts processing, start the timeout timer
      this.startJobTimeout(jobId);
    } else if (status === 'done' || status === 'failed') {
      // When a job completes (success or failure), clear the timeout
      job.completedAt = new Date();
      this.clearJobTimeout(jobId);
      // Schedule automatic cleanup after 5 minutes
      this.scheduleJobCleanup(jobId);
    }

    // Step 6: Save updated job back to Map (actually not needed since objects are references!)
    this.jobs.set(jobId, job);

    return true; // Success!
  }

  // Mark a job as failed with an error message
  failJob(jobId: string, errorMessage: string): boolean {
    const job = this.jobs.get(jobId);

    if (!job) {
      return false;
    }

    // Update job to failed status
    job.status = 'failed';
    job.error = errorMessage;
    job.completedAt = new Date();

    // Clear any timeout for this job since it's now complete
    this.clearJobTimeout(jobId);

    // Schedule automatic cleanup after 5 minutes
    this.scheduleJobCleanup(jobId);

    return true;
  }

  // Private method to clear a job's timeout timer
  private clearJobTimeout(jobId: string): void {
    const timeoutId = this.timeouts.get(jobId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(jobId);
    }
  }

  // Private method to start a timeout timer for a job
  private startJobTimeout(jobId: string): void {
    // Clear any existing timeout first
    this.clearJobTimeout(jobId);

    // Set a new timeout
    const timeoutId = setTimeout(() => {
      // This runs after 2 minutes if the job hasn't completed
      this.failJob(
        jobId,
        `Job timed out after ${this.defaultTimeoutMs / 1000} seconds`
      );
    }, this.defaultTimeoutMs);

    // Store the timeout ID so we can cancel it later
    this.timeouts.set(jobId, timeoutId);
  }

  // Private method to schedule job cleanup after completion
  private scheduleJobCleanup(jobId: string): void {
    // Clear any existing cleanup timer first
    this.clearJobCleanup(jobId);

    // Schedule cleanup after the delay
    const cleanupTimerId = setTimeout(() => {
      // Remove the job from memory
      this.jobs.delete(jobId);
      this.cleanupTimers.delete(jobId);
      console.log(`🧹 Cleaned up completed job: ${jobId}`);
    }, this.cleanupDelayMs);

    // Store the cleanup timer ID
    this.cleanupTimers.set(jobId, cleanupTimerId);
  }

  // Private method to clear a job's cleanup timer
  private clearJobCleanup(jobId: string): void {
    const cleanupTimerId = this.cleanupTimers.get(jobId);
    if (cleanupTimerId) {
      clearTimeout(cleanupTimerId);
      this.cleanupTimers.delete(jobId);
    }
  }

  // Get count of jobs in different states (useful for monitoring)
  getJobCounts(): {
    total: number;
    queued: number;
    processing: number;
    done: number;
    failed: number;
  } {
    const counts = { total: 0, queued: 0, processing: 0, done: 0, failed: 0 };

    for (const job of this.jobs.values()) {
      counts.total++;
      counts[job.status]++;
    }

    return counts;
  }

  // Get all jobs (useful for debugging/monitoring)
  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  // Manual cleanup method (useful for testing)
  cleanupJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    // Only cleanup completed jobs
    if (job.status === 'done' || job.status === 'failed') {
      this.jobs.delete(jobId);
      this.clearJobCleanup(jobId);
      this.clearJobTimeout(jobId);
      return true;
    }

    return false;
  }
}
