export interface Event {
  id: string;
  title_en: string;
  title_de?: string;
  description_en?: string;
  description_de?: string;
  category: string;
  location_name: string;
  location_address?: string;
  district?: number;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  recurrence?: 'daily' | 'weekly';
  recurrence_note?: string;
  free_type: 'free' | 'free_with_registration';
  registration_note_en?: string;
  registration_note_de?: string;
  external_url?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
}

export interface EventFilters {
  category?: string;
  from_date?: string;
  to_date?: string;
  free_type?: string;
  search?: string;
}
