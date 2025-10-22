import { NextResponse } from 'next/server';

// This endpoint serves a file of a specific size for download speed testing.
export async function GET() {
  // Create a 1MB buffer of zeros.
  // 1 MB = 1024 * 1024 bytes.
  const fileSizeInBytes = 1024 * 1024;
  const buffer = Buffer.alloc(fileSizeInBytes);

  // Return the buffer as a response.
  // The 'application/octet-stream' content type tells the browser to treat it as a binary file.
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': fileSizeInBytes.toString(),
      // Disable caching to ensure the file is downloaded every time for accurate testing.
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
