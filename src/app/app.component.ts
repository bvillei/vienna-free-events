import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { TranslationService } from './services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <router-outlet />
    <footer class="text-center text-xs text-gray-400 dark:text-gray-600 py-8 mt-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      {{ tx.t('footer') }}
    </footer>
  `,
})
export class AppComponent {
  constructor(public tx: TranslationService) {}
}
