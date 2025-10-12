# ProjectHub - Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Set up production PostgreSQL database
- [ ] Configure environment variables in production
- [ ] Set up SSL certificates for HTTPS
- [ ] Configure domain and DNS settings
- [ ] Set up CDN for static assets (optional)

### 2. Database Setup
- [ ] Create production database
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Seed production database with initial data (optional)
- [ ] Set up database backups

### 3. Security Configuration
- [ ] Generate strong JWT secret
- [ ] Set up secure session management
- [ ] Configure CORS settings
- [ ] Set up rate limiting
- [ ] Enable HTTPS redirects
- [ ] Configure security headers

### 4. File Storage
- [ ] Set up file upload directory with proper permissions
- [ ] Configure file size limits
- [ ] Set up file cleanup policies
- [ ] Consider cloud storage for production (AWS S3, etc.)

### 5. Monitoring & Logging
- [ ] Set up application monitoring (e.g., Sentry)
- [ ] Configure error tracking
- [ ] Set up performance monitoring
- [ ] Configure log aggregation
- [ ] Set up health check endpoints

## Production Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@your-db-host:5432/projecthub"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-min-32-chars"

# Next.js Configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-nextauth-secret"

# Optional: File Upload Configuration
MAX_FILE_SIZE="10485760"  # 10MB in bytes
UPLOAD_DIR="/app/uploads"

# Optional: Email Configuration (for notifications)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"

# Optional: Monitoring
SENTRY_DSN="your-sentry-dsn"
```

## Deployment Steps

### 1. Build Application
```bash
# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Verify build
npm run start
```

### 2. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Optional: Seed with initial data
npm run db:seed
```

### 3. Server Configuration

#### Nginx Configuration (if using Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File upload size limit
    client_max_body_size 10M;
}
```

#### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'projecthub',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/your/app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

### 4. Start Application
```bash
# Using PM2
pm2 start ecosystem.config.js

# Or using npm directly
npm start
```

## Post-Deployment Verification

### 1. Health Checks
- [ ] Application loads correctly
- [ ] Database connection works
- [ ] Authentication system functions
- [ ] File uploads work
- [ ] API endpoints respond correctly

### 2. User Testing
- [ ] Admin can login and access all features
- [ ] Project Manager can create and manage projects
- [ ] Engineers can view assigned tasks
- [ ] Role-based permissions work correctly
- [ ] Mobile responsiveness works

### 3. Performance Testing
- [ ] Page load times are acceptable
- [ ] Database queries are optimized
- [ ] File uploads work within size limits
- [ ] Concurrent users can access the system

### 4. Security Testing
- [ ] HTTPS is properly configured
- [ ] Authentication tokens work correctly
- [ ] Unauthorized access is blocked
- [ ] Input validation prevents injection attacks
- [ ] File uploads are secure

## Maintenance Tasks

### Daily
- [ ] Check application logs for errors
- [ ] Monitor database performance
- [ ] Verify backup completion

### Weekly
- [ ] Review security logs
- [ ] Check disk space usage
- [ ] Update dependencies if needed

### Monthly
- [ ] Review and rotate secrets
- [ ] Update SSL certificates
- [ ] Performance optimization review
- [ ] Database maintenance

## Backup Strategy

### Database Backups
```bash
# Daily automated backup
pg_dump projecthub > backup_$(date +%Y%m%d).sql

# Restore from backup
psql projecthub < backup_20240101.sql
```

### File Backups
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /app/uploads/
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify database server is running
   - Check network connectivity

2. **JWT Token Errors**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Ensure consistent secret across instances

3. **File Upload Issues**
   - Check directory permissions
   - Verify file size limits
   - Check disk space

4. **Performance Issues**
   - Monitor database query performance
   - Check server resource usage
   - Optimize images and assets

### Log Locations
- Application logs: `/app/logs/`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

## Rollback Plan

1. **Quick Rollback**
   ```bash
   # Stop current application
   pm2 stop projecthub
   
   # Restore previous version
   git checkout previous-commit-hash
   npm ci
   npm run build
   
   # Restart application
   pm2 start projecthub
   ```

2. **Database Rollback**
   ```bash
   # Restore from backup
   psql projecthub < backup_before_deployment.sql
   ```

## Support Contacts

- **Technical Issues**: Development Team
- **Infrastructure**: DevOps Team
- **Database**: DBA Team
- **Security**: Security Team

---

**Note**: This checklist should be customized based on your specific deployment environment and requirements.