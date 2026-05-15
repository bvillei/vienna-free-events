import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
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
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-2xl mx-auto px-4 py-8 space-y-6">

        <a routerLink="/" class="inline-flex items-center text-sm text-gray-500 hover:text-red-600 transition-colors">
          {{ tx.t('back') }}
        </a>

        @if (loading) {
          <div class="card p-10 text-center text-gray-400">
            <div class="text-4xl animate-pulse mb-3">🎪</div>
            <p>{{ tx.t('loading') }}</p>
          </div>
        }

        @if (!loading && event) {
          <div class="card overflow-hidden">
            <!-- Top bar -->
            <div class="h-2 w-full" [class]="categoryBar(event.category)"></div>

            <div class="p-6 space-y-5">
              <!-- Badges -->
              <div class="flex flex-wrap gap-2">
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
              <h1 class="text-2xl font-bold text-gray-900 leading-snug">
                {{ tx.field(event, 'title') }}
              </h1>

              <!-- Description -->
              @if (tx.field(event, 'description')) {
                <p class="text-gray-600 leading-relaxed">
                  {{ tx.field(event, 'description') }}
                </p>
              }

              <!-- Details grid -->
              <div class="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">

                <div class="flex gap-3">
                  <span class="text-gray-400 w-24 shrink-0 font-medium">📅 {{ tx.t('date') }}</span>
                  <span class="text-gray-700">
                    {{ formatDate(event.start_date) }}
                    @if (event.end_date && event.end_date !== event.start_date) {
                      {{ tx.t('to') }} {{ formatDate(event.end_date) }}
                    }
                  </span>
                </div>

                @if (event.start_time) {
                  <div class="flex gap-3">
                    <span class="text-gray-400 w-24 shrink-0 font-medium">🕐 {{ tx.t('time') }}</span>
                    <span class="text-gray-700">{{ event.start_time.slice(0,5) }}</span>
                  </div>
                }

                @if (event.recurrence_note) {
                  <div class="flex gap-3">
                    <span class="text-gray-400 w-24 shrink-0 font-medium">🔁 {{ tx.t('recurrence') }}</span>
                    <span class="text-gray-700">{{ event.recurrence_note }}</span>
                  </div>
                }

                <div class="flex gap-3">
                  <span class="text-gray-400 w-24 shrink-0 font-medium">📍 {{ tx.t('location') }}</span>
                  <div class="text-gray-700">
                    <div class="font-medium">{{ event.location_name }}</div>
                    @if (event.location_address) {
                      <div class="text-gray-500">{{ event.location_address }}</div>
                    }
                    @if (event.district) {
                      <div class="text-gray-400 text-xs">{{ tx.t('district') }} {{ event.district }}</div>
                    }
                  </div>
                </div>

                @if (tx.field(event, 'registration_note')) {
                  <div class="flex gap-3">
                    <span class="text-gray-400 w-24 shrink-0 font-medium">💡 {{ tx.t('note') }}</span>
                    <span class="text-gray-700">{{ tx.field(event, 'registration_note') }}</span>
                  </div>
                }
              </div>

              <!-- External link -->
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
          <div class="card p-10 text-center text-gray-400">
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

  constructor(
    private route: ActivatedRoute,
    private eventSvc: EventService,
    public tx: TranslationService,
  ) {}

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

  categoryStyle(cat: string): string {
    return CATEGORY_STYLES[cat] ?? 'bg-gray-100 text-gray-700';
  }

  categoryBar(cat: string): string {
    const map: Record<string, string> = {
      festival: 'bg-orange-400', music: 'bg-purple-400', film: 'bg-blue-400',
      dance: 'bg-pink-400', theater: 'bg-red-400', sport: 'bg-green-400', literature: 'bg-amber-400',
    };
    return map[cat] ?? 'bg-gray-300';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(this.tx.lang === 'de' ? 'de-AT' : 'en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}
