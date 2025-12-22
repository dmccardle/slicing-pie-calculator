/**
 * Test Template
 *
 * This template follows all rules from docs/rules/testing.md:
 * - ✅ Testing Pyramid (70% unit, 20% integration, 10% E2E)
 * - ✅ AAA pattern (Arrange, Act, Assert)
 * - ✅ Descriptive test names
 * - ✅ Isolated tests (no shared state)
 * - ✅ Fast execution
 * - ✅ 80%+ code coverage
 *
 * Usage:
 * 1. Copy this file to src/[module]/__tests__/[file].test.ts
 * 2. Replace [ComponentName] or [functionName] with your test subject
 * 3. Add test cases following the AAA pattern
 * 4. Run: npm test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the component/function under test
import { [ComponentName] } from '../[ComponentName]';
// or
// import { [functionName] } from '../[module]';

// ============================================================================
// UNIT TESTS
// ============================================================================

describe('[ComponentName]', () => {
  // ============================================================================
  // SETUP & TEARDOWN
  // ============================================================================

  beforeEach(() => {
    // Reset mocks, clear localStorage, etc.
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('should render with default props', () => {
      // Arrange
      const props = {
        content: 'Test content',
      };

      // Act
      render(<[ComponentName] {...props} />);

      // Assert
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render loading state when isLoading is true', () => {
      // Arrange
      const props = {
        isLoading: true,
      };

      // Act
      render(<[ComponentName] {...props} />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
    });

    it('should render error state when error occurs', () => {
      // Arrange
      const props = {
        error: 'Something went wrong',
      };

      // Act
      render(<[ComponentName] {...props} />);

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      // Arrange
      const props = {
        className: 'custom-class',
      };

      // Act
      const { container } = render(<[ComponentName] {...props} />);

      // Assert
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // ============================================================================
  // INTERACTION TESTS
  // ============================================================================

  describe('User Interactions', () => {
    it('should call onAction when button is clicked', async () => {
      // Arrange
      const mockOnAction = vi.fn();
      const props = {
        onAction: mockOnAction,
      };

      // Act
      render(<[ComponentName] {...props} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Assert
      await waitFor(() => {
        expect(mockOnAction).toHaveBeenCalledTimes(1);
      });
    });

    it('should not call onAction when button is disabled', () => {
      // Arrange
      const mockOnAction = vi.fn();
      const props = {
        onAction: mockOnAction,
        isDisabled: true,
      };

      // Act
      render(<[ComponentName] {...props} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Assert
      expect(mockOnAction).not.toHaveBeenCalled();
    });

    it('should handle input changes correctly', () => {
      // Arrange
      const mockOnChange = vi.fn();
      const props = {
        onChange: mockOnChange,
      };

      // Act
      render(<[ComponentName] {...props} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'New value' } });

      // Assert
      expect(mockOnChange).toHaveBeenCalledWith('New value');
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      // Arrange & Act
      render(<[ComponentName] content="Test" />);

      // Assert
      expect(screen.getByRole('region')).toHaveAttribute('aria-label');
    });

    it('should be keyboard navigable', () => {
      // Arrange
      const mockOnAction = vi.fn();
      render(<[ComponentName] onAction={mockOnAction} />);

      // Act
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      fireEvent.keyDown(button, { key: 'Enter' });

      // Assert
      expect(mockOnAction).toHaveBeenCalled();
    });

    it('should announce loading state to screen readers', () => {
      // Arrange & Act
      render(<[ComponentName] isLoading={true} />);

      // Assert
      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  // ============================================================================
  // RESPONSIVE DESIGN TESTS
  // ============================================================================

  describe('Responsive Design', () => {
    it('should apply mobile styles on small screens', () => {
      // Arrange
      global.innerWidth = 375; // Mobile width
      global.dispatchEvent(new Event('resize'));

      // Act
      const { container } = render(<[ComponentName] />);

      // Assert
      expect(container.firstChild).toHaveClass('flex-col');
    });

    it('should apply desktop styles on large screens', () => {
      // Arrange
      global.innerWidth = 1920; // Desktop width
      global.dispatchEvent(new Event('resize'));

      // Act
      const { container } = render(<[ComponentName] />);

      // Assert
      expect(container.firstChild).toHaveClass('lg:gap-6');
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('[ComponentName] Integration Tests', () => {
  it('should fetch and display data from API', async () => {
    // Arrange
    const mockData = { id: '1', name: 'Test Item' };
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockData }),
      } as Response)
    );

    // Act
    render(<[ComponentName] />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    // Arrange
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      } as Response)
    );

    // Act
    render(<[ComponentName] />);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('should work with multi-tenant context', async () => {
    // Arrange
    const mockTenantId = 'tenant-123';
    global.fetch = vi.fn((url) => {
      expect(url).toContain('x-tenant-id');
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response);
    });

    // Act
    render(
      <TenantProvider tenantId={mockTenantId}>
        <[ComponentName] />
      </TenantProvider>
    );

    // Assert
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// PURE FUNCTION TESTS (Example)
// ============================================================================

describe('[functionName]', () => {
  it('should return correct result for valid input', () => {
    // Arrange
    const input = { value: 10 };

    // Act
    const result = [functionName](input);

    // Assert
    expect(result).toBe(20);
  });

  it('should throw error for invalid input', () => {
    // Arrange
    const input = null;

    // Act & Assert
    expect(() => [functionName](input)).toThrow('Invalid input');
  });

  it('should handle edge cases', () => {
    // Arrange
    const input = { value: 0 };

    // Act
    const result = [functionName](input);

    // Assert
    expect(result).toBe(0);
  });
});

// ============================================================================
// E2E TESTS (Example using Playwright)
// ============================================================================

/*
import { test, expect } from '@playwright/test';

test.describe('[ComponentName] E2E', () => {
  test('should complete full user workflow', async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:3000/[component-path]');

    // Act
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should work across different screen sizes', async ({ page }) => {
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/[component-path]');
    await expect(page.locator('.mobile-menu')).toBeVisible();

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.desktop-nav')).toBeVisible();
  });
});
*/

// ============================================================================
// PERFORMANCE TESTS (Example)
// ============================================================================

/*
describe('[ComponentName] Performance', () => {
  it('should render 1000 items in under 100ms', () => {
    // Arrange
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));

    // Act
    const start = performance.now();
    render(<[ComponentName] items={items} />);
    const end = performance.now();

    // Assert
    expect(end - start).toBeLessThan(100);
  });
});
*/

// ============================================================================
// SNAPSHOT TESTS (Example)
// ============================================================================

/*
describe('[ComponentName] Snapshots', () => {
  it('should match snapshot', () => {
    // Arrange & Act
    const { container } = render(<[ComponentName] content="Test" />);

    // Assert
    expect(container).toMatchSnapshot();
  });
});
*/
