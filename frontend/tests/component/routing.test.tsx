import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from '../../src/lib/routes';
import { AuthProvider } from '../../src/lib/auth/AuthProvider';

vi.mock('../../src/lib/supabase', () => ({
  supabase: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve({ error: null }),
    },
  }),
}));
import { AppShell } from '../../src/components/AppShell';
import HomePage from '../../src/pages/HomePage';
import LearnIndexPage from '../../src/pages/LearnIndexPage';
import FlashcardSelectPage from '../../src/pages/FlashcardSelectPage';
import QuizPlaceholderPage from '../../src/pages/QuizPlaceholderPage';
import ProductIdPlaceholderPage from '../../src/pages/ProductIdPlaceholderPage';
import ProgressPage from '../../src/pages/ProgressPage';
import SettingsPage from '../../src/pages/SettingsPage';

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        element: <AppShell />,
        children: [
          { path: ROUTES.home, element: <HomePage /> },
          { path: ROUTES.learn, element: <LearnIndexPage /> },
          { path: ROUTES.flashcards, element: <FlashcardSelectPage /> },
          { path: ROUTES.quiz, element: <QuizPlaceholderPage /> },
          { path: ROUTES.productId, element: <ProductIdPlaceholderPage /> },
          { path: ROUTES.progress, element: <ProgressPage /> },
          { path: ROUTES.settings, element: <SettingsPage /> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
}

describe('Routing (FR-002, FR-003, FR-015)', () => {
  it('renders the home page at /', () => {
    renderAt(ROUTES.home);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Mobile-first prep/i);
  });

  it('renders the learn index at /learn', () => {
    renderAt(ROUTES.learn);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Pick a mode/i);
  });

  it.each([
    [ROUTES.quiz, /Quiz/i],
    [ROUTES.productId, /Product ID/i],
  ] as const)('renders placeholder page at %s (FR-003)', (path, heading) => {
    renderAt(path);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(heading);
    expect(screen.getByText(/Coming soon/i)).toBeInTheDocument();
  });

  it('renders the flashcards select page at /learn/flashcards', () => {
    renderAt(ROUTES.flashcards);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Flashcards/i);
    expect(screen.getByText(/Pick a topic/i)).toBeInTheDocument();
  });

  it('renders the progress page at /progress', () => {
    renderAt(ROUTES.progress);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Your progress/i);
  });

  it('renders the settings page at /settings', () => {
    renderAt(ROUTES.settings);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Settings/i);
  });

  it('every primary route is in the bottom nav', () => {
    renderAt(ROUTES.home);
    const nav = screen.getByRole('navigation', { name: /primary/i });
    for (const label of ['Home', 'Learn', 'Progress', 'Settings']) {
      expect(nav).toHaveTextContent(label);
    }
  });
});
