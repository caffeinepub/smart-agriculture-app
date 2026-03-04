# Smart Agriculture App

## Current State
Full-stack agriculture management app with 8 pages: Dashboard, Field Zones, Crops, Irrigation, Sensors, Alerts, Analytics, and Settings. Backend uses Motoko with authorization, zones, crops, sensor data, and irrigation schedule management. Frontend uses React + TypeScript + Tailwind with a dark forest-green sidebar design. No login screen. No bilingual support.

## Requested Changes (Diff)

### Add
- **Login/Onboarding Screen**: A dedicated farmer login page shown before the main app. Uses Internet Identity (ICP's decentralized auth). Features farm name, farmer name fields, a language selector (Tamil/English), and an "Enter Farm" call-to-action.
- **Language Context Provider**: A React context that holds the selected language (Tamil | English) and is accessible throughout the app. Toggle switch visible in the sidebar and settings page.
- **Bilingual Translation Layer**: A `translations.ts` file with all UI strings in both Tamil (`ta`) and English (`en`). All labels, table headers, button text, page titles, placeholders, alerts, status labels, and navigation items must support both languages.
- **Language Toggle in Sidebar**: A language switcher at the bottom of the sidebar so farmers can switch at any time.

### Modify
- **App.tsx**: Add login/auth gate — show LoginPage if not authenticated; after login, show main app.
- **AppSidebar**: Nav labels and section headers use translation strings. Language toggle added to bottom section.
- **DashboardPage**: All text strings (KPI card titles, alert messages, quick action labels, zone health labels, section headers, greeting) use translations.
- **CropsPage**: Column headers, filter labels, form labels, button text, status labels, growth stage names, empty state text use translations.
- **FieldZonesPage**: All labels and headers use translations.
- **IrrigationPage**: All labels use translations.
- **SensorsPage**: All labels use translations.
- **AlertsPage**: All labels and severity labels use translations.
- **AnalyticsPage**: All labels use translations.
- **SettingsPage**: All labels, section headers, and controls use translations.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/lib/translations.ts` — complete English + Tamil string map covering all pages.
2. Create `src/frontend/src/contexts/LanguageContext.tsx` — context + hook for language selection, persisted to localStorage.
3. Create `src/frontend/src/pages/LoginPage.tsx` — farmer login screen with Internet Identity auth, name/farm fields, language selector, and animated background.
4. Update `App.tsx` — add auth gate: if not authenticated show LoginPage; after login (or if already logged in) show main app with sidebar. Wrap app in LanguageProvider.
5. Update `AppSidebar.tsx` — use `useTranslation` hook for all nav labels; add language toggle at bottom.
6. Update all 8 page files — replace hardcoded strings with translation hook calls. Preserve all existing logic and data-ocid markers.
