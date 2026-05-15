import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Lang = 'en' | 'de';

const T: Record<Lang, Record<string, string>> = {
  en: {
    site_title: 'Vienna Free Events',
    site_subtitle: 'Free things to do in Vienna',
    home_title: 'Free Events in Vienna',
    home_subtitle: 'Concerts, film screenings, dance, theater, sport and more — all free.',
    events_found: 'events found',
    no_results: 'No events found for the selected filters.',
    loading: 'Loading events…',
    waking_up: 'Waking up the server, this may take ~30 seconds…',
    filter_all_categories: 'All categories',
    filter_all_types: 'All events',
    filter_free: 'Free entry',
    filter_registration: 'Free with registration',
    filter_from: 'From',
    filter_to: 'To',
    filter_search: 'Search events…',
    filter_reset: 'Reset filters',
    cat_festival: 'Festival',
    cat_music: 'Music',
    cat_film: 'Film',
    cat_dance: 'Dance',
    cat_theater: 'Theater',
    cat_sport: 'Sport',
    cat_literature: 'Literature',
    cat_community: 'Community',
    badge_free: 'Free',
    badge_registration: 'Registration required',
    badge_daily: 'Daily',
    badge_weekly: 'Weekly',
    more_info: 'More info →',
    back: '← Back to events',
    location: 'Location',
    date: 'Date',
    time: 'Time',
    recurrence: 'Recurrence',
    note: 'Note',
    website: 'Official website',
    district: 'District',
    to: 'to',
    footer: '© 2026 Vienna Free Events — updated manually, events may change.',
    view_grid: 'Grid',
    view_table: 'Table',
    th_title: 'Event',
    th_category: 'Category',
    th_date: 'Date',
    th_location: 'Location',
    th_type: 'Entry',
  },
  de: {
    site_title: 'Wien Gratis Events',
    site_subtitle: 'Kostenlose Veranstaltungen in Wien',
    home_title: 'Gratis Events in Wien',
    home_subtitle: 'Konzerte, Kino, Tanz, Theater, Sport und mehr – alles kostenlos.',
    events_found: 'Events gefunden',
    no_results: 'Keine Events für die gewählten Filter gefunden.',
    loading: 'Events werden geladen…',
    waking_up: 'Server wird gestartet, bitte ~30 Sekunden warten…',
    filter_all_categories: 'Alle Kategorien',
    filter_all_types: 'Alle Events',
    filter_free: 'Kostenlos',
    filter_registration: 'Kostenlos mit Anmeldung',
    filter_from: 'Von',
    filter_to: 'Bis',
    filter_search: 'Events suchen…',
    filter_reset: 'Filter zurücksetzen',
    cat_festival: 'Festival',
    cat_music: 'Musik',
    cat_film: 'Film',
    cat_dance: 'Tanz',
    cat_theater: 'Theater',
    cat_sport: 'Sport',
    cat_literature: 'Literatur',
    cat_community: 'Community',
    badge_free: 'Kostenlos',
    badge_registration: 'Anmeldung erforderlich',
    badge_daily: 'Täglich',
    badge_weekly: 'Wöchentlich',
    more_info: 'Mehr Infos →',
    back: '← Zurück zu den Events',
    location: 'Ort',
    date: 'Datum',
    time: 'Uhrzeit',
    recurrence: 'Wiederholung',
    note: 'Hinweis',
    website: 'Offizielle Website',
    district: 'Bezirk',
    to: 'bis',
    footer: '© 2026 Wien Gratis Events — manuell gepflegt, Änderungen vorbehalten.',
    view_grid: 'Kacheln',
    view_table: 'Tabelle',
    th_title: 'Veranstaltung',
    th_category: 'Kategorie',
    th_date: 'Datum',
    th_location: 'Ort',
    th_type: 'Eintritt',
  },
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private langSubject = new BehaviorSubject<Lang>('en');
  lang$ = this.langSubject.asObservable();

  get lang(): Lang {
    return this.langSubject.value;
  }

  setLang(lang: Lang) {
    this.langSubject.next(lang);
  }

  toggle() {
    this.setLang(this.lang === 'en' ? 'de' : 'en');
  }

  t(key: string): string {
    return T[this.lang][key] ?? key;
  }

  /** Return the localised field from an event (e.g. title_en / title_de) */
  field(obj: any, field: string): string {
    const localised = obj?.[`${field}_${this.lang}`];
    return localised || obj?.[`${field}_en`] || '';
  }

  /** Human-readable category label */
  category(cat: string): string {
    return this.t(`cat_${cat}`) ?? cat;
  }
}
