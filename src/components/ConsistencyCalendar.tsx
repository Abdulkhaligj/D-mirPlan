import React, { useState } from "react";
import { WorkoutLogs, WorkoutDay } from "../types";
import { Calendar, Award, Flame, Dumbbell, Trophy, TrendingUp, CheckCircle2, ChevronRight, Activity, CalendarDays, X, Sparkles } from "lucide-react";

interface ConsistencyCalendarProps {
  logs: WorkoutLogs;
  program?: WorkoutDay[];
}

interface DayData {
  date: string;
  dayLabel: string;
  monthLabel: string;
  dayOfWeek: string;
  dayNum: number;
  titles: string[];
  totalSets: number;
  hasCardio: boolean;
  maxWeight: number;
  isActive: boolean;
}

export default function ConsistencyCalendar({ logs, program = [] }: ConsistencyCalendarProps) {
  // Generate last 30 days data
  const daysData: DayData[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const dayName = d.toLocaleDateString("az-AZ", { weekday: "short" });
    const monthName = d.toLocaleDateString("az-AZ", { month: "short" });
    const dayNum = d.getDate();

    // Fetch workout status for this date
    const matches = Object.entries(logs).filter(([key]) => key.endsWith(`|${dateStr}`));
    const titles: string[] = [];
    let totalSets = 0;
    let hasCardio = false;
    let maxWeight = 0;

    matches.forEach(([key, dayLog]) => {
      const title = dayLog.__title || "Məşq Günü";
      if (!titles.includes(title)) titles.push(title);
      if (dayLog.__cardio) hasCardio = true;

      Object.entries(dayLog).forEach(([id, setsArr]) => {
        if (!id.startsWith("__") && Array.isArray(setsArr)) {
          setsArr.forEach((s) => {
            if (s && s.done) {
              totalSets++;
              const w = parseFloat(s.w) || 0;
              if (w > maxWeight) maxWeight = w;
            }
          });
        }
      });
    });

    const isActive = totalSets > 0 || hasCardio;

    daysData.push({
      date: dateStr,
      dayLabel: `${dayNum} ${monthName}`,
      monthLabel: monthName,
      dayOfWeek: dayName,
      dayNum,
      titles,
      totalSets,
      hasCardio,
      maxWeight,
      isActive,
    });
  }

  // Selected day for detailed view (defaults to today / last day)
  const [selectedDate, setSelectedDate] = useState<string>(daysData[daysData.length - 1].date);
  const selectedDay = daysData.find((d) => d.date === selectedDate) || daysData[daysData.length - 1];
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Map exercise ID to details (name, isTime) from current program
  const idToExInfo: { [id: string]: { name: string; isTime: boolean } } = {};
  program?.forEach((day) => {
    day.exercises.forEach((ex) => {
      idToExInfo[ex.id] = { name: ex.name, isTime: !!ex.isTime };
    });
  });

  // Fetch detailed logged exercises for a specific date
  const getLoggedExercisesForDate = (dateStr: string) => {
    const matches = Object.entries(logs).filter(([key]) => key.endsWith(`|${dateStr}`));
    const list: Array<{ name: string; isTime: boolean; sets: any[] }> = [];
    matches.forEach(([key, dayLog]) => {
      Object.entries(dayLog).forEach(([id, setsArr]) => {
        if (!id.startsWith("__") && Array.isArray(setsArr)) {
          const info = idToExInfo[id];
          const name = info ? info.name : `Hərəkət (${id})`;
          const isTime = info ? info.isTime : false;
          const completedSets = setsArr.filter((s) => s && s.done);
          if (completedSets.length > 0) {
            list.push({
              name,
              isTime,
              sets: completedSets,
            });
          }
        }
      });
    });
    return list;
  };

  // Consistency Statistics
  const activeDaysCount = daysData.filter((d) => d.isActive).length;
  const consistencyRate = Math.round((activeDaysCount / 30) * 100);
  
  // Calculate total sets and max weight overall
  let totalSets30Days = 0;
  let overallMaxWeight = 0;
  daysData.forEach((d) => {
    totalSets30Days += d.totalSets;
    if (d.maxWeight > overallMaxWeight) {
      overallMaxWeight = d.maxWeight;
    }
  });

  // Calculate Streak
  let currentStreak = 0;
  // Start from today and count backwards consecutively
  for (let i = daysData.length - 1; i >= 0; i--) {
    if (daysData[i].isActive) {
      currentStreak++;
    } else {
      // If today is not active yet, but yesterday was, we don't break immediately unless we're past today
      if (i === daysData.length - 1) {
        continue;
      }
      break;
    }
  }

  // Helper to determine heat map color
  const getHeatmapColorClass = (day: DayData, isSelected: boolean) => {
    let base = "";
    if (!day.isActive) {
      base = "bg-[#1b1d22]/80 border-[#2a2d34]/60 text-gray-500 hover:border-gray-600 hover:bg-[#20232a]";
    } else if (day.totalSets >= 8) {
      base = "bg-emerald-500 border-emerald-400 text-gray-950 font-bold hover:scale-105 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
    } else if (day.totalSets >= 4) {
      base = "bg-emerald-500/60 border-emerald-500/80 text-white font-bold hover:scale-105";
    } else {
      // Low activity or cardio only
      base = "bg-emerald-500/25 border-emerald-500/40 text-emerald-300 font-semibold hover:scale-105";
    }

    const borderSelection = isSelected 
      ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-[#131417] scale-105 z-10" 
      : "";

    return `${base} ${borderSelection}`;
  };

  const getEncouragingMessage = (rate: number) => {
    if (rate >= 80) return "Möhtəşəm nəticə! Dəmir intizamınız var. Eyni templə davam edin! 🏆🔥";
    if (rate >= 50) return "Əla irəliləyiş! Həftədə 3-4 gün məşq etməklə hədəflərinizə yaxınlaşırsınız. 👍🏋️‍♂️";
    if (rate >= 20) return "Yaxşı başlanğıcdır! İntizamı artıraraq daha böyük uğurlar əldə edə bilərsiniz. 💪✨";
    return "Məşqlərə başlamaq üçün heç vaxt gec deyil. Bu gün yeni bir vərəq açın! 🌟";
  };

  return (
    <div className="space-y-4 animate-fade-in" id="consistency-calendar-container">
      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 gap-3" id="stats-bento-grid">
        {/* Consistency rate */}
        <div 
          id="stat-card-consistency"
          className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold font-mono">Davamlılıq</span>
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-3xl font-black text-white italic tracking-tight">
              {consistencyRate}%
            </div>
            <div className="text-[10px] text-gray-400 font-bold">
              {activeDaysCount} / 30 gün aktivdir
            </div>
          </div>
          {/* Subtle progress background */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${consistencyRate}%` }} />
          </div>
        </div>

        {/* Streak / Seriya */}
        <div 
          id="stat-card-streak"
          className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold font-mono">Cari Seriya</span>
            <span className="p-1 rounded-lg bg-orange-500/10 text-orange-400">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
            </span>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-3xl font-black text-white italic tracking-tight">
              {currentStreak} <span className="text-sm font-normal not-italic text-gray-400">gün</span>
            </div>
            <div className="text-[10px] text-gray-400 font-bold">
              Arxa-arxaya aktiv günlər
            </div>
          </div>
          {/* Subtle flame glow background indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500" 
              style={{ width: `${Math.min(100, (currentStreak / 7) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Total sets 30 days */}
        <div 
          id="stat-card-total-sets"
          className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold font-mono">Toplam Set</span>
            <span className="p-1 rounded-lg bg-blue-500/10 text-blue-400">
              <Dumbbell className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white italic tracking-tight">
              {totalSets30Days} <span className="text-xs font-normal not-italic text-gray-400">set</span>
            </div>
            <span className="text-[9px] text-gray-400 block mt-1 leading-tight font-medium">
              30 gün ərzində qaldırılan toplam ağırlıq seriyası
            </span>
          </div>
        </div>

        {/* Max lift */}
        <div 
          id="stat-card-max-lift"
          className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold font-mono">Maks. Güc</span>
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-500">
              <Trophy className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white italic tracking-tight">
              {overallMaxWeight ? `${overallMaxWeight} kq` : "—"}
            </div>
            <span className="text-[9px] text-gray-400 block mt-1 leading-tight font-medium">
              Son 30 gündə qeydə alınan ən ağır qaldırma gücü
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Section */}
      <div 
        id="heatmap-panel"
        className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl p-5 space-y-4 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-white text-sm">30 Günlük Aktivlik Xəritəsi</h3>
          </div>
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest font-mono">
            Keçmiş 30 gün
          </span>
        </div>

        {/* Heatmap grid */}
        <div 
          id="heatmap-grid"
          className="grid grid-cols-6 gap-2 pt-1"
        >
          {daysData.map((day, idx) => {
            const isSelected = day.date === selectedDate;
            return (
              <button
                id={`heatmap-cell-${day.date}`}
                key={day.date}
                onClick={() => {
                  setSelectedDate(day.date);
                  setIsModalOpen(true);
                }}
                className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all duration-200 cursor-pointer text-center relative ${getHeatmapColorClass(day, isSelected)}`}
              >
                {/* Day number */}
                <span className="text-xs font-black font-mono">{day.dayNum}</span>
                {/* Short month / status */}
                <span className="text-[8px] uppercase tracking-tighter opacity-80 font-semibold leading-tight">
                  {day.monthLabel}
                </span>

                {/* Micro indicator icon inside cell if active */}
                {day.isActive && (
                  <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-white/40" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div 
          id="heatmap-legend"
          className="flex justify-between items-center text-[9px] text-gray-500 font-bold uppercase tracking-wider font-mono border-t border-[#2a2d34]/60 pt-3"
        >
          <span>Az Aktivlik</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-[#1b1d22] border border-[#2a2d34]/60" title="Aktiv deyil" />
            <span className="w-2.5 h-2.5 rounded-md bg-emerald-500/25 border border-emerald-500/40" title="1-3 set" />
            <span className="w-2.5 h-2.5 rounded-md bg-emerald-500/60 border border-emerald-500/80" title="4-7 set" />
            <span className="w-2.5 h-2.5 rounded-md bg-emerald-500 border border-emerald-400" title="8+ set" />
          </div>
          <span>Çox Aktivlik</span>
        </div>
      </div>

      {/* Selected Day Detail Panel */}
      <div 
        id="selected-day-detail-panel"
        className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl p-5 space-y-4 shadow-xl"
      >
        <div className="flex justify-between items-center border-b border-[#2a2d34]/40 pb-3">
          <div className="space-y-1">
            <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest font-mono">
              Seçilmiş Günün Analizi
            </span>
            <h4 className="text-sm font-black text-white italic uppercase tracking-tight">
              {selectedDay.dayOfWeek}, {selectedDay.dayLabel}
            </h4>
          </div>
          <div className="text-right">
            {selectedDay.isActive ? (
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                Məşq Tamamlanıb ✓
              </span>
            ) : (
              <span className="text-[9px] bg-[#141519] text-gray-500 border border-[#2a2d34] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                İstirahət Günü 😴
              </span>
            )}
          </div>
        </div>

        {selectedDay.isActive ? (
          <div className="space-y-3.5 animate-fade-in" id="day-detail-active">
            {/* Exercise summary row */}
            <div className="space-y-1">
              <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest font-mono">Məşq Proqramı</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDay.titles.map((title, tIdx) => (
                  <span 
                    key={tIdx} 
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider"
                  >
                    🏋️‍♂️ {title}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-[#141519] border border-[#2a2d34]/60 p-3 rounded-xl space-y-0.5 text-center">
                <span className="text-[8px] text-gray-500 uppercase font-extrabold tracking-wider font-mono block">Toplam Set</span>
                <span className="text-base font-black text-white">{selectedDay.totalSets} set</span>
              </div>
              
              <div className="bg-[#141519] border border-[#2a2d34]/60 p-3 rounded-xl space-y-0.5 text-center">
                <span className="text-[8px] text-gray-500 uppercase font-extrabold tracking-wider font-mono block">Maks. Çəki</span>
                <span className="text-base font-black text-amber-500">
                  {selectedDay.maxWeight > 0 ? `${selectedDay.maxWeight} kq` : "—"}
                </span>
              </div>

              <div className="bg-[#141519] border border-[#2a2d34]/60 p-3 rounded-xl space-y-0.5 text-center">
                <span className="text-[8px] text-gray-500 uppercase font-extrabold tracking-wider font-mono block">Kardio</span>
                <span className="text-base font-black text-blue-400">
                  {selectedDay.hasCardio ? "Bəli ✓" : "Xeyr"}
                </span>
              </div>
            </div>

            {/* Completion congrats badge */}
            <div className="flex gap-3 items-center bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
              <span className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-sm font-bold shrink-0">
                ✓
              </span>
              <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                Bu gün bədəninizi gücləndirmək üçün mükəmməl addım atdınız. İntizam gələcək uğurunuzdur!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 animate-fade-in py-1" id="day-detail-rest">
            <div className="flex gap-3 items-center bg-[#141519]/60 border border-[#2a2d34]/50 rounded-2xl p-4">
              <span className="text-2xl shrink-0">🧘‍♀️</span>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">Aktiv bərpa və istirahət</span>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Əzələlərin böyüməsi və güclənməsi istirahət vaxtı baş verir. Bu günü bol maye qəbul edərək və bədəninizi bərpa edərək keçirin.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Encouragement Banner */}
      <div 
        id="calendar-motivation-card"
        className="bg-gradient-to-r from-amber-500/15 to-orange-500/5 border border-amber-500/20 rounded-3xl p-5 flex items-center gap-4 shadow-md"
      >
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-lg font-bold shrink-0">
          🔥
        </div>
        <div className="space-y-1">
          <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest font-mono">Bədənini Qur, İradəni İtirmə</span>
          <p className="text-xs text-gray-300 leading-relaxed font-semibold">
            {getEncouragingMessage(consistencyRate)}
          </p>
        </div>
      </div>

      {/* Detailed Summary Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
          id="consistency-modal-overlay"
        >
          <div 
            className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
            id="consistency-modal-content"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#2a2d34]/40 pb-3">
              <div className="space-y-0.5">
                <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest font-mono">
                  Günün Məşq Hesabatı
                </span>
                <h3 className="text-base font-black text-white italic uppercase tracking-tight">
                  {selectedDay.dayOfWeek}, {selectedDay.dayLabel}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-[#252830] rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {selectedDay.isActive ? (
                <div className="space-y-4">
                  {/* General Stats in Modal */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#141519]/80 border border-[#2a2d34]/60 p-3 rounded-2xl text-center">
                      <span className="text-[8px] text-gray-400 uppercase font-extrabold tracking-wider font-mono block">Toplam Set</span>
                      <span className="text-sm font-black text-white">{selectedDay.totalSets} set ✓</span>
                    </div>
                    <div className="bg-[#141519]/80 border border-[#2a2d34]/60 p-3 rounded-2xl text-center">
                      <span className="text-[8px] text-gray-400 uppercase font-extrabold tracking-wider font-mono block">Maks. Çəki</span>
                      <span className="text-sm font-black text-amber-500">
                        {selectedDay.maxWeight > 0 ? `${selectedDay.maxWeight} kq` : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Exercises List */}
                  <div className="space-y-2.5">
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest font-mono block">Tamamlanan Hərəkətlər</span>
                    {getLoggedExercisesForDate(selectedDay.date).length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-2.5 text-center bg-[#141519]/40 rounded-xl border border-[#2a2d34]/40">
                        Hərəkət qeydi yoxdur (yalnız kardio).
                      </p>
                    ) : (
                      getLoggedExercisesForDate(selectedDay.date).map((ex, exIdx) => (
                        <div 
                          key={exIdx} 
                          className="bg-[#141519]/60 border border-[#2a2d34]/40 p-3.5 rounded-2xl space-y-2.5"
                        >
                          <span className="text-xs font-bold text-white uppercase tracking-wider block">
                            🏋️‍♂️ {ex.name}
                          </span>
                          
                          {/* Sets list */}
                          <div className="grid grid-cols-3 gap-2">
                            {ex.sets.map((set, sIdx) => (
                              <div 
                                key={sIdx} 
                                className="bg-[#181a20]/80 border border-[#2a2d34]/50 p-2 rounded-xl text-center font-mono"
                              >
                                <span className="text-[8px] text-gray-500 font-bold uppercase block">Set {sIdx + 1}</span>
                                <span className="text-[11px] text-gray-200 font-bold block mt-0.5">
                                  {ex.isTime ? `${set.r} san` : `${set.w} kq`}
                                </span>
                                {!ex.isTime && (
                                  <span className="text-[9px] text-gray-400 block font-normal">
                                    {set.r} təkrar
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Cardio completed check */}
                  {selectedDay.hasCardio && (
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-3.5 flex gap-3 items-center">
                      <span className="text-xl shrink-0">🏃</span>
                      <div className="space-y-0.5 text-left">
                        <span className="text-xs font-bold text-blue-400 block">Kardio Fəaliyyəti ✓</span>
                        <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                          Bu gün ürək-damar fəallığını nizamlı tamamlayaraq dözümlülük və sağlamlıq tempini artırdınız.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3.5 py-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#141519]/80 border border-[#2a2d34]/60 text-2xl flex items-center justify-center mx-auto shadow-md">
                    🧘‍♀️
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">İstirahət və Bərpa Günü</h4>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                      Əzələləriniz məşq zamanı deyil, məhz bu gün istirahət vaxtı bərpa və inkişaf edir. Bol su için və bədəninizi növbəti məşq gününə tam hazırlayın!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#2a2d34]/40 pt-3 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs uppercase rounded-xl cursor-pointer transition-all shadow-md"
              >
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
