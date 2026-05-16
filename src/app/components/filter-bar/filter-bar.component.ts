import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';
import { EventFilters } from '../../models/event.model';

const MONTHS = [
  { key: 'may',  label_en: 'May',  label_de: 'Mai',  from: '2026-05-01', to: '2026-05-31' },
  { key: 'jun',  label_en: 'Jun',  label_de: 'Jun',  from: '2026-06-01', to: '2026-06-30' },
  { key: 'jul',  label_en: 'Jul',  label_de: 'Jul',  from: '2026-07-01', to: '2026-07-31' },
  { key: 'aug',  label_en: 'Aug',  label_de: 'Aug',  from: '2026-08-01', to: '2026-08-31' },
  { key: 'sep',  label_en: 'Sep',  label_de: 'Sep',  from: '2026-09-01', to: '2026-09-30' },
];

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Monday of the ISO week containing d */
function weekStart(d: Date): Date {
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setDate(d.getDate() + diff);
  return m;
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 space-y-3">

      <!-- Row 1: short date quick-filters -->
      <div class="flex flex-wrap gap-2">
        <span class="text-xs text-gray-400 dark:text-gray-500 self-center">📅</span>

        @for (q of quickFilters; track q.key) {
          <button
            (click)="toggleQuick(q)"
            class="px-3 py-1 rounded-full text-sm font-medium border transition-colors"
            [class]="active === q.key
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-red-400 hover:text-red-600 dark:hover:text-red-400'"
          >{{ tx.t(q.labelKey) }}</button>
        }
      </div>

      <!-- Row 2: month pills -->
      <div class="flex flex-wrap gap-2">
        <span class="text-xs text-gray-400 dark:text-gray-500 self-center">🗓</span>

        @for (m of months; track m.key) {
          <button
            (click)="toggleMonth(m)"
            class="px-3 py-1 rounded-full text-sm font-medium border transition-colors"
            [class]="active === m.key
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-red-400 hover:text-red-600 dark:hover:text-red-400'"
          >
            {{ tx.lang === 'de' ? m.label_de : m.label_en }}
          </button>
        }

        @if (active) {
          <button
            (click)="clearActive()"
            class="px-3 py-1 rounded-full text-sm font-medium border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:border-red-400 transition-colors"
          >✕ {{ tx.t('filter_all_months') }}</button>
        }
      </div>

      <!-- Row 3: search, category, free type, dates, reset -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">

        <!-- Search -->
        <div class="lg:col-span-2">
          <input
            class="input"
            type="text"
            [placeholder]="tx.t('filter_search')"
            [(ngModel)]="filters.search"
            (ngModelChange)="emit()"
          />
        </div>

        <!-- Category -->
        <div>
          <select class="select" [(ngModel)]="filters.category" (ngModelChange)="emit()">
            <option value="" disabled selected hidden>{{ tx.t('filter_all_categories') }}</option>
            <option value="">{{ tx.t('filter_all_categories') }}</option>
            @for (cat of categories; track cat) {
              <option [value]="cat">{{ tx.category(cat) }}</option>
            }
          </select>
        </div>

        <!-- Free type -->
        <div>
          <select class="select" [(ngModel)]="filters.free_type" (ngModelChange)="emit()">
            <option value="all">{{ tx.t('filter_all_types') }}</option>
            <option value="free">{{ tx.t('filter_free') }}</option>
            <option value="free_with_registration">{{ tx.t('filter_registration') }}</option>
          </select>
        </div>

        <!-- From date -->
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{{ tx.t('filter_from') }}</label>
          <input class="input" type="date" [(ngModel)]="filters.from_date" (ngModelChange)="onDateChange()" />
        </div>

        <!-- To date -->
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{{ tx.t('filter_to') }}</label>
          <input class="input" type="date" [(ngModel)]="filters.to_date" (ngModelChange)="onDateChange()" />
        </div>

        <!-- Outdoor / Family toggles -->
        <div class="flex gap-2">
          <button
            (click)="toggleFlag('outdoor')"
            class="px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex-1 text-center"
            [class]="filters.is_outdoor
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-green-400'"
          >{{ tx.t('filter_outdoor') }}</button>
          <button
            (click)="toggleFlag('family')"
            class="px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex-1 text-center"
            [class]="filters.is_family_friendly
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-400'"
          >{{ tx.t('filter_family') }}</button>
        </div>

        <!-- Reset -->
        <div class="flex items-end">
          <button class="btn-ghost w-full justify-center" (click)="reset()">
            {{ tx.t('filter_reset') }}
          </button>
        </div>

      </div>
    </div>
  `,
})
export class FilterBarComponent implements OnInit {
  @Input() categories: string[] = [];
  @Output() filtersChange = new EventEmitter<EventFilters>();

  filters: EventFilters = { category: '', free_type: 'all' };
  active: string | null = null;
  months = MONTHS;

  readonly quickFilters = [
    { key: 'today',     labelKey: 'filter_today' },
    { key: 'tomorrow',  labelKey: 'filter_tomorrow' },
    { key: 'this_week', labelKey: 'filter_this_week' },
    { key: 'weekend',   labelKey: 'this_weekend' },
    { key: 'next_week', labelKey: 'filter_next_week' },
  ];

  constructor(public tx: TranslationService) {}

  ngOnInit() {
    this.filters.from_date = isoDate(new Date());
    this.emit();
  }

  toggleQuick(q: { key: string; labelKey: string }) {
    if (this.active === q.key) { this.clearActive(); return; }
    this.active = q.key;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (q.key === 'today') {
      this.filters.from_date = isoDate(today);
      this.filters.to_date   = isoDate(today);

    } else if (q.key === 'tomorrow') {
      const tom = new Date(today); tom.setDate(today.getDate() + 1);
      this.filters.from_date = isoDate(tom);
      this.filters.to_date   = isoDate(tom);

    } else if (q.key === 'this_week') {
      const mon = weekStart(today);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      this.filters.from_date = isoDate(mon);
      this.filters.to_date   = isoDate(sun);

    } else if (q.key === 'weekend') {
      const day = today.getDay();
      const daysToSat = day === 6 ? 0 : (6 - day + 7) % 7 || 7;
      const sat = new Date(today); sat.setDate(today.getDate() + daysToSat);
      const sun = new Date(sat);   sun.setDate(sat.getDate() + 1);
      this.filters.from_date = isoDate(sat);
      this.filters.to_date   = isoDate(sun);

    } else if (q.key === 'next_week') {
      const mon = weekStart(today); mon.setDate(mon.getDate() + 7);
      const sun = new Date(mon);   sun.setDate(mon.getDate() + 6);
      this.filters.from_date = isoDate(mon);
      this.filters.to_date   = isoDate(sun);
    }

    this.emit();
  }

  toggleMonth(m: typeof MONTHS[0]) {
    if (this.active === m.key) { this.clearActive(); return; }
    this.active = m.key;
    this.filters.from_date = m.from;
    this.filters.to_date   = m.to;
    this.emit();
  }

  clearActive() {
    this.active = null;
    this.filters.from_date = isoDate(new Date());
    this.filters.to_date   = undefined;
    this.emit();
  }

  onDateChange() {
    this.active = null;
    this.emit();
  }

  toggleFlag(flag: 'outdoor' | 'family') {
    if (flag === 'outdoor') {
      this.filters.is_outdoor = this.filters.is_outdoor ? undefined : true;
    } else {
      this.filters.is_family_friendly = this.filters.is_family_friendly ? undefined : true;
    }
    this.emit();
  }

  emit() { this.filtersChange.emit({ ...this.filters }); }

  reset() {
    this.filters = { category: '', free_type: 'all', from_date: isoDate(new Date()) };
    this.active = null;
    this.emit();
  }
}
