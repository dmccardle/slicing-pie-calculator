"use client";

import React from "react";
import type { ChatMessage as ChatMessageType } from "@/types/ai";
import { SuggestionCard } from "./SuggestionCard";

interface ChatMessageProps {
  message: ChatMessageType;
  onApplySuggestion?: () => void;
}

export function ChatMessage({ message, onApplySuggestion }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-2 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* Suggestion card (for AI messages with suggestions) */}
        {!isUser && message.suggestion && (
          <div className="mt-3">
            <SuggestionCard
              suggestion={message.suggestion}
              onApply={onApplySuggestion}
            />
          </div>
        )}

        {/* Timestamp */}
        <p
          className={`mt-1 text-xs ${
            isUser ? "text-blue-200" : "text-gray-500"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

export default ChatMessage;
