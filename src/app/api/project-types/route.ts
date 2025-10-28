import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Return hardcoded project types with proper enum values
    const projectTypes = [
      {
        id: 'INFRA_NETWORK',
        name: 'INFRA NETWORK',
        description: 'Network infrastructure and electrical projects',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'INFRA_CLOUD_DC',
        name: 'INFRA CLOUD & DC',
        description: 'Cloud infrastructure and data center projects',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'MULTIMEDIA_IOT',
        name: 'MULTIMEDIA & IOT',
        description: 'Multimedia systems and IoT implementation projects',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'DIGITAL_ELECTRICITY',
        name: 'DIGITAL ELECTRICITY',
        description: 'Digital electricity management systems',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'SAAS_BASED',
        name: 'SAAS BASED',
        description: 'Software as a Service based projects',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: projectTypes,
    });
  } catch (error) {
    console.error('Error fetching project types:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project types' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, isActive = true } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const projectType = await prisma.projectType.create({
      data: {
        name,
        description,
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: projectType,
    });
  } catch (error) {
    console.error('Error creating project type:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project type' },
      { status: 500 }
    );
  }
}
