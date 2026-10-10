import { Component, inject, PLATFORM_ID } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Toast } from './shared/toast/toast';
import { ConfirmDialog } from './shared/confirm-dialog/confirm-dialog';
import { StoreDomainService } from './services/store-domain/store-domain';
import { Vendor } from './pages/vendor/vendor';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, ConfirmDialog, Vendor],
  templateUrl: './app.html',
  styleUrl: './app.css',
})

export class App {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storeDomainService = inject(StoreDomainService);

  public readonly storeSubdomain =
    this.storeDomainService.getStoreSubdomain();

  constructor() {
    if (
      !isPlatformBrowser(this.platformId) ||
      !this.storeSubdomain
    ) {
      return;
    }

    this.redirectToMarketplaceIfNeeded(
      window.location.pathname + window.location.search + window.location.hash,
    );

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.redirectToMarketplaceIfNeeded(event.url);
      }
    });
  }

  public isStoreRootRoute(): boolean {
    return this.router.url.split(/[?#]/, 1)[0] === '/';
  }

  private redirectToMarketplaceIfNeeded(url: string): void {
    const path = url.split(/[?#]/, 1)[0];

    if (path === '/') {
      return;
    }

    const hostname = window.location.hostname;
    const port = window.location.port;

    const marketplaceOrigin = hostname.endsWith('.localhost')
      ? `${window.location.protocol}//localhost${port ? `:${port}` : ''}`
      : 'https://trademall.shop';

    const destination = `${marketplaceOrigin}${url}`;

    window.location.replace(destination);
  }
}
