import { createRoot } from 'react-dom/client';
import { applyThemeToDocument } from './core/lib/applyTheme';
import { readThemePreference } from './core/lib/themeStorage';
import App from './app/App.tsx';
import './shared/styles/index.css';

applyThemeToDocument(readThemePreference());

createRoot(document.getElementById('root')!).render(<App />);
