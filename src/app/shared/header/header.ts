import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginService } from '../../services/login/login.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly loginService = inject(LoginService);
  public user: any;

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
}
