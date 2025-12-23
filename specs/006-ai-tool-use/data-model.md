# Data Model: Reliable AI Valuation Suggestions

**Feature**: 006-ai-tool-use
**Date**: 2025-12-23

## Overview

This feature does not introduce new data models. It enhances the existing AI integration by using Claude's tool use feature for structured output. The existing `AISuggestion` type is fully compatible with the tool input schema.

## Existing Entities (No Changes)

### AISuggestion

**Location**: `src/types/ai.ts:57-63`

**Purpose**: Represents a structured valuation recommendation from the AI assistant.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | ContributionType | Yes | "time", "cash", "non-cash", "idea", "relationship" |
| value | number | Yes | Hours for time, dollar amount for other types |
| dollarValue | number | No | Dollar equivalent for ideas/relationships |
| reasoning | string | Yes | Brief explanation of the valuation |
| confidence | "low" \| "medium" \| "high" | Yes | Confidence level in this suggestion |

**Compatibility**: This type exactly matches the tool input schema defined in `contracts/claude-tool.json`. No modifications needed.

### ChatMessage

**Location**: `src/types/ai.ts:46-52`

**Purpose**: Represents a message in the AI conversation, optionally containing a suggestion.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique message identifier |
| role | "user" \| "assistant" | Yes | Message author |
| content | string | Yes | Message text |
| timestamp | string | Yes | ISO timestamp |
| suggestion | AISuggestion | No | Attached suggestion (assistant messages only) |

**Compatibility**: No changes needed. The suggestion field continues to work the same way.

### ValuationResponse

**Location**: `src/types/ai.ts:105-109`

**Purpose**: Response structure from the AI service functions.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | AI response text |
| suggestion | AISuggestion | No | Parsed suggestion if available |
| error | string | No | Error message if failed |

**Compatibility**: No changes needed. The service layer will populate `suggestion` from tool use instead of regex parsing.

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Before (Regex)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Input ──► Claude API ──► Free-form Text ──► Regex Parse  │
│                                                    ▼            │
│                                            ~50% success rate    │
│                                                    ▼            │
│                                        AISuggestion | undefined │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        After (Tool Use)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Input ──► Claude API ──► Tool Use Response ──► Parse JSON │
│                 (with tool)          ▼                  ▼       │
│                               Structured Input    Validate      │
│                                                        ▼        │
│                                              95%+ success rate  │
│                                                        ▼        │
│                                            AISuggestion | regex │
│                                                      fallback   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Validation Rules

### Tool Input Validation

When extracting suggestion from tool use response:

1. **type**: Must be one of the 5 valid ContributionType values
2. **value**: Must be a non-negative number
3. **confidence**: Must be "low", "medium", or "high"
4. **reasoning**: Must be a non-empty string
5. **dollarValue**: If present, must be a non-negative number

### Fallback Behavior

If tool input validation fails:
1. Log warning with details
2. Attempt regex parsing of text response (existing behavior)
3. Return undefined suggestion if both methods fail

## State Transitions

No state transitions. Suggestions are stateless - they are computed on-demand and optionally applied to the contribution form.
