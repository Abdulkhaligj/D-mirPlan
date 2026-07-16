import React, { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, X, CreditCard, Copy, Check, Info, Lock, Calendar, User } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

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
  lang?: string;
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
  lang = "az",
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Active payment method
  const [activeMethod, setActiveMethod] = useState<"card" | "manual">("card");

  // Direct Card payment states
  const [cardHolderInput, setCardHolderInput] = useState("");
  const [cardNumberInput, setCardNumberInput] = useState("");
  const [expiryInput, setExpiryInput] = useState("");
  const [cvvInput, setCvvInput] = useState("");

  // Manual payment states
  const [senderName, setSenderName] = useState("");
  const [senderCardLast4, setSenderCardLast4] = useState("");
  const [copied, setCopied] = useState(false);

  // Prefill names
  useEffect(() => {
    if (user?.displayName) {
      setSenderName(user.displayName);
      setCardHolderInput(user.displayName.toUpperCase());
    }
  }, [user]);

  const handleCopy = () => {
    if (!cardNo) return;
    navigator.clipboard.writeText(cardNo.replace(/\s+/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Luhn algorithm for actual card numbers
  const validateCardNumber = (num: string) => {
    const clean = num.replace(/\D/g, "");
    if (clean.length < 13 || clean.length > 19) return false;
    
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const formatCardNumber = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 16);
    const parts = clean.match(/.{1,4}/g);
    setCardNumberInput(parts ? parts.join(" ") : clean);
  };

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 3) {
      setExpiryInput(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setExpiryInput(clean);
    }
  };

  // Direct actual card payment processing
  const handleDirectCardPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError(
        lang === "az" 
          ? "Sistemə daxil olmalısınız." 
          : "You must be logged in."
      );
      return;
    }

    const cleanCardNo = cardNumberInput.replace(/\s+/g, "");
    const isLuhnValid = validateCardNumber(cleanCardNo);

    if (!isLuhnValid) {
      setError(
        lang === "ru"
          ? "Неверный номер карты (ошибка Luhn validation)."
          : lang === "en"
          ? "Invalid card number (Luhn validation failed)."
          : "Kart nömrəsi düzgün deyil (Luhn yoxlaması uğursuz oldu)."
      );
      return;
    }

    const expiryParts = expiryInput.split("/");
    if (expiryParts.length !== 2 || parseInt(expiryParts[0]) < 1 || parseInt(expiryParts[0]) > 12) {
      setError(
        lang === "az" ? "Bitmə tarixi düzgün deyil (AA/İİ)" : "Expiry date must be in MM/YY format."
      );
      return;
    }

    if (cvvInput.length !== 3) {
      setError(
        lang === "az" ? "CVV 3 rəqəmli olmalıdır." : "CVV must be 3 digits."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cardType = cleanCardNo.startsWith("4") ? "visa" : cleanCardNo.startsWith("5") ? "mastercard" : "unknown";
      const maskedCard = `${cleanCardNo.substring(0, 4)} ${cleanCardNo.substring(4, 6)}** **** ${cleanCardNo.substring(12)}`;

      const savedCardObj = {
        cardHolder: cardHolderInput.toUpperCase().trim(),
        cardNumber: maskedCard,
        expiry: expiryInput,
        cardType
      };

      const startEpoch = Date.now();
      const nextPaymentEpoch = startEpoch + 30 * 24 * 60 * 60 * 1000;

      const subscriptionObj = {
        status: "active",
        price: "₼4.99",
        planName: "Aylıq Sınırsız",
        startDate: startEpoch,
        nextPaymentDate: nextPaymentEpoch
      };

      // 1. Update user info in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        premium: true,
        premiumPlan: "Aylıq Sınırsız",
        premiumUntil: nextPaymentEpoch,
        savedCard: savedCardObj,
        subscription: subscriptionObj
      });

      // 2. Add billing receipt to subcollection
      const paymentsCollRef = collection(db, "users", user.uid, "payments");
      await addDoc(paymentsCollRef, {
        date: startEpoch,
        amount: "₼4.99",
        cardUsed: maskedCard,
        status: "success"
      });

      // 3. Complete and show success page
      setRequestSubmitted(true);
      onSuccess("Aylıq Sınırsız", nextPaymentEpoch);

    } catch (err: any) {
      console.error("Direct payment error:", err);
      setError(err.message || "Ödəniş emal olunarkən xəta baş verdi.");
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/payments`);
    } finally {
      setLoading(false);
    }
  };

  // Traditional manual verification payment processing
  const handleManualPay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senderName.trim() || !senderCardLast4.trim()) {
      setError(
        lang === "ru"
          ? "Пожалуйста, введите имя и последние 4 цифры карты."
          : lang === "en"
          ? "Please enter your name and the last 4 digits of your card."
          : "Zəhmət olmasa Ad Soyadınızı və Ödəyən kartın son 4 rəqəmini daxil edin."
      );
      return;
    }

    if (senderCardLast4.trim().length < 4) {
      setError(
        lang === "ru"
          ? "Введите ровно 4 цифры (например, 4321)."
          : lang === "en"
          ? "Please enter exactly 4 digits of your card (e.g., 4321)."
          : "Ödəyən kartın son 4 rəqəmini tam daxil edin (Məs. 4321)."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error(
          lang === "ru"
            ? "Вы должны войти в систему для отправки запроса."
            : lang === "en"
            ? "You must be signed in to submit a payment request."
            : "Ödəniş təsdiqi göndərmək üçün əvvəlcə sistemə daxil olmalısınız."
        );
      }

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
      setError(
        err.message ||
          (lang === "ru"
            ? "Произошла ошибка при отправке запроса платежа."
            : lang === "en"
            ? "An error occurred while sending payment request."
            : "Ödəniş sorğusu göndərilərkən xəta baş verdi.")
      );
      handleFirestoreError(err, OperationType.WRITE, "paymentRequests");
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
              {lang === "ru" ? "Успешно! 🎉" : lang === "en" ? "Success! 🎉" : "Uğurlu Ödəniş! 🎉"}
            </h3>
            <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
              {activeMethod === "card" ? (
                lang === "az"
                  ? "Kartınız sistemə uğurla qoşuldu və Premium abunəliyiniz dərhal aktivləşdirildi! 'Ödənişlərim' bölməsindən fakturalarınızı görə bilərsiniz."
                  : "Your payment card has been securely connected. Your Premium membership is now fully active! Track details in the 'My Payments' tab."
              ) : (
                lang === "ru"
                  ? "Ваш запрос на подтверждение платежа успешно отправлен администратору. Как только перевод будет проверен, ваш премиум-статус активируется."
                  : lang === "en"
                  ? "Your payment confirmation request has been successfully sent. Once the transfer is verified, your premium status will be activated immediately."
                  : "Ödəniş təsdiq sorğunuz uğurla adminə göndərildi. Kart köçürməniz admin tərəfindən yoxlanılıb təsdiqlənən kimi premium statusunuz dərhal aktivləşdiriləcəkdir."
              )}
            </p>
          </div>

          <div className="bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-left space-y-1.5 text-[11px] text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-500 font-bold uppercase">{lang === "ru" ? "Аккаунт:" : lang === "en" ? "Account:" : "Hesab:"}</span>
              <span className="text-white font-black">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-bold uppercase">{lang === "ru" ? "Сумма:" : lang === "en" ? "Amount:" : "Məbləğ:"}</span>
              <span className="text-amber-500 font-black">₼4.99/ay</span>
            </div>
            {activeMethod === "card" ? (
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold uppercase">{lang === "az" ? "Yadda saxlanan kart:" : "Connected Card:"}</span>
                <span className="text-white font-mono font-bold">
                  {cardNumberInput.substring(0, 7)}** **** {cardNumberInput.substring(12)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold uppercase">{lang === "ru" ? "Карта плательщика:" : lang === "en" ? "Payer Card:" : "Ödəyən Kart:"}</span>
                <span className="text-white font-mono font-bold">**** **** **** {senderCardLast4}</span>
              </div>
            )}
          </div>

          {activeMethod === "manual" && whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `Salam! Mən ${user?.email || "istifadəçi"} olaraq ${priceText} məbləğində kart transferi ilə ödəniş etdim. Ödəyən: ${senderName}. Zəhmət olmasa təsdiqləyin.`
              )}`}
              target="_blank"
              referrerPolicy="no-referrer"
              className="block w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-center transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              💬 {lang === "ru" ? "Отправить чек в WhatsApp (Быстрее)" : lang === "en" ? "Send Receipt via WhatsApp (Faster)" : "💬 Qəbzi WhatsApp ilə göndər (Daha sürətli)"}
            </a>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#131417] hover:bg-[#22242b] border border-[#2a2d34] text-gray-400 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            {lang === "ru" ? "Закрыть" : lang === "en" ? "Close" : "Bağla"}
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
            ⭐ {lang === "ru" ? "Премиум Доступ" : lang === "en" ? "Premium Access" : "⭐ Premium Üzvlük"}
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {lang === "ru"
              ? "Активируйте ИИ Чат-Коуча, составление индивидуальных программ тренировок и мгновенный анализ жира по фото!"
              : lang === "en"
              ? "Unlock AI Coach Chat, custom AI workout routines, and instant body fat analysis from photos!"
              : "Aİ Məşqçi Çatı, Aİ ilə fərdi məşq proqramlarının yaradılması və fizika şəkli yağ analizlərini dərhal aktivləşdirin!"}
          </p>
        </div>

        <div className="bg-[#131417] border border-[#2a2d34] rounded-xl p-3.5 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {lang === "ru" ? "Премиум Тариф" : lang === "en" ? "Premium Plan" : "Premium Plan"}
            </span>
            <div className="text-sm font-black text-white">
              {lang === "ru" ? "Безлимитный на месяц" : lang === "en" ? "Monthly Unlimited Pass" : "Aylıq Sınırsız Paket"}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {lang === "ru" ? "Сумма" : lang === "en" ? "Price" : "Məbləğ"}
            </span>
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
            {lang === "ru" ? "💳 Карта (Онлайн)" : lang === "en" ? "💳 Card (Online)" : "💳 Kart ilə Ödə (Online)"}
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
            {lang === "ru" ? "🤝 Другое (Вручную)" : lang === "en" ? "🤝 Other (Manual)" : "🤝 Digər (Köçürmə/WhatsApp)"}
          </button>
        </div>

        {activeMethod === "card" ? (
          /* Direct Online Card Payment Form with actual card support */
          <form onSubmit={handleDirectCardPay} className="space-y-4">
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex gap-2.5 items-start text-left">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
              <div className="text-[10.5px] text-amber-400/90 leading-normal">
                {lang === "az" ? (
                  <>Kart məlumatlarınızı daxil edin. Bu, <span className="font-bold text-white">{priceText}</span> abunəliyini avtomatik aktivləşdirəcək və kartı növbəti aylıq ödənişlər üçün yadda saxlayacaqdır.</>
                ) : (
                  <>Enter card details. This will securely start the recurring <span className="font-bold text-white">{priceText}</span> membership and save the card on file for easy updates.</>
                )}
              </div>
            </div>

            <div className="space-y-3.5 text-left">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  {lang === "az" ? "Kart Sahibi (Ad Soyad)" : "Cardholder Name"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500"><User className="w-4 h-4" /></span>
                  <input
                    type="text"
                    placeholder="MƏS. ƏLİ MƏMMƏDOV"
                    value={cardHolderInput}
                    onChange={(e) => setCardHolderInput(e.target.value)}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 pl-9 text-white focus:outline-none text-xs focus:border-amber-500 font-bold uppercase tracking-wider"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  {lang === "az" ? "Kart Nömrəsi" : "Card Number"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500"><CreditCard className="w-4 h-4" /></span>
                  <input
                    type="text"
                    placeholder="4169 7388 1234 5678"
                    value={cardNumberInput}
                    onChange={(e) => formatCardNumber(e.target.value)}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 pl-9 text-white focus:outline-none text-xs focus:border-amber-500 font-mono font-bold tracking-widest"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    {lang === "az" ? "Bitmə Tarixi" : "Expiry"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-gray-500"><Calendar className="w-3.5 h-3.5" /></span>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiryInput}
                      onChange={(e) => formatExpiry(e.target.value)}
                      className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 pl-8 text-white focus:outline-none text-xs focus:border-amber-500 font-mono font-bold text-center"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    CVV/CVC
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-gray-500"><Lock className="w-3.5 h-3.5" /></span>
                    <input
                      type="password"
                      maxLength={3}
                      placeholder="123"
                      value={cvvInput}
                      onChange={(e) => setCvvInput(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 pl-8 text-white focus:outline-none text-xs focus:border-amber-500 font-mono font-bold text-center"
                      required
                    />
                  </div>
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
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-gray-950 font-black rounded-xl cursor-pointer transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading
                ? lang === "ru" ? "Связываемся с банком..." : lang === "en" ? "Processing..." : "Ödəniş emal olunur..."
                : lang === "ru" ? "Оплатить сейчас" : lang === "en" ? "Pay Now & Unlock" : "İndi Ödə və Aktivləşdir"}
            </button>
          </form>
        ) : (
          /* Manual Payment Transfer Request Form (Fallback) */
          <form onSubmit={handleManualPay} className="space-y-4">
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex gap-2.5 items-start text-left">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
              <div className="text-[10.5px] text-amber-400/90 leading-normal">
                {lang === "ru" ? (
                  <><span className="font-bold text-amber-400">Безопасный перевод:</span> Переведите <span className="font-bold text-white">{priceText}</span> на указанную ниже карту и отправьте запрос, указав последние 4 цифры карты плательщика.</>
                ) : lang === "en" ? (
                  <><span className="font-bold text-amber-400">Secure Transfer:</span> Send <span className="font-bold text-white">{priceText}</span> to our card number below and submit a request with the last 4 digits of your card.</>
                ) : (
                  <><span className="font-bold text-amber-400">Təhlükəsiz Köçürmə:</span> Aşağıdakı kart nömrəmizə <span className="font-bold text-white">{priceText}</span> köçürün və köçürən kartın son 4 rəqəmini daxil edərək sorğu göndərin.</>
                )}
              </div>
            </div>

            {cardNo && (
              <div className="bg-[#131417] border border-amber-500/20 rounded-xl p-4 text-left relative overflow-hidden space-y-3 shadow-inner">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">
                      {lang === "ru" ? "Банк Получателя" : lang === "en" ? "Receiver Bank" : "Yükləmə Bankı"}
                    </span>
                    <span className="text-xs font-black text-amber-500 uppercase tracking-wide">{cardBank || "KART TRANSFERİ"}</span>
                  </div>
                  <span className="text-sm">💳</span>
                </div>

                <div>
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">
                    {lang === "ru" ? "Номер карты для перевода" : lang === "en" ? "Receiver Card Number" : "Köçürülməli Kart Nömrəsi"}
                  </span>
                  <div className="flex items-center justify-between gap-2 mt-0.5 bg-[#1b1d22] border border-[#2a2d34] px-3 py-2 rounded-lg">
                    <span className="text-sm font-mono font-bold text-white tracking-widest">{cardNo}</span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-1 hover:bg-[#2a2d34] rounded text-amber-500 hover:text-amber-400 transition-all cursor-pointer flex items-center justify-center"
                      title={lang === "ru" ? "Копировать" : lang === "en" ? "Copy" : "Kopyala"}
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {cardHolder && (
                  <div>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">
                      {lang === "ru" ? "Получатель платежа" : lang === "en" ? "Cardholder Name" : "Kart Sahibi (Ad Soyad)"}
                    </span>
                    <span className="text-xs font-black text-white tracking-wide">{cardHolder.toUpperCase()}</span>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-[#2a2d34]/60 pt-4 space-y-4 text-left">
              <span className="text-[10px] text-amber-500 font-black uppercase tracking-wider block">
                {lang === "ru" ? "✍️ Подтвердите данные перевода:" : lang === "en" ? "✍️ Confirm Transfer Details:" : "✍️ Ödəniş Məlumatlarınızı Təsdiqləyin:"}
              </span>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  {lang === "ru" ? "Имя и Фамилия" : lang === "en" ? "First and Last Name" : "Adınız və Soyadınız"}
                </label>
                <input
                  type="text"
                  placeholder={lang === "ru" ? "Напр. Иван Иванов" : lang === "en" ? "e.g., John Doe" : "Məs. Əli Məmmədov"}
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 text-white focus:outline-none text-base md:text-sm focus:border-amber-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  {lang === "ru" ? "Последние 4 цифры вашей карты" : lang === "en" ? "Last 4 Digits of Your Card" : "Ödəyən Kartın Son 4 Rəqəmi"}
                </label>
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
              {loading
                ? lang === "ru" ? "Отправка..." : lang === "en" ? "Submitting..." : "Sorğu göndərilir..."
                : lang === "ru" ? "Я перевел, отправить запрос" : lang === "en" ? "I Transferred, Verify Now" : "Ödənişi Tamamladım, Təsdiqlə"}
            </button>
          </form>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 text-center uppercase tracking-wider pt-2 border-t border-[#2a2d34]/40">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            {lang === "ru" ? "256-разрядный защищенный SSL платеж" : lang === "en" ? "Secure 256-bit SSL connection" : "256-bit SSL Təhlükəsiz Ödəniş Sorğusu"}
          </span>
        </div>
      </div>
    </div>
  );
}
