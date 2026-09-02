import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'categories/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'products/vendor/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'vendor/**',
    renderMode: RenderMode.Server,
  },
  {
    path: 'vendor-application-status',
    renderMode: RenderMode.Server,
  },
  {
    path: 'login',
    renderMode: RenderMode.Server,
  },
  {
    path: 'order-history',
    renderMode: RenderMode.Server,
  },
  {
    path: 'manage-addresses',
    renderMode: RenderMode.Server,
  },
  {
    path: 'cart',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];