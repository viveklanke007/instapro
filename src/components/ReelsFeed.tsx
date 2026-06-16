import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Reel } from "../types";
import { Heart, MessageCircle, Share2, Eye, BarChart2, VolumeX, Volume2, Sparkles } from "lucide-react";

export const ReelsFeed: React.FC = () => {
  const { reels, currentUser, users, likeReel, viewReel } = useApp();
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(true);
  const [showAnalyticsReelId, setShowAnalyticsReelId] = useState<string | null>(null);
  const [isLikingId, setIsLikingId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentReel = reels[activeIdx];
  const reeler = currentReel ? users.find(u => u.id === currentReel.userId) : null;

  useEffect(() => {
    if (currentReel) {
      viewReel(currentReel.id);
    }
  }, [activeIdx]);

  const handleNextReel = () => {
    if (activeIdx + 1 < reels.length) {
      setActiveIdx(prev => prev + 1);
    }
  };

  const handlePrevReel = () => {
    if (activeIdx > 0) {
      setActiveIdx(prev => prev - 1);
    }
  };

  const executeDoubleTapLike = async (reelId: string) => {
    setIsLikingId(reelId);
    await likeReel(reelId);
    setTimeout(() => {
      setIsLikingId(null);
    }, 800);
  };

  const getReelEngagementRate = (reel: Reel) => {
    const likes = reel.likes.length;
    const views = reel.viewsCount || 340;
    const rate = ((likes + reel.sharesCount) / views) * 100;
    return rate.toFixed(1);
  };

  return (
    <div className="max-w-md mx-auto aspect-[9/16] w-full bg-[#0F1115] border border-[#1F2531] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col justify-between">
      {reels.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
          <Eye className="w-12 h-12 text-[#7C3AED] mb-2 animate-pulse" />
          <p className="font-bold">No Vertical Reels Uploaded</p>
          <span className="text-xs text-slate-500">Go to create tab and publish a new screen recording or live snippet.</span>
        </div>
      ) : (
        <div className="absolute inset-0 z-0 flex flex-col h-full bg-[#05070a]">
          {currentReel && (
            <div className="relative w-full h-full flex flex-col justify-between relative group">
              {/* Video Backing */}
              <video
                src={currentReel.videoUrl}
                autoPlay
                loop
                muted={muted}
                className="absolute inset-0 w-full h-full object-cover"
                onClick={() => setMuted(!muted)}
              />

              {/* Heart animation overlay on double-tap */}
              {isLikingId === currentReel.id && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-black/10">
                  <Heart className="w-20 h-20 text-rose-500 fill-rose-500 animate-[ping_0.5s_ease-in-out_infinite]" />
                </div>
              )}

              {/* Top Bar overlays */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10 text-white drop-shadow-md">
                <span className="text-xs font-bold tracking-widest uppercase bg-[#0F1115]/60 hover:bg-[#0F1115]/80 px-2.5 py-1 rounded-full border border-white/10">Reels Feed</span>
                <button
                  onClick={() => setMuted(!muted)}
                  className="p-2 bg-black/60 rounded-full border border-white/10 hover:bg-black/80 transition"
                >
                  {muted ? <VolumeX className="w-4 h-4 text-rose-400 animate-pulse" /> : <Volume2 className="w-4 h-4 text-[#22C55E]" />}
                </button>
              </div>

              {/* Swipe trigger arrows */}
              <button
                onClick={handlePrevReel}
                disabled={activeIdx === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/40 hover:bg-black/70 rounded-full text-white/80 border border-white/10 disabled:opacity-0 transition"
              >
                ▲
              </button>
              <button
                onClick={handleNextReel}
                disabled={activeIdx === reels.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/40 hover:bg-black/70 rounded-full text-white/80 border border-white/10 disabled:opacity-0 transition"
              >
                ▼
              </button>

              {/* Double tap zone */}
              <div
                className="absolute inset-0 cursor-pointer"
                onDoubleClick={() => executeDoubleTapLike(currentReel.id)}
              />

              {/* Right Side Interactions list overlay */}
              <div className="absolute right-3 bottom-24 flex flex-col items-center space-y-4 z-10 text-white drop-shadow">
                {/* Like */}
                <button
                  onClick={() => likeReel(currentReel.id)}
                  className="flex flex-col items-center p-2.5 bg-black/50 hover:bg-[#7C3AED]/30 border border-white/10 rounded-full transition group"
                >
                  <Heart className={`w-[22px] h-[22px] ${currentReel.likes.includes(currentUser?.id || "") ? "fill-rose-500 text-rose-500" : ""}`} />
                  <span className="text-[10px] font-bold mt-1">{currentReel.likes.length}</span>
                </button>

                {/* Comment placeholder */}
                <button className="flex flex-col items-center p-2.5 bg-black/50 border border-white/10 rounded-full transition hover:bg-black/70">
                  <MessageCircle className="w-[22px] h-[22px]" />
                  <span className="text-[10px] font-bold mt-1">Chat</span>
                </button>

                {/* Share metric trigger */}
                <button
                  onClick={() => {
                    currentReel.sharesCount += 1;
                    alert("Reel link shared!");
                  }}
                  className="flex flex-col items-center p-2.5 bg-black/50 border border-white/10 rounded-full transition hover:bg-black/70"
                >
                  <Share2 className="w-[22px] h-[22px]" />
                  <span className="text-[10px] font-bold mt-1">{currentReel.sharesCount}</span>
                </button>

                {/* Live Real-time analytics view overlay */}
                <button
                  onClick={() => setShowAnalyticsReelId(showAnalyticsReelId === currentReel.id ? null : currentReel.id)}
                  className="flex flex-col items-center p-2.5 bg-[#7C3AED]/40 hover:bg-[#7C3AED]/60 border border-white/10 rounded-full transition"
                  title="Reel Metrics Dashboard"
                >
                  <BarChart2 className="w-[22px] h-[22px] text-amber-300" />
                  <span className="text-[8px] font-bold mt-0.5 uppercase tracking-tighter">Stats</span>
                </button>
              </div>

              {/* Bottom Info overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-10 text-white z-10 drop-shadow">
                <div className="flex items-center space-x-2 mb-2">
                  <img
                    src={reeler?.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#7C3AED]"
                  />
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-sm">@{reeler?.username}</span>
                      {reeler?.verified && <span className="bg-[#7C3AED] text-white p-0.5 rounded-full text-[8px]">✓</span>}
                    </div>
                    <span className="text-[10px] text-slate-300">Creator Hub Partner</span>
                  </div>
                </div>

                <p className="text-xs text-slate-100 font-normal line-clamp-2">{currentReel.caption}</p>

                {currentReel.hashtags && currentReel.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {currentReel.hashtags.map(t => (
                      <span key={t} className="text-[10px] text-amber-300">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reel Metrics Panel overlay */}
      {showAnalyticsReelId && currentReel && (
        <div className="absolute inset-x-4 top-16 bg-[#181C24]/95 border border-[#7C3AED]/30 backdrop-blur-md rounded-2xl p-4 shadow-2xl z-20 text-white">
          <div className="flex items-center justify-between border-b border-[#1F2531] pb-2 mb-3">
            <h4 className="text-sm font-bold text-amber-300 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
              <span>InstaPro Video CPM Metrics</span>
            </h4>
            <button
              onClick={() => setShowAnalyticsReelId(null)}
              className="text-slate-400 hover:text-white text-xs font-bold bg-white/5 px-2 py-0.5 rounded"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-[#0F1115] p-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Total Views</span>
              <span className="text-base font-extrabold text-[#22C55E]">{currentReel.viewsCount || 344}</span>
            </div>
            <div className="bg-[#0F1115] p-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Engagement Rate</span>
              <span className="text-base font-extrabold text-indigo-400">{getReelEngagementRate(currentReel)}%</span>
            </div>
            <div className="bg-[#0F1115] p-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Avg Retention</span>
              <span className="text-base font-extrabold text-amber-400">82.4s</span>
            </div>
            <div className="bg-[#0F1115] p-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Simulated CPM</span>
              <span className="text-base font-extrabold text-purple-400">$18.25</span>
            </div>
          </div>

          <div className="mt-3 text-[9px] text-slate-400 leading-snug border-t border-[#1F2531] pt-2 text-center">
            Ad distribution is calculated organically based on reputational status scores. Keep metrics high!
          </div>
        </div>
      )}
    </div>
  );
};
