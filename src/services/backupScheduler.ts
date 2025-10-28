import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

interface BackupJob {
  id: string;
  name: string;
  schedule: string;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  status: 'active' | 'paused' | 'error';
}

class BackupScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private backupJobs: BackupJob[] = [];

  constructor() {
    this.initializeDefaultJobs();
  }

  private initializeDefaultJobs() {
    // Default backup jobs: 00:00 dan 12:00 setiap hari
    this.backupJobs = [
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

    this.startAllJobs();
  }

  private async createBackup(jobId: string, jobName: string): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] Starting scheduled backup: ${jobName}`);

      // Get database connection details
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL not found');
      }

      const url = new URL(dbUrl);
      const dbHost = url.hostname;
      const dbPort = url.port || '5432';
      const dbName = url.pathname.slice(1);
      const dbUser = url.username;
      const dbPassword = url.password;

      // Create backup directory
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Generate backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupName = `auto_backup_${jobId}_${timestamp}`;
      const backupFile = path.join(backupDir, `${backupName}.sql`);

      // Set PGPASSWORD environment variable
      process.env.PGPASSWORD = dbPassword;

      // Create backup command
      const backupCommand = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --no-password --verbose --clean --if-exists --create > "${backupFile}"`;

      console.log(`[${new Date().toISOString()}] Executing backup command for ${jobName}`);

      // Execute backup
      const { stdout, stderr } = await execAsync(backupCommand);

      // Check if backup file was created successfully
      if (!fs.existsSync(backupFile)) {
        throw new Error('Backup file was not created');
      }

      // Check for errors in stderr (but allow warnings)
      if (stderr && !stderr.includes('pg_dump: warning') && !stderr.includes('pg_dump: last built-in OID')) {
        console.error(`[${new Date().toISOString()}] Backup stderr:`, stderr);
        throw new Error('Backup failed: ' + stderr);
      }

      // Get file size
      const stats = fs.statSync(backupFile);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log(`[${new Date().toISOString()}] Backup completed successfully: ${backupName}.sql (${fileSizeMB} MB)`);

      // Log activity
      try {
        await prisma.activityLog.create({
          data: {
            action: 'CREATE',
            entity: 'Database',
            entityId: backupName,
            description: `Scheduled database backup created: ${jobName}`,
            userId: 'system', // System user for scheduled backups
            severity: 'success',
            metadata: {
              backupFile: backupFile,
              backupSize: `${fileSizeMB} MB`,
              backupType: 'scheduled',
              jobId: jobId,
              jobName: jobName,
              schedule: this.getJobById(jobId)?.schedule
            }
          }
        });
      } catch (logError) {
        console.error(`[${new Date().toISOString()}] Failed to log backup activity:`, logError);
      }

      // Update job last run time
      this.updateJobLastRun(jobId);

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Scheduled backup failed for ${jobName}:`, error);
      
      // Log error activity
      try {
        await prisma.activityLog.create({
          data: {
            action: 'ERROR',
            entity: 'Database',
            entityId: jobId,
            description: `Scheduled database backup failed: ${jobName}`,
            userId: 'system',
            severity: 'error',
            metadata: {
              error: error instanceof Error ? error.message : String(error),
              jobId: jobId,
              jobName: jobName,
              schedule: this.getJobById(jobId)?.schedule
            }
          }
        });
      } catch (logError) {
        console.error(`[${new Date().toISOString()}] Failed to log backup error:`, logError);
      }

      // Update job status to error
      this.updateJobStatus(jobId, 'error');
    }
  }

  private startAllJobs() {
    this.backupJobs.forEach(job => {
      if (job.isActive) {
        this.startJob(job);
      }
    });
  }

  private startJob(job: BackupJob) {
    if (this.jobs.has(job.id)) {
      this.jobs.get(job.id)?.destroy();
    }

    const task = cron.schedule(job.schedule, async () => {
      await this.createBackup(job.id, job.name);
    }, {
      scheduled: false,
      timezone: 'Asia/Jakarta' // WIB timezone
    });

    task.start();
    this.jobs.set(job.id, task);
    
    console.log(`[${new Date().toISOString()}] Started scheduled backup job: ${job.name} (${job.schedule})`);
  }

  private stopJob(jobId: string) {
    const task = this.jobs.get(jobId);
    if (task) {
      task.destroy();
      this.jobs.delete(jobId);
      console.log(`[${new Date().toISOString()}] Stopped scheduled backup job: ${jobId}`);
    }
  }

  private updateJobLastRun(jobId: string) {
    const job = this.backupJobs.find(j => j.id === jobId);
    if (job) {
      job.lastRun = new Date();
      job.status = 'active';
    }
  }

  private updateJobStatus(jobId: string, status: 'active' | 'paused' | 'error') {
    const job = this.backupJobs.find(j => j.id === jobId);
    if (job) {
      job.status = status;
    }
  }

  private getJobById(jobId: string): BackupJob | undefined {
    return this.backupJobs.find(j => j.id === jobId);
  }

  // Public methods
  public getJobs(): BackupJob[] {
    return this.backupJobs.map(job => ({
      ...job,
      nextRun: this.getNextRunTime(job.schedule)
    }));
  }

  public toggleJob(jobId: string): boolean {
    const job = this.backupJobs.find(j => j.id === jobId);
    if (!job) return false;

    job.isActive = !job.isActive;
    
    if (job.isActive) {
      this.startJob(job);
    } else {
      this.stopJob(jobId);
    }

    return job.isActive;
  }

  public updateJobSchedule(jobId: string, schedule: string): boolean {
    const job = this.backupJobs.find(j => j.id === jobId);
    if (!job) return false;

    // Validate cron expression
    if (!cron.validate(schedule)) {
      return false;
    }

    job.schedule = schedule;
    
    if (job.isActive) {
      this.stopJob(jobId);
      this.startJob(job);
    }

    return true;
  }

  public addJob(job: Omit<BackupJob, 'id' | 'lastRun' | 'nextRun' | 'status'>): string {
    const jobId = `custom-${Date.now()}`;
    const newJob: BackupJob = {
      ...job,
      id: jobId,
      status: 'active',
      lastRun: undefined,
      nextRun: undefined
    };

    this.backupJobs.push(newJob);
    
    if (newJob.isActive) {
      this.startJob(newJob);
    }

    return jobId;
  }

  public removeJob(jobId: string): boolean {
    const jobIndex = this.backupJobs.findIndex(j => j.id === jobId);
    if (jobIndex === -1) return false;

    // Don't allow removing default jobs
    if (jobId === 'daily-midnight' || jobId === 'daily-noon') {
      return false;
    }

    this.stopJob(jobId);
    this.backupJobs.splice(jobIndex, 1);
    return true;
  }

  private getNextRunTime(schedule: string): Date {
    // Simple calculation for next run time
    // This is a simplified version - in production you might want to use a more sophisticated library
    const now = new Date();
    const [minute, hour, dayOfMonth, month, dayOfWeek] = schedule.split(' ');

    if (hour === '0' && minute === '0') {
      // Midnight backup
      const nextRun = new Date(now);
      nextRun.setHours(24, 0, 0, 0);
      return nextRun;
    } else if (hour === '12' && minute === '0') {
      // Noon backup
      const nextRun = new Date(now);
      if (now.getHours() < 12) {
        nextRun.setHours(12, 0, 0, 0);
      } else {
        nextRun.setHours(36, 0, 0, 0); // Next day at noon
      }
      return nextRun;
    }

    return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default: next day
  }

  public getStatus() {
    const activeJobs = this.backupJobs.filter(job => job.isActive).length;
    const totalJobs = this.backupJobs.length;
    const lastBackup = this.backupJobs
      .filter(job => job.lastRun)
      .sort((a, b) => (b.lastRun?.getTime() || 0) - (a.lastRun?.getTime() || 0))[0]?.lastRun;

    return {
      isActive: activeJobs > 0,
      activeJobs,
      totalJobs,
      lastBackup,
      nextBackup: this.getNextRunTime('0 0 * * *') // Next midnight backup
    };
  }
}

// Create singleton instance
const backupScheduler = new BackupScheduler();

export default backupScheduler;
