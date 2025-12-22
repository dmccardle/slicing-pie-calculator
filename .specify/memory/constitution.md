<!--
  Sync Impact Report
  ===================
  Version change: N/A (new) -> 1.0.0
  Added principles:
    - I. Local-First Architecture
    - II. Reusable Infrastructure
    - III. Responsive Design
    - IV. Export System
    - V. Simplicity Over Features
    - VI. Technology Stack
  Added sections:
    - Technology Requirements
    - Governance
  Templates requiring updates:
    - .specify/templates/plan-template.md: No updates needed (generic)
    - .specify/templates/spec-template.md: No updates needed (generic)
    - .specify/templates/tasks-template.md: No updates needed (generic)
  Follow-up TODOs: None
-->

# Standalone Web App Template Constitution

## Core Principles

### I. Local-First Architecture

All application data MUST be stored in browser localStorage. No backend server or external API dependencies are permitted at runtime.

- Data persistence uses localStorage exclusively
- Application MUST function fully offline after initial load
- No network requests required for core functionality
- Import/export provides data portability between devices

**Rationale**: Eliminates hosting costs, simplifies deployment, ensures privacy, and enables true offline capability.

### II. Reusable Infrastructure

Every feature MUST be built using generic, reusable hooks and components that can be applied to any entity type.

- `useLocalStorage` hook for key-value persistence
- `useEntities` hook for generic CRUD operations with auto-save
- `useExport` hook for data export functionality
- UI components MUST be entity-agnostic (Button, Card, Modal, Table, Form)
- Data components MUST accept entity configuration, not hardcode specific types

**Rationale**: Template exists to accelerate future projects. Non-reusable code defeats the purpose.

### III. Responsive Design

All user interfaces MUST function correctly across three breakpoints:

- **Mobile**: < 640px (single column, touch-friendly targets)
- **Tablet**: 640px - 1024px (adaptive layout)
- **Desktop**: > 1024px (full layout with sidebar)

Requirements:
- Collapsible sidebar navigation (hidden by default on mobile)
- Touch targets minimum 44x44px on mobile
- No horizontal scrolling at any breakpoint
- All features accessible on all device sizes

**Rationale**: Users expect applications to work on any device. Responsive design is not optional.

### IV. Export System

Application MUST provide data export in three formats:

- **JSON**: Full data backup and restore capability
- **Excel (.xlsx)**: Formatted spreadsheet export via xlsx library
- **PDF**: Summary report generation via jsPDF library

Requirements:
- Export panel component with all three options
- JSON import MUST validate data structure before loading
- Excel export MUST include proper column headers
- PDF export MUST include data visualization if charts are present

**Rationale**: Data portability ensures users own their data and can migrate or share as needed.

### V. Simplicity Over Features

YAGNI (You Aren't Gonna Need It) principle strictly enforced.

Prohibited:
- External state management libraries (Redux, MobX, Zustand)
- CSS-in-JS libraries (styled-components, Emotion)
- Over-abstraction (no factory patterns, no dependency injection)
- Premature optimization
- Features not explicitly requested

Required:
- React Context + hooks for state management
- Tailwind CSS for all styling
- Maximum 3 levels of component nesting
- Prefer composition over inheritance
- Delete unused code immediately

**Rationale**: Complexity is the enemy of maintainability. Simple solutions are easier to understand, debug, and extend.

### VI. Technology Stack

All implementations MUST use the following technologies:

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.x |
| UI Library | React | 19.x |
| Language | TypeScript | 5.x (strict mode) |
| Styling | Tailwind CSS | 4.x |
| Charts | Recharts | Latest |
| Excel Export | xlsx | Latest |
| PDF Export | jsPDF | Latest |
| Testing | Vitest + React Testing Library | Latest |

Prohibited:
- Alternative frameworks (Vite standalone, Create React App)
- JavaScript without TypeScript
- CSS modules, Sass, or plain CSS files (Tailwind only)
- Alternative chart libraries
- Server-side data fetching or API routes for user data

**Rationale**: Consistency across all projects built from this template reduces cognitive load and enables code sharing.

## Technology Requirements

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Code Quality

- Zero ESLint errors
- Zero TypeScript errors
- Zero console warnings in production build
- All exports typed explicitly

### Testing

- Unit tests for all hooks
- Component tests for interactive UI components
- Export utility tests with mock file system

## Governance

This constitution supersedes all other development practices for projects built from this template.

### Amendment Process

1. Propose change with rationale
2. Document impact on existing code
3. Update constitution version
4. Update all affected template files
5. Commit with message: `docs: amend constitution to vX.Y.Z`

### Version Policy

- **MAJOR**: Principle removed or fundamentally redefined
- **MINOR**: New principle added or existing principle expanded
- **PATCH**: Clarification or typo fix

### Compliance

All pull requests MUST be verified against constitution principles before merge. Any violation requires explicit justification in the Complexity Tracking section of the implementation plan.

**Version**: 1.0.0 | **Ratified**: 2025-12-22 | **Last Amended**: 2025-12-22
