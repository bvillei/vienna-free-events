import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { Event } from '../../models/event.model';

interface CalDay {
  iso: string;          // 'YYYY-MM-DD'
  day: number;          // 1-31, 0 = padding cell
  inMonth: boolean;
  isToday: boolean;
  events: Event[];
}

const CAT_DOT: Record<string, string> = {
  festival:   'bg-orange-400', music:      'bg-purple-400',
  film:       'bg-blue-400',   dance:      'bg-pink-400',
  theater:    'bg-red-400',    sport:      'bg-green-400',
  literature: 'bg-amber-400',  community:  'bg-teal-400',
};

// May–Sep 2026
const MONTHS = [
  { year: 2026, month: 4,  label_en: 'May 2026',       label_de: 'Mai 2026'       },
  { year: 2026, month: 5,  label_en: 'June 2026',      label_de: 'Juni 2026'      },
  { year: 2026, month: 6,  label_en: 'July 2026',      label_de: 'Juli 2026'      },
  { year: 2026, month: 7,  label_en: 'August 2026',    label_de: 'August 2026'    },
  { year: 2026, month: 8,  label_en: 'September 2026', label_de: 'September 2026' },
];

const DAY_HEADERS_EN = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAY_HEADERS_DE = ['Mo','Di','Mi','Do','Fr','Sa','So'];

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="card p-4 space-y-4">

      <!-- Month navigation -->
      <div class="flex items-center justify-between">
        <button
          (click)="prevMonth()"
          [disabled]="monthIdx === 0"
          class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
          [title]="tx.t('cal_prev')"
        >←</button>
        <h2 class="font-semibold text-gray-800 dark:text-gray-100">
          {{ tx.lang === 'de' ? MONTHS[monthIdx].label_de : MONTHS[monthIdx].label_en }}
        </h2>
        <button
          (click)="nextMonth()"
          [disabled]="monthIdx === MONTHS.length - 1"
          class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
          [title]="tx.t('cal_next')"
        >→</button>
      </div>

      <!-- Day-of-week headers -->
      <div class="grid grid-cols-7 text-center">
        @for (h of dayHeaders; track h) {
          <div class="text-xs font-medium text-gray-400 dark:text-gray-500 py-1">{{ h }}</div>
        }
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7 gap-1">
        @for (cell of grid; track cell.iso) {
          <button
            (click)="cell.inMonth && cell.events.length ? selectDay(cell) : null"
            class="min-h-[52px] rounded-xl p-1.5 flex flex-col items-center gap-0.5 transition-colors text-left"
            [class]="cellClass(cell)"
          >
            @if (cell.inMonth) {
              <span class="text-xs font-medium leading-none"
                [class]="cell.isToday ? 'text-white' : 'text-gray-700 dark:text-gray-200'"
              >{{ cell.day }}</span>
              <!-- Event dots (max 3) -->
              <div class="flex flex-wrap justify-center gap-0.5 mt-0.5">
                @for (ev of cell.events.slice(0,3); track ev.id) {
                  <span class="w-1.5 h-1.5 rounded-full" [class]="dotColor(ev.category)"></span>
                }
                @if (cell.events.length > 3) {
                  <span class="text-[9px] text-gray-400 dark:text-gray-500 leading-none">+{{ cell.events.length - 3 }}</span>
                }
              </div>
            }
          </button>
        }
      </div>

      <!-- Selected day events panel -->
      @if (selectedDay) {
        <div class="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {{ formatDayLabel(selectedDay.iso) }}
            <span class="ml-1 text-gray-400">({{ selectedDay.events.length }})</span>
          </h3>
          @if (selectedDay.events.length === 0) {
            <p class="text-sm text-gray-400 dark:text-gray-500">{{ tx.t('cal_no_events') }}</p>
          }
          @for (ev of selectedDay.events; track ev.id) {
            <a [routerLink]="['/events', ev.id]"
               class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" [class]="dotColor(ev.category)"></span>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ tx.field(ev, 'title') }}
                </div>
                <div class="text-xs text-gray-400 dark:text-gray-500 truncate">
                  📍 {{ ev.location_name }}
                  @if (ev.start_time) { · 🕐 {{ ev.start_time.slice(0,5) }} }
                </div>
              </div>
              <span class="text-xs text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">→</span>
            </a>
          }
        </div>
      } @else {
        <p class="text-center text-sm text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-4">
          {{ tx.t('cal_select_day') }}
        </p>
      }
    </div>
  `,
})
export class CalendarViewComponent implements OnChanges {
  @Input({ required: true }) events!: Event[];

  readonly MONTHS = MONTHS;
  monthIdx = 0;
  grid: CalDay[] = [];
  selectedDay: CalDay | null = null;

  constructor(public tx: TranslationService) {
    // Start at current month
    const now = new Date();
    const idx = MONTHS.findIndex(m => m.year === now.getFullYear() && m.month === now.getMonth());
    this.monthIdx = idx >= 0 ? idx : 0;
  }

  get dayHeaders(): string[] {
    return this.tx.lang === 'de' ? DAY_HEADERS_DE : DAY_HEADERS_EN;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['events']) {
      this.buildGrid();
      this.selectedDay = null;
    }
  }

  prevMonth() { if (this.monthIdx > 0) { this.monthIdx--; this.buildGrid(); this.selectedDay = null; } }
  nextMonth() { if (this.monthIdx < MONTHS.length - 1) { this.monthIdx++; this.buildGrid(); this.selectedDay = null; } }

  selectDay(cell: CalDay) {
    this.selectedDay = this.selectedDay?.iso === cell.iso ? null : cell;
  }

  buildGrid() {
    const { year, month } = MONTHS[this.monthIdx];
    const todayStr = new Date().toISOString().slice(0, 10);
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);

    // ISO day of week for 1st (Mon=1 … Sun=7, adjust JS Sun=0)
    const startDow = firstDay.getDay() === 0 ? 7 : firstDay.getDay();

    this.grid = [];

    // Leading padding
    for (let p = 1; p < startDow; p++) {
      this.grid.push({ iso: '', day: 0, inMonth: false, isToday: false, events: [] });
    }

    // Actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const iso = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      this.grid.push({
        iso,
        day: d,
        inMonth: true,
        isToday: iso === todayStr,
        events: this.eventsForDay(iso),
      });
    }

    // Trailing padding to complete the last row
    const total = this.grid.length;
    const remainder = total % 7;
    if (remainder !== 0) {
      for (let t = 0; t < 7 - remainder; t++) {
        this.grid.push({ iso: '', day: 0, inMonth: false, isToday: false, events: [] });
      }
    }
  }

  eventsForDay(iso: string): Event[] {
    return (this.events ?? []).filter(e => {
      const start = e.start_date.slice(0, 10);
      const end   = (e.end_date ?? e.start_date).slice(0, 10);
      return start <= iso && end >= iso;
    });
  }

  cellClass(cell: CalDay): string {
    if (!cell.inMonth) return 'opacity-0 pointer-events-none';
    if (this.selectedDay?.iso === cell.iso) {
      return 'bg-red-600 text-white cursor-pointer';
    }
    if (cell.isToday) {
      return 'bg-red-100 dark:bg-red-900/30 cursor-pointer ring-2 ring-red-400';
    }
    if (cell.events.length > 0) {
      return 'bg-gray-50 dark:bg-gray-700/40 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer';
    }
    return 'text-gray-300 dark:text-gray-600 cursor-default';
  }

  dotColor(cat: string): string { return CAT_DOT[cat] ?? 'bg-gray-400'; }

  formatDayLabel(iso: string): string {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString(this.tx.lang === 'de' ? 'de-AT' : 'en-GB', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  }
}
