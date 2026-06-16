import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Post, Comment } from "../types";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Volume2,
  Smile,
  Send,
  Flag,
  Pin,
  Sparkles,
  Award,
  Globe
} from "lucide-react";

export const FeedPanel: React.FC = () => {
  const {
    posts,
    currentUser,
    users,
    likePost,
    deletePost,
    addComment,
    likeComment,
    deleteComment,
    pinComment,
    t,
    submitReport,
    runAiCaption,
    runAiHashtags,
    language,
    setLanguage
  } = useApp();

  const [activeFeedTab, setActiveFeedTab] = useState<"all" | "confessions">("all");
  const [commentOpenPostId, setCommentOpenPostId] = useState<string | null>(null);
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [doubleTapAlertPostId, setDoubleTapAlertPostId] = useState<string | null>(null);
  const [bookmarkedList, setBookmarkedList] = useState<string[]>([]);
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [commentReplies, setCommentReplies] = useState<Record<string, string>>({}); // commentId -> text
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);

  // Filter posts based on active feed tab
  const filteredPosts = posts.filter((p) => {
    if (activeFeedTab === "confessions") return p.isConfession;
    return !p.isConfession;
  });

  const handleDoubleTap = async (postId: string) => {
    setDoubleTapAlertPostId(postId);
    await likePost(postId);
    setTimeout(() => {
      setDoubleTapAlertPostId(null);
    }, 1000);
  };

  const handleBookmark = (postId: string) => {
    if (bookmarkedList.includes(postId)) {
      setBookmarkedList(prev => prev.filter(id => id !== postId));
    } else {
      setBookmarkedList(prev => [...prev, postId]);
    }
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case "Happy": return "😊";
      case "Sad": return "😢";
      case "Excited": return "🔥";
      case "Motivated": return "⚡";
      case "Chill": return "🧘";
      default: return "🌟";
    }
  };

  const submitCommentText = async (postId: string) => {
    const text = newComments[postId] || "";
    if (!text.trim()) return;

    try {
      await addComment(postId, text);
      setNewComments(prev => ({ ...prev, [postId]: "" }));
    } catch (err: any) {
      alert(err.message || "Failed to post comment.");
    }
  };

  const submitReplyText = async (postId: string, parentCommentId: string) => {
    const text = commentReplies[parentCommentId] || "";
    if (!text.trim()) return;

    try {
      await addComment(postId, text, parentCommentId);
      setCommentReplies(prev => ({ ...prev, [parentCommentId]: "" }));
      setReplyingCommentId(null);
    } catch (err: any) {
      alert(err.message || "Reply fail.");
    }
  };

  const executePostReport = async () => {
    if (!reportingPost) return;
    await submitReport(reportingPost.id, "post", "Content violation reported by user.");
    alert("Post reported successfully. Our AI system will moderate within 10 minutes.");
    setReportingPost(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#181C24] p-4 border border-[#1F2531] rounded-2xl shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] p-2.5 rounded-xl text-white">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">InstaPro Global Feed</h2>
            <p className="text-xs text-slate-400">Instagram, Threads, & X unified portal</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end md:self-auto">
          {/* Multi Language selector */}
          <div className="flex items-center space-x-1 bg-[#0F1115] border border-[#1F2531] rounded-lg p-1">
            {(["en", "es", "fr", "de"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 text-[10px] font-bold rounded uppercase transition-colors ${
                  language === lang
                    ? "bg-[#7C3AED] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveFeedTab(activeFeedTab === "all" ? "confessions" : "all")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeFeedTab === "confessions"
                ? "bg-rose-600/30 text-rose-300 border border-rose-500/30"
                : "bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
            }`}
          >
            {activeFeedTab === "confessions" ? "🔒 Anonymous mode" : "📱 Standard mode"}
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      {filteredPosts.length === 0 ? (
        <div className="bg-[#181C24] border border-[#1F2531] rounded-2xl p-10 text-center text-slate-400">
          <Smile className="w-10 h-10 mx-auto text-slate-500 mb-2 animate-bounce" />
          <p>No active posts recorded for this tab yet.</p>
          <span className="text-xs text-slate-500">Be the first to publish a draft or scheduled memory!</span>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => {
            const author = users.find((u) => u.id === post.userId) || currentUser;
            const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
            const isBookmarked = bookmarkedList.includes(post.id);

            return (
              <div
                key={post.id}
                className="bg-[#181C24] border border-[#1F2531] rounded-2xl overflow-hidden shadow-2xl relative"
              >
                {/* Visual heart trigger trigger */}
                {doubleTapAlertPostId === post.id && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none">
                    <Heart className="w-24 h-24 text-rose-500 fill-rose-500 animate-[ping_0.5s_ease-in-out_infinite]" />
                  </div>
                )}

                {/* Card Header */}
                <div className="p-4 flex items-center justify-between border-b border-[#1F2531]">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.isConfession ? "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=100" : author?.avatar}
                      alt={post.isConfession ? "Anonymous" : author?.fullName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#7C3AED]"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-sm hover:underline cursor-pointer">
                          {post.isConfession ? "🤖 Anonymous Confession" : author?.fullName}
                        </span>
                        {!post.isConfession && author?.verified && (
                          <span className="bg-[#7C3AED] text-white p-0.5 rounded-full text-[8px] font-bold" title="Verified Creator">
                            ✓
                          </span>
                        )}
                        {post.mood && (
                          <span className="text-[10px] bg-[#1F2531] text-slate-300 px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <span>{getMoodEmoji(post.mood)}</span>
                            <span>{post.mood}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {post.location ? `${post.location} • ` : ""}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setReportingPost(post)}
                      className="p-1.5 hover:bg-[#1F2531] rounded-lg text-slate-400 hover:text-rose-400 transition"
                      title="Report Violation"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                    {currentUser?.id === post.userId && (
                      <button
                        onClick={() => deletePost(post.id)}
                        className="text-xs text-rose-500 font-semibold px-2 py-1 bg-rose-500/10 hover:bg-rose-500/30 rounded"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Body - Media Carousel / Voice player */}
                <div
                  className="bg-[#0F1115] relative aspect-video flex items-center justify-center overflow-hidden cursor-pointer"
                  onDoubleClick={() => handleDoubleTap(post.id)}
                >
                  {post.mediaType === "voice" ? (
                    <div className="p-8 w-full h-full flex flex-col justify-center items-center space-y-4 bg-gradient-to-br from-[#181C24] to-[#0F1115]">
                      <div className="p-4 bg-[#7C3AED]/20 border border-[#7C3AED]/30 rounded-full text-[#7C3AED] animate-pulse">
                        <Volume2 className="w-12 h-12" />
                      </div>
                      <span className="text-sm font-semibold text-white">{t.voiceNotes} Broadcast</span>
                      <audio controls src={post.voiceUrl} className="w-full max-w-sm rounded-lg opacity-90 border-2 border-[#1F2531]" />
                    </div>
                  ) : post.media && post.media.length > 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={post.media[0]}
                        alt="Feed memory"
                        className="w-full h-full object-cover"
                      />
                      {post.media.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/60 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white">
                          1 / {post.media.length} Slideshow
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-6 text-slate-500">
                      <Smile className="w-8 h-8 mx-auto opacity-40 mb-1" />
                      <span className="text-xs">Plain text confession card</span>
                    </div>
                  )}
                </div>

                {/* Interactions actions bar */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-slate-300">
                      <button
                        onClick={() => likePost(post.id)}
                        className={`flex items-center space-x-1.5 hover:text-white transition ${
                          isLiked ? "text-rose-500 hover:text-rose-600 font-bold" : ""
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                        <span className="text-xs font-semibold">{post.likes.length}</span>
                      </button>

                      <button
                        onClick={() => setCommentOpenPostId(commentOpenPostId === post.id ? null : post.id)}
                        className="flex items-center space-x-1.5 hover:text-white transition"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs font-semibold">Comments</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`text-slate-300 hover:text-white transition ${
                        isBookmarked ? "text-[#7C3AED] hover:text-[#9333EA]" : ""
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-[#7C3AED]" : ""}`} />
                    </button>
                  </div>

                  {/* Caption */}
                  <div>
                    <p className="text-xs text-slate-200 leading-relaxed font-normal">
                      <span className="font-bold mr-2 text-white">
                        {post.isConfession ? "anonymous" : `@${author?.username || "user"}`}
                      </span>
                      {post.caption}
                    </p>
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {post.hashtags.map((tag) => (
                          <span key={tag} className="text-[10px] text-[#7C3AED] hover:underline cursor-pointer">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comments Overlay Section */}
                  {commentOpenPostId === post.id && (
                    <div className="border-t border-[#1F2531] pt-4 mt-2 space-y-4">
                      {/* Add comment form */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder={`${t.writeComment} (AI Protected)`}
                          value={newComments[post.id] || ""}
                          onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") submitCommentText(post.id); }}
                          className="flex-1 bg-[#0F1115] border border-[#1F2531] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
                        />
                        <button
                          onClick={() => submitCommentText(post.id)}
                          className="bg-[#7C3AED] text-white p-2 rounded-xl hover:bg-[#9333EA] transition"
                        >
                          <Send className="w-4.5 h-4.5" />
                        </button>
                      </div>

                      {/* Display Comments list */}
                      <CommentsList
                        postId={post.id}
                        t={t}
                        currentUser={currentUser}
                        users={users}
                        likeComment={likeComment}
                        deleteComment={deleteComment}
                        pinComment={pinComment}
                        postOwnerId={post.userId}
                        replyingCommentId={replyingCommentId}
                        setReplyingCommentId={setReplyingCommentId}
                        commentReplies={commentReplies}
                        setCommentReplies={setCommentReplies}
                        submitReplyText={submitReplyText}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Flag post confirmation */}
      {reportingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181C24] border border-rose-500/20 max-w-sm w-full rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <Flag className="text-rose-500 w-5 h-5" />
              <span>Report Post Content</span>
            </h3>
            <p className="text-xs text-slate-300 mb-4 font-normal">
              Flag this upload to active administrate panels. Our Gemini AI Spam Moderations Engine will catalog items scoring over 80% automatically.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={executePostReport}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 text-sm font-semibold transition"
              >
                Confirm Flag
              </button>
              <button
                onClick={() => setReportingPost(null)}
                className="flex-1 bg-neutral-800 hover:bg-[#1F2531] text-slate-300 rounded-lg py-2 text-sm font-semibold transition"
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

// Nested Comments Auxiliary component
interface CommentsListProps {
  postId: string;
  t: any;
  currentUser: any;
  users: any[];
  likeComment: any;
  deleteComment: any;
  pinComment: any;
  postOwnerId: string;
  replyingCommentId: string | null;
  setReplyingCommentId: (id: string | null) => void;
  commentReplies: Record<string, string>;
  setCommentReplies: any;
  submitReplyText: (postId: string, pId: string) => void;
}

const CommentsList: React.FC<CommentsListProps> = ({
  postId,
  t,
  currentUser,
  users,
  likeComment,
  deleteComment,
  pinComment,
  postOwnerId,
  replyingCommentId,
  setReplyingCommentId,
  commentReplies,
  setCommentReplies,
  submitReplyText
}) => {
  const [comments, setComments] = useState<Comment[]>([]);

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/comments/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch (err) {
      console.warn("Error reloading comments list:", err);
    }
  };

  React.useEffect(() => {
    loadComments();
  }, [postId]);

  // Group top-level and nested comments
  const topLevel = comments.filter(c => !c.parentId);
  const repliesGroup = comments.filter(c => c.parentId);

  const handleToggleLike = async (commId: string) => {
    await likeComment(commId);
    await loadComments();
  };

  const handleTogglePin = async (commId: string, isPinned: boolean) => {
    await pinComment(commId, !isPinned);
    await loadComments();
  };

  const handleDelete = async (commId: string) => {
    await deleteComment(commId);
    await loadComments();
  };

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
      {topLevel.length === 0 ? (
        <p className="text-[10px] text-slate-500 italic text-center">No comments logged yet. Start discussions!</p>
      ) : (
        topLevel.map((comm) => {
          const author = users.find(u => u.id === comm.userId) || currentUser;
          const isLiked = currentUser ? comm.likes.includes(currentUser.id) : false;
          const myReplies = repliesGroup.filter(r => r.parentId === comm.id);

          return (
            <div key={comm.id} className="space-y-2 bg-[#0F1115]/50 p-2.5 rounded-xl border border-[#161C24]">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <img src={author?.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-100 text-xs cursor-pointer">@{author?.username}</span>
                      {comm.pinned && (
                        <span className="text-[9px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                          <Pin className="w-2.5 h-2.5 fill-yellow-500" />
                          <span>Pinned</span>
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-xs mt-0.5 font-normal leading-snug">{comm.content}</p>
                    <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-slate-500 font-medium">
                      <span>{new Date(comm.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <button onClick={() => setReplyingCommentId(replyingCommentId === comm.id ? null : comm.id)} className="hover:text-slate-300">
                        Reply
                      </button>
                      {currentUser?.id === postOwnerId && (
                        <button onClick={() => handleTogglePin(comm.id, comm.pinned)} className="hover:text-amber-400">
                          {comm.pinned ? "Unpin" : "Pin"}
                        </button>
                      )}
                      {(currentUser?.id === comm.userId || currentUser?.id === postOwnerId) && (
                        <button onClick={() => handleDelete(comm.id)} className="text-rose-500 hover:text-rose-600">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <button onClick={() => handleToggleLike(comm.id)} className={`text-slate-500 hover:text-rose-500 transition flex items-center space-x-1 ${isLiked ? "text-rose-500" : ""}`}>
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                  <span className="text-[10px]">{comm.likes.length}</span>
                </button>
              </div>

              {/* Nested Replies tree list */}
              {myReplies.map((reply) => {
                const repAuthor = users.find(u => u.id === reply.userId) || currentUser;
                return (
                  <div key={reply.id} className="ml-8 pl-3 border-l-2 border-[#1F2531] flex items-start justify-between py-1 bg-black/20 p-2 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <img src={repAuthor?.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <div>
                        <span className="font-semibold text-slate-200 text-[11px]">@{repAuthor?.username}</span>
                        <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Inline reply edit pane */}
              {replyingCommentId === comm.id && (
                <div className="ml-8 mt-2 flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={commentReplies[comm.id] || ""}
                    onChange={(e) => setCommentReplies((prev: any) => ({ ...prev, [comm.id]: e.target.value }))}
                    className="flex-1 bg-black border border-[#1F2531] text-white text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-none"
                  />
                  <button
                    onClick={() => { submitReplyText(postId, comm.id); loadComments(); }}
                    className="text-[11px] bg-[#7C3AED] text-white px-2.5 py-1.5 rounded-lg font-semibold hover:bg-[#9333EA]"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
