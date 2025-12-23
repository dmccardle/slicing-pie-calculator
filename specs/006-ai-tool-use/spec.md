# Feature Specification: Reliable AI Valuation Suggestions

**Feature Branch**: `006-ai-tool-use`
**Created**: 2025-12-23
**Status**: Draft
**Input**: User description: "Add Claude tool use for reliable AI suggestions - users write in natural language but AI always returns parseable structured valuation suggestions via tool calls"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Natural Language Contribution Description (Priority: P1)

A contributor wants to record their work contribution but isn't sure how to value it. They open the AI chat assistant and describe their work in plain English: "I spent about 45 hours over the past month building the MVP prototype." They expect the AI to understand this and provide a suggestion they can apply to their contribution form.

**Why this priority**: This is the core value proposition - users should be able to describe contributions naturally and always get a usable suggestion. Currently, the "Use This" button appears inconsistently, frustrating users.

**Independent Test**: Can be fully tested by opening the AI chat, typing a natural language description, and verifying that a structured suggestion with an "Apply" button always appears.

**Acceptance Scenarios**:

1. **Given** a user has opened the AI valuation assistant, **When** they describe a time-based contribution in natural language (e.g., "I worked 20 hours on the website last week"), **Then** the system displays a suggestion card with type "Time", value "20 hours", and an actionable "Use This" button.

2. **Given** a user has opened the AI valuation assistant, **When** they describe a non-time contribution (e.g., "I contributed my professional camera equipment worth about $2,000"), **Then** the system displays a suggestion card with the appropriate type and dollar value, along with a "Use This" button.

3. **Given** a user has opened the AI valuation assistant, **When** they describe a contribution using informal language (e.g., "Been working on this for like three weeks, maybe 10-15 hours a week"), **Then** the AI interprets the description and provides a reasonable suggestion (e.g., 37.5 hours) with a confidence indicator.

---

### User Story 2 - Iterative Refinement with Reliable Suggestions (Priority: P2)

A contributor provides an initial description but the AI needs more information. The AI asks clarifying questions, and after the user responds, a suggestion is provided. Each time the conversation reaches a point where a valuation can be made, the suggestion button should appear.

**Why this priority**: Real conversations often require back-and-forth. Users should not lose the ability to apply a suggestion just because the AI asked a follow-up question.

**Independent Test**: Can be tested by having a multi-turn conversation where the AI asks clarifying questions, then provides a suggestion in a later response.

**Acceptance Scenarios**:

1. **Given** a user describes a vague contribution ("I helped with sales"), **When** the AI asks clarifying questions and the user provides more detail, **Then** the subsequent AI response includes a suggestion with the "Use This" button.

2. **Given** a user has an ongoing conversation with multiple messages, **When** the AI provides a new or updated valuation suggestion, **Then** both the inline suggestion button and the "Apply Latest Suggestion" button are available.

---

### User Story 3 - Quick Suggestion Without Full Conversation (Priority: P2)

A contributor uses the "Suggest Value" quick button on the contribution form. They enter a brief description and expect an immediate suggestion without needing a full conversation.

**Why this priority**: Power users want fast suggestions without opening the full chat modal.

**Independent Test**: Can be tested by clicking the "Suggest Value" button, entering a description, and verifying a suggestion appears.

**Acceptance Scenarios**:

1. **Given** a user clicks the "Suggest Value" button, **When** they enter a contribution description and submit, **Then** a suggestion card appears with type, value, confidence, and an "Apply" button.

---

### Edge Cases

- What happens when the user's description is too vague to make any suggestion?
  - The AI should respond conversationally asking for more details, and NO suggestion button should appear until sufficient information is provided.

- What happens when the AI cannot determine the contribution type?
  - The AI should make its best guess with a "low confidence" indicator, explaining the uncertainty in the reasoning field.

- What happens when the user describes multiple contributions in one message?
  - The AI should provide a suggestion for the primary/most significant contribution mentioned, and note that additional contributions may need separate entries.

- What happens when the AI service is unavailable or returns an error?
  - The user should see a clear error message and the existing regex-based fallback should attempt to parse any response received.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept natural language descriptions of contributions without requiring structured input.
- **FR-002**: System MUST provide a structured suggestion for every AI response that includes valuation information.
- **FR-003**: System MUST display the "Use This" button whenever a valid suggestion is available.
- **FR-004**: System MUST include the contribution type (time, cash, non-cash, idea, relationship) in every suggestion.
- **FR-005**: System MUST include a numeric value (hours or dollars) in every suggestion.
- **FR-006**: System MUST include a confidence indicator (low, medium, high) in every suggestion.
- **FR-007**: System MUST include reasoning text explaining the valuation in every suggestion.
- **FR-008**: System MUST preserve the existing conversational user experience - users should not notice any change in how they interact with the AI.
- **FR-009**: System MUST gracefully handle cases where the AI cannot provide a suggestion (e.g., insufficient information) by displaying only the conversational response without a suggestion card.
- **FR-010**: System MUST maintain backward compatibility with existing contribution form integration.

### Key Entities

- **AISuggestion**: Represents a structured valuation recommendation containing type, value, optional dollar equivalent, confidence level, and reasoning text.
- **ChatMessage**: Represents a message in the conversation, which may optionally contain an attached AISuggestion.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: "Use This" button appears in 95%+ of AI responses that contain valuation information (vs. current ~50% due to regex parsing failures).
- **SC-002**: Users can apply AI suggestions to the contribution form with a single click, 100% of the time when a suggestion is displayed.
- **SC-003**: Time to get a usable suggestion remains under 5 seconds for typical contribution descriptions.
- **SC-004**: Users can continue to write contribution descriptions in plain, natural English without learning any special syntax.
- **SC-005**: Both simple single-turn requests and complex multi-turn conversations produce reliable suggestions.
