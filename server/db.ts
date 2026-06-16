import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data_store.json");

// Define TypeScript interfaces for our Database entities
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  coverBanner: string;
  bio: string;
  website: string;
  followers: string[]; // User IDs
  following: string[]; // User IDs
  verified: boolean;
  private: boolean;
  reputation: number; // 0-100
  achievements: string[]; // "Rising Creator", "Top Commenter", "Viral Post", "Verified Creator"
  reelsViewsCount: number;
  profileVisitsCount: number;
  referrals: number;
  language: "en" | "es" | "fr" | "de";
  isBlocked?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  media: string[]; // urls or base64
  mediaType: "image" | "video" | "carousel" | "voice";
  caption: string;
  hashtags: string[];
  mentions: string[];
  location: string;
  mood?: "Happy" | "Sad" | "Excited" | "Motivated" | "Chill";
  voiceUrl?: string; // For voice posts
  likes: string[]; // User IDs
  isConfession?: boolean; // For anonymous confession section
  isDraft?: boolean;
  scheduledFor?: string; // ISO String
  createdAt: string;
  communityId?: string; // If posted in a community room
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  likes: string[]; // User IDs
  pinned: boolean;
  parentId?: string; // For nested comments
}

export interface Story {
  id: string;
  userId: string;
  media: string;
  mediaType: "image" | "video";
  createdAt: string;
  expiresAt: string;
  views: string[]; // User IDs
  reactions: { userId: string; emoji: string }[];
  highlightId?: string; // Optional reference to highlights folder
}

export interface StoryHighlight {
  id: string;
  userId: string;
  title: string;
  cover: string;
  storyIds: string[];
}

export interface Reel {
  id: string;
  userId: string;
  videoUrl: string;
  caption: string;
  likes: string[];
  sharesCount: number;
  viewsCount: number;
  hashtags: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  media?: string;
  mediaType?: "image" | "video" | "voice";
  reactions: { userId: string; emoji: string }[];
  seen: boolean;
  createdAt: string;
}

export interface CommunityRoom {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  memberCount: number;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "message" | "reel_engagement" | "achievement";
  senderId?: string;
  receiverId: string;
  postId?: string;
  reelId?: string;
  message?: string;
  createdAt: string;
  read: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  type: "user" | "post" | "story" | "reel" | "comment";
  targetId: string;
  reason: string;
  createdAt: string;
  resolved: boolean;
}

export interface AppState {
  users: User[];
  posts: Post[];
  comments: Comment[];
  stories: Story[];
  storyHighlights: StoryHighlight[];
  reels: Reel[];
  messages: Message[];
  communities: CommunityRoom[];
  notifications: Notification[];
  reports: Report[];
}

const DEFAULT_USERS: User[] = [
  {
    id: "user-system",
    username: "instapro_guide",
    email: "admin@instapro.io",
    fullName: "InstaPro Official",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    coverBanner: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
    bio: "Welcome to InstaPro! Discover the ultimate developer social hub. Built with React and Node.js. Check achievements & reviews! 🌟",
    website: "https://instapro.io",
    followers: ["user-lex", "user-sofia"],
    following: ["user-lex", "user-sofia"],
    verified: true,
    private: false,
    reputation: 98,
    achievements: ["Verified Creator", "Rising Creator"],
    reelsViewsCount: 4200,
    profileVisitsCount: 1540,
    referrals: 5,
    language: "en"
  },
  {
    id: "user-lex",
    username: "lex_dev",
    email: "lex@example.com",
    fullName: "Lexington Coder",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    coverBanner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    bio: "Full-stack craftsman & AI explorer. Synthesized 2.5B parameter models. Always coding. #NextGen",
    website: "https://github.com/lex_dev",
    followers: ["user-sofia", "user-gamer"],
    following: ["user-system", "user-sofia"],
    verified: true,
    private: false,
    reputation: 92,
    achievements: ["Rising Creator", "Verified Creator"],
    reelsViewsCount: 1200,
    profileVisitsCount: 540,
    referrals: 2,
    language: "en"
  },
  {
    id: "user-sofia",
    username: "sofia_fit",
    email: "sofia@example.com",
    fullName: "Sofia Reynolds",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    coverBanner: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
    bio: "Daily motivation, custom nutrition programs, dynamic physical conditioning. #GetFitNow",
    website: "https://sofiafitness.com",
    followers: ["user-system", "user-lex", "user-gamer"],
    following: ["user-system", "user-lex"],
    verified: false,
    private: false,
    reputation: 85,
    achievements: ["Viral Post"],
    reelsViewsCount: 8900,
    profileVisitsCount: 1840,
    referrals: 11,
    language: "es"
  },
  {
    id: "user-gamer",
    username: "cyber_gamer",
    email: "gamer@example.com",
    fullName: "Marcus K.",
    avatar: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150",
    coverBanner: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800",
    bio: "Neon setups, custom liquid rigs, retro emulator engineering. Top comment or fail",
    website: "https://twitch.tv/cybergamer",
    followers: ["user-lex"],
    following: ["user-lex", "user-sofia"],
    verified: false,
    private: false,
    reputation: 74,
    achievements: ["Top Commenter"],
    reelsViewsCount: 410,
    profileVisitsCount: 110,
    referrals: 0,
    language: "de"
  }
];

const DEFAULT_COMMUNITIES: CommunityRoom[] = [
  { id: "c-coding", name: "Coding", slug: "coding", description: "Vibe with developer builds, TypeScript optimizations, and custom algorithms.", icon: "Terminal", memberCount: 1240 },
  { id: "c-fitness", name: "Fitness", slug: "fitness", description: "Track sets, heavy lifting, custom diet macros, and clean achievements.", icon: "Dumbbell", memberCount: 840 },
  { id: "c-gaming", name: "Gaming", slug: "gaming", description: "Share frames, custom desktop rigs, multiplayer clips, and retro roms.", icon: "Gamepad", memberCount: 2200 },
  { id: "c-movies", name: "Movies", slug: "movies", description: "Review latest films, indie screenwriting, vintage cinematography, and plot points.", icon: "Film", memberCount: 512 }
];

const DEFAULT_POSTS: Post[] = [
  {
    id: "post-1",
    userId: "user-lex",
    media: ["https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600"],
    mediaType: "image",
    caption: "Wired up this sleek new microservice logic in TypeScript! Clean code feels like art. What do you think? #coding #microservice #clean",
    hashtags: ["coding", "microservice", "clean"],
    mentions: [],
    location: "San Jose, CA",
    mood: "Excited",
    likes: ["user-system", "user-sofia"],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "post-2",
    userId: "user-sofia",
    media: [
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600"
    ],
    mediaType: "carousel",
    caption: "Early morning interval runs. Consistency always beats intensity over time! Take small steps today. 🏃‍♀️💪 #FitnessGoals #Motivated",
    hashtags: ["fitnessgoals", "motivated"],
    mentions: ["lex_dev"],
    location: "Gold's Gym",
    mood: "Motivated",
    likes: ["user-lex", "user-gamer"],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "post-3",
    userId: "user-gamer",
    media: ["https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=600"],
    mediaType: "image",
    caption: "Finally finished assembling my modular liquid-cooled gaming loop. The amber glowing neon accent blends perfectly. Next up: testing compiles and frame rates. Let get it!",
    hashtags: ["gaming", "pcsetup", "neon"],
    mentions: [],
    location: "Tech Bunker",
    mood: "Chill",
    likes: ["user-lex"],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "post-confession",
    userId: "user-gamer",
    media: [],
    mediaType: "image",
    caption: "Unfiltered confession: I spent 18 hours debugging a memory leak only to realize I had a recursive state call in my React mount logic. Send caffeine.",
    hashtags: ["confessions", "reactfail"],
    mentions: [],
    location: "Underworld",
    mood: "Sad",
    likes: ["user-lex", "user-sofia"],
    isConfession: true,
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString()
  },
  {
    id: "post-voice",
    userId: "user-lex",
    media: [],
    mediaType: "voice",
    caption: "Audio clip speaking on the future of Gemini 3.5 models and browser multi-agent systems.",
    hashtags: ["ai", "voice", "podcast"],
    mentions: [],
    location: "Studio",
    mood: "Chill",
    voiceUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // sample aud
    likes: ["user-sofia"],
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
  }
];

const DEFAULT_COMMENTS: Comment[] = [
  {
    id: "comm-1",
    postId: "post-1",
    userId: "user-sofia",
    content: "Looks super tidy Lex! What ORM did you use for indexing collections?",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    likes: ["user-lex"],
    pinned: true
  },
  {
    id: "comm-2",
    postId: "post-1",
    userId: "user-lex",
    content: "Thanks Sofia! I built a custom local-file mapping wrapper to save latency, actually!",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    likes: [],
    pinned: false,
    parentId: "comm-1"
  },
  {
    id: "comm-3",
    postId: "post-1",
    userId: "user-gamer",
    content: "Impressive logic format, very clean brackets indentation.",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    likes: [],
    pinned: false
  }
];

const DEFAULT_STORIES: Story[] = [
  {
    id: "story-1",
    userId: "user-lex",
    media: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600",
    mediaType: "image",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 22).toISOString(),
    views: ["user-sofia", "user-gamer"],
    reactions: [{ userId: "user-sofia", emoji: "🔥" }]
  },
  {
    id: "story-2",
    userId: "user-sofia",
    media: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600",
    mediaType: "image",
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 18).toISOString(),
    views: ["user-lex"],
    reactions: [{ userId: "user-lex", emoji: "👏" }]
  }
];

const DEFAULT_REELS: Reel[] = [
  {
    id: "reel-1",
    userId: "user-lex",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-34327-large.mp4",
    caption: "Late night refactor coding! 💻 Refactoring Express handlers into clean async controllers for high performance scalability. #typescript #backend #programming",
    likes: ["user-system", "user-sofia", "user-gamer"],
    sharesCount: 12,
    viewsCount: 1520,
    hashtags: ["typescript", "backend", "programming"],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "reel-2",
    userId: "user-sofia",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-doing-jumping-jacks-fitness-coach-40032-large.mp4",
    caption: "Quick 5-min full body active warm-up Routine! Try this before your next lift 🏋️‍♀️. Speed up your metabolic rate! #hiit #cardio #fitnessmotivation",
    likes: ["user-lex", "user-system"],
    sharesCount: 45,
    viewsCount: 3410,
    hashtags: ["hiit", "cardio", "fitnessmotivation"],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: "reel-3",
    userId: "user-gamer",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-video-gamer-playing-with-controller-39958-large.mp4",
    caption: "Practicing fast speed dashes on vintage retro emulator challenges. Hand coordination must be perfect! 🎮👾 #retrogamer #arcade #reflex",
    likes: ["user-lex"],
    sharesCount: 3,
    viewsCount: 780,
    hashtags: ["retrogamer", "arcade", "reflex"],
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

const DEFAULT_MESSAGES: Message[] = [
  {
    id: "msg-1",
    senderId: "user-lex",
    receiverId: "user-sofia",
    content: "Hey Sofia! Would love your input on that fitness tracker UI design I've been coding up.",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    reactions: [],
    seen: true
  },
  {
    id: "msg-2",
    senderId: "user-sofia",
    receiverId: "user-lex",
    content: "Oh absolutely Lex! Send over the Figma specs or running dev link, I can check the layout and metric charts.",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    reactions: [{ userId: "user-lex", emoji: "🔥" }],
    seen: true
  },
  {
    id: "msg-3",
    senderId: "user-lex",
    receiverId: "user-sofia",
    content: "Awesome, just deployed it! Let's schedule a brief voice sync tomorrow.",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    reactions: [],
    seen: false
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "like",
    senderId: "user-sofia",
    receiverId: "user-lex",
    postId: "post-1",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    read: false
  },
  {
    id: "notif-2",
    type: "comment",
    senderId: "user-sofia",
    receiverId: "user-lex",
    postId: "post-1",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    read: false
  },
  {
    id: "notif-3",
    type: "achievement",
    receiverId: "user-lex",
    message: "Congratulations! You have been awarded the 'Rising Creator' badge for outstanding coding feed engagement!",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false
  }
];

export class Database {
  private data: AppState;

  constructor() {
    this.data = {
      users: [...DEFAULT_USERS],
      posts: [...DEFAULT_POSTS],
      comments: [...DEFAULT_COMMENTS],
      stories: [...DEFAULT_STORIES],
      storyHighlights: [],
      reels: [...DEFAULT_REELS],
      messages: [...DEFAULT_MESSAGES],
      communities: [...DEFAULT_COMMUNITIES],
      notifications: [...DEFAULT_NOTIFICATIONS],
      reports: []
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        // Safely merge with default structures to prevent errors if elements aren't present
        this.data = {
          users: parsed.users || [...DEFAULT_USERS],
          posts: parsed.posts || [...DEFAULT_POSTS],
          comments: parsed.comments || [...DEFAULT_COMMENTS],
          stories: parsed.stories || [...DEFAULT_STORIES],
          storyHighlights: parsed.storyHighlights || [],
          reels: parsed.reels || [...DEFAULT_REELS],
          messages: parsed.messages || [...DEFAULT_MESSAGES],
          communities: parsed.communities || [...DEFAULT_COMMUNITIES],
          notifications: parsed.notifications || [...DEFAULT_NOTIFICATIONS],
          reports: parsed.reports || []
        };
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Failed to load local database, falling back to in-memory:", e);
    }
  }

  public save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save local database:", e);
    }
  }

  // Collection Accessors mimicking Mongoose queries
  public getUsers() { return this.data.users; }
  public getPosts() { return this.data.posts.filter(p => !p.isDraft && (!p.scheduledFor || new Date(p.scheduledFor) <= new Date())); }
  public getDrafts(userId: string) { return this.data.posts.filter(p => p.userId === userId && p.isDraft); }
  public getComments() { return this.data.comments; }
  public getStories() { return this.data.stories.filter(s => new Date(s.expiresAt) > new Date()); }
  public getReels() { return this.data.reels; }
  public getMessages() { return this.data.messages; }
  public getCommunities() { return this.data.communities; }
  public getNotifications() { return this.data.notifications; }
  public getReports() { return this.data.reports; }

  // CRUD actions for Users
  public findUserById(id: string) { return this.data.users.find(u => u.id === id); }
  public findUserByUsername(username: string) { return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase()); }
  public findUserByEmail(email: string) { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  public createUser(userData: Partial<User>): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      username: userData.username || "",
      email: userData.email || "",
      fullName: userData.fullName || userData.username || "InstaPro User",
      avatar: userData.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      coverBanner: userData.coverBanner || "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
      bio: userData.bio || "Crafting experiences on InstaPro.",
      website: userData.website || "",
      followers: [],
      following: [],
      verified: false,
      private: false,
      reputation: 60,
      achievements: ["Rising Creator"],
      reelsViewsCount: 0,
      profileVisitsCount: 0,
      referrals: 0,
      language: "en",
      ...userData
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }
  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // Posts Methods
  public findPostById(id: string) { return this.data.posts.find(p => p.id === id); }
  public createPost(postData: Partial<Post>): Post {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: postData.userId || "",
      media: postData.media || [],
      mediaType: postData.mediaType || "image",
      caption: postData.caption || "",
      hashtags: postData.hashtags || [],
      mentions: postData.mentions || [],
      location: postData.location || "Earth",
      mood: postData.mood,
      voiceUrl: postData.voiceUrl,
      likes: [],
      isConfession: postData.isConfession || false,
      isDraft: postData.isDraft || false,
      scheduledFor: postData.scheduledFor,
      createdAt: new Date().toISOString(),
      communityId: postData.communityId
    };
    this.data.posts.push(newPost);
    this.save();
    return newPost;
  }
  public updatePost(id: string, updates: Partial<Post>): Post | null {
    const idx = this.data.posts.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.posts[idx] = { ...this.data.posts[idx], ...updates };
    this.save();
    return this.data.posts[idx];
  }
  public deletePost(id: string): boolean {
    const originalLen = this.data.posts.length;
    this.data.posts = this.data.posts.filter(p => p.id !== id);
    if (this.data.posts.length !== originalLen) {
      this.data.comments = this.data.comments.filter(c => c.postId !== id);
      this.save();
      return true;
    }
    return false;
  }

  // Comments Methods
  public findCommentById(id: string) { return this.data.comments.find(c => c.id === id); }
  public createComment(commData: Partial<Comment>): Comment {
    const newComm: Comment = {
      id: `comm-${Date.now()}`,
      postId: commData.postId || "",
      userId: commData.userId || "",
      content: commData.content || "",
      createdAt: new Date().toISOString(),
      likes: [],
      pinned: false,
      parentId: commData.parentId
    };
    this.data.comments.push(newComm);
    this.save();
    return newComm;
  }
  public deleteComment(id: string): boolean {
    const len = this.data.comments.length;
    // Also delete replies
    this.data.comments = this.data.comments.filter(c => c.id !== id && c.parentId !== id);
    this.save();
    return this.data.comments.length !== len;
  }
  public updateComment(id: string, updates: Partial<Comment>): Comment | null {
    const idx = this.data.comments.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.comments[idx] = { ...this.data.comments[idx], ...updates };
    this.save();
    return this.data.comments[idx];
  }

  // Follow Actions
  public followUser(followerId: string, followingId: string): boolean {
    const follower = this.findUserById(followerId);
    const following = this.findUserById(followingId);
    if (!follower || !following) return false;

    if (!follower.following.includes(followingId)) {
      follower.following.push(followingId);
    }
    if (!following.followers.includes(followerId)) {
      following.followers.push(followerId);
    }
    this.save();
    return true;
  }
  public unfollowUser(followerId: string, followingId: string): boolean {
    const follower = this.findUserById(followerId);
    const following = this.findUserById(followingId);
    if (!follower || !following) return false;

    follower.following = follower.following.filter(id => id !== followingId);
    following.followers = following.followers.filter(id => id !== followerId);
    this.save();
    return true;
  }

  // Stories
  public createStory(userId: string, media: string, mediaType: "image" | "video"): Story {
    const newStory: Story = {
      id: `story-${Date.now()}`,
      userId,
      media,
      mediaType,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 24).toISOString(),
      views: [],
      reactions: []
    };
    this.data.stories.push(newStory);
    this.save();
    return newStory;
  }

  // Reels
  public createReel(userId: string, videoUrl: string, caption: string, hashtags: string[]): Reel {
    const newReel: Reel = {
      id: `reel-${Date.now()}`,
      userId,
      videoUrl,
      caption,
      likes: [],
      sharesCount: 0,
      viewsCount: 0,
      hashtags,
      createdAt: new Date().toISOString()
    };
    this.data.reels.push(newReel);
    this.save();
    return newReel;
  }
  public likeReel(reelId: string, userId: string): Reel | null {
    const reel = this.data.reels.find(r => r.id === reelId);
    if (!reel) return null;
    if (reel.likes.includes(userId)) {
      reel.likes = reel.likes.filter(id => id !== userId);
    } else {
      reel.likes.push(userId);
    }
    this.save();
    return reel;
  }

  // Messages
  public createMessage(senderId: string, receiverId: string, content: string, media?: string, mediaType?: "image" | "video" | "voice"): Message {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId,
      receiverId,
      content,
      media,
      mediaType,
      reactions: [],
      seen: false,
      createdAt: new Date().toISOString()
    };
    this.data.messages.push(newMsg);
    this.save();
    return newMsg;
  }

  // Notifications
  public createNotification(notif: Partial<Notification>): Notification {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      type: notif.type || "like",
      senderId: notif.senderId,
      receiverId: notif.receiverId || "",
      postId: notif.postId,
      reelId: notif.reelId,
      message: notif.message || "",
      createdAt: new Date().toISOString(),
      read: false
    };
    this.data.notifications.push(newNotif);
    this.save();
    return newNotif;
  }

  // Reports
  public createReport(reporterId: string, type: "user" | "post" | "story" | "reel" | "comment", targetId: string, reason: string): Report {
    const newReport: Report = {
      id: `report-${Date.now()}`,
      reporterId,
      type,
      targetId,
      reason,
      createdAt: new Date().toISOString(),
      resolved: false
    };
    this.data.reports.push(newReport);
    this.save();
    return newReport;
  }
}

export const db = new Database();
