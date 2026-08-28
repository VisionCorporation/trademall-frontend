import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { HERO_SECTION_DATA } from '../../../data/constants/home.constant';
import { HeroSlide } from '../../../interfaces/home.interface';

@Component({
  selector: 'app-hero-carousel',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.css',
})
export class HeroCarousel implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  public currentIndex = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;
  private readonly autoplayDelayMs = 5000;
  public slides: HeroSlide[] = HERO_SECTION_DATA

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  private startAutoplay(): void {
    this.autoplayInterval = setInterval(() => {
      this.next();
      this.cdr.markForCheck();
    }, this.autoplayDelayMs);
  }

  private stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  public restartAutoplay(): void {
    this.stopAutoplay();
    this.startAutoplay();
  }

  public next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  public prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.cdr.markForCheck();
  }

  public goTo(index: number): void {
    this.currentIndex = index;
    this.restartAutoplay();
    this.cdr.markForCheck();
  }
}