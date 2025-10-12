import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { z } from 'zod';

const dependencySchema = z.object({
  dependsOnTaskId: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !hasPermission(user, 'tasks:update')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { dependsOnTaskId } = dependencySchema.parse(body);

    // Check if both tasks exist
    const [task, dependsOnTask] = await Promise.all([
      db.task.findUnique({
        where: { id: params.id },
        include: {
          project: {
            select: {
              members: {
                where: { userId: user.id },
              },
            },
          },
        },
      }),
      db.task.findUnique({
        where: { id: dependsOnTaskId },
      }),
    ]);

    if (!task || !dependsOnTask) {
      return NextResponse.json(
        { success: false, error: 'One or both tasks not found' },
        { status: 404 }
      );
    }

    // Check if user has access to both tasks
    const hasAccess = hasPermission(user, 'tasks:all') ||
                     task.assigneeId === user.id ||
                     task.creatorId === user.id ||
                     task.project.members.length > 0;

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check for circular dependency
    if (params.id === dependsOnTaskId) {
      return NextResponse.json(
        { success: false, error: 'Task cannot depend on itself' },
        { status: 400 }
      );
    }

    // Check if dependency already exists
    const existingDependency = await db.taskDependency.findUnique({
      where: {
        taskId_dependsOnTaskId: {
          taskId: params.id,
          dependsOnTaskId: dependsOnTaskId,
        },
      },
    });

    if (existingDependency) {
      return NextResponse.json(
        { success: false, error: 'Dependency already exists' },
        { status: 400 }
      );
    }

    // Check for circular dependencies recursively
    const hasCircularDependency = await checkCircularDependency(params.id, dependsOnTaskId);
    if (hasCircularDependency) {
      return NextResponse.json(
        { success: false, error: 'This would create a circular dependency' },
        { status: 400 }
      );
    }

    const dependency = await db.taskDependency.create({
      data: {
        taskId: params.id,
        dependsOnTaskId: dependsOnTaskId,
      },
      include: {
        dependsOn: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'CREATE',
        entity: 'TaskDependency',
        entityId: dependency.id,
        description: `Added dependency: ${task.title} depends on ${dependsOnTask.title}`,
        userId: user.id,
        metadata: {
          taskId: params.id,
          dependsOnTaskId: dependsOnTaskId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: dependency,
      message: 'Dependency added successfully',
    });
  } catch (error) {
    console.error('Add dependency error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !hasPermission(user, 'tasks:update')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dependsOnTaskId = searchParams.get('dependsOnTaskId');

    if (!dependsOnTaskId) {
      return NextResponse.json(
        { success: false, error: 'dependsOnTaskId parameter is required' },
        { status: 400 }
      );
    }

    // Check if task exists and user has access
    const task = await db.task.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            members: {
              where: { userId: user.id },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const hasAccess = hasPermission(user, 'tasks:all') ||
                     task.assigneeId === user.id ||
                     task.creatorId === user.id ||
                     task.project.members.length > 0;

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Find and delete the dependency
    const dependency = await db.taskDependency.findUnique({
      where: {
        taskId_dependsOnTaskId: {
          taskId: params.id,
          dependsOnTaskId: dependsOnTaskId,
        },
      },
    });

    if (!dependency) {
      return NextResponse.json(
        { success: false, error: 'Dependency not found' },
        { status: 404 }
      );
    }

    await db.taskDependency.delete({
      where: {
        taskId_dependsOnTaskId: {
          taskId: params.id,
          dependsOnTaskId: dependsOnTaskId,
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'DELETE',
        entity: 'TaskDependency',
        entityId: dependency.id,
        description: `Removed dependency from task: ${task.title}`,
        userId: user.id,
        metadata: {
          taskId: params.id,
          dependsOnTaskId: dependsOnTaskId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Dependency removed successfully',
    });
  } catch (error) {
    console.error('Remove dependency error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to check for circular dependencies
async function checkCircularDependency(taskId: string, dependsOnTaskId: string): Promise<boolean> {
  const visited = new Set<string>();
  const stack = [dependsOnTaskId];

  while (stack.length > 0) {
    const currentTaskId = stack.pop()!;
    
    if (currentTaskId === taskId) {
      return true; // Circular dependency found
    }

    if (visited.has(currentTaskId)) {
      continue;
    }

    visited.add(currentTaskId);

    // Get all tasks that depend on the current task
    const dependencies = await db.taskDependency.findMany({
      where: { taskId: currentTaskId },
      select: { dependsOnTaskId: true },
    });

    for (const dep of dependencies) {
      stack.push(dep.dependsOnTaskId);
    }
  }

  return false;
}

