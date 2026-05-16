import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavouritesService {
  private readonly KEY = 'vfe_favourites';
  private _ids = new BehaviorSubject<Set<string>>(this.load());
  ids$ = this._ids.asObservable();

  private load(): Set<string> {
    try {
      const raw = localStorage.getItem(this.KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  }

  private save(s: Set<string>) {
    localStorage.setItem(this.KEY, JSON.stringify([...s]));
  }

  toggle(id: string) {
    const s = new Set(this._ids.value);
    if (s.has(id)) s.delete(id); else s.add(id);
    this.save(s);
    this._ids.next(s);
  }

  has(id: string): boolean { return this._ids.value.has(id); }
  get count(): number { return this._ids.value.size; }
}
