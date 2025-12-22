# Database Backup Strategy

## Overview

Database backups are **critically important** for every application. This document defines backup strategies to prevent data loss, enable disaster recovery, and ensure business continuity.

**Core Principle**: Assume data WILL be lost. Plan for recovery, not prevention.

---

## The 3-2-1 Backup Rule

Every production database MUST follow the 3-2-1 rule:

- **3** copies of data (1 primary + 2 backups)
- **2** different storage media (e.g., cloud + local server)
- **1** offsite backup (different physical location)

**Example**:
1. **Primary**: Railway PostgreSQL database (production)
2. **Backup 1**: Railway automated daily backups (same cloud, different storage)
3. **Backup 2**: Self-hosted backups on your Linux server (offsite, different media)

---

## Quick Start for Startups (Minimum Viable Backup)

**Starting out? Focus on shipping products and generating revenue first.**

You only need **2 things** for production on Day 1:

### 1. Railway Automated Backups (Already Enabled)
- Railway includes automatic daily backups (free with all plans)
- 7-30 day retention depending on plan
- One-click restore from dashboard
- **Setup time**: 0 minutes (already on by default)
- **Cost**: $0-5/month

### 2. Pre-Migration Backups (10 minutes to set up)
- Always backup before running `prisma migrate`
- Prevents disasters from failed migrations
- **Setup**: Create one script (see below)
- **Cost**: $0

**That's it.** This covers 99% of disaster scenarios.

### When to Add Self-Hosted Backups

Add the Linux server offsite backups **later** when:
- You have paying customers and steady revenue
- You hit $5K-10K MRR and can afford the time
- You have a slow weekend and want to learn Linux server management

**Priority**: Ship products → Generate revenue → Then add redundancy

The documentation below covers the complete 3-2-1 strategy for when you're ready.

---

## Backup Types

### 1. Automated Daily Backups (Cloud Provider)

**Purpose**: Regular backups without manual intervention

**Railway** (if using Railway):
- Automatic daily backups (included in all plans)
- Retention: 7-30 days depending on plan
- Point-in-time recovery available
- One-click restore from dashboard

**Setup** (Railway):
1. Go to Railway Dashboard → Database
2. Click "Backups" tab
3. Backups are automatic (nothing to configure)
4. To restore: Click "Restore" on any backup

**AWS RDS** (if using AWS):
```bash
# Enable automated backups
aws rds modify-db-instance \
  --db-instance-identifier mydb \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00"
```

**Cost**: Usually included, or ~$0.10/GB/month

### 2. Pre-Migration Backups (Manual)

**Purpose**: Safety net before schema changes or upgrades

**CRITICAL**: **Always backup before migrations**

**Using Prisma**:
```bash
#!/bin/bash
# scripts/backup-before-migrate.sh

echo "Creating pre-migration backup..."

# Generate backup filename with timestamp
BACKUP_FILE="backups/pre-migration-$(date +%Y%m%d-%H%M%S).sql"

# Create backup (PostgreSQL)
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo "Backup created: ${BACKUP_FILE}.gz"
echo "Running migration..."

# Run migration
npx prisma migrate deploy

echo "Migration complete!"
```

**Add to package.json**:
```json
{
  "scripts": {
    "migrate:safe": "bash scripts/backup-before-migrate.sh"
  }
}
```

**Usage**:
```bash
npm run migrate:safe  # Always use this instead of direct migrate
```

### 3. Continuous Backups (Point-in-Time Recovery)

**Purpose**: Restore to ANY point in time (e.g., "5 minutes before the bug")

**PostgreSQL WAL (Write-Ahead Logging)**:

Enable continuous archiving:
```sql
-- postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /mnt/backups/wal/%f && cp %p /mnt/backups/wal/%f'
```

**Railway**: Point-in-time recovery available on Pro plan ($20/month)

**Benefit**: Recover to exact moment before data corruption/deletion

### 4. Self-Hosted Backups (Your Linux Server)

**Purpose**: Offsite backup on hardware you control (3-2-1 rule)

This is **excellent** for redundancy and gives you complete control.

#### Setup Linux Backup Server

**Hardware**: Old laptop with 512GB SSD + optional external drive

**Install Ubuntu Server**:
```bash
# 1. Download Ubuntu Server 24.04 LTS
# 2. Create bootable USB
# 3. Install Ubuntu Server on laptop
# 4. Set static IP (e.g., 192.168.1.100)
```

**Install PostgreSQL client tools**:
```bash
sudo apt update
sudo apt install postgresql-client-16
```

**Create backup directory**:
```bash
sudo mkdir -p /mnt/backups/postgresql
sudo chown $USER:$USER /mnt/backups/postgresql
```

**Optional - Mount external drive**:
```bash
# If using external drive for extra storage
sudo mkdir /mnt/external
sudo mount /dev/sdb1 /mnt/external  # Adjust device name
sudo chown $USER:$USER /mnt/external

# Auto-mount on boot
echo "/dev/sdb1 /mnt/external ext4 defaults 0 2" | sudo tee -a /etc/fstab
```

#### Automated Backup Script

**On your Linux server** (`/home/user/scripts/backup-database.sh`):

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/mnt/backups/postgresql"
DATABASE_URL="postgresql://user:password@production-host:5432/mydb"
RETENTION_DAYS=90  # Keep backups for 90 days
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.sql"

# Create backup
echo "$(date): Starting backup..."
pg_dump $DATABASE_URL > $BACKUP_FILE

# Check if backup succeeded
if [ $? -eq 0 ]; then
    echo "$(date): Backup created: $BACKUP_FILE"

    # Compress backup
    gzip $BACKUP_FILE
    echo "$(date): Backup compressed: ${BACKUP_FILE}.gz"

    # Calculate size
    SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo "$(date): Backup size: $SIZE"

    # Delete old backups (older than RETENTION_DAYS)
    find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "$(date): Old backups deleted (retention: $RETENTION_DAYS days)"

    # Log success
    echo "$(date): Backup completed successfully"
else
    echo "$(date): ERROR - Backup failed!"
    exit 1
fi
```

**Make executable**:
```bash
chmod +x /home/user/scripts/backup-database.sh
```

**Test it**:
```bash
./scripts/backup-database.sh
```

#### Schedule Automated Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add these lines:
# Daily backup at 2 AM
0 2 * * * /home/user/scripts/backup-database.sh >> /var/log/database-backup.log 2>&1

# Weekly backup on Sunday at 3 AM (extra retention)
0 3 * * 0 /home/user/scripts/backup-database.sh >> /var/log/database-backup.log 2>&1
```

**Verify cron is running**:
```bash
sudo systemctl status cron
```

#### Monitor Backup Health

**Check backup log**:
```bash
tail -f /var/log/database-backup.log
```

**Alert if backup fails** (send to your email):
```bash
#!/bin/bash
# In backup script, add after backup:

if [ $? -ne 0 ]; then
    echo "Database backup failed!" | mail -s "URGENT: Backup Failed" your-email@example.com
fi
```

**Better Stack integration** (optional):
```bash
# At end of backup script:
curl -X POST https://logs.betterstack.com/source/YOUR_SOURCE_TOKEN \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Database backup completed\", \"size\": \"$SIZE\", \"file\": \"$BACKUP_FILE\"}"
```

---

## Backup Before Migrations (CI/CD)

Automate pre-migration backups in your deployment pipeline:

**GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy with Backup

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 1. Backup database before migration
      - name: Backup Database
        run: |
          pg_dump ${{ secrets.DATABASE_URL }} > backup-pre-deploy-$(date +%Y%m%d-%H%M%S).sql
          gzip backup-pre-deploy-*.sql

      # 2. Upload backup to GitHub artifacts
      - name: Upload Backup
        uses: actions/upload-artifact@v4
        with:
          name: pre-deploy-backup
          path: backup-pre-deploy-*.sql.gz
          retention-days: 30

      # 3. Run migrations
      - name: Run Migrations
        run: npx prisma migrate deploy

      # 4. Deploy application
      - name: Deploy
        run: railway up
```

**Benefit**: Every deployment has a backup artifact you can download if needed.

---

## Backup Testing (Critical!)

**Backups are useless if you can't restore them.**

Test restores **quarterly** (every 3 months):

### Test Restore Procedure

```bash
#!/bin/bash
# scripts/test-restore.sh

echo "Testing backup restore..."

# 1. Create test database
createdb test_restore

# 2. Restore latest backup
LATEST_BACKUP=$(ls -t backups/*.sql.gz | head -1)
echo "Restoring from: $LATEST_BACKUP"

gunzip -c $LATEST_BACKUP | psql test_restore

# 3. Verify data
psql test_restore -c "SELECT COUNT(*) FROM users;"
psql test_restore -c "SELECT COUNT(*) FROM orders;"

# 4. Cleanup
dropdb test_restore

echo "Restore test completed successfully!"
```

**Schedule quarterly tests**:
```bash
# crontab - First day of every quarter at 4 AM
0 4 1 1,4,7,10 * /home/user/scripts/test-restore.sh >> /var/log/restore-test.log 2>&1
```

---

## Disaster Recovery Scenarios

### Scenario 1: Accidental Data Deletion

**User deleted critical data 30 minutes ago**

**Using Point-in-Time Recovery** (if enabled):
```bash
# Restore to 35 minutes ago (before deletion)
railway db restore --to "30 minutes ago"
```

**Using Daily Backup**:
```bash
# Restore yesterday's backup
gunzip -c backups/backup-20250120-020000.sql.gz | psql $DATABASE_URL
```

### Scenario 2: Failed Migration

**Migration corrupted database**

**Rollback using pre-migration backup**:
```bash
# 1. Download pre-migration backup from GitHub Actions artifacts
# 2. Restore it
gunzip -c backup-pre-deploy-20250121-140000.sql.gz | psql $DATABASE_URL

# 3. Verify
psql $DATABASE_URL -c "SELECT version FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 1;"
```

### Scenario 3: Complete Database Failure

**Railway database is down/corrupted**

**Restore from self-hosted backup**:
```bash
# 1. Create new Railway database
railway db create

# 2. Get new DATABASE_URL
railway db url

# 3. Restore latest backup
LATEST_BACKUP=$(ssh backup-server "ls -t /mnt/backups/postgresql/*.sql.gz | head -1")
ssh backup-server "cat $LATEST_BACKUP" | gunzip | psql $NEW_DATABASE_URL

# 4. Update application to use new DATABASE_URL
railway variables set DATABASE_URL=$NEW_DATABASE_URL

# 5. Redeploy
railway up
```

---

## Backup Retention Policy

**Recommended retention**:

| Backup Type | Frequency | Retention |
|-------------|-----------|-----------|
| Daily automated | Daily at 2 AM | 30 days |
| Weekly | Sunday at 3 AM | 90 days |
| Monthly | 1st of month | 1 year |
| Pre-migration | Before each deploy | 90 days |
| Self-hosted offsite | Daily | 90 days |

**Storage calculation**:
- Database size: 10GB
- Daily backup compressed: ~3GB
- 90 days: 270GB (fits on your 512GB SSD)
- With external drive: Can extend retention to 1 year+

---

## Security Considerations

### Encrypt Backups

**Encrypt before storing**:
```bash
# Backup and encrypt
pg_dump $DATABASE_URL | gzip | gpg --encrypt --recipient your-email@example.com > backup-encrypted.sql.gz.gpg

# Decrypt and restore
gpg --decrypt backup-encrypted.sql.gz.gpg | gunzip | psql $DATABASE_URL
```

### Secure Backup Server Access

**On Linux backup server**:
```bash
# 1. Use SSH keys (no passwords)
ssh-keygen -t ed25519 -C "backup-server"

# 2. Configure firewall
sudo ufw allow 22/tcp  # SSH only
sudo ufw enable

# 3. Disable password authentication
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd

# 4. Keep system updated
sudo apt update && sudo apt upgrade -y
```

### Backup Credentials

**Never commit backup credentials to git**

Store in environment variables:
```bash
# .env (never commit this)
DATABASE_URL=postgresql://user:password@host:5432/db
BACKUP_ENCRYPTION_KEY=your-gpg-key-id
```

---

## Monitoring Backups

### Better Stack Integration

Monitor backup health in Better Stack:

```bash
#!/bin/bash
# Enhanced backup script with monitoring

# ... (backup logic) ...

# Send metrics to Better Stack
curl -X POST https://logs.betterstack.com/source/YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d "{
    \"level\": \"info\",
    \"message\": \"Database backup completed\",
    \"backup_size_mb\": $(du -m $BACKUP_FILE.gz | cut -f1),
    \"backup_duration_seconds\": $SECONDS,
    \"retention_days\": $RETENTION_DAYS,
    \"total_backups\": $(ls -1 $BACKUP_DIR/*.sql.gz | wc -l)
  }"
```

### Alert on Backup Failures

**Better Stack Alert**:
- Condition: No "Database backup completed" log in last 26 hours
- Action: Send Slack message + email
- Severity: Critical

---

## Cost Analysis

### Cloud Backups

**Railway**:
- Included: 7 days retention (free)
- Extended: 30 days retention ($5/month)
- Point-in-time recovery: Pro plan ($20/month)

**AWS RDS**:
- Automated backups: ~$0.10/GB/month
- For 10GB database: $1/month

### Self-Hosted Backups

**Initial cost**:
- Old laptop: $0 (already have)
- 2TB external drive: $50 (one-time, optional)

**Ongoing cost**:
- Electricity: ~$5/month (laptop uses ~30W)
- Internet: $0 (already have)

**Total**: $5/month (electricity only)

**Benefits**:
- Complete control over data
- No vendor lock-in
- Can keep backups indefinitely
- Learning opportunity (Linux server management)

---

## Backup Checklist

Before production:

### Setup
- [ ] Railway/cloud automated daily backups enabled
- [ ] Backup retention set to 30+ days
- [ ] Pre-migration backup script created
- [ ] Self-hosted Linux backup server configured
- [ ] Automated backup cron jobs scheduled
- [ ] Backup monitoring configured (Better Stack)

### Testing
- [ ] Manual restore tested successfully
- [ ] Quarterly restore tests scheduled
- [ ] Disaster recovery runbook created
- [ ] Team knows how to restore from backup

### Security
- [ ] Backups encrypted (if storing sensitive data)
- [ ] Backup server secured (firewall, SSH keys)
- [ ] Backup credentials stored securely (not in git)

### Monitoring
- [ ] Backup success/failure alerts configured
- [ ] Backup size tracked over time
- [ ] Disk space alerts on backup server

---

## Quick Start Guide

**Minimal setup (5 minutes)**:
1. Verify Railway automated backups are enabled
2. Create pre-migration backup script
3. Test one manual restore

**Recommended setup (1-2 hours)**:
1. All minimal setup steps
2. Set up Linux backup server
3. Configure automated daily backups
4. Test restore from self-hosted backup
5. Set up Better Stack monitoring
6. Schedule quarterly restore tests

**Enterprise setup (4-8 hours)**:
1. All recommended setup steps
2. Enable point-in-time recovery
3. Implement backup encryption
4. Create comprehensive disaster recovery runbook
5. Train team on restore procedures

---

## Summary

**3-2-1 Backup Strategy**:
1. **Primary**: Production database (Railway)
2. **Backup 1**: Railway automated backups (30 days)
3. **Backup 2**: Self-hosted Linux server (90 days)

**Critical practices**:
- Always backup before migrations
- Test restores quarterly
- Monitor backup health
- Keep offsite backup (your Linux server)
- Encrypt sensitive backups

**Cost**: ~$5-10/month (self-hosted electricity + optional cloud extensions)

**See Also**:
- `docs/06-operations/disaster-recovery.md` - Complete disaster recovery procedures
- `docs/03-architecture/database-optimization.md` - Database performance
- `docs/06-operations/monitoring.md` - Monitoring backup health
- `docs/07-deployment/deployment.md` - Pre-deployment backup automation

---

## Related Documentation

**Operations Topics**:
- [Monitoring](./monitoring.md) - Application and infrastructure monitoring
- [Backups](./backups.md) - Backup and recovery strategies
- [Security Testing](./security-testing.md) - Automated security scans
- [Penetration Testing](./penetration-testing.md) - Manual security audits
- [Incident Response](./incident-response.md) - Handling security incidents
- [Incident Management](./incident-management.md) - General incident handling
- [Compliance](./compliance.md) - GDPR, SOC 2, ISO 27001
- [Disaster Recovery](./disaster-recovery.md) - Business continuity planning
- [Cost Optimization](./cost-optimization.md) - Reducing infrastructure costs

**Core Rules**:
- [Security & Privacy](../rules/security-privacy.md) - Security requirements
- [Testing](../rules/testing.md) - Testing strategies

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)

