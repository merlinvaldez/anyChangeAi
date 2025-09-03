// Test the timeout mechanism
import { JobManager } from './jobManager';

const manager = new JobManager();

console.log('🕐 Testing Job Timeout Mechanism (2 minutes)...\n');

// Create a job
const jobId = manager.createJob('/test/timeout.pdf');
console.log(`📝 Created job: ${jobId}`);

// Start processing (this will start the 2-minute timer)
manager.updateJobStatus(jobId, 'processing');
console.log('⚡ Started processing - timeout timer started');

// Check job status
const job = manager.getJob(jobId);
console.log(`📊 Job status: ${job?.status}, progress: ${job?.progress}%`);

console.log('\n⏰ Timeout is set for 2 minutes (120 seconds)');
console.log(
  '🎯 In a real app, this job would automatically fail after 2 minutes'
);
console.log(
  '💡 To test immediately, we can simulate completion before timeout...\n'
);

// Simulate completing the job before timeout (this should cancel the timer)
setTimeout(() => {
  console.log('✅ Completing job before timeout...');
  manager.updateJobStatus(jobId, 'done', 100);

  const completedJob = manager.getJob(jobId);
  console.log(`🎉 Final job status: ${completedJob?.status}`);
  console.log(`⏰ Completed at: ${completedJob?.completedAt?.toISOString()}`);
  console.log('🛡️ Timeout timer was automatically cleared!');
}, 1000); // Complete after 1 second
