import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 155;

@Injectable({
  providedIn: 'root',
})
export class Seo {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);

  public updatePageSeo(config: {
    title: string;
    description: string;
    url: string;
    image?: string;
  }) {
    const safeTitle = this.truncate(config.title, MAX_TITLE_LENGTH);
    const safeDescription = this.truncate(config.description, MAX_DESCRIPTION_LENGTH);

    this.title.setTitle(safeTitle);

    this.meta.updateTag({ name: 'description', content: safeDescription });

    this.meta.updateTag({ property: 'og:title', content: safeTitle });
    this.meta.updateTag({ property: 'og:description', content: safeDescription });
    this.meta.updateTag({ property: 'og:url', content: config.url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
    }

    this.meta.updateTag({ name: 'twitter:title', content: safeTitle });
    this.meta.updateTag({ name: 'twitter:description', content: safeDescription });
    this.meta.updateTag({ property: 'twitter:url', content: config.url });
    if (config.image) {
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
    }

    this.updateCanonicalUrl(config.url);
  }

  private truncate(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;

    const truncated = text.slice(0, maxLength - 1);
    const lastSpace = truncated.lastIndexOf(' ');
    const safeCut = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;

    return `${safeCut}…`;
  }

  private updateCanonicalUrl(url: string) {
    let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");
    if (link) {
      link.setAttribute('href', url);
    } else {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      this.document.head.appendChild(link);
    }
  }
}