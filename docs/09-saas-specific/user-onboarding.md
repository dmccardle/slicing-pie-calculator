# User Onboarding

## Overview

This document defines onboarding patterns for SaaS applications. Effective onboarding reduces time-to-value, improves activation rates, and increases long-term retention.

**CRITICAL:** Onboarding is the most important factor in trial-to-paid conversion. Users who complete onboarding are 3-5x more likely to convert.

---

## TL;DR (2-Minute Read) {#tldr}

**Critical Requirements:**
- **Welcome wizard**: Multi-step onboarding for complex setup (see [Wizard Implementation](#wizard))
- **Progress tracking**: Show completion percentage, save progress (see [Progress Tracking](#progress-tracking))
- **Sample data**: Pre-populate with examples to show product value (see [Sample Data](#sample-data))
- **Interactive tutorials**: Tooltips, walkthroughs, product tours (see [Interactive Tutorials](#tutorials))
- **Completion checklist**: Track onboarding tasks, encourage completion (see [Checklists](#checklists))

**Quick Example:**
```typescript
// GOOD - Multi-step wizard with progress tracking
const wizard = {
  steps: ['welcome', 'profile', 'team', 'integration', 'first_project'],
  current: 2,
  completed: ['welcome', 'profile'],
  progress: 40, // 2/5 steps
  canSkip: ['team', 'integration'] // Optional steps
};

// Generate sample data to show value immediately
await createSampleProject(user);
```

**Key Patterns:**
| Pattern | Use When | Completion Goal |
|---------|----------|-----------------|
| Welcome Wizard | Complex setup | 60%+ |
| Interactive Tutorial | Feature-rich UI | 70%+ |
| Checklist | Ongoing tasks | 80%+ |
| Email Sequence | Multi-day activation | 40%+ open rate |

**Key Sections:**
- [Wizard Implementation](#wizard) - Step-by-step onboarding UI
- [Progress Tracking](#progress-tracking) - Save and restore wizard state
- [Sample Data](#sample-data) - Pre-populate to demonstrate value
- [Analytics & Optimization](#analytics) - Track and improve completion rates

---

## Onboarding Goals {#goals}

### Primary Goals

1. **Activate users quickly** - Get them to "aha moment" in < 5 minutes
2. **Demonstrate value** - Show clear benefit of your product
3. **Build habit** - Encourage daily/weekly use
4. **Reduce churn** - Properly onboarded users don't cancel

### Key Metrics

```typescript
// Track these onboarding metrics
const ONBOARDING_METRICS = {
  timeToActivation: 'Time from signup to first value (goal: < 5 min)',
  completionRate: 'Percentage who complete onboarding (goal: > 60%)',
  dropoffPoints: 'Where users abandon onboarding',
  activationRate: 'Users who reach "aha moment" (goal: > 40%)',
  timeToFirstAction: 'Time until first meaningful action',
};
```

---

## Onboarding Flow Types

### 1. Welcome Wizard (Multi-Step)

**Use for:** Complex products requiring configuration

```typescript
// Example: 5-step wizard
const WIZARD_STEPS = [
  { id: 'welcome', title: 'Welcome', required: true },
  { id: 'profile', title: 'Set up profile', required: true },
  { id: 'team', title: 'Invite team', required: false },
  { id: 'integration', title: 'Connect tools', required: false },
  { id: 'first_project', title: 'Create project', required: true },
];
```

### 2. Progressive Onboarding

**Use for:** Simple products, learn-as-you-go

```typescript
// Show tips contextually as user explores
const PROGRESSIVE_TIPS = {
  dashboard: 'Create your first project to get started',
  project_list: 'Projects organize your work. Create one now!',
  empty_state: 'No data yet. Import sample data to see how it works',
};
```

### 3. Hybrid Approach

**Use for:** Most SaaS products

```typescript
// Quick wizard (2-3 steps) + progressive tips
const HYBRID_ONBOARDING = {
  wizard: ['welcome', 'profile'], // Quick setup
  progressive: ['team_invite', 'integrations', 'advanced_features'], // Learn later
};
```

---

## Wizard Implementation {#wizard}

### Database Schema

```typescript
// prisma/schema.prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String

  // Onboarding tracking
  onboardingStatus     OnboardingStatus @default(NOT_STARTED)
  onboardingStartedAt  DateTime?
  onboardingCompletedAt DateTime?
  onboardingStepIndex  Int @default(0)
  onboardingSkippedSteps String[] @default([])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum OnboardingStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  SKIPPED
}
```

### Wizard Component (React)

```typescript
// components/onboarding/OnboardingWizard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

const STEPS = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'profile', title: 'Profile', component: ProfileStep },
  { id: 'team', title: 'Team', component: TeamStep, optional: true },
  { id: 'first_project', title: 'First Project', component: ProjectStep },
] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [skippedSteps, setSkippedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (currentStep === 0) {
      trackEvent('Onboarding Started');
    }
  }, []);

  const nextStep = async (data?: any) => {
    const step = STEPS[currentStep];

    // Save step data
    if (data) {
      await saveStepData(step.id, data);
    }

    // Track completion
    trackEvent('Onboarding Step Completed', {
      step: step.id,
      step_number: currentStep + 1,
      total_steps: STEPS.length,
    });

    // Move to next step or complete
    if (currentStep === STEPS.length - 1) {
      await completeOnboarding();
    } else {
      setCurrentStep(currentStep + 1);
      await updateUserProgress(currentStep + 1);
    }
  };

  const skipStep = async () => {
    const step = STEPS[currentStep];

    if (!step.optional) {
      return; // Can't skip required steps
    }

    setSkippedSteps([...skippedSteps, step.id]);

    trackEvent('Onboarding Step Skipped', {
      step: step.id,
      step_number: currentStep + 1,
    });

    if (currentStep === STEPS.length - 1) {
      await completeOnboarding();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    await fetch('/api/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify({ skippedSteps }),
    });

    trackEvent('Onboarding Completed', {
      total_steps: STEPS.length,
      skipped_steps: skippedSteps,
    });

    router.push('/dashboard');
  };

  const Step = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current step */}
        <Step onNext={nextStep} onSkip={skipStep} onBack={previousStep} />

        {/* Step indicators */}
        <div className="mt-8 flex justify-center space-x-2">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`
                w-2 h-2 rounded-full transition-colors
                ${index < currentStep ? 'bg-green-500' : ''}
                ${index === currentStep ? 'bg-blue-600' : ''}
                ${index > currentStep ? 'bg-gray-300' : ''}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Individual Step Components

```typescript
// components/onboarding/steps/ProfileStep.tsx
export function ProfileStep({ onNext, onBack }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    onNext({ name, company, role });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Tell us about yourself</h2>
      <p className="text-gray-600">
        This helps us personalize your experience
      </p>

      <div>
        <label className="block text-sm font-medium mb-2">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Company</label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Your Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        >
          <option value="">Select your role</option>
          <option value="founder">Founder/CEO</option>
          <option value="engineer">Engineer</option>
          <option value="designer">Designer</option>
          <option value="product">Product Manager</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
```

---

## Progress Tracking {#progress-tracking}

### Backend API

```typescript
// src/app/api/onboarding/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      onboardingStatus: true,
      onboardingStepIndex: true,
      onboardingSkippedSteps: true,
    },
  });

  return NextResponse.json(user);
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const { stepIndex, status } = await req.json();

  await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingStepIndex: stepIndex,
      onboardingStatus: status || 'IN_PROGRESS',
    },
  });

  return NextResponse.json({ success: true });
}
```

### Complete Onboarding Endpoint

```typescript
// src/app/api/onboarding/complete/route.ts
export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const { skippedSteps } = await req.json();

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingStatus: 'COMPLETED',
      onboardingCompletedAt: new Date(),
      onboardingSkippedSteps: skippedSteps || [],
    },
  });

  // Track in analytics
  trackEvent('Onboarding Completed', {
    user_id: userId,
    time_taken: Date.now() - user.onboardingStartedAt?.getTime(),
    skipped_steps: skippedSteps,
  });

  // Send welcome email
  await sendWelcomeEmail(user.email, user.name);

  return NextResponse.json({ success: true });
}
```

### Resume Onboarding

```typescript
// components/ResumeOnboarding.tsx
export function ResumeOnboardingBanner() {
  const { user } = useUser();

  if (user?.onboardingStatus !== 'IN_PROGRESS') {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-blue-900">
            Complete your setup
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            You're {user.onboardingStepIndex} steps away from getting started
          </p>
        </div>
        <Link
          href="/onboarding"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Resume Setup
        </Link>
      </div>
    </div>
  );
}
```

---

## Sample Data Generation {#sample-data}

**CRITICAL:** Sample data helps users see value immediately without manual work.

### Sample Data Strategy

```typescript
// src/services/onboarding/sample-data.service.ts
export async function generateSampleData(userId: string, tenantId: string) {
  // 1. Create sample projects
  const sampleProjects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Sample Project: Q1 Marketing Campaign',
        description: 'This is an example project to help you get started',
        tenantId,
        ownerId: userId,
        status: 'active',
        dueDate: addDays(new Date(), 30),
      },
    }),
    prisma.project.create({
      data: {
        name: 'Sample Project: Product Launch',
        description: 'Another example to show project management features',
        tenantId,
        ownerId: userId,
        status: 'planning',
        dueDate: addDays(new Date(), 60),
      },
    }),
  ]);

  // 2. Create sample tasks
  await Promise.all(
    sampleProjects.map((project, index) =>
      Promise.all([
        prisma.task.create({
          data: {
            title: 'Review requirements',
            projectId: project.id,
            assigneeId: userId,
            status: 'completed',
            priority: 'high',
          },
        }),
        prisma.task.create({
          data: {
            title: 'Create timeline',
            projectId: project.id,
            assigneeId: userId,
            status: 'in_progress',
            priority: 'medium',
          },
        }),
        prisma.task.create({
          data: {
            title: 'Schedule kickoff meeting',
            projectId: project.id,
            status: 'todo',
            priority: 'low',
          },
        }),
      ])
    )
  );

  // 3. Track sample data creation
  trackEvent('Sample Data Generated', {
    user_id: userId,
    tenant_id: tenantId,
    projects_count: sampleProjects.length,
    tasks_count: 6,
  });

  return { projects: sampleProjects };
}
```

### Offering Sample Data in Onboarding

```typescript
// components/onboarding/steps/SampleDataStep.tsx
export function SampleDataStep({ onNext, onSkip }) {
  const [loading, setLoading] = useState(false);

  const handleGenerateSample = async () => {
    setLoading(true);

    await fetch('/api/onboarding/sample-data', {
      method: 'POST',
    });

    setLoading(false);
    onNext({ usedSampleData: true });
  };

  const handleSkip = () => {
    onNext({ usedSampleData: false });
  };

  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
        <DocumentIcon className="w-8 h-8 text-blue-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Want to try it out?</h2>
        <p className="text-gray-600">
          We can create sample projects and tasks so you can see how everything works
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-left">
        <h3 className="font-medium mb-3">We'll create:</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center">
            <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
            2 sample projects
          </li>
          <li className="flex items-center">
            <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
            6 example tasks with different statuses
          </li>
          <li className="flex items-center">
            <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
            Demo timeline and milestones
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          You can delete these anytime
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSkip}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          I'll create my own
        </button>
        <button
          onClick={handleGenerateSample}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Sample Data'}
        </button>
      </div>
    </div>
  );
}
```

---

## Interactive Tutorials {#tutorials}

### Tooltip Tour

```typescript
// components/TutorialTooltip.tsx
'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const TUTORIAL_STEPS = [
  {
    target: '[data-tutorial="create-project"]',
    title: 'Create Your First Project',
    content: 'Click here to create a new project and start organizing your work',
    position: 'bottom',
  },
  {
    target: '[data-tutorial="invite-team"]',
    title: 'Invite Your Team',
    content: 'Collaborate with your team by inviting them to your workspace',
    position: 'bottom',
  },
  {
    target: '[data-tutorial="settings"]',
    title: 'Customize Settings',
    content: 'Configure your workspace preferences and integrations',
    position: 'left',
  },
];

export function TutorialTooltip() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useLocalStorage('tutorial-completed', false);

  if (completed || currentStep >= TUTORIAL_STEPS.length) {
    return null;
  }

  const step = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep === TUTORIAL_STEPS.length - 1) {
      setCompleted(true);
      trackEvent('Tutorial Completed');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    setCompleted(true);
    trackEvent('Tutorial Skipped', { step: currentStep + 1 });
  };

  return (
    <Tooltip target={step.target} position={step.position}>
      <div className="p-4 bg-white rounded-lg shadow-lg max-w-xs">
        <div className="mb-2 text-xs text-gray-500">
          Step {currentStep + 1} of {TUTORIAL_STEPS.length}
        </div>
        <h3 className="font-semibold mb-2">{step.title}</h3>
        <p className="text-sm text-gray-700 mb-4">{step.content}</p>
        <div className="flex justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip tour
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            {currentStep === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </Tooltip>
  );
}
```

---

## Email Sequences

### Welcome Email Series

```typescript
// src/services/email/onboarding-emails.ts
export async function sendOnboardingEmails(userId: string) {
  const user = await getUser(userId);

  // Email 1: Immediate welcome (sent on signup)
  await sendEmail({
    to: user.email,
    subject: 'Welcome to [Product]! ',
    template: 'welcome',
    data: {
      name: user.name,
      dashboardUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
      helpUrl: `${process.env.NEXT_PUBLIC_URL}/help`,
    },
  });

  // Email 2: Day 1 - Tips (if onboarding not completed)
  await scheduleEmail({
    to: user.email,
    subject: 'Getting the most out of [Product]',
    template: 'day-1-tips',
    delay: '24 hours',
    condition: () => user.onboardingStatus !== 'COMPLETED',
  });

  // Email 3: Day 3 - Feature highlight
  await scheduleEmail({
    to: user.email,
    subject: '3 features you might have missed',
    template: 'feature-highlight',
    delay: '72 hours',
  });

  // Email 4: Day 7 - Trial reminder
  await scheduleEmail({
    to: user.email,
    subject: 'Your trial ends in 7 days',
    template: 'trial-reminder',
    delay: '168 hours',
    condition: () => user.subscriptionStatus === 'TRIALING',
  });
}
```

---

## Checklists {#checklists}

### Persistent Checklist Component

```typescript
// components/OnboardingChecklist.tsx
const CHECKLIST_ITEMS = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add your name and company details',
    action: '/settings/profile',
    check: (user) => user.name && user.company,
  },
  {
    id: 'first_project',
    title: 'Create your first project',
    description: 'Get started by creating a project',
    action: '/projects/new',
    check: (user, tenant) => tenant.projectsCount > 0,
  },
  {
    id: 'invite_team',
    title: 'Invite your team',
    description: 'Collaborate with your teammates',
    action: '/settings/team',
    check: (user, tenant) => tenant.membersCount > 1,
  },
  {
    id: 'connect_integration',
    title: 'Connect an integration',
    description: 'Sync with your favorite tools',
    action: '/settings/integrations',
    check: (user, tenant) => tenant.integrationsCount > 0,
  },
];

export function OnboardingChecklist() {
  const { user, tenant } = useAuth();
  const [dismissed, setDismissed] = useLocalStorage('checklist-dismissed', false);

  const completed = CHECKLIST_ITEMS.filter((item) => item.check(user, tenant));
  const progress = (completed.length / CHECKLIST_ITEMS.length) * 100;

  if (dismissed || progress === 100) {
    return null;
  }

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Getting Started</h3>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">
            {completed.length} of {CHECKLIST_ITEMS.length} complete
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => {
          const isComplete = item.check(user, tenant);

          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                isComplete ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="mt-0.5">
                {isComplete ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <CircleIcon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className={isComplete ? 'line-through text-gray-500' : ''}>
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
                </div>
                {!isComplete && (
                  <Link
                    href={item.action}
                    className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block"
                  >
                    Complete this step →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Analytics & Optimization {#analytics}

### Track Onboarding Metrics

```typescript
// Track at each step
posthog.capture('Onboarding Step Viewed', {
  step: 'profile_setup',
  step_number: 2,
});

posthog.capture('Onboarding Step Completed', {
  step: 'profile_setup',
  step_number: 2,
  time_spent: 45, // seconds
});

posthog.capture('Onboarding Step Skipped', {
  step: 'team_invite',
  step_number: 3,
});

// Create funnel in PostHog
// "Onboarding Started" → "Step 1 Completed" → "Step 2 Completed" → ...
// See drop-off at each step
```

### A/B Test Onboarding Flows

```typescript
// Test different onboarding flows
const variant = posthog.getFeatureFlag('onboarding-flow');

if (variant === 'wizard') {
  return <OnboardingWizard />;
} else if (variant === 'checklist') {
  return <OnboardingChecklist />;
} else {
  return <ProgressiveOnboarding />;
}

// Track which converts better
posthog.capture('Onboarding Flow Assigned', { variant });
```

---

## Best Practices

### Do's

- **Keep it short** - Aim for 3-5 steps maximum
- **Show progress** - Users need to see how far they've come
- **Allow skipping** - Don't force users through everything
- **Provide value early** - Get to "aha moment" quickly (< 5 min)
- **Use sample data** - Help users see value without effort
- **Save progress** - Allow resume later
- **Track drop-off** - Analyze where users abandon
- **Make it optional** - Power users can skip entirely

### Don'ts

- **Don't block access** - Let users explore even if incomplete
- **Don't ask for everything** - Collect data progressively
- **Don't make all steps required** - Only require critical setup
- **Don't use vague copy** - Be specific about what each step does
- **Don't ignore mobile** - Onboarding must work on all devices
- **Don't forget analytics** - You can't optimize what you don't measure

---

## Checklist

Before launching onboarding:

- [ ] Onboarding wizard implemented (or checklist/progressive)
- [ ] Progress tracking in database (save state)
- [ ] Resume onboarding banner shown if incomplete
- [ ] Sample data generation available
- [ ] Welcome email sent on signup
- [ ] Onboarding email sequence scheduled
- [ ] Interactive tutorial/tooltips (optional but recommended)
- [ ] Persistent checklist component (for dashboards)
- [ ] All steps tracked in analytics
- [ ] Funnel created in PostHog (to identify drop-off)
- [ ] A/B tests configured (optional)
- [ ] Mobile-responsive (test all steps on phone)
- [ ] Skip functionality works
- [ ] Back/previous step works
- [ ] "Mark as complete" if user manually does steps
- [ ] Clear "aha moment" within first 5 minutes

---

## Related Documentation

**Prerequisites:**
- `docs/09-saas-specific/saas-architecture.md` - Multi-tenancy context
- `docs/09-saas-specific/user-management-rbac.md` - Role-based onboarding

**Related Topics:**
- `docs/08-analytics/analytics.md` - Tracking onboarding events
- `docs/04-frontend/user-feedback.md` - Collecting onboarding feedback
- `docs/09-saas-specific/subscription-billing.md` - Trial conversion

**Next Steps:**
- Design onboarding flow for your product
- Implement first 3 critical steps
- Set up analytics funnel
- Create sample data for new users

---

**Last Updated:** 2025-12-22
**Estimated Read Time:** 30 minutes
**Complexity:** Intermediate
