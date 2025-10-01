# Backup Checklist - Before Phase 2

**Purpose:** Ensure safe rollback capability before making any changes  
**Required Before:** Proceeding to Phase 2 (Clean API Layer)  
**Estimated Time:** 30-60 minutes

---

## 🎯 Why Backups Are Critical

Phase 2 involves:
- Creating new REST API endpoints
- Modifying database query patterns
- Potentially changing data structures
- Removing legacy AJAX handlers

**If something goes wrong**, you need to be able to:
- Restore the database to its current state
- Restore files to their current state
- Get back to a working system quickly

---

## ✅ Backup Checklist

### Part 1: Database Backup

#### WordPress Database

- [ ] **1.1: Export Database via phpMyAdmin**
  ```
  1. Go to phpMyAdmin
  2. Select your WordPress database
  3. Click "Export" tab
  4. Choose "Custom" export method
  5. Select all tables with wp_ prefix
  6. Format: SQL
  7. Check "Add DROP TABLE / VIEW / PROCEDURE"
  8. Check "Add IF NOT EXISTS"
  9. Click "Go"
  10. Save file as: backup-YYYY-MM-DD-before-phase2.sql
  ```
  
  **File Location:** `___________________________________`  
  **File Size:** `___________________________________`  
  **Date Created:** `___________________________________`

- [ ] **1.2: Alternative - Database Export via Plugin**
  
  If using a backup plugin (UpdraftPlus, BackWPup, etc.):
  ```
  1. Go to WordPress Admin
  2. Navigate to your backup plugin
  3. Click "Backup Now"
  4. Include: Database only (or full backup)
  5. Download backup file to local computer
  ```
  
  **Plugin Used:** `___________________________________`  
  **Backup Location:** `___________________________________`  
  **File Size:** `___________________________________`

- [ ] **1.3: Verify Database Backup**
  ```
  1. Check file size is > 0 bytes
  2. Open file in text editor
  3. Verify it contains SQL statements
  4. Check for CREATE TABLE and INSERT statements
  5. Ensure backup is NOT corrupted
  ```
  
  **Verification Status:** `___________________________________`

---

### Part 2: File System Backup

#### Plugin Files

- [ ] **2.1: Backup Plugin Directory**
  
  **Method 1 - Windows Explorer:**
  ```
  1. Navigate to: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\
  2. Right-click on "mk4" folder
  3. Choose "Send to > Compressed (zipped) folder"
  4. Rename to: mk4-backup-YYYY-MM-DD-before-phase2.zip
  5. Move zip to safe location (external drive, cloud, etc.)
  ```
  
  **Method 2 - Git Commit:**
  ```
  cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4
  git add -A
  git commit -m "Phase 1 complete - 100% Vue coverage - Before Phase 2"
  git tag phase1-complete
  git push origin main --tags
  ```
  
  **Backup Location:** `___________________________________`  
  **File Size:** `___________________________________`  
  **Git Commit Hash:** `___________________________________`

- [ ] **2.2: Backup WordPress Installation (Optional but Recommended)**
  ```
  1. Backup entire WordPress directory
  2. Include wp-content/uploads (media files)
  3. Include wp-config.php
  4. Compress to zip file
  ```
  
  **Backup Location:** `___________________________________`  
  **File Size:** `___________________________________`

---

### Part 3: Verify Backups

- [ ] **3.1: Test Database Restore (Recommended)**
  
  **On a test/staging site:**
  ```
  1. Create a test WordPress installation
  2. Import the backup database
  3. Verify tables are present
  4. Check a few sample posts/pages load
  5. Confirm no errors
  ```
  
  **Test Site URL:** `___________________________________`  
  **Restore Status:** `___________________________________`

- [ ] **3.2: Test File Restore (Quick Check)**
  ```
  1. Extract backup zip to a test folder
  2. Verify all files are present
  3. Check file sizes match originals
  4. Ensure no corruption
  ```
  
  **Test Status:** `___________________________________`

---

### Part 4: Document Current State

- [ ] **4.1: Record Current Versions**
  ```
  Plugin Version:     _____________________
  WordPress Version:  _____________________
  PHP Version:        _____________________
  Database Version:   _____________________
  Vue Version:        _____________________
  Node Version:       _____________________
  ```

- [ ] **4.2: Screenshot Current Admin Dashboard**
  ```
  Take screenshots of:
  - WordPress Dashboard
  - Plugins page
  - Media Kit Builder settings (if any)
  - Sample media kit in editor
  ```
  
  **Screenshots Saved:** `___________________________________`

- [ ] **4.3: Document Current Performance**
  ```
  Page Load Time:     _____________________ ms
  Database Queries:   _____________________ queries
  Memory Usage:       _____________________ MB
  Component Count:    17 components
  ```

---

### Part 5: Create Rollback Plan

- [ ] **5.1: Document Rollback Steps**

  **If Phase 2 fails, here's how to rollback:**
  
  ```
  STEP 1: Restore Database
  1. Go to phpMyAdmin
  2. Select database
  3. Click "Import" tab
  4. Choose backup SQL file
  5. Click "Go"
  6. Wait for completion
  
  STEP 2: Restore Files
  1. Delete current mk4 plugin folder
  2. Extract mk4-backup zip
  3. Copy extracted files to plugins directory
  4. Verify plugin activates
  
  STEP 3: Clear Caches
  1. Clear WordPress cache
  2. Clear browser cache
  3. Clear CDN cache (if applicable)
  
  STEP 4: Verify System
  1. Check site loads
  2. Check media kit builder works
  3. Check no errors in console
  4. Test saving a media kit
  ```

- [ ] **5.2: Identify Rollback Decision Criteria**
  
  **Roll back immediately if:**
  - [ ] Site shows fatal errors
  - [ ] Database queries fail
  - [ ] Media kits won't load
  - [ ] Data loss detected
  - [ ] Critical functionality broken
  
  **Consider rollback if:**
  - [ ] Performance worse than before
  - [ ] Some features not working
  - [ ] Error rate > 5%
  - [ ] User complaints increase

- [ ] **5.3: Assign Rollback Responsibility**
  ```
  Who can perform rollback:     _____________________
  Who to notify if rollback:    _____________________
  Escalation contact:           _____________________
  ```

---

### Part 6: Environment Checks

- [ ] **6.1: Staging Environment**
  ```
  - [ ] Staging site available
  - [ ] Staging mirrors production
  - [ ] Can test on staging first
  - [ ] Staging database separate from production
  ```
  
  **Staging URL:** `___________________________________`

- [ ] **6.2: Git Repository**
  ```
  - [ ] All changes committed
  - [ ] Repository backed up (GitHub/GitLab)
  - [ ] Clean working directory
  - [ ] No uncommitted changes
  ```
  
  **Git Status:** `___________________________________`

- [ ] **6.3: Local Development**
  ```
  - [ ] Node.js installed
  - [ ] npm packages installed
  - [ ] Build working (npm run build)
  - [ ] Tests passing (npm run test)
  ```
  
  **Development Status:** `___________________________________`

---

## 📋 Pre-Phase 2 Final Checklist

Before proceeding to Phase 2, verify all items checked:

### Critical (Must Have):
- [ ] Database backup created and verified
- [ ] Plugin files backed up
- [ ] Backups stored in safe location (not on same server)
- [ ] Rollback plan documented
- [ ] Someone available to perform rollback if needed

### Recommended (Should Have):
- [ ] Backup restoration tested on staging
- [ ] Current performance metrics documented
- [ ] Screenshots taken for reference
- [ ] Git repository up to date
- [ ] Staging environment available

### Nice to Have:
- [ ] Multiple backup copies in different locations
- [ ] Automated backup script created
- [ ] Team trained on rollback procedure
- [ ] Monitoring in place to detect issues

---

## 🚨 Emergency Contacts

**If something goes wrong during Phase 2:**

```
Primary Contact:    _____________________
Phone:             _____________________
Email:             _____________________

Backup Contact:     _____________________
Phone:             _____________________
Email:             _____________________

Hosting Support:    _____________________
Phone:             _____________________
```

---

## 📝 Backup Verification Signature

**I confirm that:**
- [ ] All backups have been created
- [ ] Backup files are accessible and not corrupted
- [ ] Rollback procedure is documented and understood
- [ ] Safe to proceed to Phase 2

**Name:** `___________________________________`  
**Date:** `___________________________________`  
**Signature:** `___________________________________`

---

## 🎯 Quick Backup Script (Optional)

For future convenience, here's a PowerShell script to automate backups:

```powershell
# File: scripts/create-backup.ps1

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$backupDir = "BACKUPS/backup-$timestamp"

Write-Host "Creating backup: $backupDir"

# Create backup directory
New-Item -ItemType Directory -Path $backupDir -Force

# Backup plugin files
Write-Host "Backing up plugin files..."
Compress-Archive -Path "." -DestinationPath "$backupDir/plugin-files.zip" -Force

# Backup package files
Copy-Item "package.json" -Destination "$backupDir/"
Copy-Item "package-lock.json" -Destination "$backupDir/"

# Create backup manifest
@"
Backup Created: $timestamp
Plugin Version: $(Get-Content package.json | ConvertFrom-Json).version
Node Version: $(node --version)
Files Included: plugin-files.zip
Status: Complete
"@ | Out-File "$backupDir/manifest.txt"

Write-Host "✅ Backup complete: $backupDir"
Write-Host "Remember to also backup your database!"
```

**Usage:** `powershell scripts/create-backup.ps1`

---

## ✅ Status

- [ ] **Not Started** - Backups not yet created
- [ ] **In Progress** - Currently creating backups
- [ ] **Complete** - All backups created and verified
- [ ] **Verified** - Backups tested and ready

**Current Status:** `___________________________________`

**Ready for Phase 2:** YES / NO

---

**Next Step After Completion:** Proceed to Phase 2 - Clean API Layer

---

*This checklist is part of the Media Kit Builder Vue Migration Plan v3.0 (Final)*
