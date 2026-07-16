import React from "react";
import { NutritionData, MeasurementEntry } from "../types";
import { Scale, Zap, Info, ShieldAlert } from "lucide-react";

interface NutritionProps {
  nutri: NutritionData;
  latestMeasure: MeasurementEntry | null;
  onUpdateNutri: (n: NutritionData) => void;
  lang?: string;
}

const MEAL_PLANS_LANG = {
  az: {
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
  },
  en: {
    cut: {
      label: "Fat Loss (Cutting)",
      desc: "Caloric deficit (~15-20%). Elevated protein targets ensure skeletal muscle retention while optimizing lipid burning rates.",
      meals: [
        ["Breakfast", "Egg white omelette (3 whites + 1 whole egg), 2 slices of whole wheat toast, cucumber/tomato, green tea."],
        ["Mid-day Snack", "1 green apple or 150g unsweetened fat-free Greek yogurt."],
        ["Lunch", "150g grilled chicken breast, 100g steamed buckwheat or brown rice, green salad with 1 tsp olive oil."],
        ["Pre-workout", "1 small banana or 30g oatmeal made with water."],
        ["Post-workout", "1 scoop whey protein or 150g low-fat cottage cheese."],
        ["Dinner", "150g baked white fish or lean turkey breast, steamed broccoli & cauliflower, fresh spinach."]
      ]
    },
    maintain: {
      label: "Maintenance & Body Recomposition",
      desc: "Caloric balance. Stable macronutrient distribution to facilitate recovery, strength preservation, and vitality.",
      meals: [
        ["Breakfast", "50g rolled oats with milk, 1 sliced banana, 1 tbsp peanut butter, 2 hard-boiled eggs."],
        ["Mid-day Snack", "Handful of almonds or walnuts with 1 seasonal fruit."],
        ["Lunch", "150g lean beef sirloin or chicken breast, 150g cooked bulgur or wild rice, fresh mixed salad."],
        ["Pre-workout", "1 banana with 1 cup black coffee (sugar-free)."],
        ["Post-workout", "1 scoop whey protein or 3 boiled egg whites."],
        ["Dinner", "150g baked salmon, 100g baked sweet potato wedges, green salad, 1 glass of buttermilk (ayran)."]
      ]
    },
    bulk: {
      label: "Hypertrophy (Bulking)",
      desc: "Caloric surplus (~10-15%). High carbohydrate loading paired with premium amino profiles for hyper-recovery and mass growth.",
      meals: [
        ["Breakfast", "4-egg omelette with cheese, 80g oats cooked in whole milk with 1 tbsp honey, 1 banana."],
        ["Mid-day Snack", "200g cottage cheese topped with honey, raisins, almonds, and walnuts."],
        ["Lunch", "200g grilled lean beef or chicken breast, 200g pasta or basmati rice, sautéed mushrooms/veggies."],
        ["Pre-workout", "Oatmeal shake made with whole milk, 1 banana, and 1.5 tbsp peanut butter."],
        ["Post-workout", "Protein shake + 2 dates or 1 large ripe banana."],
        ["Dinner", "200g turkey steak or baked fish, 150g bulgur or sweet potato mash, generous side of mixed greens."],
        ["Before bed", "150g cottage cheese (casein source) or 1 cup of warm whole milk."]
      ]
    }
  },
  ru: {
    cut: {
      label: "Снижение веса (Сушка)",
      desc: "Дефицит калорий (~15-20%). Повышенное содержание белка позволяет сохранить мышечную массу при активном жиросжигании.",
      meals: [
        ["Завтрак", "Омлет из 3 белков и 1 целого яйца (на капле оливкового масла), 2 ломтика цельнозернового хлеба, свежие овощи, зеленый чай."],
        ["Перекус", "1 среднее зеленое яблоко или 150г нежирного натурального йогурта."],
        ["Обед", "150г куриного филе (на гриле или отварного), 100г готовой гречки или бурого риса, салат с оливковым маслом (1 ч.л.)."],
        ["Перед тренировкой", "1 небольшой банан или 30г овсянки на воде."],
        ["После тренировки", "1 порция протеинового коктейля или 150г обезжиренного творога."],
        ["Ужин", "150г запеченной белой рыбы или индейки, брокколи на пару, свежая зелень."]
      ]
    },
    maintain: {
      label: "Поддержание формы и рекомпозиция",
      desc: "Баланс калорий. Оптимальное количество белка и сложных углеводов для поддержания высокого уровня энергии и работоспособности.",
      meals: [
        ["Завтрак", "50г овсяных хлопьев на молоке, 1 банан, 1 ст.л. арахисовой пасты, 2 вареных яйца."],
        ["Перекус", "Горсть орехов (миндаль или грецкие) и 1 сезонный фрукт."],
        ["Обед", "150г нежирной говядины или курицы, 150г булгура или бурого риса, сезонный овощной салат."],
        ["Перед тренировкой", "1 банан и чашка черного кофе без сахара."],
        ["После тренировки", "Протеиновый коктейль или 3 вареных яичных белка."],
        ["Ужин", "150г запеченного лосося, 100г сладкого картофеля (батата) из духовки, зеленый салат, 1 стакан кефира или айрана."]
      ]
    },
    bulk: {
      label: "Набор массы (Профицит)",
      desc: "Профицит калорий (~10-15%). Обилие сложных углеводов и качественного белка для быстрого восстановления и анаболического роста.",
      meals: [
        ["Завтрак", "Омлет из 4 яиц с сыром, 80г овсянки на цельном молоке с медом, 1 банан."],
        ["Перекус", "200г творога с сухофруктами (изюм, курага) и миндалем."],
        ["Обед", "200г курицы или говядины, 200г макарон из твердых сортов пшеницы или риса, овощное соте."],
        ["Перед тренировкой", "Коктейль: овсянка на цельном молоке, бананы, 1.5 ст.л. арахисовой пасты."],
        ["После тренировки", "Протеиновый коктейль + 2 финика или крупный банан."],
        ["Ужин", "200г стейка индейки или запеченной рыбы, 150г булгура или пюре из батата, много свежих овощей."],
        ["Перед сном", "150г творога (источник казеина) или 1 стакан теплого цельного молока."]
      ]
    }
  },
  de: {
    cut: {
      label: "Gewichtsverlust (Fettverbrennung)",
      desc: "Kaloriendefizit (~15-20%). Ein hoher Proteinanteil schützt Ihre Muskelmasse und fördert eine schnelle Fettverbrennung.",
      meals: [
        ["Frühstück", "Omelett aus 3 Eiweiß + 1 ganzem Ei (wenig Olivenöl), 2 Scheiben Vollkornbrot, frisches Gemüse, grüner Tee."],
        ["Zwischenmahlzeit", "1 mittelgroßer grüner Apfel oder 150g fettarmer Naturjoghurt."],
        ["Mittagessen", "150g gegrillte Hähnchenbrust, 100g gekochter Buchweizen oder Naturreis, großer Salat mit 1 TL Olivenöl."],
        ["Vor dem Training", "1 kleine Banane oder 30g Haferflocken mit Wasser."],
        ["Nach dem Training", "1 Portion Proteinshake oder 150g Magerquark."],
        ["Abendessen", "150g gebackener Weißfisch oder Putenbrust, gedämpfter Brokkoli & Blumenkohl, frischer Spinat."]
      ]
    },
    maintain: {
      label: "Gewicht halten & Recomposition",
      desc: "Kalorienbilanz. Stabile Proteinzufuhr und moderate Mengen an gesunden Kohlenhydraten, um das Energieniveau hoch zu halten.",
      meals: [
        ["Frühstück", "50g Haferflocken mit Milch, 1 Banane, 1 EL Erdnussbutter, 2 hartgekochte Eier."],
        ["Zwischenmahlzeit", "Eine Handvoll Nüsse (Mandeln, Haselnüsse) und 1 saisonale Frucht."],
        ["Mittagessen", "150g mageres Rindfleisch oder Hähnchen, 150g Bulgur oder Naturreis, gemischter Salat mit Olivenöl."],
        ["Vor dem Training", "1 Banane und 1 Tasse schwarzer Kaffee (ohne Zucker)."],
        ["Nach dem Training", "1 Portion Proteinshake oder 3 gekochte Eiweiß."],
        ["Abendessen", "150g Lachsfilet aus dem Ofen, 100g Ofen-Süßkartoffel, grüner Salat, 1 Glas Ayran."]
      ]
    },
    bulk: {
      label: "Muskelaufbau (Massephase)",
      desc: "Kalorienüberschuss (~10-15%). Hoher Kohlenhydrat- und Proteinanteil für maximale Regeneration und Muskelaufbau.",
      meals: [
        ["Frühstück", "Omelett aus 4 Eiern mit Käse, 80g Haferflocken (Vollmilch und Honig), 1 Banane."],
        ["Zwischenmahlzeit", "200g Magerquark mit Trockenfrüchten (Rosinen, Aprikosen) und Mandelscheiben."],
        ["Mittagessen", "200g Hähnchen- oder Rindfleisch, 200g gekochter Reis oder Nudeln, Gemüsepfanne."],
        ["Vor dem Training", "Shake aus Haferflocken mit Vollmilch, 1 Banane und 1,5 EL Erdnussbutter."],
        ["Nach dem Training", "Protein-Shake + 2 Datteln oder 1 große Banane."],
        ["Abendessen", "200g Putensteak oder gebackener Fisch, 150g Bulgur oder Süßkartoffelpüree, viel frisches Gemüse."],
        ["Vor dem Schlafengehen", "150g Magerquark (Casein-Quelle) oder 1 Glas warme Vollmilch."]
      ]
    }
  }
};

export default function Nutrition({ nutri, latestMeasure, onUpdateNutri, lang = "az" }: NutritionProps) {
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

  const tDict = {
    az: {
      title: "Fərdi Kalori və Makro Hesablayıcı",
      alertNotice: "Zəhmət olmasa, əvvəlcə Ölçülər bölməsində boy və çəkinizi qeyd edin ki, kalori və makrolarınız tam dəqiqliklə hesablansın!",
      ageLabel: "Yaşınız",
      genderLabel: "Cinsiyyət",
      activityLabel: "Fəallıq dərəcəsi",
      goalLabel: "Hədəf və məqsəd",
      targetCalLabel: "Hədəf Kalori",
      proteinLabel: "Zülal (Protein)",
      carbsLabel: "Karbohidrat",
      fatLabel: "Yağ (Sağlam)",
      kcalPerDay: "kkal/gün",
      waterIntake: "Su Qəbulu: Gündə ən azı 2.5 - 3.5 litr təmiz su içməyi unutmayın. Yemək siyahısı tövsiyə xarakteri daşıyır. Fərdi tibbi məsləhətlər və allergiyanızı mütləq nəzərə alın.",
      
      male: "Kişi",
      female: "Qadın",
      
      act1: "Az fəal (Məşqsiz, oturaq iş)",
      act2: "Yüngül fəal (Həftədə 1-2 gün məşq)",
      act3: "Orta fəal (Həftədə 3-5 gün güclü məşq)",
      act4: "Çox fəal (Həftədə 6-7 gün ağır məşq)",
      
      gCut: "Arıqlama (Fat Loss)",
      gMaintain: "Formanı qoruma (Maintenance)",
      gBulk: "Kütlə yığma (Muscle Gain)",
    },
    en: {
      title: "Custom Calorie & Macro Calculator",
      alertNotice: "Please record your height and weight in the Dimensions section first so your macro parameters can be computed with high precision!",
      ageLabel: "Your Age",
      genderLabel: "Gender",
      activityLabel: "Activity Multiplier",
      goalLabel: "Primary Goal",
      targetCalLabel: "Target Calories",
      proteinLabel: "Protein",
      carbsLabel: "Carbohydrates",
      fatLabel: "Healthy Fats",
      kcalPerDay: "kcal/day",
      waterIntake: "Water Intake: Aim for at least 2.5 - 3.5 liters of clean water daily. This meal guide acts as a foundational suggestion. Take personal intolerances or medical advice into account.",
      
      male: "Male",
      female: "Female",
      
      act1: "Sedentary (No training, desk job)",
      act2: "Light active (1-2 workout days / week)",
      act3: "Moderate active (3-5 intense workouts / week)",
      act4: "Highly active (6-7 heavy workouts / week)",
      
      gCut: "Fat Loss (Deficit)",
      gMaintain: "Maintain Weight (Balance)",
      gBulk: "Muscle Gain (Surplus)",
    },
    de: {
      title: "Individueller Kalorien- & Makrorechner",
      alertNotice: "Bitte tragen Sie zuerst Ihre Größe und Ihr Gewicht im Bereich Maße ein, damit Ihre Makros präzise berechnet werden können!",
      ageLabel: "Ihr Alter",
      genderLabel: "Geschlecht",
      activityLabel: "Aktivitätslevel",
      goalLabel: "Hauptziel",
      targetCalLabel: "Zielkalorien",
      proteinLabel: "Eiweiß (Protein)",
      carbsLabel: "Kohlenhydrate",
      fatLabel: "Gesunde Fette",
      kcalPerDay: "kcal/Tag",
      waterIntake: "Wasserzufuhr: Trinken Sie täglich mindestens 2,5 - 3,5 Liter sauberes Wasser. Dieser Ernährungsplan dient als Empfehlung. Berücksichtigen Sie persönliche Unverträglichkeiten und medizinischen Rat.",
      
      male: "Männlich",
      female: "Weiblich",
      
      act1: "Sitzend (Kein Training, Bürojob)",
      act2: "Leicht aktiv (1-2 Trainingstage / Woche)",
      act3: "Mäßig aktiv (3-5 intensive Workouts / Woche)",
      act4: "Sehr aktiv (6-7 schwere Workouts / Woche)",
      
      gCut: "Gewichtsverlust (Defizit)",
      gMaintain: "Gewicht halten (Bilanz)",
      gBulk: "Muskelaufbau (Überschuss)",
    },
    ru: {
      title: "Индивидуальный Калькулятор Калорий и Макросов",
      alertNotice: "Пожалуйста, сначала укажите рост и вес в разделе 'Замеры', чтобы ваши макросы рассчитались максимально точно!",
      ageLabel: "Ваш возраст",
      genderLabel: "Пол",
      activityLabel: "Уровень активности",
      goalLabel: "Главная цель",
      targetCalLabel: "Цель калорий",
      proteinLabel: "Белки (Протеин)",
      carbsLabel: "Углеводы",
      fatLabel: "Полезные Жиры",
      kcalPerDay: "ккал/день",
      waterIntake: "Потребление воды: Старайтесь пить не менее 2.5 - 3.5 литров чистой воды в день. Данный план питания носит рекомендательный характер. Обязательно учитывайте медицинские показания и индивидуальную непереносимость.",
      
      male: "Мужской",
      female: "Женский",
      
      act1: "Сидячий (Без тренировок, сидячая работа)",
      act2: "Низкая активность (1-2 тренировки в неделю)",
      act3: "Умеренная активность (3-5 тренировок в неделю)",
      act4: "Высокая активность (6-7 тяжелых тренировок в неделю)",
      
      gCut: "Снижение веса (Сушка)",
      gMaintain: "Поддержание веса",
      gBulk: "Набор массы (Профицит)",
    }
  };

  const t = tDict[lang as "az" | "en" | "de" | "ru" || "az"] || tDict["en"];

  const currentPlan = (MEAL_PLANS_LANG[lang as "az" | "en" | "de" | "ru" || "az"] || MEAL_PLANS_LANG["en"] || MEAL_PLANS_LANG.az)[nutri.goal as "cut" | "maintain" | "bulk"] || MEAL_PLANS_LANG.az.cut;

  const handleFieldChange = (field: keyof NutritionData, val: string) => {
    onUpdateNutri({ ...nutri, [field]: val });
  };

  return (
    <div className="space-y-4">
      {/* Target Calculations Card */}
      <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
          <span>{t.title}</span>
        </div>

        {!w || !ht ? (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-300 leading-relaxed">
              {t.alertNotice}
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.ageLabel}</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 25"
              value={nutri.age}
              onChange={(e) => handleFieldChange("age", e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.genderLabel}</label>
            <select
              value={nutri.gender}
              onChange={(e) => handleFieldChange("gender", e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500 cursor-pointer"
            >
              <option value="m">{t.male}</option>
              <option value="f">{t.female}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.activityLabel}</label>
            <select
              value={nutri.activity}
              onChange={(e) => handleFieldChange("activity", e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500 cursor-pointer"
            >
              <option value="1.2">{t.act1}</option>
              <option value="1.375">{t.act2}</option>
              <option value="1.55">{t.act3}</option>
              <option value="1.725">{t.act4}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.goalLabel}</label>
            <select
              value={nutri.goal}
              onChange={(e) => handleFieldChange("goal", e.target.value)}
              className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500 cursor-pointer"
            >
              <option value="cut">{t.gCut}</option>
              <option value="maintain">{t.gMaintain}</option>
              <option value="bulk">{t.gBulk}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Macro Breakdown Panel */}
      {targetCal > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center animate-fade-in">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.targetCalLabel}</span>
            <div className="text-2xl font-black text-amber-500 mt-1">{Math.round(targetCal)}</div>
            <span className="text-[9px] text-gray-500 font-medium">{t.kcalPerDay}</span>
          </div>

          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center animate-fade-in">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.proteinLabel}</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{protein} q</div>
            <span className="text-[9px] text-gray-500 font-medium">{protein * 4} kkal</span>
          </div>

          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center animate-fade-in">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.carbsLabel}</span>
            <div className="text-2xl font-black text-blue-400 mt-1">{carbs} q</div>
            <span className="text-[9px] text-gray-500 font-medium">{carbs * 4} kkal</span>
          </div>

          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center animate-fade-in">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.fatLabel}</span>
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
        <p>{t.waterIntake}</p>
      </div>
    </div>
  );
}
