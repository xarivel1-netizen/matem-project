import '@fontsource-variable/inter';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppShell } from './app/AppShell';
import { useApplyTheme } from './theme/useTheme';
import './index.css';

function Root() {
  useApplyTheme();
  return <AppShell />;
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Не найден #root в index.html');

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </StrictMode>,
);
