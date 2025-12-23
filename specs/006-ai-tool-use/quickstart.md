# Quickstart: Implementing Claude Tool Use

**Feature**: 006-ai-tool-use
**Date**: 2025-12-23

## Overview

This guide provides step-by-step implementation instructions for adding Claude tool use to the AI valuation assistant.

## Prerequisites

- Existing `src/services/claude.ts` file
- Understanding of Claude API tool use format (see `research.md`)
- Familiarity with TypeScript and the existing codebase

## Implementation Steps

### Step 1: Define the Tool Schema

Add a constant for the tool definition at the top of `claude.ts`:

```typescript
/**
 * Tool definition for structured valuation suggestions
 */
const VALUATION_SUGGESTION_TOOL = {
  name: "provide_valuation_suggestion",
  description: `Provide a structured valuation suggestion for a contribution to the Slicing Pie equity model.
Call this tool when the user describes a contribution that can be valued.
Include all required fields to ensure the suggestion can be applied to the contribution form.`,
  input_schema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["time", "cash", "non-cash", "idea", "relationship"],
        description: "The contribution type",
      },
      value: {
        type: "number",
        minimum: 0,
        description: "Hours for time, or dollar amount for other types",
      },
      dollarValue: {
        type: "number",
        minimum: 0,
        description: "Dollar equivalent for ideas/relationships (optional)",
      },
      confidence: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "Confidence level in this valuation",
      },
      reasoning: {
        type: "string",
        minLength: 10,
        description: "Brief explanation of the valuation",
      },
    },
    required: ["type", "value", "confidence", "reasoning"],
  },
} as const;
```

### Step 2: Update System Prompt

Modify `buildSystemPrompt()` to instruct Claude to use the tool:

```typescript
function buildSystemPrompt(context: ValuationContext): string {
  return `You are an expert in the Slicing Pie equity model...

## IMPORTANT: Tool Usage
When the user describes a contribution that can be valued, you MUST use the provide_valuation_suggestion tool to provide a structured suggestion. This ensures the user can easily apply your suggestion to their contribution form.

Only respond with text (no tool call) when:
- You need more information to make a suggestion
- The user is asking a question that doesn't require a valuation
- The description is too vague to value

When you DO have enough information, ALWAYS call the tool.`;
}
```

### Step 3: Update API Call Function

Modify `callClaudeAPI()` to include the tools parameter:

```typescript
async function callClaudeAPI(
  apiKey: string,
  model: AIModel,
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
  tools?: typeof VALUATION_SUGGESTION_TOOL[]
): Promise<{ content: string; toolUse?: { name: string; input: unknown }; error?: AIError }> {
  try {
    const body: Record<string, unknown> = {
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    };

    // Add tools if provided
    if (tools && tools.length > 0) {
      body.tools = tools;
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
    });

    // ... existing error handling ...

    const data = await response.json();

    // Extract text and tool use from response
    const textBlock = data.content?.find((block: { type: string }) => block.type === "text");
    const toolUseBlock = data.content?.find((block: { type: string }) => block.type === "tool_use");

    return {
      content: textBlock?.text || "",
      toolUse: toolUseBlock
        ? { name: toolUseBlock.name, input: toolUseBlock.input }
        : undefined,
    };
  } catch (err) {
    // ... existing error handling ...
  }
}
```

### Step 4: Add Tool Input Validation

Add a validation function for the tool input:

```typescript
/**
 * Validate and extract AISuggestion from tool use input
 */
function validateToolSuggestion(input: unknown): AISuggestion | undefined {
  if (!input || typeof input !== "object") return undefined;

  const data = input as Record<string, unknown>;

  // Validate type
  const validTypes = ["time", "cash", "non-cash", "idea", "relationship"];
  if (!validTypes.includes(data.type as string)) return undefined;

  // Validate value
  if (typeof data.value !== "number" || data.value < 0) return undefined;

  // Validate confidence
  const validConfidence = ["low", "medium", "high"];
  if (!validConfidence.includes(data.confidence as string)) return undefined;

  // Validate reasoning
  if (typeof data.reasoning !== "string" || data.reasoning.length < 1) return undefined;

  return {
    type: data.type as ContributionType,
    value: data.value,
    dollarValue: typeof data.dollarValue === "number" ? data.dollarValue : undefined,
    reasoning: data.reasoning,
    confidence: data.confidence as "low" | "medium" | "high",
  };
}
```

### Step 5: Update getValuationSuggestion

Modify the main function to use tool responses:

```typescript
export async function getValuationSuggestion(
  apiKey: string,
  model: AIModel,
  description: string,
  context: ValuationContext,
  conversationHistory: ChatMessage[] = []
): Promise<ValuationResponse> {
  const systemPrompt = buildSystemPrompt(context);

  const messages = conversationHistory.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  messages.push({ role: "user", content: description });

  // Call API with tool
  const { content, toolUse, error } = await callClaudeAPI(
    apiKey,
    model,
    systemPrompt,
    messages,
    [VALUATION_SUGGESTION_TOOL]
  );

  if (error) {
    return { message: "", error: error.message };
  }

  // Try to extract suggestion from tool use first
  let suggestion: AISuggestion | undefined;

  if (toolUse && toolUse.name === "provide_valuation_suggestion") {
    suggestion = validateToolSuggestion(toolUse.input);
  }

  // Fall back to regex parsing if tool use failed
  if (!suggestion && content) {
    suggestion = parseSuggestionFromResponse(content);
  }

  return {
    message: content,
    suggestion,
  };
}
```

### Step 6: Keep Regex Parser as Fallback

The existing `parseSuggestionFromResponse()` function should be kept unchanged as a fallback.

## Testing

### Manual Testing

1. Open the app and navigate to add a contribution
2. Click "Ask AI" or the AI assistant button
3. Enter a natural language description:
   - "I worked 45 hours on the MVP last month"
   - "I contributed my laptop worth $1500"
   - "I brought in a client worth about $10k"
4. Verify the "Use This" button appears
5. Click "Use This" and verify the form is populated

### Edge Cases to Test

| Test Case | Expected Result |
|-----------|-----------------|
| Clear time description | Tool called, button appears |
| Vague description | No tool call, clarifying question |
| Multiple contributions mentioned | Tool called for primary contribution |
| Invalid API key | Error message shown |
| Rate limited | Retry message shown |

## Troubleshooting

### "Use This" button not appearing

1. Check browser console for API errors
2. Verify API key is configured in settings
3. Check if `toolUse` is in the API response
4. Verify tool input validation passes

### Tool not being called

1. Check system prompt includes tool usage instructions
2. Verify `tools` array is passed to API
3. Test with a clear, specific contribution description

## Files Changed

| File | Changes |
|------|---------|
| `src/services/claude.ts` | Add tool definition, update API call, add validation |

## Next Steps

After implementation, run `/speckit.tasks` to generate the task breakdown.
