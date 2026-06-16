import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Story } from "../types";
import { Plus, X, Heart, MessageCircle, AlertTriangle } from "lucide-react";

export const StoryTray: React.FC = () => {
  const { stories, currentUser, users, createStory, t, submitReport } = useApp();
  const [activeStoryUser, setActiveStoryUser] = useState<string | null>(null);
  const [activeStoryIdx, setActiveStoryIdx] = useState<number>(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newStoryMedia, setNewStoryMedia] = useState("");
  const [reportingStory, setReportingStory] = useState<Story | null>(null);

  // Group stories by user
  const storiesByUser = stories.reduce<Record<string, Story[]>>((acc, story) => {
    if (!acc[story.userId]) acc[story.userId] = [];
    acc[story.userId].push(story);
    return acc;
  }, {});

  const handleUserClick = (userId: string) => {
    setActiveStoryUser(userId);
    setActiveStoryIdx(0);
  };

  const handleNextStory = () => {
    if (!activeStoryUser) return;
    const userStoryList = storiesByUser[activeStoryUser] || [];
    if (activeStoryIdx + 1 < userStoryList.length) {
      setActiveStoryIdx(prev => prev + 1);
    } else {
      setActiveStoryUser(null);
    }
  };

  const handlePrevStory = () => {
    if (!activeStoryUser) return;
    if (activeStoryIdx > 0) {
      setActiveStoryIdx(prev => prev - 1);
    } else {
      setActiveStoryUser(null);
    }
  };

  const activeStoriesList = activeStoryUser ? storiesByUser[activeStoryUser] || [] : [];
  const currentStory = activeStoriesList[activeStoryIdx];
  const storyCreator = currentStory ? users.find(u => u.id === currentStory.userId) : null;

  const handleAddStory = async () => {
    if (!newStoryMedia) return;
    await createStory(newStoryMedia, "image");
    setNewStoryMedia("");
    setUploadOpen(false);
  };

  const handleStoryReport = async () => {
    if (!reportingStory) return;
    await submitReport(reportingStory.id, "story", "Inappropriate content in story");
    alert("Story has been reported to administrators.");
    setReportingStory(null);
    setActiveStoryUser(null);
  };

  const handleStoryReaction = (emoji: string) => {
    alert(`Reacted with ${emoji} to story!`);
  };

  const sampleStoryPresets = [
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600"
  ];

  return (
    <div className="flex items-center space-x-4 p-4 bg-[#181C24] border border-[#1F2531] rounded-2xl overflow-x-auto scrollbar-none shadow-xl mb-6">
      {/* Current User Story Bubble */}
      {currentUser && (
        <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              className="w-16 h-16 rounded-full border-2 border-gray-600 p-[2px] object-cover"
              onClick={() => handleUserClick(currentUser.id)}
            />
            <button
              onClick={(e) => { e.stopPropagation(); setUploadOpen(true); }}
              className="absolute bottom-0 right-0 p-1 bg-[#7C3AED] rounded-full text-white border-2 border-[#181C24] hover:bg-[#9333EA] transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-slate-300 font-medium truncate w-16 text-center">My Story</span>
        </div>
      )}

      {/* Other Users Stories */}
      {Object.keys(storiesByUser).map((userId) => {
        if (userId === currentUser?.id) return null;
        const user = users.find((u) => u.id === userId);
        if (!user) return null;
        return (
          <div
            key={userId}
            onClick={() => handleUserClick(userId)}
            className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] p-[2.5px] animated-gradient">
                <div className="w-full h-full rounded-full bg-[#181C24] p-[1.5px]">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-[58px] h-[58px] rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
            <span className="text-xs text-slate-200 mt-[4px] font-medium truncate w-16 text-center group-hover:text-white transition-colors">
              @{user.username}
            </span>
          </div>
        );
      })}

      {/* Immersive Story Modal */}
      {activeStoryUser && currentStory && storyCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <div className="relative w-full max-w-lg aspect-[9/16] max-h-[90vh] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4">
            {/* Top progress bars */}
            <div className="absolute top-3 left-4 right-4 flex space-x-2 z-10">
              {activeStoriesList.map((_, idx) => (
                <div key={idx} className="h-1 bg-white/20 rounded-full flex-1 overflow-hidden">
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      idx < activeStoryIdx
                        ? "w-full"
                        : idx === activeStoryIdx
                        ? "w-full animate-[progress_7s_linear]"
                        : "w-0"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Story Header */}
            <div className="flex items-center justify-between z-10 mt-4 px-2">
              <div className="flex items-center space-x-3">
                <img
                  src={storyCreator.avatar}
                  alt={storyCreator.username}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#7C3AED]"
                />
                <div>
                  <h4 className="font-semibold text-white text-sm">@{storyCreator.username}</h4>
                  <p className="text-[10px] text-slate-400">
                    {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <button
                  onClick={() => setReportingStory(currentStory)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                  title="Report Content"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </button>
                <button
                  onClick={() => setActiveStoryUser(null)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Story Media */}
            <div className="absolute inset-0 z-0 flex items-center justify-center">
              <img
                src={currentStory.media}
                alt="Story content"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Tap areas for next/prev */}
            <div className="absolute inset-x-0 top-20 bottom-24 flex z-0">
              <div className="w-1/3 h-full cursor-west-resize" onClick={handlePrevStory} />
              <div className="w-2/3 h-full cursor-east-resize" onClick={handleNextStory} />
            </div>

            {/* Reactions and replies footer */}
            <div className="z-10 p-3 bg-gradient-to-t from-black/80 to-transparent rounded-2xl flex flex-col space-y-3">
              <div className="flex justify-around bg-black/40 backdrop-blur-md rounded-2xl py-2 border border-white/10">
                {["❤️", "🔥", "😂", "😮", "🙌", "💀"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleStoryReaction(emoji)}
                    className="text-2xl hover:scale-125 transition-transform duration-150 active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="text-center text-xs text-slate-400">
                Story expires automatically within 24 hours.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Upload Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181C24] border border-[#1F2531] max-w-md w-full rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setUploadOpen(false)}
              className="absolute top-4 right-4 p-1 bg-white/5 hover:bg-white/10 rounded-full text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Publish an Active Story</h3>
            <p className="text-xs text-slate-400 mb-4">Users can view your story inside 24 hours. Connect your daily vibes!</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-2 font-medium">Select a Preset or Paste Media URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={newStoryMedia}
                  onChange={(e) => setNewStoryMedia(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#1F2531] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {sampleStoryPresets.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt="Preset story"
                    onClick={() => setNewStoryMedia(preset)}
                    className={`h-20 w-full object-cover rounded-xl cursor-pointer hover:opacity-85 border-2 ${
                      newStoryMedia === preset ? "border-[#7C3AED]" : "border-transparent"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleAddStory}
                disabled={!newStoryMedia}
                className="w-full bg-[#7C3AED] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#9333EA] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Publish Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reporting Story confirmation */}
      {reportingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#181C24] border border-rose-500/20 max-w-sm w-full rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <AlertTriangle className="text-rose-500 w-5 h-5" />
              <span>Flag This Story?</span>
            </h3>
            <p className="text-sm text-slate-300 mb-4">
              Our automated Gemini integrity auditor will review this post. Do you wish to report it for offensive guidelines violation?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleStoryReport}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 text-sm font-semibold transition"
              >
                Confirm Report
              </button>
              <button
                onClick={() => setReportingStory(null)}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-slate-300 rounded-lg py-2 text-sm font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
