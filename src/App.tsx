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
import Program from "./components/Program";
import Nutrition from "./components/Nutrition";
import Chat from "./components/Chat";
import BodyFat from "./components/BodyFat";
import BodyMeasurements from "./components/BodyMeasurements";
import History from "./components/History";
import Admin from "./components/Admin";
import PaymentModal from "./components/PaymentModal";
import ConsistencyCalendar from "./components/ConsistencyCalendar";
import { Dumbbell, LogOut, ShieldCheck, Crown, Sparkles, RefreshCw, RefreshCw as SyncIcon, Bell, BellOff, Clock, Calendar, X } from "lucide-react";

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

  // App Tabs & Navigation
  const [activeTab, setActiveTab] = useState<string>("program");
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

      // Force Premium status as free and unlimited for all users
      setPremiumInfo({
        premium: true,
        premiumUntil: null,
        plan: "Ödənişsiz Sınırsız",
      });
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
          <p className="text-gray-400 text-sm font-semibold">Tətbiq yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onSuccess={() => {}} />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#131417] text-gray-200 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] font-sans antialiased">
      {/* Dynamic Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-amber-500 text-gray-950 px-5 py-3 rounded-xl font-bold text-xs tracking-wide shadow-2xl z-50 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Header Block */}
        <header className="flex justify-between items-end pb-1 border-b border-[#2a2d34]/40">
          <div>
            <div className="text-[10px] tracking-[4px] text-gray-400 font-semibold uppercase">Sən qur, Aİ kömək etsin</div>
            <h1 className="text-3xl font-black italic tracking-tight text-white">
              DƏMİR<span className="text-amber-500">PLAN</span>
            </h1>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Son Çəki</span>
            <span className="text-base font-black text-amber-500">
              {latestMeasure?.weight ? `${latestMeasure.weight} kq` : "—"}
            </span>
          </div>
        </header>

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
              title={syncPending ? "Firestore sinxronizasiyası gözlənilir..." : "Sinxronizasiya tamdır ✓"}
            />
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab("admin");
                  setEditMode(false);
                }}
                className="py-1 px-2.5 bg-amber-500 text-gray-950 font-black text-[10px] rounded-lg cursor-pointer uppercase tracking-wider"
              >
                👑 Admin
              </button>
            )}
            <button
              onClick={() => setShowReminderSettings(true)}
              className={`p-2 border rounded-xl cursor-pointer transition-all relative ${
                reminders?.enabled
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20"
                  : "bg-[#1f2128] border-[#2a2d34]/60 text-gray-400 hover:text-white hover:bg-[#2a2d34]/40"
              }`}
              title="Məşq Xatırladıcısı"
            >
              <Bell className="w-4 h-4" />
              {reminders?.enabled && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-[#1b1d22]" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-gray-400 hover:text-red-400 rounded-xl cursor-pointer transition-all"
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
                <span className="text-xs font-bold text-white block">Bu gün məşq gününüzdür!</span>
                <span className="text-[10px] text-gray-400 block mt-0.5 truncate">
                  Xatırlatma saatı: <span className="text-amber-500 font-bold">{reminders.time}</span>. Məşqi qaçırmayın! 💪
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab("program");
              }}
              className="py-1.5 px-3.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-[10px] rounded-lg transition-all uppercase tracking-wider shrink-0 cursor-pointer shadow-sm"
            >
              Məşqə Get
            </button>
          </div>
        )}

        {/* Router View switcher */}
        <main className="pb-4">
          {activeTab === "program" && (
            <Program
              program={program}
              activeDay={activeDay}
              editMode={editMode}
              logs={logs}
              isPremium={isPremiumActive()}
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
              userContext={`Çəki: ${latestMeasure?.weight || "Naməlum"}, Boy: ${latestMeasure?.height || "Naməlum"}, Məqsəd: ${nutri.goal}`}
            />
          )}

          {activeTab === "nutrition" && (
            <Nutrition
              nutri={nutri}
              latestMeasure={latestMeasure}
              onUpdateNutri={(n) => {
                setNutri(n);
                triggerStateChange();
              }}
            />
          )}

          {activeTab === "chat" && (
            <Chat
              chat={chat}
              isPremium={isPremiumActive()}
              onUpdateChat={(c) => {
                setChat(c);
                triggerStateChange();
              }}
              onTriggerPayment={() => setShowPaymentModal(true)}
              coachContext={buildCoachContext()}
            />
          )}

          {activeTab === "bodyfat" && (
            <BodyFat
              bf={bf}
              ai={ai}
              latestMeasure={latestMeasure}
              isPremium={isPremiumActive()}
              gender={nutri.gender}
              onUpdateBf={(b) => {
                setBf(b);
                triggerStateChange();
              }}
              onUpdateAi={(a) => {
                setAi(a);
                triggerStateChange();
              }}
              onTriggerPayment={() => setShowPaymentModal(true)}
              userContext={`Çəki: ${latestMeasure?.weight || "Naməlum"}, Boy: ${latestMeasure?.height || "Naməlum"}, Məqsəd: ${nutri.goal}`}
            />
          )}

          {activeTab === "body" && (
            <BodyMeasurements
              body={body}
              onUpdateBody={(b) => {
                setBody(b);
                triggerStateChange();
              }}
            />
          )}

          {activeTab === "history" && <History logs={logs} />}

          {activeTab === "calendar" && <ConsistencyCalendar logs={logs} />}

          {activeTab === "admin" && isAdmin && (
            <Admin currentUserEmail={user.email} onBackToApp={() => setActiveTab("program")} />
          )}
        </main>
      </div>

      {/* Bottom responsive Tab Navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#141519]/95 backdrop-blur-xl border-t border-[#2a2d34]/60 pt-3.5 pb-safe px-1.5 flex justify-around items-center z-40 max-w-xl mx-auto shadow-2xl">
        <button
          onClick={() => {
            setActiveTab("program");
            setEditMode(false);
          }}
          className={`flex flex-col items-center gap-0.5 focus:outline-none transition-all cursor-pointer ${
            activeTab === "program" ? "text-amber-500 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-lg">🏋️‍♂️</span>
          <span className="text-[8px] font-extrabold uppercase tracking-tight">Proqram</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("nutrition");
            setEditMode(false);
          }}
          className={`flex flex-col items-center gap-0.5 focus:outline-none transition-all cursor-pointer ${
            activeTab === "nutrition" ? "text-amber-500 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-lg">🥗</span>
          <span className="text-[8px] font-extrabold uppercase tracking-tight">Qida</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("chat");
            setEditMode(false);
          }}
          className={`flex flex-col items-center gap-0.5 focus:outline-none transition-all cursor-pointer ${
            activeTab === "chat" ? "text-amber-500 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-lg">💬</span>
          <span className="text-[8px] font-extrabold uppercase tracking-tight">Aİ Çat</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("calendar");
            setEditMode(false);
          }}
          className={`flex flex-col items-center gap-0.5 focus:outline-none transition-all cursor-pointer ${
            activeTab === "calendar" ? "text-amber-500 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-lg">📅</span>
          <span className="text-[8px] font-extrabold uppercase tracking-tight">Təqvim</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("bodyfat");
            setEditMode(false);
          }}
          className={`flex flex-col items-center gap-0.5 focus:outline-none transition-all cursor-pointer ${
            activeTab === "bodyfat" ? "text-amber-500 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-lg">📷</span>
          <span className="text-[8px] font-extrabold uppercase tracking-tight">Yağ %</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("body");
            setEditMode(false);
          }}
          className={`flex flex-col items-center gap-0.5 focus:outline-none transition-all cursor-pointer ${
            activeTab === "body" ? "text-amber-500 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-lg">📏</span>
          <span className="text-[8px] font-extrabold uppercase tracking-tight">Ölçülər</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("history");
            setEditMode(false);
          }}
          className={`flex flex-col items-center gap-0.5 focus:outline-none transition-all cursor-pointer ${
            activeTab === "history" ? "text-amber-500 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-lg">📋</span>
          <span className="text-[8px] font-extrabold uppercase tracking-tight">Tarixçə</span>
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
                <h3 className="font-bold text-white text-base">Bildiriş Parametrləri</h3>
                <p className="text-[10px] text-gray-400">Məşq və su xatırladıcılarınızı fərdiləşdirin</p>
              </div>
            </div>

            <hr className="border-[#2a2d34]/60" />

            {/* PART 1: Workout Reminder */}
            <div>
              <div className="flex items-center justify-between gap-4 bg-[#141519] p-3 rounded-xl border border-[#2a2d34]/60">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">Məşq Xatırladıcısı</span>
                  <span className="text-[9px] text-gray-500 block leading-tight mt-0.5">
                    Məşq vaxtı çatdıqda həm tətbiqdə, həm də brauzerdə xəbərdar olun
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
                        triggerToast("Məşq xatırladıcısı aktiv edildi! 🔔");
                      } else {
                        triggerToast("Məşq xatırladıcısı söndürüldü.");
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
                      Məşq Günləri
                    </label>
                    <div className="flex justify-between gap-1">
                      {[
                        { label: "BE", value: 1 },
                        { label: "ÇA", value: 2 },
                        { label: "Ç", value: 3 },
                        { label: "CA", value: 4 },
                        { label: "C", value: 5 },
                        { label: "Ş", value: 6 },
                        { label: "B", value: 0 },
                      ].map((d) => {
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
                      Məşq Saatı
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
                    Su Xatırladıcısı <span className="text-blue-400 text-xs">💧</span>
                  </span>
                  <span className="text-[9px] text-gray-500 block leading-tight mt-0.5">
                    Sağlam inkişaf və metabolizm üçün gün ərzində su için
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
                        triggerToast("Su xatırladıcısı aktiv edildi! 💧");
                      } else {
                        triggerToast("Su xatırladıcısı söndürüldü.");
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
                      Xatırlatma Tezliyi
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: "1 s", value: 1 },
                        { label: "1.5 s", value: 1.5 },
                        { label: "2 s", value: 2 },
                        { label: "3 s", value: 3 },
                      ].map((opt) => {
                        const isSelected = (reminders?.waterIntervalHours || 2) === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setReminders(prev => ({ ...prev, waterIntervalHours: opt.value }));
                              triggerToast(`Hər ${opt.label}aatdan bir xatırladılacaq 💧`);
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
                        Başlanğıc Saatı
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
                        Bitmə Saatı
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
                  <span className="text-[11px] font-bold text-white block">Brauzer bildirişləri</span>
                  <span className="text-[9px] text-gray-500 block mt-0.5 leading-snug">
                    Tətbiq arxa fonda olanda belə xəbərdarlıq alın
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
                          triggerToast("Brauzer bildirişləri aktivləşdirildi! 🎉");
                        } else {
                          setReminders((prev) => ({ ...prev, browserNotifications: false }));
                          triggerToast("Bildiriş icazəsi rədd edildi.");
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
                          new Notification("DəmirPlan — Məşq Sınağı! 🏋️‍♂️", {
                            body: "Məşq xatırlatma bildirişləri tətbiqimizdə tam aktivdir! 💪🔥",
                            icon: "/favicon.ico",
                          });
                        } catch (err) {
                          console.error("Test notification failed:", err);
                        }
                      } else {
                        triggerToast("Brauzer bildirişlərinə icazə verilməyib.");
                      }
                    }
                    triggerToast("Sınaq məşq bildirişi göndərildi! 🔔");
                  }}
                  className="py-2 bg-[#22242b] hover:bg-[#2a2d34] border border-[#2a2d34] text-white hover:text-amber-500 text-[9px] font-bold rounded-xl cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1"
                >
                  🏋️‍♂️ Məşq Sınağı
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== "undefined" && "Notification" in window) {
                      if (Notification.permission === "granted") {
                        try {
                          new Notification("DəmirPlan — Su Sınağı! 💧", {
                            body: "Su xatırlatma bildirişləri tətbiqimizdə tam aktivdir! 🥤 Sağlamlığınızı qoruyun.",
                            icon: "/favicon.ico",
                          });
                        } catch (err) {
                          console.error("Test notification failed:", err);
                        }
                      } else {
                        triggerToast("Brauzer bildirişlərinə icazə verilməyib.");
                      }
                    }
                    triggerToast("Sınaq su bildirişi göndərildi! 💧");
                  }}
                  className="py-2 bg-[#22242b] hover:bg-[#2a2d34] border border-[#2a2d34] text-white hover:text-amber-500 text-[9px] font-bold rounded-xl cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1"
                >
                  💧 Su Sınağı
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowReminderSettings(false)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl cursor-pointer transition-all text-xs uppercase tracking-wider text-center shadow-lg shadow-amber-500/10"
            >
              Yadda Saxla və Bağla
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
            
            <h3 className="text-xl font-black italic text-white tracking-tight">MƏŞQ VAXTIDIR! ⚡</h3>
            <p className="text-gray-300 text-xs leading-relaxed">
              Bugünkü planlaşdırılmış məşq zamanı gəldi! Hədəflərinizə bir addım daha yaxınlaşmaq və güclənmək üçün məşqə indi başlayın! 💪🔥
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
                🚀 İndi Məşqə Başla!
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    // Snooze for 15 minutes
                    localStorage.setItem("dpp-snoozed-until", String(Date.now() + 15 * 60 * 1000));
                    setShowWorkoutAlert(false);
                    triggerToast("Xəbərdarlıq 15 dəqiqə sonraya təxirə salındı ⏰");
                  }}
                  className="py-2.5 bg-[#22242b] hover:bg-[#2a2d34] text-gray-400 hover:text-white font-bold rounded-xl cursor-pointer transition-all text-[10px] uppercase tracking-wider border border-[#2a2d34]"
                >
                  ⏰ 15 dəq təxirə sal
                </button>
                <button
                  onClick={() => {
                    setShowWorkoutAlert(false);
                    const todayStr = new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, "0") + "-" + String(new Date().getDate()).padStart(2, "0");
                    setReminders(prev => ({ ...prev, lastNotifiedDate: todayStr }));
                    triggerToast("Xəbərdarlıq bu günlük bağlanıldı.");
                  }}
                  className="py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl cursor-pointer transition-all text-[10px] uppercase tracking-wider border border-red-500/20"
                >
                  ✖ Bu günlük bağla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
