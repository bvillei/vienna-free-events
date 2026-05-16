import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly siteName = 'Vienna Free Events';

  constructor(private title: Title, private meta: Meta) {}

  setPage(pageTitle: string, description: string, imageUrl?: string) {
    const fullTitle = `${pageTitle} | ${this.siteName}`;
    this.title.setTitle(fullTitle);
    this.update('description', description);
    this.update('og:title', fullTitle);
    this.update('og:description', description);
    this.update('og:url', window.location.href);
    this.update('twitter:title', fullTitle);
    this.update('twitter:description', description);

    if (imageUrl) {
      this.update('og:image', imageUrl);
      this.update('twitter:card', 'summary_large_image');
      this.update('twitter:image', imageUrl);
    } else {
      this.meta.removeTag('name="og:image"');
      this.update('twitter:card', 'summary');
    }
  }

  setHome(lang: 'en' | 'de') {
    const title = lang === 'de' ? 'Gratis Events in Wien' : 'Free Events in Vienna';
    const desc  = lang === 'de'
      ? 'Konzerte, Kino, Tanz, Theater, Sport und mehr — alles kostenlos in Wien.'
      : 'Concerts, film screenings, dance, theater, sport and more — all free in Vienna.';
    this.title.setTitle(`${title} | ${this.siteName}`);
    this.update('description', desc);
    this.update('og:title', title);
    this.update('og:description', desc);
    this.update('og:url', window.location.href);
  }

  private update(nameOrProp: string, content: string) {
    const isProp = nameOrProp.startsWith('og:');
    if (isProp) {
      this.meta.updateTag({ property: nameOrProp, content });
    } else {
      this.meta.updateTag({ name: nameOrProp, content });
    }
  }
}
