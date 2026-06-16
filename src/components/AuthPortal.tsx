import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { KeyRound, Mail, UserPlus, Sparkles, LogIn, Check } from "lucide-react";

export const AuthPortal: React.FC = () => {
  const { login, register, verifyOtp, currentUser } = useApp();
  const [mode, setMode] = useState<"login" | "signup" | "otp" | "forgot">("login");

  // Login/Signup form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // OTP Form States
  const [otpCode, setOtpCode] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);

  const handleLogin = async (presetUser?: string) => {
    setErrorMsg("");
    try {
      const userToLogin = presetUser || username || email;
      if (!userToLogin.trim()) {
        setErrorMsg("Please enter email or username, or choose a preset.");
        return;
      }
      await login(userToLogin.trim());
    } catch (e: any) {
      setErrorMsg(e.message || "Invalid login credentials.");
    }
  };

  const handleSignup = async () => {
    setErrorMsg("");
    if (!username.trim() || !email.trim()) {
      setErrorMsg("Missing required parameters.");
      return;
    }
    try {
      const user = await register(username.trim(), email.trim(), fullName.trim());
      // Prompt simulated OTP screen
      setMode("otp");
    } catch (e: any) {
      setErrorMsg(e.message || "Registration failed.");
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg("");
    if (!otpCode.trim()) return;
    const success = await verifyOtp(otpCode);
    if (success) {
      setOtpSuccess(true);
      setTimeout(() => {
        setMode("login");
        setOtpSuccess(false);
      }, 1500);
    } else {
      setErrorMsg("Incorrect validation code. Try again (hint: '123456')");
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) return;
    alert(`Reset pass token dispatched to ${email}! Check folders.`);
    setMode("login");
  };

  const creatorPresets = [
    { username: "lex_dev", title: "@lex_dev (TypeScript craftsman)", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    { username: "sofia_fit", title: "@sofia_fit (Physical strategist)", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
    { username: "cyber_gamer", title: "@cyber_gamer (PC customization)", avatar: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100" }
  ];

  return (
    <div className="max-w-md w-full mx-auto bg-[#181C24] border border-[#1F2531] rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Visual Header card */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] rounded-2xl flex items-center justify-center text-white font-black text-xl tracking-tighter">
          IP
        </div>
        <h2 className="text-xl font-black text-white">InstaPro Gateway</h2>
        <p className="text-[10px] text-slate-400 capitalize">Premium Dark Mode Social Sandbox</p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-600/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-semibold">
          Error: {errorMsg}
        </div>
      )}

      {/* Mode selectors */}
      {mode === "login" && (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Email or Username</label>
              <input
                type="text"
                placeholder="lex_dev or lex@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0F1115] border border-[#1F2531] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Access Pass (Simulated)</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0F1115] border border-[#1F2531] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none opacity-50"
                disabled
              />
            </div>
          </div>

          <button
            onClick={() => handleLogin()}
            className="w-full bg-[#7C3AED] hover:bg-[#9333EA] text-white py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
          >
            <LogIn className="w-4 h-4" />
            <span>Enter Studio</span>
          </button>

          {/* Quick Creator Switches */}
          <div className="pt-2 border-t border-[#1F2531] space-y-2">
            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wide">Quick connect preset profiles</span>
            <div className="grid grid-cols-1 gap-1.5">
              {creatorPresets.map(preset => (
                <div
                  key={preset.username}
                  onClick={() => handleLogin(preset.username)}
                  className="flex items-center justify-between p-2.5 bg-[#0F1115] border border-[#161C24] hover:bg-[#1E2532]/40 rounded-xl cursor-pointer transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <img src={preset.avatar} className="w-6 h-6 rounded-full object-cover" alt="" />
                    <span className="text-[11px] text-slate-200 font-medium">{preset.title}</span>
                  </div>
                  <span className="text-[9px] text-[#7C3AED] font-bold uppercase">Connect →</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2">
            <button onClick={() => setMode("signup")} className="hover:text-white transition">Create Account</button>
            <button onClick={() => setMode("forgot")} className="hover:text-white transition">Forgot Password?</button>
          </div>
        </div>
      )}

      {mode === "signup" && (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Username</label>
              <input
                type="text"
                placeholder="lex_dev"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0F1115] border border-[#1F2531] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Email</label>
              <input
                type="email"
                placeholder="lex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0F1115] border border-[#1F2531] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Lex Coder"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#0F1115] border border-[#1F2531] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSignup}
            className="w-full bg-[#7C3AED] hover:bg-[#9333EA] text-white py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
          >
            <UserPlus className="w-4 h-4" />
            <span>Generate Profile</span>
          </button>

          <div className="text-center pt-2">
            <button onClick={() => setMode("login")} className="text-[11px] text-slate-500 hover:text-white transition font-semibold">
              Return to Login
            </button>
          </div>
        </div>
      )}

      {mode === "otp" && (
        <div className="space-y-4">
          <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/20 p-3 rounded-xl text-center">
            <span className="text-xs text-[#7C3AED] font-semibold animate-pulse">Email OTP Verification Code Issued</span>
            <p className="text-[10px] text-slate-400 mt-0.5 font-normal leading-snug">SIMULATED FLOW: We sent a 6-digit access code. Enter "123456" below to verify.</p>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Enter Verification OTP</label>
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full bg-[#0F1115] border border-[#1F2531] text-white text-center text-lg font-mono tracking-widest px-3 py-2.5 rounded-xl focus:outline-none"
            />
          </div>

          {otpSuccess ? (
            <div className="p-3 bg-emerald-600/15 border border-emerald-500/20 text-[#22C55E] text-xs font-bold text-center rounded-xl flex items-center justify-center space-x-1">
              <Check className="w-4 h-4" />
              <span>Email Verified! Earned Verified Creator!</span>
            </div>
          ) : (
            <button
              onClick={handleVerifyOtp}
              disabled={!otpCode}
              className="w-full bg-[#7C3AED] hover:bg-[#9333EA] text-white py-3 rounded-xl text-xs font-bold transition"
            >
              Verify OTP Code
            </button>
          )}
        </div>
      )}

      {mode === "forgot" && (
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Your Registered Email</label>
            <input
              type="email"
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0F1115] border border-[#1F2531] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none"
            />
          </div>

          <button
            onClick={handleForgotPassword}
            disabled={!email}
            className="w-full bg-[#7C3AED] hover:bg-[#9333EA] text-white py-3 rounded-xl text-xs font-bold transition"
          >
            Email Recovery Key
          </button>

          <div className="text-center">
            <button onClick={() => setMode("login")} className="text-[11px] text-slate-500 hover:text-white transition font-semibold">
              Return to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
