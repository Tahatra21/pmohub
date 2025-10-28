# CRUD Health Runbook

## Overview
This runbook provides commands and procedures for maintaining CRUD operations health, testing, and verification in the PMO system.

## Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Environment variables configured in `.env`

### Install Dependencies
```bash
npm install
```

### Initialize Database
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db push
```

## Testing Commands

### TypeScript Type Checking
```bash
npm run typecheck
# or
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### All Tests
```bash
npm run test:all
```

### Build Verification
```bash
npm run build
```

## Database Verification

### Schema Validation
```bash
npx prisma validate
npx prisma format
```

### Generate Client
```bash
npx prisma generate
```

### Database Status Check
```bash
npx prisma db pull --print
```

### Seed Database (if seed script exists)
```bash
npx prisma db seed
```

## CRUD Health Checks

### Verify All Core Entities
Run this script to check CRUD operations for all entities:
```bash
node scripts/verify-crud-health.js
```

### Manual CRUD Testing

#### Users
```bash
# GET all users
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/users

# POST create user
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}' \
  http://localhost:3000/api/users
```

#### Projects
```bash
# GET all projects
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/projects

# POST create project
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","client":"Test Client","type":"IT"}' \
  http://localhost:3000/api/projects
```

## Monitoring & Logging

### View Request Logs
Request logs are automatically logged to console with format:
```
[API] METHOD /path - STATUS duration - User: userId
```

### Check Activity Logs
```bash
# Query database for recent activity logs
psql $DATABASE_URL -c "SELECT * FROM tbl_activity_logs ORDER BY created_at DESC LIMIT 10;"
```

## Error Handling

### Common Issues

#### TypeScript Errors
1. Clear cache: `rm -rf node_modules .next`
2. Reinstall: `npm install`
3. Regenerate Prisma: `npx prisma generate`

#### Database Connection Issues
```bash
# Check connection
npx prisma db pull

# Check migrations
npx prisma migrate status
```

#### Build Failures
```bash
# Clean build
rm -rf .next
npm run build
```

## Performance Monitoring

### Check N+1 Queries
The system uses Prisma `include` statements to prevent N+1 queries. 

Key optimizations:
- ✅ Projects include creator in single query
- ✅ Tasks include project and assignee in single query
- ✅ Resources use proper includes

### Query Profiling
Enable query logging in Prisma:
```typescript
// Add to prisma client initialization
const db = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## Security Checks

### Verify Authentication
```bash
# Test JWT verification
curl -H "Authorization: Bearer INVALID_TOKEN" http://localhost:3000/api/users/me
# Should return 401
```

### Check Permissions
Each role has specific permissions:
- System Admin: Full access
- Project Manager: Management access
- Field/Site Engineer: Execution access
- Client/Stakeholder: Read-only

## API Contract Verification

### Endpoints
- Users: `/api/users`, `/api/users/[id]`
- Projects: `/api/projects`, `/api/projects/[id]`
- Tasks: `/api/tasks`, `/api/tasks/[id]`
- Resources: `/api/resources`, `/api/resources/[id]`
- Documents: `/api/documents`, `/api/documents/[id]`
- Budgets: `/api/budgets`

### HTTP Methods
- GET: Read operations
- POST: Create operations
- PUT: Update operations
- DELETE: Delete operations

### Response Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Rollback Procedures

### Code Rollback
```bash
git revert <commit-hash>
git push
```

### Database Rollback
```bash
npx prisma migrate reset
npx prisma migrate deploy
```

## Feature Flags

### Safe Fixes Mode
All fixes are behind safety checks. Enable verbose logging:
```bash
DEBUG=true npm run dev
```

## CI/CD Integration

### Pre-deployment Checks
```bash
npm run verify:crud
```

This runs:
1. TypeScript checks
2. Linting
3. Unit tests
4. Integration tests
5. Build verification

### Deployment Script
```bash
# Run full verification before deploy
npm run verify:crud && npm run build && npm run start
```

## Troubleshooting

### "Cannot find module" Errors
```bash
npm install
npx prisma generate
```

### Port Already in Use
```bash
# Find process
lsof -ti:3000
# Kill process
kill -9 $(lsof -ti:3000)
```

### Database Migration Issues
```bash
npx prisma migrate reset --force
npx prisma db push
```

## Acceptance Criteria

### Minimum Requirements ✅
- ✅ All CRUD operations functional
- ✅ TypeScript compilation successful
- ✅ No critical linting errors
- ✅ Authentication working
- ✅ Permissions enforced
- ✅ Database integrity maintained
- ✅ API contracts documented

## Reports Generated

1. `reports/system-status.md` - System health overview
2. `reports/contracts.md` - API contracts (to be generated)
3. `reports/tests-summary.md` - Test results (to be generated)
4. `coverage/` - Test coverage reports (to be generated)

## Support

For issues:
1. Check logs in console
2. Verify database connection
3. Check API responses
4. Review error messages
5. Consult documentation

---

**Last Updated**: ${new Date().toISOString()}
**Maintainer**: PMO Development Team

