import React, { useState } from "react";
import { Target, Edit2, Check, X, Award, TrendingUp } from "lucide-react";
import { MeasurementEntry, NutritionData } from "../types";

interface WeightProgressRingProps {
  latestMeasure: MeasurementEntry | null;
  body: MeasurementEntry[];
  nutri: NutritionData;
  lang: "az" | "en" | "de" | "ru";
  onUpdateNutri: (n: NutritionData) => void;
}

export default function WeightProgressRing({
  latestMeasure,
  body,
  nutri,
  lang,
  onUpdateNutri,
}: WeightProgressRingProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTarget, setTempTarget] = useState("");

  const tDict = {
    az: {
      targetProgress: "Hədəf Çəki Tərəqqisi",
      setTarget: "Hədəf Çəkini Təyin Et",
      targetWeight: "Hədəf Çəki",
      save: "Yadda saxla",
      edit: "Düzəliş",
      current: "Cari",
      start: "Başlanğıc",
      enterTargetWeight: "Hədəf çəkiniz (kq)",
      motivationNoWeight: "Məşqçi: Zəhmət olmasa Ölçülər bölməsində çəkini qeyd edin.",
      motivationCut: "Arıqlama hədəfinizin {pct}%-nə çatmısınız! Hələ {diff} kq qalıb.",
      motivationBulk: "Çəki artımı hədəfinizin {pct}%-nə çatmısınız! Hələ {diff} kq qalıb.",
      motivationMaintain: "Cari çəkiniz hədəfə {pct}% uyğundur! Fərq: {diff} kq.",
      reached: "Təbriklər! Hədəf çəkinizə tam çatmısınız! 🎉",
    },
    en: {
      targetProgress: "Target Weight Progress",
      setTarget: "Set Target Weight",
      targetWeight: "Target Weight",
      save: "Save",
      edit: "Edit",
      current: "Current",
      start: "Start",
      enterTargetWeight: "Target weight (kg)",
      motivationNoWeight: "Coach: Please log your weight in the Dimensions section first.",
      motivationCut: "You've achieved {pct}% of your fat loss goal! {diff} kg remaining.",
      motivationBulk: "You've achieved {pct}% of your bulk goal! {diff} kg remaining.",
      motivationMaintain: "Your current weight is {pct}% close to your target! Diff: {diff} kg.",
      reached: "Congratulations! You have fully achieved your target weight! 🎉",
    },
    de: {
      targetProgress: "Zielgewichtsentwicklung",
      setTarget: "Zielgewicht festlegen",
      targetWeight: "Zielgewicht",
      save: "Speichern",
      edit: "Bearbeiten",
      current: "Aktuell",
      start: "Start",
      enterTargetWeight: "Zielgewicht (kg)",
      motivationNoWeight: "Coach: Bitte tragen Sie zuerst Ihr Gewicht im Bereich Maße ein.",
      motivationCut: "Sie haben {pct}% Ihres Gewichtsverlustziels erreicht! Noch {diff} kg übrig.",
      motivationBulk: "Sie haben {pct}% Ihres Muskelaufbauziels erreicht! Noch {diff} kg übrig.",
      motivationMaintain: "Ihr aktuelles Gewicht ist zu {pct}% an Ihrem Ziel! Unterschied: {diff} kg.",
      reached: "Herzlichen Glückwunsch! Sie haben Ihr Zielgewicht vollständig erreicht! 🎉",
    },
    ru: {
      targetProgress: "Прогресс Целевого Веса",
      setTarget: "Указать Целевой Вес",
      targetWeight: "Целевой Вес",
      save: "ОК",
      edit: "Изменить",
      current: "Текущий",
      start: "Старт",
      enterTargetWeight: "Целевой вес (кг)",
      motivationNoWeight: "Тренер: Пожалуйста, введите ваш вес в разделе замеры.",
      motivationCut: "Вы выполнили {pct}% цели по сушке! Осталось {diff} кг.",
      motivationBulk: "Вы выполнили {pct}% цели по набору веса! Осталось {diff} кг.",
      motivationMaintain: "Ваш вес соответствует целевому на {pct}%! Разница: {diff} кг.",
      reached: "Поздравляем! Вы полностью достигли своего целевого веса! 🎉",
    },
  };

  const t = tDict[lang] || tDict["en"];

  const currentWeight = latestMeasure?.weight || 0;
  const targetWeight = nutri.targetWeight || null;

  // Find start weight (oldest entry with weight)
  const weightEntries = [...body]
    .filter((b) => b.weight !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
  const startWeight = weightEntries.length > 0 ? (weightEntries[0].weight || currentWeight) : currentWeight;

  const handleStartEdit = () => {
    setTempTarget(targetWeight ? targetWeight.toString() : currentWeight ? currentWeight.toString() : "75");
    setIsEditing(true);
  };

  const handleSave = () => {
    const val = parseFloat(tempTarget);
    if (!isNaN(val) && val > 0) {
      onUpdateNutri({
        ...nutri,
        targetWeight: val,
      });
      setIsEditing(false);
    }
  };

  // Compute progress details
  const getProgressDetails = () => {
    if (!currentWeight) {
      return { percentage: 0, text: t.motivationNoWeight, isComplete: false };
    }
    if (!targetWeight) {
      return { percentage: 0, text: "", isComplete: false, noTarget: true };
    }

    if (nutri.goal === "cut") {
      if (currentWeight <= targetWeight) {
        return { percentage: 100, text: t.reached, isComplete: true };
      }
      if (startWeight <= targetWeight || currentWeight >= startWeight) {
        const diff = (currentWeight - targetWeight).toFixed(1);
        return {
          percentage: 0,
          text: t.motivationCut.replace("{pct}", "0").replace("{diff}", diff),
          isComplete: false,
        };
      }
      const totalToLose = startWeight - targetWeight;
      const lostSoFar = startWeight - currentWeight;
      const percentage = Math.max(0, Math.min(100, Math.round((lostSoFar / totalToLose) * 100)));
      const diff = Math.max(0, currentWeight - targetWeight).toFixed(1);
      return {
        percentage,
        text: t.motivationCut.replace("{pct}", percentage.toString()).replace("{diff}", diff),
        isComplete: percentage === 100,
      };
    } else if (nutri.goal === "bulk") {
      if (currentWeight >= targetWeight) {
        return { percentage: 100, text: t.reached, isComplete: true };
      }
      if (startWeight >= targetWeight || currentWeight <= startWeight) {
        const diff = (targetWeight - currentWeight).toFixed(1);
        return {
          percentage: 0,
          text: t.motivationBulk.replace("{pct}", "0").replace("{diff}", diff),
          isComplete: false,
        };
      }
      const totalToGain = targetWeight - startWeight;
      const gainedSoFar = currentWeight - startWeight;
      const percentage = Math.max(0, Math.min(100, Math.round((gainedSoFar / totalToGain) * 100)));
      const diff = Math.max(0, targetWeight - currentWeight).toFixed(1);
      return {
        percentage,
        text: t.motivationBulk.replace("{pct}", percentage.toString()).replace("{diff}", diff),
        isComplete: percentage === 100,
      };
    } else {
      // Maintain
      const diff = Math.abs(currentWeight - targetWeight);
      const scale = Math.max(3, targetWeight * 0.05); // 5% weight deviation is considered 0% progress
      const percentage = Math.max(0, Math.min(100, Math.round((1 - diff / scale) * 100)));
      return {
        percentage,
        text: t.motivationMaintain.replace("{pct}", percentage.toString()).replace("{diff}", diff.toFixed(1)),
        isComplete: percentage >= 95,
      };
    }
  };

  const details = getProgressDetails();

  // Circular progress math
  const radius = 28;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2; // radius is 28, stroke is 6
  // Let's just use constant circle values
  const r = 24;
  const circumference = 2 * Math.PI * r; // ~150.8
  const strokeDashoffset = circumference - (details.percentage / 100) * circumference;

  return (
    <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 shadow-md transition-all">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-3 border-b border-[#2a2d34]/40 pb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-300">
            {t.targetProgress}
          </span>
        </div>
        {!isEditing && targetWeight && (
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-all bg-[#121319]/40 border border-[#2a2d34]/60 px-2 py-0.5 rounded-md cursor-pointer"
          >
            <Edit2 className="w-2.5 h-2.5" />
            <span>{t.edit}</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1">
            <label className="block text-[9px] text-gray-400 uppercase tracking-wider mb-1">
              {t.enterTargetWeight}
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={tempTarget}
              onChange={(e) => setTempTarget(e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-2.5 text-white focus:outline-none text-sm focus:border-amber-500 font-bold"
              placeholder="e.g. 75"
              autoFocus
            />
          </div>
          <div className="flex items-end gap-1.5 h-full pt-4">
            <button
              onClick={handleSave}
              className="p-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center"
              title={t.save}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2.5 bg-[#121319]/60 hover:bg-red-500/10 border border-[#2a2d34]/60 text-gray-400 hover:text-red-400 font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : !targetWeight ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2 text-center sm:text-left">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 block">
              {lang === "az"
                ? "Hədəfinizə çatmaq üçün hədəf çəkini təyin edin və tərəqqini canlı izləyin!"
                : lang === "ru"
                ? "Укажите целевой вес, чтобы отслеживать прогресс в реальном времени!"
                : "Set a target weight to track your real-time progress on your fitness journey!"}
            </span>
          </div>
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shrink-0"
          >
            <Target className="w-4 h-4" />
            <span>{t.setTarget}</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* Circular SVG Progress Ring */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 56 56" className="w-full h-full transform -rotate-90">
              {/* Back Circle */}
              <circle
                cx="28"
                cy="28"
                r={r}
                fill="transparent"
                stroke="#2a2d34"
                strokeWidth={stroke}
                opacity="0.4"
              />
              {/* Front Circle */}
              <circle
                cx="28"
                cy="28"
                r={r}
                fill="transparent"
                stroke={details.percentage >= 100 ? "#10b981" : "#f59e0b"}
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            {/* Center percentage label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-white leading-none">
                {details.percentage}
              </span>
              <span className="text-[8px] font-bold text-gray-400 leading-none mt-0.5">%</span>
            </div>
          </div>

          {/* Progress Details text and stats */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Motivation statement */}
            {details.text && (
              <p className="text-xs font-semibold text-gray-100 leading-relaxed">
                {details.text}
              </p>
            )}

            {/* Quick stats mini row */}
            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono font-bold pt-1 border-t border-[#2a2d34]/30">
              <div>
                <span>{t.start}: </span>
                <span className="text-gray-200">{startWeight} {lang === "en" ? "kg" : "kq"}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#2a2d34]" />
              <div>
                <span>{t.current}: </span>
                <span className="text-amber-500">{currentWeight || "—"} {lang === "en" ? "kg" : "kq"}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#2a2d34]" />
              <div>
                <span>{t.targetWeight}: </span>
                <span className="text-emerald-400">{targetWeight} {lang === "en" ? "kg" : "kq"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
