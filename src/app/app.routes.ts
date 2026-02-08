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
    path: 'vendor/signup',
    loadComponent: () => import('./pages/vendor-signup/vendor-signup').then((m) => m.VendorSignup),
  },
  {
    path: 'vendor-type',
    loadComponent: () => import('./pages/vendor-type/vendor-type').then((m) => m.VendorType),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
];
