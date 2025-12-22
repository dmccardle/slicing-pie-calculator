# Infrastructure as Code (IaC)

## Overview

Infrastructure as Code (IaC) defines infrastructure (servers, databases, networks) using code files instead of manual configuration. This document explains when and how to use IaC.

**Rule**: Configuration should be in version control, not in someone's head.

---

## What is Infrastructure as Code?

**Without IaC** (manual configuration):
```
1. Log into Railway dashboard
2. Click "New Service"
3. Manually configure environment variables
4. Click "Deploy"
5. Repeat for staging, production, dev environments
6. Hope you remembered all the settings
```

**With IaC** (automated configuration):
```yaml
# railway.toml
[environments.production]
services:
  api:
    source: ./app
    build:
      command: "npm run build"
    start:
      command: "npm start"
    env:
      NODE_ENV: "production"
      DATABASE_URL: "${{ DATABASE_URL }}"

[environments.staging]
# Same config, different values
```

**Benefits**:
- **Reproducible**: Rebuild infrastructure from code
- **Version controlled**: Track changes, rollback if needed
- **Documented**: Configuration is self-documenting
- **Consistent**: Dev, staging, prod are identical

---

## When to Use Infrastructure as Code

### Use IaC when:

1. **You have multiple environments** (dev, staging, production)
   - Manually syncing configs is error-prone
   - IaC ensures consistency

2. **You have complex infrastructure**
   - Multiple services (API, workers, cron jobs)
   - Multiple databases (Postgres, Redis)
   - Custom networking (VPCs, load balancers)

3. **You need disaster recovery**
   - Can rebuild infrastructure from scratch
   - Backup is your IaC files (+ database backups)

4. **You have a team**
   - Multiple engineers deploying
   - IaC prevents "it works on my machine"

### Don't use IaC when:

- You're pre-launch with 1 service (overkill)
- You're doing rapid prototyping (IaC slows you down)
- You have < 3 environments (manual is fine)

**Typical timeline**:
- Pre-launch: Skip IaC (move fast)
- 0-1K users: Use Railway dashboard (simple)
- 1K-10K users: Add IaC (growing complexity)
- 10K+ users: IaC required (too complex to manage manually)

---

## Infrastructure as Code for Railway

**Railway supports IaC via**:
1. `railway.toml` (Railway-specific)
2. `railway.json` (Railway-specific)
3. GitHub Actions + Railway CLI (custom workflows)

### Option 1: railway.toml (Recommended)

**Create `railway.toml` in project root**:

```toml
# railway.toml

[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/v1/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "api"
source = "./app"

[services.env]
NODE_ENV = "production"
PORT = "${{ PORT }}"
DATABASE_URL = "${{ DATABASE_URL }}"

[[services.cron]]
schedule = "0 2 * * *"  # Daily at 2 AM
command = "npm run cleanup"

[[services]]
name = "worker"
source = "./worker"

[services.env]
NODE_ENV = "production"
REDIS_URL = "${{ REDIS_URL }}"
```

**Deploy**:

```bash
git add railway.toml
git commit -m "feat: add infrastructure as code"
git push origin main

# Railway automatically detects railway.toml and applies config
```

**Benefits**:
- Configuration in version control
- Same config across all environments
- Changes tracked in git history

### Option 2: railway.json (Alternative)

**Create `railway.json`**:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/v1/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Same benefits as `railway.toml`, just JSON instead of TOML.**

---

## Environment-Specific Configuration

**Problem**: Dev, staging, and production need different configs

**Solution**: Use Railway environments + variables

### Railway Environments

```bash
# Create environments
railway environment create staging
railway environment create production

# Deploy to specific environment
railway up --environment staging
railway up --environment production
```

### Environment Variables

**Store secrets in Railway (not in IaC files)**:

```bash
# Set environment variables via CLI
railway variables set DATABASE_URL=postgresql://... --environment production
railway variables set STRIPE_SECRET_KEY=sk_live_... --environment production

railway variables set DATABASE_URL=postgresql://... --environment staging
railway variables set STRIPE_SECRET_KEY=sk_test_... --environment staging
```

**Reference variables in `railway.toml`**:

```toml
[services.env]
NODE_ENV = "production"
DATABASE_URL = "${{ DATABASE_URL }}"  # References Railway variable
STRIPE_SECRET_KEY = "${{ STRIPE_SECRET_KEY }}"
```

**Never commit secrets to git**:

```toml
# BAD (secrets in IaC file)
[services.env]
DATABASE_URL = "postgresql://user:password@host/db"

# GOOD (secrets in Railway variables, referenced in IaC)
[services.env]
DATABASE_URL = "${{ DATABASE_URL }}"
```

---

## Infrastructure as Code for Other Platforms

### Terraform (Platform-Agnostic)

**Terraform** = Industry-standard IaC tool (works with AWS, GCP, Azure, Railway, etc.)

**When to use**:
- You need multi-cloud (Railway + AWS + GCP)
- You have complex infrastructure (VPCs, load balancers, etc.)
- You're at enterprise scale

**Example `main.tf`**:

```hcl
# main.tf
terraform {
  required_providers {
    railway = {
      source = "terraform-community-providers/railway"
    }
  }
}

provider "railway" {
  token = var.railway_api_token
}

resource "railway_project" "main" {
  name = "my-saas-app"
}

resource "railway_service" "api" {
  project_id = railway_project.main.id
  name = "api"
  source = {
    repo = "github.com/your-org/your-app"
    branch = "main"
  }
}

resource "railway_service" "database" {
  project_id = railway_project.main.id
  name = "postgres"
  source = {
    image = "postgres:16"
  }
}
```

**Deploy**:

```bash
terraform init
terraform plan  # Preview changes
terraform apply  # Apply changes
```

**Cost**: Free (Terraform is open source)
**Complexity**: High (steep learning curve)
**Recommendation**: Only use if you need multi-cloud or have dedicated DevOps team

### Pulumi (Code-First IaC)

**Pulumi** = IaC using real programming languages (TypeScript, Python, Go)

**Example `index.ts`**:

```typescript
// index.ts
import * as railway from "@pulumi/railway";

const project = new railway.Project("my-saas-app", {
  name: "my-saas-app",
});

const database = new railway.Service("postgres", {
  projectId: project.id,
  source: { image: "postgres:16" },
});

const api = new railway.Service("api", {
  projectId: project.id,
  source: {
    repo: "github.com/your-org/your-app",
    branch: "main",
  },
  env: {
    DATABASE_URL: database.connectionString,
  },
});

export const apiUrl = api.url;
```

**Deploy**:

```bash
pulumi up
```

**Cost**: Free for individuals, $75+/month for teams
**Complexity**: Medium
**Recommendation**: Use if you prefer code over config files

---

## GitOps: Automated Deployments

**GitOps** = Infrastructure changes via git commits (no manual deployments)

### How It Works

```
1. Developer commits to main branch
2. GitHub Action triggers
3. Railway detects change (railway.toml changed)
4. Railway applies infrastructure changes
5. Railway deploys new code
```

**Example GitHub Action**:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy to Railway
        run: railway up --environment production
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

**Benefits**:
- Automated deployments (no manual "Deploy" button)
- All changes tracked in git
- Can rollback by reverting commit

**Setup**:

```bash
# 1. Generate Railway API token
# Railway dashboard → Settings → Tokens → Create Token

# 2. Add to GitHub secrets
# GitHub → Settings → Secrets → New secret
# Name: RAILWAY_TOKEN
# Value: [your token]

# 3. Push workflow file
git add .github/workflows/deploy.yml
git commit -m "feat: add automated deployments"
git push origin main

# Future deployments: Just push to main
git push origin main  # Automatically deploys
```

---

## Database Migrations as Code

**Problem**: Database schema changes need to be versioned too

**Solution**: Use Prisma migrations (tracked in git)

### Prisma Migrations Workflow

```bash
# 1. Make schema change
# prisma/schema.prisma
model User {
  id    String @id
  email String @unique
  name  String  # ← New field
}

# 2. Create migration
npx prisma migrate dev --name add-user-name

# Creates: prisma/migrations/20250120_add_user_name/migration.sql

# 3. Commit migration
git add prisma/migrations
git add prisma/schema.prisma
git commit -m "feat: add user name field"

# 4. Push (triggers deploy, migration runs automatically)
git push origin main
```

**Railway runs migrations automatically on deploy**:

```json
// package.json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start"
  }
}
```

**Benefits**:
- Database schema in version control
- Can rollback schema changes (revert commit)
- Safe migrations (Prisma prevents data loss)

**See `docs/05-backend/database-migrations.md` for full guide**

---

## Infrastructure as Code Checklist

Before production:

### Configuration
- [ ] Infrastructure defined in code (railway.toml or terraform)
- [ ] Configuration files in version control (git)
- [ ] Secrets in Railway variables (not in code)
- [ ] Environment-specific configs (dev, staging, production)

### Automation
- [ ] Deployments automated (GitHub Actions + Railway)
- [ ] Database migrations automated (Prisma)
- [ ] Health checks configured
- [ ] Restart policies defined

### Documentation
- [ ] README explains how to deploy
- [ ] Environment variables documented
- [ ] Disaster recovery procedure (rebuild from IaC)

### Testing
- [ ] IaC tested in staging before production
- [ ] Rollback procedure tested
- [ ] Disaster recovery drill completed

---

## Disaster Recovery with IaC

**Scenario**: Entire Railway project deleted

**Recovery**:

```bash
# 1. Create new Railway project
railway login
railway init

# 2. Create services from IaC
railway up  # Reads railway.toml, creates services

# 3. Restore database
# See docs/06-operations/disaster-recovery.md

# 4. Set environment variables
railway variables set DATABASE_URL=...
railway variables set STRIPE_SECRET_KEY=...

# 5. Deploy
git push origin main

# Total time: 1-2 hours (vs days of manual recreation)
```

**IaC = Infrastructure Backup**

---

## Common Patterns

### Pattern 1: Monorepo (Multiple Services)

```
my-app/
├── apps/
│   ├── api/          # Next.js API
│   ├── web/          # Next.js frontend
│   └── worker/       # Background jobs
├── packages/
│   └── shared/       # Shared code
└── railway.toml      # Defines all services
```

**railway.toml**:

```toml
[[services]]
name = "api"
source = "./apps/api"

[services.env]
NODE_ENV = "production"

[[services]]
name = "web"
source = "./apps/web"

[[services]]
name = "worker"
source = "./apps/worker"
```

### Pattern 2: Cron Jobs

```toml
[[services]]
name = "api"
source = "./app"

[[services.cron]]
# Daily database backup
schedule = "0 2 * * *"  # 2 AM daily
command = "npm run backup"

[[services.cron]]
# Hourly cleanup
schedule = "0 * * * *"  # Top of every hour
command = "npm run cleanup"
```

### Pattern 3: Feature Flags in IaC

```toml
[services.env]
FEATURE_NEW_DASHBOARD = "true"
FEATURE_AI_CHAT = "false"
```

**Deploy feature to staging first**:

```bash
# Enable feature in staging
railway variables set FEATURE_AI_CHAT=true --environment staging
railway deploy --environment staging

# Test in staging
# If OK, enable in production
railway variables set FEATURE_AI_CHAT=true --environment production
railway deploy --environment production
```

---

## Summary

**Infrastructure as Code** = Configuration in version control

**Benefits**:
- Reproducible (rebuild from code)
- Version controlled (track changes, rollback)
- Documented (self-documenting)
- Consistent (dev = staging = production)

**When to use**:
- You have multiple environments
- You have complex infrastructure
- You need disaster recovery
- You have a team

**Railway IaC**:
- Use `railway.toml` (simple, Railway-specific)
- Store secrets in Railway variables (not in code)
- Automate deployments (GitHub Actions)

**Advanced**:
- Use Terraform (multi-cloud, complex infrastructure)
- Use Pulumi (code-first IaC)

**Cost**: $0 (Railway IaC is free)

**See Also**:
- `docs/07-deployment/railway.md` - Railway deployment guide
- `docs/05-backend/database-migrations.md` - Database schema as code
- `docs/06-operations/disaster-recovery.md` - Rebuild infrastructure from IaC
- `docs/rules/deployment.md` - Deployment best practices

---

## Related Documentation

**Deployment Topics**:
- [Infrastructure as Code](./infrastructure-as-code.md) - IaC with Terraform/Pulumi

**Core Rules**:
- [Deployment](../rules/deployment.md) - CI/CD pipelines, automated releases
- [Environments](../rules/environments.md) - Dev, staging, production
- [Git Workflow](../rules/git-workflow.md) - Git-flow branching

**Operations**:
- [Monitoring](../06-operations/monitoring.md) - Post-deployment monitoring
- [Disaster Recovery](../06-operations/disaster-recovery.md) - Recovery procedures

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)

