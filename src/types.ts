export interface ExerciseGuide {
  muscleGroup: string;
  difficulty: string;
  steps: string[];
  breathing: string;
  tip: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  isTime: boolean;
  guide?: ExerciseGuide;
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
  targetWeight?: number | null;
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
  cardNo?: string;
  cardHolder?: string;
  cardBank?: string;
}

export interface ReminderSettings {
  enabled: boolean;
  time: string;
  days: number[]; // 0 = Bazar, 1 = Bazar ertəsi, 2 = Çərşənbə axşamı, 3 = Çərşənbə, 4 = Cümə axşamı, 5 = Cümə, 6 = Şənbə
  browserNotifications: boolean;
  lastNotifiedDate?: string;
  waterEnabled?: boolean;
  waterIntervalHours?: number; // every X hours
  waterStartTime?: string; // start of day water reminders
  waterEndTime?: string; // end of day water reminders
  lastWaterNotifiedTimestamp?: number; // timestamp of last notified drink water alert
}

export interface UserState {
  program: WorkoutDay[];
  logs: WorkoutLogs;
  body: MeasurementEntry[];
  nutri: NutritionData;
  bf: BodyFatNavy | null;
  ai: BodyFatAI | null;
  chat: ChatMessage[];
  reminders?: ReminderSettings;
  _updatedAt?: number;
}
