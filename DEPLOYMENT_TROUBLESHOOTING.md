# Deployment Troubleshooting Guide

## Common Issues with Tasks Not Working on Netlify

### 1. Database File Not Created Properly
- **Issue**: The SQLite database file (`custom.db`) is not being created or initialized correctly on Netlify
- **Solution**: 
  - Check that the `DATABASE_URL` environment variable is set to `file:./custom.db` in Netlify
  - Verify that the `scripts/setup-db.js` script runs during the build process
  - Check the Netlify build logs for any errors during the postbuild step

### 2. Prisma Migrations Not Applied
- **Issue**: Database schema migrations are not being applied on Netlify
- **Solution**:
  - Ensure the `npx prisma migrate deploy` command runs successfully
  - Check that all migration files are included in your repository
  - Verify that the migration files don't contain PostgreSQL-specific syntax

### 3. Permissions Issues
- **Issue**: File system permissions prevent database operations
- **Solution**:
  - Ensure the Netlify build process has write permissions to create the database file
  - Check that the database file is not being locked by another process

### 4. Environment Variables
- **Issue**: Missing or incorrect environment variables
- **Solution**:
  - Verify `DATABASE_URL` is set correctly in Netlify environment variables
  - Check that no other required environment variables are missing

## Testing Steps

### 1. Test Database Connection
Visit `/api/health` on your deployed site to check if the database is accessible.

### 2. Test Task Creation
Visit `/api/test-task` to check if tasks can be created and retrieved.

### 3. Test Database Schema
Check if the `estimatedTime` column exists in the Task table by examining the migration files.

## Debugging Checklist

- [ ] Check Netlify build logs for errors during the postbuild step
- [ ] Verify that `custom.db` file is created during the build
- [ ] Confirm that `DATABASE_URL` environment variable is set correctly
- [ ] Test the `/api/health` endpoint after deployment
- [ ] Test the `/api/test-task` endpoint after deployment
- [ ] Check that all Prisma migration files are included in the repository
- [ ] Verify that migration files use SQLite-compatible syntax (no PostgreSQL-specific commands)

## If Issues Persist

1. Clear the Netlify build cache and redeploy
2. Check Netlify's documentation for file system access limitations
3. Consider using a different database solution for production deployments
4. Contact Netlify support for assistance with file system permissions