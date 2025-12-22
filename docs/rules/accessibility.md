# Accessibility Rules

## Overview

All visual changes must be **WCAG 2.2 Level AA compliant**. Accessibility is not optional - it's a core requirement for all features.

## Why Accessibility Matters

- **Legal Requirement**: WCAG compliance is legally required in many jurisdictions
- **Inclusive Design**: Makes our product usable by everyone
- **Better UX**: Accessible design benefits all users
- **SEO**: Improves search engine rankings
- **Business Value**: Expands potential user base

---

## WCAG 2.2 Level AA Requirements

### 1. Perceivable

Users must be able to perceive the information being presented.

#### 1.1 Text Alternatives

**Rule**: Provide text alternatives for non-text content.

```tsx
// BAD - No alt text
<img src="/logo.png" />

// GOOD - Descriptive alt text
<img src="/logo.png" alt="Company logo" />

// GOOD - Decorative images use empty alt
<img src="/decorative-pattern.png" alt="" role="presentation" />

// GOOD - Complex images have longer descriptions
<img
  src="/chart.png"
  alt="Sales chart showing 25% growth in Q4"
  aria-describedby="chart-details"
/>
<div id="chart-details">
  Detailed description of the chart data...
</div>
```

#### 1.2 Time-based Media

- Provide captions for videos
- Provide transcripts for audio
- Provide audio descriptions for video content

#### 1.3 Adaptable

**Rule**: Content can be presented in different ways without losing information.

```tsx
// GOOD - Semantic HTML
<main>
  <h1>Page Title</h1>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
  <article>
    <h2>Article Title</h2>
    <p>Content...</p>
  </article>
</main>

// BAD - Non-semantic divs
<div>
  <div className="title">Page Title</div>
  <div className="nav">...</div>
</div>
```

#### 1.4 Distinguishable

**Color Contrast Requirements:**
- **Normal text**: 4.5:1 minimum
- **Large text (18pt+ or 14pt+ bold)**: 3:1 minimum
- **UI components and graphics**: 3:1 minimum

```css
/* BAD - Insufficient contrast */
.text {
  color: #777777; /* 2.9:1 on white */
  background: #ffffff;
}

/* GOOD - Sufficient contrast */
.text {
  color: #595959; /* 4.5:1 on white */
  background: #ffffff;
}
```

**Don't rely on color alone:**

```tsx
// BAD - Color only
<span className="text-red-500">Error</span>

// GOOD - Color + icon + text
<span className="text-red-500">
  <AlertIcon aria-hidden="true" />
  Error: Invalid input
</span>
```

**Text resize:**

```css
/* GOOD - Use relative units */
.text {
  font-size: 1rem; /* Scales with user preferences */
}

/* BAD - Fixed pixels prevent scaling */
.text {
  font-size: 14px;
}
```

---

### 2. Operable

Users must be able to operate the interface.

#### 2.1 Keyboard Accessible

**Rule**: All functionality must be available via keyboard.

```tsx
// BAD - onClick only
<div onClick={handleClick}>Click me</div>

// GOOD - Keyboard accessible
<button onClick={handleClick}>
  Click me
</button>

// GOOD - Custom interactive element with keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>
```

**Focus Indicators:**

```css
/* BAD - Removes focus outline */
button:focus {
  outline: none;
}

/* GOOD - Visible focus indicator */
button:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

**Tab Order:**

```tsx
// GOOD - Logical tab order
<form>
  <input name="name" /> {/* Tab 1 */}
  <input name="email" /> {/* Tab 2 */}
  <button type="submit">Submit</button> {/* Tab 3 */}
</form>

// BAD - Using tabIndex > 0 disrupts natural flow
<input tabIndex={3} />
<input tabIndex={1} />
<input tabIndex={2} />
```

#### 2.2 Enough Time

**Rule**: Give users enough time to read and use content.

```tsx
// GOOD - User can extend timeout
<div role="alert">
  Session expires in 2 minutes.
  <button onClick={extendSession}>Extend</button>
</div>

// GOOD - Auto-updating content can be paused
<button onClick={toggleAutoRefresh}>
  {isAutoRefreshing ? 'Pause' : 'Resume'} auto-refresh
</button>
```

#### 2.3 Seizures and Physical Reactions

**Rule**: Don't create content that flashes more than 3 times per second.

```tsx
// BAD - Rapid flashing
setInterval(() => setFlash(!flash), 100); // 10 times per second

// GOOD - Slow, controlled animation
// OR provide option to disable animations
```

#### 2.4 Navigable

**Rule**: Provide ways to help users navigate and find content.

```tsx
// GOOD - Skip to main content link
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

<main id="main-content">
  {/* Page content */}
</main>

// GOOD - Descriptive page titles
<Head>
  <title>User Profile - Settings - MyApp</title>
</Head>

// GOOD - Descriptive link text
<a href="/about">Learn more about our company</a>

// BAD - Generic link text
<a href="/about">Click here</a>
```

#### 2.5 Input Modalities

**Rule**: Make it easier to operate functionality through various inputs beyond keyboard.

```tsx
// GOOD - Large touch targets (minimum 44x44px)
<button className="min-w-[44px] min-h-[44px] p-3">
  Submit
</button>

// GOOD - Cancel accidental pointer activation
<button
  onPointerDown={handleStart}
  onPointerUp={handleConfirm} // Activation on up, not down
>
  Delete
</button>
```

---

### 3. Understandable

Users must be able to understand the information and interface.

#### 3.1 Readable

**Rule**: Make text readable and understandable.

```tsx
// GOOD - Declare language
<html lang="en">

// GOOD - Mark language changes
<p>
  The French word for hello is <span lang="fr">bonjour</span>.
</p>
```

#### 3.2 Predictable

**Rule**: Web pages appear and operate in predictable ways.

```tsx
// BAD - Changes context on focus
<input
  onFocus={() => navigate('/other-page')} // Don't do this!
/>

// GOOD - Changes require user action
<button onClick={() => navigate('/other-page')}>
  Go to other page
</button>

// GOOD - Consistent navigation across pages
<Navigation /> {/* Same on every page */}
```

#### 3.3 Input Assistance

**Rule**: Help users avoid and correct mistakes.

```tsx
// GOOD - Clear error identification
<form>
  <label htmlFor="email">
    Email
    {errors.email && (
      <span className="text-red-600" role="alert">
        {errors.email}
      </span>
    )}
  </label>
  <input
    id="email"
    type="email"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <span id="email-error" className="error">
      Please enter a valid email address
    </span>
  )}
</form>

// GOOD - Clear labels and instructions
<label htmlFor="password">
  Password
  <span className="text-sm text-gray-600">
    Must be at least 8 characters with 1 number
  </span>
</label>
<input id="password" type="password" />

// GOOD - Confirm before destructive actions
<button onClick={() => {
  if (confirm('Are you sure you want to delete this item?')) {
    deleteItem();
  }
}}>
  Delete
</button>
```

---

### 4. Robust

Content must be robust enough to work with assistive technologies.

#### 4.1 Compatible

**Rule**: Maximize compatibility with current and future tools.

```tsx
// GOOD - Valid HTML
<button type="button">Click me</button>

// BAD - Invalid HTML
<button type="button">Click me<button>

// GOOD - ARIA used correctly
<div role="alert" aria-live="assertive">
  Error: Form submission failed
</div>

// GOOD - Proper form labels
<label htmlFor="username">Username</label>
<input id="username" type="text" />

// BAD - Missing label association
<label>Username</label>
<input type="text" />
```

---

## ARIA (Accessible Rich Internet Applications)

### ARIA Rules

1. **Use semantic HTML first** - Only use ARIA when HTML doesn't provide what you need
2. **Don't change native semantics** unless you really need to
3. **All interactive ARIA controls must be keyboard accessible**
4. **Don't use `role="presentation"` or `aria-hidden="true"` on focusable elements**
5. **All interactive elements must have an accessible name**

### Common ARIA Patterns

#### Buttons

```tsx
// Native button (preferred)
<button onClick={handleClick}>Save</button>

// Custom button (when necessary)
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  aria-label="Save changes"
>
  <SaveIcon />
</div>
```

#### Alerts

```tsx
// Polite announcement (non-critical)
<div role="status" aria-live="polite">
  Changes saved
</div>

// Assertive announcement (critical)
<div role="alert" aria-live="assertive">
  Error: Unable to save changes
</div>
```

#### Loading States

```tsx
// Loading indicator
<button disabled aria-busy="true">
  <Spinner aria-hidden="true" />
  Loading...
</button>
```

#### Dialogs/Modals

```tsx
// Accessible modal
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirm Action</h2>
  <p id="modal-description">Are you sure you want to proceed?</p>
  <button onClick={handleConfirm}>Confirm</button>
  <button onClick={handleCancel}>Cancel</button>
</div>
```

---

## Testing for Accessibility

### Automated Testing

```bash
# Install axe-core for automated testing
npm install --save-dev @axe-core/react

# Use in tests
import { axe } from 'jest-axe';

test('should have no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Checklist

- [ ] **Keyboard navigation**: Tab through all interactive elements
- [ ] **Screen reader**: Test with VoiceOver (Mac), NVDA (Windows), or JAWS
- [ ] **Zoom**: Test at 200% zoom
- [ ] **Color contrast**: Use browser DevTools to check contrast ratios
- [ ] **Focus indicators**: Ensure visible focus for all interactive elements
- [ ] **Forms**: Verify labels, errors, and instructions are properly announced
- [ ] **Images**: Check alt text is descriptive
- [ ] **Headings**: Verify heading hierarchy is logical (h1 → h2 → h3)

### Testing Tools

- **Browser Extensions**:
  - axe DevTools
  - Lighthouse (Chrome DevTools)
  - WAVE
- **Screen Readers**:
  - VoiceOver (macOS/iOS built-in)
  - NVDA (Windows, free)
  - JAWS (Windows, paid)
- **Color Contrast**:
  - WebAIM Contrast Checker
  - Coolors Contrast Checker

---

## Common Accessibility Patterns

### Forms

```tsx
<form onSubmit={handleSubmit}>
  {/* Text input */}
  <div>
    <label htmlFor="name">Full Name *</label>
    <input
      id="name"
      type="text"
      required
      aria-required="true"
      aria-invalid={!!errors.name}
      aria-describedby={errors.name ? 'name-error' : undefined}
    />
    {errors.name && (
      <span id="name-error" role="alert" className="error">
        {errors.name}
      </span>
    )}
  </div>

  {/* Checkbox */}
  <div>
    <input
      type="checkbox"
      id="terms"
      required
      aria-required="true"
    />
    <label htmlFor="terms">
      I agree to the terms and conditions
    </label>
  </div>

  {/* Radio group */}
  <fieldset>
    <legend>Choose your plan</legend>
    <div>
      <input type="radio" id="basic" name="plan" value="basic" />
      <label htmlFor="basic">Basic</label>
    </div>
    <div>
      <input type="radio" id="pro" name="plan" value="pro" />
      <label htmlFor="pro">Pro</label>
    </div>
  </fieldset>

  <button type="submit">Submit</button>
</form>
```

### Data Tables

```tsx
<table>
  <caption>Monthly Sales Report</caption>
  <thead>
    <tr>
      <th scope="col">Month</th>
      <th scope="col">Sales</th>
      <th scope="col">Growth</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">January</th>
      <td>$10,000</td>
      <td>+5%</td>
    </tr>
  </tbody>
</table>
```

---

## Accessibility Checklist

Before merging any UI changes:

- [ ] All images have alt text (or `alt=""` for decorative)
- [ ] Color contrast meets 4.5:1 (normal text) or 3:1 (large text)
- [ ] All functionality available via keyboard
- [ ] Visible focus indicators on all interactive elements
- [ ] Form inputs have associated labels
- [ ] Error messages are clear and announced to screen readers
- [ ] Semantic HTML used (button, nav, main, article, etc.)
- [ ] Heading hierarchy is logical (no skipped levels)
- [ ] Links have descriptive text (not "click here")
- [ ] No content flashing more than 3 times per second
- [ ] Page has a descriptive title
- [ ] Language is declared (`<html lang="en">`)
- [ ] Tested with keyboard only
- [ ] Tested with screen reader
- [ ] Automated accessibility tests pass

---

## Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [WebAIM Resources](https://webaim.org/resources/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

---

## Related Documentation

**Essential Rules (Read Together)**:
- [UI Standards](./ui-standards.md) - Responsive design, visual hierarchy
- [Security & Privacy](./security-privacy.md) - Accessible authentication flows
- [Testing](./testing.md) - Accessibility testing with axe-core

**Implementation Guides**:
- [User Onboarding](../09-saas-specific/user-onboarding.md) - Accessible wizard patterns
- [Internationalization](../09-saas-specific/internationalization.md) - Screen reader language support
- [User Feedback](../04-frontend/user-feedback.md) - Accessible feedback widgets

**Practical Resources**:
- [React Component Template](../templates/react-component-template.tsx) - ARIA attributes, keyboard nav
- [Test Template](../templates/test-template.test.ts) - Accessibility test examples

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All Rules](./)
