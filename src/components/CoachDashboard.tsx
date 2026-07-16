import React, { useState, useEffect } from "react";
import { WorkoutDay, WorkoutLogs } from "../types";
import {
  Trophy,
  Target,
  TrendingUp,
  Sparkles,
  Flame,
  Zap,
  Award,
  Activity,
  ChevronRight,
  AlertCircle,
  Calendar,
  Dumbbell,
  RefreshCw,
  Heart,
  HelpCircle,
  CheckCircle,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CoachDashboardProps {
  program: WorkoutDay[];
  logs: WorkoutLogs;
  isPremium: boolean;
  onTriggerPayment: () => void;
  userContext?: string;
  lang?: string;
}

interface AICoachInsight {
  coachOverview: string;
  achievements: string[];
  focusAreas: { title: string; desc: string }[];
  personalizedWeeklyGoals: { title: string; metric: string }[];
  motivationalQuote: string;
}

export default function CoachDashboard({
  program,
  logs,
  isPremium,
  onTriggerPayment,
  userContext = "",
  lang = "az"
}: CoachDashboardProps) {
  // ─── STATE ──────────────────────────────────────────────────
  const [aiInsight, setAiInsight] = useState<AICoachInsight | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [activePRTab, setActivePRTab] = useState<"all" | "heavy">("all");

  const tDict = {
    az: {
      coachPanel: "MƏŞQÇİ PANELDƏ",
      coachSubtitle: "İnkişaf analitikası və fərdi həftəlik motivasiya hədəfləri",
      weeklyVolume: "Həftəlik Həcm",
      kg: "kq",
      fromLastWeek: "keçən həftədən",
      preparing: "Hazırlıq...",
      workoutFrequency: "Məşq Tezliyi",
      days: "gün",
      setRegularity: "Set Nizamı",
      setsCompleted: "set vurulub",
      newRecords: "Yeni Rekordlar",
      inExercises: "hərəkətdə",
      strengthIncreasing: "Güc artımı müşahidə olunur",
      weeklyGoals: "Fərdi Həftəlik Məqsədlər",
      calculatedBasedOnActivity: "Aktiv fəaliyyətə əsasən hesablanıb",
      progressiveVolumeGoal: "📈 Proqressiv Həcm Hədəfi (+5%)",
      volumeGoalDesc: "Bu həftə keçən həftəki ümumi ağırlıq həcmini ötərək əzələ adaptasiyasını artırın.",
      weeklyWorkoutCountGoal: "🔥 Həftəlik Məşq Sayı",
      workoutCountGoalDesc: (targetWorkouts: number) => `Metabolizmi aktiv saxlamaq və nizam qurmaq üçün həftədə ən azı ${targetWorkouts} dəfə məşq edin.`,
      workoutControlGoal: "🏆 Məşq Nəzarəti (Set Dəqiqliyi)",
      workoutControlGoalDesc: "Başladığınız məşqdə setləri tam yerinə yetirin ki, lazımi əzələ stimulyasiyası təmin edilsin.",
      cardioDaysGoal: "🏃 Kardio Günləri",
      cardioGoalDesc: "Ürək-damar sağlamlığı və yağ yandırma tempini sürətləndirmək üçün kardio proqramını gecikdirməyin.",
      aiCoachAnalysis: "Aİ Məşqçi Analizi",
      premium: "PREMIUM",
      aiCoachAnalysisDesc: "Gemini AI bədən quruluşu hədəfinizə, qaldırdığınız ağırlıqların tarixinə və dərəcələrinə əsasən bu həftənin tam analizini çıxarsın.",
      coachEvaluationBasedOnLogs: "Workout Log-larına Əsaslanan Süni İntellekt Qiymətləndirməsi",
      coachFeedback: "MƏŞQÇİ RƏYİ",
      achievements: "NAİLİYYƏTLƏR",
      weeklyFocusAreas: "BU HƏFTƏKİ FOKUS SAHƏLƏRİ",
      aiPersonalGoals: "Aİ TƏRƏFİNDƏN ÖZƏL MƏQSƏDLƏR",
      reAnalyze: "Yenidən analiz et",
      prBoard: "Şəxsi Rekordların (PR Board)",
      prBoardDesc: "Hər hərəkətdə qaldırdığınız maksimum ağırlıqlar",
      all: "Hamısı",
      top4: "Top 4",
      noRecordsLogged: "Rekord qeydə alınmayıb.",
      noRecordsDesc: "Məşq proqramında hərəkətlərə çəki və təkrar daxil edib \"Tamamlandı\" işarələyərək ilk rekordunuzu yaradın!",
      date: "Tarix",
      reps: "təkrar",
      motivationNotes: "Məşqçidən Motivasiya Qeydləri",
      deepAnalysisButton: "Aİ-dən Dərin Analiz Al",
      analyzing: "Analiz edilir...",
      errorOccurred: "Aİ Məşqçi Analizi alınarkən gözlənilməz xəta baş verdi.",
      session: "seans",
      weeklyFrequencyGoal: "Həftəlik hədəfinə çatmaq üçün daha {diff} məşq etməlisən. Nizamı saxla! 🎯",
      frequencyGoalAchieved: "Möhtəşəm nəticə! Bu həftəlik məşq tezliyi hədəfini ({target} məşq) tam yerinə yetirmisən! 🔥",
      notLoggedYet: "Bu həftə hələ heç bir məşq qeyd edilməyib. İdman zalına qayıtmaq üçün əla gündür! Yüngül bir seansla başla. 🚀",
      progressiveVolumeAchieved: "Keçən həftəyə nisbətən ümumi həcmi +{change}% artırmısan! Əzələ inkişafı üçün mükəmməl proqressiv yüklənmədir. 💪",
      progressiveVolumeDecreased: "Həftəlik həcmin keçən həftədən bir qədər aşağıdır. Bu tamamilə normaldır, bədənin bərpasına imkan verin. ⚡",
      highSetQuality: "Yüksək set keyfiyyəti! Planlaşdırdığın hərəkətlərin demək olar ki, hamısını nizamlı tamamlayırsan. 🏆",
      lowSetQuality: "Məşqlərdə bəzi setlər yarımçıq qalır. Yorulursansa çəkini 10% azaldıb setləri sona qədər vurmağı yoxla. 🛡️",
      prCountMessage: (count: number) => `Ümumilikdə ${count} fərqli hərəkətdə şəxsi rekordun (PR) qeydə alınıb. Gücün artır! ⭐`,
    },
    en: {
      coachPanel: "COACH DASHBOARD",
      coachSubtitle: "Growth analytics and personalized weekly motivational goals",
      weeklyVolume: "Weekly Volume",
      kg: "kg",
      fromLastWeek: "from last week",
      preparing: "Preparing...",
      workoutFrequency: "Workout Frequency",
      days: "days",
      setRegularity: "Set Consistency",
      setsCompleted: "sets logged",
      newRecords: "New Records",
      inExercises: "exercises",
      strengthIncreasing: "Strength gains observed",
      weeklyGoals: "Personalized Weekly Goals",
      calculatedBasedOnActivity: "Calculated based on your activity",
      progressiveVolumeGoal: "📈 Progressive Volume Goal (+5%)",
      volumeGoalDesc: "Exceed last week's total volume weight to promote muscular adaptation.",
      weeklyWorkoutCountGoal: "🔥 Weekly Workout Frequency",
      workoutCountGoalDesc: (targetWorkouts: number) => `Train at least ${targetWorkouts} times a week to keep metabolism active and build a routine.`,
      workoutControlGoal: "🏆 Training Quality (Set Accuracy)",
      workoutControlGoalDesc: "Complete all planned sets in your workouts to ensure proper muscle stimulation.",
      cardioDaysGoal: "🏃 Cardio Days",
      cardioGoalDesc: "Don't delay your cardio routine to accelerate cardiovascular health and fat burning.",
      aiCoachAnalysis: "AI Coach Analysis",
      premium: "PREMIUM",
      aiCoachAnalysisDesc: "Let Gemini AI output this week's full analysis based on your physique goals, weights lifted, and logs history.",
      coachEvaluationBasedOnLogs: "AI Evaluation Based on Workout Logs",
      coachFeedback: "COACH FEEDBACK",
      achievements: "ACHIEVEMENTS",
      weeklyFocusAreas: "FOCUS AREAS THIS WEEK",
      aiPersonalGoals: "AI PERSONALIZED GOALS",
      reAnalyze: "Re-analyze",
      prBoard: "Personal Records (PR Board)",
      prBoardDesc: "Maximum weights lifted in each exercise",
      all: "All",
      top4: "Top 4",
      noRecordsLogged: "No records logged yet.",
      noRecordsDesc: "Enter weight and reps in your workout program, then check \"Completed\" to set your first record!",
      date: "Date",
      reps: "reps",
      motivationNotes: "Coach Motivational Notes",
      deepAnalysisButton: "Get Deep AI Analysis",
      analyzing: "Analyzing...",
      errorOccurred: "An unexpected error occurred while fetching AI Coach Analysis.",
      session: "sessions",
      weeklyFrequencyGoal: "You need to complete {diff} more workouts to reach your weekly goal. Keep it up! 🎯",
      frequencyGoalAchieved: "Amazing result! You have fully completed your weekly workout frequency goal ({target} workouts)! 🔥",
      notLoggedYet: "No workouts recorded yet this week. Great day to head back to the gym! Start with a light session. 🚀",
      progressiveVolumeAchieved: "You have increased total volume by +{change}% compared to last week! Perfect progressive overload for muscle growth. 💪",
      progressiveVolumeDecreased: "Your weekly volume is slightly lower than last week. This is completely normal, allow your body to recover. ⚡",
      highSetQuality: "High set quality! You complete almost all planned exercises consistently. 🏆",
      lowSetQuality: "Some sets in your workouts are left incomplete. If you are fatigued, try reducing the weight by 10% and finishing the sets. 🛡️",
      prCountMessage: (count: number) => `Personal records (PR) logged in a total of ${count} different exercises. Your strength is growing! ⭐`,
    },
    ru: {
      coachPanel: "ПАНЕЛЬ ТРЕНЕРА",
      coachSubtitle: "Аналитика прогресса и индивидуальные еженедельные мотивационные цели",
      weeklyVolume: "Недельный Объем",
      kg: "кг",
      fromLastWeek: "с прошлой недели",
      preparing: "Подготовка...",
      workoutFrequency: "Частота Тренировок",
      days: "дн.",
      setRegularity: "Точность Сетов",
      setsCompleted: "сетов выполнено",
      newRecords: "Новые Рекорды",
      inExercises: "упражнениях",
      strengthIncreasing: "Наблюдается прирост силы",
      weeklyGoals: "Индивидуальные Цели на Неделю",
      calculatedBasedOnActivity: "Рассчитано на основе вашей активности",
      progressiveVolumeGoal: "📈 Целевой Объем (+5%)",
      volumeGoalDesc: "Превысьте общий объем весов прошлой недели для мышечной адаптации.",
      weeklyWorkoutCountGoal: "🔥 Частота Тренировок в Неделю",
      workoutCountGoalDesc: (targetWorkouts: number) => `Тренируйтесь не менее ${targetWorkouts} раз в неделю для поддержания активного метаболизма и выработки привычки.`,
      workoutControlGoal: "🏆 Качество Тренировок (Точность Сетов)",
      workoutControlGoalDesc: "Выполняйте сеты полностью во время тренировки, чтобы обеспечить достаточную стимуляцию мышц.",
      cardioDaysGoal: "🏃 Дни Кардио",
      cardioGoalDesc: "Не откладывайте кардио-программу для укрепления сердечно-сосудистой системы и ускорения жиросжигания.",
      aiCoachAnalysis: "Анализ ИИ-Тренера",
      premium: "ПРЕМИУМ",
      aiCoachAnalysisDesc: "Пусть ИИ Gemini проведет полный анализ этой недели на основе ваших целей телосложения, поднятых весов и истории логов.",
      coachEvaluationBasedOnLogs: "Оценка искусственного интеллекта на основе логов тренировок",
      coachFeedback: "ОТЗЫВ ТРЕНЕРА",
      achievements: "ДОСТИЖЕНИЯ",
      weeklyFocusAreas: "ФОКУСНЫЕ НАПРАВЛЕНИЯ НА ЭТУ НЕДЕЛЮ",
      aiPersonalGoals: "ПЕРСОНАЛЬНЫЕ ЦЕЛИ ОТ ИИ",
      reAnalyze: "Анализировать заново",
      prBoard: "Личные Рекорды (PR Board)",
      prBoardDesc: "Максимальные веса, зафиксированные в каждом упражнении",
      all: "Все",
      top4: "Топ 4",
      noRecordsLogged: "Рекордов пока не зарегистрировано.",
      noRecordsDesc: "Введите вес и повторения в программе тренировок и отметьте «Выполнено», чтобы создать свой первый рекорд!",
      date: "Дата",
      reps: "повт.",
      motivationNotes: "Мотивационные Заметки Тренера",
      deepAnalysisButton: "Получить глубокий анализ от ИИ",
      analyzing: "Анализ...",
      errorOccurred: "При получении анализа ИИ-Тренера произошла непредвиденная ошибка.",
      session: "сеанс.",
      weeklyFrequencyGoal: "Вам нужно выполнить еще {diff} тренировок, чтобы достичь цели. Так держать! 🎯",
      frequencyGoalAchieved: "Великолепный результат! Вы полностью выполнили свою еженедельную цель по частоте тренировок ({target} тренировок)! 🔥",
      notLoggedYet: "На этой неделе тренировки еще не зафиксированы. Отличный день, чтобы вернуться в зал! Начните с легкой тренировки. 🚀",
      progressiveVolumeAchieved: "Вы увеличили общий объем на +{change}% по сравнению с прошлой неделей! Отличная прогрессивная перегрузка для роста мышц. 💪",
      progressiveVolumeDecreased: "Ваш недельный объем немного ниже, чем на прошлой неделе. Это совершенно нормально, дайте организму восстановиться. ⚡",
      highSetQuality: "Высокое качество сетов! Вы последовательно выполняете почти все запланированные упражнения. 🏆",
      lowSetQuality: "Некоторые сеты в ваших тренировках остаются незавершенными. Если вы устали, попробуйте снизить вес на 10% и завершить подходы. 🛡️",
      prCountMessage: (count: number) => `Личные рекорды (PR) зафиксированы в общей сложности в ${count} разных упражнениях. Ваша сила растет! ⭐`,
    },
    de: {
      coachPanel: "COACH-DASHBOARD",
      coachSubtitle: "Fortschrittsanalysen und persönliche wöchentliche Motivationsziele",
      weeklyVolume: "Wöchentliches Volumen",
      kg: "kg",
      fromLastWeek: "seit letzter Woche",
      preparing: "Vorbereitung...",
      workoutFrequency: "Trainingshäufigkeit",
      days: "Tage",
      setRegularity: "Satz-Regelmäßigkeit",
      setsCompleted: "Sätze abgeschlossen",
      newRecords: "Neue Rekorde",
      inExercises: "Übungen",
      strengthIncreasing: "Kraftzuwachs beobachtet",
      weeklyGoals: "Individuelle Wochenziele",
      calculatedBasedOnActivity: "Berechnet basierend auf Ihrer Aktivität",
      progressiveVolumeGoal: "📈 Progressives Volumenziel (+5%)",
      volumeGoalDesc: "Übertreffen Sie das Gesamtvolumen der letzten Woche, um die Muskelanpassung zu fördern.",
      weeklyWorkoutCountGoal: "🔥 Trainingshäufigkeit pro Woche",
      workoutCountGoalDesc: (targetWorkouts: number) => `Trainieren Sie mindestens ${targetWorkouts} Mal pro Woche, um einen aktiven Stoffwechsel und feste Gewohnheiten zu pflegen.`,
      workoutControlGoal: "🏆 Trainingsqualität (Satzpräzision)",
      workoutControlGoalDesc: "Führen Sie Sätze während des Trainings vollständig aus, um eine ausreichende Muskelstimulation zu gewährleisten.",
      cardioDaysGoal: "🏃 Cardio-Tage",
      cardioGoalDesc: "Verschieben Sie Ihr Cardio-Programm nicht, um Ihr Herz-Kreislauf-System zu stärken und die Fettverbrennung zu beschleunigen.",
      aiCoachAnalysis: "KI-Coach-Analyse",
      premium: "PREMIUM",
      aiCoachAnalysisDesc: "Lassen Sie Gemini AI eine vollständige Analyse dieser Woche basierend auf Ihren Körperzielen, den gehobenen Gewichten und der Protokollhistorie erstellen.",
      coachEvaluationBasedOnLogs: "KI-Bewertung basierend auf Trainingsprotokollen",
      coachFeedback: "FEEDBACK DES COACHES",
      achievements: "ERFOLGE",
      weeklyFocusAreas: "FOKUSBEREICHE FÜR DIESE WOCHE",
      aiPersonalGoals: "KI-PERSÖNLICHE ZIELE",
      reAnalyze: "Erneut analysieren",
      prBoard: "Persönliche Rekorde (PR Board)",
      prBoardDesc: "Maximalgewichte, die in jeder Übung verzeichnet wurden",
      all: "Alle",
      top4: "Top 4",
      noRecordsLogged: "Noch keine Rekorde eingetragen.",
      noRecordsDesc: "Geben Sie Gewicht und Wiederholungen im Trainingsprogramm ein und markieren Sie diese als abgeschlossen, um Ihren ersten Rekord zu erstellen!",
      date: "Datum",
      reps: "Wdh.",
      motivationNotes: "Motivationsnotizen des Coaches",
      deepAnalysisButton: "Tiefenanalyse von KI anfordern",
      analyzing: "Analyse...",
      errorOccurred: "Beim Abrufen der KI-Coach-Analyse ist ein unerwarteter Fehler aufgetreten.",
      session: "Sitzung",
      weeklyFrequencyGoal: "Sie müssen noch {diff} Trainingseinheiten absolvieren, um Ihr Ziel zu erreichen. Dranbleiben! 🎯",
      frequencyGoalAchieved: "Großartiges Ergebnis! Sie haben Ihr wöchentliches Ziel für die Trainingshäufigkeit ({target} Workouts) vollständig erreicht! 🔥",
      notLoggedYet: "In dieser Woche wurden noch keine Trainingseinheiten verzeichnet. Ein perfekter Tag, um wieder ins Studio zu gehen! Starten Sie mit einer leichten Einheit. 🚀",
      progressiveVolumeAchieved: "Sie haben Ihr wöchentliches Volumen um +{change}% im Vergleich zur Vorwoche gesteigert! Perfekte progressive Überlastung für Muskelaufbau. 💪",
      progressiveVolumeDecreased: "Ihr wöchentliches Volumen ist etwas niedriger als in der Vorwoche. Das ist völlig normal, geben Sie Ihrem Körper Zeit zur Regeneration. ⚡",
      highSetQuality: "Hohe Satzqualität! Sie führen fast alle geplanten Übungen konsequent aus. 🏆",
      lowSetQuality: "Einige Sätze in Ihren Trainingseinheiten sind unvollständig geblieben. Wenn Sie müde sind, versuchen Sie, das Gewicht um 10% zu reduzieren und die Sätze zu beenden. 🛡️",
      prCountMessage: (count: number) => `Persönliche Rekorde (PR) wurden in insgesamt ${count} verschiedenen Übungen verzeichnet. Ihre Kraft wächst! ⭐`,
    }
  };

  const t = tDict[lang as "az" | "en" | "de" | "ru" || "az"] || tDict["en"];

  // ─── DATE HELPERS ───────────────────────────────────────────
  const getWeekRange = (weeksAgo = 0) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1) - weeksAgo * 7;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return { start: startOfWeek, end: endOfWeek };
  };

  const formatShortDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "az-AZ", { day: "numeric", month: "short" });
    } catch {
      return dateStr;
    }
  };

  const currentWeek = getWeekRange(0);
  const lastWeek = getWeekRange(1);

  // ─── CALCULATION UTILITIES ──────────────────────────────────
  const getStatsForWeek = (start: Date, end: Date) => {
    let totalVolume = 0;
    let loggedWorkoutsCount = 0;
    let totalPlannedSetsInWorkedDays = 0;
    let totalCompletedSets = 0;
    let completedCardioDays = 0;

    const workedDayIds = new Set<string>();

    for (const [key, dayLog] of Object.entries(logs || {})) {
      const parts = key.split("|");
      if (parts.length < 2) continue;
      const dayId = parts[0];
      const dateStr = parts[1]; // YYYY-MM-DD
      const dateParts = dateStr.split("-");
      if (dateParts.length !== 3) continue;

      const y = parseInt(dateParts[0], 10);
      const m = parseInt(dateParts[1], 10) - 1;
      const d = parseInt(dateParts[2], 10);
      const logDate = new Date(y, m, d);

      if (logDate >= start && logDate <= end) {
        const progDay = program.find((d) => d.id === dayId);
        let dayHasDoneSet = false;

        for (const [fieldKey, val] of Object.entries(dayLog)) {
          if (fieldKey.startsWith("__")) continue;
          if (Array.isArray(val)) {
            for (const set of val) {
              if (set && set.done) {
                dayHasDoneSet = true;
                const weight = parseFloat(set.w) || 0;
                const reps = parseFloat(set.r) || 0;
                totalVolume += weight * reps;
                totalCompletedSets++;
              }
            }
          }
        }

        if (dayLog.__cardio) {
          completedCardioDays++;
          dayHasDoneSet = true;
        }

        if (dayHasDoneSet) {
          workedDayIds.add(dayId);
          if (progDay) {
            totalPlannedSetsInWorkedDays += progDay.exercises.reduce(
              (sum, ex) => sum + (Number(ex.sets) || 0),
              0
            );
          }
        }
      }
    }

    loggedWorkoutsCount = workedDayIds.size;

    return {
      volume: totalVolume,
      workouts: loggedWorkoutsCount,
      completedSets: totalCompletedSets,
      plannedSets: totalPlannedSetsInWorkedDays,
      completedCardio: completedCardioDays
    };
  };

  const getPersonalRecords = () => {
    const prs: { [exerciseName: string]: { weight: number; reps: number; date: string } } = {};

    for (const [key, dayLog] of Object.entries(logs || {})) {
      const parts = key.split("|");
      if (parts.length < 2) continue;
      const dateStr = parts[1]; // YYYY-MM-DD

      for (const [fieldKey, val] of Object.entries(dayLog)) {
        if (fieldKey.startsWith("__")) continue;
        if (Array.isArray(val)) {
          let exName = "";
          for (const day of program) {
            const found = day.exercises.find((e) => e.id === fieldKey);
            if (found) {
              exName = found.name;
              break;
            }
          }

          if (!exName) continue;

          for (const set of val) {
            if (set && set.done) {
              const weight = parseFloat(set.w) || 0;
              const reps = parseInt(set.r, 10) || 0;
              if (weight > 0) {
                if (
                  !prs[exName] ||
                  weight > prs[exName].weight ||
                  (weight === prs[exName].weight && reps > prs[exName].reps)
                ) {
                  prs[exName] = { weight, reps, date: dateStr };
                }
              }
            }
          }
        }
      }
    }

    return Object.entries(prs).map(([name, data]) => ({
      name,
      ...data
    }));
  };

  // ─── DERIVED METRICS ────────────────────────────────────────
  const currentStats = getStatsForWeek(currentWeek.start, currentWeek.end);
  const lastStats = getStatsForWeek(lastWeek.start, lastWeek.end);
  const personalRecords = getPersonalRecords();

  const volumeChangePct =
    lastStats.volume > 0
      ? Math.round(((currentStats.volume - lastStats.volume) / lastStats.volume) * 100)
      : null;

  // Personalized dynamically-calculated weekly hədəflər
  const targetWorkouts = Math.max(3, program.filter((d) => d.exercises.length > 0 || d.cardio).length);
  const targetVolume = lastStats.volume > 0 ? Math.round(lastStats.volume * 1.05) : 3500; // Progressive Overload goal (5% increase or 3500 kg baseline)
  const targetCardioDays = program.filter((d) => d.cardio).length;

  const workoutPct = Math.min(100, Math.round((currentStats.workouts / targetWorkouts) * 100));
  const volumePct = Math.min(100, Math.round((currentStats.volume / targetVolume) * 100));
  const consistencyPct =
    currentStats.plannedSets > 0
      ? Math.round((currentStats.completedSets / currentStats.plannedSets) * 100)
      : 0;

  // Local rule-based coaching feedback list
  const getLocalAdvice = () => {
    const list = [];
    if (currentStats.workouts === 0) {
      list.push({
        type: "neutral",
        text: t.notLoggedYet
      });
    } else if (currentStats.workouts >= targetWorkouts) {
      list.push({
        type: "success",
        text: t.frequencyGoalAchieved.replace("{target}", String(targetWorkouts))
      });
    } else {
      list.push({
        type: "info",
        text: t.weeklyFrequencyGoal.replace("{diff}", String(targetWorkouts - currentStats.workouts))
      });
    }

    if (volumeChangePct !== null) {
      if (volumeChangePct > 0) {
        list.push({
          type: "success",
          text: t.progressiveVolumeAchieved.replace("{change}", String(volumeChangePct))
        });
      } else if (volumeChangePct < 0) {
        list.push({
          type: "info",
          text: t.progressiveVolumeDecreased
        });
      }
    }

    if (consistencyPct > 85) {
      list.push({
        type: "success",
        text: t.highSetQuality
      });
    } else if (consistencyPct > 0 && consistencyPct < 65) {
      list.push({
        type: "warning",
        text: t.lowSetQuality
      });
    }

    if (personalRecords.length > 0) {
      list.push({
        type: "success",
        text: t.prCountMessage(personalRecords.length)
      });
    }

    return list;
  };

  const localAdviceList = getLocalAdvice();

  // ─── TRIGGER DEEP AI INSIGHTS ──────────────────────────────────
  const handleFetchAICoach = async () => {
    if (!isPremium) {
      onTriggerPayment();
      return;
    }

    setLoadingAI(true);
    setAiError(null);

    try {
      const response = await fetch("/api/coach-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          program,
          logs,
          currentWeekStats: currentStats,
          lastWeekStats: lastStats,
          userContext,
          lang
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setAiInsight(data);
    } catch (err: any) {
      console.error("Fetch AI coach error:", err);
      setAiError(err.message || t.errorOccurred);
    } finally {
      setLoadingAI(false);
    }
  };

  // ─── FILTER PRs ─────────────────────────────────────────────
  const sortedPRs = [...personalRecords].sort((a, b) => b.weight - a.weight);
  const displayedPRs = activePRTab === "heavy" ? sortedPRs.slice(0, 4) : sortedPRs;

  return (
    <div className="space-y-6" id="coach-dashboard-root">
      {/* ─── ROW 1: HEADER & SYNC ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Trophy className="w-5.5 h-5.5 text-amber-500 shrink-0" />
            <span>{t.coachPanel}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {t.coachSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-gray-500 bg-[#1b1d22]/40 py-1.5 px-3 rounded-xl border border-[#2a2d34]/40">
          <Calendar className="w-3.5 h-3.5 text-amber-500/80" />
          <span>
            {currentWeek.start.getDate()} - {currentWeek.end.getDate()}{" "}
            {currentWeek.end.toLocaleDateString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "az-AZ", { month: "short" })}
          </span>
        </div>
      </div>

      {/* ─── ROW 2: CORE ANALYTIC CARDS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Həcm (Volume) */}
        <div className="bg-[#1b1d22] border border-[#2a2d34]/60 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#3b3f4a] transition-all">
          <div className="absolute top-2 right-2 p-1.5 rounded-xl bg-amber-500/5 text-amber-500">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.weeklyVolume}</span>
            <h3 className="text-xl font-black tracking-tight text-white mt-1.5 font-mono">
              {currentStats.volume.toLocaleString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "az-AZ")} <span className="text-xs font-medium text-gray-400">{t.kg}</span>
            </h3>
          </div>
          <div className="mt-3 text-[10px] flex items-center gap-1">
            {volumeChangePct !== null ? (
              volumeChangePct >= 0 ? (
                <span className="text-emerald-400 font-extrabold font-mono">+{volumeChangePct}% 📈</span>
              ) : (
                <span className="text-rose-400 font-extrabold font-mono">{volumeChangePct}% 📉</span>
              )
            ) : (
              <span className="text-gray-500">{t.preparing}</span>
            )}
            <span className="text-gray-500">{t.fromLastWeek}</span>
          </div>
        </div>

        {/* Card 2: Tamamlanmış Məşqlər */}
        <div className="bg-[#1b1d22] border border-[#2a2d34]/60 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#3b3f4a] transition-all">
          <div className="absolute top-2 right-2 p-1.5 rounded-xl bg-amber-500/5 text-amber-500">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.workoutFrequency}</span>
            <h3 className="text-xl font-black tracking-tight text-white mt-1.5 font-mono">
              {currentStats.workouts} <span className="text-xs font-medium text-gray-500">/ {targetWorkouts} {t.days}</span>
            </h3>
          </div>
          <div className="mt-3">
            <div className="w-full bg-[#131417] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${workoutPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Tamamlanma Keyfiyyəti (Consistency) */}
        <div className="bg-[#1b1d22] border border-[#2a2d34]/60 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#3b3f4a] transition-all">
          <div className="absolute top-2 right-2 p-1.5 rounded-xl bg-amber-500/5 text-amber-500">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.setRegularity}</span>
            <h3 className="text-xl font-black tracking-tight text-white mt-1.5 font-mono">
              {consistencyPct}%
            </h3>
          </div>
          <div className="mt-3 text-[10px] text-gray-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              {currentStats.completedSets} {t.setsCompleted}
            </span>
          </div>
        </div>

        {/* Card 4: Şəxsi Rekordlar */}
        <div className="bg-[#1b1d22] border border-[#2a2d34]/60 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#3b3f4a] transition-all">
          <div className="absolute top-2 right-2 p-1.5 rounded-xl bg-amber-500/5 text-amber-500">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.newRecords}</span>
            <h3 className="text-xl font-black tracking-tight text-white mt-1.5 font-mono">
              {personalRecords.length} <span className="text-xs font-medium text-gray-500">{t.inExercises}</span>
            </h3>
          </div>
          <div className="mt-3 text-[10px] text-gray-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{t.strengthIncreasing}</span>
          </div>
        </div>
      </div>

      {/* ─── ROW 3: PERSONALIZED WEEKLY GOALS (HƏDƏFLƏR) ─── */}
      <div className="bg-[#1b1d22] border border-[#2a2d34]/60 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Target className="w-4.5 h-4.5 text-amber-500 shrink-0" />
            <span>{t.weeklyGoals}</span>
          </h3>
          <span className="text-[10px] text-gray-400 bg-[#131417] py-1 px-2.5 rounded-lg border border-[#2a2d34]/50">
            {t.calculatedBasedOnActivity}
          </span>
        </div>

        <div className="space-y-4">
          {/* Goal 1: Həcm Hədəfi */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-gray-300">{t.progressiveVolumeGoal}</span>
              <span className="text-gray-400 font-mono">
                {currentStats.volume} / {targetVolume} {t.kg}
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-[#131417] h-3.5 rounded-full overflow-hidden border border-[#2a2d34]/40">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${volumePct}%` }}
                />
              </div>
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[8px] font-black uppercase text-gray-950 font-mono">
                {volumePct}%
              </span>
            </div>
            <p className="text-[10px] text-gray-500">
              {t.volumeGoalDesc}
            </p>
          </div>

          {/* Goal 2: Məşq Tezliyi Hədəfi */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-gray-300">{t.weeklyWorkoutCountGoal}</span>
              <span className="text-gray-400 font-mono">
                {currentStats.workouts} / {targetWorkouts} {t.session}
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-[#131417] h-3.5 rounded-full overflow-hidden border border-[#2a2d34]/40">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${workoutPct}%` }}
                />
              </div>
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[8px] font-black uppercase text-gray-950 font-mono">
                {workoutPct}%
              </span>
            </div>
            <p className="text-[10px] text-gray-500">
              {t.workoutCountGoalDesc(targetWorkouts)}
            </p>
          </div>

          {/* Goal 3: Set Tamamlanma Keyfiyyəti */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-gray-300">{t.workoutControlGoal}</span>
              <span className="text-gray-400 font-mono">{consistencyPct}% / 90% hədəf</span>
            </div>
            <div className="relative">
              <div className="w-full bg-[#131417] h-3.5 rounded-full overflow-hidden border border-[#2a2d34]/40">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((consistencyPct / 90) * 100))}%` }}
                />
              </div>
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[8px] font-black uppercase text-gray-950 font-mono">
                {consistencyPct}%
              </span>
            </div>
            <p className="text-[10px] text-gray-500">
              {t.workoutControlGoalDesc}
            </p>
          </div>

          {/* Goal 4: Kardio Tamamlanması */}
          {targetCardioDays > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-gray-300">{t.cardioDaysGoal}</span>
                <span className="text-gray-400 font-mono">
                  {currentStats.completedCardio} / {targetCardioDays} {t.days}
                </span>
              </div>
              <div className="relative">
                <div className="w-full bg-[#131417] h-3.5 rounded-full overflow-hidden border border-[#2a2d34]/40">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((currentStats.completedCardio / targetCardioDays) * 100))}%`
                    }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-500">
                {t.cardioGoalDesc}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── ROW 4: INTERACTIVE PREMIUM AI COACH DEEP ANALYSIS ─── */}
      <div className="bg-gradient-to-br from-[#1b1d22] to-[#121317] border border-amber-500/20 rounded-3xl p-5 relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-500 font-black text-sm uppercase tracking-wider">
                <Sparkles className="w-5 h-5" />
                <span>{t.aiCoachAnalysis}</span>
                <span className="text-[9px] py-0.5 px-2 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 font-black">
                  {t.premium}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {t.coachEvaluationBasedOnLogs}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-md">
                {t.aiCoachAnalysisDesc}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {aiError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="text-xs text-red-400 leading-relaxed">{aiError}</span>
              </motion.div>
            )}

            {!aiInsight ? (
              <div className="pt-2">
                <button
                  onClick={handleFetchAICoach}
                  disabled={loadingAI}
                  className="py-3 px-6 bg-amber-500 hover:bg-amber-600 disabled:bg-[#1b1d22] disabled:text-gray-500 disabled:border-[#2a2d34] text-gray-950 font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                >
                  {loadingAI ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t.analyzing}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-gray-950" />
                      <span>{t.deepAnalysisButton}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-3 border-t border-[#2a2d34]/60"
              >
                {/* AI Summary */}
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                    {t.coachFeedback}
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed bg-[#131417]/50 p-4 rounded-2xl border border-[#2a2d34]/40 italic">
                    "{aiInsight.coachOverview}"
                  </p>
                </div>

                {/* AI Achievements */}
                {aiInsight.achievements && aiInsight.achievements.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      {t.achievements}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {aiInsight.achievements.map((ach, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-gray-300 bg-[#131417]/40 p-3 rounded-xl flex items-center gap-2.5 border border-[#2a2d34]/30"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>{ach}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Focus Areas */}
                {aiInsight.focusAreas && aiInsight.focusAreas.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                      {t.weeklyFocusAreas}
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {aiInsight.focusAreas.map((focus, idx) => (
                        <div
                          key={idx}
                          className="bg-[#131417]/40 p-3.5 rounded-xl border border-[#2a2d34]/40 space-y-1"
                        >
                          <div className="font-extrabold text-white text-xs flex items-center gap-1.5">
                            <span className="text-amber-500">✦</span>
                            <span>{focus.title}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-relaxed pl-4">
                            {focus.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Personalized Goals */}
                {aiInsight.personalizedWeeklyGoals && aiInsight.personalizedWeeklyGoals.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                      {t.aiPersonalGoals}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {aiInsight.personalizedWeeklyGoals.map((goal, idx) => (
                        <div
                          key={idx}
                          className="bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl flex justify-between items-center"
                        >
                          <div>
                            <div className="text-xs font-black text-white">{goal.title}</div>
                            <div className="text-[10px] text-amber-500 font-medium mt-0.5 font-mono">
                              {goal.metric}
                            </div>
                          </div>
                          <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 ml-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Motivational Quote */}
                {aiInsight.motivationalQuote && (
                  <div className="text-center py-2.5 border-t border-[#2a2d34]/40">
                    <p className="text-xs font-black italic text-amber-500 font-mono">
                      "{aiInsight.motivationalQuote}"
                    </p>
                  </div>
                )}

                {/* Reset Insight Button */}
                <div className="pt-2">
                  <button
                    onClick={handleFetchAICoach}
                    className="text-[10px] text-gray-400 hover:text-white transition-all cursor-pointer underline flex items-center gap-1 mx-auto"
                  >
                    <RefreshCw className="w-3 h-3" /> {t.reAnalyze}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── ROW 5: PERSONAL RECORDS (PB TRACKER) ─── */}
      <div className="bg-[#1b1d22] border border-[#2a2d34]/60 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-amber-500 shrink-0" />
              <span>{t.prBoard}</span>
            </h3>
            <p className="text-[10px] text-gray-500">
              {t.prBoardDesc}
            </p>
          </div>

          <div className="flex gap-1.5 bg-[#131417] p-1 rounded-xl border border-[#2a2d34]/50">
            <button
              onClick={() => setActivePRTab("all")}
              className={`px-2.5 py-1 text-[9px] font-bold rounded-lg cursor-pointer transition-all ${
                activePRTab === "all" ? "bg-amber-500 text-gray-950 font-black" : "text-gray-400"
              }`}
            >
              {t.all}
            </button>
            <button
              onClick={() => setActivePRTab("heavy")}
              className={`px-2.5 py-1 text-[9px] font-bold rounded-lg cursor-pointer transition-all ${
                activePRTab === "heavy" ? "bg-amber-500 text-gray-950 font-black" : "text-gray-400"
              }`}
            >
              {t.top4}
            </button>
          </div>
        </div>

        {personalRecords.length === 0 ? (
          <div className="p-8 text-center bg-[#131417]/50 rounded-2xl border border-[#2a2d34]/30 space-y-2">
            <p className="text-xs text-gray-500">{t.noRecordsLogged}</p>
            <p className="text-[10px] text-gray-600 max-w-[200px] mx-auto leading-relaxed">
              {t.noRecordsDesc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {displayedPRs.map((pr, idx) => (
              <div
                key={pr.name}
                className="bg-[#131417]/60 border border-[#2a2d34]/40 p-3.5 rounded-2xl flex items-center justify-between hover:border-amber-500/20 hover:bg-[#131417]/80 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shrink-0 font-mono font-black text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{pr.name}</h4>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      {t.date}: {formatShortDate(pr.date)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-amber-500 font-mono tracking-tight">
                    {pr.weight} <span className="text-[10px] font-medium text-gray-400">{t.kg}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    {pr.reps} {t.reps}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── ROW 6: LOCAL RULE-BASED ANALYTIC FEEDBACK (MƏSLƏHƏTLƏR) ─── */}
      <div className="bg-[#1b1d22] border border-[#2a2d34]/60 rounded-3xl p-5 space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
          <Heart className="w-4.5 h-4.5 text-rose-500 shrink-0" />
          <span>{t.motivationNotes}</span>
        </h3>

        <div className="space-y-2">
          {localAdviceList.map((advice, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl text-xs leading-relaxed flex items-start gap-2.5 ${
                advice.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/15 text-emerald-300"
                  : advice.type === "warning"
                  ? "bg-amber-500/10 border border-amber-500/15 text-amber-300"
                  : "bg-[#131417]/50 border border-[#2a2d34]/30 text-gray-300"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {advice.type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : advice.type === "warning" ? (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                ) : (
                  <Activity className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <span>{advice.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
