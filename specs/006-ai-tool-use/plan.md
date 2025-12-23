# Implementation Plan: Reliable AI Valuation Suggestions

**Branch**: `006-ai-tool-use` | **Date**: 2025-12-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-ai-tool-use/spec.md`

## Summary

Upgrade the AI valuation assistant to use Claude's tool use (function calling) feature instead of regex-based parsing. Users continue to write in natural language, but the AI now returns structured suggestions via tool calls, guaranteeing the "Use This" button appears reliably (95%+ vs ~50% currently).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16 (App Router), React 19, Anthropic Claude API
**Storage**: N/A (no storage changes - localStorage unchanged)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web browser (all modern browsers)
**Project Type**: Web application (frontend-only, local-first)
**Performance Goals**: AI suggestions returned in under 5 seconds
**Constraints**: Offline-capable for core features (AI requires network), client-side only
**Scale/Scope**: Single-user local application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Local-First Architecture | PASS | No storage changes. AI already requires network (external API). |
| II. Reusable Infrastructure | PASS | Changes isolated to claude.ts service. Hooks/components unchanged. |
| III. Responsive Design | PASS | No UI changes. Existing SuggestionCard already responsive. |
| IV. Export System | PASS | No impact on export functionality. |
| V. Simplicity Over Features | PASS | Simplifies code by removing regex parsing complexity. No new dependencies. |
| VI. Technology Stack | PASS | Uses existing TypeScript, no new libraries needed. |

**Gate Result**: PASS - All constitution principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/006-ai-tool-use/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Claude tool use research
├── data-model.md        # Phase 1: Entity definitions
├── quickstart.md        # Phase 1: Implementation guide
├── contracts/           # Phase 1: API schemas
│   └── claude-tool.json # Tool definition schema
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2: Task breakdown (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── services/
│   └── claude.ts        # PRIMARY: Add tool definition, update API call
├── types/
│   └── ai.ts            # No changes needed (AISuggestion already correct)
└── components/
    └── ai/              # No changes needed (already handles suggestions)
```

**Structure Decision**: Single file change (`src/services/claude.ts`) with tool definition added. No new files in source code. Existing type definitions and components are already compatible.

## Complexity Tracking

No constitution violations. No complexity justifications needed.

## Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `src/services/claude.ts` | Modify | Add tool definition, update API call, parse tool_use response |

## Implementation Approach

### Phase 0 Research Topics

1. Claude tool use API format and response structure
2. Best practices for tool definitions
3. Handling cases where Claude asks clarifying questions (no tool call)
4. Error handling for tool use failures

### Phase 1 Design Outputs

1. **Tool Schema** (`contracts/claude-tool.json`): JSON schema for `provide_valuation_suggestion` tool
2. **Data Model** (`data-model.md`): AISuggestion entity (existing, validate compatibility)
3. **Quickstart** (`quickstart.md`): Step-by-step implementation guide
