# UI/UX Standards

## Overview

This document defines the standards and best practices for user interface design and implementation across all platforms (web and mobile).

## TL;DR (2-Minute Read) {#tldr}

**Critical Requirements:**
- **ALL UIs MUST be responsive**: Mobile (< 640px), Tablet (640-1024px), Desktop (> 1024px) (see [Responsive Design](#responsive-design))
- **Touch targets**: Minimum 44x44px for mobile (see [Touch Targets](#touch-targets))
- **Accessibility**: WCAG 2.2 Level AA compliance (see `docs/rules/accessibility.md`)
- **Performance**: Images optimized, lazy loading, fast interactions (see [Performance](#performance))
- **Consistent spacing**: Use design system tokens (see [Spacing](#spacing))

**Quick Example:**
```tsx
// GOOD - Responsive grid with proper touch targets
<button className="min-h-[44px] min-w-[44px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">

// BAD - Fixed layout, small touch targets
<button className="h-8 w-8 grid grid-cols-4">
```

---

## Core Principles

1. **Always Responsive** - Every UI must work on mobile, tablet, and desktop
2. **Accessibility First** - WCAG 2.2 Level AA compliance (see `docs/rules/accessibility.md`)
3. **Consistent Design** - Follow design system and established patterns
4. **Performance Matters** - Fast loading, smooth interactions
5. **User-Centered** - Design for real users and real devices

---

## Responsive Design (CRITICAL) {#responsive-design}

### Rule: All UIs MUST Be Responsive

**Required Support**: Mobile, Tablet, and Desktop

**Why This Rule Exists**:
- Users access applications from multiple device types
- Mobile-first is the industry standard
- Better user experience across all contexts
- Wider market reach and accessibility
- Professional quality expectation

### Standard Breakpoints

Use these standard breakpoints (based on Tailwind CSS):

| Breakpoint | Width | Device Type | Tailwind Class |
|------------|-------|-------------|----------------|
| **Mobile** | < 640px | Phones | (default/sm:) |
| **Tablet** | 640px - 1023px | Tablets | md:, lg: |
| **Desktop** | ≥ 1024px | Laptops, Desktops | xl:, 2xl: |

**Common Device Widths**:
- iPhone SE: 375px
- iPhone 14: 390px
- iPad: 768px
- iPad Pro: 1024px
- Desktop: 1280px+

### Implementation

#### Next.js / React Web (Tailwind CSS)

```tsx
// GOOD - Responsive layout
export function Dashboard() {
  return (
    <div className="
      grid
      grid-cols-1          /* Mobile: 1 column */
      md:grid-cols-2       /* Tablet: 2 columns */
      xl:grid-cols-4       /* Desktop: 4 columns */
      gap-4
      p-4                  /* Mobile: 16px padding */
      md:p-6               /* Tablet: 24px padding */
      xl:p-8               /* Desktop: 32px padding */
    ">
      <StatsCard />
      <StatsCard />
      <StatsCard />
      <StatsCard />
    </div>
  );
}

// GOOD - Responsive text
export function Hero() {
  return (
    <h1 className="
      text-2xl             /* Mobile: 24px */
      md:text-4xl          /* Tablet: 36px */
      xl:text-6xl          /* Desktop: 60px */
      font-bold
    ">
      Welcome to Our App
    </h1>
  );
}

// GOOD - Responsive navigation
export function Navigation() {
  return (
    <nav className="
      flex
      flex-col             /* Mobile: vertical stack */
      md:flex-row          /* Tablet+: horizontal */
      gap-4
    ">
      <NavItem />
      <NavItem />
      <NavItem />
    </nav>
  );
}

// BAD - Fixed layout (will break on mobile)
export function BadDashboard() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Always 4 columns - unusable on mobile! */}
    </div>
  );
}

// BAD - No responsive classes
export function BadHero() {
  return (
    <h1 className="text-6xl">
      {/* 60px text on mobile is too large! */}
    </h1>
  );
}
```

#### Expo / React Native Mobile

```tsx
// GOOD - Responsive using Dimensions
import { Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

// Determine device type
const isSmallPhone = width < 375;
const isPhone = width < 768;
const isTablet = width >= 768 && width < 1024;
const isDesktop = width >= 1024;

export function Dashboard() {
  return (
    <View style={[
      styles.container,
      {
        flexDirection: isPhone ? 'column' : 'row',
        padding: isPhone ? 16 : isTablet ? 24 : 32,
      }
    ]}>
      <StatsCard />
      <StatsCard />
      <StatsCard />
      <StatsCard />
    </View>
  );
}

// GOOD - Responsive hook
function useResponsive() {
  const { width } = Dimensions.get('window');

  return {
    isSmallPhone: width < 375,
    isPhone: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    cols: width < 768 ? 1 : width < 1024 ? 2 : 4,
    spacing: width < 768 ? 8 : width < 1024 ? 16 : 24,
  };
}

export function ResponsiveGrid() {
  const { cols, spacing } = useResponsive();

  return (
    <View style={{ gap: spacing }}>
      {/* Layout based on device type */}
    </View>
  );
}

// BAD - Fixed layout
export function BadDashboard() {
  return (
    <View style={{ flexDirection: 'row' }}>
      {/* Always row - breaks on phone! */}
    </View>
  );
}
```

### Common Responsive Patterns

#### 1. Navigation

```tsx
// Mobile: Hamburger menu
// Tablet+: Full navigation bar

// Web example
export function Header() {
  return (
    <header>
      {/* Mobile menu button */}
      <button className="md:hidden"></button>

      {/* Desktop navigation */}
      <nav className="hidden md:flex gap-4">
        <Link>Home</Link>
        <Link>About</Link>
        <Link>Contact</Link>
      </nav>
    </header>
  );
}
```

#### 2. Grids and Lists

```tsx
// Mobile: Single column / card layout
// Tablet: 2-3 columns
// Desktop: 3-4 columns

export function ProductGrid() {
  return (
    <div className="
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4
      gap-4
    ">
      {products.map(product => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
```

#### 3. Tables

```tsx
// Mobile: Card layout (stacked)
// Tablet+: Table layout

export function DataTable({ data }) {
  return (
    <>
      {/* Mobile: Card view */}
      <div className="md:hidden space-y-4">
        {data.map(item => (
          <div key={item.id} className="card">
            <div>Name: {item.name}</div>
            <div>Status: {item.status}</div>
            <div>Date: {item.date}</div>
          </div>
        ))}
      </div>

      {/* Desktop: Table view */}
      <table className="hidden md:table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.status}</td>
              <td>{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
```

#### 4. Sidebars

```tsx
// Mobile: Bottom sheet or overlay
// Desktop: Persistent sidebar

export function Layout() {
  return (
    <div className="flex flex-col md:flex-row">
      {/* Mobile: Hidden by default */}
      <aside className="
        fixed
        md:static
        inset-y-0
        left-0
        w-64
        transform
        -translate-x-full
        md:translate-x-0
      ">
        <Sidebar />
      </aside>

      <main className="flex-1">
        <Content />
      </main>
    </div>
  );
}
```

#### 5. Typography

```tsx
// Scale font sizes appropriately
export function ResponsiveText() {
  return (
    <>
      <h1 className="text-3xl md:text-5xl xl:text-7xl">
        Main Heading
      </h1>

      <h2 className="text-2xl md:text-3xl xl:text-4xl">
        Subheading
      </h2>

      <p className="text-base md:text-lg">
        Body text
      </p>
    </>
  );
}
```

---

## Touch Targets (Mobile) {#touch-targets}

### Rule: Minimum 44x44px Touch Targets

**Why**: Apple and Android guidelines both require 44x44px minimum for tappable elements.

**Implementation**:

```tsx
// GOOD - Adequate touch target
export function Button() {
  return (
    <button className="
      min-h-[44px]
      min-w-[44px]
      px-6
      py-3
      text-base
    ">
      Click Me
    </button>
  );
}

// GOOD - Icon button with padding
export function IconButton() {
  return (
    <button className="
      p-3              /* 12px padding around icon */
      min-h-[44px]
      min-w-[44px]
    ">
      <Icon size={20} />
    </button>
  );
}

// BAD - Too small for mobile
export function BadButton() {
  return (
    <button className="px-2 py-1">
      {/* Total height ~24px - too small! */}
    </button>
  );
}
```

---

## Spacing and Layout {#spacing}

### Consistent Spacing Scale

Use a consistent spacing scale (Tailwind default: 4px increments):

```tsx
// Spacing scale
// 1 = 4px
// 2 = 8px
// 3 = 12px
// 4 = 16px
// 6 = 24px
// 8 = 32px
// 12 = 48px
// 16 = 64px

export function Card() {
  return (
    <div className="
      p-4           /* 16px padding (mobile) */
      md:p-6        /* 24px padding (tablet) */
      xl:p-8        /* 32px padding (desktop) */
      space-y-4     /* 16px vertical spacing */
    ">
      <h2>Title</h2>
      <p>Content</p>
    </div>
  );
}
```

### Container Widths

```tsx
// Standard container with responsive max-width
export function Container({ children }) {
  return (
    <div className="
      w-full
      max-w-7xl      /* 1280px max */
      mx-auto        /* Center */
      px-4           /* 16px horizontal padding (mobile) */
      sm:px-6        /* 24px (tablet) */
      lg:px-8        /* 32px (desktop) */
    ">
      {children}
    </div>
  );
}
```

---

## Images and Media

### Responsive Images

```tsx
// GOOD - Next.js Image with responsive sizing
import Image from 'next/image';

export function HeroImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1920}
      height={1080}
      className="
        w-full
        h-auto
        max-h-[300px]
        md:max-h-[500px]
        xl:max-h-[700px]
        object-cover
      "
      priority
    />
  );
}

// GOOD - React Native responsive image
import { Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export function HeroImage() {
  return (
    <Image
      source={require('./hero.jpg')}
      style={{
        width: width,
        height: width * 0.6,  // Maintain aspect ratio
      }}
      resizeMode="cover"
    />
  );
}
```

### Video Embeds

```tsx
// GOOD - Responsive video embed
export function VideoEmbed() {
  return (
    <div className="
      relative
      w-full
      aspect-video      /* 16:9 ratio */
      overflow-hidden
      rounded-lg
    ">
      <iframe
        className="absolute inset-0 w-full h-full"
        src="https://youtube.com/embed/..."
        allowFullScreen
      />
    </div>
  );
}
```

---

## Forms

### Responsive Form Layouts

```tsx
// GOOD - Responsive form
export function ContactForm() {
  return (
    <form className="space-y-4">
      {/* Full width on mobile, grid on desktop */}
      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-4
      ">
        <input
          type="text"
          placeholder="First Name"
          className="
            w-full
            px-4
            py-3              /* Larger touch target */
            text-base         /* 16px - prevents zoom on iOS */
            border
            rounded
          "
        />
        <input
          type="text"
          placeholder="Last Name"
          className="w-full px-4 py-3 text-base border rounded"
        />
      </div>

      <input
        type="email"
        placeholder="Email"
        className="w-full px-4 py-3 text-base border rounded"
      />

      <textarea
        placeholder="Message"
        rows={4}
        className="w-full px-4 py-3 text-base border rounded"
      />

      <button className="
        w-full              /* Full width on mobile */
        md:w-auto           /* Auto width on desktop */
        px-8
        py-3
        bg-blue-600
        text-white
        rounded
      ">
        Submit
      </button>
    </form>
  );
}
```

### Important Form Considerations

1. **Font Size**: Use minimum 16px for inputs to prevent auto-zoom on iOS
2. **Input Height**: Minimum 44px for touch targets
3. **Label Position**: Above inputs on mobile, can be inline on desktop
4. **Button Size**: Full-width on mobile, sized on desktop

---

## Testing Responsive Design

### Required Testing

Before approving any UI:

- [ ] Test on mobile width (< 640px) - use Chrome DevTools
- [ ] Test on tablet width (768px)
- [ ] Test on desktop width (1024px+)
- [ ] Test portrait and landscape orientations (mobile/tablet)
- [ ] Test on real mobile device (iOS and/or Android)
- [ ] Verify touch targets ≥ 44x44px on mobile
- [ ] Verify text is readable at all sizes
- [ ] Verify images scale properly
- [ ] Verify no horizontal scrolling at any breakpoint
- [ ] Test with browser zoom at 200%

### Testing Tools

**Browser DevTools**:
```
Chrome DevTools → Toggle Device Toolbar (Cmd+Shift+M)
- iPhone SE (375px)
- iPhone 14 (390px)
- iPad (768px)
- iPad Pro (1024px)
- Responsive mode (custom widths)
```

**Online Tools**:
- [Responsively App](https://responsively.app/) - Test multiple devices simultaneously
- [BrowserStack](https://www.browserstack.com/) - Real device testing

**React Native**:
- iOS Simulator (included with Xcode)
- Android Emulator (included with Android Studio)
- Expo Go app on real devices

---

## Performance {#performance}

### Image Optimization

```tsx
// GOOD - Optimized images
import Image from 'next/image';

export function OptimizedImage() {
  return (
    <Image
      src="/photo.jpg"
      alt="Photo"
      width={800}
      height={600}
      quality={85}           // Balance quality/size
      loading="lazy"         // Lazy load
      placeholder="blur"     // Blur placeholder
    />
  );
}
```

### Lazy Loading

```tsx
// GOOD - Lazy load components
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

---

## Design System Consistency

### Colors

Define and use consistent colors:

```tsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          // ... more shades
          500: '#3b82f6',
          // ... more shades
          900: '#1e3a8a',
        },
      },
    },
  },
};

// Usage
<button className="bg-primary-500 hover:bg-primary-600">
  Click Me
</button>
```

### Typography

Consistent font scales:

```tsx
// Heading hierarchy
<h1 className="text-4xl md:text-6xl font-bold">H1</h1>
<h2 className="text-3xl md:text-4xl font-semibold">H2</h2>
<h3 className="text-2xl md:text-3xl font-semibold">H3</h3>
<h4 className="text-xl md:text-2xl font-medium">H4</h4>

// Body text
<p className="text-base md:text-lg">Body</p>
<p className="text-sm">Small text</p>
```

---

## Best Practices

### DO:
- Design mobile-first, then scale up
- Test at all three breakpoints (mobile, tablet, desktop)
- Use responsive units (rem, em, %, vw/vh) over fixed px
- Ensure touch targets ≥ 44x44px on mobile
- Use `min-h-[44px]` for interactive elements
- Test on real devices when possible
- Use browser DevTools device emulation
- Optimize images for different screen sizes
- Consider both portrait and landscape orientations
- Use semantic HTML for better accessibility

### DON'T:
- Design desktop-only layouts
- Use fixed widths that don't scale
- Make touch targets smaller than 44x44px
- Use tiny text on mobile (< 16px for body)
- Require horizontal scrolling
- Hide critical features on mobile
- Assume all users have large screens
- Test only in browser without device emulation
- Use absolute positioning for layout (usually)
- Forget to test landscape orientation

---

## Component Examples

### Button Variants

```tsx
// Small, medium, large - all responsive
export function Button({ size = 'md', children }) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]',
  };

  return (
    <button className={`
      ${sizeClasses[size]}
      min-w-[44px]
      rounded
      font-medium
      transition
    `}>
      {children}
    </button>
  );
}
```

### Card Component

```tsx
export function Card({ children }) {
  return (
    <div className="
      bg-white
      rounded-lg
      shadow
      p-4
      md:p-6
      xl:p-8
      w-full
      max-w-full
      overflow-hidden
    ">
      {children}
    </div>
  );
}
```

---

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [React Native Dimensions API](https://reactnative.dev/docs/dimensions)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design (Android)](https://m3.material.io/)
- [Responsively App](https://responsively.app/)
- See `docs/rules/accessibility.md` for accessibility requirements
- See `docs/09-saas-specific/internationalization.md` for i18n considerations

---

## Related Documentation

**Essential Rules (Read Together)**:
- [Accessibility](./accessibility.md) - WCAG 2.2 Level AA compliance for all UI
- [Code Standards](./code-standards.md) - Component structure and naming
- [Testing](./testing.md) - Visual regression and E2E testing

**Implementation Guides**:
- [User Onboarding](../09-saas-specific/user-onboarding.md) - Wizard patterns, progress tracking
- [User Feedback](../04-frontend/user-feedback.md) - In-app feedback widgets
- [UX Research](../04-frontend/ux-research.md) - Usability testing methods
- [Internationalization](../09-saas-specific/internationalization.md) - Multi-language UI patterns

**Practical Resources**:
- [React Component Template](../templates/react-component-template.tsx) - Responsive component boilerplate
- [Test Template](../templates/test-template.test.ts) - Responsive design testing

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All Rules](./)
