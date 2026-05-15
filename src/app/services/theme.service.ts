import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkSubject = new BehaviorSubject<boolean>(false);
  dark$ = this.darkSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.apply(saved === 'dark' || (!saved && prefersDark));
  }

  get isDark(): boolean { return this.darkSubject.value; }

  toggle() { this.apply(!this.isDark); }

  private apply(dark: boolean) {
    this.darkSubject.next(dark);
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }
}
