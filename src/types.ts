export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  isTime: boolean;
}

export interface WorkoutDay {
  id: string;
  title: string;
  subtitle: string;
  cardio: string;
  exercises: WorkoutExercise[];
}

export interface SetLog {
  w: string; // weight
  r: string; // reps
  done: boolean;
}

export interface DayLog {
  __title?: string;
  __cardio?: boolean;
  [exerciseId: string]: SetLog[] | string | boolean | undefined;
}

export interface WorkoutLogs {
  [dayKey: string]: DayLog; // dayKey = dayId|YYYY-MM-DD
}

export interface MeasurementEntry {
  date: string;
  weight: number | null;
  height: number | null;
  chest: number | null;
  waist: number | null;
  arm: number | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BodyFatNavy {
  pct: number;
  cat: string;
  rec: string;
  neck: number;
  waist: number;
  hip: number | null;
  date: string;
}

export interface BodyFatAI {
  bodyFatMin: number;
  bodyFatMax: number;
  category: string;
  summary: string;
  goal: "cut" | "maintain" | "bulk";
  trainingAdvice: string;
  nutritionAdvice: string;
  date: string;
}

export interface NutritionData {
  age: string;
  gender: "m" | "f";
  activity: string; // e.g., "1.375", "1.55"
  goal: "cut" | "maintain" | "bulk";
}

export interface PremiumInfo {
  premium: boolean;
  premiumUntil: number | null;
  plan: string;
}

export interface PublicConfig {
  paymentLink: string;
  price: string;
  whatsapp: string;
}

export interface UserState {
  program: WorkoutDay[];
  logs: WorkoutLogs;
  body: MeasurementEntry[];
  nutri: NutritionData;
  bf: BodyFatNavy | null;
  ai: BodyFatAI | null;
  chat: ChatMessage[];
  _updatedAt?: number;
}
