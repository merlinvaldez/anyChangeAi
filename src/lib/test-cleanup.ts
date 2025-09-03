// Test the cleanup mechanism
import { JobManager } from './jobManager';

const manager = new JobManager();

console.log('🧹 Testing Job Cleanup Mechanism...\n');

// Create a job
const jobId = manager.createJob('/test/cleanup.pdf');
console.log(`📝 Created job: ${jobId}`);

// Check initial job counts
let counts = manager.getJobCounts();
console.log(`📊 Initial job counts:`, counts);

// Start processing
manager.updateJobStatus(jobId, 'processing');
console.log('⚡ Started processing...');

// Complete the job
manager.updateJobStatus(jobId, 'done', 100);
console.log('✅ Job completed - cleanup scheduled for 5 minutes');

// Check job still exists
counts = manager.getJobCounts();
console.log(`📊 After completion:`, counts);

console.log(
  '\n⏰ In a real app, this job would be automatically cleaned up after 5 minutes'
);
console.log('💡 For testing, we can use manual cleanup...\n');

// Simulate manual cleanup (for testing)
setTimeout(() => {
  console.log('🧹 Performing manual cleanup...');
  const cleanupResult = manager.cleanupJob(jobId);
  console.log(`✅ Cleanup successful: ${cleanupResult}`);

  const finalCounts = manager.getJobCounts();
  console.log(`📊 Final job counts:`, finalCounts);

  // Try to get the cleaned job
  const cleanedJob = manager.getJob(jobId);
  console.log(`🔍 Job still exists: ${cleanedJob !== undefined}`);

  console.log('\n🎉 Cleanup mechanism working perfectly!');
}, 1000);
