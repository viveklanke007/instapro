import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Award,
  TrendingUp,
  QrCode,
  CheckCircle,
  Users,
  LineChart,
  UserPlus,
  Sparkles,
  ExternalLink,
  Shield,
  Clock,
  Loader
} from "lucide-react";

export const ProfilePanel: React.FC = () => {
  const {
    currentUser,
    users,
    posts,
    reels,
    stories,
    updateProfile,
    triggerReferral,
    runAiProfileReview,
    t
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"posts" | "analytics" | "achievements">("posts");
  const [qrOpen, setQrOpen] = useState<boolean>(false);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [aiReview, setAiReview] = useState<{ score: number; critique: string; actionableUpgrades: string[] } | null>(null);
  const [verificationRequestSent, setVerificationRequestSent] = useState<boolean>(false);

  if (!currentUser) return null;

  // Filter posts created by this user
  const userPosts = posts.filter(p => p.userId === currentUser.id && !p.isDraft);
  const userReels = reels.filter(r => r.userId === currentUser.id);

  // Calculate stats
  const totalLikes = userPosts.reduce((acc, p) => acc + p.likes.length, 0);
  const totalViews = userReels.reduce((acc, r) => acc + (r.viewsCount || 0), 0);
  const followerCount = currentUser.followers.length;
  const followingCount = currentUser.following.length;

  const handleVerifyRequest = () => {
    setVerificationRequestSent(true);
    alert("Verification request submitted! Administrators will review your reputation index within 24 hours.");
  };

  const handleTriggerReview = async () => {
    setReviewLoading(true);
    setAiReview(null);
    try {
      const result = await runAiProfileReview();
      setAiReview(result);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze profile quality.");
    } finally {
      setReviewLoading(false);
    }
  };

  // Badges metadata mapping
  const BADGES_INFO = [
    { name: "Rising Creator", desc: "Awarded for exceptional user outreach or referral milestones.", icon: "🌱", color: "from-green-500 to-emerald-400" },
    { name: "Top Commenter", desc: "Awarded for highly active discussions and positive feedback loops.", icon: "💬", color: "from-blue-500 to-indigo-400" },
    { name: "Viral Post", desc: "Reached high engagement, views, or bookmarks on a published loop.", icon: "🔥", color: "from-orange-500 to-amber-400" },
    { name: "Verified Creator", desc: "Profile authenticity approved via legal documentation or reputation score.", icon: "🌟", color: "from-purple-500 to-pink-400" }
  ];

  return (
    <div className="space-y-6">
      {/* Banner & Avatar section */}
      <div className="bg-[#181C24] border border-[#1F2531] rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="h-44 w-full relative">
          <img
            src={currentUser.coverBanner}
            alt="Cover Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="px-6 pb-6 relative">
          {/* Avatar frame */}
          <div className="absolute -top-16 left-6">
            <img
              src={currentUser.avatar}
              alt={currentUser.fullName}
              className="w-28 h-28 rounded-full border-4 border-[#181C24] object-cover bg-[#181C24] shadow-xl"
            />
          </div>

          {/* Action trigger row */}
          <div className="flex justify-end pt-4 space-x-3">
            <button
              onClick={() => setQrOpen(true)}
              className="p-2.5 bg-[#0F1115] hover:bg-[#1F2531] rounded-xl text-slate-300 hover:text-white transition"
              title="Share QR Profile Code"
            >
              <QrCode className="w-5 h-5" />
            </button>

            <button
              onClick={handleTriggerReview}
              className="px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white rounded-xl text-xs font-bold hover:opacity-90 flex items-center space-x-1.5 transition shadow"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>AI Review</span>
            </button>

            {!currentUser.verified && (
              <button
                onClick={handleVerifyRequest}
                disabled={verificationRequestSent}
                className="px-4 py-2 border border-[#7C3AED]/30 hover:border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED]/10 rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                {verificationRequestSent ? "Pending Approval" : "Request Badge"}
              </button>
            )}
          </div>

          {/* Profile Name info */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white">{currentUser.fullName}</h2>
              {currentUser.verified && (
                <span className="text-xs bg-[#7C3AED] text-white px-2 py-0.5 rounded-full font-semibold">
                  Verified Creator
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">@{currentUser.username}</p>

            <span className="inline-block mt-3 text-xs bg-[#0F1115] border border-[#161C24] px-3 py-1 rounded-full text-[#22C55E] font-semibold">
              🏆 Reputation Index Score: {currentUser.reputation}/100
            </span>

            <p className="text-xs text-slate-300 mt-3 font-normal leading-relaxed max-w-xl">{currentUser.bio}</p>

            {currentUser.website && (
              <a
                href={currentUser.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#7C3AED] hover:underline flex items-center space-x-1 mt-2.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{currentUser.website}</span>
              </a>
            )}
          </div>

          {/* Followers metrics row */}
          <div className="flex items-center space-x-6 mt-5 pt-5 border-t border-[#1F2531]">
            <div className="text-center md:text-left">
              <span className="text-base font-extrabold text-white">{userPosts.length}</span>
              <span className="text-xs text-slate-400 block uppercase tracking-wider">Posts</span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-base font-extrabold text-white">{followerCount}</span>
              <span className="text-xs text-slate-400 block uppercase tracking-wider">{t.followers}</span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-base font-extrabold text-white">{followingCount}</span>
              <span className="text-xs text-slate-400 block uppercase tracking-wider">{t.following}</span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-base font-extrabold text-white">{currentUser.referrals || 0}</span>
              <span className="text-xs text-slate-400 block uppercase tracking-wider">Referrals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Review Result Panel */}
      {reviewLoading && (
        <div className="bg-[#181C24] border border-[#7C3AED]/20 rounded-2xl p-6 text-center shadow">
          <Loader className="w-8 h-8 text-[#7C3AED] animate-spin mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-white">Gemini Analyzing Profile Quality...</h4>
          <p className="text-xs text-slate-400 mt-1">Measuring bio positioning, engagement vectors, and avatar presence.</p>
        </div>
      )}

      {aiReview && (
        <div className="bg-gradient-to-r from-[#181C24] to-[#12141a]/95 border border-[#7C3AED]/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sparkles className="w-32 h-32 text-amber-300" />
          </div>

          <div className="flex items-center justify-between border-b border-[#1F2531] pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
              <h3 className="font-bold text-white text-sm uppercase">Gemini AI Brand Critique</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-medium">Quality Rating</span>
              <p className="text-xl font-black text-amber-400">{aiReview.score}/100</p>
            </div>
          </div>

          <p className="text-xs text-slate-200 font-normal leading-relaxed bg-[#0F1115]/80 p-3 rounded-xl border border-white/5 mb-4">
            {aiReview.critique}
          </p>

          <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider mb-2">Actionable Upgrades:</h4>
          <ul className="space-y-2">
            {aiReview.actionableUpgrades.map((upgrade, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2 bg-neutral-900/40 p-2.5 rounded-lg border border-white/5">
                <span className="text-[#22C55E] font-bold">#{idx + 1}</span>
                <span>{upgrade}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex space-x-3 border-b border-[#1F2531] pb-3">
        {(["posts", "analytics", "achievements"] as const).map((sub) => (
          <button
            key={sub}
            onClick={() => setActiveSubTab(sub)}
            className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition ${
              activeSubTab === sub
                ? "bg-[#7C3AED] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Grid contents */}
      {activeSubTab === "posts" && (
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {userPosts.map((p) => (
            <div
              key={p.id}
              className="aspect-square bg-[#0F1115] border border-[#1F2531] rounded-2xl overflow-hidden relative group cursor-pointer shadow hover:-translate-y-0.5 transition duration-150"
            >
              <img
                src={p.media && p.media.length > 0 ? p.media[0] : "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400"}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center space-x-4 text-white">
                <span className="text-xs font-bold flex items-center space-x-1">
                  <span>❤️</span>
                  <span>{p.likes.length}</span>
                </span>
                {p.mood && (
                  <span className="text-[10px] bg-[#7C3AED] px-2 py-0.5 rounded-full font-semibold uppercase">
                    {p.mood}
                  </span>
                )}
              </div>
            </div>
          ))}

          {userPosts.length === 0 && (
            <div className="col-span-3 text-center py-10 bg-[#181C24] border border-[#1F2531] rounded-2xl text-slate-500">
              No standard images compiled yet. Turn to Draft Saving or Creation.
            </div>
          )}
        </div>
      )}

      {activeSubTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#181C24] border border-[#1F2531] p-4 rounded-2xl shadow">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-1">Profile Visits</span>
              <p className="text-xl font-extrabold text-white">{currentUser.profileVisitsCount || 120}</p>
              <span className="text-[9px] text-[#22C55E]">+14.2% since yesterday</span>
            </div>
            <div className="bg-[#181C24] border border-[#1F2531] p-4 rounded-2xl shadow">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-1">Story Reach</span>
              <p className="text-xl font-extrabold text-white">{stories.length * 4 + 18}</p>
              <span className="text-[9px] text-indigo-400">Steady interaction</span>
            </div>
            <div className="bg-[#181C24] border border-[#1F2531] p-4 rounded-2xl shadow">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-1">Reels Reach</span>
              <p className="text-xl font-extrabold text-white">{totalViews || 2100}</p>
              <span className="text-[9px] text-indigo-400">+45.1% loop multiplier</span>
            </div>
            <div className="bg-[#181C24] border border-[#1F2531] p-4 rounded-2xl shadow">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider mb-1">Invite Network</span>
              <p className="text-xl font-extrabold text-white">{currentUser.referrals || 0}</p>
              <span className="text-[9px] text-[#22C55E]">Active code checks</span>
            </div>
          </div>

          {/* Invite block */}
          <div className="bg-gradient-to-r from-[#181C24] to-[#121415] border border-[#1F2531] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#7C3AED]/20 rounded-xl text-[#7C3AED]">
                <UserPlus className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Grow Your Network & Earn Badges</h4>
                <p className="text-xs text-slate-400 max-w-md">Gain reputation multipliers by inviting and verifying fellow engineers to verify structures!</p>
              </div>
            </div>
            <button
              onClick={triggerReferral}
              className="bg-[#7C3AED] hover:bg-[#9333EA] text-white px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer"
            >
              Generate Invitation Code
            </button>
          </div>
        </div>
      )}

      {activeSubTab === "achievements" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BADGES_INFO.map((badge, idx) => {
            const hasBadge = currentUser.achievements.includes(badge.name);
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex items-center space-x-4 transition ${
                  hasBadge
                    ? "bg-[#181C24] border-[#7C3AED]/30 opacity-100"
                    : "bg-[#181C24]/40 border-neutral-800 opacity-50"
                }`}
              >
                <div className={`p-4 rounded-xl text-3xl bg-gradient-to-tr ${badge.color} shadow-xl`}>
                  {badge.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h4 className="font-bold text-white text-sm">{badge.name}</h4>
                    {hasBadge && <span className="bg-[#22C55E] text-white rounded-full p-[2px] text-[8px]">✓</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Sharing Modal */}
      {qrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#181C24] border border-[#1F2531] max-w-xs w-full p-6 rounded-3xl shadow-2xl relative text-center">
            <button
              onClick={() => setQrOpen(false)}
              className="absolute top-4 right-4 text-xs font-bold px-2 py-0.5 bg-white/5 rounded hover:bg-white/10 text-slate-400"
            >
              Close
            </button>
            <h3 className="text-sm font-extrabold text-white mb-3 uppercase tracking-wider">InstaPro Profile Scan Card</h3>
            <p className="text-[10px] text-slate-400 mb-4">Let fellow creators scan this grid to follow your updates instantly.</p>

            <div className="mx-auto w-44 h-44 bg-slate-900 border-2 border-[#7C3AED] p-3 rounded-2xl flex items-center justify-center mb-4 shadow">
              <div className="bg-white p-2 rounded-xl">
                <QrCode className="w-32 h-32 text-[#0F1115]" />
              </div>
            </div>

            <span className="text-xs bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[#7C3AED] px-3.5 py-1 rounded-full font-bold">
              @{currentUser.username}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
