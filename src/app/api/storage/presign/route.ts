/**
 * Supabase Storage Presign API
 *
 * This endpoint generates presigned URLs for direct file uploads to Supabase Storage
 * POST /api/storage/presign - Generate a secure upload URL
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
    console.log('🔗 Processing presigned URL request...');

    // Parse the request body
    const body = await request.json();
    const { fileName, fileType, fileSize } = body;

    // Validate required fields
    if (!fileName || !fileType || fileSize === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: fileName, fileType, fileSize',
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = serverEnv.files.allowedTypes;

    // Extract file extension from MIME type or use the fileType directly
    let fileExtension = fileType.toLowerCase();
    if (fileType.includes('/')) {
      // Handle MIME types like 'image/png' -> 'png'
      const mimeTypeMappings: Record<string, string> = {
        'image/jpeg': 'jpeg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'application/pdf': 'pdf',
      };
      fileExtension =
        mimeTypeMappings[fileType.toLowerCase()] || fileType.split('/')[1];
    }

    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        {
          success: false,
          error: `File type '${fileType}' not allowed`,
          allowedTypes: allowedTypes,
        },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = serverEnv.files.maxSize;
    if (fileSize > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File size ${(fileSize / 1024 / 1024).toFixed(1)}MB exceeds limit of ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
        },
        { status: 400 }
      );
    }

    // Generate unique file path
    const filePath = generateFilePath(fileName);
    const bucket = getStorageBucket();
    const supabase = getSupabaseAdmin();

    try {
      // Create presigned upload URL using Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(filePath);

      if (error) {
        console.error('Supabase Storage error:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to generate presigned URL',
          },
          { status: 500 }
        );
      }

      console.log('✅ Presigned URL generated successfully');

      // Return the presigned URL along with necessary information
      return NextResponse.json({
        success: true,
        data: {
          url: data.signedUrl,
          token: data.token,
          path: data.path,
          fields: {
            fileName,
            fileType,
            fileSize,
          },
        },
      });
    } catch (storageError) {
      console.error('Unexpected error generating presigned URL:', storageError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate presigned URL',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error processing presign request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
