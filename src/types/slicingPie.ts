/**
 * Slicing Pie Equity Calculator Types
 * Based on Mike Moyer's Slicing Pie model
 */

import { BaseEntity } from './index';

/**
 * Company information
 */
export interface Company {
  name: string;
  description?: string;
}

/**
 * Soft deletion support - entities with this can be soft-deleted
 */
export interface SoftDeletable {
  deletedAt?: string;           // ISO timestamp when soft-deleted
  deletedWithParent?: string;   // Parent entity ID if cascade-deleted
}

/**
 * Activity event types for tracking deletions and restorations
 */
export type ActivityEventType = 'deleted' | 'restored';
export type ActivityEntityType = 'contributor' | 'contribution';

/**
 * Activity event for tracking deletion/restoration history
 */
export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  entityType: ActivityEntityType;
  entityId: string;
  entityName: string;
  timestamp: string;
  slicesAffected: number;
  cascadeCount?: number;  // Number of contributions cascade-deleted (for contributors)
}

/**
 * Vesting configuration for a contributor
 */
export interface VestingConfig {
  startDate: string;      // ISO date (YYYY-MM-DD)
  cliffMonths: number;    // Months before vesting begins (0-24 typical)
  vestingMonths: number;  // Total vesting period in months (12-60 typical)
}

/**
 * Vesting state for a contributor
 */
export type VestingState = 'none' | 'preCliff' | 'vesting' | 'fullyVested';

/**
 * Computed vesting status for a contributor at a given date
 */
export interface VestingStatus {
  state: VestingState;
  percentVested: number;       // 0-100
  vestedSlices: number;
  unvestedSlices: number;
  cliffDate: string | null;
  fullVestDate: string | null;
  monthsUntilCliff: number;
  monthsUntilFullVest: number;
}

/**
 * Contributor - a person who contributes to the startup
 */
export interface Contributor extends BaseEntity, SoftDeletable {
  name: string;
  email?: string;
  hourlyRate: number;
  active: boolean;
  vesting?: VestingConfig;  // Optional for backward compatibility
  // Note: deletedWithParent is never set for contributors (they are top-level)
}

/**
 * Contribution types with their multipliers
 * - time: 2x (hours × hourlyRate × 2)
 * - cash: 4x
 * - non-cash: 2x fair market value
 * - idea: 1x negotiated value
 * - relationship: 1x negotiated value
 */
export type ContributionType = 'time' | 'cash' | 'non-cash' | 'idea' | 'relationship';

/**
 * Contribution - a single contribution made by a contributor
 */
export interface Contribution extends BaseEntity, SoftDeletable {
  contributorId: string;
  type: ContributionType;
  value: number;
  description?: string;
  date: string; // ISO date (YYYY-MM-DD)
  multiplier: number;
  slices: number;
  // deletedWithParent is set to contributor ID when cascade-deleted
}

/**
 * Contributor with computed equity values
 */
export interface ContributorWithEquity extends Contributor {
  totalSlices: number;
  equityPercentage: number;
}

/**
 * Full app state for export/import
 */
export interface SlicingPieData {
  company: Company;
  contributors: Contributor[];
  contributions: Contribution[];
  exportedAt: string;
}

/**
 * Default company settings
 */
export const DEFAULT_COMPANY: Company = {
  name: 'My Startup',
  description: '',
};

/**
 * Contribution type labels for display
 */
export const CONTRIBUTION_TYPE_LABELS: Record<ContributionType, string> = {
  time: 'Time (Unpaid)',
  cash: 'Cash Investment',
  'non-cash': 'Non-Cash (Equipment)',
  idea: 'Idea / IP',
  relationship: 'Relationship / Sales',
};

/**
 * Contribution type descriptions
 */
export const CONTRIBUTION_TYPE_DESCRIPTIONS: Record<ContributionType, string> = {
  time: 'Hours worked at $0 pay (2x hourly rate)',
  cash: 'Money invested, unreimbursed (4x amount)',
  'non-cash': 'Equipment, supplies, facilities (2x fair market value)',
  idea: 'Intellectual property contributed (1x negotiated value)',
  relationship: 'Sales commissions, key introductions (1x negotiated value)',
};
