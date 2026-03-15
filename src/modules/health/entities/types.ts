import type { BaseEntity } from '@/core/entity';

export interface HealthMetric extends BaseEntity {
  type:
    | 'weight'
    | 'height'
    | 'bmi'
    | 'body_fat'
    | 'muscle_mass'
    | 'water_percentage'
    | 'heart_rate'
    | 'blood_pressure';
  value: number;
  unit: string;
  recorded_at: number;
  notes?: string;
}

export interface SleepLog extends BaseEntity {
  date: number; // timestamp начала дня
  bedtime: number; // timestamp отхода ко сну
  wake_time: number; // timestamp пробуждения
  duration_hours: number;
  quality: 1 | 2 | 3 | 4 | 5; // 1 - очень плохо, 5 - отлично
  deep_sleep_hours?: number;
  rem_sleep_hours?: number;
  awakenings?: number;
  notes?: string;
}

export interface Supplement extends BaseEntity {
  name: string;
  dosage: string; // "500мг", "1 капсула"
  frequency: string; // "2 раза в день"
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night';
  with_food: boolean;
  started_at?: number;
  ended_at?: number;
  notes?: string;
}

export interface SupplementLog extends BaseEntity {
  supplement_id: string;
  date: number;
  taken: boolean;
  time_taken?: number;
  notes?: string;
}
