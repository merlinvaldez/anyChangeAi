/**
 * Supabase Storage Upload API
 *
 * This endpoint handles direct file uploads to Supabase Storage
 * POST /api/storage/upload - Upload a file and return the storage path
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSupabaseAdmin,
  getStorageBucket,
  generateFilePath,
} from '@/lib/supabase';
import { serverEnv } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Processing file upload to Supabase...');

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = serverEnv.files.allowedTypes;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        {
          success: false,
          error: `File type '${fileExtension}' not allowed`,
          allowedTypes: allowedTypes,
        },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = serverEnv.files.maxSize;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds limit of ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
        },
        { status: 400 }
      );
    }

    // Generate unique file path
    const filePath = generateFilePath(file.name);
    console.log(`📁 Generated file path: ${filePath}`);

    // Get Supabase admin client and upload file
    const supabase = getSupabaseAdmin();
    const bucketName = getStorageBucket();

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    console.log(`🚀 Uploading to bucket: ${bucketName}`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to upload file to storage',
          details: uploadError.message,
        },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file (optional, for display purposes)
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log('✅ File uploaded successfully');

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        originalName: file.name,
        size: file.size,
        type: file.type,
        storagePath: uploadData.path,
        bucket: bucketName,
        publicUrl: urlData.publicUrl, // Note: This won't work for private buckets
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Upload error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error during upload',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
