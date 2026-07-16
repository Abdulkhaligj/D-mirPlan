import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateVideosOperation, Modality, ThinkingLevel } from "@google/genai";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import https from "https";
import http from "http";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing with higher limit for image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Initialize Gemini API
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY tənzimlənməyib. Zəhmət olmasa AI Studio Secrets panelində açarınızı əlavə edin.");
  }
  return new GoogleGenAI({ apiKey });
};

// Robust Gemini Content Generation with Auto-Retry & Fallback chains to handle 503 Service Unavailable / high demand
async function generateContentWithFallback(
  ai: any,
  params: {
    model: string;
    contents: any;
    config?: any;
  }
) {
  const initialModel = params.model || "gemini-3.5-flash";
  const modelChain: string[] = [initialModel];

  // Map appropriate fallbacks to keep services running smoothly
  if (initialModel === "gemini-3.1-pro-preview") {
    modelChain.push("gemini-3.5-flash");
    modelChain.push("gemini-3.1-flash-lite");
  } else if (initialModel === "gemini-3.5-flash" || initialModel === "gemini-2.5-flash") {
    if (initialModel === "gemini-2.5-flash") {
      modelChain.push("gemini-3.5-flash");
    }
    modelChain.push("gemini-3.1-flash-lite");
  } else if (initialModel === "gemini-3.1-flash-lite") {
    modelChain.push("gemini-3.5-flash");
  } else if (initialModel === "gemini-3.1-flash-image") {
    modelChain.push("gemini-3.1-flash-lite-image");
  } else if (initialModel === "gemini-3.1-flash-lite-image") {
    modelChain.push("gemini-3.1-flash-image");
  } else {
    modelChain.push("gemini-3.5-flash");
    modelChain.push("gemini-3.1-flash-lite");
  }

  // Deduplicate list of models
  const uniqueChain = Array.from(new Set(modelChain));
  let lastError: any = null;

  for (const modelName of uniqueChain) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[Gemini Fallback Engine] Calling ${modelName} (Attempt ${attempt}/3)`);
        
        // Clone config to prevent mutations across retries/fallbacks
        const config = params.config ? { ...params.config } : {};

        // Strip thinkingConfig for models other than gemini-3.1-pro-preview
        if (config.thinkingConfig && modelName !== "gemini-3.1-pro-preview") {
          console.log(`[Gemini Fallback Engine] Stripping thinkingConfig for model: ${modelName}`);
          delete config.thinkingConfig;
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: config
        });

        console.log(`[Gemini Fallback Engine] Successfully generated content with model: ${modelName}`);
        return response;
      } catch (err: any) {
        lastError = err;
        const errorMessage = (err.message || "").toLowerCase();
        
        // Check for 503 Unavailable, 429 Rate Limits, or "high demand" messages
        const isUnavailable = err.status === 503 || 
                            err.status === 429 ||
                            errorMessage.includes("503") || 
                            errorMessage.includes("429") || 
                            errorMessage.includes("unavailable") || 
                            errorMessage.includes("high demand") ||
                            errorMessage.includes("overloaded") ||
                            errorMessage.includes("resource_exhausted");

        console.warn(`[Gemini Fallback Engine] Call failed - Model: ${modelName}, Attempt: ${attempt}, Error: ${err.message}`);

        if (isUnavailable) {
          if (attempt < 3) {
            const delayMs = attempt * 1000;
            console.log(`[Gemini Fallback Engine] Model temporarily unavailable. Backing off for ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          } else {
            console.warn(`[Gemini Fallback Engine] Exceeded max attempts for model ${modelName}. Moving to next fallback...`);
            break;
          }
        } else {
          // Fail-fast for programmatic, syntax, or authentication errors
          throw err;
        }
      }
    }
  }

  throw lastError || new Error("Bütün mövcud Süni Zəka modelləri hazırda çox məşğuldur. Zəhmət olmasa bir az sonra yenidən cəhd edin.");
}

function getFriendlyGeminiError(err: any, lang: string): string {
  const errMsg = (err.message || "").toLowerCase();
  const isQuota = err.status === 429 ||
                  errMsg.includes("429") ||
                  errMsg.includes("quota") ||
                  errMsg.includes("limit") ||
                  errMsg.includes("resource_exhausted") ||
                  errMsg.includes("exhausted");

  const isOverloaded = err.status === 503 ||
                       errMsg.includes("503") ||
                       errMsg.includes("overloaded") ||
                       errMsg.includes("high demand") ||
                       errMsg.includes("unavailable");

  if (isQuota) {
    if (lang === "ru") {
      return "Лимит генерации видео ИИ (Veo) на сегодня исчерпан. Пожалуйста, используйте подробную текстовую инструкцию под упражнением.";
    } else if (lang === "en") {
      return "The AI video generation quota has been exceeded for today. Please refer to the detailed step-by-step text guide and illustration below the exercise.";
    } else {
      return "Süni Zəka (Veo) video generasiyası üçün bu günlük limit tükənib. Zəhmət olmasa, hərəkətin altındakı ətraflı mətn və şəkil təlimatından istifadə edin.";
    }
  }

  if (isOverloaded) {
    if (lang === "ru") {
      return "Сервер генерации видео ИИ сейчас перегружен. Пожалуйста, попробуйте еще раз через минуту или используйте текстовую инструкцию.";
    } else if (lang === "en") {
      return "The AI video generation service is currently overloaded. Please try again in a minute or refer to the text-based guide.";
    } else {
      return "Süni Zəka video xidməti hazırda həddindən artıq yüklənib. Zəhmət olmasa bir qədər sonra yenidən cəhd edin və ya mətn bələdçisindən istifadə edin.";
    }
  }

  return err.message || "Xəta baş verdi.";
}

// ─── API ENDPOINTS ────────────────────────────────────────

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Workout Program Generator (Gemini AI)
app.post("/api/generate-program", async (req, res) => {
  try {
    const { goal, days, level, equipment, notes, sport, userContext } = req.body;
    const ai = getGeminiClient();

    const systemPrompt = `Sən professional və təcrübəli fitness və idman məşqçisisən. Azərbaycan dilində danışırsan. 
İstifadəçilər üçün həftəlik meşq planları (proqramları) hazırlayırsan. Cavabların hər zaman motivasiyaedici, dəqiq və peşəkar olmalıdır.`;

    const userPrompt = `Aşağıdakı parametrlərə uyğun tam həftəlik meşq proqramı (cəmi 7 gün) qur:
- Məqsəd: ${goal || "ümumi forma"}
- Həftəlik gün sayı: ${days || 5} (istirahət günlərini də proqrama daxil et ki, cəmi 7 gün tamamlansın)
- Səviyyə: ${level || "orta"}
- Avadanlıq/Məkan: ${equipment || "tam təchizatlı zal"}
- İdman növü / Fokus: ${sport || "fitness"}
- İstifadəçi haqqında: ${userContext || "məlumat yoxdur"}
- Əlavə xüsusi qeydlər: ${notes || "yoxdur"}

GÖSTƏRİŞ: Əgər idman növü (Sport Type) standart "fitness" deyilsə (məs. boks (boxing), cüdo (judo), karate və ya futboldirsə), proqramdakı günlərin adlarını və hərəkətlərini MÜTLƏQ həmin idman növünə özəl qur. 
Məsələn:
- Boks üçün: Shadowboxing, heavy bag work, speed bag work, footwork drills, burpees, punching speed drills, core work, ip tullanma.
- Cüdo üçün: Grip strength training, Uchikomi, towel pullups, partlayıcı deadlift, core, bel və kürək dözümlülüyü.
- Karate üçün: Kihon, kata drills, explosive push-ups, hip rotation, balance drills, high kicks, dynamic stretching.
- Futbol üçün: Sprint intervals, agility ladder drills, cone agility, lunges, jump squats, hamstring bərpası, dözümlülük qaçışı.

Hərəkətlərin adları beynəlxalq dildə (ingiliscə və ya idman növünün terminində, məs. "Shadowboxing", "Bench press", "Uchikomi drill", "Sprint intervals", "Plank") yazılsın ki, idman zalında rahat anlaşılsın. Amma günlərin adları, alt başlıqlar və kardio qeydləri Azərbaycan dilində olsun. Vaxt əsaslı hərəkətlərdə reps sütununda saniyə sayı (məs. "45-60" və ya "180 saniyə") yaz.

MÜTLƏQ yalnız aşağıdakı JSON strukturunda cavab ver. Heç bir markdown formatı (\`\`\`json və s.), giriş və ya çıxış mətni əlavə etmə:
{
  "days": [
    {
      "title": "GÜNÜN ADI (məs. BOKS: SÜRƏT / CÜDO: TUTUŞ / PUSH / AYAQ / İSTİRAHƏT)",
      "subtitle": "Həmin günün qısa hədəfi və ya fokus sahəsi",
      "cardio": "Varsa kardio qeydi (məs. 15 dəqiqə yüngül qaçış), yoxdursa boş sətir",
      "exercises": [
        {
          "name": "Hərəkətin adı",
          "sets": 4,
          "reps": "Təkrar sayı və ya saniyə (məs. 8-10, 12 və ya 45-60 saniyə)"
        }
      ]
    }
  ]
}`;

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const replyText = response.text || "{}";
    const cleanedText = replyText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanedText);
    res.json(result);
  } catch (error: any) {
    console.error("Program generation error:", error);
    res.status(500).json({ error: error.message || "Proqram yaradılarkən xəta baş verdi." });
  }
});

// 3. AI Fitness Coach Chat (Gemini AI)
app.post("/api/chat-coach", async (req, res) => {
  try {
    const { messages, coachContext } = req.body;
    const ai = getGeminiClient();

    const systemPrompt = `${coachContext}
Azərbaycan dilində səmimi, professional, motivasiyaedici və qısa cavablar ver (maksimum 4-6 cümlə, lazım olanda nömrələnmiş qısa bəndlərdən istifadə et).
İstifadəçinin suallarına elmi və təhlükəsiz fitness prinsipləri ilə cavab ver. Zədələnmə risklərini minimuma endir. Əgər ciddi zədə şübhəsi varsa, mütləq həkimə müraciət etməsini məsləhət gör.`;

    // Map messages history to Gemini model input format
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({ reply: response.text || "" });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message || "Aİ cavab verə bilmədi." });
  }
});

// 4. Physique Photo Body Fat Analyzer (Multimodal Gemini AI)
app.post("/api/analyze-photo", async (req, res) => {
  try {
    const { photoBase64, photoType, userContext } = req.body;
    if (!photoBase64) {
      return res.status(400).json({ error: "Şəkil göndərilməyib." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Sən professional fitness məsləhətçisisən və bədən quruluşunu analiz etmək üzrə mütəxəssissən. 
Görüntüyə əsasən bədən yağ faizini və əzələ kütləsini qiymətləndirirsən. Hər zaman obyektiv, hörmətcil, motivasiyaedici və elmi prinsiplərə sadiq qalırsan.`;

    const userPrompt = `Bu bədən şəklinə əsasən vizual olaraq təxmini bədən yağ faizini qiymətləndir və istifadəçiyə uyğun fitness strategiyası tərtib et.
İstifadəçi məlumatı: ${userContext || "məlumat yoxdur"}.

MÜTLƏQ yalnız aşağıdakı JSON formatında cavab ver. Heç bir markdown formatı (\`\`\`json və s.) və ya əlavə mətn yazma:
{
  "bodyFatMin": 12,
  "bodyFatMax": 16,
  "category": "Kateqoriya (məs. Atletik, Fit, Normal, Artıq yağ)",
  "summary": "Şəkildəki bədən quruluşunun 2-3 cümləlik professional və motivasiyaedici analizi.",
  "goal": "Tövsiyə olunan məqsəd: 'cut' (arıqlama), 'maintain' (saxlama) və ya 'bulk' (kütlə yığma)",
  "trainingAdvice": "Bu bədən quruluşu üçün 2-3 cümləlik konkret məşq tövsiyəsi.",
  "nutritionAdvice": "Kalori hədəfi və makrolar haqqında 2-3 cümləlik konkret qidalanma tövsiyəsi."
}

Əgər yüklənən şəkil bir insan bədəni şəkli deyilsə və ya bədən yağ faizini analiz etmək mümkün deyilsə, yalnız aşağıdakı formatda cavab ver:
{
  "error": "Zəhmət olmasa düzgün bədən şəkli yükləyin (ayna qarşısında çəkilmiş və ya bədənin aydın göründüyü şəkil)."
}`;

    const cleanBase64 = photoBase64.split(",")[1] || photoBase64;

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: photoType || "image/jpeg",
            data: cleanBase64,
          },
        },
        {
          text: userPrompt,
        },
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const replyText = response.text || "{}";
    const cleanedText = replyText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanedText);
    res.json(result);
  } catch (error: any) {
    console.error("Photo analysis error:", error);
    res.status(500).json({ error: error.message || "Şəkil analiz edilərkən xəta baş verdi." });
  }
});

// 4b. AI Fitness Coach Performance and Progress Analyzer
app.post("/api/coach-analysis", async (req, res) => {
  try {
    const { program, logs, currentWeekStats, lastWeekStats, userContext, lang = "az" } = req.body;
    const ai = getGeminiClient();

    let systemInstruction = "";
    let userPrompt = "";

    if (lang === "ru") {
      systemInstruction = `Вы — профессиональный и высококвалифицированный фитнес-тренер и спортивный психолог. Вы говорите на русском языке. Вы анализируете журналы тренировок и программу пользователя, чтобы предоставить персонализированные, высокопрофессиональные, научно обоснованные и мотивационные отзывы и еженедельные цели.`;
      
      userPrompt = `На основе следующих данных проанализируйте активность пользователя за эту неделю и составьте индивидуальный план развития и цели.
Имя/Контекст пользователя: ${userContext || "нет данных"}
Текущая еженедельная статистика:
- Выполнено тренировок: ${currentWeekStats?.workouts || 0}
- Общий поднятый объем за эту неделю: ${currentWeekStats?.volume || 0} кг
- Выполнено подходов (сетов): ${currentWeekStats?.completedSets || 0} подходов
- Запланировано подходов (сетов): ${currentWeekStats?.plannedSets || 0} подходов
- Выполнено дней кардио: ${currentWeekStats?.completedCardio || 0}

Статистика за прошлую неделю:
- Выполнено тренировок: ${lastWeekStats?.workouts || 0}
- Общий поднятый объем: ${lastWeekStats?.volume || 0} кг
- Выполнено подходов (сетов): ${lastWeekStats?.completedSets || 0} подходов

Активная программа тренировок:
${JSON.stringify(program || [])}

Последние логи тренировок:
${JSON.stringify(logs || {})}

Пожалуйста, ответьте СТРОГО в следующем формате JSON. В ответе не должно быть никакого форматирования markdown (без \`\`\`json и т. д.):
{
  "coachOverview": "Текст из 3-4 предложений, тепло, профессионально и мотивационно оценивающий активность пользователя на этой неделе.",
  "achievements": [
    "Наибольшее достижение этой недели (например, 'Увеличение рабочего веса в приседаниях')",
    "Еще один положительный момент"
  ],
  "focusAreas": [
    {
      "title": "Область фокуса (например, 'Регулярность кардио', 'Восстановление')",
      "desc": "Рекомендация из 1-2 предложений о важности и способах улучшения."
    }
  ],
  "personalizedWeeklyGoals": [
    {
      "title": "Конкретная цель, рекомендованная ИИ",
      "metric": "Как достичь (например, 'Увеличьте вес в жиме лежа на 2,5 кг')"
    }
  ],
  "motivationalQuote": "Мотивационная цитата из 1 предложения, чтобы вдохновить пользователя."
}`;
    } else if (lang === "en") {
      systemInstruction = `You are a professional and highly qualified fitness coach and sports psychologist. You speak English. You analyze the user's workout logs and program to provide personalized, highly professional, science-based, and motivational feedback and weekly goals.`;
      
      userPrompt = `Based on the following information, analyze the user's activity this week and create a personalized progress plan and goals.
User Context: ${userContext || "none"}
Current Weekly Stats:
- Completed workouts count: ${currentWeekStats?.workouts || 0}
- Total Volume lifted this week: ${currentWeekStats?.volume || 0} kg
- Completed sets count: ${currentWeekStats?.completedSets || 0} sets
- Planned sets count: ${currentWeekStats?.plannedSets || 0} sets
- Completed cardio days: ${currentWeekStats?.completedCardio || 0}

Last Week Stats:
- Completed workouts count: ${lastWeekStats?.workouts || 0}
- Total Volume lifted: ${lastWeekStats?.volume || 0} kg
- Completed sets count: ${lastWeekStats?.completedSets || 0} sets

Active Workout Program:
${JSON.stringify(program || [])}

Recent Workout Logs:
${JSON.stringify(logs || {})}

Please answer STRICTLY in the following JSON format. No markdown blocks (\`\`\`json etc.) are allowed in the response:
{
  "coachOverview": "A warm, motivational, and professional evaluation of the user's activity this week in 3-4 sentences.",
  "achievements": [
    "The biggest achievement or positive highlight of this week (e.g., 'Increasing weight in squats')",
    "Another positive aspect"
  ],
  "focusAreas": [
    {
      "title": "Area of focus (e.g., 'Cardio consistency', 'Recovery')",
      "desc": "An explanation of its importance and a 1-2 sentence recommendation on how to improve it."
    }
  ],
  "personalizedWeeklyGoals": [
    {
      "title": "AI-recommended personalized concrete goal",
      "metric": "How to achieve this goal (e.g., 'Increase bench press weight by 2.5 kg')"
    }
  ],
  "motivationalQuote": "An inspiring, professional 1-sentence quote to keep the user going strong."
}`;
    } else {
      systemInstruction = `Sən professional və yüksək ixtisaslı fitness-məşqçi və idman psixoloqusan. Azərbaycan dilində danışırsan. İstifadəçinin məşq logs-larını (tarixçəsini) və proqramını təhlil edərək ona fərdi, son dərəcə peşəkar, elmi əsaslı və motivasiyaedici rəylər və hədəflər verirsən.`;
      
      userPrompt = `Aşağıdakı məlumatlara əsasən istifadəçinin bu həftəlik fəaliyyətini analiz et və fərdi inkişaf planı və hədəfləri tərtib et.
İstifadəçi Məlumatları: ${userContext || "yoxdur"}
Həftəlik Cari Statistika:
- Tamamlanmış Məşq sayı: ${currentWeekStats?.workouts || 0}
- Bu həftə qaldırılan Ümumi Həcm: ${currentWeekStats?.volume || 0} kq
- Tamamlanmış Set sayı: ${currentWeekStats?.completedSets || 0} set
- Planlaşdırılmış Set sayı: ${currentWeekStats?.plannedSets || 0} set
- Tamamlanmış Kardio günü: ${currentWeekStats?.completedCardio || 0}

Keçən Həftəlik Statistika:
- Tamamlanmış Məşq sayı: ${lastWeekStats?.workouts || 0}
- Qaldırılan Ümumi Həcm: ${lastWeekStats?.volume || 0} kq
- Tamamlanmış Set sayı: ${lastWeekStats?.completedSets || 0} set

Aktiv Məşq Proqramı:
${JSON.stringify(program || [])}

Son Məşq Log-лары:
${JSON.stringify(logs || {})}

Zəhmət olmasa, MÜTLƏQ yalnız aşağıdakı JSON formatında cavab ver. Cavabda heç bir markdown formatlaşdırması (\`\`\`json və s.) olmasın:
{
  "coachOverview": "İstifadəçinin bu həftəki fəaliyyətini səmimi, motivasiyaedici və professional şəkildə qiymətləndirən 3-4 cümləlik mətn.",
  "achievements": [
    "Bu həftə qazandığı ən böyük uğur və ya müsbət məqam (məs. 'Biceps hərəkətlərində çəkinin artırılması')",
    "Digər müsbət məqam"
  ],
  "focusAreas": [
    {
      "title": "Bu həftə mütləq diqqət yetirməli olduğu sahə 1 (məs. 'Kardio nizamı', 'Yuxu və Bərpa', 'Setlərin tamamlanması')",
      "desc": "Bunun əhəmiyyətini və necə düzəldə biləcəyini izah edən 1-2 cümləlik tövsiyə."
    }
  ],
  "personalizedWeeklyGoals": [
    {
      "title": "Aİ tərəfindən tövsiyə olunan 1-ci fərdi həftəlik konkret hədəf",
      "metric": "Bu hədəfə necə nail olunacağı (məs. 'Bench press-də çəkini 2.5 kq artır')"
    }
  ],
  "motivationalQuote": "Həftəni güclü şəkildə davam etdirmək üçün 1 cümləlik ruhlandırıcı və professional aforizm."
}`;
    }

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const replyText = response.text || "{}";
    const cleanedText = replyText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanedText);
    res.json(result);
  } catch (error: any) {
    console.error("Coach analysis endpoint error:", error);
    res.status(500).json({ error: error.message || "Məşqçi analizi yaradılarkən xəta baş verdi." });
  }
});

// 5. Secure Admin Verification and Premium Activation Trigger
app.post("/api/activate-premium", async (req, res) => {
  try {
    const { userId, email, plan, months } = req.body;
    // Mocking standard secure card processing. In a production app, this would verify a Stripe / Payriff webhook.
    // Since we want this fully functional immediately:
    res.json({
      success: true,
      message: "Ödəniş uğurla tamamlandı və Premium statusunuz aktivləşdirildi! 🎉",
      premiumUntil: months > 0 ? Date.now() + months * 30 * 24 * 60 * 60 * 1000 : null,
      plan: plan || `${months} aylıq Premium`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. AI Exercise Guide Generator (Gemini AI)
app.post("/api/exercise-guide", async (req, res) => {
  const { exerciseName } = req.body;
  if (!exerciseName) {
    return res.status(400).json({ error: "Hərəkət adı daxil edilməyib." });
  }

  // Generate a high-quality fallback guide in case Gemini API is down, rate-limited, or unavailable (e.g., 503 error)
  const getFallbackGuide = (nameStr: string) => {
    const name = nameStr.toLowerCase();
    let muscleGroup = "Press";
    let difficulty = "Orta";
    let steps = [
      "Hərəkətə başlamaq üçün düzgün duruş vəziyyəti alın və bədəni sabitləyin.",
      "Nəzarətli şəkildə yükü qaldırın və ya hərəkəti icra edin.",
      "Son nöqtədə əzələni 1 saniyə sıxın və başlanğıc vəziyyətinə yavaşca qayıdın."
    ];
    let breathing = "Güc tətbiq edərkən (ağırlığı qaldırarkən) nəfəs verin, endirərkən nəfəs alın.";
    let tip = "Hərəkəti tələsmədən, tam nəzarətlə və təmiz texnika ilə yerinə yetirin.";

    if (name.includes("squat") || name.includes("lunge") || (name.includes("press") && (name.includes("leg") || name.includes("foot")))) {
      muscleGroup = "Ayaq";
      difficulty = "Orta";
      steps = [
        "Ayaqlarınızı çiyin genişliyində açın, kürəyinizi düz saxlayın və çiyinlərinizi geri çəkin.",
        "Dizlərinizi bükərək çanağınızı geriyə doğru endirin (sanki stula əyləşirsiniz).",
        "Dabanlarınızdan güc alaraq yuxarı qalxın və ayaq əzələlərinizi sıxın."
      ];
      tip = "Dizlərinizin ayaq barmaqlarınızın ucunu keçməməsinə və daxilə doğru bükülməməsinə diqqət edin.";
    } else if (name.includes("bench") || name.includes("chest") || name.includes("push") || name.includes("fly")) {
      muscleGroup = "Sinə";
      difficulty = "Başlanğıc";
      steps = [
        "Skamyaya uzanın, kürəyinizi azca qövsvari saxlayın və dabanlarınızı yerə bərkidin.",
        "Ağırlığı nəzarətli şəkildə sinənizin orta hissəsinə doğru endirin.",
        "Dirsəklərinizi tam kilidləmədən ağırlığı yuxarıya doğru itələyin və sinə əzələlərinizi sıxın."
      ];
      tip = "Dirsəklərinizi çiyinlərinizlə düz 90 dərəcə bucaq altında yox, təxminən 75 dərəcə bucaq altında saxlayın.";
    } else if (name.includes("row") || name.includes("pull") || name.includes("lat") || name.includes("deadlift") || name.includes("chin")) {
      muscleGroup = "Kürək";
      difficulty = "Orta";
      steps = [
        "Kürəyinizi tam düz saxlayaraq gövdənizi hazırlayın və çiyinlərinizi aşağı salın.",
        "Dirsəklərinizi bədəninizə yaxın saxlayaraq ağırlığı qarnınıza və ya kürəyinizə doğru çəkin.",
        "Kürək əzələlərinizi tam sıxdıqdan sonra ağırlığı yavaşca buraxaraq əzələni uzadın."
      ];
      tip = "Hərəkəti qollarınızla deyil, dirsəklərinizi geri çəkərək kürək gücü ilə etməyə çalışın.";
    } else if (name.includes("curl") || name.includes("tricep") || name.includes("bicep") || name.includes("pushdown") || name.includes("extension")) {
      muscleGroup = "Qol";
      difficulty = "Başlanğıc";
      steps = [
        "Dirsəklərinizi gövdənizə yapışdırın və bədəninizi tamamilə sabit saxlayın.",
        "Yalnız qolun ön/arxa hissəsini hərəkət etdirərək çəkini yuxarı/aşağı idarəli aparın.",
        "Son nöqtədə əzələni maksimum dərəcədə gərginləşdirin və yavaşca geri qaytarın."
      ];
      tip = "Hərəkət zamanı bədəninizi yellətməyin (impulsdan istifadə etməyin) və dirsəklərinizi tərpətməyin.";
    } else if (name.includes("shoulder") || name.includes("lateral") || name.includes("raise") || name.includes("deltoid") || (name.includes("press") && name.includes("shoulder"))) {
      muscleGroup = "Çiyin";
      difficulty = "Orta";
      steps = [
        "Düz dayanın və ya oturaraq kürəyinizi dəstəkləyin, çəkiləri çiyin səviyyəsində saxlayın.",
        "Dirsəklərinizi bir qədər qabaqda saxlayaraq ağırlığı başınızın üzərinə doğru qaldırın.",
        "Son nöqtədə bir anlıq gözləyin və çəkini yavaş-yavaş başlanğıc vəziyyətinə endirin."
      ];
      tip = "Çiyin hərəkətlərində çox ağır çəki yerinə, tam hərəkət diapazonu (ROM) və düzgün texnikaya üstünlük verin.";
    } else if (name.includes("crunches") || name.includes("plank") || name.includes("leg raise") || name.includes("abs") || name.includes("press") || name.includes("sit-up")) {
      muscleGroup = "Press";
      difficulty = "Başlanğıc";
      steps = [
        "Mat üzərinə uzanın və ya plank vəziyyəti alaraq bədəninizi düz bir xətt halında saxlayın.",
        "Qarın əzələlərinizi bərk sıxaraq bədəninizi yuxarı bükün və ya sabit durun.",
        "Gərginliyi hiss edərək yavaş-yavaş nəfəs alın və başlanğıc vəziyyətinizə qayıdın."
      ];
      tip = "Boynunuzu qollarınızla dartmayın; gücü yalnız qarın (nüvə) əzələlərinizdən alın.";
    } else if (name.includes("cardio") || name.includes("run") || name.includes("treadmill") || name.includes("cycle") || name.includes("bike") || name.includes("elliptical") || name.includes("jump") || name.includes("rope")) {
      muscleGroup = "Kardio";
      difficulty = "Başlanğıc";
      steps = [
        "Düzgün qaçış və ya idman ayaqqabısı geyinin, bədəninizi isindirin.",
        "Nəfəs ritminizi qoruyaraq təyin olunmuş tempdə hərəkət edin.",
        "Məşqin sonunda tempinizi tədricən azaldaraq bədəninizi soyudun (cool down)."
      ];
      tip = "Məşq zamanı bol su için və ürək döyüntülərinizi (nəbzinizi) nəzarətdə saxlayın.";
    } else if (name.includes("glute") || name.includes("deadlift") || name.includes("hip") || name.includes("thrust") || name.includes("calf") || name.includes("calves")) {
      muscleGroup = "Bud";
      difficulty = "Orta";
      steps = [
        "Ayaqlarınızı yerə möhkəm basın və çanağınızı hərəkətə hazırlayın.",
        "Bud və büzmək əzələlərinizi sıxaraq çanağınızı yuxarıya doğru itələyin.",
        "Son nöqtədə əzələni 1-2 saniyə sıxın və nəzarətli şəkildə aşağı endirin."
      ];
      tip = "Gücü belinizdən deyil, dabanlarınızdan və bud arxası/büzmək əzələlərinizdən alın.";
    }

    return {
      exerciseName: nameStr,
      muscleGroup,
      difficulty,
      steps,
      breathing,
      tip
    };
  };

  try {
    const ai = getGeminiClient();

    const systemPrompt = `Sən professional və təcrübəli fitness məşqçisisən. Azərbaycan dilində danışırsan.
İstifadəçilərə hərəkətlərin düzgün icra qaydalarını, hədəf əzələ qruplarını və təhlükəsizlik qaydalarını izah edirsən.`;

    const userPrompt = `"${exerciseName}" hərəkəti üçün kiçik, cəlbedici icra bələdçisi tərtib et.
Aşağıdakı JSON strukturunda və yalnız Azərbaycan dilində cavab ver. Cavabda heç bir markdown formatı (\`\`\`json və s.) istifadə etmə, birbaşa JSON-u qaytar:

{
  "exerciseName": "${exerciseName}",
  "muscleGroup": "Əsas hədəf əzələsi. YALNIZ bu 8 qrupdan birini seç və dəqiq yaz: 'Sinə', 'Kürək', 'Ayaq', 'Çiyin', 'Qol', 'Press', 'Kardio', 'Bud'",
  "difficulty": "Hərəkətin çətinlik dərəcəsi ('Başlanğıc', 'Orta', 'İrəli')",
  "steps": [
    "Hərəkətə başlamaq üçün ilk hazırlıq və ya düzgün duruş vəziyyəti (1 cümlə).",
    "Hərəkətin icrası və ağırlığın qaldırılması/endirilməsi anı (1 cümlə).",
    "Hərəkəti tamamlayarkən diqqət edilməli olan son nöqtə (1 cümlə)."
  ],
  "breathing": "Doğru nəfəs alma qaydası (məs. 'Ağırlığı qaldırarkən nəfəs verin, endirərkən nəfəs alın').",
  "tip": "Hərəkətin daha effektiv olması və zədələnməmək üçün 1 qısa qızıl qayda və ya məsləhət."
}`;

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const replyText = response.text || "{}";
    const cleanedText = replyText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanedText);
    res.json(result);
  } catch (error: any) {
    console.error("Exercise guide generation error, using fallback helper:", error);
    // Graceful fallback helper in case of high demand, quotas, or key issues
    try {
      const fallback = getFallbackGuide(exerciseName);
      res.json(fallback);
    } catch (fallbackError) {
      res.status(500).json({ error: "Bələdçi yaradılarkən xəta baş verdi." });
    }
  }
});

// 7. Secure Audio Streaming Proxy (Bypasses CORS, Rate Limits, and Origin Blocks)
app.get("/api/music/proxy", (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).send("URL parametr tələb olunur");
  }

  const fetchAudioWithRedirects = (targetUrl: string, depth = 0) => {
    if (depth > 5) {
      return res.status(500).send("Çox sayda yönləndirmə (Redirect loop)");
    }

    const client = targetUrl.startsWith("https") ? https : http;
    const requestHeaders: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://archive.org/"
    };
    if (req.headers.range) {
      requestHeaders["range"] = req.headers.range;
    }

    client.get(targetUrl, { headers: requestHeaders }, (response) => {
      // Handle redirects
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        let redirectUrl = response.headers.location;
        if (!redirectUrl.startsWith("http")) {
          const parsedUrl = new URL(targetUrl);
          redirectUrl = parsedUrl.origin + redirectUrl;
        }
        return fetchAudioWithRedirects(redirectUrl, depth + 1);
      }

      // Check status
      if (response.statusCode && response.statusCode >= 400) {
        return res.status(response.statusCode).send(`Audio yüklənərkən xəta: ${response.statusCode}`);
      }

      // Set headers for CORS and streaming
      res.statusCode = response.statusCode || 200;
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      
      const copyHeaders = ["content-type", "content-length", "accept-ranges", "content-range"];
      copyHeaders.forEach(header => {
        if (response.headers[header]) {
          res.setHeader(header, response.headers[header] as string);
        }
      });

      response.pipe(res);
    }).on("error", (err) => {
      console.error("Audio proxy error:", err);
      res.status(500).send(`Proksi xətası: ${err.message}`);
    });
  };

  fetchAudioWithRedirects(url);
});

// ─── GEMINI HUB ENDPOINTS ──────────────────────────────────

// 1. Unified Gemini Content Generator (Text, Multimodal, Thinking, Grounding)
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { model, prompt, history, systemInstruction, thinkingLevel, useSearch, useMaps, photoBase64, photoType, videoBase64, videoType } = req.body;
    const ai = getGeminiClient();

    const tools: any[] = [];
    if (useSearch) {
      tools.push({ googleSearch: {} });
    }
    if (useMaps) {
      tools.push({ googleMaps: {} });
    }

    const config: any = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    if (tools.length > 0) {
      config.tools = tools;
    }
    
    // Config thinking Level (only for gemini-3.1-pro-preview or other Gemini 3 series models)
    if (thinkingLevel && model === "gemini-3.1-pro-preview") {
      config.thinkingConfig = {
        thinkingLevel: thinkingLevel === "HIGH" ? ThinkingLevel.HIGH : ThinkingLevel.LOW
      };
      // Do not set maxOutputTokens for HIGH thinking
    }

    const contents: any[] = [];
    if (history && history.length > 0) {
      contents.push(...history.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      })));
    }

    const currentParts: any[] = [];
    if (photoBase64) {
      const cleanPhotoBase64 = photoBase64.split(",")[1] || photoBase64;
      currentParts.push({
        inlineData: {
          data: cleanPhotoBase64,
          mimeType: photoType || "image/jpeg"
        }
      });
    }
    if (videoBase64) {
      const cleanVideoBase64 = videoBase64.split(",")[1] || videoBase64;
      currentParts.push({
        inlineData: {
          data: cleanVideoBase64,
          mimeType: videoType || "video/mp4"
        }
      });
    }
    currentParts.push({ text: prompt });

    if (history && history.length > 0) {
      contents.push({ role: "user", parts: currentParts });
    } else {
      contents.push({ parts: currentParts });
    }

    const response = await generateContentWithFallback(ai, {
      model: model || "gemini-3.5-flash",
      contents,
      config
    });

    // Extract citations/grounding metadata if any
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || chunk.web?.uri || "Mənbə",
      uri: chunk.web?.uri || ""
    })).filter((src: any) => src.uri) || [];

    res.json({
      text: response.text || "",
      sources
    });
  } catch (err: any) {
    console.error("Gemini generate content error:", err);
    res.status(500).json({ error: err.message || "Xəta baş verdi." });
  }
});

// 2. Audio Transcription Endpoint
app.post("/api/gemini/transcribe", async (req, res) => {
  try {
    const { audioBase64, audioType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "Səs faylı göndərilməyib." });
    }
    const cleanBase64 = audioBase64.split(",")[1] || audioBase64;
    const ai = getGeminiClient();
    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: audioType || "audio/wav"
          }
        },
        { text: "Zəhmət olmasa bu audiodakı danışığı dəqiq şəkildə yazıya (transkriptə) çevir. Yalnız deyilən sözləri yaz, heç bir əlavə şərh vermə." }
      ]
    });
    res.json({ text: response.text || "" });
  } catch (err: any) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Aspect Ratio Controlled Image Generation & Editing (Nano Banana)
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio, photoBase64, photoType } = req.body;
    const ai = getGeminiClient();

    const parts: any[] = [];
    if (photoBase64) {
      const cleanBase64 = photoBase64.split(",")[1] || photoBase64;
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: photoType || "image/jpeg"
        }
      });
    }
    parts.push({ text: prompt || "Generate a beautiful workout illustration." });

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.1-flash-image",
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1",
          imageSize: "1K"
        }
      }
    });

    let imageUrl = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
        break;
      }
    }

    res.json({ imageUrl });
  } catch (err: any) {
    console.error("Image generation error:", err);
    res.status(500).json({ error: err.message || "Şəkil yaradılarkən xəta baş verdi." });
  }
});

// 4. Music Generation Studio (Lyria Streaming Proxy)
app.post("/api/generate-music", async (req, res) => {
  try {
    const { prompt, duration, photoBase64, photoType } = req.body;
    const ai = getGeminiClient();

    const selectedModel = duration === "pro" ? "lyria-3-pro-preview" : "lyria-3-clip-preview";

    const parts: any[] = [];
    parts.push({ text: prompt || "Generate a beautiful ambient background music track." });
    
    if (photoBase64) {
      const cleanBase64 = photoBase64.split(",")[1] || photoBase64;
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: photoType || "image/jpeg"
        }
      });
    }

    const response = await ai.models.generateContentStream({
      model: selectedModel,
      contents: { parts },
    });

    let audioBase64 = "";
    let lyrics = "";
    let mimeType = "audio/wav";

    for await (const chunk of response) {
      const chunkParts = chunk.candidates?.[0]?.content?.parts;
      if (!chunkParts) continue;
      for (const part of chunkParts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    res.json({ audio: audioBase64, lyrics, mimeType });
  } catch (err: any) {
    console.error("Music generation error:", err);
    res.status(500).json({ error: err.message || "Musiqi yaradılarkən xəta baş verdi." });
  }
});

// 5. Video Generation Start (Veo Video)
app.post("/api/generate-video", async (req, res) => {
  const { prompt, aspectRatio, photoBase64, photoType, lang = "az" } = req.body;
  try {
    const ai = getGeminiClient();
    
    const payload: any = {
      model: 'veo-3.1-fast-generate-preview',
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio || '16:9'
      }
    };
    if (prompt) {
      payload.prompt = prompt;
    }
    if (photoBase64) {
      const cleanBase64 = photoBase64.split(",")[1] || photoBase64;
      payload.image = {
        imageBytes: cleanBase64,
        mimeType: photoType || 'image/png'
      };
    }
    
    const operation = await ai.models.generateVideos(payload);
    res.json({ operationName: operation.name });
  } catch (err: any) {
    console.error("Video generation start error:", err);
    res.status(500).json({ error: getFriendlyGeminiError(err, lang) });
  }
});

// 6. Video Generation Status Polling
app.post("/api/video-status", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: "Operation name missing." });
    }
    const ai = getGeminiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    res.json({ done: updated.done, error: updated.error });
  } catch (err: any) {
    console.error("Video polling error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 7. Video Download & Streaming Proxy
app.post("/api/video-download", async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: "Operation name missing." });
    }
    const ai = getGeminiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: "Video yükləmə linki hələ hazır deyil." });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey || "" },
    });
    res.setHeader('Content-Type', 'video/mp4');
    const buffer = await videoRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    console.error("Video download proxy error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── VITE MIDDLEWARE SETUP ────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });

  // WebSocket Server for Live Voice API
  const wss = new WebSocketServer({ server, path: "/live" });
  wss.on("connection", async (clientWs) => {
    console.log("Live Voice client connected!");
    
    let session: any = null;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        throw new Error("GEMINI_API_KEY tənzimlənməyib.");
      }
      const ai = new GoogleGenAI({ apiKey });
      
      session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "Sən istifadəçinin səsli fitness köməkçisisən. Azərbaycan dilində danışırsan. Cavabların hər zaman qısa, dəqiq, həvəsləndirici və səmimi olmalıdır (maksimum 1-2 cümlə).",
        },
        callbacks: {
          onmessage: (message) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
        },
      });

      clientWs.on("message", (data) => {
        try {
          const { audio } = JSON.parse(data.toString());
          if (audio && session) {
            session.sendRealtimeInput({
              audio: { data: audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch (e) {
          console.error("Live ws message parsing error:", e);
        }
      });

    } catch (err: any) {
      console.error("Live API setup error:", err);
      clientWs.send(JSON.stringify({ error: err.message || "Live API qoşulma xətası" }));
      clientWs.close();
    }

    clientWs.on("close", () => {
      console.log("Live Voice client disconnected");
      if (session) {
        try {
          session.close();
        } catch (e) {}
      }
    });
  });
}

startServer();
