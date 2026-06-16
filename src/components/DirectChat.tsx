import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Message } from "../types";
import { Send, Image, Mic, MessageSquare, Smile, Volume2, CheckCheck, Loader2 } from "lucide-react";

export const DirectChat: React.FC = () => {
  const { currentUser, users, sendMessage, t } = useApp();
  const [activeInterlocutorId, setActiveInterlocutorId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typedMessage, setTypedMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [attachingImage, setAttachingImage] = useState<string | null>(null);
  const [reactionTargetMessageId, setReactionTargetMessageId] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);

  const activeInterlocutor = users.find(u => u.id === activeInterlocutorId);

  // Sync / retrieve messages dynamically
  const syncMessages = async () => {
    if (!currentUser || !activeInterlocutorId) return;
    try {
      const res = await fetch(`/api/messages/${currentUser.id}/${activeInterlocutorId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.warn("Direct Messages synchronization failed:", e);
    }
  };

  useEffect(() => {
    syncMessages();
    const interval = setInterval(syncMessages, 3000); // Poll messages every 3s
    return () => clearInterval(interval);
  }, [activeInterlocutorId]);

  // Scroll to bottom helper
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate typing status updates
  useEffect(() => {
    if (typedMessage.trim().length > 0) {
      setIsTyping(true);
      const delay = setTimeout(() => setIsTyping(false), 2000);
      return () => clearTimeout(delay);
    } else {
      setIsTyping(false);
    }
  }, [typedMessage]);

  const handleSendMessage = async () => {
    if (!currentUser || !activeInterlocutorId) return;
    if (!typedMessage.trim() && !attachingImage) return;

    await sendMessage(
      activeInterlocutorId,
      typedMessage.trim(),
      attachingImage || undefined,
      attachingImage ? "image" : undefined
    );

    setTypedMessage("");
    setAttachingImage(null);
    await syncMessages();
  };

  const handleAttachImagePreset = () => {
    const preset = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400";
    setAttachingImage(preset);
    alert("Preset tech attachment linked!");
  };

  const handleVoiceNoteSubmit = async () => {
    if (!currentUser || !activeInterlocutorId) return;
    // Simulate playable sample voice recording
    const voiceSample = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
    await sendMessage(activeInterlocutorId, "Voice note broadcast", voiceSample, "voice");
    alert("Simulated voice note published successfully inside direct chat!");
    await syncMessages();
  };

  const handleMessageReaction = (msgId: string, emoji: string) => {
    alert(`Reacted with ${emoji} to message.`);
    setReactionTargetMessageId(null);
  };

  return (
    <div className="bg-[#181C24] border border-[#1F2531] rounded-3xl overflow-hidden shadow-2xl h-[75vh] flex">
      {/* Users Chat list */}
      <div className="w-1/3 border-r border-[#1F2531] flex flex-col bg-[#0F1115]/45">
        <div className="p-4 border-b border-[#1F2531]">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">Direct Channels</h3>
          <p className="text-[10px] text-slate-400">Select active partner thread</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {users.map((usr) => {
            if (usr.id === currentUser?.id) return null;
            const isSelected = usr.id === activeInterlocutorId;

            return (
              <div
                key={usr.id}
                onClick={() => setActiveInterlocutorId(usr.id)}
                className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition ${
                  isSelected
                    ? "bg-[#7C3AED]/15 border border-[#7C3AED]/20"
                    : "hover:bg-[#1E2532]/30 border border-transparent"
                }`}
              >
                <div className="relative">
                  <img
                    src={usr.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#181C24]" />
                </div>

                <div className="hidden md:block flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white truncate block">@{usr.username}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">{usr.fullName}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main chat log Area */}
      <div className="flex-1 flex flex-col justify-between bg-gradient-to-b from-[#181C24] to-[#0F1115]">
        {activeInterlocutor ? (
          <>
            {/* Active chat header */}
            <div className="p-4 border-b border-[#1F2531] flex items-center justify-between bg-[#181C24] z-10">
              <div className="flex items-center space-x-3">
                <img
                  src={activeInterlocutor.avatar}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#7C3AED]"
                />
                <div>
                  <h4 className="font-extrabold text-white text-xs">@{activeInterlocutor.username}</h4>
                  <span className="text-[9px] text-[#22C55E]">● Online status active</span>
                </div>
              </div>
            </div>

            {/* Message lines frame */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} relative`}>
                    <div
                      className={`max-w-xs rounded-2xl p-3 relative group transition shadow ${
                        isMine
                          ? "bg-[#7C3AED] text-white rounded-br-none"
                          : "bg-[#1E2532] text-slate-200 rounded-bl-none"
                      }`}
                      onClick={() => setReactionTargetMessageId(msg.id)}
                    >
                      {/* Attachments rendering */}
                      {msg.mediaType === "image" && msg.media && (
                        <img src={msg.media} alt="Shared attachment" className="rounded-lg mb-2 max-h-32 object-cover w-full" />
                      )}

                      {msg.mediaType === "voice" && msg.media && (
                        <div className="flex items-center space-x-2 bg-black/20 p-2 rounded-lg mb-1">
                          <Mic className="w-4 h-4 text-amber-300" />
                          <audio src={msg.media} controls className="w-32 text-xs" />
                        </div>
                      )}

                      <p className="text-xs font-normal leading-relaxed">{msg.content}</p>

                      {/* Display small seen indicators on mine */}
                      {isMine && (
                        <span className="text-[8px] text-indigo-200 flex justify-end items-center mt-1 space-x-0.5">
                          <span>Seen</span>
                          <CheckCheck className="w-2.5 h-2.5" />
                        </span>
                      )}

                      {/* Floating reaction picker prompt on hover */}
                      {reactionTargetMessageId === msg.id && (
                        <div className="absolute bottom-full mb-1 inset-x-0 bg-[#0F1115] border border-white/10 rounded-xl py-1 px-2 flex justify-around shadow-2xl z-20">
                          {["🔥", "👏", "💀", "❤️"].map((e) => (
                            <button key={e} onClick={() => handleMessageReaction(msg.id, e)} className="text-xs hover:scale-125 transition">
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicators */}
              {isTyping && (
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                  <Loader2 className="w-3 h-3 text-[#7C3AED] animate-spin" />
                  <span>@{activeInterlocutor.username} is drafting code...</span>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Message input elements */}
            <div className="p-4 border-t border-[#1F2531] bg-[#181C24]">
              {attachingImage && (
                <div className="p-2 bg-neutral-900 border border-[#7C3AED]/20 rounded-xl mb-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-300">Preset attachment linked. Ready to send!</span>
                  <button onClick={() => setAttachingImage(null)} className="text-[10px] text-red-400 uppercase font-semibold">Delete</button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAttachImagePreset}
                  className="p-2 hover:bg-[#1F2531] rounded-xl text-slate-400 hover:text-white"
                  title="Attach screenshot image"
                >
                  <Image className="w-5 h-5" />
                </button>

                <button
                  onClick={handleVoiceNoteSubmit}
                  className="p-2 hover:bg-[#1F2531] rounded-xl text-slate-400 hover:text-white"
                  title="Record direct sound pitch"
                >
                  <Mic className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  placeholder="Direct message code..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                  className="flex-1 bg-[#0F1115] border border-[#1F2531] text-white text-xs rounded-xl px-4 py-3 focus:outline-none"
                />

                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-[#7C3AED] hover:bg-[#9333EA] text-white rounded-xl transition"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <MessageSquare className="w-12 h-12 text-[#7C3AED] mb-2 animate-bounce" />
            <h4 className="font-extrabold text-sm uppercase">Select Direct Channel</h4>
            <p className="text-[10px] text-slate-500 max-w-xs mt-1">Vibe directly with creators, submit bug reviews, or scheduled synchronization codes privately.</p>
          </div>
        )}
      </div>
    </div>
  );
};
