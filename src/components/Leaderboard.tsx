import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { calculateWeeklyVolume } from "../utils/volume";
import { WorkoutLogs } from "../types";
import { Trophy, Medal, Award, Info, Dumbbell, Flame, TrendingUp, Sparkles, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface LeaderboardProps {
  currentUserId: string;
  userLogs: WorkoutLogs;
  onTriggerPayment?: () => void;
  lang?: string;
}

interface LeaderboardUser {
  userId: string;
  name: string;
  weeklyVolume: number;
  updatedAt: number;
}

export default function Leaderboard({ currentUserId, userLogs, onTriggerPayment, lang = "az" }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);

  const t = {
    az: {
      competition: "İcma Yarışı",
      leaderboard: "LİDERLİK CƏDVƏLİ",
      rules: "Qaydalar",
      subtitle: "Həftəlik ümumi qaldırılan çəki həcmi üzrə icma üzvləri ilə yarışın. Hər bazar ertəsi xal sıfırlanır.",
      currentWeek: "Cari Həftə:",
      howCalculated: "Həcm (Volume) necə hesablanır?",
      calcFormulaDesc: "Hər tamamlanmış (işarələnmiş) məşq seti üçün qaldırdığınız ağırlıq onun təkrar sayına vurulur və cəmlənir:",
      calcFormula: "Həcm = Çəki (kq) × Təkrar Sayı",
      calcExample: "Nümunə: 60 kq çəki ilə 10 təkrar etmisinizsə, həmin set üçün həcm 600 kq hesablanır. Bütün setlərin cəmi həftəlik xalınızı müəyyən edir.",
      currentStatus: "Sizin Cari Statusunuz",
      rankLabel: "SIRA",
      loading: "Liderlik cədvəli yüklənir...",
      emptyTitle: "Liderlik cədvəli hələ boşdur",
      emptyDesc: "İlk tamamlanmış məşqinizi qeyd edin və liderlər sırasına adınızı yazdırın! 💪",
      allParticipants: "BÜTÜN İŞTİRAKÇILAR",
      youLabel: "Siz",
      unknownAthlete: "Naməlum İdmançı",
      volumeUnit: "kq",
      volumeLabel: "kq həcm",
      months: [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
        "İyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
      ],
      motivation1: "Möhtəşəm! Hazırda cədvəlin ən zirvəsindəsiniz! 👑 Liderliyi qoruyun!",
      motivation2: "Əla gedirsiniz! Kürsüdəsiniz (Top 3)! 🥉 Bir az da güc versəniz lider ola bilərsiniz!",
      motivation3: "Top 10-dasınız! 🔥 İntizamınız sizi daha da irəli aparacaq!",
      motivation4: "Cədvəldə yer aldınız! 💪 Hər məşq sizi daha güclü edir. Davam edin!",
      motivation5: "Hələ bu həftə heç bir məşq qeyd etməmisiniz. İlk məşqinizi edin və liderlik yarışına qoşulun! 🏋️‍♂️🚀"
    },
    en: {
      competition: "Community Competition",
      leaderboard: "LEADERBOARD",
      rules: "Rules",
      subtitle: "Compete with community members based on total weekly volume lifted. Points reset every Monday.",
      currentWeek: "Current Week:",
      howCalculated: "How is Volume calculated?",
      calcFormulaDesc: "For each completed (checked) set, the weight lifted is multiplied by the reps and summed up:",
      calcFormula: "Volume = Weight (kg) × Reps",
      calcExample: "Example: If you did 10 reps with 60 kg, the volume for that set is 600 kg. The sum of all sets determines your weekly score.",
      currentStatus: "Your Current Status",
      rankLabel: "RANK",
      loading: "Loading leaderboard...",
      emptyTitle: "Leaderboard is empty",
      emptyDesc: "Log your first completed workout and write your name among the leaders! 💪",
      allParticipants: "ALL PARTICIPANTS",
      youLabel: "You",
      unknownAthlete: "Unknown Athlete",
      volumeUnit: "kg",
      volumeLabel: "kg volume",
      months: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ],
      motivation1: "Spectacular! You are at the very top of the table! 👑 Keep the lead!",
      motivation2: "Great job! You are on the podium (Top 3)! 🥉 Push a bit harder to take the lead!",
      motivation3: "You are in the Top 10! 🔥 Your discipline will take you further!",
      motivation4: "You are on the board! 💪 Every workout makes you stronger. Keep going!",
      motivation5: "You haven't logged any workouts this week. Log your first session to join the competition! 🏋️‍♂️🚀"
    },
    ru: {
      competition: "Соревнование сообщества",
      leaderboard: "ТАБЛИЦА ЛИДЕРОВ",
      rules: "Правила",
      subtitle: "Соревнуйтесь с другими участниками по общему весу поднятого за неделю объема. Очки сбрасываются каждый понедельник.",
      currentWeek: "Текущая неделя:",
      howCalculated: "Как рассчитывается объем (Volume)?",
      calcFormulaDesc: "Для каждого выполненного (отмеченного) подхода вес умножается на количество повторений и суммируется:",
      calcFormula: "Объем = Вес (кг) × Повторения",
      calcExample: "Пример: Если вы сделали 10 повторений с весом 60 кг, объем этого подхода составит 600 кг. Сумма всех подходов определяет ваш недельный счет.",
      currentStatus: "Ваш текущий статус",
      rankLabel: "МЕСТО",
      loading: "Таблица лидеров загружается...",
      emptyTitle: "Таблица лидеров пока пуста",
      emptyDesc: "Запишите свою первую выполненную тренировку и внесите свое имя в число лидеров! 💪",
      allParticipants: "ВСЕ УЧАСТНИКИ",
      youLabel: "Вы",
      unknownAthlete: "Неизвестный атлет",
      volumeUnit: "кг",
      volumeLabel: "кг объем",
      months: [
        "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
        "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"
      ],
      motivation1: "Великолепно! Вы находитесь на самой вершине таблицы! 👑 Сохраняйте лидерство!",
      motivation2: "Отличная работа! Вы на подиуме (Топ-3)! 🥉 Поднажмите еще немного, чтобы стать лидером!",
      motivation3: "Вы в Топ-10! 🔥 Ваша дисциплина продвинет вас дальше!",
      motivation4: "Вы в таблице лидеров! 💪 Каждая тренировка делает вас сильнее. Продолжайте!",
      motivation5: "На этой неделе вы еще не зафиксировали ни одной тренировки. Сделайте это, чтобы вступить в борьбу! 🏋️‍♂️🚀"
    }
  };

  const activeT = t[lang === "ru" ? "ru" : lang === "en" ? "en" : "az"];

  // Get current week range formatted in selected language
  const getWeekRangeString = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    
    const start = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return `${start.getDate()} ${activeT.months[start.getMonth()]} - ${end.getDate()} ${activeT.months[end.getMonth()]} ${end.getFullYear()}`;
  };

  // Fetch all leaderboard entries
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "leaderboard"),
      orderBy("weeklyVolume", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries: LeaderboardUser[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          entries.push({
            userId: doc.id,
            name: data.name || activeT.unknownAthlete,
            weeklyVolume: Number(data.weeklyVolume) || 0,
            updatedAt: data.updatedAt || 0,
          });
        });
        setLeaderboard(entries);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching leaderboard: ", error);
        setLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, "leaderboard");
        } catch (e) {
          // Handled silently to avoid crashing UI
        }
      }
    );

    return () => unsubscribe();
  }, [lang]); // add lang dependency to trigger updates if translations loaded

  const myVolume = calculateWeeklyVolume(userLogs);
  const myRank = leaderboard.findIndex((item) => item.userId === currentUserId) + 1;
  const maxVolume = leaderboard.length > 0 ? leaderboard[0].weeklyVolume : 1;

  // Split top 3 and others
  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  // Motivational message based on rank and selected language
  const getMotivationMessage = () => {
    if (myRank === 1) return activeT.motivation1;
    if (myRank > 1 && myRank <= 3) return activeT.motivation2;
    if (myRank > 3 && myRank <= 10) return activeT.motivation3;
    if (myVolume > 0) return activeT.motivation4;
    return activeT.motivation5;
  };

  return (
    <div className="space-y-5 animate-fade-in" id="leaderboard-section">
      {/* Title block */}
      <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-5 space-y-4 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <div className="text-xs tracking-[3px] text-amber-500 font-black uppercase">{activeT.competition}</div>
            <h2 className="text-2xl font-extrabold italic text-white flex items-center gap-2 uppercase">
              <Trophy className="w-6 h-6 text-amber-500 shrink-0" /> {activeT.leaderboard}
            </h2>
          </div>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="p-2 text-gray-300 hover:text-white hover:bg-[#252830] rounded-xl transition-all cursor-pointer"
            title={activeT.rules}
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>

        <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-medium">
          {activeT.subtitle}
        </p>

        <div className="bg-[#141519] border border-[#2a2d34]/40 rounded-xl p-3 px-4 flex justify-between items-center text-xs font-bold text-amber-500/90 uppercase tracking-wider">
          <span>📅 {activeT.currentWeek}</span>
          <span className="text-white font-black">{getWeekRangeString()}</span>
        </div>
      </div>

      {/* Info Card / Explanation Panel */}
      {showExplanation && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#211f1c] border border-amber-500/20 rounded-2xl p-5 text-sm space-y-3 text-gray-200 shadow-xl"
        >
          <div className="flex items-center gap-2 text-amber-500 font-bold text-base">
            <Info className="w-5 h-5 shrink-0" />
            <span>{activeT.howCalculated}</span>
          </div>
          <p className="leading-relaxed">
            {activeT.calcFormulaDesc}
          </p>
          <div className="bg-[#141519] p-3 rounded-xl font-mono text-center text-xs text-white border border-[#2a2d34]/60">
            {activeT.calcFormula}
          </div>
          <p className="leading-relaxed text-xs text-gray-300">
            {activeT.calcExample}
          </p>
        </motion.div>
      )}

      {/* Personal Standing Hero Card */}
      <div className="bg-gradient-to-r from-[#1e1a14] to-[#1c1c22] border border-amber-500/30 rounded-2xl p-5 flex items-center justify-between gap-5 shadow-xl">
        <div className="space-y-2 min-w-0 flex-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-300 block">{activeT.currentStatus}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white italic tracking-tight">
              {myVolume.toLocaleString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "az-AZ")}
            </span>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider ml-1">{activeT.volumeLabel}</span>
          </div>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-medium">
            {getMotivationMessage()}
          </p>
        </div>

        <div className="text-center bg-[#141519] border border-[#2a2d34] rounded-2xl p-3.5 min-w-[95px] shrink-0">
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-300 block mb-0.5">{activeT.rankLabel}</span>
          <span className="text-3xl font-black italic text-amber-500">
            {myRank > 0 ? `#${myRank}` : "—"}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-300 font-semibold">{activeT.loading}</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-[#1b1d22] border border-[#2a2d34]/60 rounded-2xl p-10 text-center space-y-4">
          <Dumbbell className="w-12 h-12 text-gray-400 mx-auto animate-pulse" />
          <p className="text-base font-bold text-white">{activeT.emptyTitle}</p>
          <p className="text-xs md:text-sm text-gray-300 max-w-xs mx-auto leading-relaxed">
            {activeT.emptyDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Top 3 Podium layout */}
          <div className="grid grid-cols-3 gap-3 pt-4 items-end">
            {/* 2nd Place */}
            {top3[1] && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 pb-5 text-center space-y-2.5 shadow-md relative ${
                  top3[1].userId === currentUserId ? "ring-2 ring-amber-500/40" : ""
                }`}
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2a2d34] text-[#a1a1a1] w-7 h-7 rounded-full flex items-center justify-center font-black text-sm border border-gray-600 shadow-md">
                  2
                </div>
                <div className="pt-2">
                  <Medal className="w-8 h-8 text-[#c0c0c0] mx-auto drop-shadow-[0_2px_8px_rgba(192,192,192,0.3)]" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs md:text-sm font-bold text-white truncate max-w-full px-1">
                    {top3[1].name}
                  </div>
                  <div className="text-xs font-black text-[#c0c0c0] italic">
                    {top3[1].weeklyVolume.toLocaleString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "az-AZ")} <span className="text-[10px] font-bold not-italic text-gray-400">{activeT.volumeUnit}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 1st Place (Center and slightly taller) */}
            {top3[0] && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[#221f18] border border-amber-500/30 rounded-2xl p-4 pb-6 text-center space-y-2.5 shadow-xl relative -top-2 ${
                  top3[0].userId === currentUserId ? "ring-2 ring-amber-500" : ""
                }`}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-gray-950 w-8 h-8 rounded-full flex items-center justify-center font-black text-base border-2 border-[#221f18] shadow-lg animate-bounce">
                  1
                </div>
                <div className="pt-2">
                  <Trophy className="w-10 h-10 text-amber-500 mx-auto drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)]" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm md:text-base font-black text-white truncate max-w-full px-1 flex items-center justify-center gap-0.5">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{top3[0].name}</span>
                  </div>
                  <div className="text-sm font-black text-amber-500 italic">
                    {top3[0].weeklyVolume.toLocaleString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "az-AZ")} <span className="text-[10px] font-bold not-italic text-amber-500/80">{activeT.volumeUnit}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-4 pb-5 text-center space-y-2.5 shadow-md relative ${
                  top3[2].userId === currentUserId ? "ring-2 ring-amber-500/40" : ""
                }`}
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2a2d34] text-[#cd7f32] w-7 h-7 rounded-full flex items-center justify-center font-black text-sm border border-gray-600 shadow-md">
                  3
                </div>
                <div className="pt-2">
                  <Award className="w-8 h-8 text-[#cd7f32] mx-auto drop-shadow-[0_2px_8px_rgba(205,127,50,0.3)]" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs md:text-sm font-bold text-white truncate max-w-full px-1">
                    {top3[2].name}
                  </div>
                  <div className="text-xs font-black text-[#cd7f32] italic">
                    {top3[2].weeklyVolume.toLocaleString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "az-AZ")} <span className="text-[10px] font-bold not-italic text-gray-400">{activeT.volumeUnit}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* List layout for ranks 4+ */}
          <div className="space-y-3 bg-[#1b1d22] border border-[#2a2d34]/60 rounded-3xl p-4 md:p-5 shadow-lg">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-300 px-1 block mb-1">{activeT.allParticipants}</span>
            
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
              {leaderboard.map((item, idx) => {
                const rank = idx + 1;
                const isMe = item.userId === currentUserId;
                const progressWidth = Math.max(2, Math.round((item.weeklyVolume / maxVolume) * 100));

                return (
                  <div
                    key={item.userId}
                    className={`flex items-center justify-between gap-4 p-3 md:p-3.5 rounded-xl transition-all ${
                      isMe 
                        ? "bg-amber-500/10 border border-amber-500/30 font-bold" 
                        : "bg-[#141519]/60 hover:bg-[#141519] border border-transparent"
                    }`}
                  >
                    {/* Rank Indicator */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={`w-7 h-7 rounded-lg font-black text-sm flex items-center justify-center shrink-0 ${
                        rank === 1 ? "bg-amber-500 text-gray-950" :
                        rank === 2 ? "bg-gray-300 text-gray-950" :
                        rank === 3 ? "bg-amber-700 text-white" :
                        "bg-[#1c1d24] text-gray-300 border border-[#2a2d34]"
                      }`}>
                        {rank}
                      </div>

                      {/* Name & Progress Bar Column */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="text-sm text-white truncate flex items-center gap-2">
                          <span className="truncate font-bold">{item.name}</span>
                          {isMe && (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-[10px] font-black rounded uppercase tracking-wider">
                              {activeT.youLabel}
                            </span>
                          )}
                        </div>
                        {/* Custom visual progress bar */}
                        <div className="w-full bg-[#1b1d22] h-2 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${progressWidth}%` }}
                            className={`h-full rounded-full ${isMe ? "bg-amber-500" : "bg-gray-400"}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Weekly volume score */}
                    <div className="text-right shrink-0">
                      <span className={`text-sm md:text-base font-black italic tracking-tight ${isMe ? "text-amber-500" : "text-gray-200"}`}>
                        {item.weeklyVolume.toLocaleString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "az-AZ")}
                      </span>
                      <span className="text-xs font-bold text-gray-400 ml-1">{activeT.volumeUnit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
