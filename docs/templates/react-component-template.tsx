/**
 * React Component Template
 *
 * This template follows all rules from docs/rules/ui-standards.md:
 * - ✅ Responsive design (mobile, tablet, desktop)
 * - ✅ TypeScript with strict types
 * - ✅ Accessibility (WCAG 2.2 Level AA)
 * - ✅ Clean code practices
 * - ✅ Error boundaries
 * - ✅ Loading states
 *
 * Usage:
 * 1. Copy this file to src/components/[ComponentName].tsx
 * 2. Replace [ComponentName] with your component name
 * 3. Update props interface
 * 4. Implement component logic
 * 5. Add tests in [ComponentName].test.tsx
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface [ComponentName]Props {
  /**
   * The main content to display
   */
  content?: string;

  /**
   * Optional className for custom styling
   */
  className?: string;

  /**
   * Callback when action is triggered
   */
  onAction?: () => void;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Disabled state
   */
  isDisabled?: boolean;

  /**
   * Variant style
   */
  variant?: 'primary' | 'secondary' | 'outline';

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// COMPONENT
// ============================================================================

export const [ComponentName]: React.FC<[ComponentName]Props> = ({
  content = '',
  className,
  onAction,
  isLoading = false,
  isDisabled = false,
  variant = 'primary',
  size = 'md',
}) => {
  const { t } = useTranslation('common');
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAction = async () => {
    if (isDisabled || isLoading) return;

    try {
      setError(null);
      await onAction?.();
    } catch (err: any) {
      setError(err.message || t('errors.unknown'));
      console.error('[ComponentName] error:', err);
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Component mount/unmount logic
    return () => {
      // Cleanup
    };
  }, []);

  // ============================================================================
  // STYLES (Responsive with Tailwind)
  // ============================================================================

  const baseStyles = 'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 focus:ring-gray-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';
  const loadingStyles = 'cursor-wait';

  const buttonClasses = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    isDisabled && disabledStyles,
    isLoading && loadingStyles,
    className
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className={cn(
        'w-full',
        // Mobile: < 640px
        'flex flex-col gap-2',
        // Tablet: 768px+
        'md:flex-row md:gap-4',
        // Desktop: 1024px+
        'lg:gap-6'
      )}
      role="region"
      aria-label={t('[componentName].label')}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 md:text-2xl lg:text-3xl">
          {t('[componentName].title')}
        </h2>
      </div>

      {/* Content Section */}
      <div className="flex-1">
        {isLoading ? (
          <div
            className="flex items-center justify-center p-8"
            role="status"
            aria-live="polite"
            aria-label={t('loading')}
          >
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            <span className="sr-only">{t('loading')}</span>
          </div>
        ) : error ? (
          <div
            className="p-4 bg-red-50 border border-red-200 rounded-md"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-sm text-red-800">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {content && (
              <p className="text-gray-700 text-sm md:text-base lg:text-lg">
                {content}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Section */}
      {onAction && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAction}
            disabled={isDisabled || isLoading}
            className={buttonClasses}
            aria-busy={isLoading}
            aria-disabled={isDisabled}
          >
            {isLoading ? t('loading') : t('[componentName].action')}
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DISPLAY NAME (for React DevTools)
// ============================================================================

[ComponentName].displayName = '[ComponentName]';

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
import { [ComponentName] } from '@/components/[ComponentName]';

function MyPage() {
  const handleAction = async () => {
    // Do something
  };

  return (
    <[ComponentName]
      content="Hello, world!"
      onAction={handleAction}
      variant="primary"
      size="md"
    />
  );
}
*/
