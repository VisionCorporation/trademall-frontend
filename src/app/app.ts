import { Component, signal } from '@angular/core';
import { CustomerSignup } from './pages/customer-signup/customer-signup';

@Component({
  selector: 'app-root',
  imports: [CustomerSignup],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('TradeMall');
}
