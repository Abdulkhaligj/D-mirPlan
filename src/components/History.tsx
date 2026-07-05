import React, { useState } from "react";
import { WorkoutLogs, WorkoutDay, SetLog } from "../types";
import { Calendar, Award, Flame, Dumbbell, Trophy, ChevronDown, ChevronUp, Sparkles, Activity, Timer } from "lucide-react";

interface HistoryProps {
  logs: WorkoutLogs;
  program?: WorkoutDay[];
}

export default function History({ logs, program = [] }: HistoryProps) {
  const [subTab, setSubTab] = useState<"history" | "prs">("history");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // 1. Map exercise ID to details (name, isTime, dayTitle) from current program
  const idToExInfo: { [id: string]: { name: string; isTime: boolean; dayTitle: string } } = {};
  program.forEach((day) => {
    day.exercises.forEach((ex) => {
      idToExInfo[ex.id] = { name: ex.name, isTime: !!ex.isTime, dayTitle: day.title };
    });
  });

  // 2. Calculate All-Time Personal Records (PRs) from logs
  interface PREntry {
    exerciseName: string;
    maxWeight: number;
    maxReps: number;
    date: string;
    isTime: boolean;
    dayTitle: string;
  }

  const allPRs: { [exerciseName: string]: PREntry } = {};

  Object.entries(logs).forEach(([dayKey, dayLog]) => {
    const [, date] = dayKey.split("|");
    
    Object.entries(dayLog).forEach(([id, setsArr]) => {
      if (id.startsWith("__") || !Array.isArray(setsArr)) return;

      const info = idToExInfo[id];
      const exName = info ? info.name : null;
      const isTime = info ? info.isTime : false;
      const dayTitle = info ? info.dayTitle : (dayLog.__title || "Məşq Günü");

      // We skip if we don't have the exercise name
      if (!exName) return;

      setsArr.forEach((set) => {
        if (set && set.done) {
          const weight = parseFloat(set.w) || 0;
          const reps = parseInt(set.r) || 0;

          if (reps <= 0) return;

          const existing = allPRs[exName];

          if (!existing) {
            allPRs[exName] = {
              exerciseName: exName,
              maxWeight: weight,
              maxReps: reps,
              date,
              isTime,
              dayTitle,
            };
          } else {
            let isBetter = false;
            if (isTime) {
              if (reps > existing.maxReps) {
                isBetter = true;
              }
            } else {
              if (weight > existing.maxWeight) {
                isBetter = true;
              } else if (weight === existing.maxWeight && reps > existing.maxReps) {
                isBetter = true;
              }
            }

            if (isBetter) {
              allPRs[exName] = {
                exerciseName: exName,
                maxWeight: weight,
                maxReps: reps,
                date,
                isTime,
                dayTitle,
              };
            }
          }
        }
      });
    });
  });

  const prList = Object.values(allPRs).sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));

  // 3. Process daily entries list
  const entries = Object.entries(logs)
    .map(([key, dayLog]) => {
      const [dayId, date] = key.split("|");
      const title = dayLog.__title || "Məşq Günü";

      // Count completed sets
      const doneSets = Object.entries(dayLog)
        .filter(([id]) => !id.startsWith("__"))
        .reduce((sum, [, setsArr]) => {
          return sum + (Array.isArray(setsArr) ? setsArr.filter((s) => s && s.done).length : 0);
        }, 0);

      // Find max weight lifted today
      const weights = Object.entries(dayLog)
        .filter(([id]) => !id.startsWith("__"))
        .flatMap(([, setsArr]) => (Array.isArray(setsArr) ? setsArr.map((s) => parseFloat(s.w) || 0) : []));

      const bestWeight = weights.length ? Math.max(...weights) : 0;

      return {
        key,
        dayId,
        date,
        title,
        doneSets,
        cardio: !!dayLog.__cardio,
        bestWeight,
        dayLog,
      };
    })
    .filter((e) => e.doneSets > 0 || e.cardio)
    .sort((a, b) => b.date.localeCompare(a.date));

  const fmtDate = (iso: string) => {
    return new Date(iso + "T00:00:00").toLocaleDateString("az-AZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in" id="history-container">
      {/* Tab Switcher */}
      <div className="flex bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-1 gap-1" id="history-tabs">
        <button
          onClick={() => setSubTab("history")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 focus:outline-none ${
            subTab === "history"
              ? "bg-amber-500 text-gray-950 font-black shadow-md shadow-amber-500/10"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> 📋 Son Məşqlər
        </button>
        <button
          onClick={() => setSubTab("prs")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 focus:outline-none ${
            subTab === "prs"
              ? "bg-amber-500 text-gray-950 font-black shadow-md shadow-amber-500/10"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Trophy className="w-3.5 h-3.5 animate-pulse" /> 🏆 Şəxsi Rekordlar
        </button>
      </div>

      {/* 1. Workout History Tab */}
      {subTab === "history" && (
        <div className="space-y-3" id="recent-workouts-view">
          {entries.length === 0 ? (
            <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl p-8 text-center space-y-3">
              <div className="inline-flex p-3.5 bg-[#131417] border border-[#2a2d34] rounded-full text-gray-400">
                <Flame className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-gray-200">Hələ Məşq Qeydi Yoxdur</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                Məşq proqramında setləri tamamlayıb yaşıl quş işarələrinə basdıqca, burada sizin aktivlik və çəki irəliləyişləriniz göstəriləcək!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((e, idx) => {
                const isExpanded = expandedIndex === idx;

                // Extract exercises logged on this day
                const loggedExercises = Object.entries(e.dayLog)
                  .filter(([id]) => !id.startsWith("__") && Array.isArray(e.dayLog[id]))
                  .map(([id, sets]) => {
                    const info = idToExInfo[id];
                    const name = info ? info.name : `Hərəkət (${id})`;
                    const isTime = info ? info.isTime : false;
                    return {
                      id,
                      name,
                      isTime,
                      sets: sets as SetLog[],
                    };
                  });

                // Check if any exercise performed today set an all-time PR
                const hasPRToday = Object.values(allPRs).some((pr) => pr.date === e.date);

                return (
                  <div
                    key={idx}
                    className={`bg-[#1b1d22] border rounded-3xl p-4 transition-all duration-300 ${
                      isExpanded
                        ? "border-amber-500/40 bg-gradient-to-b from-[#1b1d22] to-[#141519] shadow-lg shadow-amber-500/5"
                        : "border-[#2a2d34] hover:border-[#2a2d34]/80"
                    }`}
                  >
                    {/* Header Row (Clickable to Expand) */}
                    <div
                      className="flex items-center justify-between gap-4 cursor-pointer select-none"
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    >
                      <div className="space-y-1">
                        <div className="font-black italic tracking-wide text-white uppercase text-base flex items-center gap-2">
                          <span>{e.title}</span>
                          {hasPRToday && (
                            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-[9px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shrink-0">
                              🏆 Rekord!
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>{fmtDate(e.date)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right space-y-1 font-mono">
                          {e.doneSets > 0 && (
                            <div className="text-sm font-black text-emerald-400">{e.doneSets} set ✓</div>
                          )}
                          {e.bestWeight > 0 && (
                            <div className="text-[10px] text-gray-400 font-bold flex items-center justify-end gap-1">
                              <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
                              <span>Maks: {e.bestWeight} kq</span>
                            </div>
                          )}
                          {e.cardio && (
                            <div className="text-[10px] text-amber-500 font-black tracking-wider uppercase">🏃 Kardio ✓</div>
                          )}
                        </div>
                        <div className="text-gray-500 hover:text-white transition-colors">
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-amber-500" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Exercise Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[#2a2d34]/50 space-y-3.5 animate-fade-in text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest font-mono">
                            Məşq Detalları
                          </span>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                            Tamamlandı ✓
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {loggedExercises.length === 0 ? (
                            <p className="text-xs text-gray-500 italic text-center py-2">
                              Hərəkət qeydi yoxdur (yalnız kardio).
                            </p>
                          ) : (
                            loggedExercises.map((ex, exIdx) => {
                              const hasExPRToday = allPRs[ex.name]?.date === e.date;
                              return (
                                <div
                                  key={exIdx}
                                  className="bg-[#141519]/40 border border-[#2a2d34]/40 rounded-2xl p-3.5 space-y-2.5"
                                >
                                  <div className="flex justify-between items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                                      {ex.name}
                                    </span>
                                    {hasExPRToday && (
                                      <span className="text-[8px] bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1 shrink-0">
                                        <Sparkles className="w-2.5 h-2.5" /> ŞƏXSİ REKORD (PR)
                                      </span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {ex.sets.map((set, sIdx) => {
                                      if (!set || !set.done) return null;

                                      const pr = allPRs[ex.name];
                                      const isPRSet =
                                        pr &&
                                        pr.date === e.date &&
                                        (ex.isTime
                                          ? parseInt(set.r) === pr.maxReps
                                          : parseFloat(set.w) === pr.maxWeight && parseInt(set.r) === pr.maxReps);

                                      return (
                                        <div
                                          key={sIdx}
                                          className={`p-2.5 rounded-xl text-center font-mono transition-all border ${
                                            isPRSet
                                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.08)] scale-105"
                                              : "bg-[#181a20]/60 border-[#2a2d34]/60 text-gray-300"
                                          }`}
                                        >
                                          <div className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
                                            Set {sIdx + 1}
                                          </div>
                                          <div className="text-xs">
                                            {ex.isTime ? (
                                              <span className="flex items-center justify-center gap-1 font-semibold">
                                                ⏱️ {set.r} s
                                              </span>
                                            ) : (
                                              <span className="flex flex-col items-center justify-center">
                                                <span className="font-bold">{set.w} kq</span>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                  {set.r} təkrar
                                                </span>
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Personal Records Tab View */}
      {subTab === "prs" && (
        <div className="space-y-4 animate-fade-in" id="prs-dashboard-view">
          {/* Motivation banner */}
          <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/5 border border-amber-500/20 rounded-3xl p-5 flex items-center gap-4 shadow-md text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-2xl font-bold shrink-0 animate-pulse">
              🏆
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest font-mono">
                DƏMİR İRADƏ REKORDA APARIR
              </span>
              <p className="text-xs text-gray-300 leading-relaxed font-semibold">
                Hər bir hərəkət üzrə əldə etdiyiniz all-time ən ağır çəki və ən çox təkrar qeydləriniz buradadır. Limitləri aşmağa davam edin! 💪🔥
              </p>
            </div>
          </div>

          {prList.length === 0 ? (
            <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl p-8 text-center space-y-3">
              <div className="inline-flex p-3.5 bg-[#131417] border border-[#2a2d34] rounded-full text-gray-400">
                <Trophy className="w-6 h-6 text-gray-500" />
              </div>
              <h4 className="font-bold text-base text-gray-200">Hələ Rekord Qeydə Alınmayıb</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                Məşqlərdə hərəkətləri yerinə yetirib setlərinizi tamamlandı olaraq işarələdikcə, qaldırdığınız ən yüksək çəkilər və təkrar sayları avtomatik hesablanaraq burada nümayiş olunacaq!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
              {prList.map((pr, pIdx) => {
                return (
                  <div
                    key={pIdx}
                    className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl p-4.5 space-y-3 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300 shadow-md"
                  >
                    {/* Background Trophy Glow */}
                    <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
                      <Trophy className="w-20 h-20 text-amber-500" />
                    </div>

                    <div className="space-y-1 relative">
                      <div className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest font-mono">
                        {pr.dayTitle || "Məşq"}
                      </div>
                      <h4 className="font-black text-white text-sm uppercase tracking-wide truncate">
                        {pr.exerciseName}
                      </h4>
                    </div>

                    <div className="flex items-end justify-between relative pt-1">
                      <div className="space-y-1">
                        <span className="text-[8px] text-gray-500 font-extrabold uppercase tracking-widest font-mono block">
                          Ən yaxşı nəticə (PR)
                        </span>
                        <div className="text-lg font-black italic text-amber-500 font-mono tracking-tight flex items-baseline gap-1">
                          {pr.isTime ? (
                            <span>⏱️ {pr.maxReps} saniyə</span>
                          ) : (
                            <>
                              <span>{pr.maxWeight} kq</span>
                              <span className="text-xs font-normal text-gray-400 italic">× {pr.maxReps} təkrar</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right space-y-0.5">
                        <span className="text-[8px] text-gray-500 font-extrabold uppercase tracking-widest font-mono block">
                          Tarix
                        </span>
                        <span className="text-[10px] text-gray-300 font-semibold font-mono">
                          {fmtDate(pr.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

