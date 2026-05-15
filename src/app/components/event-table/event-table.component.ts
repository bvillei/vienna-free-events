import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
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

@Component({
  selector: 'app-event-table',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <tr>
            <th class="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{{ tx.t('th_title') }}</th>
            <th class="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 hidden sm:table-cell">{{ tx.t('th_category') }}</th>
            <th class="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">{{ tx.t('th_date') }}</th>
            <th class="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">{{ tx.t('th_location') }}</th>
            <th class="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 hidden lg:table-cell">{{ tx.t('th_type') }}</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50 dark:divide-gray-700">
          @for (event of events; track event.id) {
            <tr class="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <!-- Title -->
              <td class="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-xs">
                <div class="line-clamp-2">{{ tx.field(event, 'title') }}</div>
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
export class EventTableComponent {
  @Input({ required: true }) events!: Event[];
  constructor(public tx: TranslationService) {}

  categoryStyle(cat: string): string { return CATEGORY_STYLES[cat] ?? 'bg-gray-100 text-gray-700'; }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(this.tx.lang === 'de' ? 'de-AT' : 'en-GB', {
      day: 'numeric', month: 'short'
    });
  }
}
