import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { Event } from '../../models/event.model';

const CATEGORY_STYLES: Record<string, string> = {
  festival:   'bg-orange-100 text-orange-700',
  music:      'bg-purple-100 text-purple-700',
  film:       'bg-blue-100 text-blue-700',
  dance:      'bg-pink-100 text-pink-700',
  theater:    'bg-red-100 text-red-700',
  sport:      'bg-green-100 text-green-700',
  literature: 'bg-amber-100 text-amber-700',
};

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="card flex flex-col h-full">
      <!-- Top color bar by category -->
      <div class="h-1.5 w-full" [class]="categoryBar(event.category)"></div>

      <div class="p-5 flex flex-col gap-3 flex-1">
        <!-- Category + free type badges -->
        <div class="flex flex-wrap gap-1.5">
          <span class="badge" [class]="categoryStyle(event.category)">
            {{ tx.category(event.category) }}
          </span>
          @if (event.free_type === 'free_with_registration') {
            <span class="badge bg-yellow-100 text-yellow-700">
              ⚠ {{ tx.t('badge_registration') }}
            </span>
          } @else {
            <span class="badge bg-emerald-100 text-emerald-700">
              ✓ {{ tx.t('badge_free') }}
            </span>
          }
          @if (event.recurrence) {
            <span class="badge bg-gray-100 text-gray-600">
              🔁 {{ event.recurrence === 'daily' ? tx.t('badge_daily') : tx.t('badge_weekly') }}
            </span>
          }
        </div>

        <!-- Title -->
        <h3 class="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
          {{ tx.field(event, 'title') }}
        </h3>

        <!-- Description -->
        @if (tx.field(event, 'description')) {
          <p class="text-sm text-gray-500 line-clamp-3 flex-1">
            {{ tx.field(event, 'description') }}
          </p>
        }

        <!-- Date + location -->
        <div class="text-xs text-gray-400 space-y-1 mt-auto pt-2 border-t border-gray-50">
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

  constructor(public tx: TranslationService) {}

  categoryStyle(cat: string): string {
    return CATEGORY_STYLES[cat] ?? 'bg-gray-100 text-gray-700';
  }

  categoryBar(cat: string): string {
    const map: Record<string, string> = {
      festival:   'bg-orange-400',
      music:      'bg-purple-400',
      film:       'bg-blue-400',
      dance:      'bg-pink-400',
      theater:    'bg-red-400',
      sport:      'bg-green-400',
      literature: 'bg-amber-400',
    };
    return map[cat] ?? 'bg-gray-300';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(this.tx.lang === 'de' ? 'de-AT' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }
}
