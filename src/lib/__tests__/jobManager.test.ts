// Unit tests for JobManager
// These tests run automatically and catch bugs before they reach users

import { JobManager, Job } from '../jobManager';

describe('JobManager', () => {
  let jobManager: JobManager;

  // Before each test, create a fresh JobManager
  beforeEach(() => {
    jobManager = new JobManager();
  });

  describe('createJob', () => {
    it('should create a job with unique UUID-based ID', () => {
      const filePath = '/uploads/test.pdf';
      const jobId = jobManager.createJob(filePath);

      // Check that ID follows our expected format (job_ + UUID)
      expect(jobId).toMatch(
        /^job_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
      expect(jobId).toContain('job_');
    });

    it('should create job with correct initial state', () => {
      const filePath = '/uploads/document.pdf';
      const jobId = jobManager.createJob(filePath);
      const job = jobManager.getJob(jobId);

      expect(job).toBeDefined();
      expect(job!.id).toBe(jobId);
      expect(job!.status).toBe('queued');
      expect(job!.filePath).toBe(filePath);
      expect(job!.progress).toBe(0);
      expect(job!.createdAt).toBeInstanceOf(Date);
      expect(job!.error).toBeUndefined();
      expect(job!.completedAt).toBeUndefined();
    });

    it('should create multiple jobs with unique IDs', () => {
      const jobId1 = jobManager.createJob('/file1.pdf');
      const jobId2 = jobManager.createJob('/file2.pdf');

      expect(jobId1).not.toBe(jobId2);
      expect(jobManager.getJob(jobId1)).toBeDefined();
      expect(jobManager.getJob(jobId2)).toBeDefined();
    });
  });

  describe('getJob', () => {
    it('should return job when it exists', () => {
      const jobId = jobManager.createJob('/test.pdf');
      const job = jobManager.getJob(jobId);

      expect(job).toBeDefined();
      expect(job!.id).toBe(jobId);
    });

    it('should return undefined for non-existent job', () => {
      const job = jobManager.getJob('fake_job_123');
      expect(job).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const job = jobManager.getJob('');
      expect(job).toBeUndefined();
    });
  });

  describe('updateJobStatus', () => {
    let jobId: string;

    beforeEach(() => {
      jobId = jobManager.createJob('/test.pdf');
    });

    it('should update job status successfully', () => {
      const result = jobManager.updateJobStatus(jobId, 'processing');
      const job = jobManager.getJob(jobId);

      expect(result).toBe(true);
      expect(job!.status).toBe('processing');
    });

    it('should update progress when provided', () => {
      jobManager.updateJobStatus(jobId, 'processing', 75);
      const job = jobManager.getJob(jobId);

      expect(job!.status).toBe('processing');
      expect(job!.progress).toBe(75);
    });

    it('should not update progress when not provided', () => {
      jobManager.updateJobStatus(jobId, 'processing');
      const job = jobManager.getJob(jobId);

      expect(job!.progress).toBe(0); // Should remain initial value
    });

    it('should set completedAt when status is done', () => {
      const beforeTime = new Date();
      jobManager.updateJobStatus(jobId, 'done', 100);
      const afterTime = new Date();
      const job = jobManager.getJob(jobId);

      expect(job!.completedAt).toBeDefined();
      expect(job!.completedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime()
      );
      expect(job!.completedAt!.getTime()).toBeLessThanOrEqual(
        afterTime.getTime()
      );
    });

    it('should set completedAt when status is failed', () => {
      jobManager.updateJobStatus(jobId, 'failed');
      const job = jobManager.getJob(jobId);

      expect(job!.completedAt).toBeDefined();
    });

    it('should return false for non-existent job', () => {
      const result = jobManager.updateJobStatus('fake_job', 'processing');
      expect(result).toBe(false);
    });

    it('should handle all valid status transitions', () => {
      // Test each status
      expect(jobManager.updateJobStatus(jobId, 'queued')).toBe(true);
      expect(jobManager.updateJobStatus(jobId, 'processing')).toBe(true);
      expect(jobManager.updateJobStatus(jobId, 'done')).toBe(true);

      // Create new job for failed status
      const jobId2 = jobManager.createJob('/test2.pdf');
      expect(jobManager.updateJobStatus(jobId2, 'failed')).toBe(true);
    });
  });

  describe('failJob', () => {
    let jobId: string;

    beforeEach(() => {
      jobId = jobManager.createJob('/test.pdf');
    });

    it('should mark job as failed with error message', () => {
      const errorMessage = 'OCR processing failed';
      const result = jobManager.failJob(jobId, errorMessage);
      const job = jobManager.getJob(jobId);

      expect(result).toBe(true);
      expect(job!.status).toBe('failed');
      expect(job!.error).toBe(errorMessage);
      expect(job!.completedAt).toBeDefined();
    });

    it('should return false for non-existent job', () => {
      const result = jobManager.failJob('fake_job', 'Error');
      expect(result).toBe(false);
    });
  });

  describe('timeout mechanism', () => {
    let jobId: string;

    beforeEach(() => {
      jobId = jobManager.createJob('/test.pdf');
      // Use fake timers for testing timeouts
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start timeout when job status changes to processing', () => {
      jobManager.updateJobStatus(jobId, 'processing');

      // Fast-forward time to just before timeout (2 minutes)
      jest.advanceTimersByTime(119000); // 1 minute 59 seconds

      const job = jobManager.getJob(jobId);
      expect(job!.status).toBe('processing'); // Still processing
    });

    it('should timeout job after 2 minutes', () => {
      jobManager.updateJobStatus(jobId, 'processing');

      // Fast-forward time past the 2-minute timeout
      jest.advanceTimersByTime(120000); // 2 minutes

      const job = jobManager.getJob(jobId);
      expect(job!.status).toBe('failed');
      expect(job!.error).toBe('Job timed out after 120 seconds');
      expect(job!.completedAt).toBeDefined();
    });

    it('should clear timeout when job completes successfully', () => {
      jobManager.updateJobStatus(jobId, 'processing');

      // Complete job before timeout
      jobManager.updateJobStatus(jobId, 'done', 100);

      // Advance time past timeout
      jest.advanceTimersByTime(120000);

      const job = jobManager.getJob(jobId);
      expect(job!.status).toBe('done'); // Should still be done, not failed
      expect(job!.error).toBeUndefined();
    });

    it('should clear timeout when job fails before timeout', () => {
      jobManager.updateJobStatus(jobId, 'processing');

      // Fail job before timeout
      jobManager.updateJobStatus(jobId, 'failed');

      // Advance time past timeout
      jest.advanceTimersByTime(120000);

      const job = jobManager.getJob(jobId);
      expect(job!.status).toBe('failed');
      // Should not have timeout error message
      expect(job!.error).toBeUndefined();
    });
  });

  describe('cleanup mechanism', () => {
    let jobId: string;

    beforeEach(() => {
      jobId = jobManager.createJob('/test.pdf');
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should schedule cleanup when job completes successfully', () => {
      jobManager.updateJobStatus(jobId, 'done', 100);

      // Job should still exist immediately after completion
      expect(jobManager.getJob(jobId)).toBeDefined();

      // Fast-forward past cleanup delay (5 minutes)
      jest.advanceTimersByTime(5 * 60 * 1000);

      // Job should be cleaned up
      expect(jobManager.getJob(jobId)).toBeUndefined();
    });

    it('should schedule cleanup when job fails', () => {
      jobManager.updateJobStatus(jobId, 'failed');

      // Job should still exist immediately after failure
      expect(jobManager.getJob(jobId)).toBeDefined();

      // Fast-forward past cleanup delay
      jest.advanceTimersByTime(5 * 60 * 1000);

      // Job should be cleaned up
      expect(jobManager.getJob(jobId)).toBeUndefined();
    });

    it('should schedule cleanup when using failJob method', () => {
      jobManager.failJob(jobId, 'Test error');

      expect(jobManager.getJob(jobId)).toBeDefined();

      jest.advanceTimersByTime(5 * 60 * 1000);

      expect(jobManager.getJob(jobId)).toBeUndefined();
    });

    it('should allow manual cleanup of completed jobs', () => {
      jobManager.updateJobStatus(jobId, 'done', 100);

      const result = jobManager.cleanupJob(jobId);
      expect(result).toBe(true);
      expect(jobManager.getJob(jobId)).toBeUndefined();
    });

    it('should not allow manual cleanup of active jobs', () => {
      jobManager.updateJobStatus(jobId, 'processing');

      const result = jobManager.cleanupJob(jobId);
      expect(result).toBe(false);
      expect(jobManager.getJob(jobId)).toBeDefined();
    });
  });

  describe('job monitoring methods', () => {
    beforeEach(() => {
      // Create jobs in different states for testing
      const job1 = jobManager.createJob('/test1.pdf');
      const job2 = jobManager.createJob('/test2.pdf');
      const job3 = jobManager.createJob('/test3.pdf');

      jobManager.updateJobStatus(job2, 'processing');
      jobManager.updateJobStatus(job3, 'done', 100);
    });

    it('should return correct job counts', () => {
      const counts = jobManager.getJobCounts();

      expect(counts.total).toBe(3);
      expect(counts.queued).toBe(1);
      expect(counts.processing).toBe(1);
      expect(counts.done).toBe(1);
      expect(counts.failed).toBe(0);
    });

    it('should return all jobs', () => {
      const allJobs = jobManager.getAllJobs();

      expect(allJobs).toHaveLength(3);
      expect(allJobs.every(job => job.id && job.status && job.filePath)).toBe(
        true
      );
    });
  });
});
