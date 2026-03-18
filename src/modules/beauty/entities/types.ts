import type { BaseEntity } from '@/core/entity';

export interface BeautyProduct extends BaseEntity {
  name: string;
  brand?: string;
  category: 'skincare' | 'haircare' | 'makeup' | 'fragrance' | 'body' | 'other';
  type: string; // например: 'cleanser', 'moisturizer', 'serum', 'shampoo'
  purchase_date: number;
  expiry_date?: number;
  opened_date?: number;
  period_after_opening_months?: number; // PAO - период после открытия
  ingredients?: string[];
  volume_ml?: number;
  price?: number;
  rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  is_favorite: boolean;
  is_empty: boolean;
}

export interface BeautyRoutine extends BaseEntity {
  name: string;
  type: 'morning' | 'evening' | 'weekly' | 'monthly';
  description?: string;
  steps: Array<{
    order: number;
    product_id?: string;
    product_name?: string;
    action: string;
    duration_minutes?: number;
    notes?: string;
  }>;
  is_active: boolean;
}

export interface BeautyUsageLog extends BaseEntity {
  date: number;
  routine_id?: string;
  products: Array<{
    product_id: string;
    product_name: string;
    amount_used?: string; // '1 pump', '2 drops', etc.
  }>;
  skin_condition?: 'dry' | 'oily' | 'normal' | 'combination' | 'sensitive';
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

export interface SkinAnalysis extends BaseEntity {
  date: number;
  skin_type: 'dry' | 'oily' | 'normal' | 'combination' | 'sensitive';
  concerns: string[]; // 'acne', 'wrinkles', 'dark_spots', etc.
  hydration_level?: 1 | 2 | 3 | 4 | 5;
  sensitivity_level?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  photos?: string[]; // URLs или base64
}

