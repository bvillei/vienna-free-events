import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2 group">
          <span class="text-2xl">🎪</span>
          <div>
            <div class="font-bold text-gray-900 dark:text-white leading-tight group-hover:text-red-600 transition-colors">
              {{ tx.t('site_title') }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{{ tx.t('site_subtitle') }}</div>
          </div>
        </a>

        <div class="flex items-center gap-2">
          <!-- Dark mode toggle -->
          <button
            (click)="theme.toggle()"
            class="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-lg"
            [title]="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            {{ theme.isDark ? '☀️' : '🌙' }}
          </button>

          <!-- Language toggle -->
          <button
            (click)="tx.toggle()"
            class="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span [class.text-red-600]="tx.lang === 'en'" [class.text-gray-400]="tx.lang !== 'en'">EN</span>
            <span class="text-gray-300 dark:text-gray-600">|</span>
            <span [class.text-red-600]="tx.lang === 'de'" [class.text-gray-400]="tx.lang !== 'de'">DE</span>
          </button>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  constructor(public tx: TranslationService, public theme: ThemeService) {}
}
