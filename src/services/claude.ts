/**
 * Claude API Service
 * Handles communication with Anthropic's Claude API for AI-assisted valuation
 */

import type {
  AIModel,
  ChatMessage,
  ValuationContext,
  ValuationResponse,
  AISuggestion,
  HourlyRateSuggestion,
  AIError,
  AIErrorType,
} from "@/types/ai";
import type { ContributionType } from "@/types/slicingPie";
import { MULTIPLIERS } from "@/utils/slicingPie";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

/**
 * Tool definition for structured valuation suggestions
 * This enables Claude to return structured data via tool use instead of free-form text
 */
const VALUATION_SUGGESTION_TOOL = {
  name: "provide_valuation_suggestion",
  description: `Provide a structured valuation suggestion for a contribution to the Slicing Pie equity model.
Call this tool when the user describes a contribution that can be valued.
Include all required fields to ensure the suggestion can be applied to the contribution form.`,
  input_schema: {
    type: "object" as const,
    properties: {
      type: {
        type: "string",
        enum: ["time", "cash", "non-cash", "idea", "relationship"],
        description:
          "The contribution type. Use 'time' for hours worked, 'cash' for money invested, 'non-cash' for equipment/supplies, 'idea' for intellectual property, 'relationship' for network/sales connections.",
      },
      value: {
        type: "number",
        minimum: 0,
        description:
          "The numeric value. For 'time' contributions, this is hours worked. For all other types, this is the dollar amount.",
      },
      dollarValue: {
        type: "number",
        minimum: 0,
        description:
          "Optional dollar equivalent for ideas and relationships. Use when the value field represents something other than dollars.",
      },
      confidence: {
        type: "string",
        enum: ["low", "medium", "high"],
        description:
          "Your confidence level in this valuation. Use 'low' when making assumptions, 'medium' for reasonable estimates, 'high' when the user provided clear details.",
      },
      reasoning: {
        type: "string",
        description:
          "Brief explanation of how you arrived at this valuation. Include any assumptions made.",
      },
    },
    required: ["type", "value", "confidence", "reasoning"],
  },
};

/**
 * Build the system prompt for valuation assistance
 */
function buildSystemPrompt(context: ValuationContext): string {
  return `You are an expert in the Slicing Pie equity model, helping startup founders fairly value contributions.

## Slicing Pie Model Overview
The Slicing Pie model tracks contributions as "slices" using these multipliers:
- Time (unpaid work): hours × hourly rate × 2
- Cash investments: amount × 4
- Non-cash (equipment, supplies): fair market value × 2
- Ideas/IP: negotiated value × 1
- Relationships (network, sales): negotiated value × 1

## Current Context
- Company: ${context.companyName}${context.companyDescription ? ` - ${context.companyDescription}` : ""}
- Contributor: ${context.contributorName} (hourly rate: $${context.contributorHourlyRate}/hr)
${context.contributorEquityPercentage !== undefined ? `- Current equity: ${context.contributorEquityPercentage.toFixed(1)}%` : ""}
${context.totalCompanySlices !== undefined ? `- Total company slices: ${context.totalCompanySlices.toLocaleString()}` : ""}

## Your Role
Help value contributions fairly by:
1. Asking clarifying questions when needed
2. Suggesting appropriate contribution types
3. Providing dollar value estimates for ideas/relationships
4. Explaining your reasoning

## IMPORTANT: Tool Usage
When the user describes a contribution that can be valued, you MUST use the provide_valuation_suggestion tool to provide a structured suggestion. This ensures the user can easily apply your suggestion to their contribution form.

Only respond with text (no tool call) when:
- You need more information to make a suggestion
- The user is asking a general question that doesn't require a valuation
- The description is too vague to value with any confidence

When you DO have enough information to suggest a valuation, ALWAYS call the provide_valuation_suggestion tool.

Always be helpful and guide the user toward fair valuations.`;
}

/**
 * Build the system prompt for hourly rate suggestions
 */
function buildHourlyRateSystemPrompt(): string {
  return `You are an expert in startup compensation and market rates. Help determine fair market hourly rates for contributors.

Consider:
1. Role and responsibilities
2. Experience level
3. Location/market
4. Industry standards for 2024-2025

Provide:
- Suggested hourly rate
- Low to high range
- Brief reasoning

Be helpful and provide realistic market rates.`;
}

/**
 * Parse AI response for structured suggestion (FALLBACK)
 * This is now a fallback mechanism - tool use is the primary method.
 * Used when the AI doesn't call the tool (e.g., asking clarifying questions)
 * or when tool input validation fails.
 */
function parseSuggestionFromResponse(content: string): AISuggestion | undefined {
  // Look for structured suggestion patterns in the response
  const suggestionPatterns = {
    type: /(?:type|contribution type)[:\s]*(?:["']?)(\w+[-\w]*)/i,
    dollarValue: /(?:value|worth|suggest(?:ed)?)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    hours: /(\d+(?:\.\d+)?)\s*hours?/i,
    confidence: /confidence[:\s]*(?:["']?)(low|medium|high)/i,
  };

  const typeMatch = content.match(suggestionPatterns.type);
  const dollarMatch = content.match(suggestionPatterns.dollarValue);
  const hoursMatch = content.match(suggestionPatterns.hours);
  const confidenceMatch = content.match(suggestionPatterns.confidence);

  if (!typeMatch) return undefined;

  let type: ContributionType = "idea";
  const rawType = typeMatch[1].toLowerCase();
  if (rawType.includes("time")) type = "time";
  else if (rawType.includes("cash") && !rawType.includes("non")) type = "cash";
  else if (rawType.includes("non-cash") || rawType.includes("noncash")) type = "non-cash";
  else if (rawType.includes("relationship")) type = "relationship";
  else if (rawType.includes("idea")) type = "idea";

  let value = 0;
  let dollarValue: number | undefined;

  if (type === "time" && hoursMatch) {
    value = parseFloat(hoursMatch[1]);
  } else if (dollarMatch) {
    const parsed = parseFloat(dollarMatch[1].replace(/,/g, ""));
    if (type === "idea" || type === "relationship") {
      dollarValue = parsed;
      value = parsed; // For ideas/relationships, value = dollar amount (× 1 multiplier)
    } else {
      value = parsed;
    }
  }

  const confidence = (confidenceMatch?.[1]?.toLowerCase() || "medium") as "low" | "medium" | "high";

  // Extract reasoning (everything after the suggestion details)
  const reasoningMatch = content.match(/(?:reason(?:ing)?|because|this is because)[:\s]*([^\n]+)/i);
  const reasoning = reasoningMatch?.[1]?.trim() || "Based on fair market value assessment.";

  return {
    type,
    value,
    dollarValue,
    reasoning,
    confidence,
  };
}

/**
 * Validate and extract AISuggestion from tool use input
 * Returns undefined if validation fails
 */
function validateToolSuggestion(input: unknown): AISuggestion | undefined {
  if (!input || typeof input !== "object") return undefined;

  const data = input as Record<string, unknown>;

  // Validate type
  const validTypes = ["time", "cash", "non-cash", "idea", "relationship"];
  if (typeof data.type !== "string" || !validTypes.includes(data.type)) {
    return undefined;
  }

  // Validate value
  if (typeof data.value !== "number" || data.value < 0) {
    return undefined;
  }

  // Validate confidence
  const validConfidence = ["low", "medium", "high"];
  if (typeof data.confidence !== "string" || !validConfidence.includes(data.confidence)) {
    return undefined;
  }

  // Validate reasoning
  if (typeof data.reasoning !== "string" || data.reasoning.length < 1) {
    return undefined;
  }

  return {
    type: data.type as ContributionType,
    value: data.value,
    dollarValue: typeof data.dollarValue === "number" ? data.dollarValue : undefined,
    reasoning: data.reasoning,
    confidence: data.confidence as "low" | "medium" | "high",
  };
}

/**
 * Parse hourly rate suggestion from response
 */
function parseHourlyRateFromResponse(content: string): HourlyRateSuggestion | undefined {
  const rateMatch = content.match(/(?:suggest(?:ed)?|recommend(?:ed)?)\s*(?:rate)?[:\s]*\$?([\d,]+)/i);
  const rangeMatch = content.match(/range[:\s]*\$?([\d,]+)\s*(?:to|-)\s*\$?([\d,]+)/i);

  if (!rateMatch) return undefined;

  const suggestedRate = parseFloat(rateMatch[1].replace(/,/g, ""));
  const lowRange = rangeMatch ? parseFloat(rangeMatch[1].replace(/,/g, "")) : suggestedRate * 0.8;
  const highRange = rangeMatch ? parseFloat(rangeMatch[2].replace(/,/g, "")) : suggestedRate * 1.2;

  // Extract reasoning
  const reasoningMatch = content.match(/(?:reason(?:ing)?|because|this is based)[:\s]*([^\n]+)/i);
  const reasoning = reasoningMatch?.[1]?.trim() || "Based on current market rates.";

  return {
    suggestedRate,
    lowRange,
    highRange,
    reasoning,
  };
}

/**
 * Create an AI error object
 */
function createAIError(type: AIErrorType, message: string): AIError {
  return {
    type,
    message,
    retryable: type === "rate_limited" || type === "network_error",
  };
}

/**
 * Tool use response structure from Claude API
 */
interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: unknown;
}

/**
 * Make a request to the Claude API
 * Supports optional tools parameter for structured outputs
 */
async function callClaudeAPI(
  apiKey: string,
  model: AIModel,
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
  tools?: typeof VALUATION_SUGGESTION_TOOL[]
): Promise<{ content: string; toolUse?: ToolUseBlock; error?: AIError }> {
  try {
    // Build request body
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        return {
          content: "",
          error: createAIError("invalid_api_key", "Invalid API key. Please check your settings."),
        };
      }

      if (response.status === 429) {
        return {
          content: "",
          error: createAIError("rate_limited", "Rate limited. Please try again in a moment."),
        };
      }

      return {
        content: "",
        error: createAIError(
          "unknown",
          errorData.error?.message || `API error: ${response.status}`
        ),
      };
    }

    const data = await response.json();

    // Extract text content from response
    const textBlock = data.content?.find(
      (block: { type: string }) => block.type === "text"
    );
    const content = textBlock?.text || "";

    // Extract tool use from response (if present)
    const toolUseBlock = data.content?.find(
      (block: { type: string }) => block.type === "tool_use"
    ) as ToolUseBlock | undefined;

    return { content, toolUse: toolUseBlock };
  } catch (err) {
    return {
      content: "",
      error: createAIError(
        "network_error",
        err instanceof Error ? err.message : "Network error. Please check your connection."
      ),
    };
  }
}

/**
 * Get a valuation suggestion from Claude
 * Uses tool use for structured output with regex fallback
 */
export async function getValuationSuggestion(
  apiKey: string,
  model: AIModel,
  description: string,
  context: ValuationContext,
  conversationHistory: ChatMessage[] = []
): Promise<ValuationResponse> {
  const systemPrompt = buildSystemPrompt(context);

  // Build messages from conversation history
  const messages: { role: "user" | "assistant"; content: string }[] = conversationHistory.map(
    (msg) => ({
      role: msg.role,
      content: msg.content,
    })
  );

  // Add the new user message
  messages.push({
    role: "user",
    content: description,
  });

  // Call API with valuation suggestion tool
  const { content, toolUse, error } = await callClaudeAPI(
    apiKey,
    model,
    systemPrompt,
    messages,
    [VALUATION_SUGGESTION_TOOL]
  );

  if (error) {
    return {
      message: "",
      error: error.message,
    };
  }

  // Try to extract suggestion from tool use first (preferred)
  let suggestion: AISuggestion | undefined;

  if (toolUse && toolUse.name === "provide_valuation_suggestion") {
    suggestion = validateToolSuggestion(toolUse.input);
  }

  // Fall back to regex parsing if tool use failed or wasn't called
  if (!suggestion && content) {
    suggestion = parseSuggestionFromResponse(content);
  }

  return {
    message: content,
    suggestion,
  };
}

/**
 * Get an hourly rate suggestion from Claude
 */
export async function suggestHourlyRate(
  apiKey: string,
  model: AIModel,
  roleDescription: string,
  location?: string
): Promise<{ suggestion?: HourlyRateSuggestion; message: string; error?: string }> {
  const systemPrompt = buildHourlyRateSystemPrompt();

  const userMessage = `Please suggest a fair market hourly rate for this role:

Role: ${roleDescription}
${location ? `Location: ${location}` : "Location: Remote/US market"}

Please provide:
1. Your suggested hourly rate
2. A reasonable range (low to high)
3. Brief reasoning`;

  const { content, error } = await callClaudeAPI(apiKey, model, systemPrompt, [
    { role: "user", content: userMessage },
  ]);

  if (error) {
    return {
      message: "",
      error: error.message,
    };
  }

  const suggestion = parseHourlyRateFromResponse(content);

  return {
    message: content,
    suggestion,
  };
}

/**
 * Test the API key by making a simple request
 */
export async function testApiKey(
  apiKey: string,
  model: AIModel = "claude-3-haiku-20240307"
): Promise<{ success: boolean; error?: string }> {
  const { content, error } = await callClaudeAPI(
    apiKey,
    model,
    "You are a helpful assistant.",
    [{ role: "user", content: "Say 'API key is valid' if you can read this." }]
  );

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: content.toLowerCase().includes("valid") };
}

/**
 * Calculate slices from suggestion for preview
 */
export function calculateSlicesFromSuggestion(
  suggestion: AISuggestion,
  hourlyRate: number
): number {
  const multiplier = MULTIPLIERS[suggestion.type];

  if (suggestion.type === "time") {
    return suggestion.value * hourlyRate * multiplier;
  }

  return suggestion.value * multiplier;
}
