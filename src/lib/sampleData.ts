/**
 * Sample Data for Slicing Pie Onboarding
 * Demonstrates the equity model with realistic example data
 */

import { Company, Contributor, Contribution } from '@/types/slicingPie';

export const SAMPLE_COMPANY: Company = {
  name: 'Acme Startup',
  description: 'A sample company for demonstration purposes',
};

export const SAMPLE_CONTRIBUTORS: Contributor[] = [
  {
    id: 'sample-alice',
    name: 'Alice Developer',
    email: 'alice@example.com',
    hourlyRate: 150,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    active: true,
  },
  {
    id: 'sample-bob',
    name: 'Bob Designer',
    email: 'bob@example.com',
    hourlyRate: 125,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    active: true,
  },
  {
    id: 'sample-carol',
    name: 'Carol Investor',
    email: 'carol@example.com',
    hourlyRate: 0,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    active: true,
  },
];

export const SAMPLE_CONTRIBUTIONS: Contribution[] = [
  // Alice: 40 hours @ $150/hr × 2 = 12,000 slices
  {
    id: 'contrib-1',
    contributorId: 'sample-alice',
    type: 'time',
    value: 40,
    description: 'Initial product development and architecture',
    date: '2024-01-15',
    multiplier: 2,
    slices: 12000,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  // Alice: Additional 20 hours = 6,000 slices
  {
    id: 'contrib-2',
    contributorId: 'sample-alice',
    type: 'time',
    value: 20,
    description: 'MVP feature implementation',
    date: '2024-02-01',
    multiplier: 2,
    slices: 6000,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  // Bob: 30 hours @ $125/hr × 2 = 7,500 slices
  {
    id: 'contrib-3',
    contributorId: 'sample-bob',
    type: 'time',
    value: 30,
    description: 'UI/UX design and branding',
    date: '2024-01-20',
    multiplier: 2,
    slices: 7500,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  // Bob: Non-cash $500 laptop × 2 = 1,000 slices
  {
    id: 'contrib-4',
    contributorId: 'sample-bob',
    type: 'non-cash',
    value: 500,
    description: 'Personal laptop contributed to project',
    date: '2024-01-25',
    multiplier: 2,
    slices: 1000,
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
  },
  // Carol: $5,000 cash × 4 = 20,000 slices
  {
    id: 'contrib-5',
    contributorId: 'sample-carol',
    type: 'cash',
    value: 5000,
    description: 'Seed investment for initial operations',
    date: '2024-02-01',
    multiplier: 4,
    slices: 20000,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  // Alice: Idea contribution = 2,000 slices (negotiated)
  {
    id: 'contrib-6',
    contributorId: 'sample-alice',
    type: 'idea',
    value: 2000,
    description: 'Original product concept and business model',
    date: '2024-01-01',
    multiplier: 1,
    slices: 2000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

/**
 * Sample data summary:
 *
 * Total Slices: 48,500
 *
 * Alice Developer:
 *   - Time: 40 hrs + 20 hrs @ $150/hr × 2 = 18,000 slices
 *   - Idea: 2,000 slices
 *   - Total: 20,000 slices (41.2%)
 *
 * Bob Designer:
 *   - Time: 30 hrs @ $125/hr × 2 = 7,500 slices
 *   - Non-cash: $500 × 2 = 1,000 slices
 *   - Total: 8,500 slices (17.5%)
 *
 * Carol Investor:
 *   - Cash: $5,000 × 4 = 20,000 slices
 *   - Total: 20,000 slices (41.2%)
 */

export function isSampleData(contributorIds: string[]): boolean {
  const sampleIds = SAMPLE_CONTRIBUTORS.map(c => c.id);
  return contributorIds.some(id => sampleIds.includes(id));
}

export function getSampleDataSummary() {
  const totalSlices = SAMPLE_CONTRIBUTIONS.reduce((sum, c) => sum + c.slices, 0);

  return {
    totalSlices,
    contributorCount: SAMPLE_CONTRIBUTORS.length,
    contributionCount: SAMPLE_CONTRIBUTIONS.length,
  };
}
