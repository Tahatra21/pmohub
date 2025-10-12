import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const milestoneSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  projectId: z.string(),
  dueDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !hasPermission(user, 'milestones:read')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const projectId = searchParams.get('projectId') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    // Filter milestones based on user role and project access
    if (!hasPermission(user, 'milestones:all')) {
      where.project = {
        members: {
          some: {
            userId: user.id,
          },
        },
      };
    }

    const [milestones, total] = await Promise.all([
      db.milestone.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, status: true } },
        },
        orderBy: [
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.milestone.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        milestones,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get milestones error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !hasPermission(user, 'milestones:create')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = milestoneSchema.parse(body);

    // Check if project exists and user has access
    const project = await db.project.findUnique({
      where: { id: validatedData.projectId },
      include: {
        members: {
          where: { userId: user.id },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const hasAccess = hasPermission(user, 'projects:all') ||
                     project.createdBy === user.id ||
                     project.members.length > 0;

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to create milestone for this project' },
        { status: 403 }
      );
    }

    const milestone = await db.milestone.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'CREATE',
        entity: 'Milestone',
        entityId: milestone.id,
        description: `Created milestone: ${milestone.title}`,
        userId: user.id,
        metadata: {
          projectId: milestone.projectId,
          dueDate: milestone.dueDate,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: milestone,
      message: 'Milestone created successfully',
    });
  } catch (error) {
    console.error('Create milestone error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

