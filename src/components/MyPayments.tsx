import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Calendar, 
  DollarSign, 
  User, 
  Lock, 
  Sparkles,
  ChevronRight,
  Clock
} from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  query,
  orderBy
} from "firebase/firestore";
import { jsPDF } from "jspdf";

interface SavedCard {
  cardHolder: string;
  cardNumber: string; // masked (e.g. "4169 73** **** 4321")
  expiry: string;
  cardType: "visa" | "mastercard" | "unknown";
}

interface SubscriptionInfo {
  status: "active" | "canceled" | "none";
  price: string;
  planName: string;
  startDate: number | null;
  nextPaymentDate: number | null;
}

interface PaymentRecord {
  id: string;
  date: number;
  amount: string;
  cardUsed: string;
  status: "success" | "failed";
}

interface MyPaymentsProps {
  user: any;
  lang?: "az" | "en" | "de" | "ru";
  onPremiumUpdate?: (premium: boolean, premiumUntil: number | null, plan: string) => void;
  onTriggerPayment?: () => void;
}

export default function MyPayments({ 
  user, 
  lang = "az", 
  onPremiumUpdate,
  onTriggerPayment
}: MyPaymentsProps) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [savedCard, setSavedCard] = useState<SavedCard | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    status: "none",
    price: "₼4.99",
    planName: "Aylıq Sınırsız",
    startDate: null,
    nextPaymentDate: null
  });
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);

  // Form states for new card
  const [cardNoInput, setCardNoInput] = useState("");
  const [cardHolderInput, setCardHolderInput] = useState("");
  const [expiryInput, setExpiryInput] = useState("");
  const [cvvInput, setCvvInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Success Feedback Toast/Message
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Multi-lingual dictionary
  const t = {
    az: {
      title: "Ödənişlərim & Abunəlik",
      subtitle: "Aktiv abunəliyinizi idarə edin, kart məlumatlarınızı yeniləyin və ödəniş tarixçənizi izləyin.",
      cardTitle: "Yadda saxlanılan kart",
      noCard: "Yadda saxlanılmış kart yoxdur",
      addCardBtn: "Kart Əlavə Et",
      changeCardBtn: "Kartı Dəyişdir",
      cardHolderLabel: "Kart Sahibi",
      cardNoLabel: "Kart Nömrəsi",
      expiryLabel: "Bitmə Tarixi",
      cvvLabel: "CVV/CVC",
      saveCardBtn: "Kartı Yadda Saxla",
      savingBtn: "Saxlanılır...",
      subSectionTitle: "Abunəlik Statusu",
      subActive: "Aktiv",
      subCanceled: "Ləğv edilib",
      subNone: "Abunəlik yoxdur",
      subPrice: "Tarif",
      subPlan: "Paket",
      startDate: "Başlama tarixi",
      nextDate: "Növbəti ödəniş",
      cancelSubBtn: "Abunəliyi İptal Et",
      renewSubBtn: "Abunəliyi Yenidən Aktiv Et",
      buySubBtn: "Premium Abunəlik Al",
      historyTitle: "Ödəniş Tarixçəsi",
      noHistory: "Ödəniş tarixçəsi tapılmadı",
      invoiceId: "Faktura ID",
      date: "Tarix",
      amount: "Məbləğ",
      status: "Status",
      statusSuccess: "Uğurlu",
      statusFailed: "Uğursuz",
      downloadPdf: "PDF Qəbz",
      simulationTitle: "⚡ Ödəniş Simulyasiyası (Sınaq Modu)",
      simulationDesc: "Kartınızdan növbəti aylıq ₼4.99 abunə haqqının avtomatik çıxılmasını simulyasiya edin. Bu, ödəniş tarixçənizdə real yeni faktura yaradacaq və abunəliyinizi 30 gün uzadacaqdır.",
      simulateBtn: "Simulyasiya Et (₼4.99 çıxılsın)",
      simulating: "Ödəniş həyata keçirilir...",
      invalidCard: "Daxil edilmiş kart məlumatları düzgün deyil.",
      cardSavedSuccess: "Kart məlumatlarınız uğurla yeniləndi!",
      subCanceledSuccess: "Abunəliyiniz növbəti ödəniş tarixinə qədər aktiv qalmaqla ləğv edildi.",
      subRenewedSuccess: "Abunəliyiniz yenidən aktivləşdirildi!",
      simulatedSuccess: "Simulyasiya uğurlu! Kartınızdan ₼4.99 çıxıldı və abunəlik 30 gün uzadıldı. Faktura əlavə olundu.",
      removeCardConfirm: "Yadda saxlanılan kartı silmək istədiyinizdən əminsiniz? Bu abunəliyinizə təsir edə bilər.",
      cardRemoved: "Kart məlumatları silindi.",
      autoRenewLabel: "Avtomatik yenilənmə",
      autoRenewActiveDesc: "Hər ay avtomatik yenilənir",
      autoRenewDisabledDesc: "Yenilənmə dayandırılıb"
    },
    en: {
      title: "My Payments & Subscription",
      subtitle: "Manage your active subscription, update your card details, and track your payment history.",
      cardTitle: "Saved Payment Card",
      noCard: "No card saved on file",
      addCardBtn: "Add Card",
      changeCardBtn: "Change Card",
      cardHolderLabel: "Cardholder Name",
      cardNoLabel: "Card Number",
      expiryLabel: "Expiry Date",
      cvvLabel: "CVV/CVC",
      saveCardBtn: "Save Payment Card",
      savingBtn: "Saving...",
      subSectionTitle: "Subscription Details",
      subActive: "Active",
      subCanceled: "Canceled",
      subNone: "No active subscription",
      subPrice: "Price",
      subPlan: "Plan",
      startDate: "Start Date",
      nextDate: "Next Billing Date",
      cancelSubBtn: "Cancel Subscription",
      renewSubBtn: "Re-activate Subscription",
      buySubBtn: "Upgrade to Premium",
      historyTitle: "Billing History",
      noHistory: "No billing logs found",
      invoiceId: "Invoice ID",
      date: "Date",
      amount: "Amount",
      status: "Status",
      statusSuccess: "Successful",
      statusFailed: "Failed",
      downloadPdf: "PDF Receipt",
      simulationTitle: "⚡ Monthly Charge Simulator (Demo)",
      simulationDesc: "Test the automatic recurring monthly payment cycle of ₼4.99. It simulates a dynamic charge on your saved card, generates a real invoice, and extends access by 30 days.",
      simulateBtn: "Trigger Monthly Charge (₼4.99)",
      simulating: "Processing payment...",
      invalidCard: "Please verify card number, expiration date, and CVV.",
      cardSavedSuccess: "Payment card updated successfully!",
      subCanceledSuccess: "Your recurring subscription has been canceled. Premium remains active until expiry.",
      subRenewedSuccess: "Your subscription auto-renewal was successfully restored!",
      simulatedSuccess: "Simulation complete! ₼4.99 deducted. Subscription renewed for 30 days. New invoice generated.",
      removeCardConfirm: "Are you sure you want to remove this card? Auto-renew will be paused.",
      cardRemoved: "Payment card deleted.",
      autoRenewLabel: "Auto-renewal",
      autoRenewActiveDesc: "Renews automatically each month",
      autoRenewDisabledDesc: "Renewal is disabled"
    },
    ru: {
      title: "Мои платежи и Подписка",
      subtitle: "Управляйте активной подпиской, обновляйте данные карты и отслеживайте историю платежей.",
      cardTitle: "Сохраненная карта",
      noCard: "Нет сохраненных карт",
      addCardBtn: "Добавить карту",
      changeCardBtn: "Изменить карту",
      cardHolderLabel: "Владелец карты",
      cardNoLabel: "Номер карты",
      expiryLabel: "Срок действия",
      cvvLabel: "CVV/CVC",
      saveCardBtn: "Сохранить карту",
      savingBtn: "Сохранение...",
      subSectionTitle: "Детали подписки",
      subActive: "Активна",
      subCanceled: "Отменена",
      subNone: "Нет подписки",
      subPrice: "Стоимость",
      subPlan: "Тариф",
      startDate: "Дата начала",
      nextDate: "Следующий платеж",
      cancelSubBtn: "Отменить подписку",
      renewSubBtn: "Активировать заново",
      buySubBtn: "Купить Premium",
      historyTitle: "История платежей",
      noHistory: "История платежей пуста",
      invoiceId: "Фактура ID",
      date: "Дата",
      amount: "Сумма",
      status: "Статус",
      statusSuccess: "Успешно",
      statusFailed: "Ошибка",
      downloadPdf: "Чек PDF",
      simulationTitle: "⚡ Симуляция платежа (Демо)",
      simulationDesc: "Симулируйте автоматическое ежемесячное списание ₼4.99. Это спишет средства, создаст новую фактуру в реальном времени и продлит Premium еще на 30 дней.",
      simulateBtn: "Списать с карты (₼4.99)",
      simulating: "Обработка...",
      invalidCard: "Проверьте правильность введенных данных карты.",
      cardSavedSuccess: "Карта успешно сохранена!",
      subCanceledSuccess: "Подписка отменена. Премиум останется активным до даты окончания.",
      subRenewedSuccess: "Подписка успешно возобновлена!",
      simulatedSuccess: "Успешно! ₼4.99 списано, подписка продлена на 30 дней, чек добавлен.",
      removeCardConfirm: "Вы уверены, что хотите удалить карту? Автопродление будет отключено.",
      cardRemoved: "Карта удалена.",
      autoRenewLabel: "Автопродление",
      autoRenewActiveDesc: "Продлевается автоматически",
      autoRenewDisabledDesc: "Продление отключено"
    },
    de: {
      title: "Meine Zahlungen & Abo",
      subtitle: "Verwalten Sie Ihr aktives Abonnement, aktualisieren Sie Ihre Kartendetails und verfolgen Sie Ihren Rechnungsverlauf.",
      cardTitle: "Gespeicherte Karte",
      noCard: "Keine Zahlungskarte hinterlegt",
      addCardBtn: "Karte hinzufügen",
      changeCardBtn: "Karte ändern",
      cardHolderLabel: "Karteninhaber",
      cardNoLabel: "Kartennummer",
      expiryLabel: "Gültig bis",
      cvvLabel: "CVV/CVC",
      saveCardBtn: "Zahlungskarte speichern",
      savingBtn: "Speichern...",
      subSectionTitle: "Abonnement-Details",
      subActive: "Aktiv",
      subCanceled: "Gekündigt",
      subNone: "Kein aktives Abonnement",
      subPrice: "Preis",
      subPlan: "Paket",
      startDate: "Startdatum",
      nextDate: "Nächste Abbuchung",
      cancelSubBtn: "Abonnement kündigen",
      renewSubBtn: "Abonnement reaktivieren",
      buySubBtn: "Premium abonnieren",
      historyTitle: "Zahlungsverlauf",
      noHistory: "Keine Zahlungsbelege gefunden",
      invoiceId: "Rechnungs-ID",
      date: "Datum",
      amount: "Betrag",
      status: "Status",
      statusSuccess: "Erfolgreich",
      statusFailed: "Fehlgeschlagen",
      downloadPdf: "PDF Quittung",
      simulationTitle: "⚡ Zyklische Abbuchung simulieren (Demo)",
      simulationDesc: "Simulieren Sie den automatischen monatlichen Abbuchungsprozess von ₼4.99. Dadurch wird Ihre Karte belastet, ein echter Beleg generiert und Ihr Premium-Status um 30 Tage verlängert.",
      simulateBtn: "Abbuchung auslösen (₼4.99)",
      simulating: "Zahlung wird verarbeitet...",
      invalidCard: "Kartenangaben sind ungültig.",
      cardSavedSuccess: "Kreditkarte erfolgreich aktualisiert!",
      subCanceledSuccess: "Ihr Abonnement wurde gekündigt. Premium bleibt bis zum Ablaufdatum aktiv.",
      subRenewedSuccess: "Abonnement wurde erfolgreich reaktiviert!",
      simulatedSuccess: "Erfolgreich! ₼4.99 abgebucht, Abonnement um 30 Tage verlängert, Rechnung hinzugefügt.",
      removeCardConfirm: "Sind Sie sicher, dass Sie diese Karte löschen möchten? Automatische Verlängerung wird gestoppt.",
      cardRemoved: "Zahlungskarte gelöscht.",
      autoRenewLabel: "Auto-Verlängerung",
      autoRenewActiveDesc: "Wird jeden Monat automatisch verlängert",
      autoRenewDisabledDesc: "Verlängerung ist deaktiviert"
    }
  }[lang];

  useEffect(() => {
    if (user?.uid) {
      loadPaymentData();
    }
  }, [user]);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // 1. Saved Card setup
        if (data.savedCard) {
          setSavedCard(data.savedCard);
        } else {
          setSavedCard(null);
        }

        // 2. Subscription state setup
        if (data.subscription) {
          setSubscription(data.subscription);
        } else if (data.premium) {
          // If they already had legacy premium flag
          const start = data.premiumSince || (Date.now() - 3 * 24 * 60 * 60 * 1000);
          const next = data.premiumUntil || (Date.now() + 27 * 24 * 60 * 60 * 1000);
          setSubscription({
            status: "active",
            price: "₼4.99",
            planName: data.premiumPlan || "Aylıq Sınırsız",
            startDate: start,
            nextPaymentDate: next
          });
        } else {
          setSubscription({
            status: "none",
            price: "₼4.99",
            planName: "Aylıq Sınırsız",
            startDate: null,
            nextPaymentDate: null
          });
        }
      }

      // 3. Payment history subcollection fetch
      const historyColl = collection(db, "users", user.uid, "payments");
      const hDocs = await getDocs(historyColl);
      
      const records: PaymentRecord[] = [];
      hDocs.forEach((docSnap) => {
        const d = docSnap.data();
        records.push({
          id: docSnap.id.substring(0, 8).toUpperCase(),
          date: d.date || Date.now(),
          amount: d.amount || "₼4.99",
          cardUsed: d.cardUsed || "**** **** **** 4321",
          status: d.status || "success"
        });
      });

      // Sort by date descending
      records.sort((a, b) => b.date - a.date);
      setHistory(records);

    } catch (err: any) {
      console.error("Error loading payment data:", err);
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}/payments`);
    } finally {
      setLoading(false);
    }
  };

  // Luhn Algorithm validation for realistic payment feel
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

  const handleCardNumberInput = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 16);
    // Add spaces for realistic display
    const parts = clean.match(/.{1,4}/g);
    setCardNoInput(parts ? parts.join(" ") : clean);
  };

  const handleExpiryInput = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 3) {
      setExpiryInput(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setExpiryInput(clean);
    }
  };

  const saveCardDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    const cleanCardNo = cardNoInput.replace(/\s+/g, "");
    const isLuhnValid = validateCardNumber(cleanCardNo);
    
    if (!isLuhnValid) {
      setFormError(t.invalidCard + " (Luhn yoxlaması uğursuz oldu)");
      setActionLoading(false);
      return;
    }

    const expiryParts = expiryInput.split("/");
    if (expiryParts.length !== 2 || parseInt(expiryParts[0]) < 1 || parseInt(expiryParts[0]) > 12) {
      setFormError(t.invalidCard + " (Müddət səhvdir)");
      setActionLoading(false);
      return;
    }

    if (cvvInput.length !== 3) {
      setFormError(t.invalidCard + " (CVV 3 rəqəmli olmalıdır)");
      setActionLoading(false);
      return;
    }

    try {
      const cardType = cleanCardNo.startsWith("4") 
        ? "visa" 
        : cleanCardNo.startsWith("5") 
          ? "mastercard" 
          : "unknown";

      const maskedNumber = `${cleanCardNo.substring(0, 4)} ${cleanCardNo.substring(4, 6)}** **** ${cleanCardNo.substring(12)}`;

      const newCard: SavedCard = {
        cardHolder: cardHolderInput.toUpperCase().trim(),
        cardNumber: maskedNumber,
        expiry: expiryInput,
        cardType
      };

      const userDocRef = doc(db, "users", user.uid);
      
      // Auto upgrade user to subscription active if they add a card and don't have premium
      let nextSub: SubscriptionInfo = { ...subscription };
      const currentEpoch = Date.now();
      const nextMonthEpoch = currentEpoch + 30 * 24 * 60 * 60 * 1000;

      if (subscription.status === "none") {
        nextSub = {
          status: "active",
          price: "₼4.99",
          planName: "Aylıq Sınırsız",
          startDate: currentEpoch,
          nextPaymentDate: nextMonthEpoch
        };

        // Write premium credentials to main document
        await updateDoc(userDocRef, {
          savedCard: newCard,
          premium: true,
          premiumPlan: "Aylıq Sınırsız",
          premiumUntil: nextMonthEpoch,
          subscription: nextSub
        });

        // Add a primary invoice for starting the subscription!
        const paymentCollRef = collection(db, "users", user.uid, "payments");
        await addDoc(paymentCollRef, {
          date: currentEpoch,
          amount: "₼4.99",
          cardUsed: maskedNumber,
          status: "success"
        });

        if (onPremiumUpdate) {
          onPremiumUpdate(true, nextMonthEpoch, "Aylıq Sınırsız");
        }
      } else {
        // Just update the card details
        await updateDoc(userDocRef, {
          savedCard: newCard
        });
      }

      setSavedCard(newCard);
      setSubscription(nextSub);
      setShowAddCard(false);
      
      // Reset form
      setCardNoInput("");
      setCardHolderInput("");
      setExpiryInput("");
      setCvvInput("");

      showFeedback("success", t.cardSavedSuccess);
      loadPaymentData(); // Refresh history list
    } catch (err: any) {
      console.error("Error saving card:", err);
      setFormError(err.message || "Failed to save card.");
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setActionLoading(false);
    }
  };

  const removeCard = async () => {
    if (!window.confirm(t.removeCardConfirm)) return;
    setActionLoading(true);

    try {
      const userDocRef = doc(db, "users", user.uid);
      
      // Cancel active subscription and remove saved card
      const updatedSub: SubscriptionInfo = {
        ...subscription,
        status: subscription.status === "active" ? "canceled" : subscription.status
      };

      await updateDoc(userDocRef, {
        savedCard: null,
        subscription: updatedSub
      });

      setSavedCard(null);
      setSubscription(updatedSub);
      showFeedback("success", t.cardRemoved);
    } catch (err) {
      console.error("Error removing card:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const cancelActiveSubscription = async () => {
    setActionLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const updatedSub: SubscriptionInfo = {
        ...subscription,
        status: "canceled"
      };

      await updateDoc(userDocRef, {
        subscription: updatedSub
      });

      setSubscription(updatedSub);
      showFeedback("success", t.subCanceledSuccess);
    } catch (err) {
      console.error("Error canceling subscription:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const renewActiveSubscription = async () => {
    if (!savedCard) {
      showFeedback("error", "Kart məlumatları olmadan abunəliyi bərpa etmək olmur. Əvvəlcə kart əlavə edin.");
      setShowAddCard(true);
      return;
    }

    setActionLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const updatedSub: SubscriptionInfo = {
        ...subscription,
        status: "active"
      };

      await updateDoc(userDocRef, {
        subscription: updatedSub
      });

      setSubscription(updatedSub);
      showFeedback("success", t.subRenewedSuccess);
    } catch (err) {
      console.error("Error renewing subscription:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Charge simulation - triggers automatic charge on current saved card, generating real transaction and extending membership
  const triggerSimulatedCharge = async () => {
    if (!savedCard) {
      showFeedback("error", "Abunəlik simulyasiyası üçün əvvəlcə kart məlumatı əlavə olunmalıdır.");
      return;
    }

    setActionLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      
      // Add exactly 30 days to next payment date
      const newStartDate = subscription.nextPaymentDate || Date.now();
      const newNextPaymentDate = newStartDate + 30 * 24 * 60 * 60 * 1000;

      const updatedSub: SubscriptionInfo = {
        ...subscription,
        status: "active", // Reactivates if was canceled
        startDate: newStartDate,
        nextPaymentDate: newNextPaymentDate
      };

      // Create new transaction doc in Firestore subcollection
      const paymentCollRef = collection(db, "users", user.uid, "payments");
      const transactionDoc = await addDoc(paymentCollRef, {
        date: Date.now(),
        amount: "₼4.99",
        cardUsed: savedCard.cardNumber,
        status: "success"
      });

      // Update user document info
      await updateDoc(userDocRef, {
        premium: true,
        premiumPlan: "Aylıq Sınırsız",
        premiumUntil: newNextPaymentDate,
        subscription: updatedSub
      });

      setSubscription(updatedSub);
      
      // Update local history array
      const newRecord: PaymentRecord = {
        id: transactionDoc.id.substring(0, 8).toUpperCase(),
        date: Date.now(),
        amount: "₼4.99",
        cardUsed: savedCard.cardNumber,
        status: "success"
      };
      setHistory([newRecord, ...history]);

      if (onPremiumUpdate) {
        onPremiumUpdate(true, newNextPaymentDate, "Aylıq Sınırsız");
      }

      showFeedback("success", t.simulatedSuccess);
    } catch (err: any) {
      console.error("Error simulating charge:", err);
      showFeedback("error", "Simulyasiya xətası baş verdi.");
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/payments`);
    } finally {
      setActionLoading(false);
    }
  };

  // jsPDF Receipt Generation
  const downloadReceiptPDF = (record: PaymentRecord) => {
    try {
      const docPdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5"
      });

      // Dark corporate identity colors
      const orangeColor = "#f59e0b";
      const blackColor = "#111827";

      // 1. Header background banner
      docPdf.setFillColor(17, 24, 39); // #111827
      docPdf.rect(0, 0, 148, 35, "F");

      // Title & Slogan
      docPdf.setTextColor(255, 255, 255);
      docPdf.setFont("helvetica", "bold");
      docPdf.setFontSize(18);
      docPdf.text("DƏMİRPLAN PRO", 12, 16);
      
      docPdf.setFont("helvetica", "normal");
      docPdf.setFontSize(8);
      docPdf.setTextColor(156, 163, 175); // light gray
      docPdf.text("SÜNİ ZƏKA İLƏ SMART FİTNESS PLATFORMASI", 12, 22);

      // Invoice Badge
      docPdf.setFillColor(245, 158, 11); // #f59e0b
      docPdf.rect(100, 10, 36, 8, "F");
      docPdf.setTextColor(17, 24, 39);
      docPdf.setFont("helvetica", "bold");
      docPdf.setFontSize(9);
      docPdf.text("Receipt / Qebz", 103, 15.5);

      // 2. Receipt metadata
      docPdf.setTextColor(17, 24, 39);
      docPdf.setFontSize(10);
      docPdf.setFont("helvetica", "bold");
      docPdf.text("FAKTURA / RECEIPT DETAILS:", 12, 48);

      docPdf.setFont("helvetica", "normal");
      docPdf.setFontSize(9);
      docPdf.setTextColor(75, 85, 99);
      
      const invoiceDateStr = new Date(record.date).toLocaleDateString(
        lang === "az" ? "az-AZ" : lang === "ru" ? "ru-RU" : "en-US", 
        { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
      );

      docPdf.text(`Faktura ID: ${record.id}`, 12, 55);
      docPdf.text(`Tarix: ${invoiceDateStr}`, 12, 61);
      docPdf.text(`Istifadeci: ${user.email}`, 12, 67);
      docPdf.text(`Sistem: Online Avtomatik Kart Odenisi`, 12, 73);

      // Line separator
      docPdf.setDrawColor(229, 231, 235);
      docPdf.line(12, 78, 136, 78);

      // 3. Billing item details
      docPdf.setFont("helvetica", "bold");
      docPdf.setTextColor(17, 24, 39);
      docPdf.text("XIDMƏT / ITEM DESCRIPTION", 12, 85);
      docPdf.text("MƏBLƏĞ / PRICE", 110, 85);

      docPdf.setFont("helvetica", "normal");
      docPdf.setTextColor(75, 85, 99);
      docPdf.text("Premium Sınırsız Aylıq Abunəlik", 12, 93);
      docPdf.text("Google Gemini AI Coach, Smart Nutrition, Soundscapes", 12, 98);
      docPdf.setFont("helvetica", "bold");
      docPdf.setTextColor(17, 24, 39);
      docPdf.text(record.amount, 110, 93);

      // Details block box
      docPdf.setFillColor(249, 250, 251);
      docPdf.rect(12, 105, 124, 25, "F");
      
      docPdf.setFont("helvetica", "normal");
      docPdf.setFontSize(8.5);
      docPdf.setTextColor(107, 114, 128);
      docPdf.text(`Odenis Metodu: Card (${record.cardUsed})`, 16, 111);
      docPdf.text(`Status: SUCCESSFUL / UGURLU (Kartdan avtomatik cixilmisdir)`, 16, 117);
      docPdf.text(`Novbeti abune muddeti: +30 gun uzadilmisdir`, 16, 123);

      // 4. Footer
      docPdf.line(12, 135, 136, 135);
      
      docPdf.setFont("helvetica", "italic");
      docPdf.setFontSize(8);
      docPdf.setTextColor(156, 163, 175);
      docPdf.text("DemirPlan Pro - Demir kimi beden, suni zeka komeyi ile.", 74, 141, { align: "center" });

      docPdf.save(`invoice-${record.id}.pdf`);
      showFeedback("success", lang === "az" ? "PDF qəbz uğurla endirildi! 📄" : "PDF receipt downloaded successfully! 📄");
    } catch (err) {
      console.error("PDF generation error:", err);
    }
  };

  const getCardBrandIcon = (maskedNum: string) => {
    if (maskedNum.startsWith("4")) {
      return (
        <div className="bg-blue-600 px-2 py-0.5 rounded text-[10px] text-white font-extrabold uppercase tracking-widest italic shadow-sm">
          Visa
        </div>
      );
    }
    return (
      <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] text-white font-extrabold uppercase tracking-widest shadow-sm">
        Mastercard
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in" id="mypayments-panel">
      {/* feedback message banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-start gap-2.5 border text-xs leading-relaxed shadow-xl animate-fade-in ${
          feedback.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <div>
            <span className="font-bold">{feedback.type === "success" ? "Uğurlu əməliyyat: " : "Xəta baş verdi: "}</span>
            {feedback.message}
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl p-5 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-2xl shrink-0">
            💳
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white uppercase italic">{t.title}</h2>
            <p className="text-[11px] text-gray-400 leading-normal mt-0.5 max-w-sm">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Subscription Status Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subscription Info Card */}
        <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl p-5 space-y-4 shadow-md flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center pb-2.5 border-b border-[#2a2d34]/60">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {t.subSectionTitle}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                subscription.status === "active" 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : subscription.status === "canceled"
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
              }`}>
                ● {subscription.status === "active" ? t.subActive : subscription.status === "canceled" ? t.subCanceled : t.subNone}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">{t.subPlan}:</span>
                <span className="font-extrabold text-white">{subscription.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t.subPrice}:</span>
                <span className="font-extrabold text-amber-500">{subscription.price}/ay</span>
              </div>
              {subscription.startDate && (
                <div className="flex justify-between">
                  <span className="text-gray-400">{t.startDate}:</span>
                  <span className="font-semibold text-white">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {subscription.nextPaymentDate && (
                <div className="flex justify-between">
                  <span className="text-gray-400">{t.nextDate}:</span>
                  <span className="font-extrabold text-white flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    {new Date(subscription.nextPaymentDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {subscription.status !== "none" && (
              <div className="flex justify-between items-center py-2.5 px-3 bg-[#131417]/80 rounded-2xl border border-[#2a2d34]/40 mt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white">
                    {t.autoRenewLabel}
                  </span>
                  <span className="text-[9px] text-gray-400 leading-normal mt-0.5">
                    {subscription.status === "active" ? t.autoRenewActiveDesc : t.autoRenewDisabledDesc}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={subscription.status === "active" ? cancelActiveSubscription : renewActiveSubscription}
                  disabled={actionLoading}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    subscription.status === "active" ? "bg-emerald-500" : "bg-gray-700"
                  } ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      subscription.status === "active" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#2a2d34]/60">
            {subscription.status === "active" && (
              <button
                onClick={cancelActiveSubscription}
                disabled={actionLoading}
                className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-extrabold text-[11px] rounded-xl uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.cancelSubBtn}
              </button>
            )}

            {subscription.status === "canceled" && (
              <button
                onClick={renewActiveSubscription}
                disabled={actionLoading}
                className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-extrabold text-[11px] rounded-xl uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t.renewSubBtn}
              </button>
            )}

            {subscription.status === "none" && (
              <button
                onClick={onTriggerPayment}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-gray-950 font-black text-[11px] rounded-xl uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t.buySubBtn}
              </button>
            )}
          </div>
        </div>

        {/* Credit Card Details Card */}
        <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl p-5 space-y-4 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2.5 border-b border-[#2a2d34]/60">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-500" />
                {t.cardTitle}
              </span>
              {savedCard && getCardBrandIcon(savedCard.cardNumber)}
            </div>

            {savedCard ? (
              /* Beautiful plastic-like virtual credit card representation */
              <div className="bg-gradient-to-br from-[#2b2e3a] via-[#1f2128] to-[#121318] border border-[#3b3f4f] rounded-2xl p-4 relative overflow-hidden shadow-inner flex flex-col justify-between h-32 font-mono">
                {/* Chip illustration */}
                <div className="flex justify-between items-start">
                  <div className="w-8 h-6 bg-amber-500/20 border border-amber-500/30 rounded-md flex flex-col gap-0.5 p-1 relative">
                    <div className="grid grid-cols-3 gap-0.5 h-full w-full">
                      <div className="border border-amber-500/20 rounded-sm"></div>
                      <div className="border border-amber-500/20 rounded-sm"></div>
                      <div className="border border-amber-500/20 rounded-sm"></div>
                    </div>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-gray-500" />
                </div>

                <div className="text-base text-white font-extrabold tracking-widest mt-2">
                  {savedCard.cardNumber}
                </div>

                <div className="flex justify-between items-end text-[9px] text-gray-400">
                  <div>
                    <span className="block uppercase text-[7px] text-gray-500 tracking-wider">Cardholder</span>
                    <span className="font-extrabold text-white uppercase tracking-wider">{savedCard.cardHolder}</span>
                  </div>
                  <div className="text-right">
                    <span className="block uppercase text-[7px] text-gray-500 tracking-wider">Expires</span>
                    <span className="font-extrabold text-white">{savedCard.expiry}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-[#2a2d34] rounded-2xl py-8 px-4 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-9 h-9 bg-gray-800/40 rounded-xl flex items-center justify-center text-gray-500 text-lg">
                  💳
                </div>
                <p className="text-[11px] text-gray-500">{t.noCard}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#2a2d34]/60 flex gap-2">
            {savedCard && (
              <button
                onClick={removeCard}
                disabled={actionLoading}
                className="px-3 py-2.5 bg-[#121317] hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-[#2a2d34] hover:border-red-500/20 rounded-xl cursor-pointer transition-all flex items-center justify-center"
                title="Kartı sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowAddCard(!showAddCard)}
              className={`flex-1 py-2.5 font-bold text-[11px] rounded-xl uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                showAddCard 
                  ? "bg-[#121317] border border-[#2a2d34] text-white" 
                  : "bg-amber-500 text-gray-950 hover:bg-amber-600"
              }`}
            >
              <Plus className="w-4 h-4 shrink-0" />
              {savedCard ? t.changeCardBtn : t.addCardBtn}
            </button>
          </div>
        </div>
      </div>

      {/* Add Card Form Modal / Expandable Area */}
      {showAddCard && (
        <form onSubmit={saveCardDetails} className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl p-5 space-y-4 animate-fade-in text-left">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#2a2d34]/60">
            <span className="text-xs font-black uppercase tracking-wider text-white">
              ✍️ {t.cardTitle}ni daxil edin
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                {t.cardHolderLabel}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="MƏS. ƏLİ MƏMMƏDOV"
                  value={cardHolderInput}
                  onChange={(e) => setCardHolderInput(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 pl-10 text-white focus:outline-none text-xs focus:border-amber-500 font-bold uppercase tracking-wider"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                {t.cardNoLabel}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-500">
                  <CreditCard className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="4169 7388 1234 5678"
                  value={cardNoInput}
                  onChange={(e) => handleCardNumberInput(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 pl-10 text-white focus:outline-none text-xs focus:border-amber-500 font-mono font-bold tracking-widest"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  {t.expiryLabel}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiryInput}
                    onChange={(e) => handleExpiryInput(e.target.value)}
                    className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl p-3 pl-8 text-white focus:outline-none text-xs focus:border-amber-500 font-mono font-bold text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  {t.cvvLabel}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-gray-500">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
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

          {formError && (
            <div className="text-red-400 text-xs p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2 border-t border-[#2a2d34]/60">
            <button
              type="button"
              onClick={() => {
                setShowAddCard(false);
                setFormError(null);
              }}
              className="py-2.5 px-4 bg-[#121317] border border-[#2a2d34] text-gray-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
            >
              İmtina
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-gray-950 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1 shadow-md"
            >
              {actionLoading ? t.savingBtn : t.saveCardBtn}
            </button>
          </div>
        </form>
      )}

      {/* Developer/Testing Simulation Area - Dynamic monthly charge simulation */}
      {savedCard && (
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl p-5 space-y-4 shadow-md text-left relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-start gap-3">
            <span className="text-lg">🔁</span>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                {t.simulationTitle}
              </h4>
              <p className="text-[10.5px] text-gray-400 leading-relaxed max-w-sm">
                {t.simulationDesc}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              onClick={triggerSimulatedCharge}
              disabled={actionLoading}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 font-black text-[11px] rounded-xl uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? "animate-spin" : ""}`} />
              {t.simulateBtn}
            </button>
          </div>
        </div>
      )}

      {/* Payment Records Section */}
      <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl p-5 space-y-4 shadow-md text-left">
        <div className="flex justify-between items-center pb-2.5 border-b border-[#2a2d34]/60">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            {t.historyTitle}
          </span>
          <span className="text-[9px] bg-amber-500/10 text-amber-500 font-extrabold rounded-lg px-2 py-0.5 uppercase tracking-wide">
            {history.length} {lang === "az" ? "Faktura" : lang === "ru" ? "чеков" : "invoices"}
          </span>
        </div>

        {history.length > 0 ? (
          <div className="space-y-3.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {history.map((record) => (
              <div 
                key={record.id} 
                className="bg-[#121317]/60 border border-[#2a2d34]/40 hover:border-amber-500/20 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-white">{record.id}</span>
                    <span className="text-[10px] text-gray-500 font-bold">•</span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(record.date).toLocaleDateString(lang === "az" ? "az-AZ" : lang === "ru" ? "ru-RU" : "en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">{t.cardNoLabel}:</span>
                    <span className="text-[10px] font-mono text-white font-semibold">{record.cardUsed}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-[#2a2d34]/40 pt-2.5 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-black text-amber-500">{record.amount}</div>
                    <span className="text-[9px] text-emerald-400 font-black uppercase tracking-wider block mt-0.5">
                      ✓ {t.statusSuccess}
                    </span>
                  </div>

                  <button
                    onClick={() => downloadReceiptPDF(record)}
                    className="p-2 bg-[#1b1d22] hover:bg-amber-500/10 border border-[#2a2d34] text-gray-400 hover:text-amber-500 rounded-xl cursor-pointer transition-all flex items-center justify-center"
                    title={t.downloadPdf}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
            <span className="text-3xl">🧾</span>
            <p className="text-xs text-gray-500">{t.noHistory}</p>
          </div>
        )}
      </div>

      {/* Safety Shield Info */}
      <div className="flex items-center justify-center gap-2 py-2 bg-theme-accent-10/20 border border-theme-accent-20 rounded-2xl">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">
          PCI-DSS UYĞUN SEYF ŞİFRƏLƏMƏ • 256-bit SSL ÖDƏNİŞ DAŞIYICISI
        </span>
      </div>
    </div>
  );
}
