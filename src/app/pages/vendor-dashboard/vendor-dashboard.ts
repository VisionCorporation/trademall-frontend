import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NAV_ITEMS } from '../../data/constants/vendor-dashbaord.constant';
import { LoginService } from '../../services/login/login.service';
import { ToastService } from '../../services/toast/toast.service';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-vendor-dashboard',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './vendor-dashboard.html',
  styleUrl: './vendor-dashboard.css',
})
export class VendorDashboard implements OnInit {
  public navItems = NAV_ITEMS
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService)
  private readonly toastService = inject(ToastService)
  public user: any
  public headerTitle = signal('Overview');

  private readonly routeTitleMap: Record<string, string> = {
    'overview': 'Overview',
    'orders': 'Orders',
    'products': 'Products',
    'reports': 'Reports',
  };

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => {
        const segments = event.urlAfterRedirects.split('/');
        return segments[segments.length - 1];
      })
    ).subscribe(segment => {
      this.headerTitle.set(this.routeTitleMap[segment] || 'Overview');
    });
  }

  ngOnInit() {
    this.loginService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  get userInitials(): string {
    return this.user ? `${this.user.firstName[0]}${this.user.lastName[0]}` : '';
  }

  public logout() {
    this.loginService.logout();
    this.router.navigate(['/login']);
    this.toastService.success("You've logged out successfully!");
  }
}
