import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from './lib/routes';
import { ThemeProvider } from './lib/theme/ThemeProvider';
import { AppShell } from './components/AppShell';
import HomePage from './pages/HomePage';

const LearnIndexPage = lazy(() => import('./pages/LearnIndexPage'));
const FlashcardsPlaceholderPage = lazy(() => import('./pages/FlashcardsPlaceholderPage'));
const QuizPlaceholderPage = lazy(() => import('./pages/QuizPlaceholderPage'));
const ProductIdPlaceholderPage = lazy(() => import('./pages/ProductIdPlaceholderPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function lazyPage(node: React.ReactNode) {
  return <Suspense fallback={<div className="p-4 text-fg-muted">Loading…</div>}>{node}</Suspense>;
}

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
      { path: ROUTES.learn, element: lazyPage(<LearnIndexPage />) },
      { path: ROUTES.flashcards, element: lazyPage(<FlashcardsPlaceholderPage />) },
      { path: ROUTES.quiz, element: lazyPage(<QuizPlaceholderPage />) },
      { path: ROUTES.productId, element: lazyPage(<ProductIdPlaceholderPage />) },
      { path: ROUTES.progress, element: lazyPage(<ProgressPage />) },
      { path: ROUTES.settings, element: lazyPage(<SettingsPage />) },
      {
        path: '*',
        element: (
          <div className="p-4">
            <h1 className="text-xl font-bold">Page not found</h1>
            <p className="mt-2 text-fg-muted">The path you visited doesn't exist.</p>
          </div>
        ),
      },
    ],
  },
]);

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
