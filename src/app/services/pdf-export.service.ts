import { Injectable } from '@angular/core';
import { Event } from '../models/event.model';
import { Lang } from './translation.service';

@Injectable({ providedIn: 'root' })
export class PdfExportService {

  async export(events: Event[], lang: Lang, subtitle?: string) {
    // Lazy-load jsPDF to keep initial bundle small
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const generatedOn = new Date().toLocaleDateString(lang === 'de' ? 'de-AT' : 'en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    // ── Header ────────────────────────────────────────────────────────────
    doc.setFillColor(220, 38, 38); // red-600
    doc.rect(0, 0, 297, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(lang === 'de' ? '🎪  Wien Gratis Events' : '🎪  Vienna Free Events', 10, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(generatedOn, 287, 12, { align: 'right' });

    // Subtitle (filter summary)
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    if (subtitle) doc.text(subtitle, 10, 24);

    // ── Table ─────────────────────────────────────────────────────────────
    const head = lang === 'de'
      ? [['Veranstaltung', 'Kategorie', 'Datum', 'Ort', 'Eintritt', 'Link']]
      : [['Event', 'Category', 'Date', 'Location', 'Entry', 'Link']];

    const body = events.map(e => [
      lang === 'de' ? (e.title_de || e.title_en) : e.title_en,
      this.categoryLabel(e.category, lang),
      this.formatDateRange(e),
      e.location_name,
      e.free_type === 'free'
        ? (lang === 'de' ? 'Kostenlos' : 'Free')
        : (lang === 'de' ? 'Kostenlos (Anmeldung)' : 'Free (registration)'),
      e.external_url ?? '',
    ]);

    const CATEGORY_COLORS: Record<string, [number, number, number]> = {
      festival:   [251, 146, 60],
      music:      [167, 139, 250],
      film:       [96,  165, 250],
      dance:      [244, 114, 182],
      theater:    [248, 113, 113],
      sport:      [74,  222, 128],
      literature: [251, 191,  36],
      community:  [45,  212, 191],
    };

    autoTable(doc, {
      startY: subtitle ? 28 : 22,
      head,
      body,
      styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
      headStyles: { fillColor: [55, 65, 81], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 65 },  // title
        1: { cellWidth: 22 },  // category
        2: { cellWidth: 30 },  // date
        3: { cellWidth: 55 },  // location
        4: { cellWidth: 30 },  // entry
        5: { cellWidth: 'auto', textColor: [59, 130, 246] }, // link (blue)
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      didParseCell: (data) => {
        // Colour-code the category column
        if (data.column.index === 1 && data.section === 'body') {
          const event = events[data.row.index];
          const colour = CATEGORY_COLORS[event?.category];
          if (colour) data.cell.styles.fillColor = colour;
        }
      },
    });

    // ── Footer ────────────────────────────────────────────────────────────
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(
        lang === 'de'
          ? `Seite ${i} von ${pageCount}  •  vienna-free-events.netlify.app`
          : `Page ${i} of ${pageCount}  •  vienna-free-events.netlify.app`,
        148.5, 205, { align: 'center' }
      );
    }

    doc.save(`vienna-free-events-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  private categoryLabel(cat: string, lang: Lang): string {
    const map: Record<string, { en: string; de: string }> = {
      festival:   { en: 'Festival',   de: 'Festival'   },
      music:      { en: 'Music',      de: 'Musik'      },
      film:       { en: 'Film',       de: 'Film'       },
      dance:      { en: 'Dance',      de: 'Tanz'       },
      theater:    { en: 'Theater',    de: 'Theater'    },
      sport:      { en: 'Sport',      de: 'Sport'      },
      literature: { en: 'Literature', de: 'Literatur'  },
      community:  { en: 'Community',  de: 'Community'  },
    };
    return map[cat]?.[lang] ?? cat;
  }

  private formatDateRange(e: Event): string {
    const fmt = (s: string) => {
      const d = new Date(s.slice(0, 10) + 'T12:00:00');
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };
    if (!e.end_date || e.end_date.slice(0, 10) === e.start_date.slice(0, 10)) {
      return fmt(e.start_date);
    }
    return `${fmt(e.start_date)} – ${fmt(e.end_date)}`;
  }
}
