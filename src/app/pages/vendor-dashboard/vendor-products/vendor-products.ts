import { Component } from '@angular/core';
import { PRODUCTS_FILTERS } from '../../../data/constants/vendor-dashbaord.constant';

@Component({
  selector: 'app-vendor-products',
  imports: [],
  templateUrl: './vendor-products.html',
  styleUrl: './vendor-products.css',
})
export class VendorProducts {
  public productsFilters = PRODUCTS_FILTERS
  public selectedFilter = 'all'
  public hoveredFilter: string | null = null;

  selectFilter(filterValue: string) {
    this.selectedFilter = filterValue
    console.log('Selected filter:', filterValue);
  }
}
