export type Language = "az" | "en" | "de" | "ru";

export const translations = {
  az: {
    // Header & Nav
    features: "Üstünlüklər",
    appPreview: "Tətbiq Görünüşü",
    calculator: "Kalori Kalkulyatoru",
    pricing: "Tariflər",
    faq: "Sual-Cavab",
    login: "Daxil Ol",
    register: "Qeydiyyatdan Keç",
    startWorkout: "Məşqə Başla",
    backToPlatform: "Platformaya Qayıt",
    landingPage: "Tanıtım Saytı",
    logout: "Çıxış",
    adminPanel: "Admin Panel",

    // Hero Section
    aiPoweredTitle: "Süni Zəka ilə Təchiz Olunmuş Ağıllı Fitness Platforması",
    heroTitlePart1: "DƏMİR KIMI BƏDƏN,",
    heroTitlePart2: "SÜNİ ZƏKA",
    heroTitlePart3: "KÖMƏYİ İLƏ.",
    heroSubtitle: "DəmirPlan Pro fiziki göstəricilərinizə əsaslanan tam fərdi məşq proqramları, ağıllı qidalanma hesablamaları və 24/7 audio dəstəkli səsli süni zəka köməkçisidir.",
    startWorkoutsBtn: "Məşqlərə Başla",
    exploreFeaturesBtn: "İmkanları Kəşf Et",

    // Hero Stats
    activeAthletes: "Aktiv Atlet",
    aiCoachSupport: "Aİ Coach Dəstəyi",
    createdPlans: "Yaradılmış Plan",
    freeForever: "Limitsiz Ödənişsiz",

    // Features Section
    whyDemirPlan: "Niyə DəmirPlan Pro?",
    featuresTitle: "ƏN MÜASİR METODLAR VƏ Aİ TEXNOLOGİYASI",
    featuresSubtitle: "Hər addımınızda yanınızda olan ağıllı köməkçi platformamızın əsas üstünlükləri:",
    
    feat1Title: "Fərdi Məşq Proqramları",
    feat1Desc: "Boy, çəki, idman hədəfləriniz və məşq təcrübənizə əsaslanan fərdi planlar. Hərəkətlərin setləri, təkrarları və həftəlik məşq yüklənməsi hər an tam nəzarətdədir.",
    feat1Bullet1: "Gündəlik tərəqqi və loqların qeydi",
    feat1Bullet2: "Hər hərəkətə uyğun Aİ texniki qeydləri",

    feat2Title: "Google Gemini Aİ Hub",
    feat2Desc: "Yazılı və səsli olaraq suallarınızı cavablandıran ağıllı fitness assistenti. Məşq və qidalanma haqqında hər şeyi dərhal soruşun, audio rejimdə real vaxtda dinləyin.",
    feat2Bullet1: "Real vaxtda səsli məsləhət və analiz",
    feat2Bullet2: "Foto ilə bədən yağ faizi təyini",

    feat3Title: "Ağıllı Qidalanma & Kalori",
    feat3Desc: "Məqsədinizə (çəki vermək, mövcud çəkini saxlamaq və ya əzələ kütləsi qazanmaq) uyğun gündəlik hədəf kalori, zülal (protein), karbohidrat və yağ hesablamaları.",
    feat3Bullet1: "Aktivlik dərəcəsinə görə dinamik TDEE",
    feat3Bullet2: "Su xatırladıcısı və bədən nəmliyi loqu",

    feat4Title: "Hərtərəfli Tərəqqi & Liderlər Cədvəli",
    feat4Desc: "Bədən ölçülərinizi (qol, sinə, bel, bud və s.) qeyd edin, bədən çəki qrafiklərinizi izləyin. Eyni zamanda platformadakı digər atletlərlə məşq ardıcıllığı üzrə sağlam rəqabətə qoşulun!",
    
    feat5Title: "Focus Məşq Səs Mühiti (Audio)",
    feat5Desc: "İdman zamanı diqqəti 100% məşqdə saxlamaq üçün binaural dalğalar, güclü synth beat-ləri və ürək ritminə uyğunlaşan, beyni stimullaşdıran xüsusi fon səs mühitləri.",

    // App Preview Section
    previewTitle: "MODERN VƏ DİNAMİK İNTERFEYS",
    previewSubtitle: "Heç bir artıq detal olmadan, tamamilə sürətli və qaranlıq dizayn sayəsində məşqinizə fokuslanın.",
    athleteBadge: "DəmirPlan Pro Atleti",
    weeklyWorkoutDays: "Həftəlik Məşq Günləri",
    daysText: ["1-ci Gün", "2-ci Gün", "3-cü Gün", "İstirahət"],
    workoutMockTitle: "🏋️‍♂️ Sine & Triceps",
    workoutMockSize: "6 Hərəkət",
    workoutMockEx1: "1. Incline Bench Press",
    workoutMockEx2: "2. Dumbbell Fly",
    workoutMockExSets1: "4 set x 10 təkrar",
    workoutMockExSets2: "3 set x 12 təkrar",
    motivationMockQuote: '"Mükəmməl bir fiziki bədən üçün proqramı davamlı izləyin!"',
    aiHubTitle: "DƏMİRPLAN Aİ HUB (COACH)",
    aiMessageMock1: "Sənə fərdi məşq proqramını və qidalanma hədəflərini hazırladım. Bu gün döş və triceps məşqimiz var. Hər hansı bir hərəkəti dəyişmək və ya qızışma hərəkətlərini soruşmaq istəyirsən?",
    userMessageMock1: "Təşəkkürlər! Bench Press edərkən çiynimdə bir az ağrı hiss edirəm, hansı hərəkətlə əvəz edə bilərəm?",
    aiMessageMock2: "Çiyin ağrısını azaltmaq üçün şaquli presi (Bench Press) müvəqqəti olaraq Dumbbell Floor Press və ya Dumbbell Press (30 dərəcə bucaq altında) ilə əvəz edə bilərik. Bu çiyin oynağına düşən təzyiqi azaldır.",
    targetCalorie: "Hədəf Kalori",
    protein: "Zülal",
    workoutConsistency: "Məşq Davamlılığı",

    // Calorie Calculator Section
    calcTool: "Ağıllı Alət",
    calcTitle: "ANLIQ KALORİ VƏ MAKRO HESABLAYICI",
    calcSubtitle: "Aşağıdakı formu dolduraraq gündəlik kalori və qida ehtiyacınızı dərhal hesablayın!",
    gender: "Cinsiyyət",
    male: "Kişi",
    female: "Qadın",
    goal: "Hədəf",
    goalLoss: "Çəki İtirilməsi (Arıqlama)",
    goalMaintain: "Mövcud Çəkini Saxlamaq",
    goalGain: "Əzələ Kütləsi (Çəki Artımı)",
    weight: "Çəki (kq)",
    height: "Boy (sm)",
    age: "Yaş",
    activityLevel: "Aktivlik Səviyyəsi",
    act1: "Az Hərəkətli (Ofis işi, idmansız)",
    act2: "Yüngül Aktiv (Həftədə 1-3 gün idman)",
    act3: "Orta Aktiv (Həftədə 3-5 gün orta idman)",
    act4: "Çox Aktiv (Həftədə 6-7 gün ağır məşqlər)",
    btnCalculate: "Ehtiyacları Hesabla",
    dailyTargetIntake: "MƏQSƏDLİ GÜNDƏLİK QƏBUL",
    proteinLabel: "Zülal (Protein)",
    carbsLabel: "Karbohidrat",
    fatsLabel: "Yağlar",
    aiPlanLabel: "Aİ ilə bu plana uyğun qidalanma planı yarat",
    calcReadyTitle: "Hesablama Hazırdır",
    calcReadyDesc: "Göstəricilərinizi daxil edib 'Ehtiyacları Hesabla' düyməsinə klikləyərək fərdi nəticələrinizi dərhal görün.",

    // Transformations
    transformationsTitle: "REALLAŞAN TRANSFORMASİYALAR",
    transformationsSubtitle: "DəmirPlan Pro tətbiqi və Aİ dəstəyi ilə hədəflərinə çatan bəzi uğur hekayələrimiz:",
    t1Diff: "-14 kq",
    t1Quote: '"Əvvəllər idman salonlarında nə edəcəyimi bilmirdim. DəmirPlan Pro mənə hər məşqi set-set, təkrar-təkrar yazdı. Ən çox bəyəndiyim isə Aİ köməkçisidir. Suallarıma elə dərhal cavab verir ki, sanki yanımda fərdi məşqçim var!"',
    t1User: "Elnur Rzayev",
    t1UserSub: "Bakı, 28 yaş (Mühəndis)",
    t2Diff: "+8 kq Əzələ",
    t2Quote: '"Mənim üçün çəki artırmaq çox çətin idi, amma platformanın tərtib etdiyi yüksək kalorili qidalanma planı və fərdi məşq proqramı sayəsində çox təmiz 8 kq kütlə qazandım. Hər bir addımda məşqlərimi qeyd etmək məni motivasiya edirdi."',
    t2User: "Leyla Nəsirli",
    t2UserSub: "Sumqayıt, 24 yaş (Tələbə)",

    // Pricing Section
    pricingTitle: "HƏR KƏS ÜÇÜN ƏLÇATAN FİTNES",
    pricingSubtitle: "Heç bir gizli ödəniş yoxdur. Sınırsız imkanlar hər bir istifadəçiyə tamamilə açıqdır.",
    sponsorFree: "Sponsorlu / Ödənişsiz",
    unlimitedPremium: "Limitsiz Premium",
    sponsorPartnership: "Leo Bank və M10 tərəfdaşlığı ilə tam ödənişsiz",
    lifetimeFree: "/ ömürlük limitsiz",
    pricingBenefits: [
      "Gündəlik Fərdi Məşq Planlaması",
      "Google Gemini Aİ Hub (Limitsiz Söhbətlər)",
      "Real Vaxtda Səsli Aİ Coach Dəstəyi",
      "Foto ilə Aİ Yağ Faizi Analizi",
      "Ağıllı Qidalanma, Kalori və Makro Hesablamaları",
      "Su Xatırladıcı Modulu",
      "Fokus Məşq Səs Sferaları (Audio Fon)",
      "Bədən Ölçüləri & Çəki Qrafikləri",
      "Milli Atletlər Liderlər Cədvəli"
    ],
    createAccountBtn: "İndi Hesab Yarat",

    // FAQ Section
    faqTitle: "TEZ-TEZ SORUŞULAN SUALLAR",
    faqSubtitle: "Tətbiqimiz və imkanlar barədə ağlınızdakı bütün sualların cavabları:",
    faqsList: [
      {
        q: "DəmirPlan Pro tamamilə ödənişsizdir?",
        a: "Bəli! Hal-hazırda platformadakı bütün premium imkanlar (Aİ Hub, limitsiz məşq planlaması, qidalanma analizi və yağ faizi hesablanması) tamamilə ödənişsiz və limitsizdir. Leo Bank və m10 dəstəyi sayəsində abunə haqqı ödəmədən bütün imkanlardan yararlana bilərsiniz."
      },
      {
        q: "Aİ Məşqçi (Aİ Hub) necə işləyir?",
        a: "Aİ Hub ən müasir Google Gemini Süni Zəka modelindən istifadə edir. O sizin boyunuz, çəkiniz, məşq keçmişiniz və hədəfləriniz əsasında sizə 24/7 dəstək verir. Eyni zamanda audio səsli analiz və bədən şəklinizlə yağ faizi analizi edə bilir."
      },
      {
        q: "Məşq proqramını özüm fərdiləşdirə bilərəm?",
        a: "Əlbəttə! Aİ tərəfindən sizə təklif olunan istənilən məşqi dəyişdirə, yeni hərəkətlər əlavə edə, set və təkrar saylarını redaktə edə bilərsiniz. Platforma həm avtomatik, həm də tam mexaniki tənzimləməni dəstəkləyir."
      },
      {
        q: "Bədən tərkibi və yağ faizi analizi nə dərəcədə dəqiqdir?",
        a: "Tətbiq həm ABŞ Hərbi Dəniz Qüvvələrinin (Navy Method) riyazi düsturunu, həm də Aİ vizual analiz motorunu təklif edir. Hər iki metodu birləşdirərək ən yaxın və optimal yağ faizi nəticəsini dərhal əldə edirsiniz."
      }
    ],

    // CTA & Footer
    ctaTitle: "BƏDƏNİNİZİ YENİDƏN KƏŞF EDİN",
    ctaSubtitle: "Süni zəka dəstəkli, ödənişsiz limitsiz premium tətbiqimiz ilə dərhal başla və fiziki vəziyyətini yeni zirvəyə qaldır.",
    startFreeNow: "Ödənişsiz İndi Başla",
    allRightsReserved: "DəmirPlan Pro © 2026. Bütün hüquqlar qorunur. Platformamız sağlamlığınızı fərdiləşdirir.",

    // Platform Specific Azerbaijani Strings
    slogan: "Sən qur, Aİ kömək etsin",
    latestWeight: "Son Çəki",
    differentVisual: "Fərqli Görünüş:",
    streakLabel: "Gündəlik Ardıcıllıq",
    dayLabel: "Gün",
    premiumVerified: "Premium Təsdiqli",
    weeklyVolumeTitle: "HƏFTƏLİK MƏŞQ HƏCMİ",
    totalSets: "Toplam Set",
    totalExercises: "Toplam Hərəkət",
    noWorkoutPlanned: "Bu gün üçün məşq planlaşdırılmayıb. Yeni proqram yaratmaq üçün Proqram bölməsinə keçin.",
    waterReminderTitle: "SUTUTUMU & SU XATIRLADICI",
    waterTarget: "Hədəf",
    waterDrank: "İçilən",
    addWater: "Su Əlavə Et",
    soundscapesTitle: "FOKUS MƏŞQ SƏS SFERALARI (AUDIO FON)",
    soundscapesSubtitle: "Məşqdə diqqəti 100% artırmaq üçün səs mühitini tənzimləyin:",
    volumeLabel: "Səs Səviyyəsi",
    workoutProgramTab: "Məşq Proqramı",
    nutritionTab: "Qidalanma",
    aiHubTab: "Çallenclər & PR",
    progressTabName: "Tərəqqi & Ölçülər",
    musicTab: "Fokus Səslər",
    guideTab: "Hərəkət Təlimatı",
    historyTab: "Tarixçə",
    settingsTab: "Tənzimləmələr",
    paymentsTabName: "Ödənişlərim"
  },
  en: {
    // Header & Nav
    features: "Features",
    appPreview: "App Preview",
    calculator: "Calorie Calculator",
    pricing: "Pricing",
    faq: "FAQ",
    login: "Log In",
    register: "Register",
    startWorkout: "Start Workout",
    backToPlatform: "Return to Platform",
    landingPage: "Product Site",
    logout: "Log Out",
    adminPanel: "Admin Panel",

    // Hero Section
    aiPoweredTitle: "AI-Powered Intelligent Fitness Platform",
    heroTitlePart1: "BODY LIKE IRON,",
    heroTitlePart2: "POWERED BY AI",
    heroTitlePart3: "COACHING.",
    heroSubtitle: "DemirPlan Pro is a fully personalized workout scheduling, smart nutritional tracking, and 24/7 audio-enabled AI personal coach tailored to your unique body metrics.",
    startWorkoutsBtn: "Start Training",
    exploreFeaturesBtn: "Explore Features",

    // Hero Stats
    activeAthletes: "Active Athletes",
    aiCoachSupport: "AI Coach Support",
    createdPlans: "Plans Generated",
    freeForever: "Unlimited & Free",

    // Features Section
    whyDemirPlan: "Why DemirPlan Pro?",
    featuresTitle: "ADVANCED METHODS & AI TECHNOLOGY",
    featuresSubtitle: "The core strengths of our intelligent assistant platform helping you at every step:",
    
    feat1Title: "Personalized Workout Programs",
    feat1Desc: "Custom plans based on your height, weight, athletic goals, and experience. Keep full track of sets, repetitions, and weekly volume progression instantly.",
    feat1Bullet1: "Log daily training sessions easily",
    feat1Bullet2: "AI-generated execution tips for each exercise",

    feat2Title: "Google Gemini AI Hub",
    feat2Desc: "An intelligent fitness coach answering your questions via text and voice. Ask anything about training and nutrition, and listen to real-time audio analysis.",
    feat2Bullet1: "Real-time voice feedback & training audio",
    feat2Bullet2: "Photo-based body fat percentage evaluation",

    feat3Title: "Smart Nutrition & Calories",
    feat3Desc: "Tailored daily target calories, protein, carbs, and fats mapped to your targets (weight loss, maintenance, or muscle gain).",
    feat3Bullet1: "Dynamic TDEE adjusted for physical activity",
    feat3Bullet2: "Water log tracker & hydration reminder",

    feat4Title: "Comprehensive Progress & Leaderboards",
    feat4Desc: "Log body dimensions (biceps, chest, waist, thighs) and trace bodyweight trends. Climb the national leaderboard based on training streaks!",
    
    feat5Title: "Focus Workout Soundscapes (Audio)",
    feat5Desc: "Achieve 100% focus during training sessions with binaural beats, deep synthwave waves, and pulse-adaptive focus sounds designed to stimulate concentration.",

    // App Preview Section
    previewTitle: "MODERN & DYNAMIC INTERFACE",
    previewSubtitle: "Focus entirely on your training with our rapid, distraction-free premium dark interface.",
    athleteBadge: "DemirPlan Pro Athlete",
    weeklyWorkoutDays: "Weekly Workout Schedule",
    daysText: ["Day 1", "Day 2", "Day 3", "Rest Day"],
    workoutMockTitle: "🏋️‍♂️ Chest & Triceps",
    workoutMockSize: "6 Exercises",
    workoutMockEx1: "1. Incline Bench Press",
    workoutMockEx2: "2. Dumbbell Fly",
    workoutMockExSets1: "4 sets x 10 reps",
    workoutMockExSets2: "3 sets x 12 reps",
    motivationMockQuote: '"Follow the schedule consistently for a flawless aesthetic body!"',
    aiHubTitle: "DEMIRPLAN AI HUB (COACH)",
    aiMessageMock1: "I have prepared your personalized training program and nutritional metrics. Today we have chest & triceps. Would you like to adjust any exercise or ask about warm-ups?",
    userMessageMock1: "Thanks! I feel a slight pain in my shoulder during Bench Press, what exercises can I substitute?",
    aiMessageMock2: "To reduce shoulder load, we can temporarily substitute standard Bench Press with Dumbbell Floor Press or an Incline Dumbbell Press (at 30 degrees). This reduces joint strain.",
    targetCalorie: "Target Calories",
    protein: "Protein",
    workoutConsistency: "Workout Consistency",

    // Calorie Calculator Section
    calcTool: "Smart Tool",
    calcTitle: "INSTANT CALORIE & MACRO CALCULATOR",
    calcSubtitle: "Fill in the parameters below to compute your personalized daily calorie and macro-nutrient targets immediately!",
    gender: "Gender",
    male: "Male",
    female: "Female",
    goal: "Goal",
    goalLoss: "Weight Loss (Cutting)",
    goalMaintain: "Weight Maintenance",
    goalGain: "Muscle Gain (Bulking)",
    weight: "Weight (kg)",
    height: "Height (cm)",
    age: "Age",
    activityLevel: "Activity Level",
    act1: "Sedentary (Desk job, little exercise)",
    act2: "Lightly Active (Sports 1-3 days/week)",
    act3: "Moderately Active (Sports 3-5 days/week)",
    act4: "Highly Active (Heavy training 6-7 days/week)",
    btnCalculate: "Calculate Needs",
    dailyTargetIntake: "TARGET DAILY INTAKE",
    proteinLabel: "Protein",
    carbsLabel: "Carbohydrates",
    fatsLabel: "Fats",
    aiPlanLabel: "Generate AI meal plan using these macros",
    calcReadyTitle: "Calculator Ready",
    calcReadyDesc: "Input your stats and click 'Calculate Needs' to inspect your personalized nutritional overview instantly.",

    // Transformations
    transformationsTitle: "SUCCESS STORIES THAT INSPIRE",
    transformationsSubtitle: "Real athletes achieving incredible physical milestones with DemirPlan Pro and AI analytics:",
    t1Diff: "-14 kg",
    t1Quote: '"I used to feel lost in the gym. DemirPlan Pro scheduled my sessions set-by-set, rep-by-rep. My favorite feature is the AI Assistant. It answers my fitness queries so quickly, it feels like having a personal coach by my side!"',
    t1User: "Elnur Rzayev",
    t1UserSub: "Baku, age 28 (Engineer)",
    t2Diff: "+8 kg Muscle",
    t2Quote: '"Gaining weight was extremely difficult for me, but with the high-calorie nutritional program and workout plans, I put on 8 kg of clean muscle. Logging my workouts kept me highly motivated."',
    t2User: "Leyla Nasirli",
    t2UserSub: "Sumqayit, age 24 (Student)",

    // Pricing Section
    pricingTitle: "ACCESSIBLE FITNESS FOR EVERYONE",
    pricingSubtitle: "No hidden charges. Unrestricted premium features are fully open to all registered athletes.",
    sponsorFree: "Sponsored / Free",
    unlimitedPremium: "Unlimited Premium",
    sponsorPartnership: "Completely free via Leo Bank & m10 partnership",
    lifetimeFree: "/ lifetime unlimited",
    pricingBenefits: [
      "Daily Personalized Workout Generation",
      "Google Gemini AI Hub (Unlimited Chats)",
      "Real-time Audio AI Coach Feedback",
      "Aesthetic Photo-based Body Fat Analysis",
      "Smart Nutrition, Calorie & Macro Planning",
      "Smart Water Reminder & Hydration Logs",
      "Focus Music & Synthwave Soundscapes",
      "Body Dimensions & Weight Tracking Charts",
      "National Athletes Leaderboard"
    ],
    createAccountBtn: "Create Account Now",

    // FAQ Section
    faqTitle: "FREQUENTLY ASKED QUESTIONS",
    faqSubtitle: "Find rapid answers to the most common queries about our system:",
    faqsList: [
      {
        q: "Is DemirPlan Pro completely free?",
        a: "Yes! Currently, all premium features (AI Coach Hub, unlimited workout creation, nutrition tracking, and body composition analytics) are 100% free. Supported by our payment and fintech partners, you do not need any subscription."
      },
      {
        q: "How does the AI Coach work?",
        a: "Our AI Hub runs on state-of-the-art Google Gemini models. It uses your height, weight, fitness experience, and history to guide you 24/7. It can analyze your photos to detect body fat, or talk back to you in real-time audio."
      },
      {
        q: "Can I customize the generated workouts?",
        a: "Absolutely! You can easily edit any exercise recommended by the AI, add new moves, modify set count, or change target reps. We support both full automation and precise manual configuration."
      },
      {
        q: "How accurate is the body fat calculator?",
        a: "We support both the US Navy mathematical equation and advanced AI visual estimation. Combining both inputs yields highly reliable, immediate results for your tracking logs."
      }
    ],

    // CTA & Footer
    ctaTitle: "REDISCOVER YOUR PHYSICAL LIMITS",
    ctaSubtitle: "Leverage AI intelligence combined with professional sports science. Build your dream body completely free.",
    startFreeNow: "Get Started Free",
    allRightsReserved: "DemirPlan Pro © 2026. All rights reserved. Empowering your fitness journey through AI.",

    // Platform Specific English Strings
    slogan: "You build, AI assists",
    latestWeight: "Latest Weight",
    differentVisual: "App Theme:",
    streakLabel: "Streak Days",
    dayLabel: "Day",
    premiumVerified: "Premium Active",
    weeklyVolumeTitle: "WEEKLY WORKOUT VOLUME",
    totalSets: "Total Sets",
    totalExercises: "Total Exercises",
    noWorkoutPlanned: "No workouts scheduled for today. Jump to the Program tab to generate a custom routine.",
    waterReminderTitle: "HYDRATION & WATER LOGS",
    waterTarget: "Goal",
    waterDrank: "Drank",
    addWater: "Add Water",
    soundscapesTitle: "FOCUS TRAINING SOUNDSCAPES (AUDIO FON)",
    soundscapesSubtitle: "Boost your gym focus to 100% with premium auditory atmosphere:",
    volumeLabel: "Volume Level",
    workoutProgramTab: "Workout Plan",
    nutritionTab: "Nutrition",
    aiHubTab: "Challenges & PR",
    progressTabName: "Progress & Metrics",
    musicTab: "Focus Music",
    guideTab: "Exercise Guide",
    historyTab: "Logs History",
    settingsTab: "Settings",
    paymentsTabName: "My Payments"
  },
  ru: {
    // Header & Nav
    features: "Преимущества",
    appPreview: "Интерфейс",
    calculator: "Калькулятор Калорий",
    pricing: "Тарифы",
    faq: "Вопросы",
    login: "Войти",
    register: "Регистрация",
    startWorkout: "Начать тренировку",
    backToPlatform: "Вернуться на платформу",
    landingPage: "Промо Сайт",
    logout: "Выйти",
    adminPanel: "Админ Панель",

    // Hero Section
    aiPoweredTitle: "Интеллектуальная фитнес-платформа на базе искусственного интеллекта",
    heroTitlePart1: "СТАЛЬНОЕ ТЕЛО,",
    heroTitlePart2: "С ПОМОЩЬЮ ИИ",
    heroTitlePart3: "ТРЕНЕРА.",
    heroSubtitle: "DemirPlan Pro — это полностью персонализированные программы тренировок, умный учет питания и личный ИИ-тренер с поддержкой голосового общения 24/7.",
    startWorkoutsBtn: "Начать Тренировки",
    exploreFeaturesBtn: "Узнать Больше",

    // Hero Stats
    activeAthletes: "Активных Атлетов",
    aiCoachSupport: "ИИ-Поддержка 24/7",
    createdPlans: "Планов Создано",
    freeForever: "Безлимитно и Бесплатно",

    // Features Section
    whyDemirPlan: "Почему DemirPlan Pro?",
    featuresTitle: "СОВРЕМЕННЫЕ МЕТОДИКИ И ТЕХНОЛОГИИ ИИ",
    featuresSubtitle: "Ключевые преимущества нашей интеллектуальной платформы, помогающие вам на каждом шагу:",
    
    feat1Title: "Персональные Тренировки",
    feat1Desc: "Индивидуальные планы, основанные на вашем росте, весе, спортивных целях и опыте. Полный автоматический учет сетов, повторений и недельного объема тренировок.",
    feat1Bullet1: "Удобная фиксация ежедневного прогресса",
    feat1Bullet2: "Подробные технические советы ИИ к каждому упражнению",

    feat2Title: "ИИ-Центр Google Gemini",
    feat2Desc: "Интеллектуальный помощник, отвечающий на любые вопросы текстом и голосом. Спросите всё о тренировках и питании и слушайте ответ в режиме реального времени.",
    feat2Bullet1: "Голосовое общение и аудио-советы в реальном времени",
    feat2Bullet2: "Определение процента жира по фотографии",

    feat3Title: "Умное Питание и Калории",
    feat3Desc: "Точный расчет ежедневных калорий, белков, углеводов и жиров в соответствии с вашей целью (похудение, удержание веса или набор мышечной массы).",
    feat3Bullet1: "Динамический расчет TDEE с учетом активности",
    feat3Bullet2: "Трекер воды и умные напоминания",

    feat4Title: "Всесторонний Прогресс и Лидеры",
    feat4Desc: "Записывайте объемы тела (бицепсы, грудь, талия, бедра) и следите за изменениями веса. Участвуйте в национальном зачете по непрерывности тренировок!",
    
    feat5Title: "Фокусные Звуковые Сферы (Аудио)",
    feat5Desc: "Обеспечьте 100% концентрацию во время тренировок благодаря бинауральным ритмам, глубокому синтвейву и звуковым ландшафтам под ваш пульс.",

    // App Preview Section
    previewTitle: "СОВРЕМЕННЫЙ И ДИНАМИЧНЫЙ ИНТЕРФЕЙС",
    previewSubtitle: "Сконцентрируйтесь на тренировке с быстрым и лаконичным темным премиум-интерфейсом без лишних деталей.",
    athleteBadge: "Атлет DemirPlan Pro",
    weeklyWorkoutDays: "Еженедельный График",
    daysText: ["День 1", "День 2", "День 3", "Отдых"],
    workoutMockTitle: "🏋️‍♂️ Грудь и Трицепс",
    workoutMockSize: "6 Упражнений",
    workoutMockEx1: "1. Жим штанги на наклонной",
    workoutMockEx2: "2. Разведение гантелей",
    workoutMockExSets1: "4 сета x 10 повт.",
    workoutMockExSets2: "3 сета x 12 повт.",
    motivationMockQuote: '"Регулярно следуйте программе для идеального стального тела!"',
    aiHubTitle: "ИИ-ЦЕНТР DEMIRPLAN (ТРЕНЕР)",
    aiMessageMock1: "Я подготовил твою персональную программу тренировок и показатели питания. Сегодня у нас грудь и трицепс. Хочешь изменить упражнение или узнать о разминке?",
    userMessageMock1: "Спасибо! При жиме штанги немного болит плечо, чем можно заменить упражнение?",
    aiMessageMock2: "Чтобы снизить нагрузку на плечевой сустав, мы можем временно заменить жим штанги на жим гантелей с пола или жим гантелей на наклонной скамье (30 градусов). Это уберет дискомфорт.",
    targetCalorie: "Целевые Калории",
    protein: "Белки",
    workoutConsistency: "Посещаемость",

    // Calorie Calculator Section
    calcTool: "Умный Инструмент",
    calcTitle: "МОМЕНТАЛЬНЫЙ КАЛЬКУЛЯТОР КАЛОРИЙ И МАКРОСОВ",
    calcSubtitle: "Заполните форму ниже, чтобы мгновенно рассчитать суточную потребность в калориях и БЖУ!",
    gender: "Пол",
    male: "Мужской",
    female: "Женский",
    goal: "Цель",
    goalLoss: "Снижение Веса (Сушка)",
    goalMaintain: "Поддержание Текущего Веса",
    goalGain: "Набор Массы (Мышцы)",
    weight: "Вес (кг)",
    height: "Рост (см)",
    age: "Возраст",
    activityLevel: "Уровень Активности",
    act1: "Малоподвижный (Сидячая работа, без спорта)",
    act2: "Легкая активность (Спорт 1-3 дня в неделю)",
    act3: "Умеренная активность (Спорт 3-5 дней в неделю)",
    act4: "Высокая активность (Тяжелый спорт 6-7 дней в неделю)",
    btnCalculate: "Рассчитать параметры",
    dailyTargetIntake: "ЦЕЛЕВОЙ СУТОЧНЫЙ РАЦИОН",
    proteinLabel: "Белки (Протеин)",
    carbsLabel: "Углеводы",
    fatsLabel: "Жиры",
    aiPlanLabel: "Создать ИИ-план питания по этим макросам",
    calcReadyTitle: "Калькулятор Готов",
    calcReadyDesc: "Введите свои показатели и нажмите 'Рассчитать параметры', чтобы мгновенно просмотреть индивидуальные результаты.",

    // Transformations
    transformationsTitle: "РЕАЛЬНЫЕ ИСТОРИИ УСПЕХА",
    transformationsSubtitle: "Настоящие атлеты, достигшие невероятных физических результатов благодаря DemirPlan Pro и ИИ:",
    t1Diff: "-14 кг",
    t1Quote: '"Раньше в зале я терялся. DemirPlan Pro расписал мне тренировки сет за сетом, повторение за повторением. А мой фаворит — ИИ-ассистент. Отвечает мгновенно, будто рядом стоит профессиональный тренер!"',
    t1User: "Эльнур Рзаев",
    t1UserSub: "Баку, 28 лет (Инженер)",
    t2Diff: "+8 кг Мышц",
    t2Quote: '"Набрать вес для меня всегда было проблемой, но благодаря калорийному меню и тренировкам от платформы я набрал 8 кг чистых мышц. Постоянный учет тренировок давал мощную мотивацию."',
    t2User: "Лейла Насирли",
    t2UserSub: "Сумгаит, 24 года (Студент)",

    // Pricing Section
    pricingTitle: "ДОСТУПНЫЙ ФИТНЕС ДЛЯ КАЖДОГО",
    pricingSubtitle: "Никаких скрытых платежей. Безлимитные премиум-функции полностью открыты для всех зарегистрированных атлетов.",
    sponsorFree: "Спонсируется / Бесплатно",
    unlimitedPremium: "Безлимитный Премиум",
    sponsorPartnership: "Полностью бесплатно благодаря поддержке Leo Bank и m10",
    lifetimeFree: "/ пожизненный безлимит",
    pricingBenefits: [
      "Ежедневная Персональная Программа",
      "ИИ-Центр Google Gemini (Безлимитный чат)",
      "Голосовой ИИ-Тренер в реальном времени",
      "Анализ Процента Жира по Фотографии",
      "Умное Планирование Питания и БЖУ",
      "Умные Напоминания и Лог Питьевой Воды",
      "Фокусные Звуковые Ландшафты (Аудио)",
      "Графики Изменения Веса и Объемов Тела",
      "Национальный Зачет и Лидерборд"
    ],
    createAccountBtn: "Создать Аккаунт Сейчас",

    // FAQ Section
    faqTitle: "ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ",
    faqSubtitle: "Ответы на все интересующие вас вопросы о нашей фитнес-платформе:",
    faqsList: [
      {
        q: "DemirPlan Pro действительно бесплатен?",
        a: "Да! В настоящее время все премиум-функции (ИИ-Центр, неограниченные программы, трекер питания и анализ процента жира) на 100% бесплатны. Благодаря поддержке наших финтех-партнеров подписка не требуется."
      },
      {
        q: "Как работает ИИ-Тренер?",
        a: "Наш ИИ-центр работает на базе передовых моделей Google Gemini. Он использует ваш рост, вес, опыт и историю активности, чтобы направлять вас 24/7. Он может общаться голосом или оценивать форму по фото."
      },
      {
        q: "Могу ли я настраивать тренировки под себя?",
        a: "Конечно! Вы можете легко отредактировать любое упражнение, рекомендованное ИИ, добавить новые движения, изменить количество подходов или повторений. Поддерживается как автогенерация, так и ручная настройка."
      },
      {
        q: "Насколько точен калькулятор жира?",
        a: "Мы предлагаем два метода: математический расчет по стандартам ВМС США и визуальное определение через ИИ. Объединение обоих методов дает очень надежный результат для отслеживания прогресса."
      }
    ],

    // CTA & Footer
    ctaTitle: "ОТКРОЙТЕ СВОЕ ТЕЛО ЗАНОВО",
    ctaSubtitle: "Используйте искусственный интеллект в синергии со спортивной наукой. Создайте тело мечты абсолютно бесплатно.",
    startFreeNow: "Начать Бесплатно",
    allRightsReserved: "DemirPlan Pro © 2026. Все права защищены. Интеллектуальное управление вашей физической формой.",

    // Platform Specific Russian Strings
    slogan: "Вы строите, ИИ помогает",
    latestWeight: "Последний Вес",
    differentVisual: "Тема:",
    streakLabel: "Серия тренировок",
    dayLabel: "День",
    premiumVerified: "Премиум Активен",
    weeklyVolumeTitle: "ОБЪЕМ ТРЕНИРОВОК ЗА НЕДЕЛЮ",
    totalSets: "Всего Сетов",
    totalExercises: "Всего Упражнений",
    noWorkoutPlanned: "На сегодня тренировок не запланировано. Перейдите во вкладку Программа, чтобы создать тренировку.",
    waterReminderTitle: "ГИДРАТАЦИЯ И ТРЕКЕР ВОДЫ",
    waterTarget: "Цель",
    waterDrank: "Выпито",
    addWater: "Добавить Воду",
    soundscapesTitle: "ФОКУСНЫЕ ЗВУКОВЫЕ ЛАНДШАФТЫ (АУДИО)",
    soundscapesSubtitle: "Повысьте концентрацию на тренировках с помощью профессионального звукового окружения:",
    volumeLabel: "Громкость",
    workoutProgramTab: "Программа",
    nutritionTab: "Питания",
    aiHubTab: "Челленджи и PR",
    progressTabName: "Прогресс и Объемы",
    musicTab: "Фокус-Звуки",
    guideTab: "Инструкции",
    historyTab: "История",
    settingsTab: "Настройки",
    paymentsTabName: "Мои платежи"
  },
  de: {
    // Header & Nav
    features: "Vorteile",
    appPreview: "App-Vorschau",
    calculator: "Kalorienrechner",
    pricing: "Tarife",
    faq: "FAQ",
    login: "Einloggen",
    register: "Registrieren",
    startWorkout: "Training starten",
    backToPlatform: "Zurück zur Plattform",
    landingPage: "Produkt-Website",
    logout: "Abmelden",
    adminPanel: "Admin-Bereich",

    // Hero Section
    aiPoweredTitle: "KI-gestützte intelligente Fitnessplattform",
    heroTitlePart1: "KÖRPER WIE STAHL,",
    heroTitlePart2: "UNTERSTÜTZT DURCH KI",
    heroTitlePart3: "COACHING.",
    heroSubtitle: "DemirPlan Pro ist eine vollständig personalisierte Trainingsplanung, intelligente Ernährungsverfolgung und ein rund um die Uhr einsatzbereiter, sprachgesteuerter KI-Personal-Coach, der auf Ihre individuellen Körpermaße zugeschnitten ist.",
    startWorkoutsBtn: "Training starten",
    exploreFeaturesBtn: "Funktionen erkunden",

    // Hero Stats
    activeAthletes: "Aktive Athleten",
    aiCoachSupport: "KI-Coach Support",
    createdPlans: "Pläne erstellt",
    freeForever: "Unbegrenzt & Kostenlos",

    // Features Section
    whyDemirPlan: "Warum DemirPlan Pro?",
    featuresTitle: "FORTSCHRITTLICHE METHODEN & KI-TECHNOLOGIE",
    featuresSubtitle: "Die Kernstärken unserer intelligenten Assistenten-Plattform, die Sie bei jedem Schritt unterstützt:",
    
    feat1Title: "Personalisierte Trainingsprogramme",
    feat1Desc: "Individuelle Pläne basierend auf Ihrer Größe, Ihrem Gewicht, Ihren sportlichen Zielen und Ihrer Erfahrung. Verfolgen Sie Sätze, Wiederholungen und das wöchentliche Volumen sofort.",
    feat1Bullet1: "Tägliche Trainingseinheiten einfach protokollieren",
    feat1Bullet2: "KI-generierte Ausführungstipps für jede Übung",

    feat2Title: "Google Gemini KI Hub",
    feat2Desc: "Ein intelligenter Fitness-Coach, der Ihre Fragen per Text und Stimme beantwortet. Fragen Sie alles über Training und Ernährung und hören Sie sich Echtzeit-Audioanalysen an.",
    feat2Bullet1: "Echtzeit-Sprachfeedback & Trainings-Audio",
    feat2Bullet2: "Fotobasierte Bestimmung des Körperfettanteils",

    feat3Title: "Intelligente Ernährung & Kalorien",
    feat3Desc: "Maßgeschneiderte tägliche Zielkalorien, Proteine, Kohlenhydrate und Fette, angepasst an Ihre Ziele (Gewichtsverlust, Erhalt oder Muskelaufbau).",
    feat3Bullet1: "Dynamischer TDEE, angepasst an die körperliche Aktivität",
    feat3Bullet2: "Wasser-Tracker & Hydratations-Erinnerung",

    feat4Title: "Umfassender Fortschritt & Ranglisten",
    feat4Desc: "Körpermaße (Bizeps, Brust, Taille, Oberschenkel) protokollieren und Gewichtstrends verfolgen. Steigen Sie in der nationalen Rangliste basierend auf Trainings-Streaks auf!",
    
    feat5Title: "Fokus-Soundscapes (Audio)",
    feat5Desc: "Erreichen Sie 100 % Fokus während des Trainings mit binauralen Beats, tiefen Synthwave-Wellen und pulsadaptiven Fokus-Sounds zur Konzentrationssteigerung.",

    // App Preview Section
    previewTitle: "MODERNES & DYNAMISCHES INTERFACE",
    previewSubtitle: "Konzentrieren Sie sich voll und ganz auf Ihr Training mit unserer schnellen, ablenkungsfreien Premium-Dunkel-Schnittstelle.",
    athleteBadge: "DemirPlan Pro Athlet",
    weeklyWorkoutDays: "Wöchentlicher Trainingsplan",
    daysText: ["Tag 1", "Tag 2", "Tag 3", "Ruhetag"],
    workoutMockTitle: "🏋️‍♂️ Brust & Trizeps",
    workoutMockSize: "6 Übungen",
    workoutMockEx1: "1. Schrägbankdrücken",
    workoutMockEx2: "2. Kurzhantel-Fly",
    workoutMockExSets1: "4 Sätze x 10 Wdh.",
    workoutMockExSets2: "3 Sätze x 12 Wdh.",
    motivationMockQuote: '"Folge dem Plan konsequent für einen makellosen athletischen Körper!"',
    aiHubTitle: "DEMIRPLAN KI HUB (COACH)",
    aiMessageMock1: "Ich habe Ihr personalisiertes Trainingsprogramm und Ihre Ernährungsdaten vorbereitet. Heute steht Brust & Trizeps an. Möchten Sie eine Übung anpassen oder nach dem Aufwärmen fragen?",
    userMessageMock1: "Danke! Ich spüre beim Bankdrücken leichte Schmerzen in der Schulter. Welche Übungen kann ich als Ersatz machen?",
    aiMessageMock2: "Um die Schulterbelastung zu reduzieren, können wir das Standard-Bankdrücken vorübergehend durch Kurzhantel-Bodendrücken oder Kurzhantel-Schrägbankdrücken (bei 30 Grad) ersetzen. Dies verringert die Gelenkbelastung.",
    targetCalorie: "Zielkalorien",
    protein: "Protein",
    workoutConsistency: "Trainingskonsistenz",

    // Calorie Calculator Section
    calcTool: "Intelligentes Tool",
    calcTitle: "SOFORTIGER KALORIEN- & MAKRORECHNER",
    calcSubtitle: "Füllen Sie die Parameter unten aus, um Ihre personalisierten täglichen Kalorien- und Makronährstoffziele sofort zu berechnen!",
    gender: "Geschlecht",
    male: "Männlich",
    female: "Weiblich",
    goal: "Ziel",
    goalLoss: "Gewichtsverlust (Definition)",
    goalMaintain: "Gewicht halten",
    goalGain: "Muskelaufbau (Massephase)",
    weight: "Gewicht (kg)",
    height: "Größe (cm)",
    age: "Alter",
    activityLevel: "Aktivitätslevel",
    act1: "Sitzend (Bürojob, wenig Bewegung)",
    act2: "Leicht aktiv (Sport 1-3 Tage/Woche)",
    act3: "Mäßig aktiv (Sport 3-5 Tage/Woche)",
    act4: "Sehr aktiv (Schweres Training 6-7 Tage/Woche)",
    btnCalculate: "Bedarf berechnen",
    dailyTargetIntake: "TÄGLICHE ZIELAUFNAHME",
    proteinLabel: "Protein",
    carbsLabel: "Kohlenhydrate",
    fatsLabel: "Fette",
    aiPlanLabel: "KI-Ernährungsplan mit diesen Makros generieren",
    calcReadyTitle: "Rechner bereit",
    calcReadyDesc: "Geben Sie Ihre Daten ein und klicken Sie auf 'Bedarf berechnen', um Ihre personalisierte Ernährungsübersicht sofort anzuzeigen.",

    // Transformations
    transformationsTitle: "ERFOLGSGESCHICHTEN, DIE INSPIRIEREN",
    transformationsSubtitle: "Echte Athleten, die mit DemirPlan Pro und KI-Analysen unglaubliche körperliche Meilensteine erreicht haben:",
    t1Diff: "-14 kg",
    t1Quote: '"Früher fühlte ich mich im Fitnessstudio verloren. DemirPlan Pro hat meine Trainingseinheiten Satz für Satz und Wiederholung für Wiederholung geplant. Meine Lieblingsfunktion ist der KI-Assistent. Er beantwortet meine Fitnessfragen so schnell, es ist, als hätte ich einen persönlichen Trainer an meiner Seite!"',
    t1User: "Elnur Rzayev",
    t1UserSub: "Baku, 28 Jahre (Ingenieur)",
    t2Diff: "+8 kg Muskeln",
    t2Quote: '"Zuzunehmen war für mich extrem schwierig, aber mit dem kalorienreichen Ernährungsprogramm und den Trainingsplänen habe ich 8 kg saubere Muskelmasse aufgebaut. Das Protokollieren meiner Workouts hielt mich hoch motiviert."',
    t2User: "Leyla Nasirli",
    t2UserSub: "Sumqayit, 24 Jahre (Studentin)",

    // Pricing Section
    pricingTitle: "BARRIEREFREIE FITNESS FÜR JEDEN",
    pricingSubtitle: "Keine versteckten Kosten. Unbegrenzte Premium-Funktionen stehen allen registrierten Athleten vollständig offen.",
    sponsorFree: "Gesponsert / Kostenlos",
    unlimitedPremium: "Unbegrenztes Premium",
    sponsorPartnership: "Völlig kostenlos durch die Partnerschaft mit Leo Bank & m10",
    lifetimeFree: "/ lebenslang unbegrenzt",
    pricingBenefits: [
      "Tägliche personalisierte Trainingsgenerierung",
      "Google Gemini KI-Hub (Unbegrenzte Chats)",
      "Echtzeit-Audio-KI-Coach Feedback",
      "Ästhetische fotobasierte Körperfettanalyse",
      "Intelligente Ernährungs-, Kalorien- & Makroplanung",
      "Intelligente Erinnerung & Trinkwasserprotokolle",
      "Fokusmusik & Synthwave-Soundscapes",
      "Körpermaße & Gewichtsverlauf-Diagramme",
      "Nationale Athleten-Rangliste"
    ],
    createAccountBtn: "Jetzt Account erstellen",

    // FAQ Section
    faqTitle: "HÄUFIG GESTELLTE FRAGEN",
    faqSubtitle: "Finden Sie schnelle Antworten auf die häufigsten Fragen zu unserem System:",
    faqsList: [
      {
        q: "Ist DemirPlan Pro komplett kostenlos?",
        a: "Ja! Derzeit sind alle Premium-Funktionen (KI-Coach, unbegrenzte Trainingserstellung, Ernährungsverfolgung und Körperfettanalyse) zu 100 % kostenlos. Unterstützt von unseren Partnern benötigen Sie kein Abonnement."
      },
      {
        q: "Wie funktioniert der KI-Coach?",
        a: "Unser KI-Hub basiert auf modernsten Google Gemini-Modellen. Er nutzt Ihre Größe, Ihr Gewicht, Ihre Fitnesserfahrung und Ihren Verlauf, um Sie rund um die Uhr zu unterstützen. Er kann Fotos analysieren oder per Echtzeit-Audio antworten."
      },
      {
        q: "Kann ich die generierten Workouts anpassen?",
        a: "Absolut! Sie können jede vom KI-System empfohlene Übung ganz einfach bearbeiten, neue Übungen hinzufügen, Sätze oder Zielwiederholungen ändern. Wir unterstützen sowohl Automatisierung als auch manuelle Konfiguration."
      },
      {
        q: "Wie genau ist der Körperfettrechner?",
        a: "Wir unterstützen sowohl die mathematische Formel der US Navy als auch die fortschrittliche visuelle KI-Schätzung. Die Kombination beider Methoden liefert sehr zuverlässige Ergebnisse für Ihr Protokoll."
      }
    ],

    // CTA & Footer
    ctaTitle: "ENTDECKE DEINE KÖRPERLICHEN GRENZEN NEU",
    ctaSubtitle: "Nutzen Sie KI-Intelligenz in Kombination mit professioneller Sportwissenschaft. Bauen Sie Ihren Traumkörper völlig kostenlos auf.",
    startFreeNow: "Kostenlos starten",
    allRightsReserved: "DemirPlan Pro © 2026. Alle Rechte vorbehalten. Optimieren Sie Ihre Fitnessreise durch KI.",

    // Platform Specific German Strings
    slogan: "Du trainierst, KI hilft dir",
    latestWeight: "Letztes Gewicht",
    differentVisual: "App-Design:",
    streakLabel: "Streak-Tage",
    dayLabel: "Tag",
    premiumVerified: "Premium Aktiv",
    weeklyVolumeTitle: "WÖCHENTLICHES TRAININGVOLUMEN",
    totalSets: "Sätze Gesamt",
    totalExercises: "Übungen Gesamt",
    noWorkoutPlanned: "Heute ist kein Training geplant. Gehe zum Reiter 'Programm', um ein neues Training zu erstellen.",
    waterReminderTitle: "HYDRATION & WASSER-LOGS",
    waterTarget: "Ziel",
    waterDrank: "Getrunken",
    addWater: "Wasser hinzufügen",
    soundscapesTitle: "FOKUS-TRAININGS-SOUNDSCAPES (AUDIO-FON)",
    soundscapesSubtitle: "Steigern Sie Ihren Fokus im Fitnessstudio auf 100 % mit erstklassiger Sound-Atmosphäre:",
    volumeLabel: "Lautstärke",
    workoutProgramTab: "Trainingsplan",
    nutritionTab: "Ernährung",
    aiHubTab: "Herausforderungen & PR",
    progressTabName: "Fortschritt & Maße",
    musicTab: "Fokus-Musik",
    guideTab: "Übungsanleitung",
    historyTab: "Verlauf",
    settingsTab: "Einstellungen",
    paymentsTabName: "Meine Zahlungen"
  }
};
