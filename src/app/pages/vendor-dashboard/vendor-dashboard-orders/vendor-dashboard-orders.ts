import { Component, signal } from '@angular/core';
import { ORDER_PERIODS, ORDERS, ORDERS_FILTERS, ORDERS_STATUS_CONFIG } from '../../../data/constants/vendor-dashbaord.constant';
import { ClickOutside } from '../../../directives/click-outside/click-outside';
import { fadeInOutAnimation } from '../../../animations/toast.animations';

@Component({
  selector: 'app-vendor-dashboard-orders',
  imports: [ClickOutside],
  templateUrl: './vendor-dashboard-orders.html',
  styleUrl: './vendor-dashboard-orders.css',
  animations: [fadeInOutAnimation],
})
export class VendorDashboardOrders {
  public ordersFilters = ORDERS_FILTERS
  public orders = ORDERS
  public filteredOrders = signal<any[]>([]);
  public orderPeriods = ORDER_PERIODS
  public statusConfig = ORDERS_STATUS_CONFIG
  public selectedFilter = 'all-orders'
  public hoveredFilter: string | null = null;
  public isSelectOpen = false;
  public selectedPeriod = 'All Orders';

  ngOnInit(): void {
    this.filteredOrders.set(this.orders);
  }

  public selectPeriod(period: { label: string; value: string }) {
    this.selectedPeriod = period.label;
    this.isSelectOpen = false;
  }

  public selectFilter(filterValue: string): void {
    this.selectedFilter = filterValue;
    console.log('Selected Filter:', filterValue);
    this.filteredOrders.set(
      filterValue === 'all-orders'
        ? this.orders
        : this.orders.filter(order => order.status === filterValue)
    );
  }
}
