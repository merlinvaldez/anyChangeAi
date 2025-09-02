/**
 * Supabase Storage Test API
 *
 * This endpoint tests our Supabase connection and storage setup
 * GET /api/storage/test - Returns storage info and connection status
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin, getStorageBucket } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🧪 Testing Supabase storage connection...');

    // Get Supabase admin client
    const supabase = getSupabaseAdmin();
    const bucketName = getStorageBucket();

    // Test 1: Check if we can connect to Supabase
    console.log('📡 Testing Supabase connection...');

    // Test 2: List buckets to verify connection
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to Supabase storage',
          details: bucketsError.message,
        },
        { status: 500 }
      );
    }

    // Test 3: Check if our documents bucket exists
    const documentsBucket = buckets?.find(bucket => bucket.name === bucketName);

    if (!documentsBucket) {
      return NextResponse.json(
        {
          success: false,
          error: `Bucket '${bucketName}' not found`,
          availableBuckets: buckets?.map(b => b.name) || [],
          instruction: `Please create a bucket named '${bucketName}' in your Supabase dashboard`,
        },
        { status: 404 }
      );
    }

    // Test 4: Try to list files in the bucket (should work even if empty)
    const { data: files, error: filesError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });

    if (filesError) {
      console.error('❌ Failed to list files:', filesError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to access bucket contents',
          details: filesError.message,
          bucket: documentsBucket,
        },
        { status: 500 }
      );
    }

    // Success! Everything is working
    console.log('✅ Supabase storage test successful');

    return NextResponse.json({
      success: true,
      message: 'Supabase storage is properly configured',
      bucket: {
        name: documentsBucket.name,
        id: documentsBucket.id,
        public: documentsBucket.public,
        createdAt: documentsBucket.created_at,
        updatedAt: documentsBucket.updated_at,
      },
      filesInBucket: files?.length || 0,
      storageUrl: 'Storage connected successfully',
      testTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Supabase storage test failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error during storage test',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
