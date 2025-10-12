import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Get default role (you might want to create this role first)
    let defaultRole = await db.role.findFirst({
      where: { name: 'Field/Site Engineer' },
    });

    if (!defaultRole) {
      // Create default roles if they don't exist
      const roles = [
        { name: 'System Admin', description: 'Full system access' },
        { name: 'Project Manager', description: 'Can manage projects and teams' },
        { name: 'Field/Site Engineer', description: 'Can work on assigned tasks' },
        { name: 'IT Developer / Technical Team', description: 'Technical team member' },
        { name: 'Client / Stakeholder', description: 'View-only access' },
      ];

      for (const roleData of roles) {
        await db.role.upsert({
          where: { name: roleData.name },
          update: {},
          create: roleData,
        });
      }

      defaultRole = await db.role.findFirst({
        where: { name: 'Field/Site Engineer' },
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        roleId: defaultRole!.id,
      },
      include: { role: true },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}