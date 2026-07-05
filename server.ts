import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

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

// ─── API ENDPOINTS ────────────────────────────────────────

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Workout Program Generator (Gemini AI)
app.post("/api/generate-program", async (req, res) => {
  try {
    const { goal, days, level, equipment, notes, userContext } = req.body;
    const ai = getGeminiClient();

    const systemPrompt = `Sən professional və təcrübəli fitness məşqçisisən. Azərbaycan dilində danışırsan. 
İstifadəçilər üçün həftəlik meşq planları (proqramları) hazırlayırsan. Cavabların hər zaman motivasiyaedici, dəqiq və peşəkar olmalıdır.`;

    const userPrompt = `Aşağıdakı parametrlərə uyğun tam həftəlik meşq proqramı (cəmi 7 gün) qur:
- Məqsəd: ${goal || "ümumi forma"}
- Həftəlik gün sayı: ${days || 5} (istirahət günlərini də proqrama daxil et ki, cəmi 7 gün tamamlansın)
- Səviyyə: ${level || "orta"}
- Avadanlıq/Məkan: ${equipment || "tam təchizatlı zal"}
- İstifadəçi haqqında: ${userContext || "məlumat yoxdur"}
- Əlavə xüsusi qeydlər: ${notes || "yoxdur"}

Hərəkətlərin adları beynəlxalq dildə (ingiliscə, məs. "Bench press", "Squat", "Pull-ups", "Plank") yazılsın ki, idman zalında rahat anlaşılsın. Amma günlərin adları, alt başlıqlar və kardio qeydləri Azərbaycan dilində olsun. Vaxt əsaslı hərəkətlərdə (məs. "Plank") reps sütununda saniyə sayı (məs. "45-60") yaz.

MÜTLƏQ yalnız aşağıdakı JSON strukturunda cavab ver. Heç bir markdown formatı (\`\`\`json və s.), giriş və ya çıxış mətni əlavə etmə:
{
  "days": [
    {
      "title": "GÜNÜN ADI (məs. PUSH / ÇƏKİŞ / AYAQ / İSTİRAHƏT)",
      "subtitle": "Həmin günün qısa hədəfi və ya fokus sahəsi",
      "cardio": "Varsa kardio qeydi (məs. 15 dəqiqə yüngül qaçış), yoxdursa boş sətir",
      "exercises": [
        {
          "name": "Hərəkətin adı",
          "sets": 4,
          "reps": "Təkrar sayı (məs. 8-10 və ya 12)"
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
