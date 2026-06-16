import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Users, Terminal, Dumbbell, Gamepad, Film, Sparkles, Plus, Send } from "lucide-react";

export const CommunitiesFeed: React.FC = () => {
  const { communities, posts, currentUser, createPost, joinCommunity, users, likePost } = useApp();
  const [selectedComId, setSelectedComId] = useState<string>("c-coding");
  const [newPostText, setNewPostText] = useState("");
  const [newPostMedia, setNewPostMedia] = useState("");

  const activeRoom = communities.find(c => c.id === selectedComId) || communities[0];

  // Filter posts belonging to the community
  const communityPosts = posts.filter(p => p.communityId === selectedComId);

  const handleJoin = (comId: string) => {
    joinCommunity(comId);
    alert(`Joined the official ${communities.find(c => c.id === comId)?.name} room!`);
  };

  const submitCommunityPost = async () => {
    if (!newPostText.trim()) return;
    await createPost({
      caption: newPostText,
      media: newPostMedia ? [newPostMedia] : [],
      mediaType: newPostMedia ? "image" : "carousel",
      communityId: selectedComId,
      location: activeRoom.name + " Room"
    });
    setNewPostText("");
    setNewPostMedia("");
  };

  // Icon switcher helper
  const getRoomIcon = (iconName: string) => {
    switch (iconName) {
      case "Terminal": return <Terminal className="w-5 h-5 text-indigo-400" />;
      case "Dumbbell": return <Dumbbell className="w-5 h-5 text-emerald-400" />;
      case "Gamepad": return <Gamepad className="w-5 h-5 text-rose-400" />;
      case "Film": return <Film className="w-5 h-5 text-amber-400" />;
      default: return <Users className="w-5 h-5 text-[#7C3AED]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Communities rooms grid cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {communities.map((room) => {
          const isActive = room.id === selectedComId;
          return (
            <div
              key={room.id}
              onClick={() => setSelectedComId(room.id)}
              className={`p-4 rounded-3xl border cursor-pointer transition duration-150 ${
                isActive
                  ? "bg-[#7C3AED]/10 border-[#7C3AED] shadow-lg"
                  : "bg-[#181C24] border-[#1F2531] hover:bg-[#1E2532]/40"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-black/40 rounded-xl">
                  {getRoomIcon(room.icon)}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleJoin(room.id); }}
                  className="text-[10px] bg-[#7C3AED] hover:bg-[#9333EA] text-white px-2.5 py-1 rounded-full font-bold transition"
                >
                  Join Room
                </button>
              </div>
              <h3 className="font-extrabold text-white text-xs">{room.name}</h3>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{room.description}</p>
              <span className="text-[9px] text-indigo-300 font-semibold block mt-3 uppercase tracking-wider">{room.memberCount} Members connected</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Discussion post board */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-[#181C24] border border-[#1F2531] rounded-3xl p-4 shadow-xl">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3">Start Discussion in {activeRoom.name}</h3>
            <textarea
              placeholder="Post a query, link, or snippet to the community..."
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              className="w-full bg-[#0F1115] border border-[#1F2531] text-white text-xs p-3 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#7C3AED] mb-3 h-20 resize-none font-normal leading-relaxed"
            />
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Optional attached illustration image URL"
                value={newPostMedia}
                onChange={(e) => setNewPostMedia(e.target.value)}
                className="flex-1 bg-[#0F1115] border border-[#1F2531] text-white text-[10px] rounded-xl px-3 py-2 focus:outline-none"
              />
              <button
                onClick={submitCommunityPost}
                className="bg-[#7C3AED] hover:bg-[#9333EA] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit</span>
              </button>
            </div>
          </div>

          {/* List community posts */}
          <div className="space-y-4">
            {communityPosts.length === 0 ? (
              <div className="text-center p-10 bg-[#181C24] border border-[#1F2531] rounded-3xl text-slate-500 text-xs">
                Welcome! Be the first to start a conversation in the {activeRoom.name} topic circle!
              </div>
            ) : (
              communityPosts.map((p) => {
                const author = users.find(u => u.id === p.userId) || currentUser;
                return (
                  <div key={p.id} className="bg-[#181C24] border border-[#1F2531] rounded-3xl p-5 shadow-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <img src={author?.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <span className="font-bold text-xs text-white">@{author?.username}</span>
                        <span className="text-[9px] text-slate-500 block">Posted in community board</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-normal">{p.caption}</p>
                    {p.media && p.media.length > 0 && (
                      <img src={p.media[0]} alt="" className="rounded-xl mt-3 max-h-52 w-full object-cover border border-[#1F2531]" />
                    )}

                    <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-neutral-900">
                      <button onClick={() => likePost(p.id)} className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition text-xs">
                        <span>❤️</span>
                        <span>{p.likes.length}</span>
                      </button>
                      <span className="text-[10px] text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Community details / guidelines sidebar */}
        <div className="space-y-4">
          <div className="bg-[#181C24] border border-[#1F2531] rounded-3xl p-5 shadow">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-3">Guidelines</h3>
            <ul className="space-y-2.5 text-[10px] text-slate-300 leading-snug">
              <li className="flex items-center space-x-2">
                <span className="text-[#22C55E]">✓</span>
                <span>Maintain constructive technical input.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#22C55E]">✓</span>
                <span>Mark snippet blocks securely inside quotes.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#22C55E]">✓</span>
                <span>Violating content gets automatically flagged by Gemini moderations.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
