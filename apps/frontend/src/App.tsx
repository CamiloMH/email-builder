import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Language } from './i18n';
import { LocaleGate } from './i18n/LocaleGate';
import { DashboardPage } from './pages/DashboardPage';
import { EditorPage } from './pages/EditorPage';
import { LandingPage } from './pages/LandingPage';

/**
 * Application routes. Everything lives under a `/:lang` segment (e.g. `/es`,
 * `/en`): the marketing landing, the template dashboard and the per-template
 * editor. Paths without a language redirect to the default (`/es`).
 */
export const App = (): ReactNode => (
  <Routes>
    <Route path="/:lang" element={<LocaleGate />}>
      <Route index element={<LandingPage />} />
      <Route path="app" element={<DashboardPage />} />
      <Route path="editor/:id" element={<EditorPage />} />
    </Route>
    <Route path="*" element={<Navigate to={`/${Language.Es}`} replace />} />
  </Routes>
);
