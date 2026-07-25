import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { applyThemeToDocument } from './core/lib/applyTheme';
import { readThemePreference } from './core/lib/themeStorage';
import { AppProviders } from './app/AppProviders';
import { router } from './app/router';
import './shared/styles/index.css';

applyThemeToDocument(readThemePreference());

createRoot(document.getElementById('root')!).render(
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>,
);
