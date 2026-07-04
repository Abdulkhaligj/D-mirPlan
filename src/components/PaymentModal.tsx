import React, { useState } from "react";
import { Sparkles, ShieldCheck, X, CreditCard, Lock, Calendar } from "lucide-react";

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: (plan: string, premiumUntil: number | null) => void;
  priceText: string;
  paymentLink?: string;
  whatsapp?: string;
}

export default function PaymentModal({ onClose, onSuccess, priceText, paymentLink, whatsapp }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [activeMethod, setActiveMethod] = useState<"card" | "manual">("card");

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvv || !nameOnCard) {
      setError("Zəhmət olmasa bütün kart xanalarını doldurun.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Direct call to simulate card clearing gateway securely
      const res = await fetch("/api/activate-premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "1 Aylıq Premium",
          months: 1,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      onSuccess(data.plan, data.premiumUntil);
    } catch (err: any) {
      setError(err.message || "Ödəniş baş tutmadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl w-full max-w-md p-6 relative space-y-6 shadow-2xl">
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
            💳 Kart ilə Ödə
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
            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Kart sahibinin adı</label>
              <input
                type="text"
                placeholder="Ad və Soyad"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-sm focus:border-amber-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Kart nömrəsi</label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  maxLength={19}
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                    const matches = v.match(/\d{4,16}/g);
                    const match = (matches && matches[0]) || "";
                    const parts = [];

                    for (let i = 0, len = match.length; i < len; i += 4) {
                      parts.push(match.substring(i, i + 4));
                    }

                    if (parts.length > 0) {
                      setCardNumber(parts.join(" "));
                    } else {
                      setCardNumber(v);
                    }
                  }}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none text-sm focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Bitmə tarixi</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="AA/İİ"
                    value={expiry}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                      if (v.length >= 2) {
                        setExpiry(v.substring(0, 2) + "/" + v.substring(2, 4));
                      } else {
                        setExpiry(v);
                      }
                    }}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none text-sm focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">CVV / CVC</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    maxLength={3}
                    placeholder="000"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none text-sm focus:border-amber-500 font-mono"
                  />
                </div>
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
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-gray-950 font-black rounded-xl cursor-pointer transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {loading ? "Tranzaksiya işlənir..." : "Ödənişi Təsdiqləyin"}
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              M10, kənar ödəniş linkləri və ya əl ilə köçürmə vasitəsilə ödəmək istəyirsinizsə, aşağıdakı üsullardan istifadə edə bilərsiniz. Ödənişdən sonra admin dərhal hesabınızı aktivləşdirəcəkdir.
            </p>

            {paymentLink ? (
              <a
                href={paymentLink}
                target="_blank"
                referrerPolicy="no-referrer"
                className="block w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl text-center transition-all text-xs uppercase tracking-wider"
              >
                🔗 Ödəniş Səhifəsinə Keç (M10 / Kart)
              </a>
            ) : (
              <div className="bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">M10 Köçürməsi</span>
                <span className="text-sm font-black text-white mt-1 block">Yaxınlıqda Admin tərəfindən M10 nömrəsi qeyd ediləcəkdir.</span>
              </div>
            )}

            {whatsapp ? (
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                referrerPolicy="no-referrer"
                className="block w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-center transition-all text-xs uppercase tracking-wider"
              >
                💬 WhatsApp ilə müraciət et
              </a>
            ) : (
              <a
                href="https://wa.me/994500000000"
                target="_blank"
                referrerPolicy="no-referrer"
                className="block w-full py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-center transition-all text-xs uppercase tracking-wider border border-emerald-500/20"
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

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 text-center uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-bit SSL Təhlükəsiz Kart Ödənişi</span>
        </div>
      </div>
    </div>
  );
}
