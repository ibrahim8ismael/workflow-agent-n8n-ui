# Dashboard Internationalization (i18n) Architecture

## Overview

This document defines the internationalization (i18n) architecture for the **Woops Dashboard**.

Unlike the public website, the dashboard is an authenticated SaaS application where language is considered a **user preference**, not part of the URL structure.

The dashboard **must not** use route-based localization such as:

```text
/en/dashboard
/ar/dashboard
```

Instead, every authenticated route remains unchanged:

```text
/dashboard
/settings
/agents
/conversations
```

The selected language is stored as part of the user's preferences and applied globally throughout the application.

---

# Goals

## Primary Goals

* Support multiple languages.
* Allow users to switch languages instantly.
* Persist language between sessions.
* Synchronize language across devices.
* Fully support RTL layouts.
* Keep URLs clean and language-independent.
* Make adding new languages simple.

---

# Supported Languages

Initial release:

| Language | Code | Direction |
| -------- | ---- | --------- |
| English  | en   | LTR       |
| Arabic   | ar   | RTL       |

The architecture should support future languages without code changes to existing components.

Example:

* French
* Turkish
* Spanish
* German

Adding a language should only require:

1. Creating translation files.
2. Registering the language.
3. Adding it to the language selector.

No component refactoring should be necessary.

---

# Why We Don't Use Route-Based Localization

The dashboard is not indexed by search engines.

Users stay authenticated during their session.

Language is part of the user profile rather than navigation.

Using route prefixes would introduce unnecessary complexity:

* Duplicate routes
* Extra middleware
* Redirect handling
* Locale-aware navigation
* SEO features that provide no value inside the dashboard

Therefore the application always uses:

```text
/dashboard
```

instead of

```text
/ar/dashboard
```

---

# Recommended Technology

## Translation Engine

Use:

* i18next
* react-i18next

Reasons:

* Mature ecosystem
* Excellent TypeScript support
* Namespace support
* Lazy loading
* Interpolation
* Pluralization
* RTL support
* React integration
* Widely adopted

---

# High-Level Architecture

```text
App
│
├── I18nProvider
│
├── LanguageProvider
│       │
│       ├── currentLanguage
│       ├── direction
│       ├── changeLanguage()
│       └── persistence
│
├── Dashboard Layout
│
└── Feature Components
        │
        └── useTranslation()
```

The application should initialize i18n before rendering the dashboard.

---

# Folder Structure

```text
src/

├── i18n/
│
│   ├── config.ts
│   ├── index.ts
│   ├── language.ts
│   │
│   └── locales/
│
│       ├── en/
│       │
│       │   ├── common.json
│       │   ├── sidebar.json
│       │   ├── agents.json
│       │   ├── conversations.json
│       │   ├── settings.json
│       │   ├── billing.json
│       │   ├── knowledge.json
│       │   └── auth.json
│       │
│       └── ar/
│
│           ├── common.json
│           ├── sidebar.json
│           ├── agents.json
│           ├── conversations.json
│           ├── settings.json
│           ├── billing.json
│           ├── knowledge.json
│           └── auth.json
│
├── providers/
│
│   └── LanguageProvider.tsx
│
├── hooks/
│
│   └── useLanguage.ts
│
└── components/
```

---

# Translation Organization

Never place every translation inside one giant file.

Instead organize by feature.

Example:

```text
sidebar.json
```

```json
{
  "dashboard": "Dashboard",
  "agents": "Agents",
  "knowledge": "Knowledge",
  "settings": "Settings"
}
```

Arabic:

```json
{
  "dashboard": "لوحة التحكم",
  "agents": "الوكلاء",
  "knowledge": "قاعدة المعرفة",
  "settings": "الإعدادات"
}
```

Each feature owns its own translation namespace.

Benefits:

* Easier maintenance
* Smaller bundles
* Better scalability
* Cleaner ownership

---

# Translation Usage

Never hardcode visible text.

❌ Bad

```tsx
<Button>Save</Button>
```

✅ Good

```tsx
<Button>{t("save")}</Button>
```

Example:

```tsx
const { t } = useTranslation("common");
```

Every user-facing string must come from the translation system.

---

# Language State Management

Language exists in three locations.

---

## 1. React Context

Stores the active language.

Example:

```text
currentLanguage
```

Purpose:

* Instant updates
* Re-render UI
* No page refresh

---

## 2. Local Storage

```text
woops.language
```

Example:

```text
ar
```

Purpose:

* Remember language after refresh
* Instant initialization before API calls
* Offline persistence

---

## 3. User Profile

Database:

```text
users

language
---------
en
ar
```

Purpose:

* Synchronize across browsers
* Synchronize across devices
* User preference persistence

---

# Language Initialization Flow

Application startup:

```text
Application Starts

↓

Read Local Storage

↓

Initialize i18next

↓

Render Loading Screen

↓

Authenticate User

↓

Fetch User Profile

↓

Compare Stored Language

↓

If Different

↓

Update i18next

↓

Render Dashboard
```

The user should never see language flickering.

---

# Language Switching Flow

```text
User Opens Language Menu

↓

Select Arabic

↓

LanguageProvider updates state

↓

i18next.changeLanguage("ar")

↓

Update HTML lang attribute

↓

Update HTML dir attribute

↓

Save Local Storage

↓

PATCH /me/preferences

↓

API Success

↓

Done
```

The UI should switch immediately.

Do **not** wait for the server response.

---

# HTML Attributes

The application must update the root HTML element.

English:

```html
<html lang="en" dir="ltr">
```

Arabic:

```html
<html lang="ar" dir="rtl">
```

These attributes improve:

* Accessibility
* Browser rendering
* Screen readers
* RTL layout

---

# RTL Support

Arabic requires full RTL compatibility.

Changing language should automatically change layout direction.

Examples:

LTR

```text
Sidebar | Content
```

RTL

```text
Content | Sidebar
```

Components should respond automatically whenever possible.

---

# CSS Guidelines

Avoid physical positioning.

❌ Don't use

```css
margin-left
margin-right
padding-left
padding-right
left
right
```

Use logical properties instead.

✅

```css
margin-inline-start
margin-inline-end

padding-inline

inset-inline-start

border-inline

text-align: start

float: inline-start
```

Logical properties automatically adapt to RTL.

---

# Icons

Some icons should mirror automatically.

Examples:

Mirror:

* Arrow Left
* Arrow Right
* Chevron
* Next
* Previous
* Collapse

Do not mirror:

* Home
* User
* Settings
* Search
* Notification
* AI
* Database

---

# Numbers

Never manually format numbers.

Use:

```ts
Intl.NumberFormat(locale)
```

Supports:

* Arabic digits (optional if enabled)
* Thousands separator
* Decimal separator

---

# Dates

Always use locale-aware formatting.

```ts
Intl.DateTimeFormat(locale)
```

Examples:

English:

```text
Aug 5, 2026
```

Arabic:

```text
٥ أغسطس ٢٠٢٦
```

---

# Currency

Use locale-aware formatting.

```ts
Intl.NumberFormat(locale,{
    style:"currency"
})
```

---

# Lazy Loading

Translation files should be loaded on demand.

Instead of loading every language:

```text
en/
ar/
fr/
```

Load only the active language.

Benefits:

* Faster startup
* Smaller bundles
* Better performance

---

# Translation Rules

Translate:

* Buttons
* Labels
* Tooltips
* Sidebar
* Tables
* Dialogs
* Empty states
* Validation messages
* Errors
* Toasts
* Settings
* Breadcrumbs
* Forms
* Help text

Do NOT translate:

* Database values
* Internal IDs
* API response keys
* Enum values
* Slugs
* URLs

---

# Dynamic Content

Use interpolation.

Example:

```json
{
    "welcome": "Welcome {{name}}"
}
```

Usage:

```ts
t("welcome", {
    name: user.name
})
```

---

# Pluralization

The translation system should support plural forms.

Example:

```text
1 Conversation

2 Conversations

15 Conversations
```

This must work correctly in Arabic and English.

---

# Error Handling

If a translation key is missing:

1. Fall back to English.
2. Log the missing key in development.
3. Never display raw translation keys to end users.

---

# Performance

Recommendations:

* Lazy-load namespaces.
* Cache loaded translations.
* Avoid unnecessary re-renders.
* Memoize language context where appropriate.

---

# Future Language Support

Adding a new language should require only:

```text
src/i18n/locales/fr/
```

Then:

1. Register language.
2. Add translation files.
3. Add language option to UI.

Nothing else should change.

---

# Development Rules

Every new feature must include translations before merging.

Code review should reject:

* Hardcoded strings
* Inline labels
* Non-translated buttons
* Non-translated dialogs

Translation keys should be meaningful.

Good:

```text
sidebar.dashboard
sidebar.agents
common.save
common.cancel
billing.invoice
```

Bad:

```text
text1
label2
button3
```

---

# Implementation Roadmap

## Phase 1

* Install i18next
* Install react-i18next
* Configure i18n
* Create LanguageProvider
* Support English and Arabic

---

## Phase 2

* Implement language selector
* Persist language in Local Storage
* Update HTML lang and dir
* Enable RTL support

---

## Phase 3

* Store language in the user profile
* Synchronize across devices
* Apply server preference after authentication

---

## Phase 4

* Convert every UI string to translation keys
* Split translations into feature namespaces
* Remove hardcoded text
* Audit RTL compatibility
* Optimize lazy loading

---

# Final Architecture Summary

* Route-independent localization.
* User preference–based language management.
* Instant language switching.
* Local Storage persistence.
* Database synchronization.
* Full RTL support.
* Namespace-based translations.
* Lazy-loaded translation resources.
* Locale-aware numbers, dates, and currency.
* Scalable architecture for unlimited future languages.
* Zero component changes required when adding new languages.
