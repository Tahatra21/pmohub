import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !hasPermission(user, 'documents:download')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const document = await db.document.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            members: {
              where: { userId: user.id },
            },
          },
        },
        task: {
          select: {
            project: {
              select: {
                members: {
                  where: { userId: user.id },
                },
              },
            },
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const hasAccess = hasPermission(user, 'documents:all') ||
                     document.uploadedBy === user.id ||
                     document.isPublic ||
                     (document.project && document.project.members.length > 0) ||
                     (document.task && document.task.project.members.length > 0);

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to access this document' },
        { status: 403 }
      );
    }

    try {
      // Read the file from the uploads directory
      const filePath = join(process.cwd(), 'uploads', document.filePath);
      const fileBuffer = await readFile(filePath);

      // Set appropriate headers for file download
      const headers = new Headers();
      headers.set('Content-Type', document.fileType);
      headers.set('Content-Disposition', `attachment; filename="${document.fileName}"`);
      headers.set('Content-Length', fileBuffer.length.toString());

      // Log download activity
      await db.activityLog.create({
        data: {
          action: 'DOWNLOAD',
          entity: 'Document',
          entityId: document.id,
          description: `Downloaded document: ${document.title}`,
          userId: user.id,
          metadata: {
            fileName: document.fileName,
            fileSize: document.fileSize,
            fileType: document.fileType,
          },
        },
      });

      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });
    } catch (fileError) {
      console.error('Error reading file:', fileError);
      return NextResponse.json(
        { success: false, error: 'File not found on server' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Download document error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
