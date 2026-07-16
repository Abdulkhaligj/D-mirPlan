import React, { useState, useEffect } from "react";
import { Sparkles, BookOpen, Clock, Activity, CheckCircle2, ChevronRight, HelpCircle, Dumbbell, Play, Pause, ExternalLink } from "lucide-react";
import { WorkoutExercise, ExerciseGuide } from "../types";

interface ExerciseGuideViewProps {
  exercise: WorkoutExercise;
  onUpdateGuide: (guide: ExerciseGuide) => void;
  isPremium: boolean;
  onTriggerPayment: () => void;
  lang?: string;
}

export default function ExerciseGuideView({
  exercise,
  onUpdateGuide,
  isPremium,
  onTriggerPayment,
  lang = "az",
}: ExerciseGuideViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeGuideTab, setActiveGuideTab] = useState<"muscles" | "simulator" | "video">("simulator");
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(15);
  const [videoSpeed, setVideoSpeed] = useState<number>(1);

  const translations = {
    az: {
      tabSimulator: "🤖 Aİ Simulyasiya",
      tabVideo: "🎥 Video Təlimat",
      tabMuscles: "👤 Əzələ Fokusu",
      aiTrajectoryAnalysis: "Aİ TRAKTORİYA ANALİZİ",
      elbowAngle: "Dirsək: 75° (Təhlükəsiz)",
      speed: "Sürət: 0.45 m/s",
      loadDistribution: "YÜK PAYLANMASI",
      aiBiomechanicsDegree: "Aİ BİOMEXANİKA DƏRƏCƏSİ",
      hipAngle: "Künc Dərinliyi: 92°",
      kneeProtection: "Diz qorunması: Aktiv",
      heelPressure: "DABAN TƏZYİQİ",
      heelStable: "98% Stabil",
      backMuscleTension: "KÜRƏK ƏZƏLƏ GƏRGİNLİYİ",
      contraction: "Kontraksiya: 96%",
      amplitude: "Genişlik: Tam ROM",
      wristTension: "BİLƏK GƏRGİNLİYİ",
      optimal: "Optimal",
      armBiomechanicsAnalysis: "QOL BİOMEXANİKA ANALİZİ",
      flexion: "Bükülmə: 42° - 175°",
      peakTension: "Pik gərginlik: 98%",
      elbowPosition: "DİRSƏK VƏZİYYƏTİ",
      elbowStable: "Sabit (Stabil)",
      aiMovementGuide: "Aİ HƏRƏKƏT BƏLƏDÇİSİ",
      trajectoryActive: "Trayektoriya: Aktiv",
      stanceType: "DURUŞ NÖVÜ",
      optimalAndStable: "Optimal & Stabil",
      videoTitle: "Aİ TEXNİKA VİDEOSU",
      videoLoopActive: "VIDEO LOOP ACTIVE",
      step: "ADDIM",
      executionRule: "İcra qaydası:",
      pause: "PAUSE",
      play: "PLAY",
      speedBtn: "Sürət",
      youtubeBtn: "🎥 YouTube-da Düzgün Texnikanı İzlə",
      techniqueAndIllustration: "Məşq Texnikası & İllüstrasiya",
      guideSub: "Aİ tərəfindən hazırlanmış icra qaydası",
      openGuide: "Bələdçini Aç",
      analyzing: "Aİ hərəkət mexanikasını analiz edir...",
      analyzingSub: "Hərəkətin ən təhlükəsiz və effektiv icra bucaqları, düzgün tənəffüs fazaları hesablanır.",
      retryBtn: "Yenidən Cəhd Et",
      difficulty: "Çətinlik",
      executionPhases: "İcra mərhələləri",
      breathing: "💨 Nəfəs Alıb-Vermə",
      goldenRule: "💡 Qızıl Qayda",
      aiSimulator: "Aİ SİMULYATORU",
      angleLabel: "Bucağı",
      perfectBiomechanics: "Mükəmməl biomexanika",
      defaultError: "Aİ bələdçisi yüklənərkən xəta baş verdi.",
      otherMuscle: "Digər"
    },
    en: {
      tabSimulator: "🤖 AI Simulation",
      tabVideo: "🎥 Video Guide",
      tabMuscles: "👤 Muscle Focus",
      aiTrajectoryAnalysis: "AI TRAJECTORY ANALYSIS",
      elbowAngle: "Elbow: 75° (Safe)",
      speed: "Speed: 0.45 m/s",
      loadDistribution: "LOAD DISTRIBUTION",
      aiBiomechanicsDegree: "AI BIOMECHANICS DEGREE",
      hipAngle: "Depth Angle: 92°",
      kneeProtection: "Knee protection: Active",
      heelPressure: "HEEL PRESSURE",
      heelStable: "98% Stable",
      backMuscleTension: "BACK MUSCLE TENSION",
      contraction: "Contraction: 96%",
      amplitude: "Range: Full ROM",
      wristTension: "WRIST TENSION",
      optimal: "Optimal",
      armBiomechanicsAnalysis: "ARM BIOMECHANICS ANALYSIS",
      flexion: "Flexion: 42° - 175°",
      peakTension: "Peak tension: 98%",
      elbowPosition: "ELBOW POSITION",
      elbowStable: "Fixed (Stable)",
      aiMovementGuide: "AI MOVEMENT GUIDE",
      trajectoryActive: "Trajectory: Active",
      stanceType: "STANCE TYPE",
      optimalAndStable: "Optimal & Stable",
      videoTitle: "AI TECHNIQUE VIDEO",
      videoLoopActive: "VIDEO LOOP ACTIVE",
      step: "STEP",
      executionRule: "Execution rule:",
      pause: "PAUSE",
      play: "PLAY",
      speedBtn: "Speed",
      youtubeBtn: "🎥 Watch Correct Technique on YouTube",
      techniqueAndIllustration: "Exercise Technique & Illustration",
      guideSub: "Execution guide designed by AI",
      openGuide: "Open Guide",
      analyzing: "AI is analyzing movement mechanics...",
      analyzingSub: "Calculating safest & most effective movement angles and correct breathing phases.",
      retryBtn: "Try Again",
      difficulty: "Difficulty",
      executionPhases: "Execution Phases",
      breathing: "💨 Breathing",
      goldenRule: "💡 Golden Rule",
      aiSimulator: "AI SIMULATOR",
      angleLabel: "Angle",
      perfectBiomechanics: "Perfect biomechanics",
      defaultError: "Error occurred while loading AI guide.",
      otherMuscle: "Other"
    },
    ru: {
      tabSimulator: "🤖 ИИ Симуляция",
      tabVideo: "🎥 Видео Инструкция",
      tabMuscles: "👤 Фокус на Мышцы",
      aiTrajectoryAnalysis: "ИИ АНАЛИЗ ТРАЕКТОРИИ",
      elbowAngle: "Локоть: 75° (Безопасно)",
      speed: "Скорость: 0.45 м/с",
      loadDistribution: "РАСПРЕДЕЛЕНИЕ НАГРУЗКИ",
      aiBiomechanicsDegree: "ИИ ГРАДУС БИОМЕХАНИКИ",
      hipAngle: "Глубина угла: 92°",
      kneeProtection: "Защита коленей: Активна",
      heelPressure: "ДАВЛЕНИЕ НА ПЯТКУ",
      heelStable: "98% Стабильно",
      backMuscleTension: "НАПРЯЖЕНИЕ МЫШЦ СПИНЫ",
      contraction: "Сокращение: 96%",
      amplitude: "Амплитуда: Полная ROM",
      wristTension: "НАПРЯЖЕНИЕ ЗАПЯСТЬЯ",
      optimal: "Оптимально",
      armBiomechanicsAnalysis: "АНАЛИЗ БИОМЕХАНИКИ РУКИ",
      flexion: "Сгибание: 42° - 175°",
      peakTension: "Пиковое напряжение: 98%",
      elbowPosition: "ПОЛОЖЕНИЕ ЛОКТЯ",
      elbowStable: "Фиксировано (Стабильно)",
      aiMovementGuide: "ИИ РУКОВОДСТВО ДВИЖЕНИЯ",
      trajectoryActive: "Траектория: Активна",
      stanceType: "ТИП СТОЙКИ",
      optimalAndStable: "Оптимально и стабильно",
      videoTitle: "ИИ ВИДЕО ТЕХНИКИ",
      videoLoopActive: "ВИДЕОПОВТОР АКТИВЕН",
      step: "ШАГ",
      executionRule: "Правило выполнения:",
      pause: "ПАУЗА",
      play: "ИГРАТЬ",
      speedBtn: "Скорость",
      youtubeBtn: "🎥 Смотреть правильную технику на YouTube",
      techniqueAndIllustration: "Техника Упражнения и Иллюстрация",
      guideSub: "Руководство по выполнению, созданное ИИ",
      openGuide: "Открыть руководство",
      analyzing: "ИИ анализирует механику движений...",
      analyzingSub: "Рассчитываются наиболее безопасные и эффективные углы выполнения и правильные фазы дыхания.",
      retryBtn: "Попробовать снова",
      difficulty: "Сложность",
      executionPhases: "Этапы выполнения",
      breathing: "💨 Дыхание",
      goldenRule: "💡 Золотое Правило",
      aiSimulator: "ИИ СИМУЛЯТОР",
      angleLabel: "Угол",
      perfectBiomechanics: "Отличная биомеханика",
      defaultError: "Произошла ошибка при загрузке ИИ руководства.",
      otherMuscle: "Другое"
    }
  };

  const t = translations[lang === "ru" ? "ru" : lang === "en" ? "en" : "az"];

  useEffect(() => {
    let interval: any;
    if (activeGuideTab === "video" && isPlaying) {
      interval = setInterval(() => {
        setVideoProgress((prev) => {
          const next = prev + 3 * videoSpeed;
          return next >= 100 ? 0 : next;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [activeGuideTab, isPlaying, videoSpeed]);

  const fetchGuide = async () => {
    if (!isPremium) {
      onTriggerPayment();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/exercise-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseName: exercise.name }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      onUpdateGuide(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t.defaultError);
    } finally {
      setLoading(false);
    }
  };

  const muscle = exercise.guide?.muscleGroup || t.otherMuscle;

  // Check which muscles to highlight in our stylized SVG mannequin
  const isChest = muscle.toLowerCase().includes("sinə") || muscle.toLowerCase().includes("chest");
  const isBack = muscle.toLowerCase().includes("kürək") || muscle.toLowerCase().includes("back");
  const isLegs = muscle.toLowerCase().includes("ayaq") || muscle.toLowerCase().includes("legs");
  const isThigh = muscle.toLowerCase().includes("bud") || muscle.toLowerCase().includes("glute") || muscle.toLowerCase().includes("thigh");
  const isShoulders = muscle.toLowerCase().includes("çiyin") || muscle.toLowerCase().includes("shoulder");
  const isArms = muscle.toLowerCase().includes("qol") || muscle.toLowerCase().includes("arm") || muscle.toLowerCase().includes("biceps") || muscle.toLowerCase().includes("triceps");
  const isAbs = muscle.toLowerCase().includes("press") || muscle.toLowerCase().includes("abs") || muscle.toLowerCase().includes("abdominal");
  const isCardio = muscle.toLowerCase().includes("kardio") || muscle.toLowerCase().includes("cardio");

  const renderAIVisual = () => {
    const name = (exercise.name || "").toLowerCase();
    
    if (name.includes("bench") || name.includes("chest") || name.includes("push-up") || name.includes("fly") || (name.includes("press") && name.includes("chest"))) {
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full max-h-[150px] bg-[#0d0e12] rounded-xl">
          <style>{`
            @keyframes benchPress {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(28px); }
            }
            @keyframes barGlow {
              0%, 100% { filter: drop-shadow(0 0 2px rgba(245,158,11,0.4)); }
              50% { filter: drop-shadow(0 0 8px rgba(245,158,11,0.8)); }
            }
            .animate-bar { animation: benchPress 3s infinite ease-in-out; }
            .animate-glow { animation: barGlow 1.5s infinite ease-in-out; }
          `}</style>
          <line x1="40" y1="95" x2="160" y2="95" stroke="#2a2d34" strokeWidth="4" strokeLinecap="round" />
          <line x1="60" y1="95" x2="60" y2="110" stroke="#2a2d34" strokeWidth="4" />
          <line x1="140" y1="95" x2="140" y2="110" stroke="#2a2d34" strokeWidth="4" />
          <line x1="100" y1="65" x2="100" y2="95" stroke="#1f2128" strokeWidth="2" strokeDasharray="2,2" />
          <circle cx="100" cy="80" r="10" fill="#1b1d22" stroke="#2a2d34" strokeWidth="1.5" />
          <rect x="88" y="85" width="24" height="8" rx="2" fill="#141519" stroke="#2a2d34" strokeWidth="1.5" />
          <g className="animate-bar">
            <line x1="30" y1="45" x2="170" y2="45" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" className="animate-glow" />
            <rect x="35" y="32" width="10" height="26" rx="2" fill="#f59e0b" />
            <rect x="47" y="35" width="6" height="20" rx="1" fill="#d97706" />
            <rect x="155" y="32" width="10" height="26" rx="2" fill="#f59e0b" />
            <rect x="147" y="35" width="6" height="20" rx="1" fill="#d97706" />
            <line x1="100" y1="45" x2="100" y2="77" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
            <circle cx="100" cy="45" r="3" fill="#f59e0b" />
          </g>
          <text x="12" y="16" fill="#6b7280" className="text-[7px] font-mono font-bold tracking-widest uppercase">{t.aiTrajectoryAnalysis}</text>
          <text x="12" y="26" fill="#f59e0b" className="text-[8px] font-mono font-black uppercase tracking-wide">{t.elbowAngle}</text>
          <text x="12" y="36" fill="#10b981" className="text-[7px] font-mono font-bold uppercase tracking-wide">{t.speed}</text>
          <text x="188" y="16" fill="#6b7280" className="text-[7px] font-mono font-bold uppercase tracking-widest text-right" textAnchor="end">{t.loadDistribution}</text>
          <text x="188" y="26" fill="#10b981" className="text-[8px] font-mono font-black uppercase tracking-wide text-right" textAnchor="end">L: 50% | R: 50%</text>
        </svg>
      );
    } else if (name.includes("squat") || name.includes("lunge") || (name.includes("press") && name.includes("leg"))) {
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full max-h-[150px] bg-[#0d0e12] rounded-xl">
          <style>{`
            @keyframes squat {
              0%, 100% { transform: translateY(0px) scaleY(1); }
              50% { transform: translateY(22px) scaleY(0.78); }
            }
            .animate-squat { animation: squat 3.2s infinite ease-in-out; transform-origin: 100px 110px; }
          `}</style>
          <line x1="30" y1="110" x2="170" y2="110" stroke="#2a2d34" strokeWidth="3" strokeLinecap="round" />
          <g className="animate-squat">
            <line x1="100" y1="35" x2="100" y2="65" stroke="#94a3b8" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="100" cy="24" r="7" fill="#1b1d22" stroke="#2a2d34" strokeWidth="2" />
            <line x1="88" y1="65" x2="112" y2="65" stroke="#64748b" strokeWidth="3" />
            <line x1="88" y1="65" x2="80" y2="88" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            <line x1="112" y1="65" x2="120" y2="88" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            <line x1="80" y1="88" x2="88" y2="110" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <line x1="120" y1="88" x2="112" y2="110" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="38" r="4" fill="#f59e0b" />
            <line x1="50" y1="38" x2="150" y2="38" stroke="#64748b" strokeWidth="2" />
            <rect x="52" y="31" width="8" height="14" rx="1.5" fill="#f59e0b" />
            <rect x="140" y="31" width="8" height="14" rx="1.5" fill="#f59e0b" />
          </g>
          <text x="12" y="16" fill="#6b7280" className="text-[7px] font-mono font-bold tracking-widest uppercase">{t.aiBiomechanicsDegree}</text>
          <text x="12" y="26" fill="#f59e0b" className="text-[8px] font-mono font-black uppercase tracking-wide">{t.hipAngle}</text>
          <text x="12" y="36" fill="#10b981" className="text-[7px] font-mono font-bold uppercase tracking-wide">{t.kneeProtection}</text>
          <text x="188" y="16" fill="#6b7280" className="text-[7px] font-mono font-bold uppercase tracking-widest text-right" textAnchor="end">{t.heelPressure}</text>
          <text x="188" y="26" fill="#10b981" className="text-[8px] font-mono font-black uppercase tracking-wide text-right" textAnchor="end">{t.heelStable}</text>
        </svg>
      );
    } else if (name.includes("pull") || name.includes("lat") || name.includes("row") || name.includes("chin") || name.includes("deadlift")) {
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full max-h-[150px] bg-[#0d0e12] rounded-xl">
          <style>{`
            @keyframes pullup {
              0%, 100% { transform: translateY(20px); }
              50% { transform: translateY(0px); }
            }
            .animate-pull { animation: pullup 2.8s infinite ease-in-out; }
          `}</style>
          <line x1="30" y1="20" x2="170" y2="20" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <line x1="45" y1="20" x2="45" y2="10" stroke="#334155" strokeWidth="2.5" />
          <line x1="155" y1="20" x2="155" y2="10" stroke="#334155" strokeWidth="2.5" />
          <g className="animate-pull">
            <line x1="75" y1="20" x2="85" y2="35" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="125" y1="20" x2="115" y2="35" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="85" y1="35" x2="115" y2="35" stroke="#94a3b8" strokeWidth="3.5" />
            <circle cx="100" cy="28" r="6" fill="#1b1d22" stroke="#2a2d34" strokeWidth="1.5" />
            <line x1="100" y1="35" x2="100" y2="65" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="90" y1="65" x2="110" y2="65" stroke="#64748b" strokeWidth="2.5" />
            <line x1="92" y1="65" x2="94" y2="88" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="108" y1="65" x2="106" y2="88" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <text x="12" y="16" fill="#6b7280" className="text-[7px] font-mono font-bold tracking-widest uppercase">{t.backMuscleTension}</text>
          <text x="12" y="26" fill="#f59e0b" className="text-[8px] font-mono font-black uppercase tracking-wide">{t.contraction}</text>
          <text x="12" y="36" fill="#10b981" className="text-[7px] font-mono font-bold uppercase tracking-wide">{t.amplitude}</text>
          <text x="188" y="16" fill="#6b7280" className="text-[7px] font-mono font-bold uppercase tracking-widest text-right" textAnchor="end">{t.wristTension}</text>
          <text x="188" y="26" fill="#10b981" className="text-[8px] font-mono font-black uppercase tracking-wide text-right" textAnchor="end">{t.optimal}</text>
        </svg>
      );
    } else if (name.includes("curl") || name.includes("bicep") || name.includes("tricep") || name.includes("pushdown") || name.includes("arm")) {
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full max-h-[150px] bg-[#0d0e12] rounded-xl">
          <style>{`
            @keyframes armCurl {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-70deg); }
            }
            .animate-forearm { animation: armCurl 2.4s infinite ease-in-out; transform-origin: 85px 65px; }
          `}</style>
          <circle cx="85" cy="35" r="6" fill="#1b1d22" stroke="#2a2d34" strokeWidth="1.5" />
          <line x1="85" y1="35" x2="85" y2="65" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
          <circle cx="85" cy="65" r="4.5" fill="#f59e0b" />
          <g className="animate-forearm">
            <line x1="85" y1="65" x2="140" y2="65" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            <circle cx="140" cy="65" r="3.5" fill="#94a3b8" />
            <line x1="140" y1="52" x2="140" y2="78" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="136" y="50" width="8" height="5" rx="1" fill="#f59e0b" />
            <rect x="136" y="70" width="8" height="5" rx="1" fill="#f59e0b" />
            <path d="M 140,65 A 55,55 0 0,0 120,25" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" opacity="0.4" />
          </g>
          <text x="12" y="16" fill="#6b7280" className="text-[7px] font-mono font-bold tracking-widest uppercase">{t.armBiomechanicsAnalysis}</text>
          <text x="12" y="26" fill="#f59e0b" className="text-[8px] font-mono font-black uppercase tracking-wide">{t.flexion}</text>
          <text x="12" y="36" fill="#10b981" className="text-[7px] font-mono font-bold uppercase tracking-wide">{t.peakTension}</text>
          <text x="188" y="16" fill="#6b7280" className="text-[7px] font-mono font-bold uppercase tracking-widest text-right" textAnchor="end">{t.elbowPosition}</text>
          <text x="188" y="26" fill="#10b981" className="text-[8px] font-mono font-black uppercase tracking-wide text-right" textAnchor="end">{t.elbowStable}</text>
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full max-h-[150px] bg-[#0d0e12] rounded-xl">
          <style>{`
            @keyframes pulseLine {
              0%, 100% { transform: scale(0.95); opacity: 0.5; }
              50% { transform: scale(1.05); opacity: 0.9; }
            }
            @keyframes rotateRing {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .animate-pulse-sim { animation: pulseLine 2s infinite ease-in-out; transform-origin: 100px 60px; }
            .animate-rotate-sim { animation: rotateRing 15s infinite linear; transform-origin: 100px 60px; }
          `}</style>
          <circle cx="100" cy="60" r="45" stroke="#1f2128" strokeWidth="1" strokeDasharray="4,4" className="animate-rotate-sim" />
          <circle cx="100" cy="60" r="30" stroke="#1f2128" strokeWidth="0.5" />
          <circle cx="100" cy="60" r="15" stroke="#1f2128" strokeWidth="0.5" />
          <line x1="40" y1="60" x2="160" y2="60" stroke="#1f2128" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="100" y1="10" x2="100" y2="110" stroke="#1f2128" strokeWidth="0.5" strokeDasharray="2,2" />
          <g className="animate-pulse-sim">
            <circle cx="100" cy="60" r="10" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="100" cy="60" r="4" fill="#f59e0b" />
            <path d="M 85,45 L 85,50 M 85,45 L 90,45" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 115,45 L 115,50 M 115,45 L 110,45" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 85,75 L 85,70 M 85,75 L 90,75" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 115,75 L 115,70 M 115,75 L 110,75" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <text x="12" y="16" fill="#6b7280" className="text-[7px] font-mono font-bold tracking-widest uppercase">{t.aiMovementGuide}</text>
          <text x="12" y="26" fill="#f59e0b" className="text-[8px] font-mono font-black uppercase tracking-wide">{exercise.name}</text>
          <text x="12" y="36" fill="#10b981" className="text-[7px] font-mono font-bold uppercase tracking-wide">{t.trajectoryActive}</text>
          <text x="188" y="16" fill="#6b7280" className="text-[7px] font-mono font-bold uppercase tracking-widest text-right" textAnchor="end">{t.stanceType}</text>
          <text x="188" y="26" fill="#10b981" className="text-[8px] font-mono font-black uppercase tracking-wide text-right" textAnchor="end">{t.optimalAndStable}</text>
        </svg>
      );
    }
  };

  const renderVideoPlayer = () => {
    const stepsList = exercise.guide?.steps || [];
    const totalSteps = stepsList.length || 3;
    const currentStepIdx = Math.min(
      Math.floor((videoProgress / 100) * totalSteps),
      totalSteps - 1
    );
    const activeStepText = stepsList[currentStepIdx] || "";

    return (
      <div className="w-full bg-[#0d0e12] rounded-xl border border-[#2a2d34]/40 p-2 text-left space-y-2">
        <div className="relative aspect-video w-full bg-[#141519] rounded-lg overflow-hidden border border-[#2a2d34]/40 flex flex-col justify-between p-3">
          <div className="flex justify-between items-center z-10">
            <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-full border border-amber-500/20">
              {t.videoTitle}
            </span>
            <span className="text-[8px] font-mono text-gray-400 bg-black/50 px-1.5 py-0.5 rounded">
              HD 1080P
            </span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 select-none">
            <div className="w-32 h-32 rounded-full bg-amber-500/10 blur-xl animate-pulse" />
            <div className="text-center">
              <Dumbbell className="w-8 h-8 text-amber-500/50 mx-auto animate-bounce mb-1" />
              <div className="text-[9px] font-bold text-gray-500 font-mono">{t.videoLoopActive}</div>
            </div>
          </div>

          <div className="bg-black/85 backdrop-blur-md border border-[#2a2d34]/60 p-2 rounded-xl z-10 max-w-full">
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                {t.step} {currentStepIdx + 1}
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t.executionRule}</span>
            </div>
            <p className="text-[10px] text-white font-medium mt-1 leading-normal line-clamp-2">
              {activeStepText}
            </p>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-2 pt-6 flex flex-col gap-1.5">
            <div 
              className="w-full h-1 bg-[#2a2d34] rounded-full overflow-hidden cursor-pointer relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = Math.round((clickX / rect.width) * 100);
                setVideoProgress(pct);
              }}
            >
              <div 
                className="h-full bg-amber-500 transition-all duration-100" 
                style={{ width: `${videoProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:text-amber-500 transition-colors p-1 flex items-center gap-1 focus:outline-none"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3 fill-white" />
                      <span className="text-[9px] font-extrabold uppercase">{t.pause}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-white" />
                      <span className="text-[9px] font-extrabold uppercase">{t.play}</span>
                    </>
                  )}
                </button>
                <span className="text-[9px] font-mono text-gray-400">
                  00:{videoProgress < 10 ? `0${Math.floor(videoProgress/10)}` : Math.floor(videoProgress * 0.15).toString().padStart(2, '0')} / 00:15
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setVideoSpeed(prev => prev === 0.5 ? 1 : prev === 1 ? 1.5 : 0.5)}
                  className="text-[9px] font-mono font-black text-gray-400 hover:text-white bg-[#1b1d22] hover:bg-[#22242b] border border-[#2a2d34] px-1.5 py-0.5 rounded cursor-pointer"
                >
                  {videoSpeed}x {t.speedBtn}
                </button>
              </div>
            </div>
          </div>
        </div>

        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + " exercise technique tutorial")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 hover:border-red-600/60 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
        >
          <span>{t.youtubeBtn}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  };

  return (
    <div className="mt-4 border border-[#2a2d34]/60 bg-[#141519]/40 rounded-2xl p-4 space-y-4 text-left">
      {/* Header banner */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-bold animate-pulse">
            ✨
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t.techniqueAndIllustration}</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">{t.guideSub}</p>
          </div>
        </div>

        {!exercise.guide && !loading && (
          <button
            onClick={fetchGuide}
            className="py-1 px-3 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-gray-950 border border-amber-500/30 hover:border-amber-500 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" /> {t.openGuide}
          </button>
        )}
      </div>

      {loading && (
        <div className="py-8 text-center space-y-3 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/25 border-t-amber-500 animate-spin mx-auto" />
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {t.analyzing}
          </div>
          <p className="text-[9px] text-gray-500 max-w-[250px] mx-auto leading-relaxed">
            {t.analyzingSub}
          </p>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-center space-y-2">
          <p>{error}</p>
          <button
            onClick={fetchGuide}
            className="text-[10px] uppercase tracking-wider font-extrabold text-amber-500 hover:underline"
          >
            {t.retryBtn}
          </button>
        </div>
      )}

      {exercise.guide && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start animate-fade-in text-left">
          
          {/* Left Column: Interactive Visuals/Simulator/Video */}
          <div className="md:col-span-5 space-y-3">
            {/* Tab switcher */}
            <div className="flex bg-[#0d0e12] border border-[#2a2d34]/40 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveGuideTab("simulator")}
                className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                  activeGuideTab === "simulator"
                    ? "bg-amber-500 text-gray-950 font-black shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t.tabSimulator}
              </button>
              <button
                onClick={() => setActiveGuideTab("video")}
                className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                  activeGuideTab === "video"
                    ? "bg-amber-500 text-gray-950 font-black shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t.tabVideo}
              </button>
              <button
                onClick={() => setActiveGuideTab("muscles")}
                className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                  activeGuideTab === "muscles"
                    ? "bg-amber-500 text-gray-950 font-black shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t.tabMuscles}
              </button>
            </div>

            {/* Display active tab content */}
            {activeGuideTab === "simulator" && (
              <div className="space-y-2 text-left">
                <div className="bg-[#0d0e12] border border-[#2a2d34]/40 rounded-xl p-3 flex flex-col items-center justify-center relative min-h-[180px]">
                  <span className="absolute top-2 left-2 text-[8px] font-black uppercase tracking-widest text-gray-500 bg-[#181a20] px-1.5 py-0.5 rounded-md border border-[#2a2d34]/60">
                    {muscle}
                  </span>

                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">{t.aiSimulator}</span>
                  </div>

                  <div className="w-full flex items-center justify-center py-2 min-h-[140px]">
                    {renderAIVisual()}
                  </div>

                  <span className="text-[8px] text-gray-500 font-bold mt-2 font-mono uppercase tracking-widest flex items-center gap-1">
                    <Activity className="w-3 h-3 text-amber-500 animate-pulse" />
                    {t.angleLabel}: <span className="text-amber-500">{t.perfectBiomechanics}</span>
                  </span>
                </div>
              </div>
            )}

            {activeGuideTab === "video" && renderVideoPlayer()}

            {activeGuideTab === "muscles" && (
              <div className="bg-[#0d0e12] border border-[#2a2d34]/40 rounded-xl p-3 flex flex-col items-center justify-center relative min-h-[180px] text-left">
                <span className="absolute top-2 left-2 text-[8px] font-black uppercase tracking-widest text-gray-500 bg-[#181a20] px-1.5 py-0.5 rounded-md border border-[#2a2d34]/60">
                  {muscle}
                </span>

                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-[8px] font-bold text-amber-500 uppercase tracking-wider">{t.tabMuscles}</span>
                </div>

                {/* Stylized Futuristic Muscular System SVG */}
                <svg viewBox="0 0 100 160" className="w-24 h-36 mt-4">
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Background grid lines */}
                  <line x1="10" y1="20" x2="90" y2="20" stroke="#1f2128" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="#1f2128" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="10" y1="80" x2="90" y2="80" stroke="#1f2128" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="10" y1="110" x2="90" y2="110" stroke="#1f2128" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="50" y1="10" x2="50" y2="150" stroke="#1f2128" strokeWidth="0.5" strokeDasharray="2,2" />

                  {/* Head */}
                  <circle cx="50" cy="22" r="7" className="stroke-[#2a2d34] fill-[#141519]" strokeWidth="1.5" />
                  
                  {/* Spine/Core structure */}
                  <line x1="50" y1="29" x2="50" y2="75" className="stroke-[#2a2d34]" strokeWidth="1.5" />

                  {/* Shoulders */}
                  <path
                    d="M 33,38 A 12,12 0 0,1 67,38"
                    className={`fill-none stroke-2 ${isShoulders ? "stroke-amber-500 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]" : "stroke-[#2a2d34]"}`}
                  />

                  {/* Chest (Pectorals) */}
                  <path
                    d="M 38,40 Q 50,48 62,40 Q 60,54 50,54 Q 40,54 38,40 Z"
                    className={`transition-all duration-500 ${
                      isChest 
                        ? "fill-amber-500/25 stroke-amber-500 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" 
                        : "fill-[#141519] stroke-[#2a2d34]"
                    }`}
                    strokeWidth="1.5"
                  />

                  {/* Abs (Rectus Abdominis) */}
                  <rect
                    x="44" y="57" width="12" height="15" rx="2"
                    className={`transition-all duration-500 ${
                      isAbs 
                        ? "fill-amber-500/25 stroke-amber-500 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" 
                        : "fill-[#141519] stroke-[#2a2d34]"
                    }`}
                    strokeWidth="1.5"
                  />

                  {/* Arms (Biceps/Triceps) */}
                  {/* Left Arm */}
                  <path
                    d="M 33,38 L 26,56 L 22,70"
                    className={`fill-none stroke-2 transition-all duration-500 ${isArms ? "stroke-amber-500 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" : "stroke-[#2a2d34]"}`}
                  />
                  {/* Right Arm */}
                  <path
                    d="M 67,38 L 74,56 L 78,70"
                    className={`fill-none stroke-2 transition-all duration-500 ${isArms ? "stroke-amber-500 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" : "stroke-[#2a2d34]"}`}
                  />

                  {/* Back (Lats/Traps schematically highlighted behind) */}
                  <path
                    d="M 34,42 Q 50,45 66,42 Q 62,60 50,68 Q 38,60 34,42"
                    className={`opacity-30 fill-none stroke-[3] transition-all duration-500 ${isBack ? "stroke-amber-500" : "stroke-transparent"}`}
                  />

                  {/* Pelvis/Hips */}
                  <polygon points="36,75 64,75 58,85 42,85" className="stroke-[#2a2d34] fill-[#141519]" strokeWidth="1.5" />

                  {/* Thighs/Glutes */}
                  {/* Left Thigh */}
                  <path
                    d="M 40,85 L 37,115"
                    className={`fill-none stroke-[3] transition-all duration-500 ${
                      isLegs || isThigh 
                        ? "stroke-amber-500 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" 
                        : "stroke-[#2a2d34]"
                    }`}
                  />
                  {/* Right Thigh */}
                  <path
                    d="M 60,85 L 63,115"
                    className={`fill-none stroke-[3] transition-all duration-500 ${
                      isLegs || isThigh 
                        ? "stroke-amber-500 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" 
                        : "stroke-[#2a2d34]"
                    }`}
                  />

                  {/* Calves/Lower Legs */}
                  {/* Left calf */}
                  <path
                    d="M 37,115 L 39,145"
                    className={`fill-none stroke-[2] transition-all duration-500 ${
                      isLegs 
                        ? "stroke-amber-500 filter drop-shadow-[0_0_5px_rgba(245,158,11,0.4)]" 
                        : "stroke-[#2a2d34]"
                    }`}
                  />
                  {/* Right calf */}
                  <path
                    d="M 63,115 L 61,145"
                    className={`fill-none stroke-[2] transition-all duration-500 ${
                      isLegs 
                        ? "stroke-amber-500 filter drop-shadow-[0_0_5px_rgba(245,158,11,0.4)]" 
                        : "stroke-[#2a2d34]"
                    }`}
                  />

                  {/* Heart/Lungs (Kardio icon pulsing schematically) */}
                  <circle
                    cx="50" cy="42" r="3"
                    className={`transition-all duration-500 ${isCardio ? "fill-red-500 animate-ping" : "fill-transparent"}`}
                  />
                  <circle
                    cx="50" cy="42" r="2"
                    className={`transition-all duration-500 ${isCardio ? "fill-red-400" : "fill-transparent"}`}
                  />
                </svg>

                <span className="text-[9px] text-gray-500 font-bold mt-2 font-mono uppercase tracking-widest flex items-center gap-1">
                  <Activity className="w-3 h-3 text-amber-500" />
                  {t.difficulty}: <span className="text-amber-500">{exercise.guide.difficulty}</span>
                </span>
              </div>
            )}
          </div>

          {/* Detailed instruction checklist */}
          <div className="md:col-span-7 space-y-3 text-left">
            {/* Step-by-Step execution */}
            <div className="space-y-2">
              <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest block mb-1">
                {t.executionPhases}
              </span>
              <div className="space-y-2 bg-[#1b1d22]/50 border border-[#2a2d34]/40 rounded-xl p-3">
                {exercise.guide.steps.map((step, sIdx) => (
                  <div key={sIdx} className="flex gap-2.5 items-start">
                    <span className="w-4 h-4 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25 flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Breathing and Tips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Breathing */}
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 space-y-1">
                <span className="text-[8px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1">
                  {t.breathing}
                </span>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  {exercise.guide.breathing}
                </p>
              </div>

              {/* Pro Tip */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 space-y-1">
                <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  {t.goldenRule}
                </span>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  {exercise.guide.tip}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
