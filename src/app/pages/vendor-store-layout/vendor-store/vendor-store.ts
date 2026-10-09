import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, filter, of, switchMap, tap } from 'rxjs';
import { LoginService } from '../../../services/login/login.service';
import { VendorStoreService } from '../../../services/vendor-store/vendor-store';
import { Store } from '../../../interfaces/vendor.interface';

@Component({
  selector: 'app-vendor-store',
  imports: [RouterLink],
  templateUrl: './vendor-store.html',
  styleUrl: './vendor-store.css',
})
export class VendorStore implements OnInit {
  private loginService = inject(LoginService);
  private vendorStoreService = inject(VendorStoreService);
  private destroyRef = inject(DestroyRef);
  public store = signal<Store | null>(null);
  public status = signal<'loading' | 'empty' | 'ready' | 'error'>('loading');
  public initial = computed(() => this.store()?.name?.charAt(0).toUpperCase() ?? '');

  public policies = computed(() => {
    const s = this.store();
    if (!s) return [];
    return [
      { title: 'Shipping policy', text: s.shippingPolicy, icon: 'M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z' },
      { title: 'Return policy', text: s.returnPolicy, icon: 'M9 14l-4-4 4-4M5 10h10a5 5 0 010 10h-3' },
      { title: 'Terms & conditions', text: s.termsAndConditions, icon: 'M9 12h6M9 16h6M7 3h7l5 5v13H7z' },
    ];
  });

  ngOnInit() {
    this.loginService.user$
      .pipe(
        filter((user) => !!user),
        tap(() => this.status.set('loading')),
        switchMap((user) => {
          if (!user?.store) {
            this.status.set('empty');
            return of(null);
          }

          return this.vendorStoreService.getPublicStorePage('nastrade').pipe(
            tap((res) => {
              this.store.set(res.store);
              this.status.set('ready');
            }),
            catchError(() => {
              this.status.set('error');
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}