import React, { useState, useEffect } from "react";
import { Trophy, Target, TrendingUp, Plus, Trash2, Flame, Award, Zap, CheckCircle2, Lock, Dumbbell, Calendar } from "lucide-react";

interface ChallengesHubProps {
  isPremium: boolean;
  onTriggerPayment: () => void;
  lang?: string;
  userLogs?: any;
}

interface PersonalRecord {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  date: string;
}

interface DailyChallenge {
  id: string;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  points: number;
  completed: boolean;
  type: string; // 'water' | 'workout' | 'plank' | 'protein'
}

export default function ChallengesHub({ isPremium, onTriggerPayment, lang = "az" }: ChallengesHubProps) {
  // Translations
  const tDict = {
    az: {
      title: "HƏDƏFLƏR VƏ ÇALLENCLƏR",
      subtitle: "Şəxsi rekordlarınızı izləyin, gündəlik idman yarışlarını tamamlayın və yeni nailiyyət nişanları qazanın!",
      dailyChallenges: "Gündəlik Yarışlar",
      dailyChallengesDesc: "Hər gün yenilənən çallencləri tamamlayaraq xal (XP) qazanın və səviyyənizi (Level) artırın.",
      personalRecords: "Şəxsi Rekordlar (PR)",
      personalRecordsDesc: "Ən ağır qaldırdığınız çəkiləri və ya ən çox etdiyiniz təkrar saylarını qeyd edərək tərəqqinizi izləyin.",
      addRecord: "Yeni Rekord Əlavə Et",
      exerciseName: "Hərəkətin Adı",
      weightKgs: "Çəki (kq)",
      repsCount: "Təkrar Sayı",
      saveRecord: "Rekordu Saxla",
      historyCharts: "Tərəqqi Qrafiki",
      noRecords: "Hələ heç bir rekord qeyd edilməyib. İlk rekordunuzu yuxarıdakı formla əlavə edin!",
      recordsHistory: "Rekordlar Tarixçəsi",
      completed: "Tamamlandı",
      xpEarned: "XP Qazanıldı",
      level: "Səviyyə",
      trophyRoom: "Nailiyyətlər Otağı (Trophy Room)",
      trophyRoomDesc: "Məşq fəaliyyətinizə görə kilidi açılan xüsusi bədən nişanları və kuboklar.",
      unlocked: "Kilid Açıldı",
      locked: "Kilidli",
      allChallengesDone: "Bütün gündəlik yarışlar tamamlandı! Sabah yeni çallenclər üçün yenidən gəlin. 🔥",
      selectExercise: "Hərəkət Seçin",
      allFieldsRequired: "Zəhmət olmasa bütün xanaları tam doldurun.",
      recordAddedSuccess: "Şəxsi rekordunuz uğurla yadda saxlanıldı! 🎉",
      deleteRecordConfirm: "Bu rekordu silmək istədiyinizə əminsiniz?",
      premiumOnly: "Premium İmkandır",
      premiumOnlyDesc: "Bu hərəkətlərin tam analizini görmək üçün Premium hesaba keçid edin.",
      upgradeNow: "Premium-a Keç",
      chartPlaceholder: "Qrafiki görmək üçün ən azı 2 fərqli tarixə malik eyni hərəkət rekordu daxil edin."
    },
    en: {
      title: "GOALS & CHALLENGES",
      subtitle: "Track your personal records, complete daily training challenges, and unlock achievement badges!",
      dailyChallenges: "Daily Challenges",
      dailyChallengesDesc: "Earn experience points (XP) by completing daily goals and level up your athlete status.",
      personalRecords: "Personal Records (PR)",
      personalRecordsDesc: "Log your maximum weight lifted or max repetitions to visualize your strength progression.",
      addRecord: "Log New Record",
      exerciseName: "Exercise Name",
      weightKgs: "Weight (kg)",
      repsCount: "Reps Count",
      saveRecord: "Save Record",
      historyCharts: "Strength Progression Chart",
      noRecords: "No records logged yet. Add your first maximum lift above!",
      recordsHistory: "Personal Records History",
      completed: "Completed",
      xpEarned: "XP Earned",
      level: "Level",
      trophyRoom: "Achievements & Trophy Room",
      trophyRoomDesc: "Unique custom badges and trophies unlocked based on your workout and wellness dedication.",
      unlocked: "Unlocked",
      locked: "Locked",
      allChallengesDone: "All daily challenges completed! Check back tomorrow for fresh objectives. 🔥",
      selectExercise: "Select Exercise",
      allFieldsRequired: "Please fill in all input fields.",
      recordAddedSuccess: "Personal record saved successfully! 🎉",
      deleteRecordConfirm: "Are you sure you want to delete this record?",
      premiumOnly: "Premium Feature",
      premiumOnlyDesc: "Upgrade to Premium to visualize comprehensive charts and get full tracking.",
      upgradeNow: "Upgrade Now",
      chartPlaceholder: "Enter at least 2 records for the same exercise on different dates to generate a progress chart."
    },
    ru: {
      title: "ЦЕЛИ И ЧЕЛЛЕНДЖИ",
      subtitle: "Отслеживайте личные рекорды, выполняйте ежедневные задания и открывайте наградные кубки!",
      dailyChallenges: "Ежедневные Челленджи",
      dailyChallengesDesc: "Выполняйте задания, зарабатывайте очки опыта (XP) и повышайте уровень своего атлета.",
      personalRecords: "Личные Рекорды (PR)",
      personalRecordsDesc: "Записывайте свои максимальные веса или повторения, чтобы отслеживать прогресс силы.",
      addRecord: "Добавить Новый Рекорд",
      exerciseName: "Упражнение",
      weightKgs: "Вес (кг)",
      repsCount: "Повторения",
      saveRecord: "Сохранить Рекорд",
      historyCharts: "График Силового Прогресса",
      noRecords: "Рекорды пока не записаны. Внесите свой первый максимальный вес выше!",
      recordsHistory: "История Личных Рекордов",
      completed: "Выполнено",
      xpEarned: "Очков Опыта",
      level: "Уровень",
      trophyRoom: "Зал Достижений и Трофеев",
      trophyRoomDesc: "Уникальные значки и трофеи, открываемые за ваши тренировки и здоровые привычки.",
      unlocked: "Открыто",
      locked: "Закрыто",
      allChallengesDone: "Все ежедневные челленджи выполнены! Приходите завтра за новыми целями. 🔥",
      selectExercise: "Выберите упражнение",
      allFieldsRequired: "Пожалуйста, заполните все поля.",
      recordAddedSuccess: "Личный рекорд успешно сохранен! 🎉",
      deleteRecordConfirm: "Вы действительно хотите удалить эту запись?",
      premiumOnly: "Премиум-Функция",
      premiumOnlyDesc: "Перейдите на Премиум-аккаунт, чтобы просматривать детальные графики силы.",
      upgradeNow: "Активировать Премиум",
      chartPlaceholder: "Введите как минимум 2 рекорда для одного упражнения в разные даты для построения графика."
    },
    de: {
      title: "ZIELE & HERAUSFORDERUNGEN",
      subtitle: "Verfolgen Sie Ihre persönlichen Rekorde, meistern Sie tägliche Herausforderungen und schalten Sie Abzeichen frei!",
      dailyChallenges: "Tägliche Challenges",
      dailyChallengesDesc: "Sammeln Sie Erfahrungspunkte (XP) durch tägliche Ziele und steigern Sie das Level Ihres Athletenstatus.",
      personalRecords: "Persönliche Rekorde (PR)",
      personalRecordsDesc: "Protokollieren Sie Ihr maximales Gewicht oder Ihre maximalen Wiederholungen, um Ihren Kraftzuwachs zu visualisieren.",
      addRecord: "Neuen Rekord eintragen",
      exerciseName: "Übungsname",
      weightKgs: "Gewicht (kg)",
      repsCount: "Wiederholungen",
      saveRecord: "Rekord speichern",
      historyCharts: "Kraftverlaufsgrafik",
      noRecords: "Noch keine Rekorde eingetragen. Fügen Sie oben Ihre erste Bestleistung hinzu!",
      recordsHistory: "Verlauf der persönlichen Rekorde",
      completed: "Abgeschlossen",
      xpEarned: "XP verdient",
      level: "Level",
      trophyRoom: "Erfolge & Trophäenraum",
      trophyRoomDesc: "Einzigartige Abzeichen und Trophäen, die basierend auf Ihrem Training und Ihrer Wellness-Disziplin freigeschaltet werden.",
      unlocked: "Freigeschaltet",
      locked: "Gesperrt",
      allChallengesDone: "Alle täglichen Herausforderungen abgeschlossen! Kommen Sie morgen für neue Ziele wieder. 🔥",
      selectExercise: "Übung auswählen",
      allFieldsRequired: "Bitte füllen Sie alle Eingabefelder aus.",
      recordAddedSuccess: "Persönlicher Rekord erfolgreich gespeichert! 🎉",
      deleteRecordConfirm: "Sind Sie sicher, dass Sie diesen Rekord löschen möchten?",
      premiumOnly: "Premium-Funktion",
      premiumOnlyDesc: "Upgrade auf Premium, um umfassende Diagramme anzuzeigen und vollständiges Tracking zu erhalten.",
      upgradeNow: "Jetzt upgraden",
      chartPlaceholder: "Geben Sie mindestens 2 Rekorde für dieselbe Übung an verschiedenen Tagen ein, um eine Fortschrittsgrafik zu erstellen."
    }
  };

  const t = tDict[lang as "az" | "en" | "de" | "ru" || "az"] || tDict["en"];

  // States
  const [xp, setXp] = useState<number>(() => {
    const val = localStorage.getItem("demirplan_user_xp");
    return val ? parseInt(val, 10) : 120; // Default XP
  });

  const [records, setRecords] = useState<PersonalRecord[]>(() => {
    const val = localStorage.getItem("demirplan_personal_records");
    if (val) return JSON.parse(val);
    // Seed default records
    return [
      { id: "1", exercise: "Bench Press", weight: 80, reps: 5, date: "2026-07-01" },
      { id: "2", exercise: "Squat", weight: 100, reps: 6, date: "2026-07-03" },
      { id: "3", exercise: "Bench Press", weight: 85, reps: 4, date: "2026-07-10" }
    ];
  });

  const [challenges, setChallenges] = useState<DailyChallenge[]>(() => {
    const val = localStorage.getItem("demirplan_daily_challenges");
    if (val) return JSON.parse(val);
    
    // Seed default daily challenges
    return [
      { id: "c1", titleAz: "Gündəlik su hədəfinə çat (3 Litr)", titleEn: "Reach daily water target (3 Liters)", titleRu: "Достигнуть дневной нормы воды (3 Литра)", points: 50, completed: false, type: "water" },
      { id: "c2", titleAz: "Bir məşqi tamamilə bitir və loqla", titleEn: "Complete and log a full training session", titleRu: "Полностью выполнить и записать тренировку", points: 80, completed: false, type: "workout" },
      { id: "c3", titleAz: "Plank dözümlülük sınağı (2 dəqiqə)", titleEn: "Plank endurance challenge (2 minutes)", titleRu: "Испытание планки на выносливость (2 минуты)", points: 40, completed: false, type: "plank" },
      { id: "c4", titleAz: "Gündəlik zülal (protein) qəbulunu yerinə yetir", titleEn: "Hit your daily protein (zülal) goal", titleRu: "Выполнить дневную норму белка", points: 60, completed: false, type: "protein" }
    ];
  });

  // Log Record Form States
  const [selectedEx, setSelectedEx] = useState("Bench Press");
  const [customEx, setCustomEx] = useState("");
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Selected exercise for dynamic chart
  const [chartEx, setChartEx] = useState("Bench Press");

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem("demirplan_user_xp", xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem("demirplan_personal_records", JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem("demirplan_daily_challenges", JSON.stringify(challenges));
  }, [challenges]);

  // Compute stats
  const level = Math.floor(xp / 100) + 1;
  const xpInCurrentLevel = xp % 100;

  // Handle claim challenge reward
  const handleToggleChallenge = (id: string) => {
    const updated = challenges.map(ch => {
      if (ch.id === id) {
        const nextCompleted = !ch.completed;
        if (nextCompleted) {
          setXp(prev => prev + ch.points);
        } else {
          setXp(prev => Math.max(0, prev - ch.points));
        }
        return { ...ch, completed: nextCompleted };
      }
      return ch;
    });
    setChallenges(updated);
  };

  // Add a new personal record
  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const finalExercise = selectedEx === "Other" ? customEx.trim() : selectedEx;
    const finalWeight = parseFloat(weight);
    const finalReps = parseInt(reps, 10);

    if (!finalExercise || isNaN(finalWeight) || isNaN(finalReps) || !date) {
      setFormError(t.allFieldsRequired);
      return;
    }

    const newRecord: PersonalRecord = {
      id: Date.now().toString(),
      exercise: finalExercise,
      weight: finalWeight,
      reps: finalReps,
      date: date
    };

    setRecords([newRecord, ...records]);
    setXp(prev => prev + 30); // Earn 30 XP for logging a PR!
    setFormSuccess(t.recordAddedSuccess);

    // Reset inputs
    setWeight("");
    setReps("");
    setCustomEx("");
  };

  // Delete record
  const handleDeleteRecord = (id: string) => {
    if (confirm(t.deleteRecordConfirm)) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  // Prepare chart data
  const filteredChartData = records
    .filter(r => r.exercise.toLowerCase() === chartEx.toLowerCase())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(r => ({
      date: r.date,
      weight: r.weight,
      reps: r.reps,
      "One Rep Max (Est)": Math.round(r.weight * (1 + r.reps / 30)) // standard Epley formula
    }));

  const availableExercises = Array.from(new Set(records.map(r => r.exercise)));

  // Badges lists with locked/unlocked state
  const achievements = [
    {
      id: "a1",
      titleAz: "Sonsuz Dəmirçi",
      titleEn: "Infinite Lifter",
      titleRu: "Железный Человек",
      descAz: "DəmirPlan Pro daxilində 3-cü Səviyyəyə (Level) yüksəlin.",
      descEn: "Reach Level 3 in DemirPlan Pro to unlock.",
      descRu: "Достигните 3-го уровня, чтобы разблокировать.",
      unlocked: level >= 3,
      icon: "🔥"
    },
    {
      id: "a2",
      titleAz: "Qəhrəman Rekordçu",
      titleEn: "Record Breaker",
      titleRu: "Разрушитель Барьеров",
      descAz: "Ən azı 3 fərqli Şəxsi Rekord (PR) qeyd edin.",
      descEn: "Log at least 3 different personal records (PRs).",
      descRu: "Внесите минимум 3 различных личных рекорда.",
      unlocked: records.length >= 3,
      icon: "🏆"
    },
    {
      id: "a3",
      titleAz: "Su Rəhbəri",
      titleEn: "Hydration Master",
      titleRu: "Властелин Воды",
      descAz: "Gündəlik su içmək çallencini tamamlayın.",
      descEn: "Complete the daily water hydration challenge.",
      descRu: "Завершите ежедневное испытание питьевой воды.",
      unlocked: challenges.find(c => c.type === "water")?.completed || false,
      icon: "💧"
    },
    {
      id: "a4",
      titleAz: "Nizamlı Atlet",
      titleEn: "Consistent Warrior",
      titleRu: "Мастер Дисциплины",
      descAz: "Məşqi bitirmək çallencini tamamlayın.",
      descEn: "Complete the daily training session challenge.",
      descRu: "Завершите ежедневное задание по тренировке.",
      unlocked: challenges.find(c => c.type === "workout")?.completed || false,
      icon: "⚡"
    },
    {
      id: "a5",
      titleAz: "Polad Qol",
      titleEn: "Steel Biceps",
      titleRu: "Стальные Руки",
      descAz: "Hər hansı bir hərəkətdə 100 kq və ya daha çox Şəxsi Rekord əlavə edin.",
      descEn: "Log any Personal Record of 100 kg or more.",
      descRu: "Запишите любой личный рекорд весом 100 кг или более.",
      unlocked: records.some(r => r.weight >= 100),
      icon: "💪"
    },
    {
      id: "a6",
      titleAz: "Dəmir Qalib",
      titleEn: "Iron Champion",
      titleRu: "Железный Чемпион",
      descAz: "Səviyyə 5-ə çatan və bütün çallencləri fəth edən elite idmançılar.",
      descEn: "Reach level 5 and conquer all daily challenges.",
      descRu: "Достигните 5-го уровня и выполните все испытания.",
      unlocked: level >= 5 && challenges.every(c => c.completed),
      icon: "👑"
    }
  ];

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-24 animate-fade-in text-left">
      
      {/* 1. Header Card */}
      <div className="bg-[#1b1d22] border border-[#2a2d34]/80 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-16 -left-16 w-36 h-36 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-amber-500/5 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase bg-amber-500/10 py-1 px-3 rounded-full border border-amber-500/20">
              🏅 DemirPlan Gamification Suite
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight italic uppercase pt-2">
              {t.title}
            </h2>
            <p className="text-xs text-gray-400 max-w-md leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Level Display Badge */}
          <div className="bg-[#141519] border border-[#2a2d34] rounded-2xl p-4 flex items-center gap-3 shrink-0 shadow-lg min-w-[150px]">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-gray-950 font-black text-xl italic shadow-md animate-pulse">
              L{level}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide block">
                {t.level} {level}
              </span>
              <span className="text-xs text-white font-black block mt-0.5 font-mono">
                {xp} XP
              </span>
              {/* Progress bar to next level */}
              <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1.5 overflow-hidden border border-[#2a2d34]">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpInCurrentLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Daily Challenges Section */}
      <div className="bg-[#1b1d22]/80 border border-[#2a2d34]/60 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#2a2d34]/60 pb-3">
          <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center text-lg">
            ⚡
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              {t.dailyChallenges}
            </h3>
            <p className="text-[10px] text-gray-400 leading-none">
              {t.dailyChallengesDesc}
            </p>
          </div>
        </div>

        {/* Challenges list */}
        <div className="space-y-2.5">
          {challenges.map(ch => {
            const localizedTitle = lang === "ru" ? ch.titleRu : lang === "en" ? ch.titleEn : ch.titleAz;
            return (
              <div
                key={ch.id}
                onClick={() => handleToggleChallenge(ch.id)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  ch.completed
                    ? "bg-emerald-500/5 border-emerald-500/30 text-gray-400"
                    : "bg-[#141519]/70 border-[#2a2d34]/60 hover:border-amber-500/40 text-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    ch.completed
                      ? "bg-emerald-500 border-emerald-500 text-gray-950 font-black text-xs"
                      : "border-gray-600 bg-transparent"
                  }`}>
                    {ch.completed && "✓"}
                  </div>
                  <span className={`text-xs font-semibold leading-relaxed truncate ${ch.completed ? "line-through text-gray-500" : ""}`}>
                    {localizedTitle}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-full ${
                    ch.completed ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                  }`}>
                    +{ch.points} XP
                  </span>
                </div>
              </div>
            );
          })}

          {challenges.every(c => c.completed) && (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center text-xs font-black text-emerald-400 animate-bounce">
              {t.allChallengesDone}
            </div>
          )}
        </div>
      </div>

      {/* 3. Personal Records (PR) Tracker */}
      <div className="bg-[#1b1d22]/80 border border-[#2a2d34]/60 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#2a2d34]/60 pb-3">
          <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center text-lg">
            🏋️‍♂️
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              {t.personalRecords}
            </h3>
            <p className="text-[10px] text-gray-400 leading-none">
              {t.personalRecordsDesc}
            </p>
          </div>
        </div>

        {/* PR Log Form */}
        <form onSubmit={handleAddRecord} className="bg-[#141519]/70 border border-[#2a2d34]/60 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-1 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-amber-500" />
            {t.addRecord}
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] text-gray-400 uppercase font-black mb-1">
                {t.exerciseName}
              </label>
              <select
                value={selectedEx}
                onChange={(e) => setSelectedEx(e.target.value)}
                className="w-full bg-[#1b1d22] border border-[#2a2d34] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Bench Press">Bench Press</option>
                <option value="Squat">Squat</option>
                <option value="Deadlift">Deadlift</option>
                <option value="Overhead Press">Overhead Press</option>
                <option value="Barbell Row">Barbell Row</option>
                <option value="Pull-ups">Pull-ups</option>
                <option value="Push-ups">Push-ups</option>
                <option value="Other">Other / Digər</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] text-gray-400 uppercase font-black mb-1">
                {lang === "ru" ? "Дата" : lang === "en" ? "Date" : "Tarix"}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1b1d22] border border-[#2a2d34] rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {selectedEx === "Other" && (
            <div className="animate-fade-in">
              <label className="block text-[9px] text-gray-400 uppercase font-black mb-1">
                {lang === "ru" ? "Название упражнения" : lang === "en" ? "Exercise Name" : "Xüsusi hərəkət adı"}
              </label>
              <input
                type="text"
                placeholder="Incline Dumbbell Press..."
                value={customEx}
                onChange={(e) => setCustomEx(e.target.value)}
                className="w-full bg-[#1b1d22] border border-[#2a2d34] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] text-gray-400 uppercase font-black mb-1">
                {t.weightKgs}
              </label>
              <input
                type="number"
                placeholder="80"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-[#1b1d22] border border-[#2a2d34] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[9px] text-gray-400 uppercase font-black mb-1">
                {t.repsCount}
              </label>
              <input
                type="number"
                placeholder="5"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full bg-[#1b1d22] border border-[#2a2d34] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {formError && <p className="text-[10px] text-red-400 font-bold">{formError}</p>}
          {formSuccess && <p className="text-[10px] text-emerald-400 font-bold">{formSuccess}</p>}

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t.saveRecord}
          </button>
        </form>

        {/* PR History Charts */}
        <div className="bg-[#141519]/70 border border-[#2a2d34]/60 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-[#2a2d34]/40 pb-2">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              {t.historyCharts}
            </h4>

            {availableExercises.length > 0 && (
              <select
                value={chartEx}
                onChange={(e) => setChartEx(e.target.value)}
                className="bg-[#1b1d22] border border-[#2a2d34] rounded-lg py-1 px-2.5 text-[10px] text-white focus:outline-none cursor-pointer"
              >
                {availableExercises.map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            )}
          </div>

          {/* Dynamic strength trend chart */}
          {filteredChartData.length >= 2 ? (
            <div className="h-44 w-full pt-2">
              {(() => {
                const width = 450;
                const height = 150;
                const paddingLeft = 35;
                const paddingRight = 15;
                const paddingTop = 15;
                const paddingBottom = 20;

                const weights = filteredChartData.map(d => d.weight);
                const orms = filteredChartData.map(d => d["One Rep Max (Est)"]);
                const allVals = [...weights, ...orms];
                const minVal = Math.min(...allVals);
                const maxVal = Math.max(...allVals);
                const diff = maxVal - minVal;
                const rangeMin = Math.max(0, minVal - (diff * 0.15 || 5));
                const rangeMax = maxVal + (diff * 0.15 || 5);
                const rangeDiff = rangeMax - rangeMin || 1;

                // Points calculation
                const pts = filteredChartData.map((d, i) => {
                  const x = paddingLeft + (i / (filteredChartData.length - 1)) * (width - paddingLeft - paddingRight);
                  const y = height - paddingBottom - ((d.weight - rangeMin) / rangeDiff) * (height - paddingTop - paddingBottom);
                  const yOrm = height - paddingBottom - ((d["One Rep Max (Est)"] - rangeMin) / rangeDiff) * (height - paddingTop - paddingBottom);
                  return { x, y, yOrm, ...d };
                });

                // Paths
                const weightPath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                const ormPath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yOrm}`).join(" ");

                return (
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Grids */}
                    <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="#2a2d34" strokeOpacity={0.4} strokeDasharray="3 3" />
                    <line x1={paddingLeft} y1={(paddingTop + height - paddingBottom) / 2} x2={width - paddingRight} y2={(paddingTop + height - paddingBottom) / 2} stroke="#2a2d34" strokeOpacity={0.4} strokeDasharray="3 3" />
                    <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#2a2d34" strokeOpacity={0.6} />

                    {/* Y Axis Labels */}
                    <text x={paddingLeft - 8} y={paddingTop + 4} fill="#9ca3af" fontSize={8} textAnchor="end" className="font-mono">{Math.round(rangeMax)}</text>
                    <text x={paddingLeft - 8} y={(paddingTop + height - paddingBottom) / 2 + 3} fill="#9ca3af" fontSize={8} textAnchor="end" className="font-mono">{Math.round((rangeMax + rangeMin) / 2)}</text>
                    <text x={paddingLeft - 8} y={height - paddingBottom + 3} fill="#9ca3af" fontSize={8} textAnchor="end" className="font-mono">{Math.round(rangeMin)}</text>

                    {/* Path 1: 1-Rep Max */}
                    <path d={ormPath} fill="none" stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 3" />

                    {/* Path 2: Weight */}
                    <path d={weightPath} fill="none" stroke="#f59e0b" strokeWidth={2.5} />

                    {/* Points & Hover Labels */}
                    {pts.map((p, i) => (
                      <g key={i}>
                        {/* 1-Rep Max dot */}
                        <circle cx={p.x} cy={p.yOrm} r={3} fill="#10b981" />
                        
                        {/* Weight dot */}
                        <circle cx={p.x} cy={p.y} r={4.5} fill="#f59e0b" stroke="#141519" strokeWidth={1} />
                        
                        {/* Date Label on bottom */}
                        <text x={p.x} y={height - 4} fill="#9ca3af" fontSize={7} textAnchor="middle" className="font-mono">
                          {p.date.slice(5)}
                        </text>

                        {/* Value Labels */}
                        <text x={p.x} y={p.y - 8} fill="#f59e0b" fontSize={8} fontWeight="bold" textAnchor="middle" className="font-mono">
                          {p.weight}
                        </text>
                      </g>
                    ))}
                  </svg>
                );
              })()}
              <div className="flex justify-between text-[8px] text-gray-500 font-mono px-1.5 pt-1.5 border-t border-[#2a2d34]/20 mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-amber-500 inline-block" /> Solid: Max Lift weight (kg)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-emerald-500 border-t border-dashed inline-block" /> Dashed: Est. 1-Rep Max
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-[10px] text-gray-500 italic max-w-[280px] mx-auto leading-relaxed">
              {t.chartPlaceholder}
            </div>
          )}
        </div>

        {/* PR History List */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
            {t.recordsHistory}
          </h4>

          {records.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-4 text-center">{t.noRecords}</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {records.map(rec => (
                <div
                  key={rec.id}
                  className="bg-[#141519]/70 border border-[#2a2d34]/60 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-extrabold text-white block truncate">
                      {rec.exercise}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 font-mono">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      {rec.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-mono text-xs font-black text-amber-500 bg-amber-500/10 py-1 px-2.5 rounded-lg border border-amber-500/15">
                        {rec.weight} kg
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold block mt-1">
                        {rec.reps} reps
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteRecord(rec.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer border border-[#2a2d34]/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Trophy / Badges Room */}
      <div className="bg-[#1b1d22]/80 border border-[#2a2d34]/60 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#2a2d34]/60 pb-3">
          <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center text-lg">
            🏆
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              {t.trophyRoom}
            </h3>
            <p className="text-[10px] text-gray-400 leading-none">
              {t.trophyRoomDesc}
            </p>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 gap-3">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                ach.unlocked
                  ? "bg-amber-500/[0.03] border-amber-500/30 text-white shadow-md relative overflow-hidden"
                  : "bg-gray-950/20 border-gray-800 text-gray-500 opacity-60"
              }`}
            >
              {/* Confetti or glow for unlocked */}
              {ach.unlocked && (
                <div className="absolute top-0 right-0 bg-amber-500 text-gray-950 text-[7px] font-black uppercase px-2 py-0.5 rounded-bl-lg tracking-wider">
                  {t.unlocked}
                </div>
              )}

              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2.5 ${
                ach.unlocked ? "bg-amber-500/15 scale-105" : "bg-[#141519]/60 border border-[#2a2d34]"
              }`}>
                {ach.unlocked ? ach.icon : <Lock className="w-5 h-5 text-gray-600" />}
              </div>

              <h4 className={`text-xs font-black tracking-tight leading-snug uppercase ${ach.unlocked ? "text-amber-400" : "text-gray-500"}`}>
                {lang === "ru" ? ach.titleRu : lang === "en" ? ach.titleEn : ach.titleAz}
              </h4>

              <p className="text-[9px] text-gray-400 mt-1 leading-snug font-medium max-w-[130px]">
                {lang === "ru" ? ach.descRu : lang === "en" ? ach.descEn : ach.descAz}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
