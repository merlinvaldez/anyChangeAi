// Simple test for our JobManager to see if it works
import { JobManager } from './jobManager';

// Create a new job manager
const manager = new JobManager();

console.log('🧪 Testing Job Manager...\n');

// Test 1: Create a job
console.log('📝 Test 1: Creating a job...');
const jobId = manager.createJob('/uploads/test.pdf');
console.log(`✅ Created job with ID: ${jobId}`);

// Test 2: Get the job we just created
console.log('\n🔍 Test 2: Looking up the job...');
const job = manager.getJob(jobId);
if (job) {
  console.log('✅ Found job:', {
    id: job.id,
    status: job.status,
    filePath: job.filePath,
    progress: job.progress,
    createdAt: job.createdAt.toISOString(),
  });
} else {
  console.log('❌ Job not found!');
}

// Test 3: Update job status
console.log('\n📈 Test 3: Updating job to processing...');
const updateResult = manager.updateJobStatus(jobId, 'processing', 50);
console.log(`✅ Update successful: ${updateResult}`);

// Check the updated job
const updatedJob = manager.getJob(jobId);
if (updatedJob) {
  console.log('✅ Updated job:', {
    status: updatedJob.status,
    progress: updatedJob.progress,
  });
}

// Test 4: Try to get a job that doesn't exist
console.log('\n❓ Test 4: Looking for non-existent job...');
const missingJob = manager.getJob('job_fake_123');
console.log(`✅ Missing job result: ${missingJob}`); // Should be undefined

// Test 5: Complete the job
console.log('\n🏁 Test 5: Completing the job...');
manager.updateJobStatus(jobId, 'done', 100);
const completedJob = manager.getJob(jobId);
if (completedJob) {
  console.log('✅ Completed job:', {
    status: completedJob.status,
    progress: completedJob.progress,
    completedAt: completedJob.completedAt?.toISOString(),
  });
}

console.log('\n🎉 All tests completed!');
