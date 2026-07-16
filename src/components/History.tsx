import React, { useState } from "react";
import { WorkoutLogs, WorkoutDay, SetLog, MeasurementEntry } from "../types";
import { Calendar, Award, Flame, Dumbbell, Trophy, ChevronDown, ChevronUp, Sparkles, Activity, Timer, Download } from "lucide-react";
import { jsPDF } from "jspdf";

interface HistoryProps {
  logs: WorkoutLogs;
  program?: WorkoutDay[];
  lang?: string;
  body?: MeasurementEntry[];
}

export default function History({ logs, program = [], lang = "az", body = [] }: HistoryProps) {
  const [subTab, setSubTab] = useState<"history" | "prs">("history");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const pdfLabelsDict = {
    az: {
      title: "DEMIRPLAN * FITNES TEREQQI HESABATI",
      subtitle: "Mesq hacmi ve beden olculeri xulasesi",
      generated: "Hesabatin tarixi",
      page: "Sehife",
      measurementsSection: "BEDEN OLCULERI",
      noMeasurements: "Hele beden olcusu qeyde alinmayib.",
      workoutsSection: "MESQ TARIXCESI VE HACMI",
      noWorkouts: "Hele mesq qeyde alinmayib.",
      prsSection: "SEXSI REKORDLAR (PR)",
      noPrs: "Hele sexsi rekord qeyde alinmayib.",
      thDate: "Tarix",
      thWeight: "Ceki",
      thHeight: "Boy",
      thBmi: "BIK (BMI)",
      thChest: "Sine",
      thWaist: "Bel",
      thArm: "Qol",
      workoutVolume: "Cemi Hacm",
      workoutSets: "Set",
      reps: "tekrar",
      seconds: "saniye",
      maxWeight: "Maks Ceki",
      cardioDone: "Kardio tamamlandi",
      exportSuccess: "Hesabat ugurla yuklendi! pdf",
      exporting: "Hesabat hazirlanir...",
      exportBtn: "Hesabati Ixrac Et (PDF)",
      exportJsonBtn: "Verilənləri İxrac Et (JSON)",
    },
    en: {
      title: "DEMIRPLAN * FITNESS PROGRESS REPORT",
      subtitle: "Summary of workout volume and body measurements",
      generated: "Report date",
      page: "Page",
      measurementsSection: "BODY MEASUREMENTS",
      noMeasurements: "No body measurements logged yet.",
      workoutsSection: "WORKOUT HISTORY & VOLUME",
      noWorkouts: "No workout logs yet.",
      prsSection: "PERSONAL RECORDS (PR)",
      noPrs: "No personal records logged yet.",
      thDate: "Date",
      thWeight: "Weight",
      thHeight: "Height",
      thBmi: "BMI",
      thChest: "Chest",
      thWaist: "Waist",
      thArm: "Arm",
      workoutVolume: "Total Volume",
      workoutSets: "Sets",
      reps: "reps",
      seconds: "seconds",
      maxWeight: "Max Weight",
      cardioDone: "Cardio completed",
      exportSuccess: "Report successfully downloaded! pdf",
      exporting: "Preparing report...",
      exportBtn: "Export Report (PDF)",
      exportJsonBtn: "Export Data (JSON)",
    },
    ru: {
      title: "DEMIRPLAN * OTCHET O FITNES-PROGRESSE",
      subtitle: "Svodka trenirovochnogo ob'ema i zamerov tela",
      generated: "Data otcheta",
      page: "Stranica",
      measurementsSection: "ZAMERY TELA",
      noMeasurements: "Zamery tela esche ne zafiksirovany.",
      workoutsSection: "ISTORIYA TRENIROVOK I OB'EM",
      noWorkouts: "Istoriya trenirovok otsutstvuet.",
      prsSection: "LICHNYE REKORDY (PR)",
      noPrs: "Lichnye rekordy esche ne zafiksirovany.",
      thDate: "Data",
      thWeight: "Ves",
      thHeight: "Rost",
      thBmi: "IMT (BMI)",
      thChest: "Grud'",
      thWaist: "Taliya",
      thArm: "Biceps",
      workoutVolume: "Obschiy Ob'em",
      workoutSets: "Sety",
      reps: "povt.",
      seconds: "sek",
      maxWeight: "Maks. ves",
      cardioDone: "Kardio zaversheno",
      exportSuccess: "Otchet uspeshno zagruzhen! pdf",
      exporting: "Podgotovka otcheta...",
      exportBtn: "Eksport Otcheta (PDF)",
      exportJsonBtn: "Экспорт Данных (JSON)",
    },
    de: {
      title: "DEMIRPLAN * FITNESS-FORTSCHRITTSBERICHT",
      subtitle: "Zusammenfassung von Trainingsvolumen und Körpermaßen",
      generated: "Berichtsdatum",
      page: "Seite",
      measurementsSection: "KÖRPERMASSE",
      noMeasurements: "Noch keine Körpermaße eingetragen.",
      workoutsSection: "TRAININGSHISTORIE & VOLUMEN",
      noWorkouts: "Noch keine Trainingsprotokolle vorhanden.",
      prsSection: "PERSÖNLICHE REKORDE (PR)",
      noPrs: "Noch keine persönlichen Rekorde eingetragen.",
      thDate: "Datum",
      thWeight: "Gewicht",
      thHeight: "Größe",
      thBmi: "BMI",
      thChest: "Brust",
      thWaist: "Taille",
      thArm: "Arm",
      workoutVolume: "Gesamtvolumen",
      workoutSets: "Sätze",
      reps: "Wdh.",
      seconds: "Sekunden",
      maxWeight: "Max. Gewicht",
      cardioDone: "Cardio abgeschlossen",
      exportSuccess: "Bericht erfolgreich heruntergeladen! pdf",
      exporting: "Bericht wird vorbereitet...",
      exportBtn: "Bericht exportieren (PDF)",
      exportJsonBtn: "Daten exportieren (JSON)",
    },
  };

  const pdfLabels = pdfLabelsDict[lang as "az" | "en" | "de" | "ru" || "az"] || pdfLabelsDict["en"];

  const cleanText = (str: string): string => {
    if (!str) return "";
    let res = str;
    const azMap: { [key: string]: string } = {
      'ə': 'e', 'ı': 'i', 'ö': 'o', 'ü': 'u', 'ğ': 'g', 'ç': 'c', 'ş': 's',
      'Ə': 'E', 'İ': 'I', 'Ö': 'O', 'Ü': 'U', 'Ğ': 'G', 'Ç': 'C', 'Ş': 'S'
    };
    Object.entries(azMap).forEach(([key, val]) => {
      res = res.replaceAll(key, val);
    });

    const ruMap: { [key: string]: string } = {
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щу': 'sch', 'щ': 'shh', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    Object.entries(ruMap).forEach(([key, val]) => {
      res = res.replaceAll(key, val);
    });

    return res;
  };

  const calculateVolume = (dayLog: any) => {
    let volume = 0;
    Object.entries(dayLog).forEach(([id, setsArr]) => {
      if (id.startsWith("__") || !Array.isArray(setsArr)) return;
      setsArr.forEach((set) => {
        if (set && set.done) {
          const w = parseFloat(set.w) || 0;
          const r = parseInt(set.r) || 0;
          volume += w * r;
        }
      });
    });
    return volume;
  };

  const tDict = {
    az: {
      recentWorkouts: "📋 Son Məşqlər",
      personalRecords: "🏆 Şəxsi Rekordlar",
      noLogsTitle: "Hələ Məşq Qeydi Yoxdur",
      noLogsDesc: "Məşq proqramında setləri tamamlayıb yaşıl quş işarələrinə basdıqca, burada sizin aktivlik və çəki irəliləyişləriniz göstəriləcək!",
      record: "Rekord!",
      max: "Maks",
      cardio: "Kardio",
      details: "Məşq Detalları",
      completed: "Tamamlandı ✓",
      noExRecords: "Hərəkət qeydi yoxdur (yalnız kardio).",
      set: "Set",
      reps: "təkrar",
      seconds: "saniyə",
      motivationSub: "DƏMİR İRADƏ REKORDA APARIR",
      motivationText: "Hər bir hərəkət üzrə əldə etdiyiniz all-time ən ağır çəki və ən çox təkrar qeydləriniz buradadır. Limitləri aşmağa davam edin! 💪🔥",
      noPrTitle: "Hələ Rekord Qeydə Alınmayıb",
      noPrDesc: "Məşqlərdə hərəkətləri yerinə yetirib setlərinizi tamamlandı olaraq işarələdikcə, qaldırdığınız ən yüksək çəkilər və təkrar sayları avtomatik hesablanaraq burada nümayiş olunacaq!",
      bestResult: "Ən yaxşı nəticə (PR)",
      date: "Tarix",
      workoutDay: "Məşq Günü",
      workout: "Məşq",
    },
    en: {
      recentWorkouts: "📋 Recent Workouts",
      personalRecords: "🏆 Personal Records",
      noLogsTitle: "No Workout Logs Yet",
      noLogsDesc: "Once you complete sets in your program and mark them with the green checkmark, your logs and weight improvements will be displayed here!",
      record: "PR Record!",
      max: "Max",
      cardio: "Cardio",
      details: "Workout Details",
      completed: "Completed ✓",
      noExRecords: "No specific exercise logged (cardio only).",
      set: "Set",
      reps: "reps",
      seconds: "seconds",
      motivationSub: "IRON WILL LEADS TO NEW RECORDS",
      motivationText: "This section contains your all-time heaviest weights lifted and highest repetition landmarks. Keep pushing your limits! 💪🔥",
      noPrTitle: "No Records Logged Yet",
      noPrDesc: "When you execute exercises and log completed sets, your peak weight achievements and rep figures will be tracked and displayed here automatically!",
      bestResult: "Best Performance (PR)",
      date: "Date",
      workoutDay: "Workout Day",
      workout: "Workout",
    },
    ru: {
      recentWorkouts: "📋 Последние тренировки",
      personalRecords: "🏆 Личные Рекорды",
      noLogsTitle: "Пока нет записей тренировок",
      noLogsDesc: "Как только вы начнете завершать сеты в своей программе и отмечать их галочками, ваша активность и прогресс весов будут отображаться здесь!",
      record: "Рекорд!",
      max: "Макс",
      cardio: "Кардио",
      details: "Детали тренировки",
      completed: "Завершено ✓",
      noExRecords: "Записи упражнений отсутствуют (только кардио).",
      set: "Сет",
      reps: "повт.",
      seconds: "сек",
      motivationSub: "ЖЕЛЕЗНАЯ ВОЛЯ ВЕДЕТ К РЕКОРДАМ",
      motivationText: "Здесь собраны ваши абсолютные рекорды по максимальному весу и количеству повторений для каждого упражнения. Разрушайте свои границы! 💪🔥",
      noPrTitle: "Рекорды еще не зафиксированы",
      noPrDesc: "Выполняя упражнения и отмечая сеты завершенными, вы автоматически сохраняете максимальные веса и повторения, которые будут наглядно показаны здесь!",
      bestResult: "Лучший результат (PR)",
      date: "Дата",
      workoutDay: "Тренировочный день",
      workout: "Тренировка",
    },
    de: {
      recentWorkouts: "📋 Letzte Workouts",
      personalRecords: "🏆 Persönliche Rekorde",
      noLogsTitle: "Noch keine Trainingsprotokolle vorhanden",
      noLogsDesc: "Sobald Sie Sätze in Ihrem Programm absolvieren und mit dem grünen Häkchen markieren, werden Ihre Protokolle und Gewichtsverbesserungen hier angezeigt!",
      record: "PR Rekord!",
      max: "Max",
      cardio: "Cardio",
      details: "Workout-Details",
      completed: "Abgeschlossen ✓",
      noExRecords: "Keine spezifischen Übungen protokolliert (nur Cardio).",
      set: "Satz",
      reps: "Wdh.",
      seconds: "Sekunden",
      motivationSub: "EISERNER WILLE FÜHRT ZU NEUEN REKORDEN",
      motivationText: "Dieser Bereich enthält Ihre allzeit schwersten gehobenen Gewichte und höchsten Wiederholungszahlen. Gehen Sie weiter an Ihre Grenzen! 💪🔥",
      noPrTitle: "Noch keine Rekorde eingetragen",
      noPrDesc: "Wenn Sie Übungen ausführen und absolvierte Sätze protokollieren, werden Ihre Spitzenleistungen beim Gewicht und bei den Wiederholungen hier automatisch erfasst und angezeigt!",
      bestResult: "Beste Leistung (PR)",
      date: "Datum",
      workoutDay: "Trainingstag",
      workout: "Workout",
    }
  };

  const t = tDict[lang as "az" | "en" | "de" | "ru" || "az"] || tDict["en"];

  // 1. Map exercise ID to details (name, isTime, dayTitle) from current program
  const idToExInfo: { [id: string]: { name: string; isTime: boolean; dayTitle: string } } = {};
  program.forEach((day) => {
    day.exercises.forEach((ex) => {
      idToExInfo[ex.id] = { name: ex.name, isTime: !!ex.isTime, dayTitle: day.title };
    });
  });

  // 2. Calculate All-Time Personal Records (PRs) from logs
  interface PREntry {
    exerciseName: string;
    maxWeight: number;
    maxReps: number;
    date: string;
    isTime: boolean;
    dayTitle: string;
  }

  const allPRs: { [exerciseName: string]: PREntry } = {};

  Object.entries(logs).forEach(([dayKey, dayLog]) => {
    const [, date] = dayKey.split("|");
    
    Object.entries(dayLog).forEach(([id, setsArr]) => {
      if (id.startsWith("__") || !Array.isArray(setsArr)) return;

      const info = idToExInfo[id];
      const exName = info ? info.name : null;
      const isTime = info ? info.isTime : false;
      const dayTitle = info ? info.dayTitle : (dayLog.__title || t.workoutDay);

      // We skip if we don't have the exercise name
      if (!exName) return;

      setsArr.forEach((set) => {
        if (set && set.done) {
          const weight = parseFloat(set.w) || 0;
          const reps = parseInt(set.r) || 0;

          if (reps <= 0) return;

          const existing = allPRs[exName];

          if (!existing) {
            allPRs[exName] = {
              exerciseName: exName,
              maxWeight: weight,
              maxReps: reps,
              date,
              isTime,
              dayTitle,
            };
          } else {
            let isBetter = false;
            if (isTime) {
              if (reps > existing.maxReps) {
                isBetter = true;
              }
            } else {
              if (weight > existing.maxWeight) {
                isBetter = true;
              } else if (weight === existing.maxWeight && reps > existing.maxReps) {
                isBetter = true;
              }
            }

            if (isBetter) {
              allPRs[exName] = {
                exerciseName: exName,
                maxWeight: weight,
                maxReps: reps,
                date,
                isTime,
                dayTitle,
              };
            }
          }
        }
      });
    });
  });

  const prList = Object.values(allPRs).sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));

  // 3. Process daily entries list
  const entries = Object.entries(logs)
    .map(([key, dayLog]) => {
      const [dayId, date] = key.split("|");
      const title = dayLog.__title || t.workoutDay;

      // Count completed sets
      const doneSets = Object.entries(dayLog)
        .filter(([id]) => !id.startsWith("__"))
        .reduce((sum, [, setsArr]) => {
          return sum + (Array.isArray(setsArr) ? setsArr.filter((s) => s && s.done).length : 0);
        }, 0);

      // Find max weight lifted today
      const weights = Object.entries(dayLog)
        .filter(([id]) => !id.startsWith("__"))
        .flatMap(([, setsArr]) => (Array.isArray(setsArr) ? setsArr.map((s) => parseFloat(s.w) || 0) : []));

      const bestWeight = weights.length ? Math.max(...weights) : 0;

      return {
        key,
        dayId,
        date,
        title,
        doneSets,
        cardio: !!dayLog.__cardio,
        bestWeight,
        dayLog,
      };
    })
    .filter((e) => e.doneSets > 0 || e.cardio)
    .sort((a, b) => b.date.localeCompare(a.date));

  const fmtDate = (iso: string) => {
    return new Date(iso + "T00:00:00").toLocaleDateString(
      lang === "az" ? "az-AZ" : lang === "ru" ? "ru-RU" : "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      let y = 15;

      const checkPageBreak = (needed: number) => {
        if (y + needed > 275) {
          doc.addPage();
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(`${cleanText(pdfLabels.title)} - ${pdfLabels.page} ${doc.getNumberOfPages()}`, 15, 10);
          doc.line(15, 12, 195, 12);
          y = 20;
        }
      };

      // Title & Header section
      doc.setDrawColor(245, 158, 11);
      doc.setFillColor(245, 158, 11);
      doc.rect(15, y, 180, 2, "F");
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(24, 25, 29);
      doc.text(cleanText(pdfLabels.title), 15, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(cleanText(pdfLabels.subtitle), 15, y);
      y += 5;

      const dateStr = new Date().toISOString().slice(0, 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(cleanText(`${pdfLabels.generated}: ${fmtDate(dateStr)}`), 15, y);
      y += 8;

      doc.setDrawColor(220, 220, 220);
      doc.line(15, y, 195, y);
      y += 10;

      // --- SECTION 1: BODY MEASUREMENTS ---
      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(245, 158, 11);
      doc.text(cleanText(pdfLabels.measurementsSection), 15, y);
      y += 6;

      if (!body || body.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(cleanText(pdfLabels.noMeasurements), 17, y);
        y += 10;
      } else {
        const sortedBody = [...body].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
        
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y - 4, 180, 6, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        
        doc.text(cleanText(pdfLabels.thDate), 17, y);
        doc.text(cleanText(`${pdfLabels.thWeight} (kg)`), 42, y);
        doc.text(cleanText(`${pdfLabels.thHeight} (cm)`), 67, y);
        doc.text(cleanText(pdfLabels.thBmi), 92, y);
        doc.text(cleanText(`${pdfLabels.thChest} (cm)`), 117, y);
        doc.text(cleanText(`${pdfLabels.thWaist} (cm)`), 142, y);
        doc.text(cleanText(`${pdfLabels.thArm} (cm)`), 167, y);
        
        y += 6;

        sortedBody.forEach((item, index) => {
          checkPageBreak(6);
          if (index % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(15, y - 4, 180, 6, "F");
          }
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 80);
          
          const bmiVal = (item.weight && item.height) 
            ? (item.weight / Math.pow(item.height / 100, 2)).toFixed(1) 
            : "-";
            
          doc.text(cleanText(fmtDate(item.date)), 17, y);
          doc.text(cleanText(item.weight ? `${item.weight}` : "-"), 42, y);
          doc.text(cleanText(item.height ? `${item.height}` : "-"), 67, y);
          doc.text(cleanText(bmiVal), 92, y);
          doc.text(cleanText(item.chest ? `${item.chest}` : "-"), 117, y);
          doc.text(cleanText(item.waist ? `${item.waist}` : "-"), 142, y);
          doc.text(cleanText(item.arm ? `${item.arm}` : "-"), 167, y);
          
          y += 6;
        });
        y += 6;
      }

      // --- SECTION 2: WORKOUT HISTORY & VOLUME ---
      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(245, 158, 11);
      doc.text(cleanText(pdfLabels.workoutsSection), 15, y);
      y += 6;

      if (!entries || entries.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(cleanText(pdfLabels.noWorkouts), 17, y);
        y += 10;
      } else {
        const workoutsToExport = entries.slice(0, 12);
        
        workoutsToExport.forEach((e) => {
          const loggedExes = Object.entries(e.dayLog)
            .filter(([id]) => !id.startsWith("__") && Array.isArray(e.dayLog[id]));
            
          const sessionVolume = calculateVolume(e.dayLog);
          const neededSpace = 14 + loggedExes.length * 5.5;
          
          checkPageBreak(neededSpace);
          
          doc.setDrawColor(230, 230, 230);
          doc.rect(15, y - 4, 180, neededSpace - 2);
          
          doc.setFillColor(245, 245, 245);
          doc.rect(15.1, y - 3.9, 179.8, 6.5, "F");
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(40, 40, 40);
          doc.text(cleanText(e.title), 18, y + 1);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(120, 120, 120);
          doc.text(cleanText(fmtDate(e.date)), 145, y + 1);
          
          y += 8.5;
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(100, 100, 100);
          let statsStr = `${pdfLabels.workoutSets}: ${e.doneSets}`;
          if (sessionVolume > 0) {
            statsStr += `  |  ${pdfLabels.workoutVolume}: ${sessionVolume} kg`;
          }
          if (e.cardio) {
            statsStr += `  |  ${pdfLabels.cardioDone}`;
          }
          doc.text(cleanText(statsStr), 18, y);
          y += 5;
          
          loggedExes.forEach(([exId, sets]) => {
            const info = idToExInfo[exId];
            const exName = info ? info.name : `Exercise (${exId})`;
            const isTime = info ? info.isTime : false;
            
            const setsStr = (sets as SetLog[]).map((s, sIdx) => {
              if (!s || !s.done) return null;
              return isTime 
                ? `${s.r}s` 
                : `${s.w}kg x ${s.r}`;
            }).filter(Boolean).join(", ");
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(70, 70, 70);
            doc.text(cleanText(`• ${exName}:`), 20, y);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(110, 110, 110);
            doc.text(cleanText(`[ ${setsStr} ]`), 95, y);
            
            y += 5;
          });
          
          y += 3;
        });
        y += 5;
      }

      // --- SECTION 3: PERSONAL RECORDS ---
      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(245, 158, 11);
      doc.text(cleanText(pdfLabels.prsSection), 15, y);
      y += 6;

      if (!prList || prList.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(cleanText(pdfLabels.noPrs), 17, y);
        y += 10;
      } else {
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y - 4, 180, 6, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        
        doc.text(cleanText("Exercise"), 17, y);
        doc.text(cleanText("Best Performance (PR)"), 105, y);
        doc.text(cleanText(pdfLabels.thDate), 160, y);
        
        y += 6;

        prList.forEach((pr, prIdx) => {
          checkPageBreak(6);
          if (prIdx % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(15, y - 4, 180, 6, "F");
          }
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 80);
          
          const resultStr = pr.isTime 
            ? `${pr.maxReps} ${pdfLabels.seconds}` 
            : `${pr.maxWeight} kg x ${pr.maxReps} ${pdfLabels.reps}`;
            
          doc.text(cleanText(pr.exerciseName), 17, y);
          doc.text(cleanText(resultStr), 105, y);
          doc.text(cleanText(fmtDate(pr.date)), 160, y);
          
          y += 6;
        });
      }

      doc.save(`DemirPlan_Report_${dateStr}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify({
        exportDate: new Date().toISOString(),
        workoutLogs: logs,
        bodyMeasurements: body,
      }, null, 2);
      
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `DemirPlan_Backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("JSON export failed:", error);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in" id="history-container">
      {/* Header row with tab switcher and PDF/JSON export actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" id="history-header-bar">
        {/* Tab Switcher */}
        <div className="flex bg-[#1b1d22] border border-[#2a2d34] rounded-2xl p-1 gap-1 flex-1 sm:max-w-[340px]" id="history-tabs">
          <button
            onClick={() => setSubTab("history")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 focus:outline-none ${
              subTab === "history"
                ? "bg-amber-500 text-gray-950 font-black shadow-md shadow-amber-500/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> {t.recentWorkouts}
          </button>
          <button
            onClick={() => setSubTab("prs")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 focus:outline-none ${
              subTab === "prs"
                ? "bg-amber-500 text-gray-950 font-black shadow-md shadow-amber-500/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 animate-pulse" /> {t.personalRecords}
          </button>
        </div>

        {/* Action Buttons (JSON + PDF) */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Export JSON Button */}
          <button
            onClick={handleExportJSON}
            className="py-2.5 px-4 bg-[#1b1d22]/80 hover:bg-amber-500/15 text-gray-300 hover:text-amber-500 border border-[#2a2d34] hover:border-amber-500/30 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none shrink-0"
            title={pdfLabels.exportJsonBtn}
          >
            <Download className="w-4 h-4 text-amber-500" />
            <span>{pdfLabels.exportJsonBtn}</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-gray-950 border border-amber-500/20 hover:border-amber-500 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            title={pdfLabels.exportBtn}
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? pdfLabels.exporting : pdfLabels.exportBtn}</span>
          </button>
        </div>
      </div>

      {/* 1. Workout History Tab */}
      {subTab === "history" && (
        <div className="space-y-3" id="recent-workouts-view">
          {entries.length === 0 ? (
            <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl p-8 text-center space-y-3">
              <div className="inline-flex p-3.5 bg-[#131417] border border-[#2a2d34] rounded-full text-gray-400">
                <Flame className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-gray-200">{t.noLogsTitle}</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                {t.noLogsDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((e, idx) => {
                const isExpanded = expandedIndex === idx;

                // Extract exercises logged on this day
                const loggedExercises = Object.entries(e.dayLog)
                  .filter(([id]) => !id.startsWith("__") && Array.isArray(e.dayLog[id]))
                  .map(([id, sets]) => {
                    const info = idToExInfo[id];
                    const name = info ? info.name : `Hərəkət (${id})`;
                    const isTime = info ? info.isTime : false;
                    return {
                      id,
                      name,
                      isTime,
                      sets: sets as SetLog[],
                    };
                  });

                // Check if any exercise performed today set an all-time PR
                const hasPRToday = Object.values(allPRs).some((pr) => pr.date === e.date);

                return (
                  <div
                    key={idx}
                    className={`bg-[#1b1d22] border rounded-3xl p-4 text-left transition-all duration-300 ${
                      isExpanded
                        ? "border-amber-500/40 bg-gradient-to-b from-[#1b1d22] to-[#141519] shadow-lg shadow-amber-500/5"
                        : "border-[#2a2d34] hover:border-[#2a2d34]/80"
                    }`}
                  >
                    {/* Header Row (Clickable to Expand) */}
                    <div
                      className="flex items-center justify-between gap-4 cursor-pointer select-none"
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    >
                      <div className="space-y-1">
                        <div className="font-black italic tracking-wide text-white uppercase text-base flex items-center gap-2">
                          <span>{e.title}</span>
                          {hasPRToday && (
                            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-[9px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shrink-0">
                              🏆 {t.record}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>{fmtDate(e.date)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right space-y-1 font-mono">
                          {e.doneSets > 0 && (
                            <div className="text-sm font-black text-emerald-400">{e.doneSets} {t.set.toLowerCase()} ✓</div>
                          )}
                          {e.bestWeight > 0 && (
                            <div className="text-[10px] text-gray-400 font-bold flex items-center justify-end gap-1">
                              <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
                              <span>{t.max}: {e.bestWeight} {lang === "en" ? "kg" : "kq"}</span>
                            </div>
                          )}
                          {e.cardio && (
                            <div className="text-[10px] text-amber-500 font-black tracking-wider uppercase">🏃 {t.cardio} ✓</div>
                          )}
                        </div>
                        <div className="text-gray-500 hover:text-white transition-colors">
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-amber-500" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Exercise Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[#2a2d34]/50 space-y-3.5 animate-fade-in text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest font-mono">
                            {t.details}
                          </span>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                            {t.completed}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {loggedExercises.length === 0 ? (
                            <p className="text-xs text-gray-500 italic text-center py-2">
                              {t.noExRecords}
                            </p>
                          ) : (
                            loggedExercises.map((ex, exIdx) => {
                              const hasExPRToday = allPRs[ex.name]?.date === e.date;
                              return (
                                <div
                                  key={exIdx}
                                  className="bg-[#141519]/40 border border-[#2a2d34]/40 rounded-2xl p-3.5 space-y-2.5"
                                >
                                  <div className="flex justify-between items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                                      {ex.name}
                                    </span>
                                    {hasExPRToday && (
                                      <span className="text-[8px] bg-amber-500/15 text-amber-500 border border-amber-500/25 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1 shrink-0 animate-pulse">
                                        <Sparkles className="w-2.5 h-2.5" /> {lang === "en" ? "PERSONAL RECORD" : lang === "ru" ? "ЛИЧНЫЙ РЕКОРД" : "ŞƏXSİ REKORD"} (PR)
                                      </span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {ex.sets.map((set, sIdx) => {
                                      if (!set || !set.done) return null;

                                      const pr = allPRs[ex.name];
                                      const isPRSet =
                                        pr &&
                                        pr.date === e.date &&
                                        (ex.isTime
                                          ? parseInt(set.r) === pr.maxReps
                                          : parseFloat(set.w) === pr.maxWeight && parseInt(set.r) === pr.maxReps);

                                      return (
                                        <div
                                          key={sIdx}
                                          className={`p-2.5 rounded-xl text-center font-mono transition-all border ${
                                            isPRSet
                                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.08)] scale-105"
                                              : "bg-[#181a20]/60 border-[#2a2d34]/60 text-gray-300"
                                          }`}
                                        >
                                          <div className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
                                            {t.set} {sIdx + 1}
                                          </div>
                                          <div className="text-xs">
                                            {ex.isTime ? (
                                              <span className="flex items-center justify-center gap-1 font-semibold">
                                                ⏱️ {set.r} {t.seconds}
                                              </span>
                                            ) : (
                                              <span className="flex flex-col items-center justify-center">
                                                <span className="font-bold">{set.w} {lang === "en" ? "kg" : "kq"}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                  {set.r} {t.reps}
                                                </span>
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Personal Records Tab View */}
      {subTab === "prs" && (
        <div className="space-y-4 animate-fade-in" id="prs-dashboard-view">
          {/* Motivation banner */}
          <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/5 border border-amber-500/20 rounded-3xl p-5 flex items-center gap-4 shadow-md text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-2xl font-bold shrink-0 animate-pulse">
              🏆
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest font-mono">
                {t.motivationSub}
              </span>
              <p className="text-xs text-gray-300 leading-relaxed font-semibold">
                {t.motivationText}
              </p>
            </div>
          </div>

          {prList.length === 0 ? (
            <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl p-8 text-center space-y-3">
              <div className="inline-flex p-3.5 bg-[#131417] border border-[#2a2d34] rounded-full text-gray-400">
                <Trophy className="w-6 h-6 text-gray-500" />
              </div>
              <h4 className="font-bold text-base text-gray-200">{t.noPrTitle}</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                {t.noPrDesc}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
              {prList.map((pr, pIdx) => {
                return (
                  <div
                    key={pIdx}
                    className="bg-[#1b1d22] border border-[#2a2d34] rounded-3xl p-4.5 space-y-3 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300 shadow-md text-left"
                  >
                    {/* Background Trophy Glow */}
                    <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
                      <Trophy className="w-20 h-20 text-amber-500" />
                    </div>

                    <div className="space-y-1 relative">
                      <div className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest font-mono">
                        {pr.dayTitle || t.workout}
                      </div>
                      <h4 className="font-black text-white text-sm uppercase tracking-wide truncate">
                        {pr.exerciseName}
                      </h4>
                    </div>

                    <div className="flex items-end justify-between relative pt-1">
                      <div className="space-y-1">
                        <span className="text-[8px] text-gray-500 font-extrabold uppercase tracking-widest font-mono block">
                          {t.bestResult}
                        </span>
                        <div className="text-lg font-black italic text-amber-500 font-mono tracking-tight flex items-baseline gap-1">
                          {pr.isTime ? (
                            <span>⏱️ {pr.maxReps} {t.seconds}</span>
                          ) : (
                            <>
                              <span>{pr.maxWeight} {lang === "en" ? "kg" : "kq"}</span>
                              <span className="text-xs font-normal text-gray-400 italic">× {pr.maxReps} {t.reps}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right space-y-0.5">
                        <span className="text-[8px] text-gray-500 font-extrabold uppercase tracking-widest font-mono block">
                          {t.date}
                        </span>
                        <span className="text-[10px] text-gray-300 font-semibold font-mono">
                          {fmtDate(pr.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
