# Backup Scheduler System

## Overview
Sistem scheduler backup otomatis yang berjalan 2 kali sehari untuk database PMO.

## Features
- ✅ **Daily Midnight Backup**: Backup otomatis setiap hari pukul 00:00 WIB
- ✅ **Daily Noon Backup**: Backup otomatis setiap hari pukul 12:00 WIB
- ✅ **Timezone Support**: Menggunakan timezone Asia/Jakarta (WIB)
- ✅ **Activity Logging**: Semua backup otomatis dicatat di Activity Log
- ✅ **Error Handling**: Penanganan error yang robust
- ✅ **Status Monitoring**: Monitoring status scheduler melalui UI
- ✅ **Toggle Control**: Enable/disable per job scheduler

## Technical Implementation

### 1. Backup Scheduler Service (`src/services/backupScheduler.ts`)
```typescript
class BackupScheduler {
  // Default jobs
  private backupJobs: BackupJob[] = [
    {
      id: 'daily-midnight',
      name: 'Daily Midnight Backup',
      schedule: '0 0 * * *', // 00:00 setiap hari
      isActive: true,
      status: 'active'
    },
    {
      id: 'daily-noon',
      name: 'Daily Noon Backup',
      schedule: '0 12 * * *', // 12:00 setiap hari
      isActive: true,
      status: 'active'
    }
  ];
}
```

### 2. Cron Schedule Format
- **Midnight Backup**: `0 0 * * *` (00:00 setiap hari)
- **Noon Backup**: `0 12 * * *` (12:00 setiap hari)
- **Timezone**: Asia/Jakarta (WIB)

### 3. API Endpoints
- `GET /api/database/scheduler` - Get scheduler status and jobs
- `POST /api/database/scheduler` - Toggle job or manage scheduler

### 4. Database Integration
- Backup files disimpan di folder `/backups/`
- Format nama file: `auto_backup_{jobId}_{timestamp}.sql`
- Activity logging ke `tbl_activity_logs`

## Usage

### 1. Server Startup
Scheduler otomatis diinisialisasi saat server startup:
```bash
> Initializing backup scheduler...
> Backup scheduler initialized: 2/2 jobs active
> Next backup scheduled for: 2025-10-22T00:00:00.000Z
```

### 2. Manual Backup
Backup manual tetap bisa dilakukan melalui UI Database Management.

### 3. Monitoring
Status scheduler dapat dimonitor melalui:
- Database Management UI
- Activity Log
- Server logs

## File Structure
```
src/
├── services/
│   └── backupScheduler.ts          # Scheduler service
├── app/
│   └── api/
│       └── database/
│           └── scheduler/
│               └── route.ts        # Scheduler API
└── app/(authenticated)/settings/
    └── database/
        └── page.tsx                 # Database Management UI
```

## Configuration

### Environment Variables
- `DATABASE_URL`: Database connection string
- `NODE_ENV`: Environment (development/production)

### Backup Settings
- **Compression**: Enabled by default
- **Retention**: 30 days (configurable)
- **Storage**: `/backups/` directory

## Monitoring & Logging

### 1. Activity Logs
Setiap backup otomatis dicatat dengan:
- Action: `CREATE`
- Entity: `Database`
- Description: `Scheduled database backup created: {jobName}`
- User: `system`
- Severity: `success`/`error`
- Metadata: backup details, job info, schedule

### 2. Server Logs
```
[2025-10-21T17:28:34.675Z] Started scheduled backup job: Daily Midnight Backup (0 0 * * *)
[2025-10-21T17:28:34.678Z] Started scheduled backup job: Daily Noon Backup (0 12 * * *)
[2025-10-21T17:30:00.000Z] Starting scheduled backup: Daily Noon Backup
[2025-10-21T17:30:05.123Z] Backup completed successfully: auto_backup_daily-noon_2025-10-21T17-30-00.sql (2.5 MB)
```

### 3. Error Handling
- File creation validation
- Database connection errors
- Permission errors
- Disk space issues

## Security
- Permission check: `settings:system`
- Token-based authentication
- Secure file handling
- Error logging without sensitive data

## Performance
- Non-blocking backup process
- Efficient cron scheduling
- Minimal resource usage
- Background execution

## Troubleshooting

### Common Issues
1. **Permission Denied**: Check `settings:system` permission
2. **Database Connection**: Verify `DATABASE_URL`
3. **Disk Space**: Monitor `/backups/` directory
4. **Timezone Issues**: Ensure server timezone is correct

### Debug Commands
```bash
# Check scheduler status
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/database/scheduler

# Check backup files
ls -la backups/

# Check server logs
tail -f dev.log
```

## Future Enhancements
- [ ] Custom schedule configuration
- [ ] Backup rotation policies
- [ ] Email notifications
- [ ] Backup verification
- [ ] Cloud storage integration
- [ ] Backup encryption
- [ ] Performance metrics
- [ ] Health checks
