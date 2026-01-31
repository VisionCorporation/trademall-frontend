import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from './shared/toast/toast';
import { LoginService } from './services/login/login.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('TradeMall');
  private readonly loginService = inject(LoginService);

  ngOnInit() {
    if (this.loginService.isLoggedIn()) {
      console.log('Session restored');
    }
  }
}
