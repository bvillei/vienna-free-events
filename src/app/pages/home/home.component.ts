import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, timer } from 'rxjs';
import { EventService } from '../../services/event.service';
import { TranslationService } from '../../services/translation.service';
import { FavouritesService } from '../../services/favourites.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { SeoService } from '../../services/seo.service';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { EventTableComponent } from '../../components/event-table/event-table.component';
import { CalendarViewComponent } from '../../components/calendar-view/calendar-view.component';
import { Event, EventFilters } from '../../models/event.model';

type ViewMode = 'grid' | 'table' | 'calendar';
type TabMode  = 'all' | 'saved';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FilterBarComponent, EventCardComponent, EventTableComponent, CalendarViewComponent, FormsModule],
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

      <div class="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4">

        <!-- Cold-start banner -->
        @if (showWakeUpBanner) {
          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <span class="animate-spin inline-block">⏳</span>
            {{ tx.t('waking_up') }}
          </div>
        }

        <!-- Tabs -->
        <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
          <button
            (click)="tab = 'all'"
            class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            [class]="tab === 'all'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
          >{{ tx.t('tab_all') }}</button>
          <button
            (click)="tab = 'saved'"
            class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            [class]="tab === 'saved'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
          >
            ♥ {{ tx.t('tab_saved') }}
            @if (fav.count > 0) {
              <span class="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {{ fav.count }}
              </span>
            }
          </button>
        </div>

        <!-- Filters (only in "all" tab) -->
        @if (tab === 'all') {
          <app-filter-bar
            [categories]="categories"
            (filtersChange)="onFiltersChange($event)"
          />
        }

        <!-- Toolbar: count + PDF + view toggle -->
        @if (!loading) {
          <div class="flex items-center justify-between flex-wrap gap-2">
            <p class="text-sm text-gray-400 dark:text-gray-500">
              @if (displayed.length > 0) {
                {{ displayed.length }} {{ tx.t('events_found') }}
              }
            </p>
            <div class="flex items-center gap-2 flex-wrap">
              <!-- PDF export (not useful in calendar view) -->
              @if (displayed.length > 0 && view !== 'calendar') {
                <button
                  (click)="exportPdf()"
                  [disabled]="exporting"
                  class="btn-ghost text-xs py-1.5 px-3"
                >
                  {{ exporting ? '…' : '📄 ' + tx.t('export_pdf') }}
                </button>
              }

              <!-- Grid / Table / Calendar toggle -->
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
                <button
                  (click)="view = 'calendar'"
                  class="px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors border-l border-gray-200 dark:border-gray-700"
                  [class]="view === 'calendar'
                    ? 'bg-red-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                  </svg>
                  {{ tx.t('view_calendar') }}
                </button>
              </div>
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

        <!-- No saved events -->
        @if (!loading && tab === 'saved' && displayed.length === 0) {
          <div class="text-center py-16 text-gray-400 dark:text-gray-600">
            <div class="text-4xl mb-3">♡</div>
            <p>{{ tx.t('no_saved') }}</p>
          </div>
        }

        <!-- No results (all tab) -->
        @if (!loading && tab === 'all' && displayed.length === 0) {
          <div class="text-center py-16 text-gray-400 dark:text-gray-600">
            <div class="text-4xl mb-3">🔍</div>
            <p>{{ tx.t('no_results') }}</p>
          </div>
        }

        <!-- Grid view -->
        @if (!loading && displayed.length > 0 && view === 'grid') {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (event of displayed; track event.id) {
              <app-event-card [event]="event" />
            }
          </div>
        }

        <!-- Table view -->
        @if (!loading && displayed.length > 0 && view === 'table') {
          <app-event-table [events]="displayed" />
        }

        <!-- Calendar view -->
        @if (!loading && view === 'calendar') {
          <app-calendar-view [events]="displayed" />
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
  tab: TabMode  = 'all';
  exporting = false;
  private subs = new Subscription();
  private currentFilters: EventFilters = {};

  constructor(
    public tx: TranslationService,
    public fav: FavouritesService,
    private eventSvc: EventService,
    private pdfSvc: PdfExportService,
    private seo: SeoService,
  ) {}

  get displayed(): Event[] {
    if (this.tab === 'saved') {
      return this.events.filter(e => this.fav.has(e.id));
    }
    return this.events;
  }

  ngOnInit() {
    this.loadCategories();
    this.subs.add(timer(4000).subscribe(() => {
      if (this.loading) this.showWakeUpBanner = true;
    }));
    this.subs.add(this.tx.lang$.subscribe(lang => {
      this.seo.setHome(lang);
      this.loadEvents(this.currentFilters);
    }));
    this.subs.add(this.fav.ids$.subscribe(() => {}));
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
        next: events => {
          this.events = [...events].sort((a, b) => a.start_date.localeCompare(b.start_date));
          this.loading = false;
          this.showWakeUpBanner = false;
        },
        error: () => { this.events = []; this.loading = false; },
      })
    );
  }

  async exportPdf() {
    this.exporting = true;
    try {
      await this.pdfSvc.export(this.displayed, this.tx.lang);
    } finally {
      this.exporting = false;
    }
  }

  ngOnDestroy() { this.subs.unsubscribe(); }
}
