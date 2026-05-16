import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { FavouritesService } from '../../services/favourites.service';
import { Event } from '../../models/event.model';

const CATEGORY_STYLES: Record<string, string> = {
  festival:   'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  music:      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  film:       'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  dance:      'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  theater:    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  sport:      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  literature: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  community:  'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
};

const CATEGORY_BAR: Record<string, string> = {
  festival:   'bg-orange-400',
  music:      'bg-purple-400',
  film:       'bg-blue-400',
  dance:      'bg-pink-400',
  theater:    'bg-red-400',
  sport:      'bg-green-400',
  literature: 'bg-amber-400',
  community:  'bg-teal-400',
};

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="card flex flex-col h-full">
      <!-- Image or color bar -->
      @if (event.image_url) {
        <img [src]="event.image_url" [alt]="tx.field(event, 'title')"
             class="w-full h-40 object-cover" loading="lazy" />
      } @else {
        <div class="h-1.5 w-full" [class]="categoryBar(event.category)"></div>
      }

      <div class="p-5 flex flex-col gap-3 flex-1">
        <!-- Category + free type badges + heart -->
        <div class="flex flex-wrap gap-1.5 items-start">
          <span class="badge" [class]="categoryStyle(event.category)">
            {{ tx.category(event.category) }}
          </span>
          @if (event.free_type === 'free_with_registration') {
            <span class="badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
              ⚠ {{ tx.t('badge_registration') }}
            </span>
          } @else {
            <span class="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              ✓ {{ tx.t('badge_free') }}
            </span>
          }
          @if (event.recurrence) {
            <span class="badge bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              🔁 {{ event.recurrence === 'daily' ? tx.t('badge_daily') : tx.t('badge_weekly') }}
            </span>
          }
          <!-- Heart button -->
          <button
            (click)="toggleFav($event)"
            [title]="fav.has(event.id) ? tx.t('unsave_event') : tx.t('save_event')"
            class="ml-auto text-lg leading-none transition-colors"
            [class]="fav.has(event.id) ? 'text-red-500' : 'text-gray-300 dark:text-gray-600 hover:text-red-400'"
          >{{ fav.has(event.id) ? '♥' : '♡' }}</button>
        </div>

        <!-- Title -->
        <h3 class="font-semibold text-gray-900 dark:text-white text-base leading-snug line-clamp-2">
          {{ tx.field(event, 'title') }}
        </h3>

        <!-- Description -->
        @if (tx.field(event, 'description')) {
          <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 flex-1">
            {{ tx.field(event, 'description') }}
          </p>
        }

        <!-- Date + location -->
        <div class="text-xs text-gray-400 dark:text-gray-500 space-y-1 mt-auto pt-2 border-t border-gray-50 dark:border-gray-700">
          <div class="flex items-center gap-1.5">
            <span>📅</span>
            <span>{{ formatDate(event.start_date) }}
              @if (event.end_date && event.end_date !== event.start_date) {
                – {{ formatDate(event.end_date) }}
              }
            </span>
          </div>
          <div class="flex items-center gap-1.5">
            <span>📍</span>
            <span class="line-clamp-1">{{ event.location_name }}</span>
          </div>
        </div>

        <!-- Link -->
        <a [routerLink]="['/events', event.id]"
           class="btn-primary w-full justify-center mt-1 text-center">
          {{ tx.t('more_info') }}
        </a>
      </div>
    </div>
  `,
})
export class EventCardComponent {
  @Input({ required: true }) event!: Event;
  constructor(public tx: TranslationService, public fav: FavouritesService) {}

  toggleFav(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.fav.toggle(this.event.id);
  }

  categoryStyle(cat: string): string { return CATEGORY_STYLES[cat] ?? 'bg-gray-100 text-gray-700'; }
  categoryBar(cat: string): string { return CATEGORY_BAR[cat] ?? 'bg-gray-300'; }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr.slice(0, 10) + 'T12:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(this.tx.lang === 'de' ? 'de-AT' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }
}
