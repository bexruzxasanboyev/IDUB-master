"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { FaPhone, FaTelegram } from "react-icons/fa";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  if (digits.length <= 3) return "+" + digits;
  if (digits.length <= 5) return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 8) return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
  if (digits.length <= 10) return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
}

function rawPhone(formatted: string): string {
  return "+" + formatted.replace(/\D/g, "");
}

export default function LoginPage() {
  const router = useRouter();
  const { login, verify, user } = useAuth();

  const [step, setStep] = useState<"phone" | "otp" | "telegram">("phone");
  const [phone, setPhone] = useState("+998 ");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (user) router.replace("/profil");
  }, [user, router]);

  if (user) return null;

  const phoneDigits = rawPhone(phone).replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length === 12;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, "");
    if (digits.length === 0) {
      setPhone("+998 ");
      return;
    }
    if (!digits.startsWith("998")) {
      setPhone(formatPhone("998" + digits));
      return;
    }
    setPhone(formatPhone(digits));
  };

  const handleSendOtp = async () => {
    if (!isPhoneValid) return;
    setLoading(true);
    setError("");
    try {
      const result = await login(rawPhone(phone));
      if (result.otpSent) {
        setStep("otp");
        setTimer(result.expiresInSec);
        const interval = setInterval(() => {
          setTimer((t) => {
            if (t <= 1) { clearInterval(interval); return 0; }
            return t - 1;
          });
        }, 1000);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg === "Failed to fetch" || msg === "fetch failed") {
        setError("Server bilan bog'lanib bo'lmadi. Internetni tekshiring.");
      } else if (
        msg.toLowerCase().includes("telegram") ||
        msg.toLowerCase().includes("bog'lang") ||
        msg.toLowerCase().includes("ilova") ||
        msg.toLowerCase().includes("bot") ||
        err.code === "TELEGRAM_NOT_LINKED" ||
        err.code === "USER_NOT_FOUND"
      ) {
        setStep("telegram");
        setError("");
      } else {
        setError(msg || "Xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "");
    if (digit.length > 1) {
      // Paste handling
      const digits = digit.slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  const otpCode = otp.join("");

  const handleVerify = async () => {
    if (otpCode.length < 4) return;
    setLoading(true);
    setError("");
    try {
      await verify(rawPhone(phone), otpCode);
      router.replace("/profil");
    } catch (err: any) {
      if (err.message === "Failed to fetch" || err.message === "fetch failed") {
        setError("Server bilan bog'lanib bo'lmadi. Internetni tekshiring.");
      } else {
        setError(err.message || "Kod noto'g'ri");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-white/5 p-6 sm:p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {step === "telegram" ? "Telegram botni ulang" : "Kirish"}
          </h1>
          <p className="text-gray-400 text-sm">
            {step === "phone" && "Telegram ga ulangan telefon raqamingizni kiriting"}
            {step === "otp" && `${phone} raqamiga yuborilgan kodni kiriting`}
            {step === "telegram" && "Kirish uchun avval Telegram botimizga ulanishingiz kerak"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {step === "phone" && (
          <div className="space-y-4">
            <div className="relative">
              <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+998 90 123 45 67"
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-lg tracking-wide placeholder:text-gray-600 outline-none focus:border-second/60 transition"
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              />
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading || !isPhoneValid}
              className="w-full py-3.5 bg-second rounded-xl font-bold hover:bg-second/85 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Yuborilmoqda..." : "Kod yuborish"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                    handleOtpChange(i, pasted);
                  }}
                  maxLength={1}
                  className="w-10 h-12 sm:w-12 sm:h-14 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white text-center text-lg sm:text-xl font-bold outline-none focus:border-second/60 transition"
                />
              ))}
            </div>

            {timer > 0 && (
              <p className="text-center text-sm text-gray-500">
                Kod amal qilish muddati: <span className="text-white font-medium">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</span>
              </p>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || otpCode.length < 4}
              className="w-full py-3.5 bg-second rounded-xl font-bold hover:bg-second/85 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Tekshirilmoqda..." : "Tasdiqlash"}
            </button>

            <button
              onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
              className="w-full py-2 text-sm text-gray-400 hover:text-white transition"
            >
              Raqamni o&apos;zgartirish
            </button>
          </div>
        )}

        {step === "telegram" && (
          <div className="space-y-5 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#2AABEE]/15 flex items-center justify-center">
              <FaTelegram className="text-[#2AABEE] text-4xl" />
            </div>

            <div className="space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-white font-medium">{phone}</span> raqami hali botda ro&apos;yxatdan o&apos;tmagan.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2.5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Qadamlar:</p>
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-second/20 text-second text-[10px] font-bold flex items-center justify-center mt-0.5">1</span>
                  <p className="text-sm text-gray-300">Quyidagi tugma orqali <span className="text-white font-medium">@idub_codebot</span> ga o&apos;ting</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-second/20 text-second text-[10px] font-bold flex items-center justify-center mt-0.5">2</span>
                  <p className="text-sm text-gray-300"><span className="text-white font-medium">/start</span> tugmasini bosing va telefon raqamingizni yuboring</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-second/20 text-second text-[10px] font-bold flex items-center justify-center mt-0.5">3</span>
                  <p className="text-sm text-gray-300">Qaytib kelib <span className="text-white font-medium">&quot;Qayta urinish&quot;</span> tugmasini bosing</p>
                </div>
              </div>
            </div>

            <a
              href="https://t.me/idub_codebot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-[#2AABEE] rounded-xl font-bold hover:bg-[#2AABEE]/85 transition active:scale-[0.98] flex items-center justify-center gap-2.5"
            >
              <FaTelegram className="text-lg" />
              @idub_codebot ga o&apos;tish
            </a>

            <button
              onClick={() => { setStep("phone"); setError(""); }}
              className="w-full py-3.5 bg-second rounded-xl font-bold hover:bg-second/85 transition active:scale-[0.98]"
            >
              Qayta urinish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
