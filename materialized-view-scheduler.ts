import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function refreshMaterializedViews() {
  try {
    console.log('🔄 [SCHEDULED] Refreshing materialized views...');
    
    // Refresh all materialized views
    await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW mv_project_summary`);
    await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW mv_task_analytics`);
    await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW mv_activity_log_summary`);
    await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW mv_user_session_analytics`);
    
    console.log('✅ [SCHEDULED] All materialized views refreshed successfully!');
    
  } catch (error) {
    console.error('❌ [SCHEDULED] Error refreshing materialized views:', error);
  }
}

// Schedule materialized view refresh every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  await refreshMaterializedViews();
});

// Schedule materialized view refresh every hour at minute 0
cron.schedule('0 * * * *', async () => {
  await refreshMaterializedViews();
});

// Schedule materialized view refresh daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await refreshMaterializedViews();
});

console.log('🕐 Materialized view refresh scheduler started:');
console.log('   - Every 30 minutes');
console.log('   - Every hour at minute 0');
console.log('   - Daily at 2:00 AM');

// Keep the process running
process.on('SIGINT', async () => {
  console.log('🛑 Stopping materialized view refresh scheduler...');
  await prisma.$disconnect();
  process.exit(0);
});

// Keep the process alive
setInterval(() => {
  // Do nothing, just keep the process running
}, 1000);
