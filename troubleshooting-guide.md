# PMO Application Troubleshooting Guide

## 🚀 Application Status
✅ **Application is running successfully!**
- Server: http://localhost:3000
- API Health: Working
- Database: Using tbl_ prefix tables
- Authentication: Working

## 🔧 Common Issues and Solutions

### 1. MetaMask Connection Error
**Error**: `Failed to connect to MetaMask`

**Solution**: This is a browser extension error, not an application error. To fix:
1. **Disable MetaMask temporarily**:
   - Go to Chrome Extensions (chrome://extensions/)
   - Toggle off MetaMask extension
   - Refresh the page

2. **Or use Incognito Mode**:
   - Open incognito window
   - Navigate to http://localhost:3000

3. **Or use different browser**:
   - Try Firefox, Safari, or Edge

### 2. Port 3000 Already in Use
**Error**: `EADDRINUSE: address already in use 0.0.0.0:3000`

**Solution**:
```bash
# Use the kill script
./kill-port-3000.sh

# Or manually
lsof -ti:3000 | xargs kill -9

# Then restart
./start-app.sh
```

### 3. Build/Cache Issues
**Error**: Various build errors or missing files

**Solution**:
```bash
# Clean cache and restart
rm -rf .next
npm run dev
```

### 4. Select Component Error
**Error**: `A <Select.Item /> must have a value prop that is not an empty string`

**Solution**: This error occurs when SelectItem components have empty value props. Fixed by changing:
```jsx
// ❌ Wrong - causes error
<SelectItem value="">All Status</SelectItem>

// ✅ Correct - use valid value
<SelectItem value="ALL">All Status</SelectItem>
```

### 5. Database Connection Issues
**Error**: Database connection failed

**Solution**:
```bash
# Check PostgreSQL status
brew services list | grep postgresql@17

# Start PostgreSQL if needed
brew services start postgresql@17

# Test connection
psql "postgresql://postgres:postgres@localhost:5432/pmo_db" -c "SELECT 1;"
```

## 🎯 Quick Start Commands

### Start Application
```bash
./start-app.sh
```

### Kill Port 3000
```bash
./kill-port-3000.sh
```

### Test Database
```bash
./test-database.sh
```

### Backup Database
```bash
./backup-database.sh
```

## 🌐 Access Information

- **Frontend**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Login**: http://localhost:3000/login
- **API Health**: http://localhost:3000/api/health

## 👤 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **System Admin** | admin@projecthub.com | admin123 |
| **Project Manager** | manager@projecthub.com | manager123 |
| **Field Engineer** | engineer@projecthub.com | engineer123 |

## 📊 Database Information

- **Host**: localhost
- **Port**: 5432
- **Database**: pmo_db
- **User**: postgres
- **Password**: postgres
- **Tables**: All using `tbl_` prefix

## 🆘 If All Else Fails

1. **Complete Reset**:
   ```bash
   ./kill-port-3000.sh
   rm -rf .next
   rm -rf node_modules
   npm install
   export $(cat .env.local | grep -v '^#' | xargs) && npm run dev
   ```

2. **Database Reset**:
   ```bash
   npm run db:reset
   npm run db:push
   npm run db:seed
   ```

## ✅ Current Status

- ✅ Application running on http://localhost:3000
- ✅ Database with tbl_ prefix working
- ✅ Authentication working
- ✅ All API endpoints responding
- ✅ Dashboard accessible
- ✅ Login functionality working

**The PMO application is fully functional! 🎉**
