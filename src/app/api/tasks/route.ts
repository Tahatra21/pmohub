import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  assigneeId: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  progress: z.number().min(0).max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  estimatedHours: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token directly
    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'tasks:read')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const projectId = searchParams.get('projectId');
    const assigneeId = searchParams.get('assigneeId');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }
    if (projectId && projectId !== 'ALL') {
      where.projectId = projectId;
    }
    if (assigneeId && assigneeId !== 'ALL') {
      where.assigneeId = assigneeId;
    }

    // Filter tasks based on user role
    if (!hasPermission(user, 'tasks:all')) {
      // Project Manager can see tasks they created or are assigned to, or in projects they manage
      if (hasPermission(user, 'tasks:create')) {
        where.OR = [
          { assigneeId: user.id },
          { createdBy: user.id },
          { project: { members: { some: { userId: user.id } } } }
        ];
      } else {
        // Regular users can only see tasks assigned to them
        where.assigneeId = user.id;
      }
    }

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      db.task.count({ where }),
    ]);

    // Fetch resource allocations for the tasks
    const taskIds = tasks.map(task => task.id);
    const resourceAllocations = await (db as any).resourceAllocation.findMany({
      where: {
        taskId: {
          in: taskIds,
        },
      },
      include: {
        resource: {
          select: {
            id: true,
            name: true,
            type: true,
            skills: true,
            department: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Group resource allocations by task ID
    const allocationsByTask = resourceAllocations.reduce((acc: any, allocation: any) => {
      if (allocation.taskId) {
        if (!acc[allocation.taskId]) {
          acc[allocation.taskId] = [];
        }
        acc[allocation.taskId].push(allocation);
      }
      return acc;
    }, {} as Record<string, any[]>);

    // Merge resource allocations with tasks
    const tasksWithAllocations = tasks.map(task => ({
      ...task,
      resourceAllocations: allocationsByTask[task.id] || [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        tasks: tasksWithAllocations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token directly
    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'tasks:create')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    const task = await db.task.create({
      data: {
        ...validatedData,
        creatorId: user.id,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'CREATE',
        entity: 'Task',
        entityId: task.id,
        description: `Created task: ${task.title}`,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: { task },
      message: 'Task created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token directly
    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'tasks:update')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const validatedData = taskSchema.partial().parse(updateData);

    const task = await db.task.update({
      where: { id },
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Task',
        entityId: task.id,
        description: `Updated task: ${task.title}`,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: { task },
      message: 'Task updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token directly
    const user = await verifyToken(token);
    if (!user || !hasPermission(user, 'tasks:delete')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get task name before deletion for logging
    const task = await db.task.findUnique({
      where: { id },
      select: { title: true },
    });

    await db.task.delete({
      where: { id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'DELETE',
        entity: 'Task',
        entityId: id,
        description: `Deleted task: ${task?.title || 'Unknown'}`,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}