import React, { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, getDocs, doc, setDoc, getDoc, deleteDoc, query, where } from "firebase/firestore";
import { User, ShieldAlert, Sparkles, Search, ArrowLeft, Crown, Settings2, ShieldCheck, Mail, Calendar, DollarSign, Activity, Clock, Trash2, CheckCircle, XCircle } from "lucide-react";
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
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const [adminToast, setAdminToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<{
    type: "approve" | "reject" | "delete" | "grant_1" | "grant_3" | "grant_12" | "grant_unlimited";
    req?: any;
    months?: number;
  } | null>(null);

  const triggerAdminToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setAdminToast({ message, type });
  };

  useEffect(() => {
    if (adminToast) {
      const timer = setTimeout(() => setAdminToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [adminToast]);

  // Reset revoke confirmation when selected user changes
  useEffect(() => {
    setShowRevokeConfirm(false);
  }, [selectedUser]);

  // General public configurations
  const [payLink, setPayLink] = useState("");
  const [priceText, setPriceText] = useState("₼4.99/ay");
  const [whatsapp, setWhatsapp] = useState("");
  const [sharedKey, setSharedKey] = useState("");
  const [adminCardNo, setAdminCardNo] = useState("");
  const [adminCardHolder, setAdminCardHolder] = useState("");
  const [adminCardBank, setAdminCardBank] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);

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
        setAdminCardNo(d.cardNo || "");
        setAdminCardHolder(d.cardHolder || "");
        setAdminCardBank(d.cardBank || "");
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

      // 4. Fetch Payment Requests
      let paySnap;
      try {
        paySnap = await getDocs(collection(db, "paymentRequests"));
      } catch (err) {
        console.error("Error fetching payment requests:", err);
      }
      if (paySnap) {
        const reqList = paySnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
        reqList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setPaymentRequests(reqList);
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
          cardNo: adminCardNo.trim(),
          cardHolder: adminCardHolder.trim(),
          cardBank: adminCardBank.trim(),
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

      triggerAdminToast("Tənzimləmələr uğurla yadda saxlanıldı! ✓", "success");
    } catch (err: any) {
      console.error("Error saving config:", err);
      triggerAdminToast("Tənzimləmələr yadda saxlanılarkən xəta: " + err.message, "error");
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
      triggerAdminToast("İstifadəçiyə uğurla Premium statusu verildi! ⭐", "success");
    } catch (err: any) {
      triggerAdminToast("Xəta baş verdi: " + err.message, "error");
    }
  };

  const handleRevokePremium = async () => {
    if (!selectedUser) return;

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
      setShowRevokeConfirm(false);
      triggerAdminToast("Premium statusu ləğv edildi.", "info");
    } catch (err: any) {
      triggerAdminToast("Xəta baş verdi: " + err.message, "error");
    }
  };

  const handleApproveRequest = (req: any) => {
    setPendingConfirm({ type: "approve", req });
  };

  const handleRejectRequest = (req: any) => {
    setPendingConfirm({ type: "reject", req });
  };

  const handleDeleteRequest = (reqId: string) => {
    setPendingConfirm({ type: "delete", req: { id: reqId } });
  };

  const executeConfirmedAction = async () => {
    if (!pendingConfirm) return;
    const { type, req } = pendingConfirm;
    setPendingConfirm(null);

    try {
      if (type === "approve" && req) {
        if (!req.id) throw new Error("Sorğu ID-si tapılmadı.");
        
        let targetUserId = req.userId;
        if (!targetUserId && req.userEmail) {
          const searchEmail = req.userEmail.trim().toLowerCase();
          if (searchEmail) {
            // 1. Try in-memory list first
            const found = users.find((u) => u.email && u.email.toLowerCase() === searchEmail);
            if (found) {
              targetUserId = found.id;
            } else {
              // 2. Try querying Firestore dynamically in case users list is stale
              try {
                const q = query(collection(db, "users"), where("email", "==", searchEmail));
                const qSnap = await getDocs(q);
                if (!qSnap.empty) {
                  targetUserId = qSnap.docs[0].id;
                }
              } catch (e) {
                console.error("Dynamic user query error:", e);
              }
            }
          }
        }

        // If STILL not found, use req.userId if available or generate a fallback ID
        if (!targetUserId) {
          targetUserId = req.userId || req.id || `user-fallback-${Date.now()}`;
        }

        // Update payment request status
        await setDoc(doc(db, "paymentRequests", req.id), { status: "approved" }, { merge: true });

        // Calculate premium expiry
        const premiumUntil = Date.now() + 30 * 24 * 60 * 60 * 1000;
        
        // Update users collection, also heal name/email if empty
        await setDoc(
          doc(db, "users", targetUserId),
          {
            premium: true,
            premiumUntil,
            premiumPlan: req.amount || "1 Aylıq Premium",
            email: req.userEmail || "",
            name: req.userName || "",
          },
          { merge: true }
        );

        // Update local state arrays reactively
        setPaymentRequests(paymentRequests.map((r) => (r.id === req.id ? { ...r, status: "approved" } : r)));

        const existingUser = users.find((u) => u.id === targetUserId);
        const updatedPremiumUser = {
          id: targetUserId,
          premium: true,
          premiumUntil,
          premiumPlan: req.amount || "1 Aylıq Premium",
          email: req.userEmail || (existingUser?.email || ""),
          name: req.userName || (existingUser?.name || "Adsız"),
          lastActive: existingUser?.lastActive || Date.now(),
          programDays: existingUser?.programDays || 0,
          weight: existingUser?.weight || null,
        };

        if (existingUser) {
          setUsers(users.map((u) => u.id === targetUserId ? { ...u, ...updatedPremiumUser } : u));
          setFilteredUsers(filteredUsers.map((u) => u.id === targetUserId ? { ...u, ...updatedPremiumUser } : u));
        } else {
          setUsers([updatedPremiumUser, ...users]);
          setFilteredUsers([updatedPremiumUser, ...filteredUsers]);
        }

        triggerAdminToast("Ödəniş uğurla təsdiqləndi və Premium aktivləşdirildi! 🎉", "success");
      } else if (type === "reject" && req) {
        await setDoc(doc(db, "paymentRequests", req.id), { status: "rejected" }, { merge: true });
        setPaymentRequests(paymentRequests.map((r) => (r.id === req.id ? { ...r, status: "rejected" } : r)));
        triggerAdminToast("Ödəniş sorğusu rədd edildi.", "info");
      } else if (type === "delete" && req) {
        await deleteDoc(doc(db, "paymentRequests", req.id));
        setPaymentRequests(paymentRequests.filter((r) => r.id !== req.id));
        triggerAdminToast("Sorğu tarixçədən silindi.", "success");
      }
    } catch (err: any) {
      triggerAdminToast("Xəta baş verdi: " + err.message, "error");
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
              {showRevokeConfirm ? (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 p-2 rounded-xl animate-fadeIn">
                  <span className="text-[10px] text-red-400 font-bold">Ləğv etmək istəyirsiniz?</span>
                  <button
                    onClick={handleRevokePremium}
                    className="py-1 px-2.5 bg-red-500 text-white hover:bg-red-600 rounded-lg text-[10px] font-black cursor-pointer transition-all"
                  >
                    Bəli, Ləğv et
                  </button>
                  <button
                    onClick={() => setShowRevokeConfirm(false)}
                    className="py-1 px-2.5 bg-[#131417] hover:bg-[#22242b] text-gray-400 border border-[#2a2d34] rounded-lg text-[10px] font-semibold cursor-pointer transition-all"
                  >
                    Xeyr
                  </button>
                </div>
              ) : (
                (selectedUser.premium || selectedUser.premiumUntil) && (
                  <button
                    onClick={() => setShowRevokeConfirm(true)}
                    className="py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    Ləğv et
                  </button>
                )
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
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Qiymət yazısı</label>
                <input
                  type="text"
                  placeholder="Məs. ₼4.99/ay"
                  value={priceText}
                  onChange={(e) => setPriceText(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">WhatsApp Əlaqə nömrəsi</label>
                <input
                  type="text"
                  placeholder="Məs. +994 50 123 45 67"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Paylaşılan Süni Zəka Açarı</label>
                <input
                  type="password"
                  placeholder="Açarı dəyişmək istəyirsinizsə, yenisini daxil edin"
                  value={sharedKey}
                  onChange={(e) => setSharedKey(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Admin Kart Nömrəsi (Direct Transfer)</label>
                <input
                  type="text"
                  placeholder="Məs. 4169 0000 0000 0000"
                  value={adminCardNo}
                  onChange={(e) => setAdminCardNo(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Kart Sahibi (Ad Soyad)</label>
                <input
                  type="text"
                  placeholder="Məs. ABDULKHALIG J."
                  value={adminCardHolder}
                  onChange={(e) => setAdminCardHolder(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Bankın Adı</label>
                <input
                  type="text"
                  placeholder="Məs. Kapital Bank, Leo Bank, ABB"
                  value={adminCardBank}
                  onChange={(e) => setAdminCardBank(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm"
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

          {/* Gözləyən Ödəniş Sorğuları */}
          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 space-y-4 animate-fadeIn">
            <h3 className="font-black italic text-sm text-white uppercase tracking-wider flex items-center gap-2">
              💵 Ödəniş Sorğuları ({paymentRequests.filter((r) => r.status === "pending").length} Gözləyən)
            </h3>

            {paymentRequests.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-2">Hələ ki, heç bir ödəniş sorğusu yoxdur.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 divide-y divide-[#2a2d34]/30">
                {paymentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="pt-3 first:pt-0 space-y-2"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-1.5 flex-wrap">
                          <span>{req.senderName}</span>
                          <span className="text-[10px] font-mono bg-[#131417] text-gray-400 px-1.5 py-0.5 rounded border border-[#2a2d34]">
                            **** {req.senderCardLast4}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{req.userEmail}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-amber-500 block">{req.amount}</span>
                        <span className="text-[9px] text-gray-500 block mt-0.5">{fmtDT(req.timestamp)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        Status:{" "}
                        <span
                          className={
                            req.status === "pending"
                              ? "text-amber-500 font-black animate-pulse"
                              : req.status === "approved"
                              ? "text-emerald-400 font-black"
                              : "text-red-400 font-black"
                          }
                        >
                          {req.status === "pending"
                            ? "Gözləyir ⏳"
                            : req.status === "approved"
                            ? "Təsdiqləndi ✓"
                            : "Rədd edilib ✗"}
                        </span>
                      </span>

                      {req.status === "pending" ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleApproveRequest(req)}
                            className="py-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black rounded-lg text-[10px] uppercase cursor-pointer transition-all"
                          >
                            Təsdiqlə
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req)}
                            className="py-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold rounded-lg text-[10px] uppercase cursor-pointer transition-all"
                          >
                            Rədd et
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteRequest(req.id)}
                          className="text-[10px] text-gray-500 hover:text-red-400 font-bold cursor-pointer transition-all"
                        >
                          Tarixçədən Sil
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500"
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

      {/* Custom Admin Toast Notification */}
      {adminToast && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 shadow-2xl flex items-center gap-3 animate-slideIn">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            adminToast.type === "success" 
              ? "bg-emerald-500/10 text-emerald-400" 
              : adminToast.type === "error"
              ? "bg-red-500/10 text-red-400"
              : "bg-blue-500/10 text-blue-400"
          }`}>
            {adminToast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : adminToast.type === "error" ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>
          <div className="text-xs font-bold text-white flex-1">{adminToast.message}</div>
          <button 
            onClick={() => setAdminToast(null)}
            className="text-[10px] font-black uppercase text-gray-500 hover:text-white ml-2 cursor-pointer shrink-0"
          >
            X
          </button>
        </div>
      )}

      {/* Custom Stateful Confirmation Modal */}
      {pendingConfirm && (
        <div className="fixed inset-0 bg-black/85 z-[90] flex items-center justify-center p-4">
          <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl w-full max-w-md p-6 relative space-y-5 shadow-2xl text-center animate-scaleIn">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${
              pendingConfirm.type === "approve"
                ? "bg-emerald-500/10 text-emerald-400"
                : pendingConfirm.type === "reject"
                ? "bg-red-500/10 text-red-400"
                : "bg-amber-500/10 text-amber-500"
            }`}>
              {pendingConfirm.type === "approve" ? (
                <CheckCircle className="w-6 h-6" />
              ) : pendingConfirm.type === "reject" ? (
                <XCircle className="w-6 h-6" />
              ) : (
                <Trash2 className="w-6 h-6" />
              )}
            </div>

            <div>
              <h3 className="font-black italic text-lg text-white uppercase tracking-wide">
                {pendingConfirm.type === "approve" 
                  ? "Ödənişi Təsdiqlə" 
                  : pendingConfirm.type === "reject" 
                  ? "Sorğunu Rədd Et" 
                  : "Tarixçəni Sil"}
              </h3>
              <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
                {pendingConfirm.type === "approve" && pendingConfirm.req
                  ? `${pendingConfirm.req.userEmail} ünvanına aid ${pendingConfirm.req.amount} məbləğində ödəniş sorğusunu təsdiqləyib Premium statusunu aktivləşdirmək istədiyinizə əminsiniz?`
                  : pendingConfirm.type === "reject" && pendingConfirm.req
                  ? `${pendingConfirm.req.userEmail} ünvanına aid ödəniş sorğusunu rədd etmək istədiyinizə əminsiniz?`
                  : "Bu sorğu qeydini tarixçədən həmişəlik silmək istədiyinizə əminsiniz?"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={executeConfirmedAction}
                className={`flex-1 py-3 text-xs font-black rounded-xl uppercase cursor-pointer transition-all ${
                  pendingConfirm.type === "approve"
                    ? "bg-emerald-500 hover:bg-emerald-600 text-gray-950"
                    : pendingConfirm.type === "reject"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-gray-950"
                }`}
              >
                Bəli, Təsdiq et
              </button>
              <button
                onClick={() => setPendingConfirm(null)}
                className="flex-1 py-3 bg-[#131417] hover:bg-[#22242b] border border-[#2a2d34] text-gray-400 font-bold rounded-xl text-xs uppercase transition-all cursor-pointer"
              >
                Xeyr, İmtina
              </button>
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
