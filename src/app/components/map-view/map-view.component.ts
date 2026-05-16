import {
  Component, Input, OnChanges, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, SimpleChanges,
} from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { Event } from '../../models/event.model';
import { TranslationService } from '../../services/translation.service';
import { ThemeService } from '../../services/theme.service';

// Category → circle colour
const CAT_COLOR: Record<string, string> = {
  festival:   '#fb923c',
  music:      '#c084fc',
  film:       '#60a5fa',
  dance:      '#f472b6',
  theater:    '#f87171',
  sport:      '#4ade80',
  literature: '#fbbf24',
  community:  '#2dd4bf',
};

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR  = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

// Vienna centre
const VIENNA: L.LatLngExpression = [48.2082, 16.3738];

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
      <div #mapContainer style="height: 520px; width: 100%;"></div>
    </div>
    @if (noCoords) {
      <p class="text-center text-sm text-gray-400 dark:text-gray-500 mt-3">
        {{ noCoords }} event{{ noCoords === 1 ? '' : 's' }} without map coordinates are not shown.
      </p>
    }
  `,
})
export class MapViewComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) events!: Event[];
  @ViewChild('mapContainer', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private tileLayer?: L.TileLayer;
  private markers: L.CircleMarker[] = [];
  private subs = new Subscription();
  noCoords = 0;

  constructor(public tx: TranslationService, private theme: ThemeService) {}

  ngAfterViewInit() {
    this.map = L.map(this.mapEl.nativeElement, {
      center: VIENNA,
      zoom: 12,
      zoomControl: true,
    });

    const dark = this.theme.isDark;
    this.tileLayer = L.tileLayer(dark ? TILE_DARK : TILE_LIGHT, {
      attribution: TILE_ATTR,
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(this.map);

    // React to theme changes
    this.subs.add(this.theme.dark$.subscribe(isDark => {
      if (!this.map || !this.tileLayer) return;
      this.map.removeLayer(this.tileLayer);
      this.tileLayer = L.tileLayer(isDark ? TILE_DARK : TILE_LIGHT, {
        attribution: TILE_ATTR, subdomains: 'abcd', maxZoom: 19,
      }).addTo(this.map);
    }));

    this.renderMarkers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['events'] && this.map) {
      this.renderMarkers();
    }
  }

  private renderMarkers() {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(m => m.remove());
    this.markers = [];
    this.noCoords = 0;

    const eventsWithCoords = (this.events ?? []).filter(e => {
      if (e.latitude && e.longitude) return true;
      this.noCoords++;
      return false;
    });

    for (const ev of eventsWithCoords) {
      const color = CAT_COLOR[ev.category] ?? '#94a3b8';
      const title = this.tx.field(ev, 'title');
      const date  = ev.start_date.slice(0, 10);

      const marker = L.circleMarker([ev.latitude!, ev.longitude!], {
        radius: 9,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      });

      marker.bindPopup(`
        <div style="min-width:180px;font-family:system-ui,sans-serif">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px;line-height:1.3">${title}</div>
          <div style="font-size:12px;color:#6b7280;margin-bottom:6px">📅 ${date} &nbsp;📍 ${ev.location_name}</div>
          <a href="/events/${ev.id}"
             style="display:inline-block;background:#dc2626;color:#fff;padding:4px 10px;border-radius:6px;font-size:12px;text-decoration:none">
            More info →
          </a>
        </div>
      `);

      marker.addTo(this.map);
      this.markers.push(marker);
    }

    // Fit bounds if we have markers
    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.15));
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.map?.remove();
  }
}
