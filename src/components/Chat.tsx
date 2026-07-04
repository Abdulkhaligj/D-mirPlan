import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Sparkles, Send, Trash2, ShieldCheck, AlertTriangle } from "lucide-react";

interface ChatProps {
  chat: ChatMessage[];
  isPremium: boolean;
  onUpdateChat: (c: ChatMessage[]) => void;
  onTriggerPayment: () => void;
  coachContext: string;
}

const SUGGESTED_CHIPS = [
  "Protein hədəfim üçün nə yeyim?",
  "Diz ağrısı üçün hansı ayaq hərəkətləri olar?",
  "Ev şəraitində qarın əzələsi necə yığılır?",
  "Bench press zamanı dirsək ağrısını necə azaldım?",
  "Kütlə yığmaq üçün ən yaxşı karbohidratlar hansılardır?"
];

export default function Chat({ chat, isPremium, onUpdateChat, onTriggerPayment, coachContext }: ChatProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    if (!isPremium) {
      onTriggerPayment();
      return;
    }

    const newChat = [...chat, { role: "user" as const, content: text }];
    onUpdateChat(newChat);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newChat,
          coachContext,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      onUpdateChat([...newChat, { role: "assistant" as const, content: data.reply || "" }]);
    } catch (err: any) {
      setError(err.message || "Aİ cavab verə bilmədi. Zəhmət olmasa bir az sonra yenidən cəhd edin.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (!confirm("Bütün söhbət tarixçəsini silmək istəyirsiniz?")) return;
    onUpdateChat([]);
  };

  return (
    <div className="space-y-4 flex flex-col min-h-[70vh]">
      {/* Premium Upgrader Block */}
      {!isPremium ? (
        <div className="bg-[#1b1d22] border border-amber-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-amber-500 font-bold">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Premium Aİ Məşqçi</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Şəxsi bədən göstəriciləriniz, məqsədiniz və cari məşq proqramınız haqqında tam məlumatlı olan fərdi fitness məsləhətçinizlə söhbətə başlayın! Yemək əvəzləmələri, hərəkət texnikası, ağrılar və motivasiya sualları verin.
          </p>
          <button
            onClick={onTriggerPayment}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl cursor-pointer transition-all uppercase tracking-wider text-sm shadow-md"
          >
            ⭐ Premium Alın — Söhbəti Aktivləşdirin
          </button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-400">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <p>
            Premium fəaldır. Aİ şəxsi məşqçiniz bədən çəkinizi, boyunuzu, məqsədinizi və proqramınızı tam olaraq analiz edərək sizə cavab verir!
          </p>
        </div>
      )}

      {/* Suggested chips list */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x shrink-0">
        {SUGGESTED_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            disabled={loading}
            className="flex-shrink-0 bg-[#1b1d22] border border-[#2a2d34] hover:border-amber-500 text-gray-300 hover:text-white text-xs py-2 px-3.5 rounded-full transition-all cursor-pointer snap-start disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Message history layout */}
      <div className="flex-1 bg-[#1b1d22]/40 border border-[#2a2d34]/60 rounded-2xl p-4 overflow-y-auto space-y-3 min-h-[350px] max-h-[500px]">
        {chat.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <Sparkles className="w-8 h-8 text-amber-500/50 animate-bounce" />
            <span className="text-sm font-bold text-gray-200">Aİ Məşqçi Söhbəti</span>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              Salam! Sizin virtual fitness köməkçinizəm. Məşq, kalori, qidalar haqqında suallarınızı verməkdən çəkinməyin!
            </p>
          </div>
        )}

        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-amber-500 text-gray-950 font-semibold rounded-br-none"
                  : "bg-[#1b1d22] border border-[#2a2d34] text-gray-100 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1b1d22] border border-[#2a2d34] rounded-2xl rounded-bl-none p-3.5 text-xs text-gray-400 font-semibold animate-pulse flex items-center gap-2">
              <RefreshCcw className="w-3.5 h-3.5 animate-spin text-amber-500" />
              Aİ məşqçiniz düşünür...
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input controller row */}
      <div className="flex gap-2 shrink-0 pt-1">
        <input
          type="text"
          placeholder={isPremium ? "Sualınızı yazın..." : "Sual yazmaq üçün Premium alın"}
          value={input}
          disabled={!isPremium || loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          className="flex-1 bg-[#1b1d22] border border-[#2a2d34] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-40"
        />
        <button
          onClick={() => handleSend()}
          disabled={!isPremium || loading || !input.trim()}
          className="w-12 h-12 bg-amber-500 hover:bg-amber-600 disabled:bg-[#1b1d22] disabled:border disabled:border-[#2a2d34] disabled:text-gray-600 hover:scale-105 active:scale-95 text-gray-950 rounded-xl flex items-center justify-center transition-all cursor-pointer"
        >
          <Send className="w-5 h-5 font-black" />
        </button>
      </div>

      {chat.length > 0 && (
        <div className="flex justify-end shrink-0">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 py-1 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 rounded-lg text-red-400 text-xs font-semibold cursor-pointer transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Söhbəti Sil
          </button>
        </div>
      )}
    </div>
  );
}

// Inline replacement for missing import
function RefreshCcw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
