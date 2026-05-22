import { Component } from '@angular/core';
import { ORDERS, ORDERS_FILTERS, ORDERS_STATUS_CONFIG } from '../../../../data/constants/vendor-dashbaord.constant';

@Component({
  selector: 'app-vendor-dashboard-orders',
  imports: [],
  templateUrl: './vendor-dashboard-orders.html',
  styleUrl: './vendor-dashboard-orders.css',
})
export class VendorDashboardOrders {
  public ordersFilters = ORDERS_FILTERS
  public orders = ORDERS
  public statusConfig = ORDERS_STATUS_CONFIG
  public selectedFilter = 'all-orders'
  public hoveredFilter: string | null = null;
  public isSelectOpen = false;

  public selectFilter(filterValue: string): void {
    this.selectedFilter = filterValue;
  }
}
