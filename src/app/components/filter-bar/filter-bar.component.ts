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

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 space-y-3">

      <!-- Month quick-filters -->
      <div class="flex flex-wrap gap-2">
        <span class="text-xs text-gray-400 dark:text-gray-500 self-center mr-1">📅</span>
        @for (m of months; track m.key) {
          <button
            (click)="toggleMonth(m)"
            class="px-3 py-1 rounded-full text-sm font-medium border transition-colors"
            [class]="activeMonth === m.key
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-red-400 hover:text-red-600 dark:hover:text-red-400'"
          >
            {{ tx.lang === 'de' ? m.label_de : m.label_en }}
          </button>
        }
        @if (activeMonth) {
          <button
            (click)="clearMonth()"
            class="px-3 py-1 rounded-full text-sm font-medium border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:border-red-400 transition-colors"
          >
            ✕ {{ tx.t('filter_all_months') }}
          </button>
        }
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

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

        <!-- Reset -->
        <div class="flex items-end lg:col-span-2">
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
  activeMonth: string | null = null;
  months = MONTHS;

  constructor(public tx: TranslationService) {}

  ngOnInit() {
    this.filters.from_date = new Date().toISOString().split('T')[0];
    this.emit();
  }

  toggleMonth(m: typeof MONTHS[0]) {
    if (this.activeMonth === m.key) {
      this.clearMonth();
    } else {
      this.activeMonth = m.key;
      this.filters.from_date = m.from;
      this.filters.to_date = m.to;
      this.emit();
    }
  }

  clearMonth() {
    this.activeMonth = null;
    this.filters.from_date = new Date().toISOString().split('T')[0];
    this.filters.to_date = undefined;
    this.emit();
  }

  onDateChange() {
    // If user manually changes dates, deselect month button
    this.activeMonth = null;
    this.emit();
  }

  emit() { this.filtersChange.emit({ ...this.filters }); }

  reset() {
    this.filters = { category: '', free_type: 'all', from_date: new Date().toISOString().split('T')[0] };
    this.activeMonth = null;
    this.emit();
  }
}
