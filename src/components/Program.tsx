import React, { useState } from "react";
import { WorkoutDay, WorkoutExercise, WorkoutLogs } from "../types";
import { Plus, Trash2, Edit2, Check, ArrowUp, ArrowDown, Sparkles, AlertTriangle, Eye, RefreshCw, X } from "lucide-react";

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
}: ProgramProps) {
  const [showGenForm, setShowGenForm] = useState(false);
  const [genGoal, setGenGoal] = useState("kütlə yığma");
  const [genDays, setGenDays] = useState(5);
  const [genLevel, setGenLevel] = useState("orta");
  const [genEquip, setGenEquip] = useState("tam təchizatlı zal");
  const [genNotes, setGenNotes] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const [showPicker, setShowPicker] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customExName, setCustomExName] = useState("");

  const [openExercises, setOpenExercises] = useState<{ [key: string]: boolean }>({});

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

  const handlePickExercise = (exName: string) => {
    const newProg = [...program];
    const isTime = TIME_BASED.some((t) => exName.toLowerCase().includes(t.toLowerCase()));
    const newEx: WorkoutExercise = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: exName,
      sets: 3,
      reps: isTime ? "45-60" : "10",
      isTime,
    };
    newProg[activeDaySafe].exercises.push(newEx);
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
            <h3 className="text-xl font-bold mt-4">Sənin Məşq Proqramın</h3>
            <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              Hələ heç bir məşq günü təyin etməmisiniz. Sürətli bir başlanğıc üçün hazır şablondan istifadə edin və ya Aİ köməkçimizə fərdi proqram hazırladın!
            </p>
          </div>

          <button
            onClick={handleStartManual}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl cursor-pointer transition-all uppercase tracking-wider text-sm shadow-md"
          >
            ✏️ Sıfırdan Özüm Quracam
          </button>

          <button
            onClick={() => setShowGenForm(!showGenForm)}
            className="w-full py-4 bg-[#1b1d22] hover:bg-[#22242b] border border-amber-500/20 hover:border-amber-500 text-amber-500 font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4" /> 🤖 Aİ Fərdi Proqram Yaratsın
          </button>

          <button
            onClick={handleLoadTemplate}
            className="w-full py-4 bg-[#1b1d22] hover:bg-[#22242b] border border-[#2a2d34] text-white font-semibold rounded-xl cursor-pointer transition-all text-sm"
          >
            📋 Hazır Şablon Yüklə (PPL — 7 Günlük)
          </button>

          {showGenForm && (
            <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 text-left space-y-4">
              <div className="flex items-center gap-2 text-amber-500 font-bold">
                <Sparkles className="w-5 h-5" /> <span>🤖 Aİ Proqram Qurucusu</span>
              </div>
              {!isPremium && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-300 leading-relaxed">
                    Aİ ilə məşq proqramının yaradılması <b className="text-amber-500 font-bold">Premium</b> xüsusiyyətdir. Klikləyin və saniyələr içində Premium əldə edin!
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Məqsəd</label>
                  <select
                    value={genGoal}
                    onChange={(e) => setGenGoal(e.target.value)}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm"
                  >
                    <option value="kütlə yığma">Kütlə yığma (Hacm)</option>
                    <option value="arıqlama">Arıqlama (Defisit)</option>
                    <option value="güc artırma">Güc artırma</option>
                    <option value="ümumi forma">Ümumi forma qoruma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Həftəlik gün</label>
                  <select
                    value={genDays}
                    onChange={(e) => setGenDays(Number(e.target.value))}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm"
                  >
                    <option value={3}>3 Gün</option>
                    <option value={4}>4 Gün</option>
                    <option value={5}>5 Gün</option>
                    <option value={6}>6 Gün</option>
                    <option value={7}>7 Gün</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Səviyyə</label>
                  <select
                    value={genLevel}
                    onChange={(e) => setGenLevel(e.target.value)}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm"
                  >
                    <option value="başlanğıc">Başlanğıc (Beginner)</option>
                    <option value="orta">Orta (Intermediate)</option>
                    <option value="irəli">İrəli (Advanced)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Avadanlıq</label>
                  <select
                    value={genEquip}
                    onChange={(e) => setGenEquip(e.target.value)}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm"
                  >
                    <option value="tam təchizatlı zal">Tam Təchizatlı Zal</option>
                    <option value="yalnız dumbbell və turnik">Ev (Dumbbell + Turnik)</option>
                    <option value="yalnız bədən çəkisi">Yalnız Bədən Çəkisi (Calisthenics)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Xüsusi qeydlər (İstəyə bağlı)</label>
                <textarea
                  value={genNotes}
                  onChange={(e) => setGenNotes(e.target.value)}
                  placeholder="Məs. Sol dizim zədəlidir, ayaq məşqi çox ağır olmasın"
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
                    <RefreshCw className="w-4 h-4 animate-spin" /> Aİ proqramınızı hazırlayır...
                  </>
                ) : (
                  <>Proqramı Yaradın</>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 2. Program Dashboard Layout */
        <div className="space-y-4">
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
                <span className="text-[9px] font-bold tracking-widest uppercase">GÜN {i + 1}</span>
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
                <span className="text-[9px] font-bold mt-1 uppercase">Əlavə et</span>
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
                    placeholder="Gün adı (məs. PUSH)"
                    onChange={(e) => handleEditDayField("title", e.target.value)}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl px-3 py-2 text-white font-black text-lg uppercase focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={currentDay.subtitle}
                    placeholder="Qısa alt başlıq"
                    onChange={(e) => handleEditDayField("subtitle", e.target.value)}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500"
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
                    {doneSets}/{totalSets} set
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
                {editMode ? "Yadda Saxla" : "✏️ Proqramı Dəyiş"}
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
                      className="flex-1 bg-[#131417] border border-[#2a2d34] rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={ex.sets}
                        placeholder="Set"
                        onChange={(e) => handleEditExField(idx, "sets", Number(e.target.value) || 1)}
                        className="w-14 bg-[#131417] border border-[#2a2d34] rounded-xl px-2 py-2 text-white text-center text-sm focus:outline-none"
                      />
                      <input
                        type="text"
                        value={ex.reps}
                        placeholder="Təkrar"
                        onChange={(e) => handleEditExField(idx, "reps", e.target.value)}
                        className="w-18 bg-[#131417] border border-[#2a2d34] rounded-xl px-2 py-2 text-white text-center text-sm focus:outline-none"
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
                    <span>{ex.isTime ? "Saniyə (Vaxt əsaslı)" : "Təkrar əsaslı"}</span>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setShowPicker(activeDaySafe)}
                className="w-full py-3 border border-dashed border-[#2a2d34] text-amber-500 bg-[#1b1d22]/40 hover:bg-[#1b1d22] font-semibold rounded-xl text-sm cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Hərəkət Əlavə Et
              </button>

              <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4">
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Günün Kardio Qeydi (istəyə bağlı)</label>
                <input
                  type="text"
                  value={currentDay.cardio}
                  placeholder="Məs. 15 dəqiqə sürətli qaçış"
                  onChange={(e) => handleEditDayField("cardio", e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => handleDelDay(activeDaySafe)}
                  className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-xl cursor-pointer transition-all text-xs uppercase"
                >
                  🗑️ Bu Məşq Gününü Sil
                </button>
                <button
                  onClick={handleResetProgram}
                  className="w-full py-3 bg-[#1b1d22] hover:bg-[#22242b] border border-[#2a2d34] text-gray-400 font-medium rounded-xl cursor-pointer transition-all text-xs uppercase"
                >
                  Bütün Proqramı Sıfırla
                </button>
              </div>
            </div>
          ) : (
            /* Active Logging Panel */
            <div className="space-y-4">
              {currentDay.exercises.length === 0 && !currentDay.cardio && (
                <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-8 text-center">
                  <div className="text-3xl">😴</div>
                  <h4 className="text-lg font-bold mt-3">İstirahət Günü</h4>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                    Əzələləriniz dincələrkən böyüyür və inkişaf edir. Tam bərpa olunmaq üçün yaxşıca dincəlin və kifayət qədər su için.
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
                    <button
                      onClick={() => toggleExOpen(ex.id)}
                      className="w-full p-4 flex items-center justify-between text-left focus:outline-none cursor-pointer hover:bg-[#22242b]/50"
                    >
                      <div>
                        <div className="font-bold text-white text-base flex items-center gap-2">
                          <span>{ex.name}</span>
                          {isAllDone && (
                            <span className="text-[10px] py-0.5 px-2 bg-emerald-500/10 text-emerald-400 rounded-full font-extrabold uppercase tracking-wide">
                              ✓ Tamamlandı
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {ex.sets} set × {ex.reps} {ex.isTime ? "saniyə" : "təkrar"}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <span className={`font-black ${isAllDone ? "text-emerald-400" : "text-gray-400"}`}>
                          {doneCount}/{ex.sets}
                        </span>
                        <span className={`text-xs text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                          ▼
                        </span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-[#2a2d34]/60 pt-3 bg-[#131417]/20 space-y-2">
                        <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-500 uppercase font-bold text-center tracking-wider pb-1">
                          <span>Set</span>
                          <span>{ex.isTime ? "Saniyə" : "Çəki (kq)"}</span>
                          <span>{ex.isTime ? "—" : "Təkrar"}</span>
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
                                className="w-full bg-[#131417] border border-[#2a2d34] rounded-lg py-1.5 px-2 text-white text-center text-sm focus:outline-none focus:border-amber-500"
                              />
                              <input
                                type="number"
                                inputMode="numeric"
                                placeholder={ex.reps.split("-")[0]}
                                value={setVal.r}
                                onChange={(e) => handleSetVal(ex.id, sIdx, "r", e.target.value)}
                                className="w-full bg-[#131417] border border-[#2a2d34] rounded-lg py-1.5 px-2 text-white text-center text-sm focus:outline-none focus:border-amber-500"
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
                      </div>
                    )}
                  </div>
                );
              })}

              {currentDay.cardio && (
                <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-base">🏃 Kardio fəaliyyəti</div>
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
        </div>
      )}

      {/* 3. Dropdown Selection Picker (Modal) */}
      {showPicker !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-[#1b1d22] rounded-t-3xl w-full max-w-md p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Hərəkət Seçin</h3>
              <button
                onClick={() => setShowPicker(null)}
                className="p-1.5 hover:bg-[#22242b] rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider">Axtar və ya yenisini əlavə et</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Məs. Arnold press"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCustomExName(e.target.value);
                  }}
                  className="flex-1 bg-[#131417] border border-[#2a2d34] rounded-xl px-3 py-2 text-white focus:outline-none text-sm"
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
                  Yarat
                </button>
              </div>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 max-h-[40vh]">
              {filteredExLib.map((g) => (
                <div key={g.group} className="space-y-1.5">
                  <div className="text-[10px] font-black tracking-widest text-amber-500 uppercase pb-0.5">{g.group}</div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {g.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => handlePickExercise(item)}
                        className="w-full text-left py-2.5 px-3.5 bg-[#131417] hover:bg-[#22242b] border border-[#2a2d34] rounded-xl text-sm text-gray-200 flex justify-between items-center cursor-pointer transition-all"
                      >
                        <span>{item}</span>
                        <span className="text-amber-500 font-bold">＋</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
