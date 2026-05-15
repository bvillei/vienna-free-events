import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { EventService } from '../../services/event.service';
import { TranslationService } from '../../services/translation.service';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { Event, EventFilters } from '../../models/event.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FilterBarComponent, EventCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Hero -->
      <div class="bg-white border-b border-gray-100">
        <div class="max-w-5xl mx-auto px-4 py-10 text-center">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {{ tx.t('home_title') }}
          </h1>
          <p class="text-gray-500 text-lg">{{ tx.t('home_subtitle') }}</p>
        </div>
      </div>

      <div class="max-w-5xl mx-auto px-4 py-6 space-y-6">

        <!-- Cold-start banner -->
        @if (showWakeUpBanner) {
          <div class="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <span class="animate-spin">⏳</span>
            {{ tx.t('waking_up') }}
          </div>
        }

        <!-- Filters -->
        <app-filter-bar
          [categories]="categories"
          (filtersChange)="onFiltersChange($event)"
        />

        <!-- Count -->
        @if (!loading && events.length > 0) {
          <p class="text-sm text-gray-400">
            {{ events.length }} {{ tx.t('events_found') }}
          </p>
        }

        <!-- Loading -->
        @if (loading) {
          <div class="text-center py-16 text-gray-400">
            <div class="text-4xl mb-3 animate-pulse">🎪</div>
            <p>{{ tx.t('loading') }}</p>
          </div>
        }

        <!-- No results -->
        @if (!loading && events.length === 0) {
          <div class="text-center py-16 text-gray-400">
            <div class="text-4xl mb-3">🔍</div>
            <p>{{ tx.t('no_results') }}</p>
          </div>
        }

        <!-- Event grid -->
        @if (!loading && events.length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (event of events; track event.id) {
              <app-event-card [event]="event" />
            }
          </div>
        }

      </div>
    </div>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  categories: string[] = [];
  loading = true;
  showWakeUpBanner = false;
  private subs = new Subscription();
  private currentFilters: EventFilters = {};

  constructor(public tx: TranslationService, private eventSvc: EventService) {}

  ngOnInit() {
    this.loadCategories();
    // Show wake-up banner if API takes > 4s
    this.subs.add(timer(4000).subscribe(() => {
      if (this.loading) this.showWakeUpBanner = true;
    }));
    // Re-render on language switch
    this.subs.add(this.tx.lang$.subscribe(() => {
      this.loadEvents(this.currentFilters);
    }));
  }

  loadCategories() {
    this.subs.add(
      this.eventSvc.getCategories().subscribe(cats => this.categories = cats)
    );
  }

  onFiltersChange(filters: EventFilters) {
    this.currentFilters = filters;
    this.loadEvents(filters);
  }

  loadEvents(filters: EventFilters) {
    this.loading = true;
    this.subs.add(
      this.eventSvc.getEvents(filters).subscribe({
        next: events => {
          this.events = events;
          this.loading = false;
          this.showWakeUpBanner = false;
        },
        error: () => {
          this.events = [];
          this.loading = false;
        },
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
