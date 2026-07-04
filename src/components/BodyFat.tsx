import React, { useState } from "react";
import { BodyFatNavy, BodyFatAI, MeasurementEntry } from "../types";
import { Camera, RefreshCw, Sparkles, HelpCircle, ShieldAlert, Check, FileCode } from "lucide-react";

interface BodyFatProps {
  bf: BodyFatNavy | null;
  ai: BodyFatAI | null;
  latestMeasure: MeasurementEntry | null;
  isPremium: boolean;
  gender: "m" | "f";
  onUpdateBf: (b: BodyFatNavy) => void;
  onUpdateAi: (a: BodyFatAI) => void;
  onTriggerPayment: () => void;
  userContext: string;
}

export default function BodyFat({
  bf,
  ai,
  latestMeasure,
  isPremium,
  gender,
  onUpdateBf,
  onUpdateAi,
  onTriggerPayment,
  userContext,
}: BodyFatProps) {
  // Navy method state
  const [neck, setNeck] = useState(bf?.neck ? String(bf.neck) : "");
  const [waist, setWaist] = useState(bf?.waist ? String(bf.waist) : "");
  const [hip, setHip] = useState(bf?.hip ? String(bf.hip) : "");

  // Photo analyzer state
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const todayISO = new Date().toISOString().slice(0, 10);
  const currentHeight = latestMeasure?.height;

  // 1. Calculate Navy body fat
  const handleCalcNavy = () => {
    if (!currentHeight) {
      alert("Zəhmət olmasa, əvvəlcə Ölçülər bölməsində boyunuzu qeyd edin!");
      return;
    }
    const n = Number(neck);
    const w = Number(waist);
    const h = gender === "f" ? Number(hip) : 0;

    if (!n || !w || (gender === "f" && !h)) {
      alert("Zəhmət olmasa bütün ölçüləri daxil edin!");
      return;
    }

    let pct = 0;
    if (gender === "m") {
      if (w - n <= 0) {
        alert("Bel ölçüsü boyun ölçüsündən böyük olmalıdır!");
        return;
      }
      // US Navy Formula for Men
      pct = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(currentHeight)) - 450;
    } else {
      if (w + h - n <= 0) {
        alert("Ölçüləri düzgün yazın!");
        return;
      }
      // US Navy Formula for Women
      pct = 495 / (1.29579 - 0.35004 * Math.log10(w + h - n) + 0.22100 * Math.log10(currentHeight)) - 450;
    }

    pct = Math.round(pct * 10) / 10;

    // Categorization
    let cat = "";
    let rec = "";
    const isM = gender === "m";

    if (pct < (isM ? 6 : 14)) {
      cat = "Həddindən artıq az";
      rec = "Kütlə yığma (Bulk) tövsiyə olunur";
    } else if (pct < (isM ? 14 : 21)) {
      cat = "Atletik / Fit";
      rec = "Formanı saxlama və ya yüngül kütlə yığma";
    } else if (pct < (isM ? 18 : 25)) {
      cat = "Sağlam / Normal";
      rec = "Məqsədinizə görə saxlama və ya yüngül arıqlama";
    } else if (pct < (isM ? 25 : 32)) {
      cat = "Orta dərəcə";
      rec = "Yüngül arıqlama (Cut) tövsiyə olunur";
    } else {
      cat = "Artıq çəkili / Piylənmə";
      rec = "Kalori defisiti ilə arıqlama (Cut) tövsiyə olunur";
    }

    onUpdateBf({
      pct,
      cat,
      rec,
      neck: n,
      waist: w,
      hip: gender === "f" ? h : null,
      date: todayISO,
    });
  };

  // 2. Drag & Drop photo handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setAiError("Zəhmət olmasa yalnız şəkil faylı seçin!");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
      setPhotoType(file.type);
      setAiError(null);
    };
    reader.readAsDataURL(file);
  };

  // 3. Multimodal photo analyzer call
  const handleAnalyzePhoto = async () => {
    if (!photo) return;
    if (!isPremium) {
      onTriggerPayment();
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch("/api/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoBase64: photo,
          photoType,
          userContext,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      onUpdateAi({
        ...data,
        date: todayISO,
      });
    } catch (err: any) {
      setAiError(err.message || "Şəkil təhlil edilərkən xəta baş verdi. İnternet əlaqənizi yoxlayın.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. US Navy Calculator Card */}
      <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          <span>US Navy Metodu ilə Yağ Faizi Ölçümü</span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          U.S. Navy metodu boyun, bel və omba ölçülərinə əsasən bədəndəki təxmini yağ faizini hesablamaq üçün bütün dünyada qəbul edilmiş ən populyar və etibarlı elmi kalkulyatordur.
        </p>

        {!currentHeight ? (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-300 leading-relaxed">
              Bu hesablama üçün sizin <b className="text-amber-500 font-bold">boyunuz</b> mütləq lazımdır. Ölçülər bölməsində boy ölçünüzü daxil edin.
            </div>
          </div>
        ) : (
          <div className="text-xs text-emerald-400 font-bold">
            ✓ Cari boy: {currentHeight} sm
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Boyun çevrəsi (sm)</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="Məs. 38"
              value={neck}
              onChange={(e) => setNeck(e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Bel çevrəsi (sm)</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="Məs. 85"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm focus:border-amber-500"
            />
          </div>

          {gender === "f" && (
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Omba çevrəsi (sm)</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Məs. 96"
                value={hip}
                onChange={(e) => setHip(e.target.value)}
                className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm focus:border-amber-500"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleCalcNavy}
          disabled={!currentHeight}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-gray-950 font-black rounded-xl cursor-pointer transition-all text-xs uppercase tracking-wider shadow-md"
        >
          Yağ faizini hesabla
        </button>

        {bf && (
          <div className="pt-3 border-t border-[#2a2d34]/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#131417] p-3 rounded-xl border border-[#2a2d34] text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase">Yağ Faizi</div>
              <div className="text-xl font-black text-amber-500 mt-1">{bf.pct}%</div>
            </div>
            <div className="bg-[#131417] p-3 rounded-xl border border-[#2a2d34] text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase">Kateqoriya</div>
              <div className="text-sm font-black text-white mt-1.5">{bf.cat}</div>
            </div>
            <div className="bg-[#131417] p-3 rounded-xl border border-[#2a2d34] text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase">Aİ Tövsiyəsi</div>
              <div className="text-[11px] font-bold text-emerald-400 mt-1.5">{bf.rec}</div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Multimodal AI Photo Analyzer */}
      <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Camera className="w-5 h-5 text-amber-500" />
            <span>📷 Aİ ilə Fizika və Yağ Analizi</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 py-0.5 px-2 bg-amber-500/10 rounded-full">
            Premium
          </span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          Mükəmməl bir bədən yağ qiymətləndirilməsi üçün fizik şəklini yükləyin. Multimodal Gemini süni zəka modelimiz şəkildəki əzələ formasını və yağ paylanmasını analiz edərək sizə fərdi fitness hədəfi çıxaracaq.
        </p>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 min-h-[160px] text-center transition-all ${
            dragActive ? "border-amber-500 bg-amber-500/5" : "border-[#2a2d34] hover:border-gray-500"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />

          {photo ? (
            <div className="relative group max-h-[300px] overflow-hidden rounded-xl">
              <img src={photo} alt="Physique" className="max-h-[250px] object-cover rounded-xl" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <span className="text-xs text-white font-bold bg-[#1b1d22]/80 px-3 py-1.5 rounded-xl border border-[#2a2d34]">
                  Dəyişdirin
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pointer-events-none">
              <div className="inline-flex p-3 bg-[#131417] border border-[#2a2d34] rounded-full text-gray-400">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-200">Bədən şəklini bura sürükləyin və ya klikləyin</p>
                <p className="text-[10px] text-gray-500 mt-1">Ayna qarşısında və ya aydın işıqda çəkilmiş şəkillər</p>
              </div>
            </div>
          )}
        </div>

        {aiError && (
          <div className="text-red-400 text-xs p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
            ⚠ {aiError}
          </div>
        )}

        <button
          onClick={handleAnalyzePhoto}
          disabled={!photo || aiLoading}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-[#131417] disabled:border disabled:border-[#2a2d34] disabled:text-gray-600 disabled:opacity-40 font-black rounded-xl cursor-pointer transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
        >
          {aiLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-gray-950" /> Şəkliniz Aİ tərəfindən analiz edilir...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Aİ Şəkil Analizini Başlat
            </>
          )}
        </button>

        {ai && (
          <div className="pt-4 border-t border-[#2a2d34]/60 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#131417] p-3 rounded-xl border border-[#2a2d34] text-center">
                <div className="text-[9px] text-gray-400 font-bold uppercase">Aİ Yağ %</div>
                <div className="text-lg font-black text-amber-500 mt-1 font-mono">
                  {ai.bodyFatMin}–{ai.bodyFatMax}%
                </div>
              </div>
              <div className="bg-[#131417] p-3 rounded-xl border border-[#2a2d34] text-center">
                <div className="text-[9px] text-gray-400 font-bold uppercase">Bədən Tipi</div>
                <div className="text-xs font-bold text-white mt-2 truncate">{ai.category}</div>
              </div>
              <div className="bg-[#131417] p-3 rounded-xl border border-[#2a2d34] text-center">
                <div className="text-[9px] text-gray-400 font-bold uppercase">Tövsiyə</div>
                <div className="text-xs font-bold text-emerald-400 mt-2">
                  {ai.goal === "cut" ? "Arıqlama" : ai.goal === "bulk" ? "Kütlə" : "Saxlama"}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-black text-amber-500 uppercase tracking-wider">Aİ-nin Görüşü və Analiz</span>
                <p className="text-sm text-gray-200 mt-1 leading-relaxed">{ai.summary}</p>
              </div>

              <div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Məşq Strategiyası</span>
                <p className="text-sm text-gray-200 mt-1 leading-relaxed">{ai.trainingAdvice}</p>
              </div>

              <div>
                <span className="text-xs font-black text-blue-400 uppercase tracking-wider">Qidalanma Strategiyası</span>
                <p className="text-sm text-gray-200 mt-1 leading-relaxed">{ai.nutritionAdvice}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
