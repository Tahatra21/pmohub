#!/usr/bin/env node

// Script to create admin user for testing
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }
    });

    if (existingUser) {
      console.log('Admin user already exists:', existingUser.email);
      return;
    }

    // Create admin role if it doesn't exist
    let adminRole = await prisma.role.findFirst({
      where: { name: 'Admin' }
    });

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: 'Admin',
          description: 'System Administrator',
          permissions: ['dashboard:read', 'projects:all', 'tasks:all', 'users:all', 'cost:all']
        }
      });
      console.log('Created admin role');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        roleId: adminRole.id,
        isActive: true
      }
    });

    console.log('Admin user created successfully:');
    console.log('Email:', adminUser.email);
    console.log('Password: admin123');
    console.log('Role:', adminRole.name);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
