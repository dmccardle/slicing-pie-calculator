# AI Development Workflow

## Overview

This document defines the AI-assisted development workflow for going from idea to production, integrating multiple AI tools for planning, design, and implementation.

---

## Core Principles

1. **AI-First Development** - Leverage AI at every stage of the development lifecycle
2. **Structured Handoffs** - Clear deliverables between each stage
3. **Human Review Gates** - Manual approval at critical decision points
4. **Iterate Fast** - Use AI to rapidly prototype and refine
5. **Maintain Quality** - AI accelerates but doesn't compromise standards

---

## Critical Implementation Requirements

**THESE MUST BE FOLLOWED IN EVERY FEATURE IMPLEMENTATION**

### Backend: Always Use API Versioning

**Rule**: All API endpoints MUST be versioned (`/api/v1/resource`).

**Why**: Allows updates without breaking existing clients, enables gradual migrations, protects production apps.

**Quick Examples**: `/api/v1/users` | `/api/users`

**Complete standards**: See `docs/rules/api-design.md#api-versioning` for versioning strategies, response formats, error handling, auth patterns, and OpenAPI docs.

### Frontend: Always Use Responsive Design

**Rule**: All UIs MUST be responsive (mobile < 640px, tablet 640-1024px, desktop > 1024px).

**Why**: Mobile-first is industry standard, better UX, wider market reach.

**Quick Example**: `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` | `grid-cols-4`

**Complete standards**: See `docs/rules/ui-standards.md#responsive-design` for responsive patterns, 44px touch targets, Tailwind/React Native examples, navigation, grids, tables, forms, and testing requirements.

---

## The Workflow

```
IDEA
  ↓
ROADMAP PLANNING (Speckit)
  ↓
FEATURE PLANNING (Speckit)
  ↓
UI DESIGN (Figma + AI)
  ↓
HUMAN REVIEW: Approve Designs
  ↓
UI-TO-CODE (v0 by Vercel or Figma Plugins)
  ↓
IMPLEMENTATION (Claude Code + Opus 4.1)
  ↓
HUMAN REVIEW: Approve Merge
  ↓
DEPLOY
```

---

## Stage 1: Roadmap Planning with Speckit

**Tool**: [Speckit](https://speckit.org/)

**Purpose**: Define the complete product vision and prioritized roadmap

### 1A. Product Roadmap

Create a comprehensive roadmap of all major features:

**What to Define**:
1. **Product Vision**
   - What problem are we solving?
   - Who are the users?
   - What's the value proposition?

2. **Major Features List**
   - List ALL features for the complete product
   - Group by theme/category
   - Include both MVP and future features

3. **MVP Definition**
   - Which features are absolutely essential for launch?
   - What's the minimum viable product?
   - What can be deferred to post-MVP?

4. **Implementation Order**
   - Best sequence to build features
   - Dependencies between features
   - Risk mitigation (build risky features early)
   - User value delivery (quick wins first)

**Example Roadmap Structure**:
```
Product: TaskMaster Pro SaaS

MVP (Must Have):
1. User Authentication (Auth0)
2. Organization/Tenant Management
3. Basic Task Management (CRUD)
4. User Roles & Permissions
5. Basic Dashboard

Post-MVP Phase 1:
6. Advanced Task Features (tags, filters, search)
7. Team Collaboration
8. File Attachments
9. Email Notifications

Post-MVP Phase 2:
10. Advanced Reporting
11. API Access
12. Integrations (Slack, etc.)
13. Custom Domains
```

**Prioritization Framework**:
- **P0 (MVP)**: Blocks product launch
- **P1 (High)**: Needed for market competitiveness
- **P2 (Medium)**: Nice to have, adds value
- **P3 (Low)**: Future consideration

### Deliverables from Roadmap Planning

- [ ] **Product Roadmap Document**
  - Complete feature list
  - MVP clearly defined
  - Features prioritized (P0/P1/P2/P3)
  - Implementation order with rationale
  - Dependencies mapped

---

## Stage 2: Feature Planning with Speckit

**For each feature in the roadmap, create detailed specifications**

### What to Create in Speckit

1. **Product Requirements Document (PRD)**
   - User stories
   - Acceptance criteria
   - Success metrics
   - Technical constraints

2. **Implementation Plan**
   - Ordered list of subtasks
   - Dependencies between tasks
   - Technical requirements per task
   - API endpoints needed
   - Database schema changes
   - Integration points

3. **Technical Specifications**
   - Data models
   - API contracts
   - Authentication/authorization requirements
   - Performance requirements
   - Security considerations

4. **Figma Design Prompts**
   - Generate prompts for UI design
   - Include specific requirements
   - Reference existing design patterns
   - Specify components needed

### Deliverables from Feature Planning

Export/prepare these artifacts to hand off:

- [ ] **Feature Specification Document** (Markdown or PDF)
  - User stories with acceptance criteria
  - Technical requirements
  - Edge cases and error handling
  - Performance requirements

- [ ] **Implementation Checklist**
  - Subtasks in priority order
  - Dependencies clearly marked
  - Estimated complexity (S/M/L)

- [ ] **Technical Details**
  - Database schema changes (if any)
  - API endpoint specifications
  - Third-party integrations needed
  - Authentication/authorization rules

- [ ] **Figma Design Prompts**
  - Structured prompts for AI-powered UI generation
  - Screen-by-screen requirements
  - Component specifications
  - Design constraints

**Example Figma Prompt from Speckit**:
```
Feature: Task Dashboard

Screens Needed:
1. Task List View
2. Task Detail View
3. Create Task Modal
4. Filter Panel

Prompt for Task List View:
"Create a task list dashboard for a SaaS task management app.

Requirements:
- Modern, clean design following Tailwind CSS conventions
- Table layout with columns: Task Name, Assignee, Due Date, Status, Priority
- Status badges (To Do, In Progress, Done)
- Priority indicators (High=red, Medium=yellow, Low=green)
- Filters: Status, Assignee, Priority, Date Range
- Search bar at top
- "Create Task" button (primary action)
- Empty state when no tasks

**CRITICAL - Responsive Design:**
- Mobile (< 640px): Card layout, stacked, simplified columns
- Tablet (640-1024px): Condensed table, 4-5 columns
- Desktop (> 1024px): Full table, all columns visible
- Touch targets ≥ 44x44px on mobile
- Design all 3 breakpoints in Figma

Accessibility: WCAG 2.2 Level AA
Component library: shadcn/ui compatible
Colors: Primary blue (#3B82F6), neutral grays"
```

---

## Stage 3: UI Design with Figma + AI

**Tools**:
- Figma (Professional plan)
- Figma AI plugins for UI generation
- v0 by Vercel (for Figma-to-Next.js)

### Process

#### 3A. Generate UI Mockups with AI

**Recommended Plugins for UI Generation**:
- **Builder.io's Visual Copilot** - AI-powered design generation
- **Genius** - Figma AI assistant
- **Magician** - AI-powered design tools
- **Automator** - AI design automation

**Process**:
1. Create new Figma file for the feature
2. Use prompts from Speckit as starting point
3. Use AI plugin to generate initial designs
4. Iterate and refine designs
5. Ensure designs follow:
   - Project design system (if exists)
   - Accessibility guidelines (WCAG 2.2 AA)
   - Responsive breakpoints (mobile, tablet, desktop)
6. Create variants for all states (hover, active, disabled, loading, error)
7. Add annotations for interactions and animations

**Design Checklist**:
- [ ] All screens designed
- [ ] All component states shown (hover, active, disabled, loading, error)
- [ ] **CRITICAL: Responsive breakpoints designed** (mobile < 640px, tablet 640-1024px, desktop > 1024px)
- [ ] **Mobile layout tested** - stacked/card layout works
- [ ] **Tablet layout tested** - condensed layout works
- [ ] **Desktop layout tested** - full layout works
- [ ] Accessibility considerations noted
- [ ] Color contrast checked (4.5:1 minimum)
- [ ] Touch targets 44x44px minimum (mobile)
- [ ] Loading states designed
- [ ] Error states designed
- [ ] Empty states designed

#### 3B. HUMAN REVIEW: Approve Designs

**STOP: Review Required Before Proceeding**

Before converting designs to code:
1. Review all Figma screens
2. Check against acceptance criteria from Speckit
3. Verify accessibility compliance
4. Test prototype (if created)
5. Make any necessary adjustments
6. **Approve designs** before proceeding to code conversion

**Approval Checklist**:
- [ ] Designs match requirements from Speckit
- [ ] All user flows are complete
- [ ] Designs are accessible (WCAG 2.2 AA)
- [ ] **Responsive breakpoints work** (verified mobile, tablet, desktop)
- [ ] Mobile layout looks good (< 640px)
- [ ] Tablet layout looks good (640-1024px)
- [ ] Desktop layout looks good (> 1024px)
- [ ] Team/stakeholders have reviewed
- [ ] Ready to convert to code

#### 3C. Convert Figma to Code

**Recommended Plugin (Priority: Reliability + Accuracy)**:

**Best Option: v0 by Vercel** ⭐
- **Official Tool**: https://v0.dev
- **Figma Integration**: Yes, via copy-paste or import
- **Output**: Next.js + Tailwind CSS + shadcn/ui
- **Reliability**: ⭐⭐⭐⭐(Built by Vercel)
- **Accuracy**: ⭐⭐⭐⭐(AI-powered, iterative refinement)
- **Cost**: $20/month (Pro plan)
- **Best for**: Next.js web apps with Tailwind

**Process with v0**:
1. Copy Figma design (or screenshot)
2. Paste into v0.dev
3. Refine with prompts
4. Export as Next.js component with TypeScript + Tailwind
5. Components are shadcn/ui compatible

**Alternative Plugins (if v0 doesn't work for specific case)**:

For **Next.js Web Apps**:
1. **Anima** - Figma to React/Next.js
   - Reliability: ⭐⭐⭐⭐
   - Accuracy: ⭐⭐⭐⭐
   - Cost: $31/month (Pro)
2. **Locofy** - Figma to React/Next.js
   - Reliability: ⭐⭐⭐
   - Accuracy: ⭐⭐⭐
   - Cost: Free tier available

For **Expo/React Native Mobile Apps**:
1. **Anima** - Figma to React Native
   - Reliability: ⭐⭐⭐⭐
   - Accuracy: ⭐⭐⭐
   - Cost: $31/month (Pro)
2. **DhiWise** - Figma to React Native
   - Reliability: ⭐⭐⭐
   - Accuracy: ⭐⭐⭐
   - Cost: Free tier available

**Recommended Approach**:
- **Web (Next.js)**: Use v0 by Vercel (most reliable + accurate)
- **Mobile (Expo)**: Use Anima (most mature for React Native)

**Export Format**:
- TypeScript React components
- Tailwind CSS (for web) or StyleSheet (for mobile)
- shadcn/ui compatible components (web)
- Proper TypeScript types
- Placeholder props and functions

### Deliverables from Figma

Prepare these artifacts to hand off to Claude Code:

- [ ] **Figma File Link** (with view access)
  - Organized by feature/screen
  - Properly named layers
  - Component variants defined
  - Approved by stakeholders

- [ ] **Exported Code Components** (from v0 or plugin)
  - TypeScript React components
  - Tailwind CSS classes (web) or StyleSheet (mobile)
  - Placeholder props and types
  - Component documentation

- [ ] **Design Specifications**
  - Colors, typography, spacing values
  - Component states (hover, active, disabled)
  - Responsive breakpoints
  - Animations/transitions

- [ ] **Asset Exports**
  - Icons (SVG)
  - Images (optimized WebP/AVIF)
  - Illustrations

---

## Stage 4: Implementation with Claude Code

**Tool**: Claude Code CLI + Opus 4.1

**Agent Type**: Opus 4.1 for complex implementation

### Handoff Package to Claude Code

Create a handoff document that includes all context:

```markdown
# Feature Implementation: [Feature Name]

## 1. Specification (from Speckit)

### User Stories
[Paste from Speckit]

### Acceptance Criteria
[Paste from Speckit]

### Technical Requirements
[Paste from Speckit]

## 2. UI Design (from Figma)

### Figma File
[Link to Figma file with view access]

### Component Code (Starting Point from v0/Plugin)
[Paste or attach exported component code]

### Design Specs
- Colors: [list with hex codes]
- Typography: [list with font sizes, weights]
- Spacing: [list with spacing scale]
- Breakpoints: [mobile, tablet, desktop widths]

## 3. Implementation Requirements

### Files to Create/Modify
[List from Speckit implementation plan]

### API Endpoints
[Specifications from Speckit]

### Database Changes
[Schema changes from Speckit]

### Integration Points
[Third-party services, existing APIs]

## 4. Critical Implementation Requirements

**MUST BE FOLLOWED:**

### Backend (See `docs/rules/api-design.md#api-versioning`)
- [ ] **API Versioning**: All endpoints MUST use /api/v1/ prefix
- [ ] Use NestJS @Controller('api/v1/resource') format
- [ ] Follow standard response format (success, data, error, meta)
- [ ] Document all endpoints with OpenAPI/Swagger

### Frontend (See `docs/rules/ui-standards.md#responsive-design`)
- [ ] **Responsive Design**: MUST work on mobile, tablet, desktop
- [ ] Test at breakpoints: < 640px, 768px, 1024px+
- [ ] Use Tailwind responsive classes (sm:, md:, lg:, xl:) for web
- [ ] Use Dimensions API for React Native
- [ ] Ensure touch targets ≥ 44x44px on mobile

## 5. Acceptance Criteria
- [ ] All user stories implemented
- [ ] UI matches approved Figma designs
- [ ] **UI is fully responsive** (mobile, tablet, desktop)
- [ ] **All API endpoints are versioned** (/api/v1/...)
- [ ] All tests pass (unit + integration)
- [ ] Accessibility: WCAG 2.2 AA compliant
- [ ] Code follows all project standards
- [ ] Documentation updated
```

### How to Work with Claude Code

**Step 1: Provide Complete Context**

In your first message to Claude Code, include:
```
I have a new feature to implement. I'm providing:

1. Technical specification (from Speckit)
2. UI mockups and starting component code (from Figma/v0)
3. Project context (already in your docs via CLAUDE.md)

Please review everything and create an implementation plan.

[Attach or paste handoff document]
```

**Step 2: Review Implementation Plan**

Claude Code will:
1. Read all project documentation (CLAUDE.md)
2. Analyze the handoff package
3. Explore the codebase using Explore agent
4. Create a detailed implementation plan
5. Present plan for approval

**Step 3: Approve and Execute**

After reviewing the plan:
- Ask questions or request changes
- Approve the plan
- Claude Code implements the feature
- Uses Opus 4.1 for complex coding

**Step 4: Iterate**

Claude Code will:
- Implement feature incrementally
- Write tests as it goes
- Update documentation
- Request feedback at checkpoints
- Use v0/Figma-generated code as starting point, then refine
- Ensure all code follows project standards

### Claude Code Best Practices

**CRITICAL REQUIREMENTS** (Must Do Every Time):
- **API Versioning**: ALL backend endpoints MUST use /api/v1/ prefix (see `docs/rules/api-design.md#api-versioning`)
- **Responsive Design**: ALL UIs MUST work on mobile, tablet, and desktop (see `docs/rules/ui-standards.md#responsive-design`)
- Test responsive breakpoints: < 640px, 768px, 1024px+
- Use Tailwind responsive classes (sm:, md:, lg:, xl:) for web
- Use Dimensions API for React Native responsive layouts

**DO**:
- Use Opus 4.1 for complex implementations
- Use Explore agent to understand codebase first
- Use Plan agent for multi-file features
- Request code review after major sections
- Run tests frequently
- Commit incrementally with conventional commits
- Use the v0/Figma-generated code as starting point, then refine
- Ensure final code follows all project rules
- Build/compile before running linter

**DON'T**:
- Skip the planning phase for complex features
- Implement without understanding existing patterns
- Use Haiku for complex business logic
- Make large changes without checkpoints
- Deploy without running full test suite
- Trust v0/Figma code blindly - always refine and integrate properly
- Create unversioned API endpoints
- Create fixed-width layouts that don't adapt to screen size

---

## Stage 5: Code Review & Merge

### 5A. Automated Checks

**Order of Operations** (IMPORTANT):

1. **Build/Compile Check** ← Run FIRST
   ```bash
   npm run build
   ```
   - Ensures TypeScript compiles
   - Catches type errors
   - Verifies imports resolve
   - No point running linter if code doesn't compile

2. **Linter**
   ```bash
   npm run lint
   ```
   - Zero errors, zero warnings policy
   - Code style enforcement

3. **Type Checking**
   ```bash
   npx tsc --noEmit
   ```
   - TypeScript strict mode checks

4. **Tests**
   ```bash
   npm run test
   npm run test:integration
   ```
   - All tests must pass
   - Coverage threshold met (80%+)

5. **Formatting**
   ```bash
   npm run format:check
   ```
   - Prettier consistency check

**GitHub Actions CI** (runs automatically on PR):
```yaml
# .github/workflows/ci.yml
jobs:
  checks:
    steps:
      - name: Build
        run: npm run build

      - name: Lint
        run: npm run lint

      - name: Type Check
        run: npx tsc --noEmit

      - name: Test
        run: npm run test -- --coverage

      - name: Format Check
        run: npm run format:check
```

### 5B. AI Code Review

**Recommended GitHub App**: [Codium PR-Agent](https://github.com/apps/pr-agent)

**Why Codium PR-Agent**:
- Free for open source
- $19/month for private repos (Pro plan)
- Automatic PR review comments
- Suggests improvements
- Finds bugs and security issues
- Code quality analysis
- Very reliable and accurate

**Alternative Options**:
- **CodeRabbit** - AI code reviewer ($12/month)
- **Sweep AI** - AI PR review + fixes ($40/month)
- **GitHub Copilot** - Has PR review features (if you have it)

**Setup**:
1. Install Codium PR-Agent GitHub app
2. Configure in repository settings
3. Automatically reviews every PR
4. Provides inline comments and suggestions

**What AI Review Checks**:
- [ ] Code quality and best practices
- [ ] Potential bugs
- [ ] Security vulnerabilities
- [ ] Performance issues
- [ ] Test coverage gaps
- [ ] Documentation completeness
- [ ] Adherence to project patterns

### 5C. HUMAN REVIEW: Manual Approval Required

**STOP: Manual Review and Approval Required**

Before merging feature branch to `dev`:

1. **Review AI Comments**
   - Address all issues raised by Codium PR-Agent
   - Respond to or resolve all comments

2. **Manual Code Review**
   - Read through the code changes
   - Verify logic is correct
   - Check edge cases are handled
   - Ensure follows project standards

3. **Functional Testing**
   - Test the feature manually
   - Verify against acceptance criteria
   - Test responsive design (if UI)
   - Test accessibility (keyboard nav, screen reader)

4. **Approve in GitHub**
   - All checks must be green 
   - AI review comments addressed
   - Manual testing complete
   - Click "Approve" button in GitHub PR

5. **Merge**
   - **Manual button press required** (YOU must click merge)
   - Use "Squash and Merge" for feature branches
   - Delete branch after merge

**Merge Checklist**:
- [ ] Build passes 
- [ ] Linter passes (0 errors, 0 warnings) 
- [ ] Type checking passes 
- [ ] All tests pass 
- [ ] Format check passes 
- [ ] AI code review completed 
- [ ] AI issues addressed 
- [ ] Manual code review done 
- [ ] Functional testing done 
- [ ] Acceptance criteria met 
- [ ] Documentation updated 
- [ ] Ready to merge 

**GitHub Branch Protection Settings**:
```
dev branch:
- Require pull request before merging: YES
- Require status checks to pass: YES
  - build
  - lint
  - test
  - type-check
  - format-check
- Require approval from code owners: YES
- Require review from Code Owners: YES
- Dismiss stale pull request approvals: YES
- Require linear history: NO (allows squash merge)
```

---

## Stage 6: Deploy

After merging to `dev`:

1. **DEV Deployment** (automatic)
   - Railway/Vercel auto-deploys `dev` branch
   - Smoke test in DEV environment

2. **Promote to SIT** (when ready)
   - See `docs/rules/environments.md`
   - Run integration tests

3. **Promote to UAT** (after SIT passes)
   - Run E2E tests
   - Stakeholder review

4. **Promote to PROD** (after UAT approval)
   - Follow production deployment checklist
   - Monitor closely after deploy

---

## Workflow Summary

| Stage | Tool | Input | Output | Review Gate | Time |
|-------|------|-------|--------|-------------|------|
| **Roadmap** | Speckit | Product idea | Feature list, MVP, priorities | - | 2-3 days |
| **Planning** | Speckit | Feature concept | Specs, Figma prompts | - | 4-8 hours |
| **Design** | Figma + AI | Specs + prompts | UI mockups | - | 2-4 hours |
| **Design Review** | Human | Figma mockups | Approved designs | **YOU APPROVE** | 1 hour |
| **UI-to-Code** | v0/Plugins | Approved designs | Component code | - | 30 min |
| **Implementation** | Claude Code (Opus 4.1) | Specs + UI + context | Working feature + tests | - | 2-8 hours |
| **Code Review** | AI + Human | PR with changes | Approved PR | **YOU APPROVE** | 1-2 hours |
| **Merge** | Manual | Approved PR | Merged to dev | **YOU CLICK MERGE** | 1 min |
| **Deploy** | Automatic | Merged code | Deployed to DEV | - | 5-10 min |

**Total**: 3-5 days from idea to DEV (depending on complexity)

---

## Example: Full Workflow

### Feature: User Profile Dashboard

#### 1. Roadmap Planning (Speckit)
```
Product: TaskMaster Pro

MVP Features (P0):
1. User Authentication ← COMPLETED
2. Organization Management ← COMPLETED
3. User Profile Dashboard ← NEXT (Current Feature)
4. Task CRUD
5. Basic Permissions

Post-MVP (P1):
6. Advanced Dashboard
7. Team Collaboration
...
```

#### 2. Feature Planning (Speckit)
```
Feature: User Profile Dashboard

User Story:
As a user, I want to view my profile statistics
so that I can track my usage and activity.

Acceptance Criteria:
- Display user's name, email, avatar
- Show usage statistics (last 30 days)
- Show plan information
- Link to settings page

Technical Requirements:
- New API endpoint: GET /api/users/:id/stats
- Database: Add 'stats' table
- Authentication: Require valid session
- Response time: < 500ms

Figma Prompt:
"Create a user profile dashboard for TaskMaster Pro SaaS.

Components:
- Profile header (avatar, name, email, edit button)
- 4 stats cards: Tasks Completed, Active Projects, Team Members, Storage Used
- Plan card: Current plan name, upgrade button
- Quick actions: Settings link, Help center link

Design: Clean, modern, Tailwind CSS
Colors: Primary blue (#3B82F6), grays
Layout: Grid, responsive (stacks on mobile)
Accessibility: WCAG 2.2 AA
shadcn/ui compatible"
```

#### 3. Design (Figma)

1. Use Speckit's prompt in Figma AI plugin
2. Generate dashboard mockup
3. Refine design, add states
4. **REVIEW & APPROVE** designs
5. Copy design to v0.dev
6. v0 generates Next.js component with Tailwind
7. Export component code

#### 4. Implementation (Claude Code)

```
Feature: User Profile Dashboard

[Attach Speckit spec]
[Attach Figma link]
[Attach v0-generated component code]

Please implement this feature following our SaaS architecture
with multi-tenancy, feature flags, and all project standards.
```

Claude Code:
1. Reviews specs, designs, and code
2. Creates implementation plan
3. Gets approval
4. Implements:
   - Database migration for stats table
   - API endpoint with auth + multi-tenancy
   - Frontend component (refines v0 code)
   - Unit and integration tests
   - API documentation
   - Updates changelog
5. Runs build → lint → tests
6. Creates PR

#### 5. Review & Merge

1. GitHub CI runs (build → lint → type-check → test → format)
2. Codium PR-Agent reviews code, adds comments
3. Claude Code addresses AI feedback
4. **YOU REVIEW** the PR:
   - Read code changes
   - Review AI comments
   - Test feature manually
   - Check accessibility
5. **YOU APPROVE** in GitHub
6. **YOU CLICK MERGE** button

#### 6. Deploy

- Auto-deploys to DEV
- Test in DEV environment
- Promote to SIT → UAT → PROD
- Feature live!

---

## Tips for Success

### Roadmap Planning (Speckit)
- Think big, build small (full vision, MVP focus)
- Prioritize ruthlessly
- Consider dependencies between features
- Build riskiest features early to de-risk

### Feature Planning (Speckit)
- Be as detailed as possible upfront
- Include edge cases and error scenarios
- Write clear Figma prompts
- Define acceptance criteria measurably

### Design (Figma)
- Start with low-fidelity wireframes
- Use AI to generate variations quickly
- Design all states (loading, error, empty, success)
- Test with real content, not lorem ipsum
- **Always get approval before converting to code**

### Implementation (Claude Code)
- Provide complete context in first message
- Review plans before approving execution
- Use v0/Figma code as starting point, not final solution
- Test incrementally
- Ask questions when requirements are unclear

### Code Review
- Let AI find the obvious issues first
- Focus your review on logic and edge cases
- Test the feature yourself
- Don't rush - quality over speed

### General
- Iterate quickly with AI
- Document decisions and rationale
- Keep stakeholders updated
- Celebrate wins!

---

## Common Pitfalls to Avoid

**Skipping Roadmap Planning**
- Don't plan features in isolation
- See the big picture first

**Vague Specifications**
- AI needs clear requirements
- Include edge cases and error handling

**Not Reviewing Designs**
- Don't convert to code before approval
- Cheaper to change designs than code

**Using v0/Figma Code Without Refinement**
- Generated code is a starting point
- Always refine for project standards and patterns

**Skipping Code Review**
- Don't merge without review
- AI code review + human review = quality

**Auto-merging PRs**
- Always require manual approval
- You own the code quality

---

## Tool Configuration & Costs

### Required Subscriptions

| Tool | Plan | Cost/Month | Purpose |
|------|------|------------|---------|
| **Speckit** | TBD | Check speckit.org | Planning & specs |
| **Figma** | Professional | $12/user | UI design |
| **v0 by Vercel** | Pro | $20 | Figma to Next.js |
| **Anima** (optional) | Pro | $31 | Figma to React Native |
| **Claude Code** | Pro | $20 | Implementation (Opus 4.1) |
| **Codium PR-Agent** | Pro | $19 | AI code review |
| **GitHub** | Team | $4/user | Code hosting + CI/CD |

**Total Monthly Cost**: ~$106/user (for full stack)

### Recommended Setup

1. **Speckit Workspace**
   - One workspace per product
   - Templates for PRDs and roadmaps
   - Templates for Figma prompts
   - Integration with GitHub (if available)

2. **Figma Organization**
   - Design system library
   - Component library
   - Templates for common screens
   - AI plugins installed

3. **v0 by Vercel**
   - Pro account
   - Save frequently used components
   - Create component library

4. **GitHub Repository**
   - Branch protection rules configured
   - CI/CD workflows set up
   - Codium PR-Agent installed
   - Required checks configured

5. **Claude Code**
   - CLAUDE.md in project root
   - All documentation in docs/
   - Git hooks configured (Husky)
   - .cursorrules or similar for consistency

---

## Measuring Success

Track these metrics:

### Speed
- **Roadmap to MVP**: Target < 6 weeks
- **Idea to spec**: Target < 2 days
- **Spec to design**: Target < 1 day
- **Design to code**: Target < 1 day
- **Code to production**: Target < 3 days

### Quality
- **Linter errors**: 0 (enforced)
- **Test coverage**: > 80%
- **Design accuracy**: > 95% match to approved Figma
- **Bug rate**: Decreasing trend
- **AI review pass rate**: > 80% on first submit

### Satisfaction
- **Developer happiness**: Survey quarterly
- **Stakeholder satisfaction**: Feedback on each release
- **User satisfaction**: NPS or similar

---

## Continuous Improvement

### Weekly
- Review any blockers in the workflow
- Adjust templates if needed

### Monthly
- Review metrics
- Update tool configurations
- Refine prompts based on learnings

### Quarterly
- Full workflow retrospective
- Update this document
- Evaluate new tools
- Review costs vs value

**Questions to Ask**:
- What worked well?
- What bottlenecks did we hit?
- Are specs detailed enough?
- Is Figma-to-code accurate?
- Is AI code review catching issues?
- Are we shipping fast enough?

---

## Resources

### Tools
- [Speckit](https://speckit.org/)
- [Figma](https://www.figma.com/)
- [v0 by Vercel](https://v0.dev/)
- [Anima](https://www.animaapp.com/)
- [Claude Code](https://github.com/anthropics/claude-code)
- [Codium PR-Agent](https://github.com/Codium-ai/pr-agent)

### Documentation
- [Speckit Docs](https://speckit.org/) (when available)
- [Figma Plugin Directory](https://www.figma.com/community/plugins)
- [v0 Documentation](https://v0.dev/docs)
- [Claude Code Docs](https://github.com/anthropics/claude-code)

---

## Next Steps

See `docs/10-ai-workflow/setup.md` for step-by-step instructions to set up this entire workflow from scratch.

---

## Related Documentation

**SaaS Essentials**:
- [SaaS Architecture](./saas-architecture.md) - Multi-tenancy, feature flags
- [Subscription Billing](./subscription-billing.md) - Stripe integration, plans
- [User Management & RBAC](./user-management-rbac.md) - Roles, permissions
- [User Onboarding](./user-onboarding.md) - Wizards, tutorials, checklists
- [Internationalization](./internationalization.md) - i18n, l10n
- [AI Development Workflow](./ai-development-workflow.md) - AI-assisted development

**Core Rules**:
- [API Design](../rules/api-design.md) - Multi-tenant API patterns
- [Security & Privacy](../rules/security-privacy.md) - Data isolation, GDPR

**Practical Resources**:
- [API Endpoint Template](../templates/api-endpoint-template.ts) - Multi-tenant API boilerplate
- [Database Migration Template](../templates/database-migration-template.sql) - RLS setup

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All SaaS Docs](./)

