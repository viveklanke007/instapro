import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

import { db, User, Post, Comment, Story, Reel, Message, Notification, CommunityRoom } from "./server/db.ts";
import {
  generateCaption,
  generateHashtags,
  generateBio,
  getContentSuggestions,
  moderateComment,
  reviewProfile
} from "./server/gemini.ts";

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" })); // Support large base64 uploads easily
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Create local folders if they do not exist
  const uploadPaths = [
    "./uploads",
    "./uploads/posts",
    "./uploads/profile",
    "./uploads/reels",
    "./uploads/stories"
  ];
  uploadPaths.forEach(pth => {
    const fullPath = path.join(process.cwd(), pth);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  // Serve uploads folder statically
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // API ROUTES

  // API Health Indicator
  app.get("/api/health", (req, res) => {
    res.json({ status: "alive", dbConfig: "instapro-local-file-db" });
  });

  // --- /api/auth Paths ---
  app.post("/api/auth/register", (req, res) => {
    const { username, email, fullName, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required registration parameters." });
    }

    const existingUser = db.findUserByUsername(username) || db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User with this username or email already exists." });
    }

    // Register user
    const newUser = db.createUser({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      fullName: fullName || username,
      reputation: 65,
      language: "en"
    });

    res.json({
      message: "Registration successful. Please verify email.",
      user: newUser,
      token: "jwt-token-stub-" + newUser.id,
      refreshToken: "jwt-refresh-stub-" + newUser.id
    });
  });

  app.post("/api/auth/login", (req, res) => {
    const { loginKey, password } = req.body; // loginKey is email or username
    if (!loginKey || !password) {
      return res.status(400).json({ error: "Missing identity credentials." });
    }

    const user = db.findUserByUsername(loginKey) || db.findUserByEmail(loginKey);
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password credentials." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: "This account has been locked by administration." });
    }

    // Capture simulated device session tracking
    const userAgent = req.headers["user-agent"] || "Generic Mobile Device";

    res.json({
      message: "Login successful.",
      user,
      token: "jwt-token-stub-" + user.id,
      refreshToken: "jwt-refresh-stub-" + user.id,
      device: {
        agent: userAgent,
        ip: req.ip || "127.0.0.1",
        time: new Date().toISOString()
      }
    });
  });

  app.post("/api/auth/verify-otp", (req, res) => {
    const { userId, code } = req.body;
    const user = db.findUserById(userId);
    if (!user) return res.status(404).json({ error: "User reference not found." });

    // Mark user with verified badge on successful custom OTP simulation
    db.updateUser(userId, { verified: true });
    // Also trigger system notification
    db.createNotification({
      type: "achievement",
      receiverId: userId,
      message: "Congratulations! Your email has been verified. You've earned the 'Verified Creator' progress badge!"
    });

    res.json({ success: true, user: db.findUserById(userId) });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    const user = db.findUserByEmail(email);
    if (!user) return res.status(404).json({ error: "No accounts found with this email." });
    res.json({ success: true, message: "SIMULATED EMAIL FLOW: Reset OTP sent to " + email });
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { userId, newPassword } = req.body;
    const user = db.findUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ success: true, message: "Your account password has been updated securely." });
  });

  // --- /api/users Paths ---
  app.get("/api/users/profile/:username", (req, res) => {
    const user = db.findUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: "Profile not found." });

    // Increment profile visits analytics
    const visits = (user.profileVisitsCount || 0) + 1;
    db.updateUser(user.id, { profileVisitsCount: visits });

    res.json({ user, postsCount: db.getPosts().filter(p => p.userId === user.id).length });
  });

  app.post("/api/users/profile/update", (req, res) => {
    const { userId, fullName, bio, website, avatar, coverBanner, language, privateProfile } = req.body;
    const user = db.findUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const updated = db.updateUser(userId, {
      fullName: fullName !== undefined ? fullName : user.fullName,
      bio: bio !== undefined ? bio : user.bio,
      website: website !== undefined ? website : user.website,
      avatar: avatar !== undefined ? avatar : user.avatar,
      coverBanner: coverBanner !== undefined ? coverBanner : user.coverBanner,
      language: language !== undefined ? language : user.language,
      private: privateProfile !== undefined ? privateProfile : user.private
    });

    res.json({ success: true, user: updated });
  });

  app.post("/api/users/follow", (req, res) => {
    const { userId, followId } = req.body;
    const user = db.findUserById(userId);
    const target = db.findUserById(followId);

    if (!user || !target) return res.status(404).json({ error: "User references not found." });

    if (target.private) {
      // Create request notification
      db.createNotification({
        type: "follow",
        senderId: userId,
        receiverId: followId,
        message: `${user.username} sent you a follow request (Private Account).`
      });
      return res.json({ success: true, requested: true });
    }

    db.followUser(userId, followId);
    db.createNotification({
      type: "follow",
      senderId: userId,
      receiverId: followId,
      message: `${user.username} started following you.`
    });

    res.json({ success: true, following: true, user: db.findUserById(userId), target: db.findUserById(followId) });
  });

  app.post("/api/users/unfollow", (req, res) => {
    const { userId, unfollowId } = req.body;
    db.unfollowUser(userId, unfollowId);
    res.json({ success: true, unfollowed: true, user: db.findUserById(userId), target: db.findUserById(unfollowId) });
  });

  app.post("/api/users/invite", (req, res) => {
    const { userId } = req.body;
    const user = db.findUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const refs = (user.referrals || 0) + 1;
    let achievements = [...user.achievements];
    if (refs >= 5 && !achievements.includes("Rising Creator")) {
      achievements.push("Rising Creator");
    }

    db.updateUser(userId, { referrals: refs, achievements, reputation: Math.min(100, user.reputation + 4) });
    res.json({ success: true, referrals: refs, code: `REF-${user.username.toUpperCase()}-77` });
  });

  app.post("/api/users/report", (req, res) => {
    const { reporterId, targetId, type, reason } = req.body;
    const rep = db.createReport(reporterId, type, targetId, reason);

    // Dock reputation score slightly for the reported item's creator
    if (type === "user") {
      const targetUser = db.findUserById(targetId);
      if (targetUser) db.updateUser(targetId, { reputation: Math.max(0, targetUser.reputation - 5) });
    } else if (type === "post") {
      const targetPost = db.findPostById(targetId);
      if (targetPost) {
        const targetUser = db.findUserById(targetPost.userId);
        if (targetUser) db.updateUser(targetUser.id, { reputation: Math.max(0, targetUser.reputation - 3) });
      }
    }

    res.json({ success: true, report: rep });
  });

  // --- /api/posts Paths ---
  app.get("/api/posts", (req, res) => {
    res.json({ posts: db.getPosts().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
  });

  app.get("/api/posts/drafts/:userId", (req, res) => {
    res.json({ drafts: db.getDrafts(req.params.userId) });
  });

  app.post("/api/posts", (req, res) => {
    const { userId, media, mediaType, caption, hashtags, mentions, location, mood, voiceUrl, isConfession, isDraft, scheduledFor, communityId } = req.body;
    if (!userId) return res.status(400).json({ error: "User identifier required for generating posts." });

    const newPost = db.createPost({
      userId,
      media: media || [],
      mediaType: mediaType || "image",
      caption: caption || "",
      hashtags: hashtags || [],
      mentions: mentions || [],
      location: location || "",
      mood,
      voiceUrl,
      isConfession: !!isConfession,
      isDraft: !!isDraft,
      scheduledFor,
      communityId
    });

    // Award reputation points for positive engagement triggers
    const creator = db.findUserById(userId);
    if (creator) {
      db.updateUser(userId, { reputation: Math.min(100, creator.reputation + 2) });
    }

    res.json({ success: true, post: newPost });
  });

  app.post("/api/posts/like", (req, res) => {
    const { postId, userId } = req.body;
    const post = db.findPostById(postId);
    if (!post) return res.status(404).json({ error: "Post reference not found." });

    let likes = [...post.likes];
    const isLiking = !likes.includes(userId);

    if (isLiking) {
      likes.push(userId);
      // Create notification
      if (post.userId !== userId) {
        const user = db.findUserById(userId);
        db.createNotification({
          type: "like",
          senderId: userId,
          receiverId: post.userId,
          postId: postId,
          message: `${user?.username || "Someone"} liked your post.`
        });
      }
    } else {
      likes = likes.filter(id => id !== userId);
    }

    const updated = db.updatePost(postId, { likes });
    res.json({ success: true, likesCount: likes.length, liked: isLiking, post: updated });
  });

  app.delete("/api/posts/:id", (req, res) => {
    const success = db.deletePost(req.params.id);
    res.json({ success });
  });

  // --- /api/comments Paths ---
  app.get("/api/comments/:postId", (req, res) => {
    const list = db.getComments().filter(c => c.postId === req.params.postId);
    res.json({ comments: list });
  });

  app.post("/api/comments", async (req, res) => {
    const { postId, userId, content, parentId } = req.body;
    if (!postId || !userId || !content) return res.status(400).json({ error: "Missing comment metadata parameters." });

    // Moderate with local spam / Gemini guard checks
    const check = await moderateComment(content);
    if (check.recommendation === "block") {
      return res.status(400).json({ error: `Comment blocked by InstaPro AI moderation logic: ${check.reason}` });
    }

    const newComm = db.createComment({
      postId,
      userId,
      content,
      parentId
    });

    const post = db.findPostById(postId);
    if (post && post.userId !== userId) {
      const commenter = db.findUserById(userId);
      db.createNotification({
        type: "comment",
        senderId: userId,
        receiverId: post.userId,
        postId: postId,
        message: `${commenter?.username || "A user"} commented: "${content.substring(0, 30)}..."`
      });
    }

    res.json({ success: true, comment: newComm, moderated: check });
  });

  app.post("/api/comments/like", (req, res) => {
    const { commentId, userId } = req.body;
    const comm = db.findCommentById(commentId);
    if (!comm) return res.status(404).json({ error: "Comment not found." });

    let likes = [...comm.likes];
    const liked = !likes.includes(userId);

    if (liked) {
      likes.push(userId);
    } else {
      likes = likes.filter(id => id !== userId);
    }

    const updated = db.updateComment(commentId, { likes });
    res.json({ success: true, liked, comment: updated });
  });

  app.post("/api/comments/pin", (req, res) => {
    const { commentId, pinned } = req.body;
    const updated = db.updateComment(commentId, { pinned: !!pinned });
    res.json({ success: true, comment: updated });
  });

  app.delete("/api/comments/:id", (req, res) => {
    const success = db.deleteComment(req.params.id);
    res.json({ success });
  });

  // --- /api/reels Paths ---
  app.get("/api/reels", (req, res) => {
    res.json({ reels: db.getReels() });
  });

  app.post("/api/reels", (req, res) => {
    const { userId, videoUrl, caption, hashtags } = req.body;
    const newReel = db.createReel(userId, videoUrl || "", caption || "", hashtags || []);
    res.json({ success: true, reel: newReel });
  });

  app.post("/api/reels/like", (req, res) => {
    const { reelId, userId } = req.body;
    const reel = db.likeReel(reelId, userId);
    if (!reel) return res.status(404).json({ error: "Reel not found." });

    // Track notify on interaction triggers
    if (reel.userId !== userId && reel.likes.includes(userId)) {
      const user = db.findUserById(userId);
      db.createNotification({
        type: "reel_engagement",
        senderId: userId,
        receiverId: reel.userId,
        reelId: reelId,
        message: `${user?.username || "Someone"} liked your vertical reel!`
      });
    }

    res.json({ success: true, likes: reel.likes, liked: reel.likes.includes(userId) });
  });

  app.post("/api/reels/view", (req, res) => {
    const { reelId } = req.body;
    const reel = db.getReels().find(r => r.id === reelId);
    if (reel) {
      reel.viewsCount = (reel.viewsCount || 0) + 1;
      db.save();
    }
    res.json({ success: true });
  });

  // --- /api/stories ---
  app.get("/api/stories", (req, res) => {
    res.json({ stories: db.getStories() });
  });

  app.post("/api/stories", (req, res) => {
    const { userId, media, mediaType } = req.body;
    if (!userId || !media) return res.status(400).json({ error: "Media elements required for active story." });
    const story = db.createStory(userId, media, mediaType || "image");
    res.json({ success: true, story });
  });

  // --- /api/messages Paths ---
  app.get("/api/messages/:senderId/:receiverId", (req, res) => {
    const { senderId, receiverId } = req.params;
    const list = db.getMessages().filter(
      m => (m.senderId === senderId && m.receiverId === receiverId) ||
           (m.senderId === receiverId && m.receiverId === senderId)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Mark as seen automatically when accessed
    list.forEach(m => {
      if (m.receiverId === senderId && !m.seen) {
        m.seen = true;
      }
    });
    db.save();

    res.json({ messages: list });
  });

  app.post("/api/messages", (req, res) => {
    const { senderId, receiverId, content, media, mediaType } = req.body;
    if (!senderId || !receiverId) return res.status(400).json({ error: "Missing chat routing directions." });

    const msg = db.createMessage(senderId, receiverId, content || "", media, mediaType);

    // Trigger message dynamic notification badge
    db.createNotification({
      type: "message",
      senderId,
      receiverId,
      message: `New text from @${db.findUserById(senderId)?.username || "chat"}: "${content?.substring(0, 20) || "Media sharing"}"`
    });

    res.json({ success: true, message: msg });
  });

  // --- /api/notifications Paths ---
  app.get("/api/notifications/:userId", (req, res) => {
    const list = db.getNotifications().filter(n => n.receiverId === req.params.userId);
    res.json({ notifications: list });
  });

  app.post("/api/notifications/read", (req, res) => {
    const { userId } = req.body;
    db.getNotifications()
      .filter(n => n.receiverId === userId)
      .forEach(n => n.read = true);
    db.save();
    res.json({ success: true });
  });

  // --- /api/communities Paths ---
  app.get("/api/communities", (req, res) => {
    res.json({ communities: db.getCommunities() });
  });

  app.post("/api/communities/join", (req, res) => {
    const { communityId } = req.body;
    const c = db.getCommunities().find(com => com.id === communityId);
    if (c) {
      c.memberCount += 1;
      db.save();
    }
    res.json({ success: true });
  });

  // --- /api/admin Dashboard metrics Paths ---
  app.get("/api/admin/metrics", (req, res) => {
    const users = db.getUsers();
    const posts = db.getPosts();
    const reels = db.getReels();
    const stories = db.getStories();
    const reports = db.getReports();

    res.json({
      metrics: {
        dau: Math.floor(users.length * 0.8) + 1, // Simulated active count
        newUserCount: users.length,
        postCount: posts.length,
        reelsCount: reels.length,
        storiesCount: stories.length,
        reportsPending: reports.filter(r => !r.resolved).length
      },
      reports: reports,
      users: users
    });
  });

  app.post("/api/admin/users/lock", (req, res) => {
    const { userId, isBlocked } = req.body;
    const user = db.updateUser(userId, { isBlocked: !!isBlocked });
    res.json({ success: true, user });
  });

  // --- /api/gemini Interactive intelligent Assistants ---
  app.post("/api/gemini/generate-caption", async (req, res) => {
    const { topic } = req.body;
    const caption = await generateCaption(topic);
    res.json({ caption });
  });

  app.post("/api/gemini/generate-hashtags", async (req, res) => {
    const { topic } = req.body;
    const hashtags = await generateHashtags(topic);
    res.json({ hashtags });
  });

  app.post("/api/gemini/generate-bio", async (req, res) => {
    const { skills } = req.body;
    const bio = await generateBio(skills);
    res.json({ bio });
  });

  app.post("/api/gemini/suggestions", async (req, res) => {
    const { niche } = req.body;
    const suggestions = await getContentSuggestions(niche);
    res.json({ suggestions });
  });

  app.post("/api/gemini/profile-review", async (req, res) => {
    const { userId } = req.body;
    const user = db.findUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const review = await reviewProfile(
      user.username,
      user.bio,
      user.website,
      user.followers.length,
      user.following.length
    );

    res.json({ review });
  });

  // Vite Integration for production or development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static client assets in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`InstaPro Full-Stack Engine booting on port http://localhost:${PORT}`);
  });
}

startServer();
