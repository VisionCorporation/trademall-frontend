import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NAV_ITEMS } from '../../data/constants/vendor-dashbaord.constant';

@Component({
  selector: 'app-vendor-dashboard',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './vendor-dashboard.html',
  styleUrl: './vendor-dashboard.css',
})
export class VendorDashboard {
  public navItems = NAV_ITEMS
}
