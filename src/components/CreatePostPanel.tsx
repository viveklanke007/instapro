import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Sparkles, Calendar, Folder, Smile, Mic, Image as ImageIcon, Check } from "lucide-react";

export const CreatePostPanel: React.FC = () => {
  const { createPost, runAiCaption, runAiHashtags, refreshAll } = useApp();
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState<"Happy" | "Sad" | "Excited" | "Motivated" | "Chill" | undefined>(undefined);
  const [isDraft, setIsDraft] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [voiceUrl, setVoiceUrl] = useState("");
  const [isConfession, setIsConfession] = useState(false);

  // AI Generation overlay states
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [generatingHashtags, setGeneratingHashtags] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState("");

  const handleGenerateCaption = async () => {
    if (!aiTopicInput.trim()) return;
    setGeneratingCaption(true);
    try {
      const result = await runAiCaption(aiTopicInput);
      setCaption(result);
    } catch {
      alert("Failed to prompt Gemini API helper.");
    } finally {
      setGeneratingCaption(false);
    }
  };

  const handleGenerateHashtags = async () => {
    if (!aiTopicInput.trim()) return;
    setGeneratingHashtags(true);
    try {
      const tagsList = await runAiHashtags(aiTopicInput);
      const hashtagsString = tagsList.map(t => `#${t}`).join(" ");
      setCaption(prev => prev ? `${prev}\n\n${hashtagsString}` : hashtagsString);
    } catch {
      alert("Failed to compile hashtag index.");
    } finally {
      setGeneratingHashtags(false);
    }
  };

  const executePostCreation = async () => {
    try {
      // Split hashtags or parse them from content
      const regex = /#(\w+)/g;
      const parsedTags: string[] = [];
      let match;
      while ((match = regex.exec(caption)) !== null) {
        parsedTags.push(match[1]);
      }

      await createPost({
        caption,
        media: mediaUrl ? [mediaUrl] : [],
        mediaType: voiceUrl ? "voice" : mediaUrl ? "image" : "carousel",
        location,
        mood,
        isDraft,
        scheduledFor: scheduledFor || undefined,
        voiceUrl: voiceUrl || undefined,
        isConfession,
        hashtags: parsedTags
      });

      alert(isDraft ? "Balk post saved into draft collections!" : "Interactive memory published successfully!");

      // Clear input fields
      setCaption("");
      setMediaUrl("");
      setLocation("");
      setMood(undefined);
      setIsDraft(false);
      setScheduledFor("");
      setVoiceUrl("");
      setIsConfession(false);
      setAiTopicInput("");

      await refreshAll();
    } catch (err: any) {
      alert(err.message || "Failed to create post.");
    }
  };

  // Image presets
  const IMAGES_PRESETS = [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600"
  ];

  return (
    <div className="bg-[#181C24] border border-[#1F2531] rounded-3xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center space-x-3 border-b border-[#1F2531] pb-4">
        <div className="p-2.5 bg-[#7C3AED]/10 rounded-xl text-[#7C3AED]">
          <Folder className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-white uppercase tracking-wider">Creator Workspace</h2>
          <p className="text-[10px] text-slate-400">Publish posts, draft voice notes, or schedule configurations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core fields */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-bold block uppercase mb-1.5">Caption Content</label>
            <textarea
              placeholder="What is on your mind? Highlight hashtags `#developers` or handles `@lex`."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-[#0F1115] border border-[#1F2531] text-white text-xs p-3 rounded-2xl h-32 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] resize-none font-normal leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-bold block uppercase mb-1.5">Attached Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/illustration.jpg"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full bg-[#0F1115] border border-[#1F2531] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold block uppercase mb-1.5">Voice Note URL (Alternative)</label>
              <input
                type="text"
                placeholder="Recording voice sample .mp3 URL"
                value={voiceUrl}
                onChange={(e) => setVoiceUrl(e.target.value)}
                className="w-full bg-[#0F1115] border border-[#1F2531] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
              />
            </div>
          </div>

          {/* Preset image triggers */}
          <div>
            <span className="text-[10px] text-slate-500 font-bold block uppercase mb-2">Preset Illustration Templates</span>
            <div className="grid grid-cols-4 gap-2">
              {IMAGES_PRESETS.map((preset, idx) => (
                <img
                  key={idx}
                  src={preset}
                  alt="Preset"
                  onClick={() => setMediaUrl(preset)}
                  className={`h-16 w-full object-cover rounded-xl cursor-pointer hover:opacity-85 border-2 ${
                    mediaUrl === preset ? "border-[#7C3AED]" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-bold block uppercase mb-1.5">Geographical Location</label>
              <input
                type="text"
                placeholder="e.g. San Francisco Tech District"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#0F1115] border border-[#1F2531] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none"
              />
            </div>

            {/* Mood selector dropdown */}
            <div>
              <label className="text-xs text-slate-400 font-bold block uppercase mb-1.5">Select Current Mood</label>
              <select
                value={mood || ""}
                onChange={(e) => setMood((e.target.value || undefined) as any)}
                className="w-full bg-[#0F1115] border border-[#1F2531] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none"
              >
                <option value="">No Mood Badge</option>
                <option value="Happy">😊 Happy</option>
                <option value="Sad">😢 Sad</option>
                <option value="Excited">🔥 Excited</option>
                <option value="Motivated">⚡ Motivated</option>
                <option value="Chill">🧘 Chill</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI & scheduling control column */}
        <div className="space-y-4">
          {/* Gemini helpers box */}
          <div className="bg-[#0F1115] border border-[#1F2531] rounded-2xl p-4 space-y-3.5">
            <h4 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5 uppercase">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Gemini Content Engine</span>
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-normal">
              Enter a focal theme keyword, and let our integrated Gemini AI draft a captivating copy with hashtags.
            </p>

            <input
              type="text"
              placeholder="e.g. refactoring code to typescript"
              value={aiTopicInput}
              onChange={(e) => setAiTopicInput(e.target.value)}
              className="w-full bg-black border border-[#1F2531] text-white text-xs px-3 py-2 rounded-xl focus:outline-none"
            />

            <div className="flex space-x-2">
              <button
                onClick={handleGenerateCaption}
                disabled={generatingCaption || !aiTopicInput}
                className="flex-1 bg-[#7C3AED] hover:bg-[#9333EA] text-white py-2 rounded-xl text-[10px] font-bold transition disabled:opacity-40"
              >
                {generatingCaption ? "Drafting..." : "Draft Caption"}
              </button>
              <button
                onClick={handleGenerateHashtags}
                disabled={generatingHashtags || !aiTopicInput}
                className="flex-1 border border-[#7C3AED]/30 text-[#7C3AED] py-2 rounded-xl text-[10px] font-bold transition hover:bg-[#7C3AED]/10 disabled:opacity-40"
              >
                {generatingHashtags ? "Compiling..." : "Generate Hashtags"}
              </button>
            </div>
          </div>

          {/* Schedulers / drafts selectors */}
          <div className="bg-[#0F1115] border border-[#1F2531] rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase">Publish Configuration</h4>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Save as Draft</span>
              <button
                type="button"
                onClick={() => setIsDraft(!isDraft)}
                className={`w-10 h-6.5 flex items-center rounded-full p-1 transition ${
                  isDraft ? "bg-[#7C3AED]" : "bg-neutral-800"
                }`}
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow transform transition ${isDraft ? "translate-x-3.5" : ""}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Anonymous Confession Feed</span>
              <button
                type="button"
                onClick={() => setIsConfession(!isConfession)}
                className={`w-10 h-6.5 flex items-center rounded-full p-1 transition ${
                  isConfession ? "bg-rose-500" : "bg-neutral-800"
                }`}
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow transform transition ${isConfession ? "translate-x-3.5" : ""}`} />
              </button>
            </div>

            <div className="space-y-1 pt-2 border-t border-neutral-900">
              <span className="text-[10px] text-slate-400 block uppercase font-bold flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Schedule Post release</span>
              </span>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full bg-black border border-[#1F2531] text-xs text-white rounded-xl py-2 px-3 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={executePostCreation}
        className="w-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-3 rounded-2xl font-extrabold text-sm hover:opacity-90 transition shadow-lg flex items-center justify-center space-x-2"
      >
        <Check className="w-5 h-5" />
        <span>{isDraft ? "Save Active Draft" : scheduledFor ? "Schedule Deployment Release" : "Publish to Global Feed"}</span>
      </button>
    </div>
  );
};
