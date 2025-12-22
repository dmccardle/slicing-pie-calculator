# Internationalization (i18n) Rules

## Overview

All frontend, mobile, and GUI applications **must** support multiple languages from day one.

---

## Required Languages

### Core Languages (Always Required)

1. **English (Canadian)** - `en-CA`
2. **English (American)** - `en-US`
3. **English (UK)** - `en-GB`
4. **Dutch** - `nl-NL`
5. **French (Canadian)** - `fr-CA`
6. **French (France)** - `fr-FR`
7. **German** - `de-DE`
8. **Spanish** - `es` (see note below)
9. **Portuguese** - `pt` (see note below)

### Spanish Variants

**Question**: Are "Spain" and "Latin American" Spanish different?

**Answer**: Yes, they have differences in vocabulary, pronunciation, and some grammar:
- **Spain Spanish** (`es-ES`): Used in Spain, uses "vosotros" form
- **Latin American Spanish** (`es-419`): Used across Latin America, more uniform

**Recommendation**: Start with **Latin American Spanish (`es-419`)** as it covers the larger market (Mexico, Central/South America). Add Spain Spanish (`es-ES`) later if needed.

### Portuguese Variants

**Question**: Are Portugal and Brazil Portuguese different?

**Answer**: Yes, they have significant differences:
- **Brazilian Portuguese** (`pt-BR`): Used in Brazil (larger market, ~210M people)
- **European Portuguese** (`pt-PT`): Used in Portugal (~10M people)

**Recommendation**: Start with **Brazilian Portuguese (`pt-BR`)** as it covers the larger market. Add European Portuguese (`pt-PT`) later if targeting Portugal specifically.

---

## Implementation

### Next.js (Web Apps)

**Library**: `next-intl`

**Official Docs**: https://next-intl-docs.vercel.app/

**Why next-intl**:
- Built for Next.js App Router
- Type-safe translations
- Server and client component support
- Automatic locale detection
- SEO-friendly

**Installation**:

```bash
npm install next-intl
```

**Setup**:

```typescript
// i18n.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));

// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en-CA', 'en-US', 'en-GB', 'nl-NL', 'fr-CA', 'fr-FR', 'de-DE', 'es-419', 'pt-BR'],
  defaultLocale: 'en-CA'
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};

// next.config.js
const withNextIntl = require('next-intl/plugin')();

module.exports = withNextIntl({
  // your next config
});
```

**Usage**:

```typescript
// Server Component
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}

// Client Component
'use client';
import { useTranslations } from 'next-intl';

export default function LoginForm() {
  const t = useTranslations('LoginForm');

  return (
    <form>
      <input placeholder={t('emailPlaceholder')} />
      <button>{t('submitButton')}</button>
    </form>
  );
}
```

**Translation Files Structure**:

```
messages/
├── en-CA.json
├── en-US.json
├── en-GB.json
├── nl-NL.json
├── fr-CA.json
├── fr-FR.json
├── de-DE.json
├── es-419.json  # Latin American Spanish
└── pt-BR.json   # Brazilian Portuguese
```

**Example Translation File**:

```json
// messages/en-CA.json
{
  "HomePage": {
    "title": "Welcome to TaskMaster Pro",
    "description": "Manage your tasks efficiently"
  },
  "LoginForm": {
    "emailPlaceholder": "Email address",
    "passwordPlaceholder": "Password",
    "submitButton": "Sign in",
    "forgotPassword": "Forgot password?"
  },
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "confirm": "Confirm"
  }
}

// messages/fr-CA.json
{
  "HomePage": {
    "title": "Bienvenue à TaskMaster Pro",
    "description": "Gérez vos tâches efficacement"
  },
  "LoginForm": {
    "emailPlaceholder": "Adresse courriel",
    "passwordPlaceholder": "Mot de passe",
    "submitButton": "Se connecter",
    "forgotPassword": "Mot de passe oublié?"
  },
  "common": {
    "loading": "Chargement...",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "confirm": "Confirmer"
  }
}
```

---

### Expo/React Native (Mobile Apps)

**Library**: `react-i18next` + `expo-localization`

**Official Docs**:
- https://react.i18next.com/
- https://docs.expo.dev/versions/latest/sdk/localization/

**Why react-i18next**:
- Most popular i18n library for React Native
- Works well with Expo
- Async translation loading
- TypeScript support

**Installation**:

```bash
npx expo install expo-localization
npm install i18next react-i18next
```

**Setup**:

```typescript
// i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import enCA from './locales/en-CA.json';
import enUS from './locales/en-US.json';
import frCA from './locales/fr-CA.json';
// ... import other languages

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'en-CA': { translation: enCA },
      'en-US': { translation: enUS },
      'fr-CA': { translation: frCA },
      // ... other languages
    },
    lng: Localization.locale, // Device language
    fallbackLng: 'en-CA',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

// App.tsx
import './i18n/config';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { t, i18n } = useTranslation();

  return (
    <View>
      <Text>{t('welcome')}</Text>
      <Button
        title={t('changeLanguage')}
        onPress={() => i18n.changeLanguage('fr-CA')}
      />
    </View>
  );
}
```

**Usage**:

```typescript
import { useTranslation } from 'react-i18next';

export function LoginScreen() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('login.title')}</Text>
      <TextInput placeholder={t('login.emailPlaceholder')} />
      <TextInput placeholder={t('login.passwordPlaceholder')} />
      <Button title={t('login.submitButton')} onPress={handleLogin} />
    </View>
  );
}
```

**Translation Files Structure**:

```
i18n/
└── locales/
    ├── en-CA.json
    ├── en-US.json
    ├── en-GB.json
    ├── nl-NL.json
    ├── fr-CA.json
    ├── fr-FR.json
    ├── de-DE.json
    ├── es-419.json
    └── pt-BR.json
```

---

## Translation Best Practices

### 1. Namespace Your Translations

Organize translations by feature/page:

```json
{
  "common": { ... },
  "auth": { ... },
  "dashboard": { ... },
  "settings": { ... }
}
```

### 2. Use Interpolation for Dynamic Values

```json
{
  "welcome": "Welcome back, {{name}}!",
  "itemCount": "You have {{count}} items"
}
```

```typescript
t('welcome', { name: user.name })
t('itemCount', { count: items.length })
```

### 3. Handle Pluralization

```json
{
  "tasks": {
    "one": "You have 1 task",
    "other": "You have {{count}} tasks",
    "zero": "You have no tasks"
  }
}
```

```typescript
t('tasks', { count: taskCount })
```

### 4. Date and Number Formatting

Use `Intl` API for locale-aware formatting:

```typescript
// Dates
const dateFormatter = new Intl.DateTimeFormat(locale, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
dateFormatter.format(new Date()); // "December 21, 2024" (en-CA)

// Numbers
const numberFormatter = new Intl.NumberFormat(locale);
numberFormatter.format(1234567.89); // "1,234,567.89" (en-CA)

// Currency
const currencyFormatter = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: 'CAD'
});
currencyFormatter.format(49.99); // "$49.99" (en-CA)
```

### 5. Never Hardcode Text

**Bad**:
```typescript
<button>Save</button>
<p>Welcome to our app</p>
```

**Good**:
```typescript
<button>{t('common.save')}</button>
<p>{t('welcome.message')}</p>
```

### 6. Keep Keys Organized

Use dot notation for hierarchy:

```json
{
  "auth.login.title": "Sign In",
  "auth.login.email": "Email",
  "auth.login.password": "Password",
  "auth.signup.title": "Create Account"
}
```

---

## Language Switcher

### Next.js Language Switcher

```typescript
'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

const languages = [
  { code: 'en-CA', name: 'English (Canada)' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'fr-CA', name: 'Français (Canada)' },
  { code: 'de-DE', name: 'Deutsch' },
  // ... more languages
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (newLocale: string) => {
    router.push(pathname.replace(`/${locale}`, `/${newLocale}`));
  };

  return (
    <select value={locale} onChange={(e) => handleChange(e.target.value)}>
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### Expo/React Native Language Switcher

```typescript
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';

const languages = [
  { code: 'en-CA', name: 'English (Canada)' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'fr-CA', name: 'Français (Canada)' },
  // ... more languages
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <Picker
      selectedValue={i18n.language}
      onValueChange={(lang) => i18n.changeLanguage(lang)}
    >
      {languages.map((lang) => (
        <Picker.Item key={lang.code} label={lang.name} value={lang.code} />
      ))}
    </Picker>
  );
}
```

---

## Translation Management

### Getting Translations

**Options**:

1. **Professional Translation Services**:
   - [Lokalise](https://lokalise.com/) - Translation management platform
   - [Phrase](https://phrase.com/) - Localization platform
   - [DeepL](https://www.deepl.com/) - AI translation (very accurate)

2. **Crowdsourced**:
   - [Crowdin](https://crowdin.com/) - Community translations

3. **In-house**:
   - Hire translators for each language
   - Native speakers on the team

**Recommendation**: Start with DeepL for initial translations, then have native speakers review and refine.

### Translation Workflow

1. **Develop in English (Canadian)** - primary language
2. **Extract all strings** to translation files
3. **Send to translation service** or use DeepL
4. **Review translations** with native speakers
5. **Test in each language** to ensure UI fits
6. **Update translations** as features are added

---

## Testing i18n

### Checklist

- [ ] All text is translatable (no hardcoded strings)
- [ ] UI doesn't break with longer text (German is typically 30% longer)
- [ ] Date/time formats are correct for each locale
- [ ] Number/currency formats are correct
- [ ] Pluralization works correctly
- [ ] RTL languages work (if supporting Arabic/Hebrew in future)
- [ ] Language switcher is accessible
- [ ] Default language is detected correctly

### Tools

- **i18n Ally** (VS Code extension) - Visual editor for translations
- **next-intl DevTools** - Debug translations in Next.js
- **React DevTools** - Check current language in React Native

---

## SEO Considerations (Next.js)

### Language Tags in HTML

```typescript
// app/layout.tsx
export default function RootLayout({ children, params: { locale } }) {
  return (
    <html lang={locale}>
      <head>
        <link rel="alternate" hrefLang="en-CA" href="https://example.com/en-CA" />
        <link rel="alternate" hrefLang="en-US" href="https://example.com/en-US" />
        <link rel="alternate" hrefLang="fr-CA" href="https://example.com/fr-CA" />
        {/* ... more languages */}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### URL Structure

**Recommended**: Locale in path

```
example.com/en-CA/dashboard
example.com/fr-CA/dashboard
example.com/de-DE/dashboard
```

This is SEO-friendly and makes language switching clear.

---

## Locale Storage

### Next.js

Store user's preferred locale in cookie:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en-CA';
  // ... routing logic
}
```

### React Native

Store in AsyncStorage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save locale
await AsyncStorage.setItem('userLocale', 'fr-CA');

// Load locale on app start
const savedLocale = await AsyncStorage.getItem('userLocale');
if (savedLocale) {
  i18n.changeLanguage(savedLocale);
}
```

---

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [react-i18next Documentation](https://react.i18next.com/)
- [Expo Localization](https://docs.expo.dev/versions/latest/sdk/localization/)
- [Intl API (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [Unicode CLDR](http://cldr.unicode.org/) - Locale data
- [BCP 47 Language Tags](https://www.w3.org/International/articles/language-tags/) - Locale codes

---

## Summary

### Required Locales

| Language | Code | Priority |
|----------|------|----------|
| English (Canadian) | `en-CA` | Primary |
| English (American) | `en-US` | High |
| English (UK) | `en-GB` | High |
| Dutch | `nl-NL` | High |
| French (Canadian) | `fr-CA` | High |
| French (France) | `fr-FR` | High |
| German | `de-DE` | High |
| Spanish (Latin America) | `es-419` | High |
| Portuguese (Brazil) | `pt-BR` | High |

### Optional (Add Later)

| Language | Code | When to Add |
|----------|------|-------------|
| Spanish (Spain) | `es-ES` | If targeting Spain market |
| Portuguese (Portugal) | `pt-PT` | If targeting Portugal market |
| Italian | `it-IT` | If expanding to Italy |
| Japanese | `ja-JP` | If expanding to Japan |
| Chinese (Simplified) | `zh-CN` | If expanding to China |

### Implementation Checklist

- [ ] Install i18n library (next-intl or react-i18next)
- [ ] Create translation files for all 9 required languages
- [ ] Implement language switcher
- [ ] Extract all hardcoded strings to translation files
- [ ] Set up locale detection
- [ ] Store user's language preference
- [ ] Test with all languages
- [ ] Ensure UI handles longer text (German test)
- [ ] Implement date/time/number formatting
- [ ] Add SEO language tags (Next.js)

---

## Related Documentation

**SaaS Essentials**:
- [SaaS Architecture](./saas-architecture.md) - Multi-tenancy, feature flags
- [Subscription Billing](./subscription-billing.md) - Stripe integration, plans
- [User Management & RBAC](./user-management-rbac.md) - Roles, permissions
- [User Onboarding](./user-onboarding.md) - Wizards, tutorials, checklists
- [Internationalization](./internationalization.md) - i18n, l10n
- [AI Development Workflow](./ai-development-workflow.md) - AI-assisted development

**Core Rules**:
- [API Design](../rules/api-design.md) - Multi-tenant API patterns
- [Security & Privacy](../rules/security-privacy.md) - Data isolation, GDPR

**Practical Resources**:
- [API Endpoint Template](../templates/api-endpoint-template.ts) - Multi-tenant API boilerplate
- [Database Migration Template](../templates/database-migration-template.sql) - RLS setup

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All SaaS Docs](./)

