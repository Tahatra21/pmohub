#!/bin/bash

# =====================================================
# COPY PRODUCT LIFECYCLE DATA FROM LIFECYCLE_DB TO PMO_DB
# =====================================================

echo "🚀 Starting Product Lifecycle data copy process..."
echo "=================================================="

# Database connection parameters
LIFECYCLE_DB="lifecycle_db"
PMO_DB="pmo_db"
DB_HOST="localhost"
DB_USER="postgres"

# Create temporary directory for data export
TEMP_DIR="/tmp/lifecycle_export"
mkdir -p $TEMP_DIR

echo "📊 Step 1: Exporting data from lifecycle_db..."

# Export data from lifecycle_db
echo "  - Exporting stages..."
psql -h $DB_HOST -U $DB_USER -d $LIFECYCLE_DB -c "COPY (SELECT id, stage, created_at, updated_at, icon_light, icon_dark FROM tbl_stage ORDER BY id) TO STDOUT WITH CSV HEADER" > $TEMP_DIR/stages.csv

echo "  - Exporting categories..."
psql -h $DB_HOST -U $DB_USER -d $LIFECYCLE_DB -c "COPY (SELECT id, kategori, created_at, updated_at, icon_light, icon_dark FROM tbl_kategori ORDER BY id) TO STDOUT WITH CSV HEADER" > $TEMP_DIR/categories.csv

echo "  - Exporting segments..."
psql -h $DB_HOST -U $DB_USER -d $LIFECYCLE_DB -c "COPY (SELECT id, segmen, created_at, updated_at, icon_light, icon_dark FROM tbl_segmen ORDER BY id) TO STDOUT WITH CSV HEADER" > $TEMP_DIR/segments.csv

echo "  - Exporting positions..."
psql -h $DB_HOST -U $DB_USER -d $LIFECYCLE_DB -c "COPY (SELECT id, jabatan, created_at, updated_at FROM tbl_jabatan ORDER BY id) TO STDOUT WITH CSV HEADER" > $TEMP_DIR/positions.csv

echo "  - Exporting products..."
psql -h $DB_HOST -U $DB_USER -d $LIFECYCLE_DB -c "COPY (SELECT id, produk, deskripsi, id_kategori, id_segmen, id_stage, harga, tanggal_launch, pelanggan, created_at, updated_at, tanggal_stage_end, tanggal_stage_start FROM tbl_produk ORDER BY id) TO STDOUT WITH CSV HEADER" > $TEMP_DIR/products.csv

echo "  - Exporting stage history..."
psql -h $DB_HOST -U $DB_USER -d $LIFECYCLE_DB -c "COPY (SELECT id, id_produk, stage_previous, stage_now, catatan, created_at, updated_at, tanggal_perubahan, performance_metrics FROM tbl_stage_histori ORDER BY id) TO STDOUT WITH CSV HEADER" > $TEMP_DIR/stage_history.csv

echo "  - Exporting interval stages..."
psql -h $DB_HOST -U $DB_USER -d $LIFECYCLE_DB -c "COPY (SELECT id, id_stage, keterangan, created_at, updated_at, interval, id_produk FROM tbl_interval_stage ORDER BY id) TO STDOUT WITH CSV HEADER" > $TEMP_DIR/interval_stages.csv

echo "  - Exporting product development history..."
psql -h $DB_HOST -U $DB_USER -d $LIFECYCLE_DB -c "COPY (SELECT id, id_produk, deskripsi, created_at, updated_at FROM tbl_produk_dev_histori ORDER BY id) TO STDOUT WITH CSV HEADER" > $TEMP_DIR/product_dev_history.csv

echo "  - Exporting product attachments..."
psql -h $DB_HOST -U $DB_USER -d $LIFECYCLE_DB -c "COPY (SELECT id, id_produk, filename, original_filename, file_path, file_size, mime_type, created_at, updated_at FROM tbl_attachment_produk ORDER BY id) TO STDOUT WITH CSV HEADER" > $TEMP_DIR/product_attachments.csv

echo ""
echo "📥 Step 2: Importing data to pmo_db..."

# Clear existing data first
echo "  - Clearing existing data..."
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "
TRUNCATE TABLE tbl_attachment_produk CASCADE;
TRUNCATE TABLE tbl_produk_dev_histori CASCADE;
TRUNCATE TABLE tbl_interval_stage CASCADE;
TRUNCATE TABLE tbl_stage_histori CASCADE;
TRUNCATE TABLE tbl_produk CASCADE;
TRUNCATE TABLE tbl_jabatan CASCADE;
TRUNCATE TABLE tbl_segmen CASCADE;
TRUNCATE TABLE tbl_kategori CASCADE;
TRUNCATE TABLE tbl_stage CASCADE;
"

# Import data to pmo_db using simple COPY commands
echo "  - Importing stages..."
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "COPY tbl_stage FROM '$TEMP_DIR/stages.csv' WITH CSV HEADER;"

echo "  - Importing categories..."
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "COPY tbl_kategori FROM '$TEMP_DIR/categories.csv' WITH CSV HEADER;"

echo "  - Importing segments..."
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "COPY tbl_segmen FROM '$TEMP_DIR/segments.csv' WITH CSV HEADER;"

echo "  - Importing positions..."
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "COPY tbl_jabatan FROM '$TEMP_DIR/positions.csv' WITH CSV HEADER;"

echo "  - Importing products..."
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "COPY tbl_produk FROM '$TEMP_DIR/products.csv' WITH CSV HEADER;"

echo "  - Importing stage history..."
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "COPY tbl_stage_histori FROM '$TEMP_DIR/stage_history.csv' WITH CSV HEADER;"

echo "  - Importing interval stages..."
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "COPY tbl_interval_stage FROM '$TEMP_DIR/interval_stages.csv' WITH CSV HEADER;"

echo "  - Importing product development history..."
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "COPY tbl_produk_dev_histori FROM '$TEMP_DIR/product_dev_history.csv' WITH CSV HEADER;"

echo "  - Importing product attachments..."
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "COPY tbl_attachment_produk FROM '$TEMP_DIR/product_attachments.csv' WITH CSV HEADER;"

echo ""
echo "🔄 Step 3: Updating sequences..."

# Update sequences to match the copied data
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "SELECT setval('tbl_stage_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM tbl_stage));"
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "SELECT setval('tbl_kategori_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM tbl_kategori));"
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "SELECT setval('tbl_segmen_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM tbl_segmen));"
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "SELECT setval('tbl_jabatan_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM tbl_jabatan));"
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "SELECT setval('tbl_produk_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM tbl_produk));"
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "SELECT setval('tbl_stage_histori_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM tbl_stage_histori));"
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "SELECT setval('tbl_interval_stage_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM tbl_interval_stage));"
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "SELECT setval('tbl_produk_dev_histori_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM tbl_produk_dev_histori));"
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "SELECT setval('tbl_attachment_produk_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM tbl_attachment_produk));"

echo ""
echo "🧹 Step 4: Cleaning up temporary files..."
rm -rf $TEMP_DIR

echo ""
echo "✅ Product Lifecycle data copy completed successfully!"
echo "=================================================="
echo ""
echo "📊 Data Summary:"
psql -h $DB_HOST -U $DB_USER -d $PMO_DB -c "
SELECT 
    'Stages' as table_name, COUNT(*) as record_count FROM tbl_stage
UNION ALL
SELECT 
    'Categories' as table_name, COUNT(*) as record_count FROM tbl_kategori
UNION ALL
SELECT 
    'Segments' as table_name, COUNT(*) as record_count FROM tbl_segmen
UNION ALL
SELECT 
    'Positions' as table_name, COUNT(*) as record_count FROM tbl_jabatan
UNION ALL
SELECT 
    'Products' as table_name, COUNT(*) as record_count FROM tbl_produk
UNION ALL
SELECT 
    'Stage History' as table_name, COUNT(*) as record_count FROM tbl_stage_histori
UNION ALL
SELECT 
    'Interval Stages' as table_name, COUNT(*) as record_count FROM tbl_interval_stage
UNION ALL
SELECT 
    'Product Dev History' as table_name, COUNT(*) as record_count FROM tbl_produk_dev_histori
UNION ALL
SELECT 
    'Product Attachments' as table_name, COUNT(*) as record_count FROM tbl_attachment_produk;
"
