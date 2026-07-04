import React from "react";
import { WorkoutLogs } from "../types";
import { Calendar, Award, Flame, Dumbbell } from "lucide-react";

interface HistoryProps {
  logs: WorkoutLogs;
}

export default function History({ logs }: HistoryProps) {
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

      // Find max weight lifted
      const weights = Object.entries(dayLog)
        .filter(([id]) => !id.startsWith("__"))
        .flatMap(([, setsArr]) => (Array.isArray(setsArr) ? setsArr.map((s) => parseFloat(s.w) || 0) : []));

      const bestWeight = weights.length ? Math.max(...weights) : 0;

      return {
        date,
        title,
        doneSets,
        cardio: !!dayLog.__cardio,
        bestWeight,
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
    <div className="space-y-4">
      {entries.length === 0 ? (
        <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-8 text-center space-y-3">
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
          {entries.map((e, idx) => (
            <div
              key={idx}
              className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="font-black italic tracking-wide text-white uppercase text-base">{e.title}</div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{fmtDate(e.date)}</span>
                </div>
              </div>

              <div className="text-right space-y-1 font-mono">
                {e.doneSets > 0 && (
                  <div className="text-sm font-black text-emerald-400">
                    {e.doneSets} set ✓
                  </div>
                )}
                {e.bestWeight > 0 && (
                  <div className="text-[10px] text-gray-400 font-bold flex items-center justify-end gap-1">
                    <Dumbbell className="w-3 h-3 text-amber-500" />
                    <span>Maks: {e.bestWeight} kq</span>
                  </div>
                )}
                {e.cardio && (
                  <div className="text-[10px] text-amber-500 font-black tracking-wider uppercase">
                    🏃 Kardio ✓
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
