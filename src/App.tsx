import React, { useState, useEffect, useRef } from "react";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  WorkoutDay,
  WorkoutLogs,
  MeasurementEntry,
  NutritionData,
  BodyFatNavy,
  BodyFatAI,
  ChatMessage,
  PremiumInfo,
  PublicConfig,
  UserState,
  ReminderSettings,
} from "./types";
import Login from "./components/Login";
import MarketingSite from "./components/MarketingSite";
import { Language, translations } from "./utils/translations";
import Program from "./components/Program";
import Nutrition from "./components/Nutrition";
import Chat from "./components/Chat";
import ChallengesHub from "./components/ChallengesHub";
import BodyFat from "./components/BodyFat";
import BodyMeasurements from "./components/BodyMeasurements";
import History from "./components/History";
import Admin from "./components/Admin";
import PaymentModal from "./components/PaymentModal";
import MyPayments from "./components/MyPayments";
import ConsistencyCalendar from "./components/ConsistencyCalendar";
import Leaderboard from "./components/Leaderboard";
import FocusMusic from "./components/FocusMusic";
import WeightProgressRing from "./components/WeightProgressRing";
import HealthSync from "./components/HealthSync";
import { calculateWeeklyVolume } from "./utils/volume";
import { Dumbbell, LogOut, ShieldCheck, Crown, Sparkles, RefreshCw, RefreshCw as SyncIcon, Bell, BellOff, Clock, Calendar, X, Utensils, MessageSquare, TrendingUp, Music, ArrowRight, Trophy, Target, CreditCard } from "lucide-react";

const ADMIN_EMAIL = "abdulkhaligj@gmail.com";

const DEFAULT_NUTRI: NutritionData = {
  age: "",
  gender: "m",
  activity: "1.375",
  goal: "maintain",
};

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Theme & Marketing Toggles
  const theme = "slate";
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("demirplan_lang") as Language) || "ru";
  });
  const [viewMode, setViewMode] = useState<"platform" | "website">("platform");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  useEffect(() => {
    localStorage.setItem("demirplan_lang", lang);
  }, [lang]);

  // App Tabs & Navigation
  const [activeTab, setActiveTab] = useState<string>("program");
  const [progressTab, setProgressTab] = useState<string>("leaderboard");
  const [activeDay, setActiveDay] = useState<number>(0);
  const [editMode, setEditMode] = useState<boolean>(false);

  // States
  const [program, setProgram] = useState<WorkoutDay[]>([]);
  const [logs, setLogs] = useState<WorkoutLogs>({});
  const [body, setBody] = useState<MeasurementEntry[]>([]);
  const [nutri, setNutri] = useState<NutritionData>(DEFAULT_NUTRI);
  const [bf, setBf] = useState<BodyFatNavy | null>(null);
  const [ai, setAi] = useState<BodyFatAI | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [reminders, setReminders] = useState<ReminderSettings>({
    enabled: false,
    time: "18:00",
    days: [1, 3, 5],
    browserNotifications: false,
    waterEnabled: false,
    waterIntervalHours: 2,
    waterStartTime: "08:00",
    waterEndTime: "22:00",
  });
  const [updatedAt, setUpdatedAt] = useState<number>(0);

  // Premium & Public configurations
  const [premiumInfo, setPremiumInfo] = useState<PremiumInfo>({
    premium: true,
    premiumUntil: null,
    plan: "Ödənişsiz Sınırsız",
  });
  const [publicConfig, setPublicConfig] = useState<PublicConfig>({
    paymentLink: "",
    price: "₼4.99/ay",
    whatsapp: "",
    cardNo: "",
    cardHolder: "",
    cardBank: "",
  });

  // UI Control states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [syncPending, setSyncPending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [showWorkoutAlert, setShowWorkoutAlert] = useState(false);

  const syncTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. Toast triggers
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 2. Fetch initial Configurations
  const loadPublicConfigAndPremium = async (uid: string) => {
    try {
      // Fetch public checkout config
      let pubDoc;
      try {
        pubDoc = await getDoc(doc(db, "config", "public"));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "config/public");
        return;
      }

      if (pubDoc && pubDoc.exists()) {
        const d = pubDoc.data() as any;
        setPublicConfig({
          paymentLink: d.paymentLink || "",
          price: d.price || "₼4.99/ay",
          whatsapp: d.whatsapp || "",
          cardNo: d.cardNo || "",
          cardHolder: d.cardHolder || "",
          cardBank: d.cardBank || "",
        });
      } else {
        // Document does not exist yet — auto-seed with default Azerbaijani localization
        const seedData = {
          paymentLink: "https://m10.az",
          price: "₼4.99/ay",
          whatsapp: "+994508248404",
          cardNo: "4169 7388 1234 5678",
          cardHolder: "ABDULKHALIG J.",
          cardBank: "Leo Bank / Kapital Bank",
        };
        try {
          await setDoc(doc(db, "config", "public"), seedData);
          setPublicConfig(seedData);
        } catch (seedErr) {
          console.error("Auto-seeding public config failed:", seedErr);
        }
      }

      // Read real Premium status from users/{uid} document
      let userDoc;
      try {
        userDoc = await getDoc(doc(db, "users", uid));
      } catch (err) {
        console.error("Error reading user premium status:", err);
      }

      if (userDoc && userDoc.exists()) {
        const uData = userDoc.data();
        setPremiumInfo({
          premium: uData.premium === true,
          premiumUntil: uData.premiumUntil || null,
          plan: uData.premiumPlan || "Giriş Səviyyə",
        });
      } else {
        setPremiumInfo({
          premium: false,
          premiumUntil: null,
          plan: "Ödənişsiz",
        });
      }
    } catch (err) {
      console.error("Error loading config/premium:", err);
    }
  };

  // 3. Local Storage Helpers
  const getLocalKey = (uid: string) => `dpp-v2-${uid}`;

  const loadLocalState = (uid: string) => {
    try {
      const saved = localStorage.getItem(getLocalKey(uid));
      if (saved) {
        const parsed = JSON.parse(saved) as UserState;
        if (parsed.program) setProgram(parsed.program);
        if (parsed.logs) setLogs(parsed.logs);
        if (parsed.body) setBody(parsed.body);
        if (parsed.nutri) setNutri(parsed.nutri);
        if (parsed.bf !== undefined) setBf(parsed.bf);
        if (parsed.ai !== undefined) setAi(parsed.ai);
        if (parsed.chat) setChat(parsed.chat);
        if (parsed.reminders) setReminders(parsed.reminders);
        if (parsed._updatedAt) setUpdatedAt(parsed._updatedAt);
        return parsed._updatedAt || 0;
      }
    } catch (e) {
      console.error("Local load error:", e);
    }
    return 0;
  };

  const saveLocalState = (uid: string, stamp: number) => {
    try {
      const data: UserState = {
        program,
        logs,
        body,
        nutri,
        bf,
        ai,
        chat,
        reminders,
        _updatedAt: stamp,
      };
      localStorage.setItem(getLocalKey(uid), JSON.stringify(data));
    } catch (e) {
      console.error("Local save error:", e);
    }
  };

  // 4. Firestore Sync Engine
  const pushToCloud = async (uid: string, stamp: number, customUser?: any) => {
    if (!uid) return;
    setSyncPending(true);
    try {
      const latestMeasure = body.length ? [...body].sort((a, b) => b.date.localeCompare(a.date))[0] : null;
      const activeUser = customUser || auth.currentUser || user;

      await setDoc(
        doc(db, "users", uid),
        {
          email: activeUser?.email || "",
          name: activeUser?.displayName || "",
          updatedAt: stamp,
          lastActive: Date.now(),
          weight: latestMeasure?.weight || null,
          programDays: program.length,
          data: {
            program,
            logs,
            body,
            nutri,
            bf,
            ai,
            chat,
            reminders,
            _updatedAt: stamp,
          },
        },
        { merge: true }
      );

      // Calculate and update weekly volume in the leaderboard collection
      const weeklyVolume = calculateWeeklyVolume(logs);
      const name = activeUser?.displayName || activeUser?.email?.split("@")[0] || "Anonim Qəhrəman";
      try {
        await setDoc(
          doc(db, "leaderboard", uid),
          {
            userId: uid,
            name,
            weeklyVolume,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      } catch (leaderboardErr) {
        console.error("Failed to update leaderboard:", leaderboardErr);
      }

      setSyncPending(false);
    } catch (err: any) {
      setSyncPending(false);
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }
  };

  const pullFromCloud = async (uid: string, localStamp: number, activeUser?: any) => {
    try {
      let docSnap;
      try {
        docSnap = await getDoc(doc(db, "users", uid));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${uid}`);
        return;
      }

      if (docSnap && docSnap.exists()) {
        const cloud = docSnap.data();
        const cloudData = cloud?.data as UserState | undefined;
        const cloudStamp = cloudData?._updatedAt || 0;

        if (cloudData && cloudStamp > localStamp) {
          if (cloudData.program) setProgram(cloudData.program);
          if (cloudData.logs) setLogs(cloudData.logs);
          if (cloudData.body) setBody(cloudData.body);
          if (cloudData.nutri) setNutri(cloudData.nutri);
          if (cloudData.bf !== undefined) setBf(cloudData.bf);
          if (cloudData.ai !== undefined) setAi(cloudData.ai);
          if (cloudData.chat) setChat(cloudData.chat);
          if (cloudData.reminders) setReminders(cloudData.reminders);
          setUpdatedAt(cloudStamp);

          // Save synced data locally too
          const dataToSave = { ...cloudData };
          localStorage.setItem(getLocalKey(uid), JSON.stringify(dataToSave));
          triggerToast("Məlumatlarınız buluddan yükləndi ☁️");
        } else {
          // Cloud is older, push local state
          pushToCloud(uid, localStamp || Date.now(), activeUser);
        }
      } else {
        // No document in cloud yet, push first local state
        pushToCloud(uid, localStamp || Date.now(), activeUser);
      }
    } catch (err) {
      console.error("Firestore pull error:", err);
    }
  };

  // 5. App State Triggers for Sync
  const triggerStateChange = () => {
    const activeUser = auth.currentUser || user;
    if (!activeUser) return;
    const stamp = Date.now();
    setUpdatedAt(stamp);
    saveLocalState(activeUser.uid, stamp);

    // Schedule debounced Firestore write
    if (syncTimer.current) clearTimeout(syncTimer.current);
    setSyncPending(true);
    syncTimer.current = setTimeout(() => {
      pushToCloud(activeUser.uid, stamp);
    }, 2000);
  };

  // Hook listeners to sync
  useEffect(() => {
    if (!authChecked || !user) return;
    triggerStateChange();
  }, [program, logs, body, nutri, bf, ai, chat, reminders]);

  // Workout Reminder Checking Engine
  const checkWorkoutReminder = () => {
    if (!reminders || !reminders.enabled) return;

    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Bazar, 1 = Bazar ertəsi, 2 = Çərşənbə axşamı, 3 = Çərşənbə, 4 = Cümə axşamı, 5 = Cümə, 6 = Şənbə
    
    if (!reminders.days.includes(currentDayOfWeek)) return;

    // YYYY-MM-DD
    const todayStr = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    if (reminders.lastNotifiedDate === todayStr) return;

    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    const [setHour, setMin] = (reminders.time || "18:00").split(":").map(Number);

    if (currentHour > setHour || (currentHour === setHour && currentMin >= setMin)) {
      // Check snooze
      const snoozedUntil = localStorage.getItem("dpp-snoozed-until");
      if (snoozedUntil && Date.now() < Number(snoozedUntil)) {
        return;
      }

      setShowWorkoutAlert(true);

      if (reminders.browserNotifications && typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          try {
            new Notification("DƏMİRPLAN — Məşq Zamanı! 🏋️‍♂️🔥", {
              body: "Bugünkü məşq vaxtınız gəldi! Proqramınızı görmək və qeyd etmək üçün tətbiqi açın. 💪",
              icon: "/favicon.ico"
            });
          } catch (err) {
            console.error("Notification trigger failed:", err);
          }
        }
      }
    }
  };

  // Water Intake Reminder Checking Engine
  const checkWaterReminder = () => {
    if (!reminders || !reminders.waterEnabled) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentMinutes = currentHour * 60 + currentMin;

    const [startHour, startMin] = (reminders.waterStartTime || "08:00").split(":").map(Number);
    const [endHour, endMin] = (reminders.waterEndTime || "22:00").split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Only remind within set hours
    if (currentMinutes < startMinutes || currentMinutes > endMinutes) return;

    const intervalMs = (reminders.waterIntervalHours || 2) * 60 * 60 * 1000;
    const lastNotified = reminders.lastWaterNotifiedTimestamp || 0;

    if (Date.now() - lastNotified >= intervalMs) {
      if (reminders.browserNotifications && typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          try {
            new Notification("DƏMİRPLAN — Su Vaxtıdır! 💧", {
              body: "Bədəninizin su balansını (hidratasiyasını) qorumaq üçün indi bir stəkan su için! 🥤💪",
              icon: "/favicon.ico"
            });
          } catch (err) {
            console.error("Water notification failed:", err);
          }
        }
      }

      triggerToast("Su vaxtıdır! 💧 Sağlamlığınız və inkişafınız üçün indi bir stəkan su için. 🥤");

      setReminders(prev => ({
        ...prev,
        lastWaterNotifiedTimestamp: Date.now()
      }));
    }
  };

  useEffect(() => {
    if (!authChecked || !user) return;
    if (!reminders.enabled && !reminders.waterEnabled) return;

    // Run first checks on load
    checkWorkoutReminder();
    checkWaterReminder();

    const interval = setInterval(() => {
      checkWorkoutReminder();
      checkWaterReminder();
    }, 20000); // Check every 20 seconds

    return () => clearInterval(interval);
  }, [user, reminders, authChecked]);

  // Auth setup listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const localStamp = loadLocalState(u.uid);
        await pullFromCloud(u.uid, localStamp, u);
        await loadPublicConfigAndPremium(u.uid);
      } else {
        setUser(null);
      }
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    if (confirm("Çıxış etmək istədiyinizə əminsiniz?")) {
      await signOut(auth);
    }
  };

  const handlePaymentSuccess = async (plan: string, premiumUntil: number | null) => {
    if (!user) return;
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          premium: true,
          premiumUntil,
          premiumPlan: plan,
        },
        { merge: true }
      );

      setPremiumInfo({
        premium: true,
        premiumUntil,
        plan,
      });

      setShowPaymentModal(false);
      triggerToast("Premium dərhal aktivləşdirildi! 🎉");
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const isPremiumActive = () => {
    const isUserAdmin = user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    if (isUserAdmin) return true;
    if (!premiumInfo.premium) return false;
    if (premiumInfo.premiumUntil && Date.now() > premiumInfo.premiumUntil) return false;
    return true;
  };

  const latestMeasure = body.length ? [...body].sort((a, b) => b.date.localeCompare(a.date))[0] : null;

  const buildCoachContext = () => {
    const w = latestMeasure?.weight;
    const ht = latestMeasure?.height;
    const goalName = nutri.goal === "cut" ? "arıqlama" : nutri.goal === "bulk" ? "kütlə yığma" : "formanı saxlama";

    return `Sən "DəmirPlan" tətbiqinin ağıllı fitness məsləhətçisisən. İstifadəçinin bədən ölçüləri:
${w ? `- Çəki: ${w} kq` : ""}${ht ? `, Boy: ${ht} sm` : ""}${nutri.age ? `, Yaş: ${nutri.age}` : ""}.
Məqsədi: ${goalName}.
Cari meşq proqramında ${program.length} gün var.`;
  };

  const isAdmin = user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!authChecked) {
    return (
      <div className="min-h-[100dvh] bg-[#131417] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-semibold">
            {lang === "az" ? "Tətbiq yüklənir..." : lang === "ru" ? "Приложение загружается..." : "App is loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`theme-${theme}`}>
        <MarketingSite
          lang={lang}
          onLanguageChange={setLang}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode || "login");
            setShowLoginModal(true);
          }}
        />
        {showLoginModal && (
          <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="relative w-full max-w-md">
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2.5 bg-[#1b1d22]/90 border border-[#2a2d34] rounded-2xl transition-all z-50 cursor-pointer shadow-xl hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>
              <Login onSuccess={() => setShowLoginModal(false)} defaultMode={authModalMode} lang={lang} />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (viewMode === "website") {
    return (
      <div className={`theme-${theme}`}>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setViewMode("platform")}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-2xl border border-amber-400 cursor-pointer transition-all hover:scale-105"
          >
            <Dumbbell className="w-4 h-4" />
            <span>{translations[lang].backToPlatform}</span>
          </button>
        </div>
        <MarketingSite lang={lang} onLanguageChange={setLang} onOpenAuth={() => setViewMode("platform")} />
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] bg-theme-main text-theme-secondary pb-[calc(6rem+env(safe-area-inset-bottom,0px))] font-sans antialiased theme-${theme}`}>
      {/* Dynamic Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-theme-accent text-gray-950 px-5 py-3 rounded-xl font-bold text-xs tracking-wide shadow-2xl z-50 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Header Block */}
        <header className="flex justify-between items-end pb-1 border-b border-theme-card/40">
          <div>
            <div className="text-[10px] tracking-[4px] text-theme-secondary font-semibold uppercase">{translations[lang].slogan}</div>
            <h1 className="text-3xl font-black italic tracking-tight text-theme-primary">
              DƏMİR<span className="text-theme-accent">PLAN</span>
            </h1>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-theme-secondary font-bold uppercase tracking-wider block">{translations[lang].latestWeight}</span>
            <span className="text-base font-black text-theme-accent">
              {latestMeasure?.weight ? `${latestMeasure.weight} ${lang === "ru" ? "кг" : "kq"}` : "—"}
            </span>
          </div>
        </header>

        {/* Localization & Showcase Control */}
        <div className="bg-theme-card border border-theme-card rounded-2xl p-3 flex flex-col gap-3 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Control Panel Title */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-theme-secondary tracking-wider">
                {lang === "az" ? "Dil Seçimi" : lang === "ru" ? "Выбор Языка" : lang === "de" ? "Sprachauswahl" : "Select Language"}
              </span>
            </div>

            {/* Language switch button group */}
            <div className="flex items-center gap-1.5 bg-[#121319]/50 border border-theme-card/30 rounded-xl p-1 shrink-0 font-bold">
              {[
                { id: "az", flag: "🇦🇿", label: "AZ" },
                { id: "en", flag: "🇬🇧", label: "EN" },
                { id: "de", flag: "🇩🇪", label: "DE" },
                { id: "ru", flag: "🇷🇺", label: "RU" }
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLang(l.id as any);
                    triggerToast(
                      l.id === "az"
                        ? "Azərbaycan dili seçildi! 🇦🇿"
                        : l.id === "ru"
                        ? "Выбран русский язык! 🇷🇺"
                        : l.id === "de"
                        ? "Deutsch wurde ausgewählt! 🇩🇪"
                        : "English language selected! 🇬🇧"
                    );
                  }}
                  className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    lang === l.id 
                      ? "bg-theme-accent text-gray-950 font-extrabold" 
                      : "text-theme-secondary hover:text-theme-primary bg-theme-main/20"
                  }`}
                >
                  <span>{l.flag}</span>
                  <span className="text-[9px]">{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-theme-card/30 pt-2 text-[10px] text-theme-secondary font-bold">
            <span>{isPremiumActive() ? translations[lang].premiumVerified : (lang === "az" ? "Limitsiz Ödənişsiz Sürət" : lang === "ru" ? "Бесплатный безлимитный доступ" : "Free Unlimited Access")}</span>
            <button
              onClick={() => {
                setViewMode("website");
                triggerToast(lang === "az" ? "DəmirPlan Pro tanıtım saytına keçid edildi! 🌐" : lang === "ru" ? "Переход на промо-сайт! 🌐" : "Redirected to product site! 🌐");
              }}
              className="flex items-center gap-1 py-1 px-2.5 bg-theme-accent-10 hover:bg-theme-accent-20 text-theme-accent font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all border border-theme-accent-20 cursor-pointer"
            >
              <span>{translations[lang].landingPage}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* User Card row */}
        <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md">
          <div className="w-10 h-10 bg-amber-500 text-gray-950 font-black rounded-xl flex items-center justify-center text-base uppercase shrink-0">
            {(user.displayName || user.email || "?").charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm truncate flex items-center gap-1">
              {isPremiumActive() && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
              <span>{user.displayName || user.email.split("@")[0]}</span>
            </div>
            <p className="text-[10px] text-gray-500 truncate mt-0.5">{user.email}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                syncPending ? "bg-amber-500 animate-ping" : "bg-emerald-400"
              }`}
              title={syncPending ? (lang === "az" ? "Sinxronizasiya gözlənilir..." : lang === "ru" ? "Синхронизация ожидается..." : "Sync pending...") : (lang === "az" ? "Sinxronizasiya tamdır ✓" : lang === "ru" ? "Синхронизировано ✓" : "Synced ✓")}
            />
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab("admin");
                  setEditMode(false);
                }}
                className="py-1 px-2.5 bg-amber-500 text-gray-950 font-black text-[10px] rounded-lg cursor-pointer uppercase tracking-wider"
              >
                👑 {translations[lang].adminPanel}
              </button>
            )}
            <button
              onClick={() => setShowReminderSettings(true)}
              className={`p-2 border rounded-xl cursor-pointer transition-all relative ${
                reminders?.enabled
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20"
                  : "bg-[#1f2128] border-[#2a2d34]/60 text-gray-400 hover:text-white hover:bg-[#2a2d34]/40"
              }`}
              title={lang === "az" ? "Məşq Xatırladıcısı" : lang === "ru" ? "Напоминание о тренировке" : "Workout Reminder"}
            >
              <Bell className="w-4 h-4" />
              {reminders?.enabled && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-[#1b1d22]" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-gray-400 hover:text-red-400 rounded-xl cursor-pointer transition-all"
              title={translations[lang].logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Today's Workout Status Banner */}
        {reminders?.enabled && reminders?.days?.includes(new Date().getDay()) && (
          <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/5 border border-amber-500/20 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0 animate-bounce">🔥</span>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block">
                  {lang === "az" ? "Bu gün məşq gününüzdür!" : lang === "ru" ? "Сегодня ваш тренировочный день!" : "Today is your workout day!"}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5 truncate">
                  {lang === "az" ? (
                    <>Xatırlatma saatı: <span className="text-amber-500 font-bold">{reminders.time}</span>. Məşqi qaçırmayın! 💪</>
                  ) : lang === "ru" ? (
                    <>Время напоминания: <span className="text-amber-500 font-bold">{reminders.time}</span>. Не пропускайте! 💪</>
                  ) : (
                    <>Reminder time: <span className="text-amber-500 font-bold">{reminders.time}</span>. Don't miss it! 💪</>
                  )}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab("program");
              }}
              className="py-1.5 px-3.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-[10px] rounded-lg transition-all uppercase tracking-wider shrink-0 cursor-pointer shadow-sm"
            >
              {lang === "az" ? "Məşqə Get" : lang === "ru" ? "Начать" : "Start"}
            </button>
          </div>
        )}

        {/* Target Weight Progress Ring Card */}
        <WeightProgressRing
          latestMeasure={latestMeasure}
          body={body}
          nutri={nutri}
          lang={lang}
          onUpdateNutri={(n) => {
            setNutri(n);
            triggerStateChange();
          }}
        />

        {/* Router View switcher */}
        <main className="pb-4">
          {activeTab === "program" && (
            <Program
              program={program}
              activeDay={activeDay}
              editMode={editMode}
              logs={logs}
              isPremium={isPremiumActive()}
              lang={lang}
              onUpdateProgram={(p) => {
                setProgram(p);
                triggerStateChange();
              }}
              onUpdateLogs={(l) => {
                setLogs(l);
                triggerStateChange();
              }}
              onSetActiveDay={setActiveDay}
              onToggleEditMode={() => setEditMode(!editMode)}
              onTriggerPayment={() => setShowPaymentModal(true)}
              userContext={lang === "az" ? `Çəki: ${latestMeasure?.weight || "Naməlum"}, Boy: ${latestMeasure?.height || "Naməlum"}, Məqsəd: ${nutri.goal}` : lang === "ru" ? `Вес: ${latestMeasure?.weight || "Неизвестно"}, Рост: ${latestMeasure?.height || "Неизвестно"}, Цель: ${nutri.goal}` : `Weight: ${latestMeasure?.weight || "Unknown"}, Height: ${latestMeasure?.height || "Unknown"}, Goal: ${nutri.goal}`}
            />
          )}

          {activeTab === "audio" && (
            <div className="space-y-4 animate-fade-in" id="audio-view-container">
              <FocusMusic lang={lang} />
            </div>
          )}

          {activeTab === "nutrition" && (
            <Nutrition
              nutri={nutri}
              latestMeasure={latestMeasure}
              lang={lang}
              onUpdateNutri={(n) => {
                setNutri(n);
                triggerStateChange();
              }}
            />
          )}

          {activeTab === "chat" && (
            <ChallengesHub
              isPremium={isPremiumActive()}
              onTriggerPayment={() => setShowPaymentModal(true)}
              lang={lang}
            />
          )}

          {activeTab === "progress" && (
            <div className="space-y-4 animate-fade-in" id="progress-container">
              {/* Segmented Control Header */}
              <div className="bg-[#1b1d22]/80 border border-[#2a2d34]/60 rounded-2xl p-1.5 flex overflow-x-auto gap-1.5 custom-scrollbar scrollbar-none items-center shadow-inner">
                <button
                  onClick={() => setProgressTab("leaderboard")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    progressTab === "leaderboard"
                      ? "bg-amber-500 text-gray-950 shadow-md scale-105"
                      : "text-gray-400 hover:text-white hover:bg-[#252830]"
                  }`}
                >
                  🏆 {lang === "az" ? "Liderlik" : lang === "ru" ? "Лидеры" : "Leaderboard"}
                </button>
                <button
                  onClick={() => setProgressTab("calendar")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    progressTab === "calendar"
                      ? "bg-amber-500 text-gray-950 shadow-md scale-105"
                      : "text-gray-400 hover:text-white hover:bg-[#252830]"
                  }`}
                >
                  📅 {lang === "az" ? "Təqvim" : lang === "ru" ? "Календарь" : "Calendar"}
                </button>
                <button
                  onClick={() => setProgressTab("body")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    progressTab === "body"
                      ? "bg-amber-500 text-gray-950 shadow-md scale-105"
                      : "text-gray-400 hover:text-white hover:bg-[#252830]"
                  }`}
                >
                  📏 {lang === "az" ? "Ölçülər" : lang === "ru" ? "Замеры" : "Dimensions"}
                </button>
                <button
                  onClick={() => setProgressTab("bodyfat")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    progressTab === "bodyfat"
                      ? "bg-amber-500 text-gray-950 shadow-md scale-105"
                      : "text-gray-400 hover:text-white hover:bg-[#252830]"
                  }`}
                >
                  📷 {lang === "az" ? "Yağ %" : lang === "ru" ? "Жир %" : "Fat %"}
                </button>
                <button
                  onClick={() => setProgressTab("history")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    progressTab === "history"
                      ? "bg-amber-500 text-gray-950 shadow-md scale-105"
                      : "text-gray-400 hover:text-white hover:bg-[#252830]"
                  }`}
                >
                  📋 {lang === "az" ? "Tarixçə" : lang === "ru" ? "История" : "History"}
                </button>
                <button
                  onClick={() => setProgressTab("health")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    progressTab === "health"
                      ? "bg-amber-500 text-gray-950 shadow-md scale-105"
                      : "text-gray-400 hover:text-white hover:bg-[#252830]"
                  }`}
                >
                  ❤️ {lang === "az" ? "Sinxron" : lang === "ru" ? "Синхр." : lang === "de" ? "Synchronisieren" : "Sync"}
                </button>
              </div>

              {/* View Content area */}
              <div className="space-y-4" id="progress-sub-view">
                {progressTab === "leaderboard" && (
                  <Leaderboard
                    currentUserId={user.uid}
                    userLogs={logs}
                    onTriggerPayment={() => setShowPaymentModal(true)}
                    lang={lang}
                  />
                )}

                {progressTab === "calendar" && <ConsistencyCalendar logs={logs} program={program} />}

                {progressTab === "body" && (
                  <BodyMeasurements
                    body={body}
                    onUpdateBody={(b) => {
                      setBody(b);
                      triggerStateChange();
                    }}
                    lang={lang}
                  />
                )}

                {progressTab === "bodyfat" && (
                  <BodyFat
                    bf={bf}
                    ai={ai}
                    latestMeasure={latestMeasure}
                    isPremium={isPremiumActive()}
                    gender={nutri.gender}
                    lang={lang}
                    onUpdateBf={(b) => {
                      setBf(b);
                      triggerStateChange();
                    }}
                    onUpdateAi={(a) => {
                      setAi(a);
                      triggerStateChange();
                    }}
                    onTriggerPayment={() => setShowPaymentModal(true)}
                    userContext={lang === "az" ? `Çəki: ${latestMeasure?.weight || "Naməlum"}, Boy: ${latestMeasure?.height || "Naməlum"}, Məqsəd: ${nutri.goal}` : lang === "ru" ? `Вес: ${latestMeasure?.weight || "Неизвестно"}, Рост: ${latestMeasure?.height || "Неизвестно"}, Цель: ${nutri.goal}` : `Weight: ${latestMeasure?.weight || "Unknown"}, Height: ${latestMeasure?.height || "Unknown"}, Goal: ${nutri.goal}`}
                  />
                )}

                {progressTab === "history" && <History logs={logs} lang={lang} body={body} />}

                {progressTab === "health" && (
                  <HealthSync
                    body={body}
                    logs={logs}
                    onUpdateBody={(b) => {
                      setBody(b);
                      triggerStateChange();
                    }}
                    onUpdateLogs={(l) => {
                      setLogs(l);
                      triggerStateChange();
                    }}
                    lang={lang}
                    triggerToast={triggerToast}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <MyPayments
              user={user}
              lang={lang}
              onPremiumUpdate={(premium, premiumUntil, plan) => {
                setPremiumInfo({
                  premium,
                  premiumUntil,
                  plan
                });
              }}
              onTriggerPayment={() => setShowPaymentModal(true)}
            />
          )}

          {activeTab === "admin" && isAdmin && (
            <Admin currentUserEmail={user.email} onBackToApp={() => setActiveTab("program")} />
          )}
        </main>
      </div>

      {/* Bottom responsive Tab Navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#141519]/95 backdrop-blur-xl border-t border-[#2a2d34]/60 py-3 pb-safe px-2 flex justify-around items-center z-40 max-w-xl mx-auto shadow-2xl">
        <button
          onClick={() => {
            setActiveTab("program");
            setEditMode(false);
          }}
          className={`flex flex-col items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-2xl focus:outline-none transition-all duration-300 cursor-pointer ${
            activeTab === "program"
              ? "text-amber-500 bg-amber-500/10 scale-105 shadow-[0_4px_12px_rgba(245,158,11,0.15)] border border-amber-500/15"
              : "text-gray-400 hover:text-white hover:bg-[#252830]/20 border border-transparent"
          }`}
        >
          <Dumbbell className="w-5 h-5 shrink-0" />
          <span className="text-[9px] md:text-xs font-black uppercase tracking-wider">{translations[lang].workoutProgramTab}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("audio");
            setEditMode(false);
          }}
          className={`flex flex-col items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-2xl focus:outline-none transition-all duration-300 cursor-pointer ${
            activeTab === "audio"
              ? "text-amber-500 bg-amber-500/10 scale-105 shadow-[0_4px_12px_rgba(245,158,11,0.15)] border border-amber-500/15"
              : "text-gray-400 hover:text-white hover:bg-[#252830]/20 border border-transparent"
          }`}
        >
          <Music className="w-5 h-5 shrink-0" />
          <span className="text-[9px] md:text-xs font-black uppercase tracking-wider">{translations[lang].musicTab}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("nutrition");
            setEditMode(false);
          }}
          className={`flex flex-col items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-2xl focus:outline-none transition-all duration-300 cursor-pointer ${
            activeTab === "nutrition"
              ? "text-amber-500 bg-amber-500/10 scale-105 shadow-[0_4px_12px_rgba(245,158,11,0.15)] border border-amber-500/15"
              : "text-gray-400 hover:text-white hover:bg-[#252830]/20 border border-transparent"
          }`}
        >
          <Utensils className="w-5 h-5 shrink-0" />
          <span className="text-[9px] md:text-xs font-black uppercase tracking-wider">{translations[lang].nutritionTab}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("chat");
            setEditMode(false);
          }}
          className={`flex flex-col items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-2xl focus:outline-none transition-all duration-300 cursor-pointer ${
            activeTab === "chat"
              ? "text-amber-500 bg-amber-500/10 scale-105 shadow-[0_4px_12px_rgba(245,158,11,0.15)] border border-amber-500/15"
              : "text-gray-400 hover:text-white hover:bg-[#252830]/20 border border-transparent"
          }`}
        >
          <Trophy className="w-5 h-5 shrink-0" />
          <span className="text-[9px] md:text-xs font-black uppercase tracking-wider">{translations[lang].aiHubTab}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("progress");
            setEditMode(false);
          }}
          className={`flex flex-col items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-2xl focus:outline-none transition-all duration-300 cursor-pointer ${
            activeTab === "progress"
              ? "text-amber-500 bg-amber-500/10 scale-105 shadow-[0_4px_12px_rgba(245,158,11,0.15)] border border-amber-500/15"
              : "text-gray-400 hover:text-white hover:bg-[#252830]/20 border border-transparent"
          }`}
        >
          <TrendingUp className="w-5 h-5 shrink-0" />
          <span className="text-[9px] md:text-xs font-black uppercase tracking-wider">{translations[lang].progressTabName}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("payments");
            setEditMode(false);
          }}
          className={`flex flex-col items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-2xl focus:outline-none transition-all duration-300 cursor-pointer ${
            activeTab === "payments"
              ? "text-amber-500 bg-amber-500/10 scale-105 shadow-[0_4px_12px_rgba(245,158,11,0.15)] border border-amber-500/15"
              : "text-gray-400 hover:text-white hover:bg-[#252830]/20 border border-transparent"
          }`}
        >
          <CreditCard className="w-5 h-5 shrink-0" />
          <span className="text-[9px] md:text-xs font-black uppercase tracking-wider">{translations[lang].paymentsTabName}</span>
        </button>
      </nav>

      {/* Payment Upgrade Portal Modal */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          priceText={publicConfig.price || "₼4.99/ay"}
          paymentLink={publicConfig.paymentLink}
          whatsapp={publicConfig.whatsapp}
          cardNo={publicConfig.cardNo}
          cardHolder={publicConfig.cardHolder}
          cardBank={publicConfig.cardBank}
          user={user}
        />
      )}

      {/* Reminder Settings Modal */}
      {showReminderSettings && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl p-6 max-w-sm w-full text-left space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setShowReminderSettings(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 hover:bg-[#22242b] rounded-lg cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-xl shrink-0">
                🔔
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {lang === "ru" ? "Параметры уведомлений" : lang === "en" ? "Notification Settings" : "Bildiriş Parametrləri"}
                </h3>
                <p className="text-[10px] text-gray-400">
                  {lang === "ru" ? "Настройте напоминания о тренировках и воде" : lang === "en" ? "Customize your workout and water reminders" : "Məşq və su xatırladıcılarınızı fərdiləşdirin"}
                </p>
              </div>
            </div>

            <hr className="border-[#2a2d34]/60" />

            {/* PART 1: Workout Reminder */}
            <div>
              <div className="flex items-center justify-between gap-4 bg-[#141519] p-3 rounded-xl border border-[#2a2d34]/60">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">
                    {lang === "ru" ? "Напоминание о тренировке" : lang === "en" ? "Workout Reminder" : "Məşq Xatırladıcısı"}
                  </span>
                  <span className="text-[9px] text-gray-500 block leading-tight mt-0.5">
                    {lang === "ru" ? "Получайте уведомления в приложении и браузере, когда пора тренироваться" : lang === "en" ? "Get notified in-app and in the browser when it's workout time" : "Məşq vaxtı çatdıqda həm tətbiqdə, həm də brauzerdə xəbərdar olun"}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminders?.enabled || false}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setReminders(prev => ({ ...prev, enabled: val }));
                      if (val) {
                        triggerToast(lang === "ru" ? "Напоминание о тренировке включено! 🔔" : lang === "en" ? "Workout reminder activated! 🔔" : "Məşq xatırladıcısı aktiv edildi! 🔔");
                      } else {
                        triggerToast(lang === "ru" ? "Напоминание о тренировке выключено." : lang === "en" ? "Workout reminder turned off." : "Məşq xatırladıcısı söndürüldü.");
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                </label>
              </div>

              {reminders?.enabled && (
                <div className="space-y-4 pt-3 animate-fade-in pl-1">
                  {/* Weekday Selector */}
                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase tracking-wider mb-2 font-bold">
                      {lang === "ru" ? "Дни тренировок" : lang === "en" ? "Workout Days" : "Məşq Günləri"}
                    </label>
                    <div className="flex justify-between gap-1">
                      {(lang === "ru" ? [
                        { label: "Пн", value: 1 },
                        { label: "Вт", value: 2 },
                        { label: "Ср", value: 3 },
                        { label: "Чт", value: 4 },
                        { label: "Пт", value: 5 },
                        { label: "Сб", value: 6 },
                        { label: "Вс", value: 0 },
                      ] : lang === "en" ? [
                        { label: "Mo", value: 1 },
                        { label: "Tu", value: 2 },
                        { label: "We", value: 3 },
                        { label: "Th", value: 4 },
                        { label: "Fr", value: 5 },
                        { label: "Sa", value: 6 },
                        { label: "Su", value: 0 },
                      ] : [
                        { label: "BE", value: 1 },
                        { label: "ÇA", value: 2 },
                        { label: "Ç", value: 3 },
                        { label: "CA", value: 4 },
                        { label: "C", value: 5 },
                        { label: "Ş", value: 6 },
                        { label: "B", value: 0 },
                      ]).map((d) => {
                        const isSelected = reminders?.days?.includes(d.value) || false;
                        return (
                          <button
                            key={d.value}
                            onClick={() => {
                              const currentDays = reminders?.days || [];
                              const newDays = isSelected
                                ? currentDays.filter((v) => v !== d.value)
                                : [...currentDays, d.value];
                              setReminders((prev) => ({ ...prev, days: newDays }));
                            }}
                            className={`w-9 h-9 rounded-xl font-black text-[10px] transition-all flex items-center justify-center cursor-pointer border ${
                              isSelected
                                ? "bg-amber-500 border-amber-500 text-gray-950 scale-105 shadow-md shadow-amber-500/15"
                                : "bg-[#141519] border-[#2a2d34]/80 text-gray-400 hover:text-white"
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time picker */}
                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase tracking-wider mb-1.5 font-bold">
                      {lang === "ru" ? "Время тренировки" : lang === "en" ? "Workout Time" : "Məşq Saatı"}
                    </label>
                    <div className="flex gap-2.5 items-center">
                      <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                      <input
                        type="time"
                        value={reminders?.time || "18:00"}
                        onChange={(e) => {
                          setReminders((prev) => ({ ...prev, time: e.target.value }));
                        }}
                        className="bg-[#141519] border border-[#2a2d34]/80 rounded-xl p-2 px-3 text-white focus:outline-none text-xs font-semibold flex-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-[#2a2d34]/40" />

            {/* PART 2: Water Reminder */}
            <div>
              <div className="flex items-center justify-between gap-4 bg-[#141519] p-3 rounded-xl border border-[#2a2d34]/60">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block flex items-center gap-1">
                    {lang === "ru" ? "Напоминание о воде" : lang === "en" ? "Water Reminder" : "Su Xatırladıcısı"} <span className="text-blue-400 text-xs">💧</span>
                  </span>
                  <span className="text-[9px] text-gray-500 block leading-tight mt-0.5">
                    {lang === "ru" ? "Пейте воду в течение дня для хорошего самочувствия и обмена веществ" : lang === "en" ? "Drink water during the day for healthy development and metabolism" : "Sağlam inkişaf və metabolizm üçün gün ərzində su için"}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminders?.waterEnabled || false}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setReminders(prev => ({ ...prev, waterEnabled: val }));
                      if (val) {
                        triggerToast(lang === "ru" ? "Напоминание о воде включено! 💧" : lang === "en" ? "Water reminder activated! 💧" : "Su xatırladıcısı aktiv edildi! 💧");
                      } else {
                        triggerToast(lang === "ru" ? "Напоминание о воде выключено." : lang === "en" ? "Water reminder turned off." : "Su xatırladıcısı söndürüldü.");
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                </label>
              </div>

              {reminders?.waterEnabled && (
                <div className="space-y-4 pt-3 animate-fade-in pl-1">
                  {/* Interval Selector */}
                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase tracking-wider mb-2 font-bold">
                      {lang === "ru" ? "Частота напоминаний" : lang === "en" ? "Reminder Interval" : "Xatırlatma Tezliyi"}
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: lang === "ru" ? "1 ч" : lang === "en" ? "1 h" : "1 s", value: 1 },
                        { label: lang === "ru" ? "1.5 ч" : lang === "en" ? "1.5 h" : "1.5 s", value: 1.5 },
                        { label: lang === "ru" ? "2 ч" : lang === "en" ? "2 h" : "2 s", value: 2 },
                        { label: lang === "ru" ? "3 ч" : lang === "en" ? "3 h" : "3 s", value: 3 },
                      ].map((opt) => {
                        const isSelected = (reminders?.waterIntervalHours || 2) === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setReminders(prev => ({ ...prev, waterIntervalHours: opt.value }));
                              triggerToast(lang === "ru" ? `Напоминание каждые ${opt.label} 💧` : lang === "en" ? `Will remind every ${opt.label} 💧` : `Hər ${opt.label} saatdan bir xatırladılacaq 💧`);
                            }}
                            className={`py-2 rounded-xl text-[10px] font-black transition-all border ${
                              isSelected
                                ? "bg-amber-500 border-amber-500 text-gray-950 scale-105 shadow-md shadow-amber-500/15"
                                : "bg-[#141519] border-[#2a2d34]/80 text-gray-400 hover:text-white"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Hours Picker */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-gray-400 uppercase tracking-wider mb-1 font-bold">
                        {lang === "ru" ? "Время начала" : lang === "en" ? "Start Time" : "Başlanğıc Saatı"}
                      </label>
                      <input
                        type="time"
                        value={reminders?.waterStartTime || "08:00"}
                        onChange={(e) => {
                          setReminders(prev => ({ ...prev, waterStartTime: e.target.value }));
                        }}
                        className="bg-[#141519] border border-[#2a2d34]/80 rounded-xl p-2 px-3 text-white focus:outline-none text-xs font-semibold w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-400 uppercase tracking-wider mb-1 font-bold">
                        {lang === "ru" ? "Время окончания" : lang === "en" ? "End Time" : "Bitmə Saatı"}
                      </label>
                      <input
                        type="time"
                        value={reminders?.waterEndTime || "22:00"}
                        onChange={(e) => {
                          setReminders(prev => ({ ...prev, waterEndTime: e.target.value }));
                        }}
                        className="bg-[#141519] border border-[#2a2d34]/80 rounded-xl p-2 px-3 text-white focus:outline-none text-xs font-semibold w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-[#2a2d34]/40" />

            {/* PART 3: Global Notification Config */}
            <div className="space-y-3">
              {/* Browser Notification Switch */}
              <div className="flex items-center justify-between gap-4 bg-[#141519]/60 p-3 rounded-xl border border-[#2a2d34]/40">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-white block">
                    {lang === "ru" ? "Уведомления браузера" : lang === "en" ? "Browser Notifications" : "Brauzer bildirişləri"}
                  </span>
                  <span className="text-[9px] text-gray-500 block mt-0.5 leading-snug">
                    {lang === "ru" ? "Получайте предупреждения, даже когда приложение в фоновом режиме" : lang === "en" ? "Get alerts even when the app is in the background" : "Tətbiq arxa fonda olanda belə xəbərdarlıq alın"}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminders?.browserNotifications || false}
                    onChange={async (e) => {
                      const checked = e.target.checked;
                      if (checked && typeof window !== "undefined" && "Notification" in window) {
                        const permission = await Notification.requestPermission();
                        if (permission === "granted") {
                          setReminders((prev) => ({ ...prev, browserNotifications: true }));
                          triggerToast(lang === "ru" ? "Уведомления браузера включены! 🎉" : lang === "en" ? "Browser notifications enabled! 🎉" : "Brauzer bildirişləri aktivləşdirildi! 🎉");
                        } else {
                          setReminders((prev) => ({ ...prev, browserNotifications: false }));
                          triggerToast(lang === "ru" ? "Доступ к уведомлениям отклонен." : lang === "en" ? "Notification permission denied." : "Bildiriş icazəsi rədd edildi.");
                        }
                      } else {
                        setReminders((prev) => ({ ...prev, browserNotifications: checked }));
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500" />
                </label>
              </div>

              {/* Send Test Notification Button */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined" && "Notification" in window) {
                      if (Notification.permission === "granted") {
                        try {
                          new Notification(lang === "ru" ? "DəmirPlan — Тест Тренировки! 🏋️‍♂️" : lang === "en" ? "DəmirPlan — Test Workout! 🏋️‍♂️" : "DəmirPlan — Məşq Sınağı! 🏋️‍♂️", {
                            body: lang === "ru" ? "Напоминания о тренировках полностью активны в нашем приложении! 💪🔥" : lang === "en" ? "Workout reminders are fully active in our app! 💪🔥" : "Məşq xatırlatma bildirişləri tətbiqimizdə tam aktivdir! 💪🔥",
                            icon: "/favicon.ico",
                          });
                        } catch (err) {
                          console.error("Test notification failed:", err);
                        }
                      } else {
                        triggerToast(lang === "ru" ? "Уведомления браузера не разрешены." : lang === "en" ? "Browser notifications are not allowed." : "Brauzer bildirişlərinə icazə verilməyib.");
                      }
                    }
                    triggerToast(lang === "ru" ? "Тестовое уведомление о тренировке отправлено! 🔔" : lang === "en" ? "Test workout notification sent! 🔔" : "Sınaq məşq bildirişi göndərildi! 🔔");
                  }}
                  className="py-2 bg-[#22242b] hover:bg-[#2a2d34] border border-[#2a2d34] text-white hover:text-amber-500 text-[9px] font-bold rounded-xl cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1"
                >
                  {lang === "ru" ? "🏋️‍♂️ Тест Тренировки" : lang === "en" ? "🏋️‍♂️ Test Workout" : "🏋️‍♂️ Məşq Sınağı"}
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== "undefined" && "Notification" in window) {
                      if (Notification.permission === "granted") {
                        try {
                          new Notification(lang === "ru" ? "DəmirPlan — Тест Воды! 💧" : lang === "en" ? "DəmirPlan — Test Water! 💧" : "DəmirPlan — Su Sınağı! 💧", {
                            body: lang === "ru" ? "Напоминания о воде полностью активны в нашем приложении! 🥤 Будьте здоровы." : lang === "en" ? "Water reminders are fully active in our app! 🥤 Stay healthy." : "Su xatırlatma bildirişləri tətbiqimizdə tam aktivdir! 🥤 Sağlamlığınızı qoruyun.",
                            icon: "/favicon.ico",
                          });
                        } catch (err) {
                          console.error("Test notification failed:", err);
                        }
                      } else {
                        triggerToast(lang === "ru" ? "Уведомления браузера не разрешены." : lang === "en" ? "Browser notifications are not allowed." : "Brauzer bildirişlərinə icazə verilməyib.");
                      }
                    }
                    triggerToast(lang === "ru" ? "Тестовое уведомление о воде отправлено! 💧" : lang === "en" ? "Test water notification sent! 💧" : "Sınaq su bildirişi göndərildi! 💧");
                  }}
                  className="py-2 bg-[#22242b] hover:bg-[#2a2d34] border border-[#2a2d34] text-white hover:text-amber-500 text-[9px] font-bold rounded-xl cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1"
                >
                  {lang === "ru" ? "💧 Тест Воды" : lang === "en" ? "💧 Test Water" : "💧 Su Sınağı"}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowReminderSettings(false)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl cursor-pointer transition-all text-xs uppercase tracking-wider text-center shadow-lg shadow-amber-500/10"
            >
              {lang === "ru" ? "Сохранить и закрыть" : lang === "en" ? "Save and Close" : "Yadda Saxla və Bağla"}
            </button>
          </div>
        </div>
      )}

      {/* Workout Time Alert Modal */}
      {showWorkoutAlert && (
        <div className="fixed inset-0 bg-gray-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-[#1b1d22] border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
            
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto animate-pulse">
              🏋️‍♂️
            </div>
            
            <h3 className="text-xl font-black italic text-white tracking-tight">
              {lang === "ru" ? "ВРЕМЯ ТРЕНИРОВКИ! ⚡" : lang === "en" ? "WORKOUT TIME! ⚡" : "MƏŞQ VAXTIDIR! ⚡"}
            </h3>
            <p className="text-gray-300 text-xs leading-relaxed">
              {lang === "ru" ? "Пришло время для запланированной сегодня тренировки! Сделайте шаг ближе к своей цели и станьте сильнее прямо сейчас! 💪🔥" : lang === "en" ? "Today's scheduled workout time has arrived! Take a step closer to your goals and get stronger now! 💪🔥" : "Bugünkü planlaşdırılmış məşq zamanı gəldi! Hədəflərinizə bir addım daha yaxınlaşmaq və güclənmək üçün məşqə indi başlayın! 💪🔥"}
            </p>
 
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setShowWorkoutAlert(false);
                  setActiveTab("program");
                  // Save that we have notified today to prevent repeat popup
                  const todayStr = new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, "0") + "-" + String(new Date().getDate()).padStart(2, "0");
                  setReminders(prev => ({ ...prev, lastNotifiedDate: todayStr }));
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl cursor-pointer transition-all uppercase tracking-wider text-xs shadow-md"
              >
                {lang === "ru" ? "🚀 Начать тренировку!" : lang === "en" ? "🚀 Start Workout Now!" : "🚀 İndi Məşqə Başla!"}
              </button>
 
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    // Snooze for 15 minutes
                    localStorage.setItem("dpp-snoozed-until", String(Date.now() + 15 * 60 * 1000));
                    setShowWorkoutAlert(false);
                    triggerToast(lang === "ru" ? "Напоминание отложено на 15 минут ⏰" : lang === "en" ? "Alert snoozed for 15 minutes ⏰" : "Xəbərdarlıq 15 dəqiqə sonraya təxirə salındı ⏰");
                  }}
                  className="py-2.5 bg-[#22242b] hover:bg-[#2a2d34] text-gray-400 hover:text-white font-bold rounded-xl cursor-pointer transition-all text-[10px] uppercase tracking-wider border border-[#2a2d34]"
                >
                  {lang === "ru" ? "⏰ Отложить на 15 мин" : lang === "en" ? "⏰ Snooze 15 min" : "⏰ 15 dəq təxirə sal"}
                </button>
                <button
                  onClick={() => {
                    setShowWorkoutAlert(false);
                    const todayStr = new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, "0") + "-" + String(new Date().getDate()).padStart(2, "0");
                    setReminders(prev => ({ ...prev, lastNotifiedDate: todayStr }));
                    triggerToast(lang === "ru" ? "Напоминание закрыто на сегодня." : lang === "en" ? "Alert closed for today." : "Xəbərdarlıq bu günlük bağlanıldı.");
                  }}
                  className="py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl cursor-pointer transition-all text-[10px] uppercase tracking-wider border border-red-500/20"
                >
                  {lang === "ru" ? "✖ Закрыть на сегодня" : lang === "en" ? "✖ Close for Today" : "✖ Bu günlük bağla"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
