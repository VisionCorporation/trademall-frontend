import { Routes } from '@angular/router';
import { authGuard } from './guards/authentication/auth-guard';
import { customerGuard } from './guards/authorization/customer-guard';

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
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories').then((m) => m.Categories),
  },
  {
    path: 'categories/:slug',
    loadComponent: () =>
      import('./pages/category-products/category-products').then((m) => m.CategoryProducts),
  },
  {
    path: 'products/:slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'products/vendor/:id',
    loadComponent: () => import('./pages/vendor/vendor').then((m) => m.Vendor),
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
    canActivate: [authGuard, customerGuard],
  },
  {
    path: 'order-history',
    loadComponent: () =>
      import('./pages/customer-order-history/customer-order-history').then(
        (m) => m.CustomerOrderHistory,
      ),
    canActivate: [authGuard, customerGuard],
  },
];
