import { Component, Input, OnChanges } from '@angular/core';
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

type SortCol = 'name' | 'category' | 'date';

@Component({
  selector: 'app-event-table',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <tr>
            <!-- Name header -->
            <th class="px-4 py-3">
              <button (click)="setSort('name')"
                class="flex items-center gap-1 font-semibold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                {{ tx.t('th_title') }}
                <span class="text-xs opacity-60">{{ sortIndicator('name') }}</span>
              </button>
            </th>
            <!-- Category header -->
            <th class="px-4 py-3 hidden sm:table-cell">
              <button (click)="setSort('category')"
                class="flex items-center gap-1 font-semibold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                {{ tx.t('th_category') }}
                <span class="text-xs opacity-60">{{ sortIndicator('category') }}</span>
              </button>
            </th>
            <!-- Date header -->
            <th class="px-4 py-3">
              <button (click)="setSort('date')"
                class="flex items-center gap-1 font-semibold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                {{ tx.t('th_date') }}
                <span class="text-xs opacity-60">{{ sortIndicator('date') }}</span>
              </button>
            </th>
            <th class="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">{{ tx.t('th_location') }}</th>
            <th class="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 hidden lg:table-cell">{{ tx.t('th_type') }}</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50 dark:divide-gray-700">
          @for (event of sorted; track event.id) {
            <tr class="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <!-- Title -->
              <td class="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-xs">
                <div class="flex items-start gap-2">
                  <button
                    (click)="fav.toggle(event.id)"
                    [title]="fav.has(event.id) ? tx.t('unsave_event') : tx.t('save_event')"
                    class="mt-0.5 shrink-0 text-base leading-none transition-colors"
                    [class]="fav.has(event.id) ? 'text-red-500' : 'text-gray-300 dark:text-gray-600 hover:text-red-400'"
                  >{{ fav.has(event.id) ? '♥' : '♡' }}</button>
                  <div class="line-clamp-2">{{ tx.field(event, 'title') }}</div>
                </div>
              </td>
              <!-- Category -->
              <td class="px-4 py-3 hidden sm:table-cell">
                <span class="badge" [class]="categoryStyle(event.category)">
                  {{ tx.category(event.category) }}
                </span>
              </td>
              <!-- Dates -->
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {{ formatDate(event.start_date) }}
                @if (event.end_date && event.end_date !== event.start_date) {
                  <br><span class="text-gray-400 dark:text-gray-500">→ {{ formatDate(event.end_date) }}</span>
                }
                @if (event.recurrence) {
                  <br><span class="text-xs text-gray-400 dark:text-gray-600">
                    🔁 {{ event.recurrence === 'daily' ? tx.t('badge_daily') : tx.t('badge_weekly') }}
                  </span>
                }
              </td>
              <!-- Location -->
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell max-w-[180px]">
                <div class="line-clamp-2">{{ event.location_name }}</div>
              </td>
              <!-- Type -->
              <td class="px-4 py-3 hidden lg:table-cell">
                @if (event.free_type === 'free_with_registration') {
                  <span class="badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                    ⚠ {{ tx.t('badge_registration') }}
                  </span>
                } @else {
                  <span class="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    ✓ {{ tx.t('badge_free') }}
                  </span>
                }
              </td>
              <!-- Link -->
              <td class="px-4 py-3 text-right">
                <a [routerLink]="['/events', event.id]"
                   class="btn-primary py-1 px-3 text-xs whitespace-nowrap">
                  {{ tx.t('more_info') }}
                </a>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class EventTableComponent implements OnChanges {
  @Input({ required: true }) events!: Event[];

  sorted: Event[] = [];
  sortCol: SortCol = 'date';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(public tx: TranslationService, public fav: FavouritesService) {}

  ngOnChanges() { this.applySort(); }

  setSort(col: SortCol) {
    if (this.sortCol === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCol = col;
      this.sortDir = 'asc';
    }
    this.applySort();
  }

  sortIndicator(col: SortCol): string {
    if (this.sortCol !== col) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  applySort() {
    const lang = this.tx.lang;
    this.sorted = [...(this.events ?? [])].sort((a, b) => {
      let cmp = 0;
      if (this.sortCol === 'category') {
        cmp = a.category.localeCompare(b.category) || a.start_date.localeCompare(b.start_date);
      } else if (this.sortCol === 'name') {
        const ta = (lang === 'de' ? a.title_de : null) ?? a.title_en;
        const tb = (lang === 'de' ? b.title_de : null) ?? b.title_en;
        cmp = ta.localeCompare(tb, lang);
      } else {
        cmp = a.start_date.localeCompare(b.start_date);
      }
      return this.sortDir === 'asc' ? cmp : -cmp;
    });
  }

  categoryStyle(cat: string): string { return CATEGORY_STYLES[cat] ?? 'bg-gray-100 text-gray-700'; }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr.slice(0, 10) + 'T12:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(this.tx.lang === 'de' ? 'de-AT' : 'en-GB', {
      day: 'numeric', month: 'short'
    });
  }
}
