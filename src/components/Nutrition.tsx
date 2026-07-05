import React from "react";
import { NutritionData, MeasurementEntry } from "../types";
import { Scale, Zap, Info, ShieldAlert } from "lucide-react";

interface NutritionProps {
  nutri: NutritionData;
  latestMeasure: MeasurementEntry | null;
  onUpdateNutri: (n: NutritionData) => void;
}

const MEAL_PLANS = {
  cut: {
    label: "Arıqlama (Yağ yandırma)",
    desc: "Kalori defisiti (~15-20%). Yüksək zülal (protein) əzələ kütlənizi qoruyaraq yağların sürətlə əriməsinə kömək edir.",
    meals: [
      ["Səhər yeməyi", "3 yumurta ağı + 1 tam yumurta ilə omlet (zeytun yağı az), 2 dilim tam taxıllı çörək, təzə tərəvəzlər, yaşıl çay."],
      ["Ara qəlyanaltı", "1 orta boy yaşıl alma və ya 150q az yağlı təbii qatıq."],
      ["Nahar", "150q toyuq döş əti (ızqara və ya qaynadılmış), 100q bişmiş qarabaşaq (və ya qəhvəyi düyü), böyük tərəvəz salatı (1 ç.q. zeytun yağı ilə)."],
      ["Məşqdən əvvəl", "1 kiçik banan və ya 30q yulaf sıyığı."],
      ["Məşqdən sonra", "1 stəkan protein kokteyli və ya 150q kəsmik (lor pendiri)."],
      ["Şam yeməyi", "150q ağ balıq və ya hind toyuğu, buğda bişmiş brokolli, gül kələmi, bol göyərti."]
    ]
  },
  maintain: {
    label: "Formanı qoruma və dözümlülük",
    desc: "Kalori balansı. Sabit zülal qəbulu, enerjini yüksək səviyyədə saxlamaq üçün orta miqdarda sağlam karbohidratlar.",
    meals: [
      ["Səhər yeməyi", "50q yulaf (südlə), 1 ədəd banan, 1 x.q. fıstıq yağı, 2 ədəd qaynadılmış yumurta."],
      ["Ara qəlyanaltı", "Bir ovuc qoz-fındıq (badam, fındıq) və 1 ədəd mövsüm meyvəsi."],
      ["Nahar", "150q mal əti (yağsız) və ya toyuq, 150q bulqur və ya düyü, zeytun yağlı mövsüm salatı."],
      ["Məşqdən əvvəl", "1 banan və 1 stəkan kofe (şəkərsiz)."],
      ["Məşqdən sonra", "1 stəkan protein kokteyli və ya 2 ədəd qaynadılmış yumurta ağ."],
      ["Şam yeməyi", "150q sobada bişmiş qızılbalıq (və ya digər balıq), 100q sobada bişmiş kartof, göyərti salatı, 1 stəkan ayran."]
    ]
  },
  bulk: {
    label: "Kütlə yığma (Əzələ artımı)",
    desc: "Kalori artıqlığı (~10-15%). Hüceyrələrin yenilənməsi və sürətli əzələ inkişafı üçün yüksək karbohidrat və zülal zənginliyi.",
    meals: [
      ["Səhər yeməyi", "4 tam yumurta ilə pendirli omlet, 80q yulaf ezmesi (tam süd və bal ilə), 1 banan."],
      ["Ara qəlyanaltı", "200q kəsmik, üzərinə quru meyvələr (kişmiş, ərik) və badam dilimləri."],
      ["Nahar", "200q toyuq və ya mal əti, 200q qaynadılmış düyü və ya makaron, göbələkli tərəvəz sotesi."],
      ["Məşqdən əvvəl", "1 stəkan südlə qarışdırılmış yulaf sıyığı, 1 x.q. fıstıq yağı və banan."],
      ["Məşqdən sonra", "Zülal kokteyli + 2 ədəd xurma və ya 1 ədəd iri banan."],
      ["Şam yeməyi", "200q hind toyuğu və ya balıq, 150q bulqur və ya şirin kartof, bol tərəvəz və qatıq."],
      ["Yatmazdan əvvəl", "150q kəsmik (kazein protein mənbəyi) və ya 1 stəkan isti süd."]
    ]
  }
};

export default function Nutrition({ nutri, latestMeasure, onUpdateNutri }: NutritionProps) {
  const w = latestMeasure?.weight;
  const ht = latestMeasure?.height;
  const age = Number(nutri.age);

  let targetCal = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;

  if (w && ht && age) {
    // Harris-Benedict formula (Mifflin-St Jeor revised)
    const bmr =
      nutri.gender === "m"
        ? 10 * w + 6.25 * ht - 5 * age + 5
        : 10 * w + 6.25 * ht - 5 * age - 161;

    const tdee = bmr * Number(nutri.activity);

    targetCal =
      nutri.goal === "cut"
        ? tdee * 0.82 // 18% deficit
        : nutri.goal === "bulk"
        ? tdee * 1.12 // 12% surplus
        : tdee;

    protein = Math.round(w * (nutri.goal === "cut" ? 2.2 : nutri.goal === "bulk" ? 2.0 : 1.8));
    fat = Math.round((targetCal * 0.25) / 9); // 25% of energy from fat
    carbs = Math.round((targetCal - protein * 4 - fat * 9) / 4);
  }

  const currentPlan = MEAL_PLANS[nutri.goal];

  const handleFieldChange = (field: keyof NutritionData, val: string) => {
    onUpdateNutri({ ...nutri, [field]: val });
  };

  return (
    <div className="space-y-4">
      {/* Target Calculations Card */}
      <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
          <span>Fərdi Kalori və Makro Hesablayıcı</span>
        </div>

        {!w || !ht ? (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-300 leading-relaxed">
              Zəhmət olmasa, əvvəlcə <b className="text-amber-500 font-bold">Ölçülər</b> bölməsində boy və çəkinizi qeyd edin ki, kalori və makrolarınız tam dəqiqliklə hesablansın!
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Yaşınız</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Məs. 25"
              value={nutri.age}
              onChange={(e) => handleFieldChange("age", e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Cinsiyyət</label>
            <select
              value={nutri.gender}
              onChange={(e) => handleFieldChange("gender", e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
            >
              <option value="m">Kişi</option>
              <option value="f">Qadın</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Fəallıq dərəcəsi</label>
            <select
              value={nutri.activity}
              onChange={(e) => handleFieldChange("activity", e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
            >
              <option value="1.2">Az fəal (Məşqsiz, oturaq iş)</option>
              <option value="1.375">Yüngül fəal (Həftədə 1-2 gün məşq)</option>
              <option value="1.55">Orta fəal (Həftədə 3-5 gün güclü məşq)</option>
              <option value="1.725">Çox fəal (Həftədə 6-7 gün ağır məşq)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Hədəf və məqsəd</label>
            <select
              value={nutri.goal}
              onChange={(e) => handleFieldChange("goal", e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
            >
              <option value="cut">Arıqlama (Fat Loss)</option>
              <option value="maintain">Formanı qoruma (Maintenance)</option>
              <option value="bulk">Kütlə yığma (Muscle Gain)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Macro Breakdown Panel */}
      {targetCal > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hədəf Kalori</span>
            <div className="text-2xl font-black text-amber-500 mt-1">{Math.round(targetCal)}</div>
            <span className="text-[9px] text-gray-500 font-medium">kkal/gün</span>
          </div>

          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Zülal (Protein)</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{protein} q</div>
            <span className="text-[9px] text-gray-500 font-medium">{protein * 4} kkal</span>
          </div>

          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Karbohidrat</span>
            <div className="text-2xl font-black text-blue-400 mt-1">{carbs} q</div>
            <span className="text-[9px] text-gray-500 font-medium">{carbs * 4} kkal</span>
          </div>

          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Yağ (Sağlam)</span>
            <div className="text-2xl font-black text-pink-400 mt-1">{fat} q</div>
            <span className="text-[9px] text-gray-500 font-medium">{fat * 9} kkal</span>
          </div>
        </div>
      )}

      {/* Meal Suggestion Plan */}
      <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="font-black italic tracking-wide text-lg text-white uppercase">{currentPlan.label}</h3>
          <p className="text-xs text-gray-400 mt-1">{currentPlan.desc}</p>
        </div>

        <div className="divide-y divide-[#2a2d34]/60 space-y-3 pt-2">
          {currentPlan.meals.map(([title, content], idx) => (
            <div key={idx} className="pt-3 first:pt-0">
              <span className="text-xs font-black text-amber-500 uppercase tracking-widest">{title}</span>
              <p className="text-sm text-gray-200 mt-1 leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1b1d22]/40 border border-[#2a2d34]/60 rounded-2xl p-4 flex gap-3 text-xs text-gray-400 leading-relaxed">
        <Info className="w-5 h-5 text-amber-500 shrink-0" />
        <p>
          Su Qəbulu: Gündə ən azı 2.5 - 3.5 litr təmiz su içməyi unutmayın. Yemək siyahısı tövsiyə xarakteri daşıyır. Fərdi tibbi məsləhətlər və allergiyanızı mütləq nəzərə alın.
        </p>
      </div>
    </div>
  );
}
