import { Component } from '@angular/core';
import { Header } from '../../shared/header/header';
import { RouterLink } from "@angular/router";
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-customer-order-history',
  imports: [Header, RouterLink, Newsletter, Footer],
  templateUrl: './customer-order-history.html',
  styleUrl: './customer-order-history.css',
  animations:[fadeInOutAnimation]
})
export class CustomerOrderHistory {
  public isOrderPlaced = false;
}
