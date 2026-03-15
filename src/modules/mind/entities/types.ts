import type { BaseEntity } from '@/core/entity';

export interface Book extends BaseEntity {
  title: string;
  author?: string;
  isbn?: string;
  status: 'want_to_read' | 'reading' | 'completed' | 'abandoned';
  rating?: 1 | 2 | 3 | 4 | 5;
  started_at?: number;
  finished_at?: number;
  pages_total?: number;
  pages_read?: number;
  cover_url?: string;
  notes?: string;
}

export interface Course extends BaseEntity {
  title: string;
  provider?: string; // платформа или учебное заведение
  url?: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'abandoned';
  progress: number; // 0-100
  started_at?: number;
  finished_at?: number;
  certificate_url?: string;
  notes?: string;
}

export interface Movie extends BaseEntity {
  title: string;
  type: 'movie' | 'series';
  status: 'want_to_watch' | 'watching' | 'completed' | 'abandoned';
  rating?: 1 | 2 | 3 | 4 | 5;
  watched_at?: number;
  seasons?: number;
  episodes_watched?: number;
  episodes_total?: number;
  poster_url?: string;
  notes?: string;
}

export interface Article extends BaseEntity {
  title: string;
  url: string;
  source?: string;
  author?: string;
  status: 'saved' | 'reading' | 'completed' | 'archived';
  saved_at: number;
  read_at?: number;
  tags: string[];
  notes?: string;
}

export interface Note extends BaseEntity {
  title: string;
  content: string;
  parent_note_id?: string;
  tags: string[];
  is_favorite: boolean;
  word_count?: number;
}
