import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';
import { EventFilters } from '../../models/event.model';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
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
          <input class="input" type="date" [(ngModel)]="filters.from_date" (ngModelChange)="emit()" />
        </div>

        <!-- To date -->
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{{ tx.t('filter_to') }}</label>
          <input class="input" type="date" [(ngModel)]="filters.to_date" (ngModelChange)="emit()" />
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

  filters: EventFilters = { free_type: 'all' };

  constructor(public tx: TranslationService) {}

  ngOnInit() {
    this.filters.from_date = new Date().toISOString().split('T')[0];
    this.emit();
  }

  emit() { this.filtersChange.emit({ ...this.filters }); }

  reset() {
    this.filters = { free_type: 'all', from_date: new Date().toISOString().split('T')[0] };
    this.emit();
  }
}
