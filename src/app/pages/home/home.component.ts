import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { EventService } from '../../services/event.service';
import { TranslationService } from '../../services/translation.service';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { EventTableComponent } from '../../components/event-table/event-table.component';
import { Event, EventFilters } from '../../models/event.model';

type ViewMode = 'grid' | 'table';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FilterBarComponent, EventCardComponent, EventTableComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <!-- Hero -->
      <div class="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div class="max-w-5xl mx-auto px-4 py-10 text-center">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {{ tx.t('home_title') }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400 text-lg">{{ tx.t('home_subtitle') }}</p>
        </div>
      </div>

      <div class="max-w-5xl mx-auto px-4 py-6 space-y-6">

        <!-- Cold-start banner -->
        @if (showWakeUpBanner) {
          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <span class="animate-spin inline-block">⏳</span>
            {{ tx.t('waking_up') }}
          </div>
        }

        <!-- Filters -->
        <app-filter-bar
          [categories]="categories"
          (filtersChange)="onFiltersChange($event)"
        />

        <!-- Count + view toggle -->
        @if (!loading) {
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-400 dark:text-gray-500">
              @if (events.length > 0) {
                {{ events.length }} {{ tx.t('events_found') }}
              }
            </p>
            <!-- Grid / Table toggle -->
            <div class="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                (click)="view = 'grid'"
                class="px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors"
                [class]="view === 'grid'
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
                {{ tx.t('view_grid') }}
              </button>
              <button
                (click)="view = 'table'"
                class="px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors border-l border-gray-200 dark:border-gray-700"
                [class]="view === 'table'
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clip-rule="evenodd"/>
                </svg>
                {{ tx.t('view_table') }}
              </button>
            </div>
          </div>
        }

        <!-- Loading -->
        @if (loading) {
          <div class="text-center py-16 text-gray-400 dark:text-gray-600">
            <div class="text-4xl mb-3 animate-pulse">🎪</div>
            <p>{{ tx.t('loading') }}</p>
          </div>
        }

        <!-- No results -->
        @if (!loading && events.length === 0) {
          <div class="text-center py-16 text-gray-400 dark:text-gray-600">
            <div class="text-4xl mb-3">🔍</div>
            <p>{{ tx.t('no_results') }}</p>
          </div>
        }

        <!-- Grid view -->
        @if (!loading && events.length > 0 && view === 'grid') {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (event of events; track event.id) {
              <app-event-card [event]="event" />
            }
          </div>
        }

        <!-- Table view -->
        @if (!loading && events.length > 0 && view === 'table') {
          <app-event-table [events]="events" />
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
  view: ViewMode = 'grid';
  private subs = new Subscription();
  private currentFilters: EventFilters = {};

  constructor(public tx: TranslationService, private eventSvc: EventService) {}

  ngOnInit() {
    this.loadCategories();
    this.subs.add(timer(4000).subscribe(() => {
      if (this.loading) this.showWakeUpBanner = true;
    }));
    this.subs.add(this.tx.lang$.subscribe(() => {
      this.loadEvents(this.currentFilters);
    }));
  }

  loadCategories() {
    this.subs.add(this.eventSvc.getCategories().subscribe(cats => this.categories = cats));
  }

  onFiltersChange(filters: EventFilters) {
    this.currentFilters = filters;
    this.loadEvents(filters);
  }

  loadEvents(filters: EventFilters) {
    this.loading = true;
    this.subs.add(
      this.eventSvc.getEvents(filters).subscribe({
        next: events => { this.events = events; this.loading = false; this.showWakeUpBanner = false; },
        error: () => { this.events = []; this.loading = false; },
      })
    );
  }

  ngOnDestroy() { this.subs.unsubscribe(); }
}
