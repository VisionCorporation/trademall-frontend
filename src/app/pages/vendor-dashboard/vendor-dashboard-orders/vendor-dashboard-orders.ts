import { Component, ElementRef, signal, ViewChild } from '@angular/core';
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
  @ViewChild('filterTabsRef') filterTabsRef!: ElementRef<HTMLElement>;
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

  public selectFilter(value: string): void {
    this.selectedFilter = value;
    console.log('Selected Filter:', value);
    this.filteredOrders.set(
      value === 'all-orders'
        ? this.orders
        : this.orders.filter(order => order.status === value)
    );

    setTimeout(() => {
      const activeBtn = this.filterTabsRef.nativeElement.querySelector(`[data-filter="${value}"]`);
      activeBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 0);
  }
}
