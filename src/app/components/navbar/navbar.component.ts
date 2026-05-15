import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService, Lang } from '../../services/translation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2 group">
          <span class="text-2xl">🎪</span>
          <div>
            <div class="font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
              {{ tx.t('site_title') }}
            </div>
            <div class="text-xs text-gray-500 hidden sm:block">{{ tx.t('site_subtitle') }}</div>
          </div>
        </a>

        <!-- Language toggle -->
        <button
          (click)="tx.toggle()"
          class="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <span [class.text-red-600]="tx.lang === 'en'" [class.text-gray-400]="tx.lang !== 'en'">EN</span>
          <span class="text-gray-300">|</span>
          <span [class.text-red-600]="tx.lang === 'de'" [class.text-gray-400]="tx.lang !== 'de'">DE</span>
        </button>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  constructor(public tx: TranslationService) {}
}
