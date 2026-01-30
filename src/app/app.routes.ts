import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'customer/signup',
    pathMatch: 'full',
  },
  {
    path: 'customer/signup',
    loadComponent: () =>
      import('./pages/customer-signup/customer-signup').then((m) => m.CustomerSignup),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
];
