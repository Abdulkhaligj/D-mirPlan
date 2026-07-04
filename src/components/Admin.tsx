import React, { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { User, ShieldAlert, Sparkles, Search, ArrowLeft, Crown, Settings2, ShieldCheck, Mail, Calendar, DollarSign, Activity } from "lucide-react";
import { PublicConfig } from "../types";

interface AdminProps {
  currentUserEmail: string | null;
  onBackToApp: () => void;
}

export default function Admin({ currentUserEmail, onBackToApp }: AdminProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // General public configurations
  const [payLink, setPayLink] = useState("");
  const [priceText, setPriceText] = useState("₼4.99/ay");
  const [whatsapp, setWhatsapp] = useState("");
  const [sharedKey, setSharedKey] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users List
      let snap;
      try {
        snap = await getDocs(collection(db, "users"));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "users");
        return;
      }
      const usersList = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
      // Sort users by last active timestamp
      usersList.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));
      setUsers(usersList);
      setFilteredUsers(usersList);

      // 2. Fetch Public Config
      let pubSnap;
      try {
        pubSnap = await getDoc(doc(db, "config", "public"));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "config/public");
        return;
      }
      if (pubSnap && pubSnap.exists()) {
        const d = pubSnap.data();
        setPayLink(d.paymentLink || "");
        setPriceText(d.price || "₼4.99/ay");
        setWhatsapp(d.whatsapp || "");
      }

      // 3. Fetch Secret Key (without throwing if missing)
      let secSnap;
      try {
        secSnap = await getDoc(doc(db, "config", "secret"));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "config/secret");
        return;
      }
      if (secSnap && secSnap.exists()) {
        setSharedKey(secSnap.data().anthropicKey || "");
      }
    } catch (err: any) {
      console.error("Admin loading error:", err);
      alert("Məlumatlar yüklənərkən icazə xətası baş verdi. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    const q = text.toLowerCase().trim();
    if (!q) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter(
          (u) =>
            (u.email || "").toLowerCase().includes(q) ||
            (u.name || "").toLowerCase().includes(q)
        )
      );
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      try {
        await setDoc(doc(db, "config", "public"), {
          paymentLink: payLink.trim(),
          price: priceText.trim() || "₼4.99/ay",
          whatsapp: whatsapp.trim(),
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "config/public");
        return;
      }

      if (sharedKey.trim()) {
        try {
          await setDoc(doc(db, "config", "secret"), {
            anthropicKey: sharedKey.trim(),
          }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, "config/secret");
          return;
        }
      }

      alert("Tənzimləmələr uğurla yadda saxlanıldı! ✓");
    } catch (err: any) {
      console.error("Error saving config:", err);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleGrantPremium = async (months: number) => {
    if (!selectedUser) return;
    const base = selectedUser.premiumUntil && selectedUser.premiumUntil > Date.now() ? selectedUser.premiumUntil : Date.now();
    const until = months > 0 ? base + months * 30 * 24 * 60 * 60 * 1000 : null;
    const plan = months > 0 ? `${months} aylıq Premium` : "Limitsiz Premium";

    try {
      try {
        await setDoc(
          doc(db, "users", selectedUser.id),
          {
            premium: true,
            premiumUntil: until,
            premiumPlan: plan,
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${selectedUser.id}`);
        return;
      }

      const updatedUser = { ...selectedUser, premium: true, premiumUntil: until, premiumPlan: plan };
      setSelectedUser(updatedUser);
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...updatedUser } : u)));
      setFilteredUsers(filteredUsers.map((u) => (u.id === selectedUser.id ? { ...u, ...updatedUser } : u)));
      alert("İstifadəçiyə uğurla Premium statusu verildi! ⭐");
    } catch (err: any) {
      alert("Xəta baş verdi: " + err.message);
    }
  };

  const handleRevokePremium = async () => {
    if (!selectedUser || !confirm("Bu istifadəçinin Premium statusunu ləğv etmək istədiyinizə əminsiniz?")) return;

    try {
      try {
        await setDoc(
          doc(db, "users", selectedUser.id),
          {
            premium: false,
            premiumUntil: null,
            premiumPlan: "",
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${selectedUser.id}`);
        return;
      }

      const updatedUser = { ...selectedUser, premium: false, premiumUntil: null, premiumPlan: "" };
      setSelectedUser(updatedUser);
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...updatedUser } : u)));
      setFilteredUsers(filteredUsers.map((u) => (u.id === selectedUser.id ? { ...u, ...updatedUser } : u)));
      alert("Premium statusu ləğv edildi.");
    } catch (err: any) {
      alert("Xəta baş verdi: " + err.message);
    }
  };

  const isUserPremium = (u: any) => {
    if (!u.premium) return false;
    if (u.premiumUntil && Date.now() > u.premiumUntil) return false;
    return true;
  };

  const fmtDT = (ms: number) => {
    if (!ms) return "Heç vaxt";
    return new Date(ms).toLocaleDateString("az-AZ", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Compute stats
  const premiumCount = users.filter(isUserPremium).length;
  const activeWeekCount = users.filter((u) => u.lastActive && Date.now() - u.lastActive < 7 * 24 * 60 * 60 * 1000).length;
  const numericPrice = parseFloat(priceText.replace(/[^\d.]/g, "")) || 4.99;
  const estimatedMRR = Math.round(premiumCount * numericPrice);

  if (loading) {
    return (
      <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-8 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
        <p className="text-sm text-gray-400">Admin paneli yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToApp}
          className="p-2 bg-[#1b1d22] hover:bg-[#22242b] border border-[#2a2d34] text-white rounded-xl cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[9px] bg-amber-500 text-gray-950 px-2 py-0.5 rounded font-black tracking-widest uppercase">
            👑 Admin Panel
          </span>
          <h2 className="text-xl font-black italic text-white uppercase mt-0.5">Tətbiq İdarəetməsi</h2>
        </div>
      </div>

      {selectedUser ? (
        /* Detailed User View */
        <div className="space-y-4">
          <button
            onClick={() => setSelectedUser(null)}
            className="text-amber-500 text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            ← Siyahıya qayıt
          </button>

          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 text-gray-950 font-black rounded-full flex items-center justify-center text-lg uppercase shadow">
                {(selectedUser.name || selectedUser.email || "?").charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                  {isUserPremium(selectedUser) && <Crown className="w-4 h-4 text-amber-500" />}
                  <span>{selectedUser.name || "Adsız"}</span>
                </h3>
                <p className="text-xs text-gray-400">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-[#131417] p-2 rounded-xl border border-[#2a2d34]">
                <span className="text-[9px] text-gray-500 uppercase font-black">Məşq Günləri</span>
                <div className="text-base font-black text-white mt-0.5">{selectedUser.programDays || 0}</div>
              </div>
              <div className="bg-[#131417] p-2 rounded-xl border border-[#2a2d34]">
                <span className="text-[9px] text-gray-500 uppercase font-black">Cari Çəki</span>
                <div className="text-base font-black text-white mt-0.5">
                  {selectedUser.weight ? `${selectedUser.weight} kq` : "—"}
                </div>
              </div>
              <div className="bg-[#131417] p-2 rounded-xl border border-[#2a2d34]">
                <span className="text-[9px] text-gray-500 uppercase font-black">Son Aktivlik</span>
                <div className="text-[10px] font-bold text-white mt-1 truncate">{fmtDT(selectedUser.lastActive)}</div>
              </div>
            </div>
          </div>

          {/* Premium controls card */}
          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 space-y-3">
            <h4 className="font-black italic text-amber-500 text-sm uppercase">Premium İdarəetməsi</h4>
            <div className="text-xs text-gray-300">
              Mövcud Status:{" "}
              <b className={isUserPremium(selectedUser) ? "text-emerald-400" : "text-red-400"}>
                {isUserPremium(selectedUser) ? "AKTİV" : "Deaktiv"}
              </b>
              {selectedUser.premiumUntil && (
                <span> (Bitmə tarixi: {fmtDT(selectedUser.premiumUntil)})</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => handleGrantPremium(1)}
                className="py-1.5 px-3 bg-[#131417] hover:bg-amber-500 hover:text-gray-950 border border-[#2a2d34] rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                +1 Ay Premium
              </button>
              <button
                onClick={() => handleGrantPremium(3)}
                className="py-1.5 px-3 bg-[#131417] hover:bg-amber-500 hover:text-gray-950 border border-[#2a2d34] rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                +3 Ay Premium
              </button>
              <button
                onClick={() => handleGrantPremium(12)}
                className="py-1.5 px-3 bg-[#131417] hover:bg-amber-500 hover:text-gray-950 border border-[#2a2d34] rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                +12 Ay Premium
              </button>
              <button
                onClick={() => handleGrantPremium(0)}
                className="py-1.5 px-3 bg-amber-500 text-gray-950 rounded-xl text-xs font-black cursor-pointer transition-all"
              >
                Sonsuz / Limitsiz
              </button>
              {selectedUser.premium && (
                <button
                  onClick={handleRevokePremium}
                  className="py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                >
                  Ləğv et
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Overall Admin view */
        <div className="space-y-4">
          {/* Statistical boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center">
              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">İstifadəçilər</div>
              <div className="text-xl font-black text-amber-500 mt-0.5">{users.length}</div>
            </div>

            <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center">
              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Aktiv (7 gün)</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{activeWeekCount}</div>
            </div>

            <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center">
              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Premium Üzvlər</div>
              <div className="text-xl font-black text-blue-400 mt-0.5">{premiumCount}</div>
            </div>

            <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 text-center">
              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Təxmini Aylıq Gəlir</div>
              <div className="text-xl font-black text-pink-400 mt-0.5">₼{estimatedMRR}</div>
            </div>
          </div>

          {/* Configuration Setup Form */}
          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-1.5 text-white font-bold text-sm uppercase">
              <Settings2 className="w-4 h-4 text-amber-500" />
              <span>Ödəniş və Aİ Quraşdırmaları</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Ödəniş Səhifəsi Linki</label>
                <input
                  type="text"
                  placeholder="https://payriff.com/... (Hosted Link)"
                  value={payLink}
                  onChange={(e) => setPayLink(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Qiymət yazısı</label>
                <input
                  type="text"
                  placeholder="Məs. ₼4.99/ay"
                  value={priceText}
                  onChange={(e) => setPriceText(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">WhatsApp Əlaqə nömrəsi</label>
                <input
                  type="text"
                  placeholder="Məs. +994 50 123 45 67"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Paylaşılan Süni Zəka Açarı</label>
                <input
                  type="password"
                  placeholder="Açarı dəyişmək istəyirsinizsə, yenisini daxil edin"
                  value={sharedKey}
                  onChange={(e) => setSharedKey(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-gray-950 font-black rounded-xl cursor-pointer transition-all text-xs uppercase"
            >
              {savingConfig ? "Yadda saxlanılır..." : "Tənzimləmələri yadda saxla"}
            </button>
          </div>

          {/* Users List with search */}
          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="E-poçt və ya ad üzrə axtarış..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none text-sm focus:border-amber-500"
              />
            </div>

            <div className="divide-y divide-[#2a2d34]/60 space-y-2.5">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className="w-full pt-2.5 first:pt-0 flex items-center justify-between text-left hover:bg-[#22242b]/20 px-1 rounded-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#131417] border border-[#2a2d34] text-amber-500 rounded-xl flex items-center justify-center font-bold uppercase text-sm">
                      {(u.name || u.email || "?").charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        {isUserPremium(u) && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                        <span>{u.name || "Adsız"}</span>
                      </div>
                      <div className="text-[10px] text-gray-500">{u.email}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-gray-300">
                      {u.weight ? `${u.weight} kq` : "—"}
                    </div>
                    <div className="text-[9px] text-gray-500 font-bold mt-0.5">
                      {u.lastActive ? fmtDT(u.lastActive).split(",")[0] : "—"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RefreshCw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M16 3h5v5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 21H3v-5" />
    </svg>
  );
}
