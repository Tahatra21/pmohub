# Product Lifecycle Data Synchronization

## Overview
This document describes the data synchronization system between `lifecycle_db` and `pmo_db` for the Product Lifecycle module.

## Architecture

### Source Database: `lifecycle_db`
- **Tables**: `tbl_produk`, `tbl_segmen`, `tbl_stage`, `tbl_stage_histori`
- **Purpose**: Primary source of product lifecycle data
- **Data Volume**: 211 products, 5 segments, 4 stages, 45 stage history records

### Target Database: `pmo_db`
- **Tables**: `tbl_produk_lifecycle`, `tbl_segmen_lifecycle`, `tbl_stage_lifecycle`, `tbl_stage_histori_lifecycle`
- **Purpose**: Mirrored data for PMO application consumption
- **Sync Method**: UPSERT with ON CONFLICT handling

## Synchronization Process

### 1. Script Location
- **File**: `sync-lifecycle-data.ts`
- **Location**: Project root directory

### 2. Sync Order (Maintains Referential Integrity)
1. **Segments** (`tbl_segmen_lifecycle`)
2. **Stages** (`tbl_stage_lifecycle`)
3. **Products** (`tbl_produk_lifecycle`)
4. **Stage History** (`tbl_stage_histori_lifecycle`)

### 3. UPSERT Strategy
```sql
INSERT INTO table_name (columns...)
VALUES (values...)
ON CONFLICT (id) DO UPDATE SET
  column1 = EXCLUDED.column1,
  column2 = EXCLUDED.column2,
  ...
```

### 4. Data Types Handling
- **Integer IDs**: Direct mapping
- **BigInt (harga)**: Explicit casting with `parseInt()`
- **Timestamps**: Preserved as-is
- **JSONB**: Direct mapping for performance metrics

## API Endpoints

### Product Lifecycle APIs (New)
All endpoints read from `pmo_db` lifecycle tables:

#### 1. Products
- **GET** `/api/product-lifecycle/products`
  - Query parameters: `page`, `limit`, `search`, `stageId`, `segmentId`, `categoryId`
  - Returns: Paginated product list with segment and stage names
- **POST** `/api/product-lifecycle/products`
  - Body: FormData with product information and optional files
  - Returns: Created product data

#### 2. Dropdowns
- **GET** `/api/product-lifecycle/dropdowns`
  - Returns: Segments, stages, and categories for form dropdowns

#### 3. Dashboard
- **GET** `/api/product-lifecycle/dashboard`
  - Returns: Statistics, charts data, recent products, stage transitions

#### 4. Stage History
- **GET** `/api/product-lifecycle/stage-history`
  - Query parameters: `productId`, `page`, `limit`
  - Returns: Paginated stage transition history
- **POST** `/api/product-lifecycle/stage-history`
  - Body: JSON with stage transition data
  - Returns: Created history record

## Usage Instructions

### Manual Synchronization
```bash
# Run sync script
npx tsx sync-lifecycle-data.ts
```

### Automated Synchronization (Cron)
```bash
# Add to crontab for hourly sync
0 * * * * cd /path/to/pmo && npx tsx sync-lifecycle-data.ts >> /var/log/pmo-sync.log 2>&1

# Add to crontab for daily sync at 2 AM
0 2 * * * cd /path/to/pmo && npx tsx sync-lifecycle-data.ts >> /var/log/pmo-sync.log 2>&1
```

### Frontend Integration
The frontend has been updated to use the new API endpoints:
- **ProductForm**: Uses `/api/product-lifecycle/dropdowns` and `/api/product-lifecycle/products`
- **ProductPage**: Uses `/api/product-lifecycle/products` for listing
- **ProductCard**: Updated to handle new data structure
- **ProductDetailModal**: Updated to display lifecycle data

## Data Structure Changes

### Before (Old Structure)
```typescript
interface Product {
  id: string;
  kategori: { id: string; kategori: string };
  segmen: { id: string; segmen: string };
  stage: { id: string; stage: string };
}
```

### After (New Structure)
```typescript
interface Product {
  id: number;
  id_kategori: number;
  id_segmen: number;
  id_stage: number;
  segmen: string;  // Direct string from JOIN
  stage: string;   // Direct string from JOIN
}
```

## Benefits

### 1. Data Consistency
- Single source of truth (`lifecycle_db`)
- Automatic synchronization prevents data drift
- UPSERT ensures idempotent operations

### 2. Performance
- PMO application reads from local `pmo_db` tables
- No cross-database queries
- Optimized indexes for fast retrieval

### 3. Reliability
- Referential integrity maintained
- Incremental sync capability (using `updated_at`)
- Error handling and logging

### 4. Scalability
- Can be run multiple times safely
- Supports both manual and automated execution
- Easy to extend for additional tables

## Monitoring

### Log Output
The sync script provides detailed logging:
```
🔄 Starting data synchronization from lifecycle_db to pmo_db...
✅ Connected to lifecycle_db
📋 Creating tables if they don't exist...
✅ Tables created/verified
🔄 Syncing segments...
✅ Synced 5 segments
🔄 Syncing stages...
✅ Synced 4 stages
🔄 Syncing products...
✅ Synced 211 products
🔄 Syncing stage history...
✅ Synced 45 stage history records
🎉 Data synchronization completed successfully!
```

### Error Handling
- Database connection failures
- Data type mismatches
- Constraint violations
- Network timeouts

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure both databases exist

2. **Data Type Errors**
   - Check for NULL values in required fields
   - Verify integer casting for numeric fields
   - Ensure date formats are correct

3. **Permission Errors**
   - Verify user has CREATE/INSERT/UPDATE permissions
   - Check foreign key constraints
   - Ensure table ownership is correct

### Recovery
If sync fails:
1. Check error logs
2. Fix underlying issue
3. Re-run sync script (idempotent)
4. Verify data integrity

## Future Enhancements

1. **Incremental Sync**: Use `updated_at` timestamps for delta sync
2. **Real-time Sync**: Implement database triggers or change data capture
3. **Conflict Resolution**: Handle concurrent updates
4. **Data Validation**: Add schema validation before sync
5. **Monitoring Dashboard**: Web interface for sync status and history
