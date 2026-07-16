import React, { useState } from "react";
import { 
  Dumbbell, 
  Sparkles, 
  Utensils, 
  TrendingUp, 
  Music, 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  ShieldCheck, 
  Flame, 
  Activity, 
  Award, 
  Heart, 
  MessageSquare,
  HelpCircle,
  Menu,
  X,
  Play,
  Calculator as CalcIcon,
  Crown,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Language, translations } from "../utils/translations";

interface MarketingSiteProps {
  onOpenAuth: (mode?: "login" | "register") => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function MarketingSite({ onOpenAuth, lang, onLanguageChange }: MarketingSiteProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang];
  
  // Interactive Calculator State
  const [calcWeight, setCalcWeight] = useState("75");
  const [calcHeight, setCalcHeight] = useState("178");
  const [calcAge, setCalcAge] = useState("25");
  const [calcGender, setCalcGender] = useState<"m" | "f">("m");
  const [calcGoal, setCalcGoal] = useState<"loss" | "maintain" | "gain">("loss");
  const [calcActivity, setCalcActivity] = useState("1.375"); // Moderately active
  const [calcResults, setCalcResults] = useState<{ calories: number; carbs: number; protein: number; fat: number } | null>(null);

  // FAQ State
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const calculateKcal = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(calcWeight);
    const h = parseFloat(calcHeight);
    const a = parseFloat(calcAge);
    const act = parseFloat(calcActivity);
    
    if (isNaN(w) || isNaN(h) || isNaN(a)) return;

    // BMR using Mifflin-St Jeor Equation
    let bmr = 0;
    if (calcGender === "m") {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    let tdee = Math.round(bmr * act);
    let targetCal = tdee;

    if (calcGoal === "loss") targetCal = Math.round(tdee - 500);
    if (calcGoal === "gain") targetCal = Math.round(tdee + 400);

    // Calculate Macros
    // Protein: 2g per kg weight
    const protein = Math.round(w * 2);
    // Fat: 25% of calories
    const fat = Math.round((targetCal * 0.25) / 9);
    // Carbs: rest of calories
    const carbCal = targetCal - (protein * 4) - (fat * 9);
    const carbs = Math.max(0, Math.round(carbCal / 4));

    setCalcResults({
      calories: targetCal,
      carbs,
      protein,
      fat
    });
  };

  const languageLabels: Record<Language, { label: string; flag: string }> = {
    az: { label: "AZE", flag: "🇦🇿" },
    en: { label: "ENG", flag: "🇬🇧" },
    de: { label: "DEU", flag: "🇩🇪" },
    ru: { label: "RUS", flag: "🇷🇺" }
  };

  return (
    <div className="bg-[#0b0c10] text-gray-100 min-h-screen overflow-x-hidden font-sans select-none antialiased">
      {/* BACKGROUND GRAPHICS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-50 bg-[#0b0c10]/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-amber-500 text-gray-950 rounded-xl flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-xl font-black italic tracking-tighter text-white">
              DƏMİR<span className="text-amber-500">PLAN</span> <span className="text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded ml-1 border border-amber-500/20">PRO</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-300">
            <a href="#features" className="hover:text-amber-500 transition-colors">{t.features}</a>
            <a href="#preview" className="hover:text-amber-500 transition-colors">{t.appPreview}</a>
            <a href="#calculator" className="hover:text-amber-500 transition-colors">{t.calculator}</a>
            <a href="#pricing" className="hover:text-amber-500 transition-colors">{t.pricing}</a>
            <a href="#faq" className="hover:text-amber-500 transition-colors">{t.faq}</a>
          </nav>

          {/* Action and Language Bar */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 bg-[#121319] border border-gray-800 rounded-xl p-1">
              {(Object.keys(languageLabels) as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => onLanguageChange(l)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    lang === l 
                      ? "bg-amber-500 text-gray-950" 
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <span>{languageLabels[l].flag}</span>
                  <span className="text-[10px]">{languageLabels[l].label}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => onOpenAuth("login")}
              className="text-gray-300 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {t.login}
            </button>
            <button 
              onClick={() => onOpenAuth("register")}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-amber-500/10 transform active:scale-95 cursor-pointer"
            >
              {t.startWorkout}
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile language circle toggle */}
            <div className="flex bg-[#121319] border border-gray-800 rounded-lg p-0.5">
              {(Object.keys(languageLabels) as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => onLanguageChange(l)}
                  className={`w-7 h-7 flex items-center justify-center text-xs rounded transition-all cursor-pointer ${
                    lang === l ? "bg-amber-500" : "opacity-50 hover:opacity-100"
                  }`}
                  title={languageLabels[l].label}
                >
                  {languageLabels[l].flag}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-800/30 rounded-lg cursor-pointer transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-800/60 bg-[#0e0f14] overflow-hidden"
            >
              <div className="px-6 py-5 flex flex-col gap-4 text-sm font-semibold">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white py-1 block">{t.features}</a>
                <a href="#preview" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white py-1 block">{t.appPreview}</a>
                <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white py-1 block">{t.calculator}</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white py-1 block">{t.pricing}</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white py-1 block">{t.faq}</a>
                <hr className="border-gray-800/60 my-2" />
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth("login"); }}
                    className="w-full py-3 text-center border border-gray-800 rounded-xl font-bold text-gray-300 hover:text-white cursor-pointer"
                  >
                    {t.login}
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth("register"); }}
                    className="w-full py-3 text-center bg-amber-500 text-gray-950 font-black rounded-xl cursor-pointer"
                  >
                    {t.register}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 md:pt-24 pb-16 md:pb-32 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs md:text-sm font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider animate-pulse">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{t.aiPoweredTitle}</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white italic">
            {t.heroTitlePart1}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500">
              {t.heroTitlePart2}
            </span> {t.heroTitlePart3}
          </h1>

          <p className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onOpenAuth("register")}
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-base rounded-2xl transition-all shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20 flex items-center justify-center gap-2.5 transform active:scale-95 cursor-pointer"
            >
              <span>{t.startWorkoutsBtn}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a 
              href="#preview"
              className="w-full sm:w-auto px-8 py-4 bg-[#16181f] hover:bg-[#1f222d] text-gray-300 hover:text-white border border-gray-800 hover:border-gray-700 font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>{t.exploreFeaturesBtn}</span>
              <Play className="w-4 h-4 fill-current text-gray-400" />
            </a>
          </div>

          {/* Trust stats badge */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-gray-900/80 mt-12">
            <div className="text-center">
              <span className="block text-2xl md:text-3xl font-black text-white italic">12,400+</span>
              <span className="text-xs text-gray-500 font-semibold uppercase mt-1 block">{t.activeAthletes}</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl md:text-3xl font-black text-amber-500 italic">24/7 Voice</span>
              <span className="text-xs text-gray-500 font-semibold uppercase mt-1 block">{t.aiCoachSupport}</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl md:text-3xl font-black text-white italic">85,000+</span>
              <span className="text-xs text-gray-500 font-semibold uppercase mt-1 block">{t.createdPlans}</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl md:text-3xl font-black text-amber-500 italic">₼0</span>
              <span className="text-xs text-gray-500 font-semibold uppercase mt-1 block">{t.freeForever}</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION (Bento Grid) */}
      <section id="features" className="py-20 bg-[#0e0f14]/80 border-y border-gray-900 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-[3px] text-amber-500">{t.whyDemirPlan}</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white italic">
              {t.featuresTitle}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
              {t.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#121319] border border-gray-800/80 rounded-3xl p-6 md:p-8 space-y-4 hover:border-amber-500/30 transition-all group duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-2xl shrink-0 font-bold shadow-md">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{t.feat1Title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t.feat1Desc}
              </p>
              <ul className="space-y-2 pt-2 text-xs text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> {t.feat1Bullet1}</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> {t.feat1Bullet2}</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#121319] border border-gray-800/80 rounded-3xl p-6 md:p-8 space-y-4 hover:border-amber-500/30 transition-all group duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors" />
              <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center text-2xl shrink-0 font-bold shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{t.feat2Title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t.feat2Desc}
              </p>
              <ul className="space-y-2 pt-2 text-xs text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> {t.feat2Bullet1}</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> {t.feat2Bullet2}</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#121319] border border-gray-800/80 rounded-3xl p-6 md:p-8 space-y-4 hover:border-amber-500/30 transition-all group duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-2xl shrink-0 font-bold shadow-md">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{t.feat3Title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t.feat3Desc}
              </p>
              <ul className="space-y-2 pt-2 text-xs text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> {t.feat3Bullet1}</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> {t.feat3Bullet2}</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Advanced 1 */}
            <div className="bg-gradient-to-br from-[#121319] to-[#15161d] border border-gray-800/80 rounded-3xl p-6 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center font-bold shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">{t.feat4Title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t.feat4Desc}
                </p>
              </div>
            </div>

            {/* Advanced 2 */}
            <div className="bg-gradient-to-br from-[#121319] to-[#15161d] border border-gray-800/80 rounded-3xl p-6 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center font-bold shrink-0">
                <Music className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">{t.feat5Title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t.feat5Desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TƏTBİQ GÖRÜNÜŞÜ (MOCKUP DISPLAY) */}
      <section id="preview" className="py-20 px-4 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-[3px] text-amber-500">{t.appPreview}</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white italic">
            {t.previewTitle}
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            {t.previewSubtitle}
          </p>
        </div>

        {/* Dynamic Screen Mockup */}
        <div className="relative max-w-4xl mx-auto bg-[#131418] border border-gray-800 rounded-[2.5rem] p-3 md:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-black rounded-b-2xl z-20 flex items-center justify-center">
            <div className="w-12 h-1 bg-gray-800 rounded-full" />
            <div className="w-2.5 h-2.5 bg-gray-900 rounded-full ml-4" />
          </div>

          <div className="bg-[#181920] rounded-[2rem] overflow-hidden border border-gray-800/80 min-h-[500px] grid grid-cols-1 lg:grid-cols-12">
            
            {/* Phone Interface Left Sidebar preview */}
            <div className="lg:col-span-5 bg-[#121319] border-r border-gray-800/60 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-gray-950 font-black flex items-center justify-center text-xs">
                    K
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">Kamran Aliyev</span>
                    <span className="text-[9px] text-gray-500 block">{t.athleteBadge}</span>
                  </div>
                </div>

                <hr className="border-gray-800/60" />

                {/* Day Selector Mockup */}
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">{t.weeklyWorkoutDays}</span>
                <div className="grid grid-cols-4 gap-2">
                  {t.daysText.map((day, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2 rounded-xl text-center text-[10px] font-black border transition-colors ${
                        idx === 0 
                          ? "bg-amber-500/10 border-amber-500 text-amber-500" 
                          : "bg-[#16181f] border-gray-800 text-gray-400"
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Workout Card Mockup */}
                <div className="bg-[#1b1d24] border border-gray-800 rounded-2xl p-4 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white uppercase italic">{t.workoutMockTitle}</span>
                    <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">{t.workoutMockSize}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] text-gray-300">
                      <span>{t.workoutMockEx1}</span>
                      <span className="font-mono text-gray-500 font-bold">{t.workoutMockExSets1}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-gray-300">
                      <span>{t.workoutMockEx2}</span>
                      <span className="font-mono text-gray-500 font-bold">{t.workoutMockExSets2}</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#131418] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[45%]" />
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-500 animate-bounce shrink-0" />
                <span className="text-[10px] text-amber-500 font-bold leading-normal">
                  {t.motivationMockQuote}
                </span>
              </div>
            </div>

            {/* Phone Interface Right main area mock */}
            <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-6">
              {/* Chat simulation */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-xs font-black uppercase text-gray-400">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>{t.aiHubTitle}</span>
                </div>

                <div className="space-y-3 max-w-md">
                  <div className="bg-gray-800/40 border border-gray-800 rounded-2xl p-3.5 text-xs text-gray-300 rounded-tl-none self-start leading-relaxed">
                    {t.aiMessageMock1}
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-xs text-amber-400 rounded-tr-none self-end text-right ml-auto w-3/4">
                    {t.userMessageMock1}
                  </div>
                  <div className="bg-gray-800/40 border border-gray-800 rounded-2xl p-3.5 text-xs text-gray-300 rounded-tl-none self-start leading-relaxed">
                    <span className="font-bold text-amber-500 block mb-1">💡 AI Coach:</span>
                    {t.aiMessageMock2}
                  </div>
                </div>
              </div>

              {/* Status footer mockup */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#121319] p-3 rounded-2xl border border-gray-800/60 text-center">
                  <span className="text-[8px] text-gray-500 font-bold uppercase block">{t.targetCalorie}</span>
                  <span className="text-sm font-black text-white tracking-tight mt-0.5 block">2,450 kcal</span>
                </div>
                <div className="bg-[#121319] p-3 rounded-2xl border border-gray-800/60 text-center">
                  <span className="text-[8px] text-gray-500 font-bold uppercase block">{t.protein}</span>
                  <span className="text-sm font-black text-amber-500 tracking-tight mt-0.5 block">150 q</span>
                </div>
                <div className="bg-[#121319] p-3 rounded-2xl border border-gray-800/60 text-center">
                  <span className="text-[8px] text-gray-500 font-bold uppercase block">{t.workoutConsistency}</span>
                  <span className="text-sm font-black text-white tracking-tight mt-0.5 block">95% ✓</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* INTERACTIVE CALORIE CALCULATOR SECTION */}
      <section id="calculator" className="py-20 bg-gradient-to-b from-[#0b0c10] to-[#0f1118] border-t border-gray-950 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-[3px] text-amber-500">{t.calcTool}</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white italic">
              {t.calcTitle}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
              {t.calcSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-[#121319] border border-gray-800/80 rounded-3xl p-6 md:p-8 shadow-xl">
            
            {/* Calculator Form */}
            <form onSubmit={calculateKcal} className="md:col-span-7 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{t.gender}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCalcGender("m")}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        calcGender === "m" 
                          ? "bg-amber-500 text-gray-950 border-amber-500 font-black" 
                          : "bg-[#181920] border-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      {t.male}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcGender("f")}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        calcGender === "f" 
                          ? "bg-amber-500 text-gray-950 border-amber-500 font-black" 
                          : "bg-[#181920] border-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      {t.female}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{t.goal}</label>
                  <select
                    value={calcGoal}
                    onChange={(e) => setCalcGoal(e.target.value as any)}
                    className="w-full bg-[#181920] border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                  >
                    <option value="loss">{t.goalLoss}</option>
                    <option value="maintain">{t.goalMaintain}</option>
                    <option value="gain">{t.goalGain}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{t.weight}</label>
                  <input
                    type="number"
                    placeholder="75"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    className="w-full bg-[#181920] border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{t.height}</label>
                  <input
                    type="number"
                    placeholder="178"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(e.target.value)}
                    className="w-full bg-[#181920] border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{t.age}</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={calcAge}
                    onChange={(e) => setCalcAge(e.target.value)}
                    className="w-full bg-[#181920] border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{t.activityLevel}</label>
                <select
                  value={calcActivity}
                  onChange={(e) => setCalcActivity(e.target.value)}
                  className="w-full bg-[#181920] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="1.2">{t.act1}</option>
                  <option value="1.375">{t.act2}</option>
                  <option value="1.55">{t.act3}</option>
                  <option value="1.725">{t.act4}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <CalcIcon className="w-4 h-4" />
                <span>{t.btnCalculate}</span>
              </button>
            </form>

            {/* Calculator Results */}
            <div className="md:col-span-5 h-full flex flex-col justify-between bg-[#181920] border border-gray-800/80 rounded-2xl p-5 min-h-[280px]">
              {calcResults ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center pb-2.5 border-b border-gray-800/60">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.dailyTargetIntake}</span>
                    <span className="block text-3xl font-black text-amber-500 tracking-tight mt-1">
                      {calcResults.calories} <span className="text-xs font-normal text-gray-400">kcal</span>
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        {t.proteinLabel}
                      </span>
                      <span className="font-mono text-white font-black">{calcResults.protein} q</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        {t.carbsLabel}
                      </span>
                      <span className="font-mono text-white font-black">{calcResults.carbs} q</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        {t.fatsLabel}
                      </span>
                      <span className="font-mono text-white font-black">{calcResults.fat} q</span>
                    </div>
                  </div>

                  <hr className="border-gray-800/60" />

                  <div className="text-center">
                    <button 
                      onClick={() => onOpenAuth("register")}
                      className="text-[10px] text-amber-500 hover:underline font-black uppercase tracking-wider flex items-center justify-center gap-1 mx-auto cursor-pointer"
                    >
                      <span>{t.aiPlanLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-3">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-xl text-gray-500">
                    🧮
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase">{t.calcReadyTitle}</h5>
                    <p className="text-[10px] text-gray-400 leading-normal mt-1 max-w-xs mx-auto">
                      {t.calcReadyDesc}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* REAL USER TRANSFORMATIONS */}
      <section className="py-20 max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-[3px] text-amber-500">{t.transformationsTitle}</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white italic">
            {t.transformationsTitle}
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            {t.transformationsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Review 1 */}
          <div className="bg-[#121319] border border-gray-800/60 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-center">
            <div className="relative shrink-0 w-32 h-32 rounded-2xl bg-gradient-to-b from-amber-500/20 to-orange-500/10 border border-gray-800 flex items-center justify-center overflow-hidden">
              <span className="text-4xl">🔥</span>
              <div className="absolute bottom-1.5 left-1.5 bg-gray-950/80 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-amber-500 border border-amber-500/10">
                {t.t1Diff}
              </div>
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex justify-center sm:justify-start text-amber-500 text-sm">⭐⭐⭐⭐⭐</div>
              <p className="text-xs text-gray-300 italic leading-relaxed">
                {t.t1Quote}
              </p>
              <div>
                <span className="block text-xs font-black text-white">{t.t1User}</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">{t.t1UserSub}</span>
              </div>
            </div>
          </div>

          {/* Review 2 */}
          <div className="bg-[#121319] border border-gray-800/60 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-center">
            <div className="relative shrink-0 w-32 h-32 rounded-2xl bg-gradient-to-b from-amber-500/20 to-orange-500/10 border border-gray-800 flex items-center justify-center overflow-hidden">
              <span className="text-4xl">💪</span>
              <div className="absolute bottom-1.5 left-1.5 bg-gray-950/80 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-amber-500 border border-amber-500/10">
                {t.t2Diff}
              </div>
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex justify-center sm:justify-start text-amber-500 text-sm">⭐⭐⭐⭐⭐</div>
              <p className="text-xs text-gray-300 italic leading-relaxed">
                {t.t2Quote}
              </p>
              <div>
                <span className="block text-xs font-black text-white">{t.t2User}</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">{t.t2UserSub}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section id="pricing" className="py-20 bg-[#0e0f14]/80 border-t border-gray-950 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-[3px] text-amber-500">{t.pricing}</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white italic">
              {t.pricingTitle}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
              {t.pricingSubtitle}
            </p>
          </div>

          <div className="max-w-md mx-auto bg-[#121319] border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-xl shadow-amber-500/5">
            <div className="absolute top-0 right-0 bg-amber-500 text-gray-950 font-black text-[9px] uppercase tracking-wider py-1 px-4 rounded-bl-2xl">
              {t.sponsorFree}
            </div>

            <div className="space-y-2 text-center">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{t.unlimitedPremium}</h3>
              <p className="text-xs text-gray-400">{t.sponsorPartnership}</p>
              <span className="block text-4xl font-black italic text-white pt-2">₼0 <span className="text-xs font-semibold text-gray-500 italic">{t.lifetimeFree}</span></span>
            </div>

            <hr className="border-gray-800/60" />

            <div className="space-y-3 text-xs">
              {t.pricingBenefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onOpenAuth("register")}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all transform active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              {t.createAccountBtn}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 px-4 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-[3px] text-amber-500">{t.faq}</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white italic">
            {t.faqTitle}
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            {t.faqSubtitle}
          </p>
        </div>

        <div className="space-y-4">
          {t.faqsList.map((faqItem, idx) => (
            <div 
              key={idx} 
              className="bg-[#121319] border border-gray-800/60 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-white text-sm md:text-base hover:bg-gray-800/20 transition-colors cursor-pointer"
              >
                <span>{faqItem.q}</span>
                <HelpCircle className={`w-5 h-5 text-amber-500 shrink-0 transition-transform duration-300 ${faqOpen === idx ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {faqOpen === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-5 text-xs md:text-sm text-gray-400 leading-relaxed border-t border-gray-950/40 pt-4">
                      {faqItem.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-t from-[#0e0f14] to-[#0b0c10] border-t border-gray-950 px-4 text-center">
        <div className="max-w-3xl mx-auto bg-[#121319] border border-gray-800 rounded-[2rem] p-8 md:p-12 space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
          
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white italic">
            {t.ctaTitle}
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed font-medium">
            {t.ctaSubtitle}
          </p>

          <button 
            onClick={() => onOpenAuth("register")}
            className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-sm rounded-2xl transition-all shadow-xl shadow-amber-500/10 hover:shadow-amber-500/25 inline-flex items-center gap-2.5 transform active:scale-95 cursor-pointer"
          >
            <span>{t.startFreeNow}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-gray-900 bg-[#07080b]">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-7 h-7 bg-amber-500 text-gray-950 rounded-lg flex items-center justify-center font-black">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="text-base font-black italic tracking-tight text-white">
              DƏMİR<span className="text-amber-500">PLAN</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            {t.allRightsReserved}
          </p>
        </div>
      </footer>
    </div>
  );
}
