import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FOOTER_LINKS } from '../../data/constants/footer.constant';
import { FooterSection } from '../../interfaces/footer.interface';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  public readonly currentYear = new Date().getFullYear();
  public footerSections: FooterSection[] = FOOTER_LINKS

  public openSection: string | null = null;

  public toggleSection(title: string): void {
    this.openSection = this.openSection === title ? null : title;
  }
}
