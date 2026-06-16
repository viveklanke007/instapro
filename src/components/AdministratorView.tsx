import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Shield, Users, FileText, Ban, CheckCircle, RefreshCcw, Activity } from "lucide-react";

export const AdministratorView: React.FC = () => {
  const { getAdminData, lockUserByAdmin } = useApp();
  const [metrics, setMetrics] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadMetrics = async () => {
    setRefreshing(true);
    try {
      const data = await getAdminData();
      if (data) {
        setMetrics(data.metrics);
        setReports(data.reports || []);
        setUsers(data.users || []);
      }
    } catch {
      console.warn("Failed to fetch administrative metrics.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleToggleLock = async (userId: string, isBlocked: boolean) => {
    await lockUserByAdmin(userId, !isBlocked);
    alert(isBlocked ? "User account unlocked!" : "User account locked securely by admin authority.");
    await loadMetrics();
  };

  const handleResolveReport = (reportId: string) => {
    alert("Infraction resolved. Content reviewed securely.");
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, resolved: true } : r));
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex items-center justify-between bg-[#181C24] p-4 border border-[#1F2531] rounded-2xl shadow">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#EF4444]/10 rounded-xl text-[#EF4444]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Administration Operations</h2>
            <p className="text-[10px] text-slate-400">InstaPro system metrics & content enforcement</p>
          </div>
        </div>

        <button
          onClick={loadMetrics}
          className="p-2 bg-[#0F1115] hover:bg-[#1E2532] rounded-xl text-slate-400 hover:text-white transition"
        >
          <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-[#181C24] border border-[#1F2531] p-4 rounded-2xl shadow">
            <span className="text-[10px] text-slate-400 block uppercase mb-1">DAU (Simulated)</span>
            <p className="text-xl font-extrabold text-indigo-400">{metrics.dau}</p>
          </div>
          <div className="bg-[#181C24] border border-[#1F2531] p-4 rounded-2xl shadow">
            <span className="text-[10px] text-slate-400 block uppercase mb-1">Total Users</span>
            <p className="text-xl font-extrabold text-white">{metrics.newUserCount}</p>
          </div>
          <div className="bg-[#181C24] border border-[#1F2531] p-4 rounded-2xl shadow">
            <span className="text-[10px] text-slate-400 block uppercase mb-1">Active Posts</span>
            <p className="text-xl font-extrabold text-white">{metrics.postCount}</p>
          </div>
          <div className="bg-[#181C24] border border-[#1F2531] p-4 rounded-2xl shadow">
            <span className="text-[10px] text-slate-400 block uppercase mb-1">Vertical Reels</span>
            <p className="text-xl font-extrabold text-white">{metrics.reelsCount}</p>
          </div>
          <div className="bg-[#181C24] border border-[#1F2531] p-4 rounded-2xl shadow">
            <span className="text-[10px] text-slate-400 block uppercase mb-1">Active Reports</span>
            <p className="text-xl font-extrabold text-rose-500">{metrics.reportsPending}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Account Controls list */}
        <div className="bg-[#181C24] border border-[#1F2531] rounded-3xl p-5 shadow lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-[#7C3AED]" />
            <span>Manage User Access Roles</span>
          </h3>

          <div className="space-y-3.5 divide-y divide-neutral-900">
            {users.map((usr) => (
              <div key={usr.id} className="flex items-center justify-between pt-3 first:pt-0">
                <div className="flex items-center space-x-3">
                  <img src={usr.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <span className="text-xs font-bold text-white block">@{usr.username}</span>
                    <span className="text-[10px] text-slate-400">Reputation index: {usr.reputation || 0}%</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {usr.isBlocked ? (
                    <button
                      onClick={() => handleToggleLock(usr.id, true)}
                      className="text-[10px] bg-red-600/20 text-red-300 hover:bg-red-600/40 border border-red-500/20 px-3 py-1 rounded-lg font-bold"
                    >
                      Blocked
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleLock(usr.id, false)}
                      className="text-[10px] bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/10 px-3 py-1 rounded-lg font-bold"
                    >
                      Active
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flagged Content Infractions reports list */}
        <div className="bg-[#181C24] border border-[#1F2531] rounded-3xl p-5 shadow space-y-4">
          <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-rose-500" />
            <span>Pending Guidelines Reports</span>
          </h3>

          <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
            {reports.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic text-center">No community guidelines violations reported.</p>
            ) : (
              reports.map((rep) => (
                <div key={rep.id} className="bg-[#0F1115] border border-[#161C24] p-3 rounded-2xl relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] bg-[#EF4444]/20 text-[#EF4444] px-2 py-0.5 rounded font-bold uppercase">{rep.type}</span>
                    {!rep.resolved && (
                      <button
                        onClick={() => handleResolveReport(rep.id)}
                        className="text-[9px] bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#22C55E] px-2 py-0.5 rounded transition"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 font-normal leading-relaxed">{rep.reason}</p>
                  <span className="text-[9px] text-slate-500 block mt-2">{new Date(rep.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
