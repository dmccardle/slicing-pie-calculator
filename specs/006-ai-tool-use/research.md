# Research: Claude Tool Use for Reliable AI Suggestions

**Feature**: 006-ai-tool-use
**Date**: 2025-12-23

## Research Topics

### 1. Claude Tool Use API Format

**Decision**: Use Claude's native tool use feature with JSON Schema input definitions.

**Rationale**:
- Tool use is a first-class feature of the Claude API
- Provides guaranteed structured output when the model decides to use a tool
- No regex parsing needed - JSON is returned directly
- Works with all Claude models (Haiku, Sonnet, Opus)

**API Request Format**:
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "tools": [
    {
      "name": "provide_valuation_suggestion",
      "description": "Provide a structured valuation suggestion for a contribution to the Slicing Pie equity model",
      "input_schema": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": ["time", "cash", "non-cash", "idea", "relationship"],
            "description": "The contribution type"
          },
          "value": {
            "type": "number",
            "description": "Hours for time contributions, or dollar amount for other types"
          },
          "dollarValue": {
            "type": "number",
            "description": "Dollar equivalent for ideas/relationships (optional)"
          },
          "confidence": {
            "type": "string",
            "enum": ["low", "medium", "high"],
            "description": "Confidence level in this valuation"
          },
          "reasoning": {
            "type": "string",
            "description": "Brief explanation of the valuation"
          }
        },
        "required": ["type", "value", "confidence", "reasoning"]
      }
    }
  ],
  "messages": [...]
}
```

**API Response Format** (when tool is used):
```json
{
  "content": [
    {
      "type": "text",
      "text": "Based on your description of working 45 hours on the MVP..."
    },
    {
      "type": "tool_use",
      "id": "toolu_01ABC123",
      "name": "provide_valuation_suggestion",
      "input": {
        "type": "time",
        "value": 45,
        "confidence": "high",
        "reasoning": "Based on 3 weeks at 15 hours per week as described"
      }
    }
  ],
  "stop_reason": "tool_use"
}
```

**Alternatives Considered**:
- Structured Output mode: Requires entire response to be JSON, loses conversational text
- Continue with regex parsing: Unreliable, current problem

---

### 2. Best Practices for Tool Definitions

**Decision**: Use descriptive tool name and detailed parameter descriptions.

**Rationale**:
- Clear descriptions help Claude understand when to use the tool
- Enum constraints ensure valid contribution types
- Required fields guarantee complete suggestions

**Best Practices Applied**:
1. **Tool Name**: `provide_valuation_suggestion` - action verb + noun, clear purpose
2. **Description**: Includes context about Slicing Pie model
3. **Parameter Descriptions**: Each parameter explains its purpose and format
4. **Enums**: Used for type and confidence to constrain valid values
5. **Required Fields**: All essential fields marked required (type, value, confidence, reasoning)

**Alternatives Considered**:
- Generic tool name like `suggest`: Too vague, might be called inappropriately
- Fewer required fields: Would allow incomplete suggestions

---

### 3. Handling Clarifying Questions (No Tool Call)

**Decision**: Check `stop_reason` to determine if tool was used. If not, return text-only response.

**Rationale**:
- Claude may ask clarifying questions before providing a suggestion
- When `stop_reason === "end_turn"`, no tool was called
- User experience: No "Use This" button shown for clarifying responses

**Implementation**:
```typescript
// Parse response
const textContent = response.content.find(block => block.type === "text");
const toolUse = response.content.find(block => block.type === "tool_use");

if (toolUse && toolUse.name === "provide_valuation_suggestion") {
  // Extract suggestion from tool input
  suggestion = toolUse.input as AISuggestion;
}

return {
  message: textContent?.text || "",
  suggestion, // undefined if no tool call
};
```

**Alternatives Considered**:
- Force tool use with `tool_choice: "required"`: Bad UX, prevents clarifying questions
- Always show suggestion button: Would show for incomplete/invalid suggestions

---

### 4. Error Handling for Tool Use

**Decision**: Keep regex parser as fallback, add validation for tool input.

**Rationale**:
- Tool input should match AISuggestion type exactly
- If validation fails, fall back to regex parsing
- Maintains backward compatibility with older API versions

**Error Scenarios**:
| Scenario | Handling |
|----------|----------|
| Tool not called | Return text-only response (no suggestion) |
| Tool input missing required fields | Log warning, attempt regex fallback |
| Tool input has invalid enum value | Validate and reject, attempt regex fallback |
| API error (rate limit, auth) | Existing error handling unchanged |

**Validation Function**:
```typescript
function validateToolSuggestion(input: unknown): AISuggestion | undefined {
  if (!input || typeof input !== "object") return undefined;

  const { type, value, confidence, reasoning, dollarValue } = input as Record<string, unknown>;

  // Validate required fields
  if (!["time", "cash", "non-cash", "idea", "relationship"].includes(type as string)) return undefined;
  if (typeof value !== "number" || value < 0) return undefined;
  if (!["low", "medium", "high"].includes(confidence as string)) return undefined;
  if (typeof reasoning !== "string") return undefined;

  return {
    type: type as ContributionType,
    value: value as number,
    confidence: confidence as "low" | "medium" | "high",
    reasoning: reasoning as string,
    dollarValue: typeof dollarValue === "number" ? dollarValue : undefined,
  };
}
```

**Alternatives Considered**:
- Strict validation with throw: Could break existing flows
- No fallback: Loses backward compatibility

---

## Summary of Decisions

| Topic | Decision | Key Reason |
|-------|----------|------------|
| API Format | Native tool use with JSON Schema | Guaranteed structure |
| Tool Definition | Detailed descriptions + enums | Clear constraints |
| No Tool Call | Check stop_reason, return text-only | Allows clarifying questions |
| Error Handling | Validate + regex fallback | Backward compatibility |

## Sources

- [Tool use with Claude - Anthropic Docs](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [Advanced Tool Use - Anthropic Engineering](https://www.anthropic.com/engineering/advanced-tool-use)
- [How to implement tool use - Claude Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use)
