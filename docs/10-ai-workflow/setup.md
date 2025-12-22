# AI Workflow Setup Guide

## Overview

This guide provides step-by-step instructions to set up the complete AI development workflow for SaaS product development.

**Time Required**: 2-3 hours

**Prerequisites**:
- GitHub account
- Credit card for tool subscriptions
- Basic familiarity with command line

---

## Setup Checklist

- [ ] Speckit account and workspace setup
- [ ] Figma account and plugins installed
- [ ] v0 by Vercel account configured
- [ ] Anima account (for mobile)
- [ ] Claude Code Pro subscription
- [ ] GitHub repository configured
- [ ] Codium PR-Agent installed
- [ ] CI/CD workflow configured
- [ ] Test the complete workflow

---

## Step 1: Spec-Kit (Specify) Setup

> **Full Reference**: See [spec-kit-reference.md](./spec-kit-reference.md) for complete documentation

Spec-Kit is GitHub's open-source toolkit for spec-driven development. It provides slash commands that work with Claude Code and other AI agents.

### 1.1 Prerequisites

```bash
# Install uv (Python package manager)
brew install uv

# Or via curl
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 1.2 Install Spec-Kit

```bash
# Install the CLI
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Verify installation
specify check
```

### 1.3 Initialize a Project

```bash
# Create new project with spec-kit
specify init my-project --ai claude

# Or initialize in existing directory
cd existing-project
specify init . --ai claude --force
```

### 1.4 Spec-Kit Workflow

Run these slash commands in Claude Code in order:

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `/speckit.constitution` | Define project principles |
| 2 | `/speckit.specify` | Create feature specification |
| 3 | `/speckit.plan` | Generate implementation plan |
| 4 | `/speckit.tasks` | Break down into tasks |
| 5 | `/speckit.implement` | Execute implementation |

**Optional commands**:
- `/speckit.clarify` - Resolve ambiguities in spec
- `/speckit.analyze` - Validate consistency across artifacts
- `/speckit.checklist` - Generate quality checklists

### 1.5 Example Workflow

```bash
# In terminal
cd my-project
claude

# In Claude Code
/speckit.constitution Create principles for code quality, testing, responsive design

/speckit.specify Build user authentication with login, signup, password reset

/speckit.plan Use Next.js 15, TypeScript, Tailwind CSS, NextAuth.js

/speckit.tasks

/speckit.implement
```

### 1.6 Project Structure After Init

```
my-project/
├── .claude/commands/     # Slash command definitions
├── .specify/
│   ├── memory/           # Constitution and context
│   ├── templates/        # Document templates
│   └── scripts/          # Helper scripts
├── specs/                # Feature specifications
│   └── 001-feature/
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md
│       └── checklists/
└── CLAUDE.md            # AI agent context
```

---

## Step 2: Figma Setup

### 2.1 Create Account

1. Go to https://www.figma.com/
2. Sign up or log in
3. Subscribe to **Professional plan** ($12/month per user)
   - Click your profile → "Upgrade"
   - Select "Professional"
   - Enter payment details

### 2.2 Install AI Plugins

1. Click "Resources" → "Plugins" → "Browse all plugins"

2. Install these plugins (click "Install" for each):
   - **Builder.io's Visual Copilot** - AI design generation
   - **Genius** - AI assistant
   - **Magician** - AI design tools
   - **Automator** - Design automation

3. To use plugins:
   - Right-click on canvas → "Plugins" → [Plugin name]

### 2.3 Create Design System (Optional but Recommended)

1. Create a new file: "Design System"
2. Set up:
   - Color palette (primary, secondary, neutrals)
   - Typography scale
   - Spacing scale (4px, 8px, 12px, 16px, etc.)
   - Common components (buttons, inputs, cards)
3. Publish as library:
   - Click file name → "Publish styles and components"

### 2.4 Create Project Templates

Create template files for:
- **Web App Screens** (desktop + mobile)
- **Mobile App Screens** (iOS + Android)
- **Component Library**

---

## Step 3: v0 by Vercel Setup (for Next.js)

### 3.1 Create Account

1. Go to https://v0.dev/
2. Click "Sign in with GitHub"
3. Authorize v0

### 3.2 Subscribe to Pro Plan

1. Click profile/avatar → "Upgrade to Pro"
2. Select **Pro plan** ($20/month)
3. Enter payment details
4. Confirm subscription

### 3.3 Test the Workflow

1. Take a screenshot of a Figma design (or use test design)
2. Go to v0.dev
3. Click "New Chat"
4. Paste screenshot or describe UI
5. Review generated Next.js component
6. Iterate with prompts to refine
7. Copy code when satisfied

**Example Prompt**:
```
Create a user profile dashboard with:
- Profile header (avatar, name, email)
- 4 stats cards showing metrics
- Use Tailwind CSS
- Make it responsive
- shadcn/ui compatible
```

---

## Step 4: Anima Setup (for React Native/Mobile)

### 4.1 Create Account

1. Go to https://www.animaapp.com/
2. Sign up with email or GitHub
3. Subscribe to **Pro plan** ($31/month)
   - Click "Pricing" → "Pro" → "Get Started"
   - Enter payment details

### 4.2 Install Figma Plugin

1. In Figma: Resources → Plugins → Search "Anima"
2. Click "Install"

### 4.3 Connect Figma to Anima

1. In Figma, run plugin: Right-click → Plugins → Anima
2. Sign in to Anima account
3. Select frames to export
4. Choose "React Native"
5. Configure export settings:
   - TypeScript: ON
   - Responsive: ON
6. Click "Export Code"
7. Download generated components

### 4.4 Test Export

1. Create simple screen in Figma
2. Export with Anima
3. Review generated React Native code
4. Ensure it's TypeScript
5. Verify component structure

---

## Step 5: Claude Code Setup

### 5.1 Install Claude Code

1. Open terminal
2. Install Claude Code CLI:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

3. Verify installation:
   ```bash
   claude --version
   ```

### 5.2 Subscribe to Pro Plan

1. Run Claude Code:
   ```bash
   claude
   ```

2. When prompted, sign in
3. Upgrade to Pro plan ($20/month):
   - Gives access to Opus 4.1 model
   - Higher usage limits

### 5.3 Configure Project

1. Navigate to your project:
   ```bash
   cd /path/to/your/project
   ```

2. Copy documentation template (this repo):
   ```bash
   cp -r /path/to/claude-code-docs-template/CLAUDE.md .
   cp -r /path/to/claude-code-docs-template/docs .
   ```

3. Customize CLAUDE.md:
   - Replace all `[PLACEHOLDER]` values
   - Update tech stack
   - Update team information
   - Update repository URL

4. Customize docs/rules/:
   - Remove rules you don't need
   - Modify rules to fit your project
   - Add project-specific rules to docs/project-rules/

### 5.4 Test Claude Code

1. Start Claude Code in your project:
   ```bash
   claude
   ```

2. Ask: "Please read CLAUDE.md and confirm you understand the project"
3. Claude should list all the documentation it read
4. Test with a simple task: "Create a simple hello world component"

---

## Step 6: GitHub Repository Setup

### 6.1 Create Repository (if not exists)

1. Go to https://github.com/
2. Click "New repository"
3. Name it, set to private
4. Initialize with README
5. Clone locally:
   ```bash
   git clone [repository-url]
   cd [repository-name]
   ```

### 6.2 Install Codium PR-Agent

1. Go to https://github.com/apps/pr-agent
2. Click "Install"
3. Select your repository
4. Authorize the app
5. Subscribe to **Pro plan** ($19/month for private repos)
   - Free for open source!

### 6.3 Configure PR-Agent

1. Create `.pr_agent.toml` in repo root:
   ```toml
   [pr_reviewer]
   auto_review = true
   inline_code_comments = true

   [pr_code_suggestions]
   auto_improve = true

   [config]
   model = "gpt-4-turbo"
   ```

2. Commit and push:
   ```bash
   git add .pr_agent.toml
   git commit -m "chore: configure PR-Agent"
   git push
   ```

### 6.4 Set Up Branch Protection

1. Go to repository on GitHub
2. Settings → Branches → Add branch protection rule

**For `dev` branch**:
```
Branch name pattern: dev

Protection rules:
Require a pull request before merging
  Require approvals: 1
  Dismiss stale pull request approvals when new commits are pushed
  Require review from Code Owners

Require status checks to pass before merging
  Require branches to be up to date before merging
  Required checks:
    - build
    - lint
    - test
    - type-check
    - format-check

Require conversation resolution before merging

Require linear history (allow squash merging)

Do not allow bypassing the above settings
```

Repeat for `sit`, `uat`, `prod`, `main` branches with stricter rules.

---

## Step 7: CI/CD Setup

### 7.1 Create GitHub Actions Workflow

1. Create directory:
   ```bash
   mkdir -p .github/workflows
   ```

2. Create `.github/workflows/ci.yml`:
   ```yaml
   name: CI

   on:
     pull_request:
       branches: [dev, sit, uat, prod, main]
     push:
       branches: [dev, sit, uat, prod, main]

   env:
     NODE_VERSION: '20'

   jobs:
     build:
       name: Build
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         - run: npm ci
         - run: npm run build

     lint:
       name: Lint
       runs-on: ubuntu-latest
       needs: build
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         - run: npm ci
         - run: npm run lint

     type-check:
       name: Type Check
       runs-on: ubuntu-latest
       needs: build
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         - run: npm ci
         - run: npx tsc --noEmit

     test:
       name: Test
       runs-on: ubuntu-latest
       needs: build
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         - run: npm ci
         - run: npm run test -- --coverage
         - uses: codecov/codecov-action@v3

     format-check:
       name: Format Check
       runs-on: ubuntu-latest
       needs: build
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: ${{ env.NODE_VERSION }}
             cache: 'npm'
         - run: npm ci
         - run: npm run format:check
   ```

3. Commit and push:
   ```bash
   git add .github/workflows/ci.yml
   git commit -m "ci: add GitHub Actions workflow"
   git push
   ```

### 7.2 Verify CI Works

1. Create a test branch:
   ```bash
   git checkout -b test-ci
   ```

2. Make a small change
3. Push and create PR
4. Verify all checks run
5. Verify Codium PR-Agent comments on the PR
6. Close/delete the test PR

---

## Step 8: Deploy to Railway (or Vercel)

### 8.1 Railway Setup (for Full-Stack Apps)

1. Go to https://railway.app/
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Configure:
   - Name: `[project-name]-dev`
   - Branch: `dev`
6. Add environment variables (in Railway dashboard)
7. Deploy!

Repeat for `sit`, `uat`, `prod` environments with respective branches.

### 8.2 Vercel Setup (for Next.js only)

1. Go to https://vercel.com/
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (or your app directory)
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add environment variables
7. Deploy!

Set up multiple deployments for different branches (dev, sit, uat, prod).

---

## Step 9: Test the Complete Workflow

### End-to-End Test

Let's test the entire workflow with a simple feature.

#### 9.1 Planning (Speckit)

1. Create a new spec in Speckit:
   ```
   Feature: Simple "Hello World" Page

   User Story:
   As a user, I want to see a welcome message
   so that I know the app is working.

   Acceptance Criteria:
   - Page displays "Hello, World!"
   - Page has a button
   - Button shows current time when clicked

   Technical Requirements:
   - New Next.js page: /hello
   - Use shadcn/ui Button component
   - Responsive design

   Figma Prompt:
   "Create a simple centered page with:
   - Large heading: 'Hello, World!'
   - Subheading: 'Welcome to [Your App]'
   - Primary button: 'Show Time'
   - Clean, modern design with Tailwind CSS
   - shadcn/ui compatible"
   ```

#### 9.2 Design (Figma)

1. Create new Figma file: "Hello World Feature"
2. Use AI plugin with the prompt from Speckit
3. Generate design
4. Review and refine
5. **Approve the design** 

#### 9.3 Convert to Code (v0)

1. Go to v0.dev
2. Paste the Figma prompt (or screenshot)
3. Get Next.js component code
4. Copy the code

#### 9.4 Implementation (Claude Code)

1. Start Claude Code:
   ```bash
   cd /path/to/your/project
   claude
   ```

2. Provide context:
   ```
   I need to implement a simple "Hello World" feature.

   Specification:
   [Paste Speckit spec]

   Starting component code from v0:
   [Paste v0 code]

   Please implement this following all project standards.
   ```

3. Review Claude's plan
4. Approve and let it implement
5. Claude will create PR

#### 9.5 Review & Merge

1. Go to GitHub → Pull Requests
2. Review the PR
3. Check that CI passes (all green )
4. Review Codium PR-Agent comments
5. Test locally:
   ```bash
   git fetch origin
   git checkout [pr-branch-name]
   npm install
   npm run dev
   ```
6. Test the feature in browser
7. Approve PR in GitHub 
8. Click "Squash and merge" 

#### 9.6 Deploy

1. Verify auto-deployment to DEV
2. Test on DEV URL
3. Celebrate! 

If all of this works, your workflow is fully set up! 

---

## Troubleshooting

### Speckit Issues
- **Problem**: Can't find a feature
- **Solution**: Use search or organize with tags/folders

### Figma Issues
- **Problem**: AI plugin not generating good designs
- **Solution**: Refine prompts, be more specific, provide examples

### v0 Issues
- **Problem**: Generated code doesn't match design
- **Solution**: Use more detailed prompts, iterate, provide screenshots

### Anima Issues
- **Problem**: Exported code has wrong styles
- **Solution**: Ensure layers are properly named in Figma, check export settings

### Claude Code Issues
- **Problem**: Claude can't find documentation
- **Solution**: Ensure CLAUDE.md is in project root, check file paths

### CI/CD Issues
- **Problem**: Build fails in CI but works locally
- **Solution**: Check Node version matches, clear cache, check env variables

### PR-Agent Issues
- **Problem**: Not commenting on PRs
- **Solution**: Check GitHub App permissions, verify .pr_agent.toml config

---

## Monthly Costs Summary

| Tool | Cost/Month | Required? |
|------|-----------|-----------|
| Speckit | TBD | Yes |
| Figma Professional | $12 | Yes |
| v0 by Vercel Pro | $20 | Yes (for web) |
| Anima Pro | $31 | Yes (for mobile) |
| Claude Code Pro | $20 | Yes |
| Codium PR-Agent | $19 | Yes |
| GitHub Team | $4/user | Yes |
| **Total** | **~$106/user** | - |

Additional platform costs (choose one):
- Railway: ~$20-100/month depending on usage
- Vercel Pro: $20/month per user

**Total Setup Cost**: ~$126-206/month per developer

---

## Next Steps

1. **Complete this setup** (follow checklist at top)
2. **Test with a real feature** (not just hello world)
3. **Train team members** on the workflow
4. **Create templates** in each tool for consistency
5. **Iterate and improve** based on what you learn

---

## Getting Help

- **Speckit**: support@speckit.org (or check their docs)
- **Figma**: https://help.figma.com/
- **v0**: https://v0.dev/docs
- **Anima**: https://www.animaapp.com/support
- **Claude Code**: https://github.com/anthropics/claude-code/issues
- **Codium**: https://github.com/Codium-ai/pr-agent

---

## Success Checklist

You'll know the workflow is working when:

- You can go from idea to spec in Speckit in < 1 day
- You can generate UI designs in Figma in < 2 hours
- You can convert designs to code in < 30 minutes
- Claude Code can implement features with minimal guidance
- AI code review catches issues automatically
- CI/CD deploys without manual intervention
- You're shipping features faster than before
- Code quality remains high (0 lint errors, good test coverage)
- You feel productive and not blocked by tools

If any of these aren't true, revisit the relevant setup section or ask for help.

---

## Appendix: Tool Alternatives

If certain tools don't work for you:

### Instead of Speckit
- Linear + Linear Docs
- Notion + Notion AI
- Productboard
- Aha!

### Instead of v0
- Anima (works for web too)
- Locofy
- Builder.io
- Hand-code from Figma

### Instead of Codium PR-Agent
- CodeRabbit
- Sweep AI
- GitHub Copilot (if available)
- Manual code review only

The workflow principles remain the same even if you swap tools.

---

## Related Documentation

**AI Workflow**:
- [AI Development Workflow](../09-saas-specific/ai-development-workflow.md) - Speckit → Figma → Claude Code

**SaaS Patterns**:
- [SaaS Architecture](../09-saas-specific/saas-architecture.md) - Multi-tenancy
- [User Onboarding](../09-saas-specific/user-onboarding.md) - Onboarding patterns

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)

