import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Event, EventFilters } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEvents(filters: EventFilters = {}): Observable<Event[]> {
    let params = new HttpParams();
    if (filters.category)  params = params.set('category',  filters.category);
    if (filters.from_date) params = params.set('from_date', filters.from_date);
    if (filters.to_date)   params = params.set('to_date',   filters.to_date);
    if (filters.free_type && filters.free_type !== 'all')
                           params = params.set('free_type', filters.free_type);
    if (filters.search)             params = params.set('search',             filters.search);
    if (filters.is_outdoor)         params = params.set('is_outdoor',         'true');
    if (filters.is_family_friendly) params = params.set('is_family_friendly', 'true');
    return this.http.get<Event[]>(`${this.base}/events`, { params });
  }

  getEvent(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.base}/events/${id}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/events/categories`);
  }
}
