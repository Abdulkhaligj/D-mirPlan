import React, { useState, useRef, useEffect } from "react";
import { WorkoutDay, WorkoutExercise, WorkoutLogs } from "../types";
import { Plus, Trash2, Edit2, Check, ArrowUp, ArrowDown, Sparkles, AlertTriangle, Eye, RefreshCw, X, Trophy, Dumbbell, Play } from "lucide-react";
import ExerciseGuideView from "./ExerciseGuideView";
import CoachDashboard from "./CoachDashboard";

interface ProgramProps {
  program: WorkoutDay[];
  activeDay: number;
  editMode: boolean;
  logs: WorkoutLogs;
  isPremium: boolean;
  onUpdateProgram: (p: WorkoutDay[]) => void;
  onUpdateLogs: (l: WorkoutLogs) => void;
  onSetActiveDay: (day: number) => void;
  onToggleEditMode: () => void;
  onTriggerPayment: () => void;
  userContext: string;
  lang?: string;
}

const EXLIB = [
  { group: "Sinə", items: ["Bench press", "Incline bench press", "Incline dumbbell press", "Dumbbell press", "Dumbbell fly", "Cable crossover", "Chest dips", "Push-ups", "Machine chest press", "Pec deck"] },
  { group: "Kürək", items: ["Pull-ups", "Lat pulldown", "Barbell row", "Dumbbell row", "Seated cable row", "T-bar row", "Straight-arm pulldown", "Face pull", "Deadlift", "Hyperextension"] },
  { group: "Çiyin", items: ["Overhead press", "Dumbbell shoulder press", "Arnold press", "Lateral raise", "Front raise", "Rear delt fly", "Upright row", "Shrugs"] },
  { group: "Biceps", items: ["Barbell curl", "Dumbbell curl", "Hammer curl", "Preacher curl", "Incline dumbbell curl", "Cable curl", "Concentration curl"] },
  { group: "Triceps", items: ["Triceps pushdown", "Skullcrusher", "Overhead triceps extension", "Close-grip bench press", "Dips", "Cable kickback"] },
  { group: "Ayaq", items: ["Squat", "Front squat", "Goblet squat", "Leg press", "Romanian deadlift", "Lunges", "Bulgarian split squat", "Leg extension", "Leg curl", "Hip thrust", "Calf raise"] },
  { group: "Qarın / Core", items: ["Plank", "Side plank", "Crunch", "Cable crunch", "Leg raise", "Hanging knee raise", "Russian twist", "Ab wheel rollout", "Mountain climbers"] },
  { group: "Kardio", items: ["Qaçış (trenajorda)", "Sürətli yürüş", "Velosiped", "Eliptik", "İp tullanma", "Üzgüçülük", "HIIT"] },
];

const TIME_BASED = ["Plank", "Side plank", "Mountain climbers", "Qaçış (trenajorda)", "Sürətli yürüş", "Velosiped", "Eliptik", "İp tullanma", "Üzgüçülük", "HIIT"];

const PPL_TEMPLATE: WorkoutDay[] = [
  {
    id: "push-1",
    title: "PUSH",
    subtitle: "Sinə, çiyin və triceps",
    cardio: "Kardio: 10 dəqiqə sürətli qaçış",
    exercises: [
      { id: "e1", name: "Bench press", sets: 4, reps: "6-8", isTime: false },
      { id: "e2", name: "Incline dumbbell press", sets: 3, reps: "8-10", isTime: false },
      { id: "e3", name: "Dumbbell shoulder press", sets: 3, reps: "8-10", isTime: false },
      { id: "e4", name: "Lateral raise", sets: 4, reps: "12-15", isTime: false },
      { id: "e5", name: "Triceps pushdown", sets: 3, reps: "10-12", isTime: false },
    ],
  },
  {
    id: "pull-1",
    title: "PULL",
    subtitle: "Kürək, biceps və çiyin arxası",
    cardio: "Kardio: 10 dəqiqə velosiped",
    exercises: [
      { id: "e6", name: "Pull-ups", sets: 4, reps: "8-10", isTime: false },
      { id: "e7", name: "Barbell row", sets: 4, reps: "6-8", isTime: false },
      { id: "e8", name: "Seated cable row", sets: 3, reps: "10", isTime: false },
      { id: "e9", name: "Face pull", sets: 3, reps: "12-15", isTime: false },
      { id: "e10", name: "Dumbbell curl", sets: 3, reps: "8-10", isTime: false },
    ],
  },
  {
    id: "rest-1",
    title: "İSTİRAHƏT",
    subtitle: "Aktiv bərpa günü",
    cardio: "30 dəqiqə təmiz havada sürətli yürüş",
    exercises: [],
  },
  {
    id: "legs-1",
    title: "LEGS + CORE",
    subtitle: "Ayaq və qarın əzələləri",
    cardio: "",
    exercises: [
      { id: "e11", name: "Squat", sets: 4, reps: "6-8", isTime: false },
      { id: "e12", name: "Romanian deadlift", sets: 3, reps: "8-10", isTime: false },
      { id: "e13", name: "Leg press", sets: 3, reps: "10-12", isTime: false },
      { id: "e14", name: "Leg curl", sets: 3, reps: "12", isTime: false },
      { id: "e15", name: "Calf raise", sets: 4, reps: "15", isTime: false },
      { id: "e16", name: "Plank", sets: 3, reps: "45-60", isTime: true },
    ],
  },
  {
    id: "upper-1",
    title: "UPPER",
    subtitle: "Üst bədən həcmi",
    cardio: "Kardio: 15 dəqiqə eliptik",
    exercises: [
      { id: "e17", name: "Incline bench press", sets: 4, reps: "8", isTime: false },
      { id: "e18", name: "Lat pulldown", sets: 4, reps: "8-10", isTime: false },
      { id: "e19", name: "Arnold press", sets: 3, reps: "10", isTime: false },
      { id: "e20", name: "Hammer curl", sets: 3, reps: "10", isTime: false },
      { id: "e21", name: "Skullcrusher", sets: 3, reps: "10", isTime: false },
    ],
  },
  {
    id: "cardio-1",
    title: "KARDİO",
    subtitle: "Ürək-damar dözümlülüyü",
    cardio: "30-40 dəqiqə HIIT və ya orta sürətli qaçış",
    exercises: [],
  },
  {
    id: "rest-2",
    title: "İSTİRAHƏT",
    subtitle: "Tam bərpa günü",
    cardio: "",
    exercises: [],
  },
];

const BOXING_TEMPLATE: WorkoutDay[] = [
  {
    id: "box-1",
    title: "BOKS: SÜRƏT & TEXNİKA",
    subtitle: "Shadowboxing, sürət kisəsi və kombinasiyalar",
    cardio: "Kardio: 15 dəqiqə ip tullanma",
    exercises: [
      { id: "b1", name: "Shadowboxing (Kombinasiyalarla)", sets: 3, reps: "180", isTime: true },
      { id: "b2", name: "Heavy Bag (Ağır kisə məşqi)", sets: 4, reps: "180", isTime: true },
      { id: "b3", name: "Speed Bag (Sürət kisəsi)", sets: 3, reps: "120", isTime: true },
      { id: "b4", name: "Double-end Bag (Koordinasiya)", sets: 3, reps: "120", isTime: true },
      { id: "b5", name: "Medicine Ball Slams", sets: 3, reps: "15", isTime: false },
    ],
  },
  {
    id: "box-2",
    title: "BOKS: GÜC & CORE",
    subtitle: "Döyüşçü gücü və dözümlülük",
    cardio: "Kardio: 10 dəqiqə interval qaçış (HIIT)",
    exercises: [
      { id: "b6", name: "Dumbbell shoulder press (Çiyin dözümlülüyü)", sets: 3, reps: "12", isTime: false },
      { id: "b7", name: "Explosive Push-ups", sets: 4, reps: "15", isTime: false },
      { id: "b8", name: "Pull-ups", sets: 3, reps: "8-10", isTime: false },
      { id: "b9", name: "Russian twist (Core gücü)", sets: 4, reps: "25", isTime: false },
      { id: "b10", name: "Plank", sets: 3, reps: "60", isTime: true },
    ],
  },
  {
    id: "box-3",
    title: "İSTİRAHƏT GÜNÜ",
    subtitle: "Bərpa və əsnəmə",
    cardio: "Yüngül gəzinti və əzələlərin dartılması",
    exercises: [],
  },
  {
    id: "box-4",
    title: "BOKS: REAKSİYA & AYAQ İŞİ",
    subtitle: "Çeviklik nərdivanı və reaksiya topları",
    cardio: "Kardio: 15 dəqiqə velosiped",
    exercises: [
      { id: "b11", name: "Agility ladder drills (Çeviklik nərdivanı)", sets: 4, reps: "60", isTime: true },
      { id: "b12", name: "Burpees", sets: 3, reps: "12-15", isTime: false },
      { id: "b13", name: "Jump squats (Partlayıcı güc)", sets: 3, reps: "15", isTime: false },
      { id: "b14", name: "High knees", sets: 3, reps: "45", isTime: true },
    ],
  },
  {
    id: "box-5",
    title: "İSTİRAHƏT GÜNÜ",
    subtitle: "Tam bərpa",
    cardio: "",
    exercises: [],
  },
];

const JUDO_TEMPLATE: WorkoutDay[] = [
  {
    id: "judo-1",
    title: "CÜDO: TUTUŞ & UCHIKOMI",
    subtitle: "Grip fighting, dəsmal ilə turnik və girişlər",
    cardio: "Kardio: 10 dəqiqə ip tullanma",
    exercises: [
      { id: "j1", name: "Uchikomi drill (Kölgə tullama girişləri)", sets: 5, reps: "30", isTime: true },
      { id: "j2", name: "Towel Pull-ups (Dəsmal ilə turnik - Tutuş üçün)", sets: 4, reps: "8-10", isTime: false },
      { id: "j3", name: "Plate Pinch Hold (Barmaq gücü)", sets: 3, reps: "45", isTime: true },
      { id: "j4", name: "Barbell clean & press", sets: 3, reps: "6-8", isTime: false },
    ],
  },
  {
    id: "judo-2",
    title: "CÜDO: PARTLAYICI GÜC",
    subtitle: "Bədəni qaldırma və fırlatma gücü",
    cardio: "Kardio: 12 dəqiqə qaçış",
    exercises: [
      { id: "j5", name: "Deadlift (Kürək və bel gücü)", sets: 4, reps: "5", isTime: false },
      { id: "j6", name: "Push-ups on knuckles", sets: 4, reps: "15", isTime: false },
      { id: "j7", name: "Medicine Ball Slams", sets: 3, reps: "12", isTime: false },
      { id: "j8", name: "Hanging knee raise", sets: 3, reps: "12", isTime: false },
    ],
  },
  {
    id: "judo-3",
    title: "İSTİRAHƏT GÜNÜ",
    subtitle: "Əzələlərin bərpası",
    cardio: "Dartınma hərəkətləri",
    exercises: [],
  },
];

const KARATE_TEMPLATE: WorkoutDay[] = [
  {
    id: "karate-1",
    title: "KARATE: KIHON & KATALAR",
    subtitle: "Kombinasiyalar, tək və cüt zərbələr",
    cardio: "Kardio: 10 dəqiqə yüngül qaçış",
    exercises: [
      { id: "k1", name: "Kihon (Zərbə texnikası sürəti)", sets: 4, reps: "180", isTime: true },
      { id: "k2", name: "Explosive Push-ups", sets: 3, reps: "12", isTime: false },
      { id: "k3", name: "Hip rotation drills with band", sets: 3, reps: "15", isTime: false },
      { id: "k4", name: "Side-to-side shuffle", sets: 4, reps: "45", isTime: true },
    ],
  },
  {
    id: "karate-2",
    title: "KARATE: BALANS & ÇEVİKLİK",
    subtitle: "Tək ayaq üstündə balans və dözümlülük",
    cardio: "Kardio: 15 dəqiqə velosiped",
    exercises: [
      { id: "k5", name: "Single-leg squats (Balans squatı)", sets: 3, reps: "8", isTime: false },
      { id: "k6", name: "Kettlebell swings (Partlayıcı bud gücü)", sets: 4, reps: "15", isTime: false },
      { id: "k7", name: "Plank with shoulder taps", sets: 3, reps: "45", isTime: true },
      { id: "k8", name: "Full stretch (Tam bədən əsnəmə)", sets: 1, reps: "600", isTime: true },
    ],
  },
  {
    id: "karate-3",
    title: "İSTİRAHƏT GÜNÜ",
    subtitle: "Tam bərpa günü",
    cardio: "",
    exercises: [],
  },
];

const FOOTBALL_TEMPLATE: WorkoutDay[] = [
  {
    id: "foot-1",
    title: "FUTBOL: SÜRƏT & KOORDİNASİYA",
    subtitle: "Sprintlər, künc maneələri və ziqzaq qaçış",
    cardio: "Kardio: 15 dəqiqə interval qaçış",
    exercises: [
      { id: "f1", name: "Sprint intervals (30m x 6)", sets: 1, reps: "180", isTime: true },
      { id: "f2", name: "Agility cone drills (Ziqzaq maneə keçidi)", sets: 4, reps: "45", isTime: true },
      { id: "f3", name: "Jump squats (Partlayıcı sıçrayış)", sets: 3, reps: "12", isTime: false },
      { id: "f4", name: "Plank with rotation (Core balansı)", sets: 3, reps: "45", isTime: true },
    ],
  },
  {
    id: "foot-2",
    title: "FUTBOL: AYAQ GÜCÜ & PLYOMETRİKA",
    subtitle: "Aşağı bədən dözümlülüyü və zədə önləmə",
    cardio: "Kardio: 10 dəqiqə eliptik",
    exercises: [
      { id: "f5", name: "Bulgarian split squat", sets: 3, reps: "10", isTime: false },
      { id: "f6", name: "Goblet squat", sets: 3, reps: "12", isTime: false },
      { id: "f7", name: "Swiss ball hamstring curls", sets: 3, reps: "12", isTime: false },
      { id: "f8", name: "Calf raise (Kürü əzələsi)", sets: 4, reps: "15", isTime: false },
    ],
  },
  {
    id: "foot-3",
    title: "İSTİRAHƏT GÜNÜ",
    subtitle: "Aktiv bərpa",
    cardio: "Yüngül yürüş və dartınmalar",
    exercises: [],
  },
];

export default function Program({
  program,
  activeDay,
  editMode,
  logs,
  isPremium,
  onUpdateProgram,
  onUpdateLogs,
  onSetActiveDay,
  onToggleEditMode,
  onTriggerPayment,
  userContext,
  lang = "az",
}: ProgramProps) {
  const tDict = {
    az: {
      programTitle: "Sənin Məşq Proqramın",
      programSubtitle: "Hələ heç bir məşq günü təyin etməmisiniz. Sürətli bir başlanğıc üçün hazır şablondan istifadə edin və ya Aİ köməkçimizə fərdi proqram hazırladın!",
      startManual: "✏️ Sıfırdan Özüm Quracam",
      aiGenerate: "🤖 Aİ Fərdi Proqram Yaratsın",
      loadTemplate: "📋 Hazır Şablon Yüklə (PPL — 7 Günlük)",
      aiBuilder: "🤖 Aİ Proqram Qurucusu",
      premiumNotice: "Aİ ilə məşq proqramının yaradılması Premium xüsusiyyətdir. Klikləyin və saniyələr içində Premium əldə edin!",
      goal: "Məqsəd",
      weeklyDays: "Həftəlik gün",
      level: "Səviyyə",
      equipment: "Avadanlıq",
      specialNotes: "Xüsusi qeydlər (İstəyə bağlı)",
      specialNotesPlaceholder: "Məs. Sol dizim zədəlidir, ayaq məşqi çox ağır olmasın",
      createProgramBtn: "Proqramı Yaradın",
      aiGenerating: "Aİ proqramınızı hazırlayır...",
      workouts: "Məşqlər",
      coach: "Məşqçi",
      add: "Əlavə et",
      save: "Yadda Saxla",
      editProgram: "✏️ Proqramı Dəyiş",
      dayNamePlaceholder: "Gün adı (məs. PUSH)",
      shortSubtitle: "Qısa alt başlıq",
      repsBased: "Təkrar əsaslı",
      timeBased: "Saniyə (Vaxt əsaslı)",
      addExercise: "Hərəkət Əlavə Et",
      cardioNotes: "Günün Kardio Qeydi (istəyə bağlı)",
      cardioPlaceholder: "Məs. 15 dəqiqə sürətli qaçış",
      deleteDay: "🗑️ Bu Məşq Gününü Sil",
      resetProgram: "Bütün Proqramı Sıfırla",
      restDayTitle: "İstirahət Günü",
      restDayDesc: "Əzələləriniz dincələrkən böyüyür və inkişaf edir. Tam bərpa olunmaq üçün yaxşıca dincəlin və kifayət qədər su için.",
      completedBadge: "✓ Tamamlandı",
      sets: "set",
      reps: "təkrar",
      seconds: "saniyə",
      cardioActivity: "🏃 Kardio fəaliyyəti",
      pickExercise: "Hərəkət Seçin",
      searchOrAdd: "Axtar və ya yenisini əlavə et",
      exercisePlaceholder: "Məs. Arnold press",
      createBtn: "Yarat",
      
      // Goal select values
      g1: "Kütlə yığma (Hacm)",
      g2: "Arıqlama (Defisit)",
      g3: "Güc artırma",
      g4: "Ümumi forma qoruma",
      
      // Level select values
      l1: "Başlanğıc (Beginner)",
      l2: "Orta (Intermediate)",
      l3: "İrəli (Advanced)",
      
      // Equipment select values
      e1: "Tam Təchizatlı Zal",
      e2: "Ev (Dumbbell + Turnik)",
      e3: "Yalnız Bədən Çəkisi (Calisthenics)",
      
      daysShort: "GÜN",
      daysCount: "Gün",
      videoGuide: "Video Təlimat",
      sportsSectionTitle: "🏆 İdman Növləri üzrə Hazır Şablonlar",
      sportsSectionDesc: "Müəyyən bir idman növü ilə məşğul olursunuzsa, aşağıdakı hazır peşəkar proqramlardan birini yükləyə bilərsiniz:",
      loadBoxing: "🥊 Boks Proqramı",
      loadJudo: "🥋 Cüdo Proqramı",
      loadKarate: "🥋 Karate Proqramı",
      loadFootball: "⚽ Futbol Proqramı",
      sportType: "İdman növü / Fokus",
      sportFitness: "Fitness / Bodibildinq",
      sportBoxing: "Boks",
      sportJudo: "Cüdo",
      sportKarate: "Karate",
      sportFootball: "Futbol",
      boxSub: "5 Günlük boks & güc",
      judoSub: "3 Günlük cüdo & tutuş",
      karateSub: "3 Günlük balans & kata",
      footballSub: "3 Günlük sürət & çeviklik",
      targetDaySelector: "🎯 Hədəf məşq günü"
    },
    en: {
      programTitle: "Your Workout Program",
      programSubtitle: "You haven't planned any training days yet. Load our curated template to start fast, or let our AI customizer build a tailored schedule!",
      startManual: "✏️ Set Up From Scratch",
      aiGenerate: "🤖 Build with AI Customizer",
      loadTemplate: "📋 Load Curated Template (PPL — 7 Days)",
      aiBuilder: "🤖 AI Program Architect",
      premiumNotice: "Generating customized routines with AI is a Premium benefit. Upgrade to premium now to unlock instantly!",
      goal: "Goal",
      weeklyDays: "Weekly Frequency",
      level: "Level",
      equipment: "Equipment",
      specialNotes: "Special Notes (Optional)",
      specialNotesPlaceholder: "e.g., Avoid heavy knee compression, focusing on upper volume",
      createProgramBtn: "Generate Custom Routine",
      aiGenerating: "AI is tailoring your routine...",
      workouts: "Workouts",
      coach: "Coach",
      add: "Add Day",
      save: "Save Plan",
      editProgram: "✏️ Edit Exercises",
      dayNamePlaceholder: "Day Title (e.g., PUSH)",
      shortSubtitle: "Brief subtitle",
      repsBased: "Reps based",
      timeBased: "Time based (Sec)",
      addExercise: "Add New Exercise",
      cardioNotes: "Cardio Logs for the Day (Optional)",
      cardioPlaceholder: "e.g., 15 minutes incline fast walk",
      deleteDay: "🗑️ Delete This Workout Day",
      resetProgram: "Reset Entire Schedule",
      restDayTitle: "Active Recovery / Rest Day",
      restDayDesc: "Muscles reconstruct and grow during recovery hours. Prioritize high-quality sleep and maintain optimal hydration today.",
      completedBadge: "✓ Completed",
      sets: "sets",
      reps: "reps",
      seconds: "sec",
      cardioActivity: "🏃 Cardio Activity",
      pickExercise: "Choose Exercise",
      searchOrAdd: "Search or type new movement",
      exercisePlaceholder: "e.g., Arnold press",
      createBtn: "Create",
      
      // Goal select values
      g1: "Hypertrophy (Bulking)",
      g2: "Fat Loss (Cutting)",
      g3: "Power / Strength",
      g4: "General Conditioning",
      
      // Level select values
      l1: "Beginner",
      l2: "Intermediate",
      l3: "Advanced",
      
      // Equipment select values
      e1: "Fully Equipped Gym",
      e2: "Home Gym (Dumbbell + Pullups)",
      e3: "Bodyweight Only (Calisthenics)",
      
      daysShort: "DAY",
      daysCount: "Days",
      videoGuide: "Video Guide",
      sportsSectionTitle: "🏆 Sport-Specific Ready Templates",
      sportsSectionDesc: "If you train in a specific sport, you can choose and instantly load one of our tailored athletic templates below:",
      loadBoxing: "🥊 Boxing Program",
      loadJudo: "🥋 Judo Program",
      loadKarate: "🥋 Karate Program",
      loadFootball: "⚽ Football Program",
      sportType: "Sport Type / Focus",
      sportFitness: "Fitness / Bodybuilding",
      sportBoxing: "Boxing",
      sportJudo: "Judo",
      sportKarate: "Karate",
      sportFootball: "Football",
      boxSub: "5 Days boxing & conditioning",
      judoSub: "3 Days judo & grip hold",
      karateSub: "3 Days karate & balance",
      footballSub: "3 Days speed & agility",
      targetDaySelector: "🎯 Target training day"
    },
    ru: {
      programTitle: "Ваша Программа Тренировок",
      programSubtitle: "У вас пока не добавлено ни одного тренировочного дня. Загрузите готовый шаблон для быстрого старта или сгенерируйте индивидуальную программу с помощью ИИ!",
      startManual: "✏️ Создать программу вручную",
      aiGenerate: "🤖 Создать с помощью ИИ",
      loadTemplate: "📋 Загрузить шаблон (PPL — 7 Дней)",
      aiBuilder: "🤖 ИИ-Конструктор Программ",
      premiumNotice: "Создание программ тренировок с помощью ИИ — это Premium функция. Получите Premium доступ за пару кликов!",
      goal: "Спортивная цель",
      weeklyDays: "Дней в неделю",
      level: "Ваш уровень",
      equipment: "Оборудование",
      specialNotes: "Особые пожелания (Необязательно)",
      specialNotesPlaceholder: "Напр. Травмировано левое колено, не давать большую нагрузку на ноги",
      createProgramBtn: "Сформировать Программу",
      aiGenerating: "ИИ составляет вашу программу...",
      workouts: "Тренировки",
      coach: "Тренер",
      add: "Добавить",
      save: "Сохранить",
      editProgram: "✏️ Изменить Программу",
      dayNamePlaceholder: "Название дня (напр., ЖИМ)",
      shortSubtitle: "Краткое описание",
      repsBased: "На повторения",
      timeBased: "На время (Секунды)",
      addExercise: "Добавить Упражнение",
      cardioNotes: "Кардио-тренировка дня (Необязательно)",
      cardioPlaceholder: "Напр. 15 минут быстрого бега",
      deleteDay: "🗑️ Удалить этот день тренировок",
      resetProgram: "Сбросить всю программу",
      restDayTitle: "День Отдыха",
      restDayDesc: "Мышцы восстанавливаются и растут во время отдыха. Уделите внимание сну и пейте достаточное количество воды.",
      completedBadge: "✓ Выполнено",
      sets: "сетов",
      reps: "повт",
      seconds: "сек",
      cardioActivity: "🏃 Кардио активность",
      pickExercise: "Выберите упражнение",
      searchOrAdd: "Поиск или новое движение",
      exercisePlaceholder: "Напр. Арнольд пресс",
      createBtn: "Создать",
      
      // Goal select values
      g1: "Набор массы (Объем)",
      g2: "Снижение веса (Сушка)",
      g3: "Развитие силы",
      g4: "Общая физподготовка",
      
      // Level select values
      l1: "Новичок (Beginner)",
      l2: "Средний (Intermediate)",
      l3: "Продвинутый (Advanced)",
      
      // Equipment select values
      e1: "Тренажерный зал",
      e2: "Дом (Гантели + Турник)",
      e3: "Собственный вес (Калистеника)",
      
      daysShort: "ДЕНЬ",
      daysCount: "Дней",
      videoGuide: "Видео-инструкция",
      sportsSectionTitle: "🏆 Шаблоны по Видам Спорта",
      sportsSectionDesc: "Если вы занимаетесь конкретным видом спорта, вы можете выбрать и сразу загрузить одну из программ ниже:",
      loadBoxing: "🥊 Программа Бокса",
      loadJudo: "🥋 Программа Дзюдо",
      loadKarate: "🥋 Программа Карате",
      loadFootball: "⚽ Программа Футбола",
      sportType: "Вид спорта / Направление",
      sportFitness: "Фитнес / Бодибилдинг",
      sportBoxing: "Бокс",
      sportJudo: "Дзюдо",
      sportKarate: "Карате",
      sportFootball: "Футбол",
      boxSub: "5 Дней бокса и ОФП",
      judoSub: "3 Дня дзюдо и хвата",
      karateSub: "3 Дня карате и баланса",
      footballSub: "3 Дня скорости и ловкости",
      targetDaySelector: "🎯 Целевой день тренировки"
    },
    de: {
      programTitle: "Dein Trainingsprogramm",
      programSubtitle: "Du hast noch keine Trainingstage geplant. Lade unsere Vorlage, um schnell zu starten, oder lass unseren KI-Assistenten einen maßgeschneiderten Plan erstellen!",
      startManual: "✏️ Von Grund auf neu erstellen",
      aiGenerate: "🤖 Mit KI-Assistent erstellen",
      loadTemplate: "📋 Vorlage laden (PPL — 7 Tage)",
      aiBuilder: "🤖 KI-Programm-Architekt",
      premiumNotice: "Die Erstellung von maßgeschneiderten Plänen mit KI ist eine Premium-Funktion. Upgrade jetzt auf Premium, um sie sofort freizuschalten!",
      goal: "Ziel",
      weeklyDays: "Wöchentliche Frequenz",
      level: "Niveau",
      equipment: "Ausrüstung",
      specialNotes: "Besondere Hinweise (Optional)",
      specialNotesPlaceholder: "z.B. Keine schwere Kniebelastung, Fokus auf Oberkörper",
      createProgramBtn: "Individuellen Plan erstellen",
      aiGenerating: "KI schneidert deinen Trainingsplan...",
      workouts: "Workouts",
      coach: "Coach",
      add: "Tag hinzufügen",
      save: "Plan speichern",
      editProgram: "✏️ Übungen bearbeiten",
      dayNamePlaceholder: "Titel des Tages (z.B. PUSH)",
      shortSubtitle: "Kurzer Untertitel",
      repsBased: "Wiederholungsbasiert",
      timeBased: "Zeitbasiert (Sek.)",
      addExercise: "Neue Übung hinzufügen",
      cardioNotes: "Cardio-Protokoll für den Tag (Optional)",
      cardioPlaceholder: "z.B. 15 Minuten Steigung schnelles Gehen",
      deleteDay: "🗑️ Diesen Trainingstag löschen",
      resetProgram: "Gesamten Plan zurücksetzen",
      restDayTitle: "Aktive Regeneration / Ruhetag",
      restDayDesc: "Muskeln regenerieren und wachsen in den Ruhephasen. Achte heute auf qualitativ hochwertigen Schlaf und eine optimale Flüssigkeitszufuhr.",
      completedBadge: "✓ Abgeschlossen",
      sets: "Sätze",
      reps: "Wdh.",
      seconds: "Sek.",
      cardioActivity: "🏃 Cardio-Aktivität",
      pickExercise: "Übung wählen",
      searchOrAdd: "Suchen oder neue Übung eingeben",
      exercisePlaceholder: "z.B. Arnold Press",
      createBtn: "Erstellen",
      
      // Goal select values
      g1: "Muskelaufbau (Massephase)",
      g2: "Gewichtsverlust (Defizit)",
      g3: "Kraft / Power",
      g4: "Allgemeine Fitness",
      
      // Level select values
      l1: "Anfänger",
      l2: "Fortgeschritten",
      l3: "Profi",
      
      // Equipment select values
      e1: "Voll ausgestattetes Studio",
      e2: "Heimstudio (Kurzhanteln + Klimmzugstange)",
      e3: "Nur Eigengewicht (Calisthenics)",
      
      daysShort: "TAG",
      daysCount: "Tage",
      videoGuide: "Video-Anleitung",
      sportsSectionTitle: "🏆 Sportspezifische fertige Vorlagen",
      sportsSectionDesc: "Wenn Sie eine bestimmte Sportart trainieren, können Sie unten eine unserer maßgeschneiderten athletischen Vorlagen auswählen und sofort laden:",
      loadBoxing: "🥊 Boxprogramm",
      loadJudo: "🥋 Judoprogramm",
      loadKarate: "🥋 Karateprogramm",
      loadFootball: "⚽ Fußballprogramm",
      sportType: "Sportart / Fokus",
      sportFitness: "Fitness / Bodybuilding",
      sportBoxing: "Boxen",
      sportJudo: "Judo",
      sportKarate: "Karate",
      sportFootball: "Fußball",
      boxSub: "5 Tage Boxen & Kraft",
      judoSub: "3 Tage Judo & Griffkraft",
      karateSub: "3 Tage Balance & Kata",
      footballSub: "3 Tage Schnelligkeit & Beweglichkeit",
      targetDaySelector: "🎯 Ziel-Trainingstag"
    }
  };

  const t = tDict[lang as "az" | "en" | "de" | "ru" || "az"] || tDict["en"];
  const [showGenForm, setShowGenForm] = useState(false);
  const [genGoal, setGenGoal] = useState("kütlə yığma");
  const [genDays, setGenDays] = useState(5);
  const [genLevel, setGenLevel] = useState("orta");
  const [genEquip, setGenEquip] = useState("tam təchizatlı zal");
  const [genNotes, setGenNotes] = useState("");
  const [genSport, setGenSport] = useState("fitness");
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const [showPicker, setShowPicker] = useState<number | null>(null);
  const [pickerTargetDayIdx, setPickerTargetDayIdx] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [customExName, setCustomExName] = useState("");

  useEffect(() => {
    if (showPicker !== null) {
      setPickerTargetDayIdx(showPicker);
    }
  }, [showPicker]);

  const [openExercises, setOpenExercises] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<"workouts" | "coach">("workouts");

  // Real-time Veo Video Guide State
  const [videoModalExercise, setVideoModalExercise] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoOpName, setVideoOpName] = useState<string | null>(null);
  const videoPollInterval = useRef<any>(null);

  const handleOpenVideoGuide = async (exerciseName: string) => {
    if (!isPremium) {
      onTriggerPayment();
      return;
    }

    setVideoModalExercise(exerciseName);
    setVideoLoading(true);
    setVideoUrl(null);
    setVideoError(null);
    setVideoStatus(lang === "ru" ? "Отправка запроса в Veo..." : lang === "en" ? "Sending request to Veo..." : "Sorğu Veo modelinə göndərilir...");

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `A professional fitness trainer showing the correct form of ${exerciseName} exercise, clean instruction, perfect form`,
          aspectRatio: "16:9",
          lang,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const opName = data.operationName;
      setVideoOpName(opName);
      setVideoStatus(lang === "ru" ? "Veo создает видео... (Поллинг запущен)" : lang === "en" ? "Veo is generating video... (Polling started)" : "Süni Zəka modeli hərəkət mexanikasını təhlil edir və video hazırlayır...");

      // Poll status every 8 seconds
      videoPollInterval.current = setInterval(() => {
        pollVideoStatus(opName);
      }, 8000);

    } catch (err: any) {
      setVideoError(err.message);
      setVideoLoading(false);
    }
  };

  const pollVideoStatus = async (opName: string) => {
    try {
      const res = await fetch("/api/video-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationName: opName }),
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.done) {
        if (videoPollInterval.current) {
          clearInterval(videoPollInterval.current);
        }
        setVideoStatus(lang === "ru" ? "Видео готово! Загрузка..." : lang === "en" ? "Video is ready! Downloading..." : "Video tam hazırdır! Yüklənir...");
        downloadGeneratedVideo(opName);
      } else {
        setVideoStatus(lang === "ru" ? "Veo все еще генерирует видео..." : lang === "en" ? "Veo is still generating video..." : "Veo hələ işləyir... Reallaşdırılır...");
      }
    } catch (err: any) {
      setVideoError(lang === "ru" ? "Ошибка проверки статуса: " + err.message : lang === "en" ? "Status check error: " + err.message : "Status yoxlama xətası: " + err.message);
      if (videoPollInterval.current) {
        clearInterval(videoPollInterval.current);
      }
      setVideoLoading(false);
    }
  };

  const downloadGeneratedVideo = async (opName: string) => {
    try {
      const res = await fetch("/api/video-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationName: opName }),
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to download video");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setVideoStatus("Tamamlandı ✓");
    } catch (err: any) {
      setVideoError(lang === "ru" ? "Не удалось загрузить видео: " + err.message : lang === "en" ? "Failed to download video: " + err.message : "Video endirilə bilmədi: " + err.message);
    } finally {
      setVideoLoading(false);
    }
  };

  const handleCloseVideoModal = () => {
    if (videoPollInterval.current) {
      clearInterval(videoPollInterval.current);
    }
    setVideoModalExercise(null);
    setVideoUrl(null);
    setVideoLoading(false);
    setVideoError(null);
    setVideoStatus("");
  };

  useEffect(() => {
    return () => {
      if (videoPollInterval.current) {
        clearInterval(videoPollInterval.current);
      }
    };
  }, []);

  const todayISO = new Date().toISOString().slice(0, 10);
  const activeDaySafe = Math.min(activeDay, program.length - 1);
  const currentDay = program[activeDaySafe];

  const logKey = currentDay ? `${currentDay.id}|${todayISO}` : "";
  const currentLog = logKey ? logs[logKey] || {} : {};

  // Compute stats
  const totalSets = currentDay ? currentDay.exercises.reduce((acc, ex) => acc + (Number(ex.sets) || 0), 0) : 0;
  const doneSets = currentDay
    ? currentDay.exercises.reduce((acc, ex) => {
        const setLogs = currentLog[ex.id];
        const doneInEx = Array.isArray(setLogs) ? setLogs.filter((s) => s && s.done).length : 0;
        return acc + doneInEx;
      }, 0)
    : 0;
  const completionPct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : currentLog.__cardio ? 100 : 0;

  const toggleExOpen = (exId: string) => {
    setOpenExercises((prev) => ({ ...prev, [exId]: !prev[exId] }));
  };

  const handleStartManual = () => {
    const newProg: WorkoutDay[] = [
      { id: `day-${Date.now()}`, title: "GÜN 1", subtitle: "Məşq proqramı", cardio: "", exercises: [] },
    ];
    onUpdateProgram(newProg);
    onSetActiveDay(0);
    onToggleEditMode();
  };

  const handleLoadTemplate = () => {
    onUpdateProgram(PPL_TEMPLATE);
    onSetActiveDay(0);
  };

  const handleAddDay = () => {
    const newDay: WorkoutDay = {
      id: `day-${Date.now()}`,
      title: `GÜN ${program.length + 1}`,
      subtitle: "Yeni fokus sahəsi",
      cardio: "",
      exercises: [],
    };
    onUpdateProgram([...program, newDay]);
    onSetActiveDay(program.length);
  };

  const handleDelDay = (index: number) => {
    if (!confirm("Bu məşq gününü tamamilə silmək istəyirsiniz?")) return;
    const newProg = [...program];
    newProg.splice(index, 1);
    onUpdateProgram(newProg);
    onSetActiveDay(Math.max(0, index - 1));
  };

  const handleResetProgram = () => {
    if (!confirm("Bütün məşq proqramınız silinəcək (keçmiş tarixçəniz qalacaq). Davam edilsin?")) return;
    onUpdateProgram([]);
  };

  const handleEditDayField = (field: keyof WorkoutDay, val: string) => {
    const newProg = [...program];
    newProg[activeDaySafe] = { ...newProg[activeDaySafe], [field]: val } as any;
    onUpdateProgram(newProg);
  };

  const handleEditExField = (exIndex: number, field: keyof WorkoutExercise, val: any) => {
    const newProg = [...program];
    const newExs = [...newProg[activeDaySafe].exercises];
    newExs[exIndex] = { ...newExs[exIndex], [field]: val } as any;
    newProg[activeDaySafe] = { ...newProg[activeDaySafe], exercises: newExs };
    onUpdateProgram(newProg);
  };

  const handleDelEx = (exIndex: number) => {
    const newProg = [...program];
    const newExs = [...newProg[activeDaySafe].exercises];
    newExs.splice(exIndex, 1);
    newProg[activeDaySafe] = { ...newProg[activeDaySafe], exercises: newExs };
    onUpdateProgram(newProg);
  };

  const handleMoveEx = (exIndex: number, dir: number) => {
    const newProg = [...program];
    const newExs = [...newProg[activeDaySafe].exercises];
    const targetIdx = exIndex + dir;
    if (targetIdx < 0 || targetIdx >= newExs.length) return;
    const temp = newExs[exIndex];
    newExs[exIndex] = newExs[targetIdx];
    newExs[targetIdx] = temp;
    newProg[activeDaySafe] = { ...newProg[activeDaySafe], exercises: newExs };
    onUpdateProgram(newProg);
  };

  const handleUpdateGuide = (exIndex: number, newGuide: any) => {
    const newProg = [...program];
    const newExs = [...newProg[activeDaySafe].exercises];
    newExs[exIndex] = { ...newExs[exIndex], guide: newGuide };
    newProg[activeDaySafe] = { ...newProg[activeDaySafe], exercises: newExs };
    onUpdateProgram(newProg);
  };

  const handlePickExercise = (exName: string) => {
    const targetIdx = pickerTargetDayIdx >= 0 && pickerTargetDayIdx < program.length ? pickerTargetDayIdx : activeDaySafe;
    const newProg = [...program];
    const isTime = TIME_BASED.some((t) => exName.toLowerCase().includes(t.toLowerCase()));
    const newEx: WorkoutExercise = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: exName,
      sets: 3,
      reps: isTime ? "45-60" : "10",
      isTime,
    };
    newProg[targetIdx].exercises.push(newEx);
    onUpdateProgram(newProg);
    setShowPicker(null);
  };

  const handleSetVal = (exId: string, setIndex: number, field: "w" | "r", val: string) => {
    const newLogs = { ...logs };
    if (!newLogs[logKey]) newLogs[logKey] = {};
    const dayLog = newLogs[logKey];
    dayLog.__title = currentDay.title;

    if (!dayLog[exId]) dayLog[exId] = [];
    const arr = dayLog[exId] as any[];

    while (arr.length <= setIndex) {
      arr.push({ w: "", r: "", done: false });
    }
    arr[setIndex][field] = val;
    onUpdateLogs(newLogs);
  };

  const handleToggleDone = (exId: string, setIndex: number) => {
    const newLogs = { ...logs };
    if (!newLogs[logKey]) newLogs[logKey] = {};
    const dayLog = newLogs[logKey];
    dayLog.__title = currentDay.title;

    if (!dayLog[exId]) dayLog[exId] = [];
    const arr = dayLog[exId] as any[];

    const currentEx = currentDay.exercises.find((e) => e.id === exId);

    while (arr.length <= setIndex) {
      arr.push({ w: "", r: currentEx ? currentEx.reps : "10", done: false });
    }
    arr[setIndex].done = !arr[setIndex].done;
    onUpdateLogs(newLogs);
  };

  const handleToggleCardio = () => {
    const newLogs = { ...logs };
    if (!newLogs[logKey]) newLogs[logKey] = {};
    const dayLog = newLogs[logKey];
    dayLog.__title = currentDay.title;
    dayLog.__cardio = !dayLog.__cardio;
    onUpdateLogs(newLogs);
  };

  // AI-Powered generation call
  const handleAIGenerate = async () => {
    if (!isPremium) {
      onTriggerPayment();
      return;
    }
    setGenLoading(true);
    setGenError(null);
    try {
      const res = await fetch("/api/generate-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: genGoal,
          days: genDays,
          level: genLevel,
          equipment: genEquip,
          notes: genNotes,
          sport: genSport,
          userContext,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.days && Array.isArray(data.days)) {
        const formattedDays: WorkoutDay[] = data.days.map((d: any, idx: number) => ({
          id: `ai-day-${idx}-${Date.now()}`,
          title: d.title || `GÜN ${idx + 1}`,
          subtitle: d.subtitle || "",
          cardio: d.cardio || "",
          exercises: (d.exercises || []).map((e: any, eIdx: number) => ({
            id: `ai-ex-${idx}-${eIdx}-${Date.now()}`,
            name: e.name || "Məşq",
            sets: Number(e.sets) || 3,
            reps: String(e.reps) || "10",
            isTime: TIME_BASED.some((t) => (e.name || "").toLowerCase().includes(t.toLowerCase())),
          })),
        }));

        onUpdateProgram(formattedDays);
        onSetActiveDay(0);
        setShowGenForm(false);
      } else {
        throw new Error("Proqram düzgün formatda deyil.");
      }
    } catch (err: any) {
      setGenError(err.message || "Aİ ilə proqram yaradılarkən xəta baş verdi.");
    } finally {
      setGenLoading(false);
    }
  };

  const filteredExLib = EXLIB.map((g) => ({
    group: g.group,
    items: g.items.filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase())),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      {/* 1. Empty Program Slate */}
      {program.length === 0 ? (
        <div className="space-y-4">
          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-8 text-center">
            <div className="text-4xl">🏋️‍♂️</div>
            <h3 className="text-xl font-bold mt-4">{t.programTitle}</h3>
            <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              {t.programSubtitle}
            </p>
          </div>

          <button
            onClick={handleStartManual}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl cursor-pointer transition-all uppercase tracking-wider text-sm shadow-md"
          >
            {t.startManual}
          </button>

          <button
            onClick={() => setShowGenForm(!showGenForm)}
            className="w-full py-4 bg-[#1b1d22] hover:bg-[#22242b] border border-amber-500/20 hover:border-amber-500 text-amber-500 font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4" /> {t.aiGenerate}
          </button>

          <button
            onClick={handleLoadTemplate}
            className="w-full py-4 bg-[#1b1d22] hover:bg-[#22242b] border border-[#2a2d34] text-white font-semibold rounded-xl cursor-pointer transition-all text-sm"
          >
            {t.loadTemplate}
          </button>

          {/* Döyüş & İdman Şablonları */}
          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 space-y-3.5">
            <div className="flex flex-col">
              <h4 className="text-sm font-black text-amber-500 uppercase tracking-wider">{t.sportsSectionTitle}</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {t.sportsSectionDesc}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onUpdateProgram(BOXING_TEMPLATE);
                  onSetActiveDay(0);
                }}
                className="py-3 px-3 bg-[#131417] hover:bg-[#22242b] border border-[#2a2d34] hover:border-amber-500/30 text-left rounded-xl cursor-pointer transition-all flex flex-col justify-between h-24 group"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">🥊</div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white">{t.loadBoxing}</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">{t.boxSub}</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onUpdateProgram(JUDO_TEMPLATE);
                  onSetActiveDay(0);
                }}
                className="py-3 px-3 bg-[#131417] hover:bg-[#22242b] border border-[#2a2d34] hover:border-amber-500/30 text-left rounded-xl cursor-pointer transition-all flex flex-col justify-between h-24 group"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">🥋</div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white">{t.loadJudo}</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">{t.judoSub}</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onUpdateProgram(KARATE_TEMPLATE);
                  onSetActiveDay(0);
                }}
                className="py-3 px-3 bg-[#131417] hover:bg-[#22242b] border border-[#2a2d34] hover:border-amber-500/30 text-left rounded-xl cursor-pointer transition-all flex flex-col justify-between h-24 group"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">🥋</div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white">{t.loadKarate}</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">{t.karateSub}</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onUpdateProgram(FOOTBALL_TEMPLATE);
                  onSetActiveDay(0);
                }}
                className="py-3 px-3 bg-[#131417] hover:bg-[#22242b] border border-[#2a2d34] hover:border-amber-500/30 text-left rounded-xl cursor-pointer transition-all flex flex-col justify-between h-24 group"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">⚽</div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white">{t.loadFootball}</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">{t.footballSub}</span>
                </div>
              </button>
            </div>
          </div>

          {showGenForm && (
            <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 text-left space-y-4">
              <div className="flex items-center gap-2 text-amber-500 font-bold">
                <Sparkles className="w-5 h-5" /> <span>{t.aiBuilder}</span>
              </div>
              {!isPremium && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-300 leading-relaxed">
                    {t.premiumNotice}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold text-amber-500/80">{t.sportType}</label>
                <select
                  value={genSport}
                  onChange={(e) => setGenSport(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm cursor-pointer font-bold"
                >
                  <option value="fitness">{t.sportFitness}</option>
                  <option value="boks">{t.sportBoxing}</option>
                  <option value="cüdo">{t.sportJudo}</option>
                  <option value="karate">{t.sportKarate}</option>
                  <option value="futbol">{t.sportFootball}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.goal}</label>
                  <select
                    value={genGoal}
                    onChange={(e) => setGenGoal(e.target.value)}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm cursor-pointer"
                  >
                    <option value="kütlə yığma">{t.g1}</option>
                    <option value="arıqlama">{t.g2}</option>
                    <option value="güc artırma">{t.g3}</option>
                    <option value="ümumi forma">{t.g4}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.weeklyDays}</label>
                  <select
                    value={genDays}
                    onChange={(e) => setGenDays(Number(e.target.value))}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm cursor-pointer"
                  >
                    <option value={3}>3 {lang === "ru" ? "Дня" : lang === "en" ? "Days" : "Gün"}</option>
                    <option value={4}>4 {lang === "ru" ? "Дня" : lang === "en" ? "Days" : "Gün"}</option>
                    <option value={5}>5 {lang === "ru" ? "Дней" : lang === "en" ? "Days" : "Gün"}</option>
                    <option value={6}>6 {lang === "ru" ? "Дней" : lang === "en" ? "Days" : "Gün"}</option>
                    <option value={7}>7 {lang === "ru" ? "Дней" : lang === "en" ? "Days" : "Gün"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.level}</label>
                  <select
                    value={genLevel}
                    onChange={(e) => setGenLevel(e.target.value)}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm cursor-pointer"
                  >
                    <option value="başlanğıc">{t.l1}</option>
                    <option value="orta">{t.l2}</option>
                    <option value="irəli">{t.l3}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.equipment}</label>
                  <select
                    value={genEquip}
                    onChange={(e) => setGenEquip(e.target.value)}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm cursor-pointer"
                  >
                    <option value="tam təchizatlı zal">{t.e1}</option>
                    <option value="yalnız dumbbell və turnik">{t.e2}</option>
                    <option value="yalnız bədən çəkisi">{t.e3}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.specialNotes}</label>
                <textarea
                  value={genNotes}
                  onChange={(e) => setGenNotes(e.target.value)}
                  placeholder={t.specialNotesPlaceholder}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm h-16 resize-none"
                />
              </div>

              {genError && (
                <div className="text-red-400 text-xs p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                  {genError}
                </div>
              )}

              <button
                onClick={handleAIGenerate}
                disabled={genLoading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 font-black rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 text-sm shadow-md"
              >
                {genLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> {t.aiGenerating}
                  </>
                ) : (
                  <>{t.createProgramBtn}</>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 2. Program Dashboard Layout */
        <div className="space-y-4">
          {/* Tabs for switching between Logging and Coaching */}
          <div className="flex gap-1 bg-[#131417]/80 p-1.5 rounded-2xl border border-[#2a2d34]/60 max-w-[280px]">
            <button
              onClick={() => setActiveTab("workouts")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "workouts"
                  ? "bg-amber-500 text-gray-950 font-black shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5 shrink-0" />
              <span>{t.workouts}</span>
            </button>
            <button
              onClick={() => setActiveTab("coach")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "coach"
                  ? "bg-amber-500 text-gray-950 font-black shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>{t.coach}</span>
            </button>
          </div>

          {activeTab === "coach" ? (
            <CoachDashboard
              program={program}
              logs={logs}
              isPremium={isPremium}
              onTriggerPayment={onTriggerPayment}
              userContext={userContext}
              lang={lang}
            />
          ) : (
            <>
              {/* Day Horizontal Navigation */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                {program.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => onSetActiveDay(i)}
                    className={`flex-shrink-0 min-w-[70px] py-2.5 px-3 rounded-xl flex flex-col items-center border transition-all cursor-pointer snap-start ${
                      i === activeDaySafe
                        ? "bg-[#1b1d22] border-amber-500 text-amber-500"
                        : "bg-[#1b1d22] border-[#2a2d34] text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="text-[9px] font-bold tracking-widest uppercase">{t.daysShort} {i + 1}</span>
                    <span className="text-sm font-black italic tracking-wide mt-0.5 max-w-[80px] truncate">
                      {p.title || "—"}
                    </span>
                  </button>
                ))}
                {editMode && (
                  <button
                    onClick={handleAddDay}
                    className="flex-shrink-0 py-2.5 px-4 rounded-xl flex flex-col items-center justify-center border border-dashed border-[#2a2d34] text-gray-500 hover:text-white hover:border-gray-500 transition-all cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-1 uppercase">{t.add}</span>
                  </button>
                )}
              </div>

              {/* Current Day Header Card */}
              <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {editMode ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={currentDay.title}
                        placeholder={t.dayNamePlaceholder}
                        onChange={(e) => handleEditDayField("title", e.target.value)}
                        className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl px-3 py-2 text-white font-black text-lg uppercase focus:outline-none focus:border-amber-500"
                      />
                      <input
                        type="text"
                        value={currentDay.subtitle}
                        placeholder={t.shortSubtitle}
                        onChange={(e) => handleEditDayField("subtitle", e.target.value)}
                        className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl px-3 py-1.5 text-white text-base md:text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-black italic tracking-tight text-white uppercase">{currentDay.title}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">{currentDay.subtitle}</p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {totalSets > 0 && !editMode && (
                    <div className="text-right">
                      <div className={`text-xl font-black ${completionPct === 100 ? "text-emerald-400" : "text-amber-500"}`}>
                        {completionPct}%
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {doneSets}/{totalSets} {t.sets}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={onToggleEditMode}
                    className={`btnSm px-3 py-1.5 font-bold rounded-xl text-xs cursor-pointer ${
                      editMode
                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500 text-emerald-400"
                        : "bg-[#22242b] hover:bg-[#2c2f38] border border-[#2a2d34] text-gray-300"
                    }`}
                  >
                    {editMode ? t.save : t.editProgram}
                  </button>
                </div>
              </div>

              {/* Edit Mode Workout Settings */}
              {editMode ? (
                <div className="space-y-3">
                  {currentDay.exercises.map((ex, idx) => (
                    <div key={ex.id} className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ex.name}
                          placeholder="Hərəkətin adı"
                          onChange={(e) => handleEditExField(idx, "name", e.target.value)}
                          className="flex-1 bg-[#131417] border border-[#2a2d34] rounded-xl px-3 py-2 text-white font-bold text-base md:text-sm focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={ex.sets}
                            placeholder="Set"
                            onChange={(e) => handleEditExField(idx, "sets", Number(e.target.value) || 1)}
                            className="w-14 bg-[#131417] border border-[#2a2d34] rounded-xl px-2 py-2 text-white text-center text-base md:text-sm focus:outline-none"
                          />
                          <input
                            type="text"
                            value={ex.reps}
                            placeholder={t.reps}
                            onChange={(e) => handleEditExField(idx, "reps", e.target.value)}
                            className="w-18 bg-[#131417] border border-[#2a2d34] rounded-xl px-2 py-2 text-white text-center text-base md:text-sm focus:outline-none"
                          />
                          <button
                            onClick={() => handleDelEx(idx)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleMoveEx(idx, -1)}
                            disabled={idx === 0}
                            className="px-2.5 py-1 bg-[#131417] hover:bg-[#1b1d22] border border-[#2a2d34] rounded-lg disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3 text-gray-300" />
                          </button>
                          <button
                            onClick={() => handleMoveEx(idx, 1)}
                            disabled={idx === currentDay.exercises.length - 1}
                            className="px-2.5 py-1 bg-[#131417] hover:bg-[#1b1d22] border border-[#2a2d34] rounded-lg disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3 text-gray-300" />
                          </button>
                        </div>
                        <span>{ex.isTime ? t.timeBased : t.repsBased}</span>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setShowPicker(activeDaySafe)}
                    className="w-full py-3 border border-dashed border-[#2a2d34] text-amber-500 bg-[#1b1d22]/40 hover:bg-[#1b1d22] font-semibold rounded-xl text-sm cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> {t.addExercise}
                  </button>

                  <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4">
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{t.cardioNotes}</label>
                    <input
                      type="text"
                      value={currentDay.cardio}
                      placeholder={t.cardioPlaceholder}
                      onChange={(e) => handleEditDayField("cardio", e.target.value)}
                      className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl px-3 py-2 text-white text-base md:text-sm focus:outline-none"
                    />
                  </div>

                  <div className="pt-4 space-y-2">
                    <button
                      onClick={() => handleDelDay(activeDaySafe)}
                      className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-xl cursor-pointer transition-all text-xs uppercase"
                    >
                      {t.deleteDay}
                    </button>
                    <button
                      onClick={handleResetProgram}
                      className="w-full py-3 bg-[#1b1d22] hover:bg-[#22242b] border border-[#2a2d34] text-gray-400 font-medium rounded-xl cursor-pointer transition-all text-xs uppercase"
                    >
                      {t.resetProgram}
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Logging Panel */
                <div className="space-y-4">

                  {currentDay.exercises.length === 0 && !currentDay.cardio && (
                    <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-8 text-center">
                      <div className="text-3xl">😴</div>
                      <h4 className="text-lg font-bold mt-3">{t.restDayTitle}</h4>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        {t.restDayDesc}
                      </p>
                    </div>
                  )}

                  {currentDay.exercises.map((ex, idx) => {
                    const arr = currentLog[ex.id] || [];
                    const doneCount = Array.isArray(arr) ? arr.filter((x) => x && x.done).length : 0;
                    const isAllDone = doneCount === Number(ex.sets);
                    const isOpen = openExercises[ex.id] ?? (idx === 0);

                    return (
                      <div
                        key={ex.id}
                        className={`bg-[#1b1d22] border rounded-2xl transition-all overflow-hidden ${
                          isAllDone ? "border-emerald-500/40" : "border-[#2a2d34]"
                        }`}
                      >
                        <div
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#22242b]/30"
                        >
                          <div
                            onClick={() => toggleExOpen(ex.id)}
                            className="flex-1 min-w-0 cursor-pointer pr-3"
                          >
                            <div className="font-bold text-white text-base flex flex-wrap items-center gap-2">
                              <span>{ex.name}</span>
                              {isAllDone && (
                                <span className="text-[10px] py-0.5 px-2 bg-emerald-500/10 text-emerald-400 rounded-full font-extrabold uppercase tracking-wide">
                                  {t.completedBadge}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {ex.sets} {t.sets} × {ex.reps} {ex.isTime ? t.seconds : t.reps}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Video Guide button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenVideoGuide(ex.name);
                              }}
                              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-gray-950 text-amber-400 text-xs font-black rounded-xl border border-amber-500/20 hover:border-amber-500 transition-all flex items-center gap-1 cursor-pointer shadow-sm animate-pulse-subtle"
                              title={t.videoGuide}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>{t.videoGuide}</span>
                            </button>

                            <div
                              onClick={() => toggleExOpen(ex.id)}
                              className="flex items-center gap-2 font-mono text-xs cursor-pointer pl-1"
                            >
                              <span className={`font-black ${isAllDone ? "text-emerald-400" : "text-gray-400"}`}>
                                {doneCount}/{ex.sets}
                              </span>
                              <span className={`text-[10px] text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                                ▼
                              </span>
                            </div>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="px-4 pb-4 border-t border-[#2a2d34]/60 pt-3 bg-[#131417]/20 space-y-2">
                            <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-500 uppercase font-bold text-center tracking-wider pb-1">
                              <span>Set</span>
                              <span>{ex.isTime ? (lang === "ru" ? "Секунды" : lang === "en" ? "Seconds" : "Saniyə") : (lang === "ru" ? "Вес (кг)" : lang === "en" ? "Weight (kg)" : "Çəki (kq)")}</span>
                              <span>{ex.isTime ? "—" : t.reps}</span>
                              <span>Status</span>
                            </div>

                            {Array.from({ length: ex.sets }).map((_, sIdx) => {
                              const setVal = Array.isArray(arr) ? arr[sIdx] || { w: "", r: "", done: false } : { w: "", r: "", done: false };

                              return (
                                <div key={sIdx} className="grid grid-cols-4 gap-2 items-center text-center">
                                  <span className="text-xs font-bold text-gray-400 font-mono">Set {sIdx + 1}</span>
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="0"
                                    value={setVal.w}
                                    onChange={(e) => handleSetVal(ex.id, sIdx, "w", e.target.value)}
                                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-lg py-1.5 px-2 text-white text-center text-base md:text-sm focus:outline-none focus:border-amber-500"
                                  />
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    placeholder={ex.reps.split("-")[0]}
                                    value={setVal.r}
                                    onChange={(e) => handleSetVal(ex.id, sIdx, "r", e.target.value)}
                                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-lg py-1.5 px-2 text-white text-center text-base md:text-sm focus:outline-none focus:border-amber-500"
                                  />
                                  <div className="flex justify-center">
                                    <button
                                      onClick={() => handleToggleDone(ex.id, sIdx)}
                                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                                        setVal.done
                                          ? "bg-emerald-500 border-emerald-500 text-gray-950"
                                          : "bg-[#131417] border-[#2a2d34] text-transparent hover:text-gray-600"
                                      }`}
                                    >
                                      <Check className="w-5 h-5 font-black" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {/* AI Exercise Guide & Illustration */}
                            <ExerciseGuideView
                              exercise={ex}
                              onUpdateGuide={(newGuide) => handleUpdateGuide(idx, newGuide)}
                              isPremium={isPremium}
                              onTriggerPayment={onTriggerPayment}
                              lang={lang}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {currentDay.cardio && (
                    <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-white text-base">🏃 {lang === "ru" ? "Кардио" : lang === "en" ? "Cardio" : "Kardio fəaliyyəti"}</div>
                        <div className="text-xs text-gray-400 mt-1">{currentDay.cardio}</div>
                      </div>
                      <button
                        onClick={handleToggleCardio}
                        className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          currentLog.__cardio
                            ? "bg-emerald-500 border-emerald-500 text-gray-950"
                            : "bg-[#131417] border-[#2a2d34] text-transparent"
                        }`}
                      >
                        <Check className="w-6 h-6 font-black" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 3. Dropdown Selection Picker (Modal) */}
      {showPicker !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-[#1b1d22] rounded-t-3xl w-full max-w-md p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">{t.pickExercise}</h3>
              <button
                onClick={() => setShowPicker(null)}
                className="p-1.5 hover:bg-[#22242b] rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Day Selector */}
            <div className="space-y-1.5 bg-[#131417]/40 border border-[#2a2d34]/60 rounded-xl p-3">
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider font-bold text-amber-500/90">
                {t.targetDaySelector}
              </label>
              <select
                value={pickerTargetDayIdx}
                onChange={(e) => setPickerTargetDayIdx(Number(e.target.value))}
                className="w-full bg-[#131417] border border-[#2a2d34] rounded-lg p-2 text-white focus:outline-none text-sm cursor-pointer font-bold"
              >
                {program.map((day, idx) => (
                  <option key={day.id || idx} value={idx}>
                    {lang === "ru"
                      ? `День ${idx + 1}: ${day.title}`
                      : lang === "en"
                      ? `Day ${idx + 1}: ${day.title}`
                      : `Gün ${idx + 1}: ${day.title}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider">{t.searchOrAdd}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t.exercisePlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCustomExName(e.target.value);
                  }}
                  className="flex-1 bg-[#131417] border border-[#2a2d34] rounded-xl px-3 py-2 text-white focus:outline-none text-base md:text-sm"
                />
                <button
                  onClick={() => {
                    if (!customExName.trim()) return;
                    handlePickExercise(customExName.trim());
                    setCustomExName("");
                    setSearchQuery("");
                  }}
                  className="px-4 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-xl text-xs cursor-pointer transition-all"
                >
                  {t.createBtn}
                </button>
              </div>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 max-h-[40vh]">
              {filteredExLib.map((g) => {
                const translateGroup = (group: string) => {
                  if (lang === "az") return group;
                  const map: { [key: string]: { en: string; ru: string } } = {
                    "Sinə": { en: "Chest", ru: "Грудь" },
                    "Kürək": { en: "Back", ru: "Спина" },
                    "Çiyin": { en: "Shoulders", ru: "Плечи" },
                    "Biceps": { en: "Biceps", ru: "Бицепс" },
                    "Triceps": { en: "Triceps", ru: "Трицепс" },
                    "Ayaq": { en: "Legs", ru: "Ноги" },
                    "Qarın / Core": { en: "Abs / Core", ru: "Пресс / Кор" },
                    "Kardio": { en: "Cardio", ru: "Кардио" }
                  };
                  return map[group]?.[lang as "en" | "ru"] || group;
                };

                return (
                  <div key={g.group} className="space-y-1.5">
                    <div className="text-[10px] font-black tracking-widest text-amber-500 uppercase pb-0.5">{translateGroup(g.group)}</div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {g.items.map((item) => {
                        const translateItem = (name: string) => {
                          if (lang === "az") return name;
                          const itemMap: { [key: string]: { en: string; ru: string } } = {
                            "Qaçış (trenajorda)": { en: "Treadmill Run", ru: "Бег на дорожке" },
                            "Sürətli yürüş": { en: "Power Walk", ru: "Быстрая ходьба" },
                            "Velosiped": { en: "Cycling", ru: "Велосипед" },
                            "Eliptik": { en: "Elliptical", ru: "Эллипс" },
                            "İp tullanma": { en: "Jump rope", ru: "Прыжки на скакалке" },
                            "Üzgüçülük": { en: "Swimming", ru: "Плавание" }
                          };
                          return itemMap[name]?.[lang as "en" | "ru"] || name;
                        };

                        return (
                          <button
                            key={item}
                            onClick={() => handlePickExercise(item)}
                            className="w-full text-left py-2.5 px-3.5 bg-[#131417] hover:bg-[#22242b] border border-[#2a2d34] rounded-xl text-sm text-gray-200 flex justify-between items-center cursor-pointer transition-all"
                          >
                            <span>{translateItem(item)}</span>
                            <span className="text-amber-500 font-bold">＋</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Real-time Veo Video Guide Modal */}
      {videoModalExercise && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative text-left overflow-hidden animate-fade-in">
            
            {/* Ambient background glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#2a2d34]/60 pb-3 relative z-10">
              <div>
                <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase flex items-center gap-1 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Veo 3.1 AI Video Engine
                </span>
                <h3 className="font-black text-xl text-white italic tracking-tight uppercase">
                  {videoModalExercise}
                </h3>
              </div>
              <button
                onClick={handleCloseVideoModal}
                className="p-1.5 hover:bg-[#22242b] rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer border border-[#2a2d34]/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="relative z-10 space-y-4">
              {videoLoading ? (
                <div className="py-12 text-center space-y-4 flex flex-col items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin" />
                    <Dumbbell className="w-6 h-6 text-amber-500 absolute animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-white font-bold tracking-wide animate-pulse">
                      {videoStatus}
                    </p>
                    <p className="text-[11px] text-gray-400 max-w-[340px] leading-relaxed mx-auto">
                      {lang === "ru"
                        ? "Генерация видео высокой четкости может занять до нескольких секунд. Пожалуйста, подождите..."
                        : lang === "en"
                        ? "High-definition video generation might take a few moments. Please wait..."
                        : "Yüksək keyfiyyətli video təlimat hazırlanır. Bu əməliyyat adətən bir neçə saniyə çəkir..."}
                    </p>
                  </div>
                </div>
              ) : videoError ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400 text-xl font-bold">
                    ⚠️
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-red-400">
                      {lang === "ru" ? "Произошла ошибка" : lang === "en" ? "An error occurred" : "Xəta baş verdi"}
                    </p>
                    <p className="text-xs text-gray-400 max-w-[320px] mx-auto leading-relaxed">
                      {videoError}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenVideoGuide(videoModalExercise)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 text-xs font-bold rounded-xl cursor-pointer transition-all uppercase tracking-wider shadow-md"
                  >
                    {lang === "ru" ? "Повторить" : lang === "en" ? "Retry" : "Yenidən Cəhd Et"}
                  </button>
                </div>
              ) : videoUrl ? (
                <div className="space-y-4">
                  {/* Real video player */}
                  <div className="relative aspect-video w-full bg-[#0d0e12] rounded-2xl overflow-hidden border border-[#2a2d34] shadow-inner">
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info banner */}
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 space-y-1.5">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">
                      {lang === "ru" ? "Рекомендация по тренировке" : lang === "en" ? "Training Tip" : "Məşqçi Məsləhəti"}
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      {lang === "ru"
                        ? `При выполнении ${videoModalExercise} сохраняйте идеальную технику, контролируйте дыхание и делайте движение плавно во избежание травм.`
                        : lang === "en"
                        ? `When performing ${videoModalExercise}, maintain ideal posture, control your breathing, and execute the movement smoothly to prevent injuries.`
                        : `${videoModalExercise} hərəkətini yerinə yetirərkən hər zaman düzgün formanı saxlayın, nəfəs nəzarətinə diqqət yetirin və zədələrin qarşısını almaq üçün hərəkətləri tələsmədən icra edin.`}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-[#2a2d34]/60 pt-4 relative z-10">
              <button
                onClick={handleCloseVideoModal}
                className="px-4 py-2.5 bg-[#22242b] hover:bg-[#2c2f38] text-gray-300 hover:text-white border border-[#2a2d34]/60 rounded-xl text-xs font-bold cursor-pointer transition-all uppercase tracking-wider"
              >
                {lang === "ru" ? "Закрыть" : lang === "en" ? "Close" : "Bağla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
