import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
  animations: [fadeInOutAnimation],
})
export class Header {
  private readonly loginService = inject(LoginService);
  public user: any;
  public isDropdownOpen = false;
  private router = inject(Router);
  private toastService = inject(ToastService);
  @ViewChild('dropdownRef', { static: true })
  dropdownRef!: ElementRef<HTMLElement>;

  ngOnInit() {
    this.loginService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  get isLoggedIn(): boolean {
    return this.loginService.isLoggedIn();
  }

  get userName(): string {
    return `${this.user?.firstName} ${this.user?.lastName}`;
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
