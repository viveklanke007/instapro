import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Post, Comment, Story, Reel, Message, Notification, CommunityRoom, TRANSLATIONS } from "../types";

interface AppContextType {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  reels: Reel[];
  stories: Story[];
  communities: CommunityRoom[];
  notifications: Notification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: "en" | "es" | "fr" | "de";
  setLanguage: (lang: "en" | "es" | "fr" | "de") => void;
  t: typeof TRANSLATIONS["en"];
  loading: boolean;
  refreshAll: () => Promise<void>;
  login: (usernameOrEmail: string) => Promise<User>;
  register: (username: string, email: string, fullName: string) => Promise<User>;
  logout: () => void;
  verifyOtp: (code: string) => Promise<boolean>;
  updateProfile: (updatedData: Partial<User>) => Promise<void>;
  createPost: (postData: Partial<Post>) => Promise<Post>;
  likePost: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<boolean>;
  addComment: (postId: string, content: string, parentId?: string) => Promise<Comment>;
  likeComment: (commentId: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  pinComment: (commentId: string, pinned: boolean) => Promise<void>;
  followUser: (targetId: string) => Promise<void>;
  unfollowUser: (targetId: string) => Promise<void>;
  createStory: (media: string, mediaType: "image" | "video") => Promise<void>;
  createReel: (videoUrl: string, caption: string, hashtags: string[]) => Promise<void>;
  likeReel: (reelId: string) => Promise<void>;
  viewReel: (reelId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string, media?: string, mediaType?: "image" | "video" | "voice") => Promise<void>;
  joinCommunity: (communityId: string) => Promise<void>;
  submitReport: (targetId: string, type: "user" | "post" | "story" | "reel" | "comment", reason: string) => Promise<void>;
  triggerReferral: () => Promise<void>;
  runAiCaption: (topic: string) => Promise<string>;
  runAiHashtags: (topic: string) => Promise<string[]>;
  runAiBio: (skills: string) => Promise<string>;
  runAiSuggestions: (niche: string) => Promise<string[]>;
  runAiProfileReview: () => Promise<any>;
  // Dev / Admin metrics
  getAdminData: () => Promise<any>;
  lockUserByAdmin: (userId: string, targetBlocked: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [communities, setCommunities] = useState<CommunityRoom[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [language, setLanguage] = useState<"en" | "es" | "fr" | "de">("en");
  const [loading, setLoading] = useState<boolean>(true);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Retrieve stable state on component mount
  useEffect(() => {
    async function init() {
      await refreshAll();
      // Select lex_dev by default so user can immediately use the app with preloaded realistic feed
      try {
        const res = await fetch("/api/users/profile/lex_dev");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          if (data.user.language) setLanguage(data.user.language);
        }
      } catch (err) {
        console.error("Initiation session lookup failure:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Set up periodic sync (simulating socket.io seen / typing / notification pushes)
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      syncNotifications();
    }, 60000); // sync every 60s
    return () => clearInterval(interval);
  }, [currentUser]);

  const refreshAll = async () => {
    try {
      const pRes = await fetch("/api/posts");
      if (pRes.ok) {
        const data = await pRes.json();
        setPosts(data.posts);
      }

      const rRes = await fetch("/api/reels");
      if (rRes.ok) {
        const data = await rRes.json();
        setReels(data.reels);
      }

      const sRes = await fetch("/api/stories");
      if (sRes.ok) {
        const data = await sRes.json();
        setStories(data.stories);
      }

      const cRes = await fetch("/api/communities");
      if (cRes.ok) {
        const data = await cRes.json();
        setCommunities(data.communities);
      }

      // Refresh registered users dynamically
      const adminRes = await fetch("/api/admin/metrics");
      if (adminRes.ok) {
        const data = await adminRes.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.warn("REST sync failure:", err);
    }
  };

  const syncNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/notifications/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.warn("Notifications check failed:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      syncNotifications();
    }
  }, [currentUser]);

  const login = async (usernameOrEmail: string): Promise<User> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginKey: usernameOrEmail, password: "secure-dummy-password" })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login returned an error.");
    setCurrentUser(data.user);
    if (data.user.language) setLanguage(data.user.language);
    await refreshAll();
    return data.user;
  };

  const register = async (username: string, email: string, fullName: string): Promise<User> => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, fullName, password: "secure-dummy-password" })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration error occurred.");
    await refreshAll();
    return data.user;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveTab("home");
  };

  const verifyOtp = async (code: string): Promise<boolean> => {
    if (!currentUser) return false;
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, code })
    });
    if (res.ok) {
      const data = await res.json();
      setCurrentUser(data.user);
      await refreshAll();
      return true;
    }
    return false;
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const res = await fetch("/api/users/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, ...updatedData })
    });
    if (res.ok) {
      const data = await res.json();
      setCurrentUser(data.user);
      if (updatedData.language) setLanguage(updatedData.language);
      await refreshAll();
    }
  };

  const createPost = async (postData: Partial<Post>): Promise<Post> => {
    if (!currentUser) throw new Error("Anonymous postings are block paths.");
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, ...postData })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error compiling post details.");
    await refreshAll();
    return data.post;
  };

  const likePost = async (postId: string) => {
    if (!currentUser) return;
    const res = await fetch("/api/posts/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, userId: currentUser.id })
    });
    if (res.ok) {
      await refreshAll();
    }
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      await refreshAll();
      return true;
    }
    return false;
  };

  const addComment = async (postId: string, content: string, parentId?: string): Promise<Comment> => {
    if (!currentUser) throw new Error("Requires login state.");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, userId: currentUser.id, content, parentId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Comment flagged or moderate error.");
    await refreshAll();
    return data.comment;
  };

  const likeComment = async (commentId: string) => {
    if (!currentUser) return;
    await fetch("/api/comments/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, userId: currentUser.id })
    });
  };

  const deleteComment = async (commentId: string) => {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      await refreshAll();
    }
  };

  const pinComment = async (commentId: string, pinned: boolean) => {
    await fetch("/api/comments/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, pinned })
    });
  };

  const followUser = async (targetId: string) => {
    if (!currentUser) return;
    const res = await fetch("/api/users/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, followId: targetId })
    });
    if (res.ok) {
      const data = await res.json();
      setCurrentUser(data.user);
      await refreshAll();
    }
  };

  const unfollowUser = async (targetId: string) => {
    if (!currentUser) return;
    const res = await fetch("/api/users/unfollow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, unfollowId: targetId })
    });
    if (res.ok) {
      const data = await res.json();
      setCurrentUser(data.user);
      await refreshAll();
    }
  };

  const createStory = async (media: string, mediaType: "image" | "video") => {
    if (!currentUser) return;
    const res = await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, media, mediaType })
    });
    if (res.ok) {
      await refreshAll();
    }
  };

  const createReel = async (videoUrl: string, caption: string, hashtags: string[]) => {
    if (!currentUser) return;
    const res = await fetch("/api/reels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, videoUrl, caption, hashtags })
    });
    if (res.ok) {
      await refreshAll();
    }
  };

  const likeReel = async (reelId: string) => {
    if (!currentUser) return;
    const res = await fetch("/api/reels/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reelId, userId: currentUser.id })
    });
    if (res.ok) {
      await refreshAll();
    }
  };

  const viewReel = async (reelId: string) => {
    await fetch("/api/reels/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reelId })
    });
  };

  const sendMessage = async (receiverId: string, content: string, media?: string, mediaType?: "image" | "video" | "voice") => {
    if (!currentUser) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: currentUser.id, receiverId, content, media, mediaType })
    });
    if (res.ok) {
      await refreshAll();
    }
  };

  const joinCommunity = async (communityId: string) => {
    const res = await fetch("/api/communities/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ communityId })
    });
    if (res.ok) {
      await refreshAll();
    }
  };

  const submitReport = async (targetId: string, type: "user" | "post" | "story" | "reel" | "comment", reason: string) => {
    if (!currentUser) return;
    await fetch("/api/users/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reporterId: currentUser.id, targetId, type, reason })
    });
  };

  const triggerReferral = async () => {
    if (!currentUser) return;
    const res = await fetch("/api/users/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id })
    });
    if (res.ok) {
      const data = await res.json();
      setCurrentUser(prev => prev ? { ...prev, referrals: data.referrals } : null);
      await refreshAll();
    }
  };

  const runAiCaption = async (topic: string): Promise<string> => {
    const res = await fetch("/api/gemini/generate-caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });
    const data = await res.json();
    return data.caption || "";
  };

  const runAiHashtags = async (topic: string): Promise<string[]> => {
    const res = await fetch("/api/gemini/generate-hashtags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });
    const data = await res.json();
    return data.hashtags || [];
  };

  const runAiBio = async (skills: string): Promise<string> => {
    const res = await fetch("/api/gemini/generate-bio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills })
    });
    const data = await res.json();
    return data.bio || "";
  };

  const runAiSuggestions = async (niche: string): Promise<string[]> => {
    const res = await fetch("/api/gemini/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ niche })
    });
    const data = await res.json();
    return data.suggestions || [];
  };

  const runAiProfileReview = async (): Promise<any> => {
    if (!currentUser) return null;
    const res = await fetch("/api/gemini/profile-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id })
    });
    const data = await res.json();
    return data.review;
  };

  const getAdminData = async (): Promise<any> => {
    const res = await fetch("/api/admin/metrics");
    if (res.ok) {
      return await res.json();
    }
    return null;
  };

  const lockUserByAdmin = async (userId: string, targetBlocked: boolean) => {
    const res = await fetch("/api/admin/users/lock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isBlocked: targetBlocked })
    });
    if (res.ok) {
      await refreshAll();
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        posts,
        reels,
        stories,
        communities,
        notifications,
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        t,
        loading,
        refreshAll,
        login,
        register,
        logout,
        verifyOtp,
        updateProfile,
        createPost,
        likePost,
        deletePost,
        addComment,
        likeComment,
        deleteComment,
        pinComment,
        followUser,
        unfollowUser,
        createStory,
        createReel,
        likeReel,
        viewReel,
        sendMessage,
        joinCommunity,
        submitReport,
        triggerReferral,
        runAiCaption,
        runAiHashtags,
        runAiBio,
        runAiSuggestions,
        runAiProfileReview,
        getAdminData,
        lockUserByAdmin
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used inside the AppProvider scope.");
  }
  return context;
};
