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
import { Dumbbell, LogOut, ShieldCheck, Crown, Sparkles, RefreshCw, RefreshCw as SyncIcon } from "lucide-react";

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
  const [updatedAt, setUpdatedAt] = useState<number>(0);

  // Premium & Public configurations
  const [premiumInfo, setPremiumInfo] = useState<PremiumInfo>({
    premium: false,
    premiumUntil: null,
    plan: "",
  });
  const [publicConfig, setPublicConfig] = useState<PublicConfig>({
    paymentLink: "",
    price: "₼4.99/ay",
    whatsapp: "",
  });

  // UI Control states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [syncPending, setSyncPending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
        const d = pubDoc.data() as PublicConfig;
        setPublicConfig({
          paymentLink: d.paymentLink || "",
          price: d.price || "₼4.99/ay",
          whatsapp: d.whatsapp || "",
        });
      }

      // Fetch user profile to read Premium status
      let userDoc;
      try {
        userDoc = await getDoc(doc(db, "users", uid));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${uid}`);
        return;
      }

      if (userDoc && userDoc.exists()) {
        const d = userDoc.data();
        setPremiumInfo({
          premium: !!d?.premium,
          premiumUntil: d?.premiumUntil || null,
          plan: d?.premiumPlan || "",
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
        _updatedAt: stamp,
      };
      localStorage.setItem(getLocalKey(uid), JSON.stringify(data));
    } catch (e) {
      console.error("Local save error:", e);
    }
  };

  // 4. Firestore Sync Engine
  const pushToCloud = async (uid: string, stamp: number) => {
    if (!uid) return;
    setSyncPending(true);
    try {
      const latestMeasure = body.length ? [...body].sort((a, b) => b.date.localeCompare(a.date))[0] : null;

      await setDoc(
        doc(db, "users", uid),
        {
          email: user?.email || "",
          name: user?.displayName || "",
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

  const pullFromCloud = async (uid: string, localStamp: number) => {
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
          setUpdatedAt(cloudStamp);

          // Save synced data locally too
          const dataToSave = { ...cloudData };
          localStorage.setItem(getLocalKey(uid), JSON.stringify(dataToSave));
          triggerToast("Məlumatlarınız buluddan yükləndi ☁️");
        } else {
          // Cloud is older, push local state
          pushToCloud(uid, localStamp || Date.now());
        }
      } else {
        // No document in cloud yet, push first local state
        pushToCloud(uid, localStamp || Date.now());
      }
    } catch (err) {
      console.error("Firestore pull error:", err);
    }
  };

  // 5. App State Triggers for Sync
  const triggerStateChange = () => {
    if (!user) return;
    const stamp = Date.now();
    setUpdatedAt(stamp);
    saveLocalState(user.uid, stamp);

    // Schedule debounced Firestore write
    if (syncTimer.current) clearTimeout(syncTimer.current);
    setSyncPending(true);
    syncTimer.current = setTimeout(() => {
      pushToCloud(user.uid, stamp);
    }, 2000);
  };

  // Hook listeners to sync
  useEffect(() => {
    if (!authChecked || !user) return;
    triggerStateChange();
  }, [program, logs, body, nutri, bf, ai, chat]);

  // Auth setup listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const localStamp = loadLocalState(u.uid);
        await pullFromCloud(u.uid, localStamp);
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
      <div className="min-h-screen bg-[#131417] flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-[#131417] text-gray-200 pb-24 font-sans antialiased">
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
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-gray-400 hover:text-red-400 rounded-xl cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

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

          {activeTab === "admin" && isAdmin && (
            <Admin currentUserEmail={user.email} onBackToApp={() => setActiveTab("program")} />
          )}
        </main>
      </div>

      {/* Bottom responsive Tab Navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#141519]/90 backdrop-blur-xl border-t border-[#2a2d34]/60 py-3.5 px-2 flex justify-around items-center z-40 max-w-xl mx-auto shadow-2xl">
        <button
          onClick={() => {
            setActiveTab("program");
            setEditMode(false);
          }}
          className={`flex flex-col items-center gap-1 focus:outline-none transition-all cursor-pointer ${
            activeTab === "program" ? "text-amber-500 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-xl">🏋️‍♂️</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Proqram</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("nutrition");
            setEditMode(false);
          }}
          className={`flex flex-col items-center gap-1 focus:outline-none transition-all cursor-pointer ${
            activeTab === "nutrition" ? "text-amber-500 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-xl">🥗</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Qida</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("chat");
            setEditMode(false);
          }}
          className={`flex flex-col items-center gap-1 focus:outline-none transition-all cursor-pointer ${
            activeTab === "chat" ? "text-amber-500 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-xl">💬</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Aİ Çat</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("bodyfat");
            setEditMode(false);
          }}
          className={`flex flex-col items-center gap-1 focus:outline-none transition-all cursor-pointer ${
            activeTab === "bodyfat" ? "text-amber-500 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-xl">📷</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Yağ %</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("body");
            setEditMode(false);
          }}
          className={`flex flex-col items-center gap-1 focus:outline-none transition-all cursor-pointer ${
            activeTab === "body" ? "text-amber-500 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-xl">📏</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Ölçülər</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("history");
            setEditMode(false);
          }}
          className={`flex flex-col items-center gap-1 focus:outline-none transition-all cursor-pointer ${
            activeTab === "history" ? "text-amber-500 scale-105" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-xl">📋</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Tarixçə</span>
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
        />
      )}
    </div>
  );
}
