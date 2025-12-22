/**
 * AI-Assisted Valuation Types
 * For Claude API integration to help value contributions
 */

import type { ContributionType } from './slicingPie';

/**
 * AI settings stored in localStorage
 */
export interface AISettings {
  anthropicApiKey: string | null;
  modelPreference: AIModel;
}

/**
 * Available Claude models
 */
export type AIModel = 'claude-3-haiku-20240307' | 'claude-3-5-sonnet-20241022';

/**
 * Model display info
 */
export const AI_MODELS: Record<AIModel, { name: string; description: string }> = {
  'claude-3-haiku-20240307': {
    name: 'Claude 3 Haiku',
    description: 'Fast and cost-effective',
  },
  'claude-3-5-sonnet-20241022': {
    name: 'Claude 3.5 Sonnet',
    description: 'Most capable',
  },
};

/**
 * Default AI settings
 */
export const DEFAULT_AI_SETTINGS: AISettings = {
  anthropicApiKey: null,
  modelPreference: 'claude-3-haiku-20240307',
};

/**
 * Chat message in a valuation conversation
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestion?: AISuggestion;
}

/**
 * AI-generated valuation suggestion
 */
export interface AISuggestion {
  type: ContributionType;
  value: number;
  dollarValue?: number; // For ideas/relationships, the dollar equivalent
  reasoning: string;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Hourly rate suggestion for time contributions
 */
export interface HourlyRateSuggestion {
  suggestedRate: number;
  lowRange: number;
  highRange: number;
  reasoning: string;
}

/**
 * Context provided to AI for valuation
 */
export interface ValuationContext {
  contributorName: string;
  contributorHourlyRate: number;
  companyName: string;
  companyDescription?: string;
  existingContributions?: {
    type: ContributionType;
    value: number;
    slices: number;
  }[];
  totalCompanySlices?: number;
  contributorEquityPercentage?: number;
}

/**
 * Request for AI valuation
 */
export interface ValuationRequest {
  description: string;
  context: ValuationContext;
  conversationHistory?: ChatMessage[];
  suggestedType?: ContributionType; // If user already selected a type
}

/**
 * Response from AI valuation
 */
export interface ValuationResponse {
  message: string;
  suggestion?: AISuggestion;
  error?: string;
}

/**
 * API error types
 */
export type AIErrorType =
  | 'invalid_api_key'
  | 'rate_limited'
  | 'network_error'
  | 'parse_error'
  | 'unknown';

/**
 * AI error response
 */
export interface AIError {
  type: AIErrorType;
  message: string;
  retryable: boolean;
}
