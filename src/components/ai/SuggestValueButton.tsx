"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SuggestionCard } from "./SuggestionCard";
import type { ValuationContext, AISuggestion } from "@/types/ai";
import { useAISettings } from "@/hooks/useAISettings";
import { getValuationSuggestion } from "@/services/claude";

interface SuggestValueButtonProps {
  description: string;
  context: ValuationContext;
  onSuggestion: (suggestion: AISuggestion) => void;
  onOpenChat?: () => void;
  disabled?: boolean;
}

export function SuggestValueButton({
  description,
  context,
  onSuggestion,
  onOpenChat,
  disabled = false,
}: SuggestValueButtonProps) {
  const { apiKey, modelPreference, isConfigured } = useAISettings();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    if (!apiKey || !description.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const response = await getValuationSuggestion(
        apiKey,
        modelPreference,
        description,
        context
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.suggestion) {
        setSuggestion(response.suggestion);
      } else {
        setError("Could not generate a suggestion. Try the chat for more detail.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get suggestion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (suggestion) {
      onSuggestion(suggestion);
      setSuggestion(null);
    }
  };

  const handleDismiss = () => {
    setSuggestion(null);
    setError(null);
  };

  if (!isConfigured) {
    return null; // Don't show if AI is not configured
  }

  return (
    <div className="space-y-2">
      {/* Button row */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSuggest}
          disabled={disabled || !description.trim() || isLoading}
          isLoading={isLoading}
          className="text-blue-600 hover:text-blue-700"
        >
          <svg
            className="mr-1 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          Suggest Value
        </Button>

        {onOpenChat && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenChat}
            disabled={disabled}
            className="text-gray-600 hover:text-gray-700"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Discuss with AI
          </Button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center justify-between rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-red-500 hover:text-red-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Suggestion display */}
      {suggestion && (
        <div className="relative">
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute -right-1 -top-1 rounded-full bg-white p-1 shadow-sm hover:bg-gray-100"
          >
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <SuggestionCard
            suggestion={suggestion}
            hourlyRate={context.contributorHourlyRate}
            onApply={handleApply}
            compact
          />
        </div>
      )}
    </div>
  );
}

export default SuggestValueButton;
