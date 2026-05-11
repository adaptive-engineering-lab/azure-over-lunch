export const ROUTES = {
  home: '/',
  learn: '/learn',
  flashcards: '/learn/flashcards',
  quiz: '/learn/quiz',
  productId: '/learn/product-id',
  progress: '/progress',
  settings: '/settings',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
