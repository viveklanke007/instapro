import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { StoryTray } from "./components/StoryTray";
import { FeedPanel } from "./components/FeedPanel";
import { ReelsFeed } from "./components/ReelsFeed";
import { ProfilePanel } from "./components/ProfilePanel";
import { DirectChat } from "./components/DirectChat";
import { CommunitiesFeed } from "./components/CommunitiesFeed";
import { CreatePostPanel } from "./components/CreatePostPanel";
import { AdministratorView } from "./components/AdministratorView";
import { AuthPortal } from "./components/AuthPortal";
import {
  Home as HomeIcon,
  Film,
  Users,
  MessageCircle,
  PlusSquare,
  User,
  Shield,
  Bell,
  LogOut,
  Sparkles,
  TrendingUp,
  X,
  Target,
  Menu
} from "lucide-react";

const AppContent: React.FC = () => {
  const {
    currentUser,
    logout,
    notifications,
    users,
    triggerReferral,
    t
  } = useApp();

  const [currentView, setCurrentView] = useState<
    "Home" | "Reels" | "Communities" | "Messages" | "Create" | "Profile" | "Admin"
  >("Home");

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter unread notifications
  const unreadCount = notifications.length;

  const handleLogout = () => {
    logout();
    setCurrentView("Home");
  };

  const getUnreadDmsCount = () => {
    // Quick count simulation
    return 2;
  };

  const trendingTopics = [
    { tag: "typescript", posts: "12.4k developers" },
    { tag: "react19", posts: "8.1k craftsmans" },
    { tag: "vite_speed", posts: "4.5k engineers" },
    { tag: "ai_moderations", posts: "18.9k monitors" }
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0F1115] text-white flex items-center justify-center p-4">
        <AuthPortal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-white font-sans flex flex-col md:flex-row">
      {/* Sidebar for Desktop / Left Wing Nav */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[#181C24] border-r border-[#1F2531] p-6 shrink-0 h-screen sticky top-0 left-0">
        <div className="space-y-8">
          {/* Logo Frame */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black bg-gradient-to-r from-[#7C3AED] to-[#9333EA] bg-clip-text text-transparent tracking-tighter">
              InstaPro
            </span>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
          </div>

          {/* Nav list elements */}
          <nav className="space-y-1.5">
            <button
              onClick={() => { setCurrentView("Home"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                currentView === "Home"
                  ? "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/20"
              }`}
            >
              <div className="flex items-center space-x-3">
                <HomeIcon className="w-4 h-4" />
                <span>{t.home}</span>
              </div>
            </button>

            <button
              onClick={() => { setCurrentView("Reels"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                currentView === "Reels"
                  ? "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/20"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Film className="w-4 h-4" />
                <span>{t.reels}</span>
              </div>
            </button>

            <button
              onClick={() => { setCurrentView("Communities"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                currentView === "Communities"
                  ? "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/20"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4" />
                <span>Rooms</span>
              </div>
            </button>

            <button
              onClick={() => { setCurrentView("Messages"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                currentView === "Messages"
                  ? "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/20"
              }`}
            >
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-4 h-4" />
                <span>DMs</span>
              </div>
              <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                {getUnreadDmsCount()}
              </span>
            </button>

            <button
              onClick={() => { setCurrentView("Create"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                currentView === "Create"
                  ? "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/20"
              }`}
            >
              <div className="flex items-center space-x-3">
                <PlusSquare className="w-4 h-4" />
                <span>Create</span>
              </div>
            </button>

            <button
              onClick={() => { setCurrentView("Profile"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                currentView === "Profile"
                  ? "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/20"
              }`}
            >
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4" />
                <span>{t.profile}</span>
              </div>
            </button>

            {/* Admin trigger (locks view when not role: 'admin') */}
            {currentUser.role === "admin" && (
              <button
                onClick={() => { setCurrentView("Admin"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                  currentView === "Admin"
                    ? "bg-rose-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </div>
              </button>
            )}
          </nav>
        </div>

        {/* User Card under Sidebar footer */}
        <div className="space-y-4 pt-6 border-t border-[#1F2531]">
          <div className="flex items-center space-x-3">
            <img
              src={currentUser.avatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover border-2 border-[#7C3AED]"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate">@{currentUser.username}</span>
              <span className="text-[10px] text-slate-400">Rep Score: {currentUser.reputation}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-neutral-800/60 hover:bg-red-900/20 border border-neutral-700/40 hover:border-red-500/20 rounded-xl py-2.5 text-[10px] uppercase font-semibold text-slate-400 hover:text-rose-400 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between bg-[#181C24] border-b border-[#1F2531] px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-black bg-gradient-to-r from-[#7C3AED] to-[#9333EA] bg-clip-text text-transparent">InstaPro</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Notifications Trigger */}
          <button onClick={() => setNotifDropdownOpen(!notifDropdownOpen)} className="relative p-1.5 hover:bg-[#1F2531] rounded-lg">
            <Bell className="w-5 h-5 text-slate-300" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />}
          </button>

          {/* Burger menu */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1.5 hover:bg-[#1F2531] rounded-lg">
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </header>

      {/* Floating mobile drawer menu list */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-12 bg-[#181C24] border-b border-[#1F2531] p-4 flex flex-col space-y-2 z-40 shadow-xl">
          <button onClick={() => { setCurrentView("Home"); setMobileMenuOpen(false); }} className="py-2.5 px-4 rounded-xl text-left text-xs font-bold text-white hover:bg-[#1F2531]">Home feed</button>
          <button onClick={() => { setCurrentView("Reels"); setMobileMenuOpen(false); }} className="py-2.5 px-4 rounded-xl text-left text-xs font-bold text-white hover:bg-[#1F2531]">Reels</button>
          <button onClick={() => { setCurrentView("Communities"); setMobileMenuOpen(false); }} className="py-2.5 px-4 rounded-xl text-left text-xs font-bold text-white hover:bg-[#1F2531]">Rooms</button>
          <button onClick={() => { setCurrentView("Messages"); setMobileMenuOpen(false); }} className="py-2.5 px-4 rounded-xl text-left text-xs font-bold text-white hover:bg-[#1F2531]">DMs chat</button>
          <button onClick={() => { setCurrentView("Create"); setMobileMenuOpen(false); }} className="py-2.5 px-4 rounded-xl text-left text-xs font-bold text-white hover:bg-[#1F2531]">Create</button>
          <button onClick={() => { setCurrentView("Profile"); setMobileMenuOpen(false); }} className="py-2.5 px-4 rounded-xl text-left text-xs font-bold text-white hover:bg-[#1F2531]">My Profile</button>
          <button onClick={handleLogout} className="py-2.5 px-4 rounded-xl text-left text-xs font-bold text-rose-400 hover:bg-rose-950/20">Sign Out</button>
        </div>
      )}

      {/* Main Core Viewport Stage */}
      <main className="flex-1 min-w-0 flex flex-col lg:flex-row gap-6 p-4 md:p-6 lg:p-8">
        <div className="flex-1 max-w-4xl space-y-6">
          {/* Horizontal stories active tray */}
          {currentView === "Home" && <StoryTray />}

          {/* Active view selectors panel */}
          {currentView === "Home" && <FeedPanel />}
          {currentView === "Reels" && <ReelsFeed />}
          {currentView === "Communities" && <CommunitiesFeed />}
          {currentView === "Messages" && <DirectChat />}
          {currentView === "Create" && <CreatePostPanel />}
          {currentView === "Profile" && <ProfilePanel />}
          {currentView === "Admin" && <AdministratorView />}
        </div>

        {/* Right Sidebar Desktop Wing: Trending topics and smart AI Prompt widgets */}
        <aside className="hidden lg:block w-76 shrink-0 space-y-6">
          {/* Bell & Notifications block with dropdown */}
          <div className="bg-[#181C24] border border-[#1F2531] rounded-2xl p-4 relative shadow shadow-indigo-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-300">Live Notifications</span>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-1.5 hover:bg-[#1F2531] rounded-lg relative text-slate-300"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-[14px] h-[14px] bg-rose-500 rounded-full text-[8px] font-black text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {notifDropdownOpen && (
              <div className="absolute top-full mt-2 inset-x-0 bg-[#181C24] border border-[#1F2531] rounded-2xl p-3 shadow-2xl z-40 max-h-56 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-2">No alerts recorded.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2 hover:bg-[#0F1115] rounded-xl border border-transparent hover:border-white/5 flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-200 leading-normal font-medium">{n.content}</p>
                        <span className="text-[8px] text-slate-500 block">{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Trending custom Topics */}
          <div className="bg-[#181C24] border border-[#1F2531] rounded-2xl p-4.5 space-y-4 shadow.">
            <div className="flex items-center space-x-2 text-white">
              <TrendingUp className="w-4.5 h-4.5 text-[#7C3AED]" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">InstaPro Trends</h3>
            </div>

            <div className="space-y-3">
              {trendingTopics.map((topic, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#7C3AED] hover:underline cursor-pointer">#{topic.tag}</span>
                    <span className="text-[10px] text-slate-400 block">{topic.posts} discussing</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated Referral invite widget */}
          <div className="bg-gradient-to-tr from-[#181C24] to-[#12141a] border border-[#1F2531] rounded-2xl p-4.5 space-y-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
              <Target className="w-24 h-24 text-amber-400" />
            </div>
            <h4 className="text-xs font-bold text-amber-300">Invite & Multiplier Code</h4>
            <p className="text-[10px] text-slate-400 leading-normal font-normal">
              Acquire +5 verified status scores instantly for each engineer credential invited over local branches!
            </p>
            <button
              onClick={triggerReferral}
              className="w-full bg-[#1F2531] hover:bg-neutral-800 text-slate-200 py-2 rounded-xl text-[10px] font-bold transition border border-neutral-700/40"
            >
              Get Invite Code
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
