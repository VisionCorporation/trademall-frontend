import { Component, input } from '@angular/core';
import { SkeletonType } from '../../types/skeleton.type';

@Component({
  selector: 'app-skeleton-loader',
  imports: [],
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.css',
})
export class SkeletonLoader {
  public skeletonType = input<SkeletonType>('product');
}
