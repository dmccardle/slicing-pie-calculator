"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form/Input";
import { ChatMessage } from "./ChatMessage";
import type { ChatMessage as ChatMessageType, ValuationContext, AISuggestion } from "@/types/ai";
import { useAISettings } from "@/hooks/useAISettings";
import { getValuationSuggestion } from "@/services/claude";
import { formatCurrency } from "@/utils/slicingPie";
import { useSlicingPieContext } from "@/context/SlicingPieContext";

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: ValuationContext;
  onApplySuggestion: (suggestion: AISuggestion) => void;
  initialMessage?: string;
}

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const SHARE_CONTEXT_KEY = "slicing-pie-ai-share-context";

export function AIChatModal({
  isOpen,
  onClose,
  context,
  onApplySuggestion,
  initialMessage,
}: AIChatModalProps) {
  const { apiKey, modelPreference, isConfigured } = useAISettings();
  const { contributions, contributors, contributorsWithEquity } = useSlicingPieContext();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestSuggestion, setLatestSuggestion] = useState<AISuggestion | null>(null);
  const [shareContext, setShareContext] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SHARE_CONTEXT_KEY) === "true";
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save share context preference
  const handleShareContextChange = (enabled: boolean) => {
    setShareContext(enabled);
    localStorage.setItem(SHARE_CONTEXT_KEY, String(enabled));
  };

  // Build enhanced context when sharing is enabled
  const enhancedContext: ValuationContext = useMemo(() => {
    if (!shareContext) return context;

    // Get the current contributor's equity percentage
    const currentContributor = contributorsWithEquity.find(
      (c) => c.name === context.contributorName
    );

    // Calculate total slices
    const totalSlices = contributions.reduce((sum, c) => sum + c.slices, 0);

    // Get existing contributions for this contributor
    const contributorRecord = contributors.find((c) => c.name === context.contributorName);
    const existingContributions = contributorRecord
      ? contributions
          .filter((c) => c.contributorId === contributorRecord.id)
          .map((c) => ({
            type: c.type,
            value: c.value,
            slices: c.slices,
          }))
      : [];

    return {
      ...context,
      existingContributions,
      totalCompanySlices: totalSlices,
      contributorEquityPercentage: currentContributor?.equityPercentage,
    };
  }, [context, shareContext, contributions, contributors, contributorsWithEquity]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      setError(null);
      setLatestSuggestion(null);
      // If there's an initial message, send it
      if (initialMessage?.trim()) {
        setInput(initialMessage);
      }
    }
  }, [isOpen, initialMessage]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !apiKey || isLoading) return;

    const userMessage: ChatMessageType = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await getValuationSuggestion(
        apiKey,
        modelPreference,
        userMessage.content,
        enhancedContext,
        messages
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      const aiMessage: ChatMessageType = {
        id: generateId(),
        role: "assistant",
        content: response.message,
        timestamp: new Date().toISOString(),
        suggestion: response.suggestion,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (response.suggestion) {
        setLatestSuggestion(response.suggestion);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  }, [input, apiKey, modelPreference, enhancedContext, messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleApplySuggestion = (suggestion: AISuggestion) => {
    onApplySuggestion(suggestion);
    onClose();
  };

  if (!isConfigured) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="AI Valuation Assistant">
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">API Key Required</h3>
          <p className="mt-2 text-sm text-gray-500">
            To use AI-assisted valuation, please add your Anthropic API key in Settings.
          </p>
          <Button variant="secondary" className="mt-4" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Valuation Assistant">
      <div className="flex flex-col" style={{ height: "60vh", maxHeight: "500px" }}>
        {/* Share Context Toggle */}
        <div className="mb-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
          <label className="flex cursor-pointer items-center justify-between">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">
                Share contribution history
              </span>
              <p className="text-xs text-gray-500">
                Helps the AI give more accurate suggestions based on your existing contributions
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={shareContext}
              onClick={() => handleShareContextChange(!shareContext)}
              className={`relative ml-3 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                shareContext ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  shareContext ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        </div>

        {/* Context Banner */}
        <div className="mb-3 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <span className="font-medium">{context.contributorName}</span>
          <span className="mx-2">|</span>
          <span>{formatCurrency(context.contributorHourlyRate)}/hr</span>
          {enhancedContext.contributorEquityPercentage !== undefined && (
            <>
              <span className="mx-2">|</span>
              <span>{enhancedContext.contributorEquityPercentage.toFixed(1)}% equity</span>
            </>
          )}
          {shareContext && enhancedContext.existingContributions && enhancedContext.existingContributions.length > 0 && (
            <>
              <span className="mx-2">|</span>
              <span>{enhancedContext.existingContributions.length} prior contributions</span>
            </>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-3">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-gray-400">
              <div>
                <p className="text-sm">Describe the contribution you want to value.</p>
                <p className="mt-1 text-xs">
                  Example: &quot;Access to my network of 50 potato farmers in PEI with exclusive supplier relationships&quot;
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onApplySuggestion={
                  msg.suggestion ? () => handleApplySuggestion(msg.suggestion!) : undefined
                }
              />
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-gray-100 px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            placeholder="Describe your contribution..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            variant="primary"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
          >
            Send
          </Button>
        </div>

        {/* Quick apply latest suggestion */}
        {latestSuggestion && messages.length > 0 && (
          <div className="mt-3 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleApplySuggestion(latestSuggestion)}
            >
              Apply Latest Suggestion
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default AIChatModal;
