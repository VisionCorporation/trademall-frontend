import {
  Component,
  ElementRef,
  HostListener,
  inject,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
  Input,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { ToastService } from '../../services/toast/toast.service';
import { Cart as CartService } from '../../services/cart/cart';
import { CartResponse } from '../../interfaces/cart.interface';
import { ClickOutside } from '../../directives/click-outside/click-outside';
import { CUSTOMER_DROPDOWN, DESKTOP_MENU_ITEMS, MOBILE_MENU_ITEMS, PROFILE_MENU_ITEMS, VENDOR_DROPDOWN } from '../../data/constants/header.constants';
import { HeaderSection } from '../../interfaces/header.interface';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, ClickOutside, FormsModule, NgOptimizedImage],
  templateUrl: './header.html',
  styleUrl: './header.css',
  animations: [fadeInOutAnimation],
})
export class Header implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private readonly loginService = inject(LoginService);
  private readonly cartService = inject(CartService);
  private readonly cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private toastService = inject(ToastService);
  public user: any;
  public sessionLoaded = false;
  public isDropdownOpen = false;
  public cartItemCount = 0;
  public customerDropdown: HeaderSection[] = CUSTOMER_DROPDOWN;
  public vendorDropdown: HeaderSection[] = VENDOR_DROPDOWN;
  @Input() transparent = false;
  public isScrolled = false;
  public searchQuery = '';
  public isModalOpen = signal(false);
  public isModalVisible = false;
  public isMenuOpen = signal(false)
  public isProfileMenuOpen = false;
  public desktopMenuItems: HeaderSection[] = DESKTOP_MENU_ITEMS
  public menuItems: HeaderSection[] = MOBILE_MENU_ITEMS
  public profileMenuItems: HeaderSection[] = PROFILE_MENU_ITEMS

  @ViewChild('header') header!: ElementRef;
  @ViewChild('dropdownRef', { static: true })
  public dropdownRef!: ElementRef<HTMLElement>;
  @ViewChild('searchInput')
  set searchInput(input: ElementRef<HTMLInputElement> | undefined) {
    if (input) {
      setTimeout(() => input.nativeElement.focus());
    }
  }

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
        const count = data?.data?.cart?.vendorGroups?.reduce(
          (total, group) => total + group.items.reduce((sum, item) => sum + item.quantity, 0), 0
        ) ?? 0;
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

  public logout() {
    this.loginService.logout();
    this.router.navigate(['/login']);
    this.toastService.success("You've logged out successfully!");
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.transparent) {
      this.isScrolled = window.scrollY > 60;
    }
  }
  public openModal(): void {
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
    this.cdr.markForCheck();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.isModalVisible = true;
        this.cdr.markForCheck();
      });
    });
  }

  public closeModal(): void {
    this.isModalVisible = false;
    document.body.style.overflow = '';
    this.cdr.markForCheck();

    setTimeout(() => {
      this.isModalOpen.set(false);
      this.cdr.markForCheck();
    }, 200);
  }

  public openMenu(): void {
    this.isMenuOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  public closeMenu(): void {
    this.isMenuOpen.set(false);
    this.isProfileMenuOpen = false
    document.body.style.overflow = '';
  }

  public toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  public onSearchSubmit(query: string): void {
    const searchTerm = query.trim();

    if (searchTerm.length < 2) {
      this.toastService.error("Search query must be at least 2 characters")
      return
    }
    this.router.navigate(['/shop'], {
      queryParams: { q: searchTerm }
    });

    this.searchQuery = ''

    this.closeModal();
  }
}