import React, { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, X, CreditCard, Copy, Check, Info } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: (plan: string, premiumUntil: number | null) => void;
  priceText: string;
  paymentLink?: string;
  whatsapp?: string;
  cardNo?: string;
  cardHolder?: string;
  cardBank?: string;
  user?: any;
}

export default function PaymentModal({
  onClose,
  onSuccess,
  priceText,
  paymentLink,
  whatsapp,
  cardNo,
  cardHolder,
  cardBank,
  user,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Form Fields for Direct Transfer Confirmation
  const [senderName, setSenderName] = useState("");
  const [senderCardLast4, setSenderCardLast4] = useState("");
  const [activeMethod, setActiveMethod] = useState<"card" | "manual">("card");
  const [copied, setCopied] = useState(false);

  // Prefill name if available
  useEffect(() => {
    if (user?.displayName) {
      setSenderName(user.displayName);
    }
  }, [user]);

  const handleCopy = () => {
    if (!cardNo) return;
    navigator.clipboard.writeText(cardNo.replace(/\s+/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senderName.trim() || !senderCardLast4.trim()) {
      setError("Zəhmət olmasa Ad Soyadınızı və Ödəyən kartın son 4 rəqəmini daxil edin.");
      return;
    }

    if (senderCardLast4.trim().length < 4) {
      setError("Ödəyən kartın son 4 rəqəmini tam daxil edin (Məs. 4321).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("Ödəniş təsdiqi göndərmək üçün əvvəlcə sistemə daxil olmalısınız.");
      }

      // Add a request document to Firestore under paymentRequests
      await addDoc(collection(db, "paymentRequests"), {
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || "",
        senderName: senderName.trim(),
        senderCardLast4: senderCardLast4.trim(),
        amount: priceText,
        status: "pending",
        timestamp: Date.now(),
      });

      setRequestSubmitted(true);
    } catch (err: any) {
      console.error("Payment submission error:", err);
      setError(err.message || "Ödəniş sorğusu göndərilərkən xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  if (requestSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
        <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl w-full max-w-md p-6 relative space-y-5 shadow-2xl text-center">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 hover:bg-[#22242b] rounded-xl text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl">
            <Check className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <h3 className="font-black italic text-lg text-white uppercase tracking-wide">
              Sorğu Göndərildi! 🎉
            </h3>
            <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
              Ödəniş təsdiq sorğunuz uğurla adminə göndərildi. Kart köçürməniz admin tərəfindən yoxlanılıb təsdiqlənən kimi premium statusunuz dərhal aktivləşdiriləcəkdir.
            </p>
          </div>

          <div className="bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-left space-y-1.5 text-[11px] text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-500 font-bold uppercase">Hesab:</span>
              <span className="text-white font-black">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-bold uppercase">Məbləğ:</span>
              <span className="text-amber-500 font-black">{priceText}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-bold uppercase">Ödəyən Kart:</span>
              <span className="text-white font-mono font-bold">**** **** **** {senderCardLast4}</span>
            </div>
          </div>

          {whatsapp ? (
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `Salam! Mən ${user?.email || "istifadəçi"} olaraq ${priceText} məbləğində kart transferi ilə ödəniş etdim. Ödəyən: ${senderName}. Zəhmət olmasa təsdiqləyin.`
              )}`}
              target="_blank"
              referrerPolicy="no-referrer"
              className="block w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-center transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              💬 Qəbzi WhatsApp ilə göndər (Daha sürətli)
            </a>
          ) : (
            <a
              href={`https://wa.me/994500000000?text=${encodeURIComponent(
                `Salam! Mən ${user?.email || "istifadəçi"} olaraq ${priceText} məbləğində kart transferi ilə ödəniş etdim. Ödəyən: ${senderName}. Zəhmət olmasa təsdiqləyin.`
              )}`}
              target="_blank"
              referrerPolicy="no-referrer"
              className="block w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-center transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              💬 Qəbzi WhatsApp ilə göndər
            </a>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#131417] hover:bg-[#22242b] border border-[#2a2d34] text-gray-400 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Bağla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl w-full max-w-md p-6 relative space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 hover:bg-[#22242b] rounded-xl text-gray-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl mb-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-black italic text-lg text-white uppercase tracking-wide">
            ⭐ Premium Üzvlük
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Aİ Məşqçi Çatı, Aİ ilə fərdi məşq proqramlarının yaradılması və fizika şəkli yağ analizlərini dərhal aktivləşdirin!
          </p>
        </div>

        <div className="bg-[#131417] border border-[#2a2d34] rounded-xl p-3.5 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Premium Plan</span>
            <div className="text-sm font-black text-white">Aylıq Sınırsız Paket</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Məbləğ</span>
            <div className="text-base font-black text-amber-500">{priceText}</div>
          </div>
        </div>

        {/* Payment Methods Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#131417] border border-[#2a2d34] rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveMethod("card")}
            className={`py-2 px-3 rounded-lg text-center cursor-pointer transition-all ${
              activeMethod === "card"
                ? "bg-amber-500 text-gray-950 font-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            💳 Kart ilə Ödə (Birbaşa)
          </button>
          <button
            type="button"
            onClick={() => setActiveMethod("manual")}
            className={`py-2 px-3 rounded-lg text-center cursor-pointer transition-all ${
              activeMethod === "manual"
                ? "bg-amber-500 text-gray-950 font-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🤝 Digər (M10, WhatsApp)
          </button>
        </div>

        {activeMethod === "card" ? (
          <form onSubmit={handlePay} className="space-y-4">
            {/* Instruction Warning Card */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex gap-2.5 items-start text-left">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
              <div className="text-[10.5px] text-amber-400/90 leading-normal">
                <span className="font-bold text-amber-400">Təhlükəsiz Köçürmə:</span> Aşağıdakı kart nömrəmizə <span className="font-bold text-white">{priceText}</span> köçürün və köçürən kartın son 4 rəqəmini daxil edərək sorğu göndərin. Ödəniş birbaşa bizim karta daxil olacaqdır!
              </div>
            </div>

            {/* Admin's Receiver Card */}
            {cardNo && (
              <div className="bg-[#131417] border border-amber-500/20 rounded-xl p-4 text-left relative overflow-hidden space-y-3 shadow-inner">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Yükləmə Bankı</span>
                    <span className="text-xs font-black text-amber-500 uppercase tracking-wide">{cardBank || "KART TRANSFERİ"}</span>
                  </div>
                  <span className="text-sm">💳</span>
                </div>

                <div>
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Köçürülməli Kart Nömrəsi</span>
                  <div className="flex items-center justify-between gap-2 mt-0.5 bg-[#1b1d22] border border-[#2a2d34] px-3 py-2 rounded-lg">
                    <span className="text-sm font-mono font-bold text-white tracking-widest">{cardNo}</span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-1 hover:bg-[#2a2d34] rounded text-amber-500 hover:text-amber-400 transition-all cursor-pointer flex items-center justify-center"
                      title="Kopyala"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {cardHolder && (
                  <div>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Kart Sahibi (Ad Soyad)</span>
                    <span className="text-xs font-black text-white tracking-wide">{cardHolder.toUpperCase()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Payer fields */}
            <div className="border-t border-[#2a2d34]/60 pt-4 space-y-4">
              <span className="text-[10px] text-amber-500 font-black uppercase tracking-wider block">
                ✍️ Ödəniş Məlumatlarınızı Təsdiqləyin:
              </span>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Adınız və Soyadınız</label>
                <input
                  type="text"
                  placeholder="Məs. Əli Məmmədov"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Ödəyən Kartın Son 4 Rəqəmi</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Məs. 4321"
                  value={senderCardLast4}
                  onChange={(e) => setSenderCardLast4(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500 font-mono font-bold"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-xs text-center p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-gray-950 font-black rounded-xl cursor-pointer transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? "Sorğu göndərilir..." : "Ödənişi Tamamladım, Təsdiqlə"}
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center animate-fadeIn">
            <p className="text-xs text-gray-400 leading-relaxed">
              M10, Leo bank köçürmələri və ya əl ilə ödəniş etmək istəyirsinizsə aşağıdakı xidmətlərlə əlaqə yarada bilərsiniz. Ödənişdən sonra admin hesabınızı aktivləşdirəcəkdir.
            </p>

            {paymentLink ? (
              <a
                href={paymentLink}
                target="_blank"
                referrerPolicy="no-referrer"
                className="block w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl text-center transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                🔗 Ödəniş Səhifəsinə Keç (M10 / Kart)
              </a>
            ) : !cardNo && (
              <div className="bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">M10 Köçürməsi</span>
                <span className="text-sm font-black text-white mt-1 block">M10 nömrəsi üçün admin ilə əlaqə saxlayın.</span>
              </div>
            )}

            {whatsapp ? (
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                referrerPolicy="no-referrer"
                className="block w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-center transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                💬 WhatsApp ilə müraciət et
              </a>
            ) : (
              <a
                href="https://wa.me/994500000000"
                target="_blank"
                referrerPolicy="no-referrer"
                className="block w-full py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-center transition-all text-xs uppercase tracking-wider border border-emerald-500/20 cursor-pointer"
              >
                💬 WhatsApp Dəstək xətti
              </a>
            )}

            <div className="p-3 bg-[#131417] border border-[#2a2d34] rounded-xl text-[10px] text-gray-400 text-left space-y-1">
              <span className="font-bold text-white uppercase block mb-1">💡 ƏL İLƏ AKTİVLƏŞDİRMƏ:</span>
              <p>1. Köçürməni tamamladıqdan sonra qəbzi WhatsApp ilə bizə göndərin.</p>
              <p>2. Profilinizdəki e-mail ünvanınızı qeyd edin.</p>
              <p>3. Admin panelindən premium statusunuz saniyələr içində aktivləşdiriləcəkdir!</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 text-center uppercase tracking-wider pt-2 border-t border-[#2a2d34]/40">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-bit SSL Təhlükəsiz Ödəniş Sorğusu</span>
        </div>
      </div>
    </div>
  );
}
