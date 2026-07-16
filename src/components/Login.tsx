import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { Dumbbell, Eye, EyeOff, Sparkles, Mail, Lock, User } from "lucide-react";

interface LoginProps {
  onSuccess: () => void;
  defaultMode?: "login" | "register";
  lang?: string;
}

export default function Login({ onSuccess, defaultMode, lang = "az" }: LoginProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">(defaultMode || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const translateError = (code: string) => {
    if (lang === "ru") {
      switch (code) {
        case "auth/invalid-credential":
          return "Неверный адрес почты или пароль.";
        case "auth/user-not-found":
          return "Пользователь с такой почтой не найден — зарегистрируйтесь.";
        case "auth/wrong-password":
          return "Неверный пароль.";
        case "auth/email-already-in-use":
          return "Этот адрес электронной почты уже используется.";
        case "auth/weak-password":
          return "Пароль должен содержать не менее 6 символов.";
        case "auth/invalid-email":
          return "Неверный формат электронной почты.";
        case "auth/popup-blocked":
          return "Окно входа заблокировано всплывающим окном. Попробуйте еще раз.";
        case "auth/network-request-failed":
          return "Ошибка подключения к сети.";
        case "auth/too-many-requests":
          return "Слишком много попыток. Пожалуйста, попробуйте позже.";
        default:
          return "Произошла ошибка: " + code;
      }
    } else if (lang === "en") {
      switch (code) {
        case "auth/invalid-credential":
          return "Invalid email or password.";
        case "auth/user-not-found":
          return "No user found with this email — register first.";
        case "auth/wrong-password":
          return "Incorrect password.";
        case "auth/email-already-in-use":
          return "This email address is already in use.";
        case "auth/weak-password":
          return "Password must be at least 6 characters long.";
        case "auth/invalid-email":
          return "Invalid email format.";
        case "auth/popup-blocked":
          return "Sign in popup blocked. Please try again.";
        case "auth/network-request-failed":
          return "Network connection failed.";
        case "auth/too-many-requests":
          return "Too many requests. Please try again later.";
        default:
          return "An error occurred: " + code;
      }
    } else {
      switch (code) {
        case "auth/invalid-credential":
          return "E-poçt və ya şifrə yanlışdır.";
        case "auth/user-not-found":
          return "Bu e-poçt ilə hesab tapılmadı — əvvəlcə qeydiyyatdan keçin.";
        case "auth/wrong-password":
          return "Şifrə yanlışdır.";
        case "auth/email-already-in-use":
          return "Bu e-poçt ünvanı artıq istifadə olunur.";
        case "auth/weak-password":
          return "Şifrə ən azı 6 simvoldan ibarət olmalıdır.";
        case "auth/invalid-email":
          return "E-poçt formatı yanlışdır.";
        case "auth/popup-blocked":
          return "Giriş pəncərəsi bloklandı. Yenidən cəhd edin.";
        case "auth/network-request-failed":
          return "İnternet bağlantısı kəsildi.";
        case "auth/too-many-requests":
          return "Həddindən artıq cəhd edildi. Bir az sonra yenidən yoxlayın.";
        default:
          return "Xəta baş verdi: " + code;
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(
        lang === "ru"
          ? "Пожалуйста, введите адрес почты и пароль."
          : lang === "en"
          ? "Please fill in email and password."
          : "Zəhmət olmasa e-poçt və şifrəni daxil edin."
      );
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (authMode === "register") {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(userCred.user, { displayName: name.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(translateError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
    } catch (err: any) {
      setError(translateError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError(
        lang === "ru"
          ? "Сначала введите адрес эл. почты для сброса пароля."
          : lang === "en"
          ? "Please enter your email first to reset your password."
          : "Şifrəni sıfırlamaq üçün əvvəlcə e-poçt ünvanınızı yazın."
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      setError(translateError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#131417] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 height-12 bg-amber-500/10 text-amber-500 p-3 rounded-xl mb-3">
            <Dumbbell className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-[10px] tracking-[4px] text-gray-400 font-semibold uppercase">
            {lang === "ru" ? "Тренировки · Питание · ИИ" : lang === "en" ? "Workout · Nutrition · AI" : "Meşq · Qida · Aİ"}
          </div>
          <h1 className="text-3xl font-black italic tracking-tight text-white mt-1">
            DƏMİR<span className="text-amber-500">PLAN</span>
          </h1>
          <p className="text-xs text-gray-400 mt-2">
            {lang === "ru"
              ? "Войдите, чтобы синхронизировать данные на всех устройствах"
              : lang === "en"
              ? "Sign in to keep your data synced across all devices"
              : "Məlumatlarınızı bütün cihazlarda sinxron saxlamaq üçün daxil olun"}
          </p>
        </div>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" className="w-5 h-5">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.4 17.7 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.7-.2-3.3-.5-4.9H24v9.3h12.7c-.6 3-2.3 5.6-4.8 7.3l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/>
            <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.8-6.1z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2.1 1.4-4.7 2.2-7.7 2.2-6.3 0-11.7-3.9-13.6-9.4l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/>
          </svg>
          {lang === "ru" ? "Войти через Google" : lang === "en" ? "Sign in with Google" : "Google ilə daxil ol"}
        </button>

        <div className="flex items-center my-6 text-gray-500 text-xs">
          <div className="flex-1 h-[1px] bg-[#2a2d34]"></div>
          <span className="px-3">
            {lang === "ru" ? "или через e-mail" : lang === "en" ? "or with email" : "və ya e-poçt ilə"}
          </span>
          <div className="flex-1 h-[1px] bg-[#2a2d34]"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {authMode === "register" && (
            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                {lang === "ru" ? "Ваше имя" : lang === "en" ? "Your Name" : "Adın"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder={lang === "ru" ? "Имя и Фамилия" : lang === "en" ? "First and Last Name" : "Adınız və Soyadınız"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-amber-500 transition-all text-base md:text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
              {lang === "ru" ? "Эл. почта" : lang === "en" ? "Email" : "E-poçt"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="email"
                placeholder="sen@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-amber-500 transition-all text-base md:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
              {lang === "ru" ? "Пароль" : lang === "en" ? "Password" : "Şifrə"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#131417] border border-[#2a2d34] rounded-xl py-3 pl-11 pr-12 text-white focus:outline-none focus:border-amber-500 transition-all text-base md:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-all"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              ⚠ {error}
            </div>
          )}

          {resetSent && (
            <div className="text-emerald-400 text-xs text-center p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              {lang === "ru"
                ? "✓ Ссылка для сброса пароля отправлена на вашу почту."
                : lang === "en"
                ? "✓ Password reset link has been sent to your email."
                : "✓ Şifrəni yeniləmə linki e-poçtunuza göndərildi."}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 font-black rounded-xl cursor-pointer transition-all uppercase tracking-wider text-sm shadow-lg shadow-amber-500/10"
          >
            {loading
              ? lang === "ru" ? "Подождите..." : lang === "en" ? "Please wait..." : "Gözləyin..."
              : authMode === "login"
              ? lang === "ru" ? "Войти" : lang === "en" ? "Sign In" : "Daxil ol"
              : lang === "ru" ? "Регистрация" : lang === "en" ? "Sign Up" : "Qeydiyyatdan keç"}
          </button>
        </form>

        <div className="flex justify-between mt-5 text-xs">
          <button
            onClick={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setError(null);
            }}
            className="text-amber-500 hover:underline font-semibold cursor-pointer text-left"
          >
            {authMode === "login"
              ? lang === "ru" ? "Нет аккаунта? Регистрация" : lang === "en" ? "No account? Sign up" : "Hesabınız yoxdur? Qeydiyyat"
              : lang === "ru" ? "Есть аккаунт? Войти" : lang === "en" ? "Have an account? Sign in" : "Hesabınız var? Daxil olun"}
          </button>
          <button
            onClick={handlePasswordReset}
            className="text-gray-400 hover:text-white cursor-pointer text-right shrink-0"
          >
            {lang === "ru" ? "Забыли пароль?" : lang === "en" ? "Forgot password?" : "Şifrəmi unutdum"}
          </button>
        </div>
      </div>
    </div>
  );
}
