# Tasks: Reliable AI Valuation Suggestions

**Input**: Design documents from `/specs/006-ai-tool-use/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec - test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Phase 1: Setup | 1 | Tool definition constant |
| Phase 2: Foundational | 3 | Core infrastructure changes |
| Phase 3: User Story 1 | 2 | Natural language suggestions |
| Phase 4: User Story 2 | 1 | Multi-turn conversation support |
| Phase 5: User Story 3 | 1 | Quick suggestion integration |
| Phase 6: Polish | 2 | Cleanup and validation |
| **Total** | **10** | |

---

## Phase 1: Setup

**Purpose**: Define the tool schema constant

- [x] T001 Add VALUATION_SUGGESTION_TOOL constant with JSON schema in src/services/claude.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure changes that enable all user stories

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Add validateToolSuggestion function to validate tool input in src/services/claude.ts
- [x] T003 Update callClaudeAPI to accept optional tools parameter and parse tool_use response in src/services/claude.ts
- [x] T004 Update buildSystemPrompt to include tool usage instructions in src/services/claude.ts

**Checkpoint**: Foundation ready - tool infrastructure in place

---

## Phase 3: User Story 1 - Natural Language Contribution Description (Priority: P1) MVP

**Goal**: Users describe contributions in plain English and always get a "Use This" button with structured suggestion

**Independent Test**: Open AI chat, type "I worked 45 hours on the MVP", verify suggestion card with "Use This" button appears

### Implementation for User Story 1

- [x] T005 [US1] Update getValuationSuggestion to pass tool definition and extract suggestion from tool_use response in src/services/claude.ts
- [x] T006 [US1] Keep parseSuggestionFromResponse as fallback when tool_use not present in src/services/claude.ts

**Checkpoint**: User Story 1 complete - natural language input produces reliable suggestions

---

## Phase 4: User Story 2 - Iterative Refinement with Reliable Suggestions (Priority: P2)

**Goal**: Multi-turn conversations continue to produce reliable suggestions after clarifying questions

**Independent Test**: Start vague ("I helped with sales"), answer AI's clarifying question, verify suggestion appears in follow-up response

### Implementation for User Story 2

- [x] T007 [US2] Verify conversation history is correctly passed to API with tool definition in src/services/claude.ts

**Checkpoint**: User Story 2 complete - multi-turn conversations work with tool use

---

## Phase 5: User Story 3 - Quick Suggestion Without Full Conversation (Priority: P2)

**Goal**: "Suggest Value" button produces reliable single-turn suggestions

**Independent Test**: Click "Suggest Value", enter description, verify suggestion card appears

### Implementation for User Story 3

- [x] T008 [US3] Verify SuggestValueButton uses updated getValuationSuggestion with tool support (no code change expected - uses same function)

**Checkpoint**: User Story 3 complete - quick suggestions work with tool use

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and validation

- [x] T009 Remove or simplify regex patterns in parseSuggestionFromResponse if no longer primary path in src/services/claude.ts
- [x] T010 Run quickstart.md validation - test all scenarios listed in Testing section

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (T002, T003, T004)
    ↓
    ├── Phase 3: User Story 1 (T005, T006)
    ├── Phase 4: User Story 2 (T007)
    └── Phase 5: User Story 3 (T008)
    ↓
Phase 6: Polish (T009, T010)
```

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Depends on Foundational - Uses same infrastructure as US1
- **User Story 3 (P2)**: Depends on Foundational - Uses same getValuationSuggestion function

### Within Each Phase

All tasks in Phase 2 are sequential (same file, building on each other)
User Story phases can theoretically run in parallel but all modify the same file

### Parallel Opportunities

Limited parallelization since all changes are in single file `src/services/claude.ts`:
- T002, T003, T004 are sequential (same file, interdependent)
- US1, US2, US3 could be parallelized if split across developers, but minimal benefit for this feature

---

## Parallel Example: Foundational Phase

```bash
# Sequential execution required (same file):
T002 → T003 → T004
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002, T003, T004)
3. Complete Phase 3: User Story 1 (T005, T006)
4. **STOP and VALIDATE**: Test with natural language input
5. Merge if working

### Incremental Delivery

1. Setup + Foundational → Tool infrastructure ready
2. Add User Story 1 → Test → **MVP Complete**
3. Add User Story 2 → Test multi-turn conversations
4. Add User Story 3 → Verify quick suggestions (likely no changes needed)
5. Polish → Clean up regex fallback

### Single Developer Strategy (Recommended)

Given all changes are in one file:

1. Complete all tasks sequentially
2. Test after each user story checkpoint
3. Single PR with all changes

---

## File Summary

| File | Tasks | Changes |
|------|-------|---------|
| `src/services/claude.ts` | T001-T009 | All implementation changes |
| N/A | T010 | Manual testing per quickstart.md |

---

## Notes

- Single file change makes this a focused implementation
- Tool use is additive - existing regex parsing kept as fallback
- No UI changes needed - components already handle AISuggestion
- Constitution compliant - no new dependencies or complexity
- Commit after completing each user story phase
