import { Component } from '@angular/core';
import { CATEGORIES } from '../../../data/constants/vendor-dashbaord.constant';
import { fadeInOutAnimation } from '../../../animations/toast.animations';
import { ClickOutside } from '../../../directives/click-outside/click-outside';

@Component({
  selector: 'app-vendor-add-product',
  imports: [ClickOutside],
  templateUrl: './vendor-add-product.html',
  styleUrl: './vendor-add-product.css',
  animations: [fadeInOutAnimation]
})
export class VendorAddProduct {
  public categories = CATEGORIES
  public isCategoryOpen = false
  public selectedCategory = ''

  public selectCategory(category: { label: string; value: string }) {
    this.selectedCategory = category.label;
    this.isCategoryOpen = false;
  }
}
