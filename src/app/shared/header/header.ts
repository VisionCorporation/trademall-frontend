import {
  Component,
  ElementRef,
  HostListener,
  inject,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { ToastService } from '../../services/toast/toast.service';
import { CustomerDropdown, VendorDropdown } from '../../data/constants/dropdown.constant';
import { Cart as CartService } from '../../services/cart/cart';
import { CartResponse } from '../../interfaces/cart.interface';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
  animations: [fadeInOutAnimation],
})
export class Header implements OnInit {
  private readonly loginService = inject(LoginService);
  private readonly cartService = inject(CartService);
  private readonly cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private toastService = inject(ToastService);

  public user: any;
  public sessionLoaded = false;
  public isDropdownOpen = false;
  public cartItemCount = 0;
  public customerDropdown = CustomerDropdown;
  public vendorDropdown = VendorDropdown;

  @ViewChild('dropdownRef', { static: true })
  dropdownRef!: ElementRef<HTMLElement>;

  ngOnInit() {
    this.loginService.user$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.fetchCartCount();
      } else {
        this.cartService.updateCartCount(0);
      }
      this.cdr.detectChanges();
    });

    this.loginService.sessionLoaded$.subscribe((loaded) => {
      this.sessionLoaded = loaded;
      this.cdr.detectChanges();
    });

    this.cartService.cartCount$.subscribe((count) => {
      this.cartItemCount = count;
      this.cdr.detectChanges();
    });
  }

  private fetchCartCount(): void {
    this.cartService.getCartSummary().subscribe({
      next: (data: CartResponse) => {
        const count = data?.data?.cart?.items ?? 0;
        this.cartService.updateCartCount(count);
      },
      error: () => {
        this.cartService.updateCartCount(0);
      },
    });
  }

  get isLoggedIn(): boolean {
    return this.loginService.isLoggedIn();
  }

  get userName(): string {
    return `${this.user?.firstName} ${this.user?.lastName}`;
  }

  get userEmail(): string {
    return this.user?.email || '';
  }

  get userInitials(): string {
    return this.user ? `${this.user.firstName[0]}${this.user.lastName[0]}` : '';
  }

  public toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  public closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeDropdown();
  }

  public logout() {
    this.loginService.logout();
    this.router.navigate(['/login']);
    this.toastService.success("You've logged out successfully!");
  }
}
