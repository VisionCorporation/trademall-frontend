import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'user-type',
    loadComponent: () => import('./pages/user-type/user-type').then((m) => m.UserType),
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
