import { Component } from '@angular/core';
import { ORDERS_FILTERS } from '../../../../data/constants/vendor-dashbaord.constant';

@Component({
  selector: 'app-vendor-dashboard-orders',
  imports: [],
  templateUrl: './vendor-dashboard-orders.html',
  styleUrl: './vendor-dashboard-orders.css',
})
export class VendorDashboardOrders {
  public ordersFilters = ORDERS_FILTERS
  public selectedFilter = 'all-orders'
  public hoveredFilter: string | null = null;

  public selectFilter(filterValue: string): void {
    this.selectedFilter = filterValue;
  }
}
