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
  lang?: string;
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
  lang = "az",
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

  const tDict = {
    az: {
      alertHeight: "Zəhmət olmasa, əvvəlcə Ölçülər bölməsində boyunuzu qeyd edin!",
      alertEmpty: "Zəhmət olmasa bütün ölçüləri daxil edin!",
      alertDiff: "Bel ölçüsü boyun ölçüsündən böyük olmalıdır!",
      alertValid: "Ölçüləri düzgün yazın!",
      navyTitle: "US Navy Metodu ilə Yağ Faizi Ölçümü",
      navyDesc: "U.S. Navy metodu boyun, bel və omba ölçülərinə əsasən bədəndəki təxmini yağ faizini hesablamaq üçün bütün dünyada qəbul edilmiş ən populyar və etibarlı elmi kalkulyatordur.",
      heightNotice: "Bu hesablama üçün sizin boyunuz mütləq lazımdır. Ölçülər bölməsində boy ölçünüzü daxil edin.",
      currentHeightText: "Cari boy:",
      neckLabel: "Boyun çevrəsi (sm)",
      waistLabel: "Bel çevrəsi (sm)",
      hipLabel: "Omba çevrəsi (sm)",
      calcBtn: "Yağ faizini hesabla",
      navyResultFat: "Yağ Faizi",
      navyResultCat: "Kateqoriya",
      navyResultAi: "Aİ Tövsiyəsi",
      
      aiTitle: "Aİ ilə Fizika və Yağ Analizi",
      aiStatusActive: "Aktiv",
      aiDesc: "Mükəmməl bir bədən yağ qiymətləndirilməsi üçün fizik şəklini yükləyin. Multimodal Gemini süni zəka modelimiz şəkildəki əzələ formasını və yağ paylanmasını analiz edərək sizə fərdi fitness hədəfi çıxaracaq.",
      dragLabel: "Bədən şəklini bura sürükləyin və ya klikləyin",
      dragSub: "Ayna qarşısında və ya aydın işıqda çəkilmiş şəkillər",
      dragChange: "Dəyişdirin",
      alertImageOnly: "Zəhmət olmasa yalnız şəkil faylı seçin!",
      analyzeBtnActive: "Aİ Şəkil Analizini Başlat",
      analyzeBtnLoading: "Şəkliniz Aİ tərəfindən analiz edilir...",
      aiResultFat: "Aİ Yağ %",
      aiResultType: "Bədən Tipi",
      aiResultGoal: "Tövsiyə",
      aiResultHeader: "Aİ-nin Görüşü və Analiz",
      aiTrainingHeader: "Məşq Strategiyası",
      aiNutritionHeader: "Qidalanma Strategiyası",
      
      goalCut: "Arıqlama",
      goalBulk: "Kütlə",
      goalMaintain: "Saxlama",
      
      catTooLow: "Həddindən artıq az",
      catTooLowRec: "Kütlə yığma (Bulk) tövsiyə olunur",
      catAthletic: "Atletik / Fit",
      catAthleticRec: "Formanı saxlama və ya yüngül kütlə yığma",
      catHealthy: "Sağlam / Normal",
      catHealthyRec: "Məqsədinizə görə saxlama və ya yüngül arıqlama",
      catAverage: "Orta dərəcə",
      catAverageRec: "Yüngül arıqlama (Cut) tövsiyə olunur",
      catObese: "Artıq çəkili / Piylənmə",
      catObeseRec: "Kalori defisiti ilə arıqlama (Cut) tövsiyə olunur",
    },
    en: {
      alertHeight: "Please record your height in the Dimensions section first!",
      alertEmpty: "Please enter all body circumference parameters!",
      alertDiff: "Waist size must be larger than neck size!",
      alertValid: "Please enter valid measurements!",
      navyTitle: "US Navy Body Fat Calculation",
      navyDesc: "The U.S. Navy formula estimates body fat percentage using neck, waist, and hip circumferences. It is a globally accepted, scientific baseline method.",
      heightNotice: "Your height is required for this calculation. Please enter it in the Dimensions tab first.",
      currentHeightText: "Current height:",
      neckLabel: "Neck Circumference (cm)",
      waistLabel: "Waist Circumference (cm)",
      hipLabel: "Hip Circumference (cm)",
      calcBtn: "Calculate Body Fat",
      navyResultFat: "Body Fat %",
      navyResultCat: "Category",
      navyResultAi: "AI Recommendation",
      
      aiTitle: "AI Physique & Fat Analysis",
      aiStatusActive: "Active",
      aiDesc: "Upload your physique photo for an AI-powered appraisal. Our multimodal Gemini model will evaluate muscle definition, posture, and relative fat percentage to construct optimized targets.",
      dragLabel: "Drag & drop your physique photo or click to browse",
      dragSub: "Clear mirror or standing posture shots under good lighting",
      dragChange: "Change Image",
      alertImageOnly: "Please upload image files only!",
      analyzeBtnActive: "Begin AI Photo Analysis",
      analyzeBtnLoading: "Your physique is being analyzed by AI...",
      aiResultFat: "AI Fat %",
      aiResultType: "Physique Type",
      aiResultGoal: "Goal Target",
      aiResultHeader: "AI Overview & Analysis",
      aiTrainingHeader: "Training Strategy",
      aiNutritionHeader: "Nutrition Strategy",
      
      goalCut: "Fat Loss (Cut)",
      goalBulk: "Hypertrophy (Bulk)",
      goalMaintain: "Recomp (Maintain)",
      
      catTooLow: "Extremely Low Fat",
      catTooLowRec: "Controlled caloric surplus (Bulk) recommended",
      catAthletic: "Athletic / Lean",
      catAthleticRec: "Maintenance or lean bulking strategies",
      catHealthy: "Healthy / Optimal",
      catHealthyRec: "Recomposition or mild cut depending on goals",
      catAverage: "Moderate / Average",
      catAverageRec: "Mild deficit (Cut) recommended",
      catObese: "High Fat / Obese",
      catObeseRec: "Structured calorie deficit (Cut) strongly advised",
    },
    de: {
      alertHeight: "Bitte tragen Sie zuerst Ihre Körpergröße im Bereich Maße ein!",
      alertEmpty: "Bitte geben Sie alle Körperumfangsparameter ein!",
      alertDiff: "Der Taillenumfang muss größer als der Halsumfang sein!",
      alertValid: "Bitte geben Sie gültige Maße ein!",
      navyTitle: "US-Navy Körperfettberechnung",
      navyDesc: "Die Formel der U.S. Navy schätzt den Körperfettanteil anhand von Hals-, Taillen- und Hüftumfang. Es ist eine weltweit anerkannte, wissenschaftliche Methode.",
      heightNotice: "Ihre Körpergröße ist für diese Berechnung erforderlich. Bitte geben Sie diese zuerst im Reiter Maße ein.",
      currentHeightText: "Aktuelle Größe:",
      neckLabel: "Halsumfang (cm)",
      waistLabel: "Taillenumfang (cm)",
      hipLabel: "Hüftumfang (cm)",
      calcBtn: "Körperfett berechnen",
      navyResultFat: "Körperfett %",
      navyResultCat: "Kategorie",
      navyResultAi: "KI-Empfehlung",
      
      aiTitle: "KI-Physik & Fettanalyse",
      aiStatusActive: "Aktiv",
      aiDesc: "Laden Sie ein Foto Ihres Körpers für eine KI-gestützte Bewertung hoch. Unser multimodales Gemini-Modell bewertet Muskeldefinition, Haltung und relativen Fettanteil, um optimierte Ziele zu erstellen.",
      dragLabel: "Ziehen Sie Ihr Foto hierher oder klicken Sie zum Durchsuchen",
      dragSub: "Klares Spiegelbild oder stehende Pose bei gutem Licht",
      dragChange: "Bild ändern",
      alertImageOnly: "Bitte laden Sie nur Bilddateien hoch!",
      analyzeBtnActive: "KI-Fotoanalyse starten",
      analyzeBtnLoading: "Ihr Körper wird von der KI analysiert...",
      aiResultFat: "KI Fett %",
      aiResultType: "Körpertyp",
      aiResultGoal: "Zielvorgabe",
      aiResultHeader: "KI-Übersicht & Analyse",
      aiTrainingHeader: "Trainingsstrategie",
      aiNutritionHeader: "Ernährungsstrategie",
      
      goalCut: "Gewichtsverlust (Defi)",
      goalBulk: "Muskelaufbau (Masse)",
      goalMaintain: "Recomp (Halten)",
      
      catTooLow: "Extrem niedriger Fettanteil",
      catTooLowRec: "Kontrollierter Kalorienüberschuss (Massephase) empfohlen",
      catAthletic: "Athletisch / Schlank",
      catAthleticRec: "Erhaltungs- oder kontrollierte Aufbau-Strategien",
      catHealthy: "Gesund / Optimal",
      catHealthyRec: "Recomposition oder leichtes Defizit je nach Ziel",
      catAverage: "Moderat / Durchschnittlich",
      catAverageRec: "Leichtes Defizit (Definition) empfohlen",
      catObese: "Hoher Fettanteil / Übergewicht",
      catObeseRec: "Strukturiertes Kaloriendefizit (Definition) dringend empfohlen",
    },
    ru: {
      alertHeight: "Пожалуйста, сначала запишите свой рост в разделе замеров!",
      alertEmpty: "Пожалуйста, введите все параметры окружностей тела!",
      alertDiff: "Окружность талии должна быть больше окружности шеи!",
      alertValid: "Пожалуйста, введите корректные замеры!",
      navyTitle: "Расчет процента жира по методу ВМС США",
      navyDesc: "Метод ВМС США (U.S. Navy Method) вычисляет примерный процент подкожного жира по замерам шеи, талии и бедер. Это научно подтвержденный и признанный во всем мире стандарт.",
      heightNotice: "Для этого расчета обязательно необходим ваш рост. Пожалуйста, заполните его во вкладке Замеры.",
      currentHeightText: "Текущий рост:",
      neckLabel: "Обхват шеи (см)",
      waistLabel: "Обхват талии (см)",
      hipLabel: "Обхват бедер (см)",
      calcBtn: "Рассчитать процент жира",
      navyResultFat: "Жир %",
      navyResultCat: "Категория",
      navyResultAi: "Рекомендация ИИ",
      
      aiTitle: "ИИ-Анализ телосложения и жира",
      aiStatusActive: "Активно",
      aiDesc: "Загрузите фото своего тела для автоматической оценки процента жира. Мультимодальная модель Gemini проанализирует рельеф мышц, осанку и распределение жира для оптимизации тренировочной стратегии.",
      dragLabel: "Перетащите фото тела сюда или нажмите для выбора",
      dragSub: "Снимки в полный рост перед зеркалом при хорошем освещении",
      dragChange: "Заменить",
      alertImageOnly: "Пожалуйста, выбирайте только файлы изображений!",
      analyzeBtnActive: "Запустить ИИ-Анализ Фото",
      analyzeBtnLoading: "Ваше фото анализируется искусственным интеллектом...",
      aiResultFat: "ИИ Жир %",
      aiResultType: "Тип фигуры",
      aiResultGoal: "Цель",
      aiResultHeader: "Обзор и выводы ИИ",
      aiTrainingHeader: "Тренировочная стратегия",
      aiNutritionHeader: "Стратегия питания",
      
      goalCut: "Сушка",
      goalBulk: "Набор массы",
      goalMaintain: "Поддержание",
      
      catTooLow: "Крайне низкий процент жира",
      catTooLowRec: "Рекомендуется набор мышечной массы (Профицит)",
      catAthletic: "Атлетическое / Фитнес",
      catAthleticRec: "Поддержание формы или чистый набор",
      catHealthy: "Здоровый / Нормальный",
      catHealthyRec: "Рекомпозиция или легкий дефицит по желанию",
      catAverage: "Умеренный / Средний",
      catAverageRec: "Рекомендуется умеренный дефицит калорий",
      catObese: "Высокий процент жира / Ожирение",
      catObeseRec: "Настоятельно рекомендуется дефицит калорий (Сушка)",
    }
  };

  const t = tDict[lang as "az" | "en" | "de" | "ru" || "az"] || tDict["en"];

  // 1. Calculate Navy body fat
  const handleCalcNavy = () => {
    if (!currentHeight) {
      alert(t.alertHeight);
      return;
    }
    const n = Number(neck);
    const w = Number(waist);
    const h = gender === "f" ? Number(hip) : 0;

    if (!n || !w || (gender === "f" && !h)) {
      alert(t.alertEmpty);
      return;
    }

    let pct = 0;
    if (gender === "m") {
      if (w - n <= 0) {
        alert(t.alertDiff);
        return;
      }
      // US Navy Formula for Men
      pct = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(currentHeight)) - 450;
    } else {
      if (w + h - n <= 0) {
        alert(t.alertValid);
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
      cat = t.catTooLow;
      rec = t.catTooLowRec;
    } else if (pct < (isM ? 14 : 21)) {
      cat = t.catAthletic;
      rec = t.catAthleticRec;
    } else if (pct < (isM ? 18 : 25)) {
      cat = t.catHealthy;
      rec = t.catHealthyRec;
    } else if (pct < (isM ? 25 : 32)) {
      cat = t.catAverage;
      rec = t.catAverageRec;
    } else {
      cat = t.catObese;
      rec = t.catObeseRec;
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
      setAiError(t.alertImageOnly);
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
          lang, // pass selected language for response translation if supported
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      onUpdateAi({
        ...data,
        date: todayISO,
      });
    } catch (err: any) {
      setAiError(
        err.message ||
          (lang === "en"
            ? "An error occurred during photo analysis. Check your connection."
            : lang === "ru"
            ? "Ошибка при анализе фото. Проверьте подключение."
            : "Şəkil təhlil edilərkən xəta baş verdi. İnternet əlaqənizi yoxlayın.")
      );
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
          <span>{t.navyTitle}</span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          {t.navyDesc}
        </p>

        {!currentHeight ? (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-300 leading-relaxed">
              {t.heightNotice}
            </div>
          </div>
        ) : (
          <div className="text-xs text-emerald-400 font-bold">
            ✓ {t.currentHeightText} {currentHeight} {lang === "en" ? "cm" : "sm"}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.neckLabel}</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 38"
              value={neck}
              onChange={(e) => setNeck(e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.waistLabel}</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 85"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
            />
          </div>

          {gender === "f" && (
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.hipLabel}</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="e.g. 96"
                value={hip}
                onChange={(e) => setHip(e.target.value)}
                className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleCalcNavy}
          disabled={!currentHeight}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-gray-950 font-black rounded-xl cursor-pointer transition-all text-xs uppercase tracking-wider shadow-md"
        >
          {t.calcBtn}
        </button>

        {bf && (
          <div className="pt-3 border-t border-[#2a2d34]/60 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
            <div className="bg-[#131417] p-3 rounded-xl border border-[#2a2d34] text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase">{t.navyResultFat}</div>
              <div className="text-xl font-black text-amber-500 mt-1">{bf.pct}%</div>
            </div>
            <div className="bg-[#131417] p-3 rounded-xl border border-[#2a2d34] text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase">{t.navyResultCat}</div>
              <div className="text-sm font-black text-white mt-1.5">{bf.cat}</div>
            </div>
            <div className="bg-[#131417] p-3 rounded-xl border border-[#2a2d34] text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase">{t.navyResultAi}</div>
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
            <span>{t.aiTitle}</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 py-0.5 px-2 bg-emerald-500/10 rounded-full">
            {t.aiStatusActive} ✨
          </span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          {t.aiDesc}
        </p>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 min-h-[160px] text-center transition-all cursor-pointer ${
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
                  {t.dragChange}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pointer-events-none">
              <div className="inline-flex p-3 bg-[#131417] border border-[#2a2d34] rounded-full text-gray-400">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-200">{t.dragLabel}</p>
                <p className="text-[10px] text-gray-500 mt-1">{t.dragSub}</p>
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
              <RefreshCw className="w-4 h-4 animate-spin text-gray-950" /> {t.analyzeBtnLoading}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> {t.analyzeBtnActive}
            </>
          )}
        </button>

        {ai && (
          <div className="pt-4 border-t border-[#2a2d34]/60 space-y-4 animate-fade-in">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#131417] p-3 rounded-xl border border-[#2a2d34] text-center">
                <div className="text-[9px] text-gray-400 font-bold uppercase">{t.aiResultFat}</div>
                <div className="text-lg font-black text-amber-500 mt-1 font-mono">
                  {ai.bodyFatMin}–{ai.bodyFatMax}%
                </div>
              </div>
              <div className="bg-[#131417] p-3 rounded-xl border border-[#2a2d34] text-center">
                <div className="text-[9px] text-gray-400 font-bold uppercase">{t.aiResultType}</div>
                <div className="text-xs font-bold text-white mt-2 truncate">{ai.category}</div>
              </div>
              <div className="bg-[#131417] p-3 rounded-xl border border-[#2a2d34] text-center">
                <div className="text-[9px] text-gray-400 font-bold uppercase">{t.aiResultGoal}</div>
                <div className="text-xs font-bold text-emerald-400 mt-2">
                  {ai.goal === "cut" ? t.goalCut : ai.goal === "bulk" ? t.goalBulk : t.goalMaintain}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-black text-amber-500 uppercase tracking-wider">{t.aiResultHeader}</span>
                <p className="text-sm text-gray-200 mt-1 leading-relaxed">{ai.summary}</p>
              </div>

              <div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">{t.aiTrainingHeader}</span>
                <p className="text-sm text-gray-200 mt-1 leading-relaxed">{ai.trainingAdvice}</p>
              </div>

              <div>
                <span className="text-xs font-black text-blue-400 uppercase tracking-wider">{t.aiNutritionHeader}</span>
                <p className="text-sm text-gray-200 mt-1 leading-relaxed">{ai.nutritionAdvice}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
