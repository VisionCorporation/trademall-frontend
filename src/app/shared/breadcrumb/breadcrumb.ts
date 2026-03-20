import { Component, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
})
export class Breadcrumb {
  categoryName = input<string>('');
  categorySlug = input<string>('');
  subCategoryName = input<string>('');
  subCategorySlug = input<string>('');
  productName = input<string>('');

  private readonly location = inject(Location);

  public goBack() {
    this.location.back();
  }
}
