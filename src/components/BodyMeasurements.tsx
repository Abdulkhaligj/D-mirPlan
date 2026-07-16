import React, { useState } from "react";
import { MeasurementEntry } from "../types";
import { Calendar, Trash2, ShieldAlert, Sparkles, Plus } from "lucide-react";

interface BodyMeasurementsProps {
  body: MeasurementEntry[];
  onUpdateBody: (b: MeasurementEntry[]) => void;
  lang?: string;
}

export default function BodyMeasurements({ body, onUpdateBody, lang = "az" }: BodyMeasurementsProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [arm, setArm] = useState("");

  const latestMeasure = body.length
    ? [...body].sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;

  // Compute BMI
  const bmi =
    latestMeasure?.weight && latestMeasure?.height
      ? Number((latestMeasure.weight / Math.pow(latestMeasure.height / 100, 2)).toFixed(1))
      : null;

  const tDict = {
    az: {
      alertEmpty: "Zəhmət olmasa ən azı bir ölçü daxil edin!",
      alertDelete: "Bu ölçü tarixçəsini silmək istədiyinizə əminsiniz?",
      chartTitle: "Çəki Tərəqqi Dinamikası",
      currentWeight: "Cari Çəki",
      height: "Boy",
      bmi: "Bədən Kütlə İndeksi (BMI)",
      bmiUnder: "Az çəki",
      bmiNormal: "Normal",
      bmiOver: "Artıq çəki",
      bmiObese: "Piylənmə",
      newEntryTitle: "Yeni Ölçülər Daxil Edin",
      date: "Tarix",
      weightLabel: "Çəki (kq)",
      heightLabel: "Boy (sm)",
      chestLabel: "Sinə ölçüsü (sm)",
      waistLabel: "Bel ölçüsü (sm)",
      armLabel: "Qol (biceps) ölçüsü (sm)",
      saveBtn: "Məlumatları yadda saxla",
      history: "Tarixçə",
      chestShort: "sinə",
      waistShort: "bel",
      armShort: "qol",
    },
    en: {
      alertEmpty: "Please enter at least one measurement parameter!",
      alertDelete: "Are you sure you want to delete this measurement record?",
      chartTitle: "Weight Progress Dynamics",
      currentWeight: "Current Weight",
      height: "Height",
      bmi: "Body Mass Index (BMI)",
      bmiUnder: "Underweight",
      bmiNormal: "Normal",
      bmiOver: "Overweight",
      bmiObese: "Obese",
      newEntryTitle: "Log New Measurements",
      date: "Date",
      weightLabel: "Weight (kg)",
      heightLabel: "Height (cm)",
      chestLabel: "Chest size (cm)",
      waistLabel: "Waist size (cm)",
      armLabel: "Arm (biceps) size (cm)",
      saveBtn: "Save Measurements",
      history: "History",
      chestShort: "chest",
      waistShort: "waist",
      armShort: "arm",
    },
    ru: {
      alertEmpty: "Пожалуйста, введите хотя бы один параметр измерения!",
      alertDelete: "Вы уверены, что хотите удалить эту запись замеров?",
      chartTitle: "Динамика изменения веса",
      currentWeight: "Текущий Вес",
      height: "Рост",
      bmi: "Индекс массы тела (ИМТ)",
      bmiUnder: "Дефицит веса",
      bmiNormal: "Норма",
      bmiOver: "Избыточный вес",
      bmiObese: "Ожирение",
      newEntryTitle: "Ввести новые замеры",
      date: "Дата",
      weightLabel: "Вес (кг)",
      heightLabel: "Рост (см)",
      chestLabel: "Обхват груди (см)",
      waistLabel: "Обхват талии (см)",
      armLabel: "Обхват бицепса (см)",
      saveBtn: "Сохранить замеры",
      history: "История замеров",
      chestShort: "грудь",
      waistShort: "талия",
      armShort: "бицепс",
    },
    de: {
      alertEmpty: "Bitte geben Sie mindestens einen Messparameter ein!",
      alertDelete: "Sind Sie sicher, dass Sie diesen Messdatensatz löschen möchten?",
      chartTitle: "Gewichtsverlaufsdynamik",
      currentWeight: "Aktuelles Gewicht",
      height: "Größe",
      bmi: "Body-Mass-Index (BMI)",
      bmiUnder: "Untergewicht",
      bmiNormal: "Normalgewicht",
      bmiOver: "Übergewicht",
      bmiObese: "Adipositas",
      newEntryTitle: "Neue Maße eintragen",
      date: "Datum",
      weightLabel: "Gewicht (kg)",
      heightLabel: "Größe (cm)",
      chestLabel: "Brustumfang (cm)",
      waistLabel: "Taillenumfang (cm)",
      armLabel: "Armumfang (Bizeps) (cm)",
      saveBtn: "Maße speichern",
      history: "Verlauf",
      chestShort: "Brust",
      waistShort: "Taille",
      armShort: "Arm",
    }
  };

  const t = tDict[lang as "az" | "en" | "de" | "ru" || "az"] || tDict["en"];

  const getBmiCategory = (v: number) => {
    if (v < 18.5) return { label: t.bmiUnder, color: "text-blue-400", bg: "bg-blue-400/10" };
    if (v < 25.0) return { label: t.bmiNormal, color: "text-emerald-400", bg: "bg-emerald-400/10" };
    if (v < 30.0) return { label: t.bmiOver, color: "text-amber-500", bg: "bg-amber-500/10" };
    return { label: t.bmiObese, color: "text-red-400", bg: "bg-red-400/10" };
  };

  const bmiCat = bmi ? getBmiCategory(bmi) : null;

  const handleSave = () => {
    if (!weight && !height && !chest && !waist && !arm) {
      alert(t.alertEmpty);
      return;
    }

    const newEntry: MeasurementEntry = {
      date,
      weight: weight ? parseFloat(weight) : latestMeasure?.weight || null,
      height: height ? parseFloat(height) : latestMeasure?.height || null,
      chest: chest ? parseFloat(chest) : null,
      waist: waist ? parseFloat(waist) : null,
      arm: arm ? parseFloat(arm) : null,
    };

    // Replace entry if date matches, else insert
    const filtered = body.filter((b) => b.date !== date);
    const updated = [...filtered, newEntry].sort((a, b) => a.date.localeCompare(b.date));
    onUpdateBody(updated);

    // Reset fields except height
    setWeight("");
    setChest("");
    setWaist("");
    setArm("");
  };

  const handleDelete = (entryDate: string) => {
    if (!confirm(t.alertDelete)) return;
    onUpdateBody(body.filter((b) => b.date !== entryDate));
  };

  const fmtDate = (iso: string) => {
    return new Date(iso + "T00:00:00").toLocaleDateString(
      lang === "az" ? "az-AZ" : lang === "ru" ? "ru-RU" : "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // SVG Chart generator logic
  const renderWeightChart = () => {
    const weightEntries = body.filter((b) => b.weight !== null).sort((a, b) => a.date.localeCompare(b.date));
    if (weightEntries.length < 2) return null;

    const width = 500;
    const height = 150;
    const padding = 30;

    const weights = weightEntries.map((e) => e.weight as number);
    const minW = Math.min(...weights) - 1;
    const maxW = Math.max(...weights) + 1;
    const range = maxW - minW || 1;

    const getX = (index: number) => {
      return padding + (index / (weightEntries.length - 1)) * (width - 2 * padding);
    };

    const getY = (w: number) => {
      return height - padding - ((w - minW) / range) * (height - 2 * padding);
    };

    const points = weightEntries.map((e, idx) => `${getX(idx)},${getY(e.weight as number)}`).join(" ");

    return (
      <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 space-y-3">
        <h3 className="font-bold text-sm text-gray-200">{t.chartTitle}</h3>
        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {/* Grid Line */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#2a2d34" strokeWidth="1" />
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#2a2d34" strokeWidth="1" strokeDasharray="3" />

            {/* Line Graph */}
            <polyline fill="none" stroke="#f5a833" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />

            {/* Data Points */}
            {weightEntries.map((e, idx) => {
              const x = getX(idx);
              const y = getY(e.weight as number);
              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r="5" fill="#f5a833" stroke="#1b1d22" strokeWidth="1.5" />
                  <text x={x} y={y - 12} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {e.weight}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase">
          <span>{fmtDate(weightEntries[0].date)}</span>
          <span>{fmtDate(weightEntries[weightEntries.length - 1].date)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Target measurements header boxes */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.currentWeight}</span>
          <div className="text-2xl font-black text-amber-500 mt-1">
            {latestMeasure?.weight ? `${latestMeasure.weight} ${lang === "en" ? "kg" : "kq"}` : "—"}
          </div>
        </div>

        <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.height}</span>
          <div className="text-2xl font-black text-white mt-1">
            {latestMeasure?.height ? `${latestMeasure.height} ${lang === "en" ? "cm" : "sm"}` : "—"}
          </div>
        </div>

        <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.bmi}</span>
          <div className={`text-2xl font-black mt-1 ${bmiCat ? bmiCat.color : "text-gray-400"}`}>
            {bmi || "—"}
          </div>
          {bmiCat && <span className="text-[9px] font-bold block mt-0.5 uppercase tracking-widest">{bmiCat.label}</span>}
        </div>
      </div>

      {/* SVG weight chart */}
      {renderWeightChart()}

      {/* Enter New Measurement form */}
      <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Plus className="w-5 h-5 text-amber-500" />
          <span>{t.newEntryTitle}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.date}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.weightLabel}</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 75.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.heightLabel}</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 178"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.chestLabel}</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 104"
              value={chest}
              onChange={(e) => setChest(e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.waistLabel}</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 82"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.armLabel}</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 38.5"
              value={arm}
              onChange={(e) => setArm(e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl cursor-pointer transition-all text-xs uppercase tracking-wider shadow-md"
        >
          {t.saveBtn}
        </button>
      </div>

      {/* Historic Logs list */}
      {body.length > 0 && (
        <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-sm text-gray-200">{t.history}</h3>
          <div className="divide-y divide-[#2a2d34]/60 space-y-3">
            {[...body]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((b) => (
                <div key={b.date} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-amber-500 font-mono">{fmtDate(b.date)}</span>
                    <div className="text-xs text-gray-300 leading-relaxed flex flex-wrap gap-x-2 gap-y-0.5">
                      {b.weight && <span>⚖ {b.weight} {lang === "en" ? "kg" : "kq"}</span>}
                      {b.chest && <span>• {t.chestShort} {b.chest} {lang === "en" ? "cm" : "sm"}</span>}
                      {b.waist && <span>• {t.waistShort} {b.waist} {lang === "en" ? "cm" : "sm"}</span>}
                      {b.arm && <span>• {t.armShort} {b.arm} {lang === "en" ? "cm" : "sm"}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(b.date)}
                    className="p-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-gray-500 hover:text-red-400 rounded-lg cursor-pointer transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
