import { Component } from '@angular/core';
import { Header } from '../../shared/header/header';
import { RouterLink } from '@angular/router';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { Footer } from '../../shared/footer/footer';
import { FeaturedCategories } from '../../shared/featured-categories/featured-categories';

@Component({
  selector: 'app-home',
  imports: [Header, RouterLink, Newsletter, Footer, FeaturedCategories],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
