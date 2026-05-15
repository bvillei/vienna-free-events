import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
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

const CATEGORY_BAR: Record<string, string> = {
  festival: 'bg-orange-400', music: 'bg-purple-400', film: 'bg-blue-400',
  dance: 'bg-pink-400', theater: 'bg-red-400', sport: 'bg-green-400',
  literature: 'bg-amber-400', community: 'bg-teal-400',
};

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div class="max-w-2xl mx-auto px-4 py-8 space-y-6">

        <a routerLink="/" class="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors">
          {{ tx.t('back') }}
        </a>

        @if (loading) {
          <div class="card p-10 text-center text-gray-400 dark:text-gray-600">
            <div class="text-4xl animate-pulse mb-3">🎪</div>
            <p>{{ tx.t('loading') }}</p>
          </div>
        }

        @if (!loading && event) {
          <div class="card overflow-hidden">
            <div class="h-2 w-full" [class]="categoryBar(event.category)"></div>

            <div class="p-6 space-y-5">
              <!-- Badges -->
              <div class="flex flex-wrap gap-2">
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
              </div>

              <!-- Title -->
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                {{ tx.field(event, 'title') }}
              </h1>

              <!-- Description -->
              @if (tx.field(event, 'description')) {
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {{ tx.field(event, 'description') }}
                </p>
              }

              <!-- Details -->
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3 text-sm">

                <div class="flex gap-3">
                  <span class="text-gray-400 dark:text-gray-500 w-24 shrink-0 font-medium">📅 {{ tx.t('date') }}</span>
                  <span class="text-gray-700 dark:text-gray-200">
                    {{ formatDate(event.start_date) }}
                    @if (event.end_date && event.end_date !== event.start_date) {
                      {{ tx.t('to') }} {{ formatDate(event.end_date) }}
                    }
                  </span>
                </div>

                @if (event.start_time) {
                  <div class="flex gap-3">
                    <span class="text-gray-400 dark:text-gray-500 w-24 shrink-0 font-medium">🕐 {{ tx.t('time') }}</span>
                    <span class="text-gray-700 dark:text-gray-200">{{ event.start_time.slice(0,5) }}</span>
                  </div>
                }

                @if (event.recurrence_note) {
                  <div class="flex gap-3">
                    <span class="text-gray-400 dark:text-gray-500 w-24 shrink-0 font-medium">🔁 {{ tx.t('recurrence') }}</span>
                    <span class="text-gray-700 dark:text-gray-200">{{ event.recurrence_note }}</span>
                  </div>
                }

                <div class="flex gap-3">
                  <span class="text-gray-400 dark:text-gray-500 w-24 shrink-0 font-medium">📍 {{ tx.t('location') }}</span>
                  <div class="text-gray-700 dark:text-gray-200">
                    <div class="font-medium">{{ event.location_name }}</div>
                    @if (event.location_address) {
                      <div class="text-gray-500 dark:text-gray-400">{{ event.location_address }}</div>
                    }
                    @if (event.district) {
                      <div class="text-gray-400 dark:text-gray-500 text-xs">{{ tx.t('district') }} {{ event.district }}</div>
                    }
                  </div>
                </div>

                @if (tx.field(event, 'registration_note')) {
                  <div class="flex gap-3">
                    <span class="text-gray-400 dark:text-gray-500 w-24 shrink-0 font-medium">💡 {{ tx.t('note') }}</span>
                    <span class="text-gray-700 dark:text-gray-200">{{ tx.field(event, 'registration_note') }}</span>
                  </div>
                }
              </div>

              @if (event.external_url) {
                <a [href]="event.external_url" target="_blank" rel="noopener"
                   class="btn-primary inline-flex w-full justify-center">
                  🔗 {{ tx.t('website') }}
                </a>
              }
            </div>
          </div>
        }

        @if (!loading && !event) {
          <div class="card p-10 text-center text-gray-400 dark:text-gray-600">
            <div class="text-4xl mb-3">😕</div>
            <p>Event not found.</p>
          </div>
        }

      </div>
    </div>
  `,
})
export class EventDetailComponent implements OnInit, OnDestroy {
  event: Event | null = null;
  loading = true;
  private subs = new Subscription();

  constructor(private route: ActivatedRoute, private eventSvc: EventService, public tx: TranslationService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.subs.add(
      this.eventSvc.getEvent(id).subscribe({
        next: e => { this.event = e; this.loading = false; },
        error: () => { this.event = null; this.loading = false; },
      })
    );
  }

  ngOnDestroy() { this.subs.unsubscribe(); }

  categoryStyle(cat: string): string { return CATEGORY_STYLES[cat] ?? 'bg-gray-100 text-gray-700'; }
  categoryBar(cat: string): string { return CATEGORY_BAR[cat] ?? 'bg-gray-300'; }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr.slice(0, 10) + 'T12:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(this.tx.lang === 'de' ? 'de-AT' : 'en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}
