# Spec-Kit (Specify) Reference

> **Source**: [github.com/github/spec-kit](https://github.com/github/spec-kit)

Spec-Kit is an open-source toolkit for "spec-driven development" where specifications become executable blueprints that directly generate working implementations.

---

## Installation

### Prerequisites

- Linux/macOS/Windows
- Python 3.11+
- [uv](https://docs.astral.sh/uv/) package manager
- Git
- Supported AI coding agent (Claude Code, Copilot, Cursor, etc.)

### Install uv (if not installed)

```bash
# macOS
brew install uv

# Or via curl
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Install Spec-Kit

```bash
# Persistent installation (recommended)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Upgrade to latest
uv tool install specify-cli --force --from git+https://github.com/github/spec-kit.git
```

### Verify Installation

```bash
specify check
```

---

## CLI Commands

| Command | Purpose |
|---------|---------|
| `specify init <project-name>` | Initialize new project with spec-kit |
| `specify init .` | Initialize in current directory |
| `specify check` | Verify installed tools |

### Init Options

```bash
specify init my-project \
  --ai claude \           # AI agent (claude, gemini, copilot, cursor-agent, etc.)
  --script sh \           # Script type (sh or ps for PowerShell)
  --force \               # Skip confirmation for non-empty directories
  --no-git \              # Skip git initialization
  --debug                 # Enable detailed output
```

**Supported AI Agents**: claude, gemini, copilot, cursor-agent, qwen, opencode, windsurf, qoder, roo, codebuddy, amp, shai, bob, kilocode, auggie, codex

---

## Slash Commands (Workflow)

Run these commands in your AI agent (Claude Code, Cursor, etc.) in order:

### 1. `/speckit.constitution`

**Purpose**: Establish project principles and guidelines

**When to use**: First command when starting a new project

**Example**:
```
/speckit.constitution Create principles for:
- Code quality and testing standards
- UX consistency requirements
- Performance targets
- Security requirements
```

**Output**: `.specify/memory/constitution.md`

---

### 2. `/speckit.specify`

**Purpose**: Define requirements and user stories for a feature

**When to use**: Starting a new feature

**Example**:
```
/speckit.specify Build a photo organization app with:
- Albums grouped by date
- Drag-and-drop reordering
- Search functionality
- Export to PDF
```

**Output**: `specs/###-feature-name/spec.md`

---

### 3. `/speckit.clarify` (Optional)

**Purpose**: Resolve underspecified areas in the spec

**When to use**: Before `/speckit.plan` if spec has ambiguities

**Example**:
```
/speckit.clarify
```

---

### 4. `/speckit.plan`

**Purpose**: Create technical implementation strategy

**When to use**: After spec is complete

**Example**:
```
/speckit.plan Use Next.js 15, TypeScript, Tailwind CSS, localStorage for persistence
```

**Output**:
- `specs/###-feature-name/plan.md`
- `specs/###-feature-name/research.md`
- `specs/###-feature-name/data-model.md`
- `specs/###-feature-name/quickstart.md`

---

### 5. `/speckit.tasks`

**Purpose**: Generate actionable task breakdown

**When to use**: After plan is approved

**Example**:
```
/speckit.tasks
```

**Output**: `specs/###-feature-name/tasks.md`

---

### 6. `/speckit.analyze` (Optional)

**Purpose**: Cross-artifact consistency and coverage validation

**When to use**: Before implementation to verify all artifacts align

**Example**:
```
/speckit.analyze
```

---

### 7. `/speckit.checklist` (Optional)

**Purpose**: Generate quality checklists

**When to use**: Before implementation to define quality gates

**Example**:
```
/speckit.checklist Generate UX checklist for mobile responsiveness
```

**Output**: `specs/###-feature-name/checklists/*.md`

---

### 8. `/speckit.implement`

**Purpose**: Execute all tasks to build the feature

**When to use**: After tasks are defined and approved

**Example**:
```
/speckit.implement
```

---

## Complete Workflow Example

```bash
# 1. Initialize project
cd /path/to/projects
specify init my-app --ai claude
cd my-app

# 2. Start Claude Code
claude

# 3. In Claude Code, run commands in order:
```

```
/speckit.constitution Create principles for a local-first web app:
- All data stored in localStorage
- Responsive design (mobile, tablet, desktop)
- TypeScript strict mode
- No external API dependencies
```

```
/speckit.specify Build a task management app with:
- Add/edit/delete tasks
- Mark tasks complete
- Filter by status
- Export to JSON
```

```
/speckit.plan Use Next.js 15, TypeScript, Tailwind CSS, localStorage
```

```
/speckit.tasks
```

```
/speckit.implement
```

---

## Project Structure (After Init)

```
my-project/
├── .claude/
│   └── commands/           # Slash command definitions
│       ├── speckit.constitution.md
│       ├── speckit.specify.md
│       ├── speckit.plan.md
│       ├── speckit.tasks.md
│       ├── speckit.implement.md
│       ├── speckit.clarify.md
│       ├── speckit.analyze.md
│       └── speckit.checklist.md
├── .specify/
│   ├── memory/
│   │   └── constitution.md  # Project principles
│   ├── templates/           # Document templates
│   │   ├── spec-template.md
│   │   ├── plan-template.md
│   │   ├── tasks-template.md
│   │   └── checklist-template.md
│   └── scripts/
│       └── bash/            # Helper scripts
├── specs/                   # Feature specifications
│   └── 001-feature-name/
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md
│       └── checklists/
├── src/                     # Source code (created during implement)
├── CLAUDE.md               # AI agent context file
└── package.json
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `SPECIFY_FEATURE` | Override feature detection for non-Git repos (e.g., `001-photo-albums`) |

---

## Best Practices

### 1. One Feature Per Branch

Each feature gets its own branch and spec directory:
```
001-user-auth/
002-dashboard/
003-settings/
```

### 2. Complete Each Phase Before Moving On

Don't skip steps. The workflow is designed to be sequential:
1. Constitution sets guardrails
2. Spec defines WHAT to build
3. Plan defines HOW to build
4. Tasks break it into actionable items
5. Implement executes the tasks

### 3. Review Outputs Before Proceeding

After each command, review the generated files:
- Does the spec capture all requirements?
- Does the plan use the right technologies?
- Are the tasks granular enough?

### 4. Use Checklists for Quality Gates

Generate checklists before implementation:
```
/speckit.checklist Generate checklist for:
- Responsive design requirements
- Accessibility (WCAG 2.2 AA)
- Performance targets
```

### 5. Iterate on Specs

If the plan reveals gaps in the spec, go back:
```
/speckit.specify [updated requirements]
```

---

## Troubleshooting

### "specify: command not found"

```bash
# Reinstall
uv tool install specify-cli --force --from git+https://github.com/github/spec-kit.git

# Verify
which specify
```

### "No feature branch detected"

```bash
# Set environment variable
export SPECIFY_FEATURE=001-my-feature

# Or create a git branch
git checkout -b 001-my-feature
```

### Slash commands not working

1. Verify `.claude/commands/` directory exists
2. Check command files are present
3. Restart Claude Code session

---

## Spec-Driven Development Philosophy

Spec-Kit implements **Specification-Driven Development (SDD)**, where specifications become executable blueprints that directly generate working implementations.

### Three Pillars

1. **Specification as Executable Artifact**: Specs must be precise enough to generate working code
2. **Research-Informed Context**: AI researches technical options before implementation
3. **Bidirectional Feedback**: Production learnings feed back into spec refinement

### Constitutional Principles

The methodology enforces these core principles:

| Article | Principle | Meaning |
|---------|-----------|---------|
| I | Library-First | Features start as standalone, reusable libraries |
| III | Test-First | No implementation without approved, failing tests |
| VII | Simplicity | Maximum 3 projects for initial implementation |
| VIII | Anti-Abstraction | Use framework features directly, don't over-wrap |
| IX | Integration-First Testing | Prefer real databases over mocks |

---

## Supported AI Agents (17 Total)

| Agent | Directory | Type |
|-------|-----------|------|
| Claude Code | `.claude/commands/` | CLI |
| Gemini CLI | `.gemini/commands/` | CLI |
| GitHub Copilot | `.github/agents/` | IDE |
| Cursor | `.cursor/commands/` | CLI |
| Windsurf | `.windsurf/workflows/` | IDE |
| Qwen Code | `.qwen/commands/` | CLI |
| opencode | `.opencode/command/` | CLI |
| Codex CLI | `.codex/commands/` | CLI |
| Kilo Code | `.kilocode/rules/` | IDE |
| Auggie CLI | `.augment/rules/` | CLI |
| Roo Code | `.roo/rules/` | IDE |
| CodeBuddy CLI | `.codebuddy/commands/` | CLI |
| Qoder CLI | `.qoder/commands/` | CLI |
| Amazon Q | `.amazonq/prompts/` | CLI |
| Amp | `.agents/commands/` | CLI |
| SHAI | `.shai/commands/` | CLI |
| IBM Bob | `.bob/commands/` | IDE |

---

## Related Documentation

- [GitHub Spec-Kit Repository](https://github.com/github/spec-kit)
- [Spec-Driven Development Methodology](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- [Agent Configuration](https://github.com/github/spec-kit/blob/main/AGENTS.md)
- [Video Overview](https://www.youtube.com/watch?v=a9eR1xsfvHg)

---

## Integration with Project Templates

When using spec-kit with project templates:

### Option 1: Start with Spec-Kit, Add Docs

```bash
# Initialize spec-kit first
specify init my-project --ai claude
cd my-project

# Copy template documentation
cp -r /path/to/claude-code-docs-template/docs ./docs

# Merge CLAUDE.md (keep spec-kit structure, add template references)
```

### Option 2: Start with Template, Add Spec-Kit

```bash
# Clone template
cp -r /path/to/claude-code-docs-template my-project
cd my-project

# Initialize spec-kit (force to merge with existing files)
specify init . --ai claude --force
```

### Constitution Integration

Update constitution to reference template rules:

```
/speckit.constitution Add principles from docs/rules/:
- UI must be responsive (docs/rules/ui-standards.md)
- Follow git workflow (docs/rules/git-workflow.md)
- Use conventional commits (docs/rules/git-commits.md)
- TypeScript strict mode (docs/rules/code-standards.md)
- WCAG 2.2 AA accessibility (docs/rules/accessibility.md)
```

### CLAUDE.md Structure

Combine spec-kit and template references:

```markdown
# Project - Claude Code Documentation

## Spec-Kit Artifacts
- Constitution: `.specify/memory/constitution.md`
- Active Feature: `specs/###-feature-name/`

## Project Rules
- Quick Reference: `docs/QUICK-REFERENCE.md`
- All Rules: `docs/rules/`

## Workflow
1. Use `/speckit.specify` to create features
2. Follow rules in `docs/rules/` during implementation
3. Use `/speckit.implement` to execute
```
