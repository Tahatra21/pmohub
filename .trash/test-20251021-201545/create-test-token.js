#!/usr/bin/env node

// Script to create a test token with proper permissions for testing
import { createToken } from './src/lib/auth.js';

const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: {
    id: 'admin-role-id',
    name: 'Admin',
    permissions: []
  }
};

async function createTestToken() {
  try {
    const token = await createToken(testUser);
    console.log('Test Token:', token);
    console.log('\nUsage:');
    console.log(`curl -X GET "http://localhost:3000/api/cost/estimators" -H "Authorization: Bearer ${token}"`);
  } catch (error) {
    console.error('Error creating token:', error);
  }
}

createTestToken();
