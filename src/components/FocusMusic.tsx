import React, { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, Volume2, VolumeX, Disc, Radio, Sparkles, SkipForward, SkipBack } from "lucide-react";

interface Track {
  name: string;
  description: string;
  url: string;
  fallbackUrl?: string;
  isSynth: boolean;
  type: string;
}

const TRACKS_LANG = {
  az: [
    {
      name: "🕺 Michael Jackson - Billie Jean",
      description: "Klassik pop ritmi ilə motivasiyanı yüksəldin",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/michaeljacksonbilliejean/Michael%20Jackson%20-%20Billie%20Jean.mp3")}`,
      isSynth: false,
      type: "Pop / Ritm",
    },
    {
      name: "🔥 Michael Jackson - Beat It",
      description: "Güclü rok gitara rifləri ilə məşqin tempini artırın",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/michaeljacksonbeatit_201910/Michael%20Jackson%20-%20Beat%20It.mp3")}`,
      isSynth: false,
      type: "Pop Rock / Güc",
    },
    {
      name: "✨ The Weeknd - Blinding Lights",
      description: "Yüksək templi 80-lər sinth-pop enerjisi",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/the-weeknd-blinding-lights-audio/The%20Weeknd%20-%20Blinding%20Lights%20%28Audio%29.mp3")}`,
      isSynth: false,
      type: "Synth-Pop",
    },
    {
      name: "⚡ The Weeknd - Starboy (ft. Daft Punk)",
      description: "Fokuslanmanı artıran ritmik elektron bas xətləri",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/theweekndstarboyftdaftpunk/The%20Weeknd%20-%20Starboy%20ft.%20Daft%20Punk.mp3")}`,
      isSynth: false,
      type: "R&B / Elektron",
    },
    {
      name: "🤖 Aİ Ambient Dalğaları",
      description: "Konsentrasiya üçün sintez olunmuş sakitləşdirici binaural dalğalar",
      url: "",
      isSynth: true,
      type: "Audio Sintez",
    },
  ],
  en: [
    {
      name: "🕺 Michael Jackson - Billie Jean",
      description: "Elevate your motivation with this classic pop rhythm",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/michaeljacksonbilliejean/Michael%20Jackson%20-%20Billie%20Jean.mp3")}`,
      isSynth: false,
      type: "Pop / Rhythm",
    },
    {
      name: "🔥 Michael Jackson - Beat It",
      description: "Increase your workout pace with powerful rock guitar riffs",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/michaeljacksonbeatit_201910/Michael%20Jackson%20-%20Beat%20It.mp3")}`,
      isSynth: false,
      type: "Pop Rock / Power",
    },
    {
      name: "✨ The Weeknd - Blinding Lights",
      description: "High-tempo 80s synth-pop energy",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/the-weeknd-blinding-lights-audio/The%20Weeknd%20-%20Blinding%20Lights%20%28Audio%29.mp3")}`,
      isSynth: false,
      type: "Synth-Pop",
    },
    {
      name: "⚡ The Weeknd - Starboy (ft. Daft Punk)",
      description: "Rhythmic electronic basslines to enhance focus",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/theweekndstarboyftdaftpunk/The%20Weeknd%20-%20Starboy%20ft.%20Daft%20Punk.mp3")}`,
      isSynth: false,
      type: "R&B / Electronic",
    },
    {
      name: "🤖 AI Ambient Waves",
      description: "Synthesized calming binaural waves for concentration",
      url: "",
      isSynth: true,
      type: "Audio Synth",
    },
  ],
  ru: [
    {
      name: "🕺 Michael Jackson - Billie Jean",
      description: "Повысьте мотивацию с помощью классического поп-ритма",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/michaeljacksonbilliejean/Michael%20Jackson%20-%20Billie%20Jean.mp3")}`,
      isSynth: false,
      type: "Поп / Ритм",
    },
    {
      name: "🔥 Michael Jackson - Beat It",
      description: "Увеличьте темп тренировки с помощью мощных рок-гитарных риффов",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/michaeljacksonbeatit_201910/Michael%20Jackson%20-%20Beat%20It.mp3")}`,
      isSynth: false,
      type: "Поп-рок / Энергия",
    },
    {
      name: "✨ The Weeknd - Blinding Lights",
      description: "Энергичный синти-поп в стиле 80-х с высоким темпом",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/the-weeknd-blinding-lights-audio/The%20Weeknd%20-%20Blinding%20Lights%20%28Audio%29.mp3")}`,
      isSynth: false,
      type: "Синти-Поп",
    },
    {
      name: "⚡ The Weeknd - Starboy (ft. Daft Punk)",
      description: "Ритмичные электронные басы для максимальной фокусировки",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/theweekndstarboyftdaftpunk/The%20Weeknd%20-%20Starboy%20ft.%20Daft%20Punk.mp3")}`,
      isSynth: false,
      type: "R&B / Электроника",
    },
    {
      name: "🤖 ИИ Амбиент Волны",
      description: "Синтезированные успокаивающие бинауральные волны для концентрации",
      url: "",
      isSynth: true,
      type: "Аудио Синтез",
    },
  ],
  de: [
    {
      name: "🕺 Michael Jackson - Billie Jean",
      description: "Steigern Sie Ihre Motivation mit diesem klassischen Pop-Rhythmus",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/michaeljacksonbilliejean/Michael%20Jackson%20-%20Billie%20Jean.mp3")}`,
      isSynth: false,
      type: "Pop / Rhythm",
    },
    {
      name: "🔥 Michael Jackson - Beat It",
      description: "Erhöhen Sie Ihr Trainingstempo mit kraftvollen Rockgitarren-Riffs",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/michaeljacksonbeatit_201910/Michael%20Jackson%20-%20Beat%20It.mp3")}`,
      isSynth: false,
      type: "Pop Rock / Power",
    },
    {
      name: "✨ The Weeknd - Blinding Lights",
      description: "Schnelle 80er Synth-Pop Energie",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/the-weeknd-blinding-lights-audio/The%20Weeknd%20-%20Blinding%20Lights%20%28Audio%29.mp3")}`,
      isSynth: false,
      type: "Synth-Pop",
    },
    {
      name: "⚡ The Weeknd - Starboy (ft. Daft Punk)",
      description: "Rhythmische elektronische Basslines für besseren Fokus",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      fallbackUrl: `/api/music/proxy?url=${encodeURIComponent("https://archive.org/download/theweekndstarboyftdaftpunk/The%20Weeknd%20-%20Starboy%20ft.%20Daft%20Punk.mp3")}`,
      isSynth: false,
      type: "R&B / Electronic",
    },
    {
      name: "🤖 KI Ambient Wellen",
      description: "Synthetisierte beruhigende binaurale Wellen für maximale Konzentration",
      url: "",
      isSynth: true,
      type: "Audio Synth",
    },
  ],
};

interface FocusMusicProps {
  lang?: string;
}

export default function FocusMusic({ lang = "az" }: FocusMusicProps) {
  const tDict = {
    az: {
      widgetTitle: "Focus Music • Diqqət Aralığı",
      widgetSub: "Məşq zamanı dopamin və konsentrasiyanı yüksəldin",
      backgroundIndicator: "FONDADIR",
      selectedBadge: "Seçildi",
      nowPlaying: "İndi səslənir",
      prevBtn: "Əvvəlki",
      nextBtn: "Növbəti",
      playBtn: "Oynat",
      pauseBtn: "Durdur",
      muteBtn: "Səsi bağla",
      unmuteBtn: "Səsi aç",
      infiniteText: "Sonsuz ♾️",
      activeText: "Aktiv",
    },
    en: {
      widgetTitle: "Focus Music • Range of Attention",
      widgetSub: "Elevate dopamine and concentration levels during training",
      backgroundIndicator: "PLAYING IN BG",
      selectedBadge: "Selected",
      nowPlaying: "Now Playing",
      prevBtn: "Previous",
      nextBtn: "Next",
      playBtn: "Play",
      pauseBtn: "Pause",
      muteBtn: "Mute",
      unmuteBtn: "Unmute",
      infiniteText: "Infinite ♾️",
      activeText: "Active",
    },
    ru: {
      widgetTitle: "Фокусная Музыка • Концентрация",
      widgetSub: "Повысьте уровень дофамина и фокуса во время тренировок",
      backgroundIndicator: "В ФОНЕ",
      selectedBadge: "Выбрано",
      nowPlaying: "Сейчас играет",
      prevBtn: "Предыдущий",
      nextBtn: "Следующий",
      playBtn: "Играть",
      pauseBtn: "Пауза",
      muteBtn: "Выключить звук",
      unmuteBtn: "Включить звук",
      infiniteText: "Бесконечно ♾️",
      activeText: "Активно",
    },
    de: {
      widgetTitle: "Focus Music • Aufmerksamkeit",
      widgetSub: "Erhöhen Sie Dopamin und Konzentration während des Trainings",
      backgroundIndicator: "LÄUFT IM HINTERGRUND",
      selectedBadge: "Ausgewählt",
      nowPlaying: "Aktueller Titel",
      prevBtn: "Zurück",
      nextBtn: "Weiter",
      playBtn: "Abspielen",
      pauseBtn: "Pause",
      muteBtn: "Stumm",
      unmuteBtn: "Laut",
      infiniteText: "Endlos ♾️",
      activeText: "Aktiv",
    },
  };

  const t = tDict[lang as "az" | "en" | "de" | "ru" || "az"] || tDict["en"];

  const TRACKS = TRACKS_LANG[lang as "az" | "en" | "de" | "ru" || "az"] || TRACKS_LANG["en"] || TRACKS_LANG.az;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState("0:00");
  const [durationFormatted, setDurationFormatted] = useState("0:00");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const timeoutRef = useRef<any>(null);

  // Web Audio Synthesis nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const modulatorRef = useRef<OscillatorNode | null>(null);
  const synthGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  const currentTrack = TRACKS[currentIdx];

  // Stop any playing audio or synthesis
  const stopAll = () => {
    // Clear any pending track switch timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Stop HTML5 Audio
    if (audioRef.current) {
      // Mute immediately to prevent unexpected sound bursts during the transition
      audioRef.current.muted = true;
      audioRef.current.volume = 0;

      if (playPromiseRef.current) {
        const promiseToPause = playPromiseRef.current;
        promiseToPause
          .then(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.muted = false;
              audioRef.current.volume = isMuted ? 0 : volume;
            }
          })
          .catch(() => {
            // Ignore errors since we want to stop playing anyway
          });
        playPromiseRef.current = null;
      } else {
        try {
          audioRef.current.pause();
          audioRef.current.muted = false;
          audioRef.current.volume = isMuted ? 0 : volume;
        } catch (e) {
          console.warn("Pause failed:", e);
        }
      }
    }
    // Stop Synthesizer
    try {
      if (osc1Ref.current) {
        osc1Ref.current.stop();
        osc1Ref.current.disconnect();
        osc1Ref.current = null;
      }
      if (osc2Ref.current) {
        osc2Ref.current.stop();
        osc2Ref.current.disconnect();
        osc2Ref.current = null;
      }
      if (modulatorRef.current) {
        modulatorRef.current.stop();
        modulatorRef.current.disconnect();
        modulatorRef.current = null;
      }
    } catch (e) {
      console.warn("Synth stop error:", e);
    }
  };

  // Start synthesis mode
  const startSynth = () => {
    try {
      stopAll();

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;

      // Ensure AudioContext is resumed (browser autoplay restrictions)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Main Gain to control volume
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume * 0.15, ctx.currentTime); // keep synth soft
      synthGainRef.current = masterGain;

      // Low pass filter for warm ambient sound
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filterRef.current = filter;

      // Binaural Beats Generation (Left: 110Hz, Right: 115Hz for a 5Hz Theta brainwave focus entrainment)
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(110, ctx.currentTime);
      osc1Ref.current = osc1;

      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(115, ctx.currentTime);
      osc2Ref.current = osc2;

      // Stereo panning
      const panL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const panR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      if (panL && panR) {
        panL.pan.setValueAtTime(-0.8, ctx.currentTime);
        panR.pan.setValueAtTime(0.8, ctx.currentTime);

        osc1.connect(panL);
        panL.connect(filter);

        osc2.connect(panR);
        panR.connect(filter);
      } else {
        osc1.connect(filter);
        osc2.connect(filter);
      }

      // Low frequency LFO modulator to give it an ocean wave pulse feel
      const modulator = ctx.createOscillator();
      modulator.type = "sine";
      modulator.frequency.setValueAtTime(0.2, ctx.currentTime); // 0.2 Hz cycle
      modulatorRef.current = modulator;

      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(0.04, ctx.currentTime);
      
      modulator.connect(modGain);
      modGain.connect(masterGain.gain);

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      modulator.start();

      setIsPlaying(true);
    } catch (err) {
      console.error("Synthesizer launch failed:", err);
    }
  };

  // Start HTML5 Audio mode
  const startAudio = (useFallback = false, trackIndex = currentIdx) => {
    stopAll();
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    const track = TRACKS[trackIndex];
    
    const trackUrl = useFallback && track.fallbackUrl ? track.fallbackUrl : track.url;
    
    audio.src = trackUrl;
    audio.loop = true;
    audio.muted = false;
    audio.volume = isMuted ? 0 : volume;
    
    const playPromise = audio.play();
    playPromiseRef.current = playPromise;
    
    playPromise
      .then(() => {
        if (playPromiseRef.current === playPromise) {
          setIsPlaying(true);
        }
      })
      .catch((err) => {
        const errName = err && typeof err === "object" && "name" in err ? String(err.name) : "";
        const errMessage = err && typeof err === "object" && "message" in err ? String(err.message) : "";

        if (errName === "AbortError" || errMessage.includes("aborted") || errMessage.includes("pause") || errName === "NotAllowedError") {
          console.log("Audio playback aborted or paused safely.");
          return;
        }
        console.error("Audio playback blocked or failed:", err);
        if (!useFallback && track.fallbackUrl) {
          console.log("Attempting to play fallback url...");
          startAudio(true, trackIndex);
        } else {
          setIsPlaying(false);
        }
      });
  };

  // Handle Play/Pause toggle
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAll();
      setIsPlaying(false);
    } else {
      if (currentTrack.isSynth) {
        startSynth();
      } else {
        startAudio();
      }
    }
  };

  // Handle track changes
  const handleSelectTrack = (idx: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCurrentIdx(idx);
    if (isPlaying) {
      // Immediately start the newly selected track with debounce
      timeoutRef.current = setTimeout(() => {
        if (TRACKS[idx].isSynth) {
          startSynth();
        } else {
          startAudio(false, idx);
        }
      }, 50);
    } else {
      stopAll();
      setProgress(0);
      setCurrentTimeFormatted("0:00");
      setDurationFormatted("0:00");
    }
  };

  // Skip tracks forward/backward
  const handleSkip = (dir: "next" | "prev") => {
    let nextIdx = currentIdx;
    if (dir === "next") {
      nextIdx = (currentIdx + 1) % TRACKS.length;
    } else {
      nextIdx = (currentIdx - 1 + TRACKS.length) % TRACKS.length;
    }
    handleSelectTrack(nextIdx);
  };

  // Synchronize HTML5 Audio time updates & volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        setProgress(pct);

        const curMin = Math.floor(audio.currentTime / 60);
        const curSec = Math.floor(audio.currentTime % 60).toString().padStart(2, "0");
        setCurrentTimeFormatted(`${curMin}:${curSec}`);

        const durMin = Math.floor(audio.duration / 60);
        const durSec = Math.floor(audio.duration % 60).toString().padStart(2, "0");
        setDurationFormatted(`${durMin}:${durSec}`);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [currentIdx]);

  // Handle volume changes
  useEffect(() => {
    const effectiveVol = isMuted ? 0 : volume;
    
    // HTML5 Audio volume sync
    if (audioRef.current) {
      audioRef.current.volume = effectiveVol;
    }

    // Web Audio Synthesis volume sync
    if (synthGainRef.current && audioCtxRef.current) {
      synthGainRef.current.gain.setValueAtTime(
        effectiveVol * 0.15, // keep synth softer
        audioCtxRef.current.currentTime
      );
    }
  }, [volume, isMuted]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAll();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Update simulated progress for synthesized background audio
  useEffect(() => {
    let timer: any;
    if (isPlaying && currentTrack.isSynth) {
      setDurationFormatted(t.infiniteText);
      timer = setInterval(() => {
        setProgress((p) => {
          const next = p + 0.5;
          return next > 100 ? 0 : next;
        });
        setCurrentTimeFormatted(t.activeText);
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentIdx]);

  return (
    <div className="bg-[#1b1d22] border border-[#2a2d34]/60 rounded-3xl p-4 space-y-4 shadow-xl" id="focus-music-widget">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <Music className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">{t.widgetTitle}</h3>
            <p className="text-[10px] text-gray-500">{t.widgetSub}</p>
          </div>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono">{t.backgroundIndicator}</span>
          </div>
        )}
      </div>

      {/* Playlist Grid */}
      <div className="grid grid-cols-1 gap-2">
        {TRACKS.map((trackItem, idx) => {
          const isSelected = idx === currentIdx;
          return (
            <button
              key={idx}
              onClick={() => handleSelectTrack(idx)}
              className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 focus:outline-none cursor-pointer ${
                isSelected
                  ? "bg-amber-500/10 border-amber-500/30 shadow-md"
                  : "bg-[#141519]/40 border-[#2a2d34]/40 hover:border-[#2a2d34]/80"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-amber-500 text-gray-950 font-black scale-105"
                      : "bg-[#1b1d22] text-gray-400"
                  }`}
                >
                  {trackItem.isSynth ? <Sparkles className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                    <span>{trackItem.name}</span>
                    {isSelected && (
                      <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase font-black tracking-widest font-mono shrink-0">
                        {t.selectedBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{trackItem.description}</p>
                </div>
              </div>

              <span className="text-[9px] font-mono font-bold text-gray-500 bg-[#1b1d22]/80 border border-[#2a2d34]/40 px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider">
                {trackItem.type}
              </span>
            </button>
          );
        })}
      </div>

      {/* Audio Player Panel */}
      <div className="bg-[#141519]/80 border border-[#2a2d34]/40 rounded-2xl p-3.5 space-y-3.5 relative overflow-hidden">
        {/* Abstract animated audio equalizer background */}
        {isPlaying && (
          <div className="absolute inset-x-0 bottom-0 h-10 flex items-end justify-around gap-[3px] px-2 opacity-5 pointer-events-none">
            {Array.from({ length: 15 }).map((_, i) => {
              const h = [24, 40, 16, 32, 48, 12, 36, 20, 44, 28, 18, 38, 14, 42, 22][i % 15];
              return (
                <div
                  key={i}
                  className="bg-amber-500 w-1 rounded-t"
                  style={{
                    height: `${h}%`,
                    animation: `equalizer ${0.6 + (i % 5) * 0.15}s infinite ease-in-out alternate`,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              );
            })}
          </div>
        )}
        <style>{`
          @keyframes equalizer {
            0% { transform: scaleY(0.2); }
            100% { transform: scaleY(1.1); }
          }
          @keyframes rotateDisc {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-disc-slow { animation: rotateDisc 10s infinite linear; }
        `}</style>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`relative ${isPlaying ? "animate-disc-slow" : ""}`}>
              <Disc className={`w-8 h-8 ${isPlaying ? "text-amber-500" : "text-gray-500"}`} />
              <div className="absolute inset-1.5 bg-[#141519] rounded-full border border-gray-800" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-amber-500 font-mono block">
                {t.nowPlaying}
              </span>
              <span className="text-xs font-black text-white truncate block uppercase tracking-wide">
                {currentTrack.name}
              </span>
            </div>
          </div>

          {/* Quick Player controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSkip("prev")}
              className="p-2 bg-[#1b1d22] border border-[#2a2d34]/60 hover:bg-[#22242b] text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer focus:outline-none"
              title={t.prevBtn}
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="w-10 h-10 bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-950 font-black rounded-xl flex items-center justify-center shadow-lg transition-all cursor-pointer focus:outline-none"
              title={isPlaying ? t.pauseBtn : t.playBtn}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-gray-950 stroke-gray-950" />
              ) : (
                <Play className="w-5 h-5 fill-gray-950 stroke-gray-950 translate-x-[1px]" />
              )}
            </button>

            <button
              onClick={() => handleSkip("next")}
              className="p-2 bg-[#1b1d22] border border-[#2a2d34]/60 hover:bg-[#22242b] text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer focus:outline-none"
              title={t.nextBtn}
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-1 bg-[#1b1d22] rounded-full overflow-hidden relative">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 font-bold uppercase tracking-wider">
            <span>{currentTimeFormatted}</span>
            <span>{durationFormatted}</span>
          </div>
        </div>

        {/* Volume & Mute control */}
        <div className="flex items-center gap-3 pt-1 border-t border-[#2a2d34]/30">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-gray-400 hover:text-white focus:outline-none transition-colors cursor-pointer"
            title={isMuted ? t.unmuteBtn : t.muteBtn}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-amber-500" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="flex-1 h-1 bg-[#1b1d22] rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
          />
          <span className="text-[10px] font-mono font-bold text-gray-400 w-8 text-right">
            {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      </div>
    </div>
  );
}
