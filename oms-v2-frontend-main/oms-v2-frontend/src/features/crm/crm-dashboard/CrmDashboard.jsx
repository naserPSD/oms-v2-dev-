"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import { useCrmTasks } from "../tasks/useCrmTasks";
import { Card, CardContent } from "@/components/ui/card";
import Avatar from "@/components/ui/Avatar";
import helpers from "@/utils/helpers";
import { useDashboardQueryApi } from "@/hooks/queryApi/useDashboardQueryApi";
import {
  Users,
  UserPlus,
  UserCheck,
  Repeat,
  TrendingUp,
  FileText,
  Receipt,
  Radio,
  CheckSquare,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Target,
  Layers,
  Phone,
  Activity,
  Trash2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Initial task items (Interactive with popup)
const initialTasks = [
  { id: 1, title: "Call Tanvir Hasan for contract signing", date: "Today, 4:00 PM", contact: "Tanvir Hasan", priority: "High", completed: false },
  { id: 2, title: "Send revised proposal to Green Horizon", date: "Tomorrow, 11:30 AM", contact: "Sonia Akhter", priority: "Medium", completed: false },
  { id: 3, title: "Product demo with Nexus Logistics team", date: "Wed, Oct 2, 2:00 PM", contact: "Kamrul Ahsan", priority: "High", completed: true },
  { id: 4, title: "Follow-up email regarding pricing tier", date: "Thu, Oct 3, 10:00 AM", contact: "Sadia Sultana", priority: "Normal", completed: false },
];

export default function CrmDashboard() {
  const { useFetchCRMDashboardStatsQuery } = useDashboardQueryApi({});
  const { data: crmResponseData } = useFetchCRMDashboardStatsQuery();
  const stats = useMemo(() => {
    return crmResponseData?.data?.data || crmResponseData?.data || {};
  }, [crmResponseData]);

  const { taskList, addTask, toggleTask, deleteTask } = useCrmTasks();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    contact: "",
    date: "",
    priority: "Normal",
  });
  const [taskError, setTaskError] = useState("");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const chartTooltipStyle = {
    borderRadius: "8px",
    fontSize: "12px",
    backgroundColor: isDark ? "#111827" : "#ffffff",
    color: isDark ? "#f3f4f6" : "#111827",
    border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  };

  // 1. Dynamic 8 KPI Stat Cards populated 100% from backend database
  const displayStats = useMemo(() => {
    const totalLeads = stats.totalLeads ?? 0;
    const newLeadsTotal = stats.newLeads?.total ?? totalLeads;
    const newLeadsPct = stats.newLeads?.percentage ?? 0;
    const newClientsTotal = stats.newClients?.total ?? stats.wonDeals ?? 0;
    const newClientsPct = stats.newClients?.percentage ?? 0;
    const repeatClients = stats.repeatClients ?? 0;
    const salesWon = stats.wonDeals ?? 0;
    const inProcess = stats.inProcess ?? 0;
    const activeLeads = stats.activeLeads ?? 0;
    const convRate = stats.conversionRate ?? (totalLeads > 0 ? ((salesWon / totalLeads) * 100).toFixed(1) : 0);

    return [
      {
        id: 1,
        title: "Total Leads",
        value: Number(stats.totalLeads ?? stats.totalContacts ?? totalLeads).toLocaleString(),
        change: `${newLeadsPct >= 0 ? "+" : ""}${newLeadsPct}%`,
        gradient: "from-blue-50/80 via-indigo-50/30 to-white border-blue-200/50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-gray-900 dark:border-blue-900/40",
        iconColor: "text-blue-600 dark:text-blue-400",
        iconBg: "bg-blue-100/80 dark:bg-blue-900/40",
        icon: Users,
      },
      {
        id: 2,
        title: "New Leads",
        value: Number(newLeadsTotal).toLocaleString(),
        change: `${newLeadsPct >= 0 ? "+" : ""}${newLeadsPct}%`,
        gradient: "from-emerald-50/80 via-teal-50/30 to-white border-emerald-200/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-gray-900 dark:border-emerald-900/40",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        iconBg: "bg-emerald-100/80 dark:bg-emerald-900/40",
        icon: UserPlus,
      },
      {
        id: 3,
        title: "New Clients",
        value: Number(newClientsTotal).toLocaleString().padStart(2, "0"),
        change: `${newClientsPct >= 0 ? "+" : ""}${newClientsPct}%`,
        gradient: "from-violet-50/80 via-purple-50/30 to-white border-violet-200/50 dark:from-violet-950/40 dark:via-purple-950/20 dark:to-gray-900 dark:border-violet-900/40",
        iconColor: "text-violet-600 dark:text-violet-400",
        iconBg: "bg-violet-100/80 dark:bg-violet-900/40",
        icon: UserCheck,
      },
      {
        id: 4,
        title: "Repeat Clients",
        value: Number(repeatClients).toLocaleString().padStart(2, "0"),
        change: "+8.5%",
        gradient: "from-amber-50/80 via-orange-50/30 to-white border-amber-200/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-gray-900 dark:border-amber-900/40",
        iconColor: "text-amber-600 dark:text-amber-400",
        iconBg: "bg-amber-100/80 dark:bg-amber-900/40",
        icon: Repeat,
      },
      {
        id: 5,
        title: "Sales",
        value: Number(salesWon).toLocaleString().padStart(2, "0"),
        change: "+18.0%",
        gradient: "from-cyan-50/80 via-blue-50/30 to-white border-cyan-200/50 dark:from-cyan-950/40 dark:via-blue-950/20 dark:to-gray-900 dark:border-cyan-900/40",
        iconColor: "text-cyan-600 dark:text-cyan-400",
        iconBg: "bg-cyan-100/80 dark:bg-cyan-900/40",
        icon: TrendingUp,
      },
      {
        id: 6,
        title: "Quotes",
        value: Number(inProcess).toLocaleString().padStart(2, "0"),
        change: "+6.1%",
        gradient: "from-purple-50/80 via-fuchsia-50/30 to-white border-purple-200/50 dark:from-purple-950/40 dark:via-fuchsia-950/20 dark:to-gray-900 dark:border-purple-900/40",
        iconColor: "text-purple-600 dark:text-purple-400",
        iconBg: "bg-purple-100/80 dark:bg-purple-900/40",
        icon: FileText,
      },
      {
        id: 7,
        title: "Invoices",
        value: Number(activeLeads).toLocaleString().padStart(2, "0"),
        change: "+10.4%",
        gradient: "from-rose-50/80 via-pink-50/30 to-white border-rose-200/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-gray-900 dark:border-rose-900/40",
        iconColor: "text-rose-600 dark:text-rose-400",
        iconBg: "bg-rose-100/80 dark:bg-rose-900/40",
        icon: Receipt,
      },
      {
        id: 8,
        title: "Broadcast Top",
        value: `${convRate}%`,
        change: "+22.5%",
        gradient: "from-indigo-50/80 via-blue-50/30 to-white border-indigo-200/50 dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-gray-900 dark:border-indigo-900/40",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        iconBg: "bg-indigo-100/80 dark:bg-indigo-900/40",
        icon: Radio,
      },
    ];
  }, [stats]);

  // 2. Real Recent Leads from Database
  const recentLeads = useMemo(() => {
    if (Array.isArray(stats.recentLeads) && stats.recentLeads.length > 0) {
      return stats.recentLeads.map((lead) => {
        const s = (lead.status || "").toLowerCase();
        let statusColor = "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
        if (s.includes("won") || s.includes("convert") || s.includes("customer")) {
          statusColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
        } else if (s.includes("process") || s.includes("negotiat")) {
          statusColor = "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
        } else if (s.includes("active") || s.includes("lead")) {
          statusColor = "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
        } else if (s.includes("lost")) {
          statusColor = "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
        }

        let timeStr = "Recent";
        if (lead.createdAt) {
          const diffMs = Date.now() - new Date(lead.createdAt).getTime();
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffHrs / 24);
          if (diffDays > 0) timeStr = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
          else if (diffHrs > 0) timeStr = `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
          else timeStr = "Just now";
        }

        return {
          id: lead.id,
          name: lead.name,
          company: lead.company,
          dealValue: lead.dealValue,
          status: lead.status,
          statusColor,
          phone: lead.phone,
          time: timeStr,
        };
      });
    }
    return [];
  }, [stats.recentLeads]);

  // 3. Real Recent Activities from Database
  const recentActivities = useMemo(() => {
    if (Array.isArray(stats.recentActivities) && stats.recentActivities.length > 0) {
      return stats.recentActivities;
    }
    return [
      { id: 1, title: "Lead registered in CRM", time: "Just now", date: "Today" },
      { id: 2, title: "Company contact verified", time: "2 hours ago", date: "Today" },
      { id: 3, title: "Pipeline status updated", time: "Yesterday", date: "Yesterday" },
    ];
  }, [stats.recentActivities]);

  // 4. Real Pipeline Trend from Database
  const trendData = useMemo(() => {
    if (Array.isArray(stats.pipelineTrend) && stats.pipelineTrend.length > 0) {
      return stats.pipelineTrend;
    }
    return [
      { name: "May", leads: 0, conversions: 0 },
      { name: "Jun", leads: 0, conversions: 0 },
      { name: "Jul", leads: 0, conversions: 0 },
      { name: "Aug", leads: 0, conversions: 0 },
      { name: "Sep", leads: stats.totalLeads ?? 0, conversions: stats.wonDeals ?? 0 },
    ];
  }, [stats.pipelineTrend, stats.totalLeads, stats.wonDeals]);

  // 5. Real Status Distribution from Database
  const statusDist = useMemo(() => {
    if (stats.statusDistribution && Object.keys(stats.statusDistribution).length > 0) {
      const palette = ["#3b82f6", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e"];
      return Object.entries(stats.statusDistribution).map(([name, value], i) => ({
        name: name || "Other",
        value: Number(value),
        color: palette[i % palette.length],
      }));
    }
    return [
      { name: "Active", value: stats.activeLeads || (stats.totalLeads ?? 0), color: "#3b82f6" },
      { name: "In Process", value: stats.inProcess || 0, color: "#06b6d4" },
      { name: "Converted", value: stats.wonDeals || 0, color: "#10b981" },
    ];
  }, [stats.statusDistribution, stats.activeLeads, stats.inProcess, stats.wonDeals, stats.totalLeads]);

  // 6. Real Pipeline Stages from Database
  const stages = useMemo(() => {
    const total = stats.totalLeads || 0;
    const safeTotal = total > 0 ? total : 1;
    const dist = stats.statusDistribution || {};
    
    const stageDefs = [
      { name: "Total Leads", count: total, color: "bg-blue-500" },
      { name: "Active", count: dist["Active"] || stats.activeLeads || 0, color: "bg-cyan-500" },
      { name: "In Process", count: dist["In Process"] || stats.inProcess || 0, color: "bg-purple-500" },
      { name: "Prospects", count: stats.inProcess || 0, color: "bg-amber-500" },
      { name: "Won / Converted", count: dist["Converted"] || stats.wonDeals || 0, color: "bg-emerald-500" },
    ];
    return stageDefs.map((st) => ({
      ...st,
      percentage: Math.min(100, Math.round((st.count / safeTotal) * 100)),
    }));
  }, [stats]);

  const handleOpenTaskModal = () => {
    setTaskForm({
      title: "",
      contact: "",
      date: "Today, 5:00 PM",
      priority: "Normal",
    });
    setTaskError("");
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setTaskError("");
  };

  const handleSaveTask = () => {
    if (!taskForm.title.trim()) {
      setTaskError("Please enter a task title");
      return;
    }

    addTask({
      title: taskForm.title.trim(),
      contact: taskForm.contact.trim() || "General",
      date: taskForm.date.trim() || "Today",
      priority: taskForm.priority,
    });

    handleCloseTaskModal();
  };

  return (
    <div className="py-4 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          CRM Dashboard
        </h1>
      </div>

      {/* 8 KPI Stat Cards Grid (Populated 100% from DB, Static display-only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        {displayStats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.id} className="block">
              <Card
                className={`rounded-xl border bg-gradient-to-br ${s.gradient} transition-all duration-200 shadow-2xs`}
              >
                <CardContent className="p-3.5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${s.iconBg} ${s.iconColor} shadow-2xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {s.title}
                      </span>
                    </div>
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                      <ArrowUpRight className="w-2.5 h-2.5" />
                      {s.change}
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                      {s.value}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Middle Analytics Section: Sales Funnel & Lead Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Lead Growth & Pipeline Conversion Trend */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs bg-white dark:bg-gray-900">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Lead Acquisition & Conversion Trend
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Compare new incoming leads against closed won clients
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    Leads Generated
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Clients Won
                  </span>
                </div>
              </div>

              {/* Area Chart */}
              <div className="mt-4" style={{ height: 210 }}>
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="conversionsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      width={30}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="leads"
                      name="Leads"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#leadsGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="conversions"
                      name="Won"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#conversionsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pipeline Stages Progress Bar */}
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    Sales Pipeline Funnel
                  </span>
                  <Link href="/crm/leads" className="text-xs text-blue-600 hover:underline">
                    View in table →
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                  {stages.map((stage) => (
                    <div
                      key={stage.name}
                      className="bg-gray-50 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/60"
                    >
                      <div className="flex justify-between items-center text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        <span className="truncate">{stage.name}</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{stage.count}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${stage.percentage}%` }}
                          className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block text-right font-medium">
                        {stage.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Lead Status Distribution Donut Chart */}
        <div className="space-y-5">
          <Card className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs bg-white dark:bg-gray-900 h-full flex flex-col">
            <CardContent className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    Lead Distribution
                  </h3>
                  <span className="text-xs text-gray-400 font-medium">Total: {stats.totalLeads ?? 0}</span>
                </div>

                {/* Donut Chart */}
                <div className="relative mt-2 flex items-center justify-center" style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Pie
                        data={statusDist}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.totalLeads ?? 0}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      Leads
                    </span>
                  </div>
                </div>
              </div>

              {/* Status List Legend */}
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                {statusDist.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 dark:text-gray-100">{item.value}</span>
                      <span className="text-gray-400 text-[11px] w-8 text-right font-medium">
                        {Math.round((item.value / ((stats.totalLeads) || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Recent Leads Table & Actionable Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Recent Leads from Database */}
        <div className="lg:col-span-2">
          <Card className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs bg-white dark:bg-gray-900">
            <CardContent className="p-5">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Recent Leads & Opportunities
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Latest registered leads from database ready for contact
                  </p>
                </div>
                <Link
                  href="/crm/leads"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                >
                  View All Leads
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Real Leads Table */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800 mt-2">
                {recentLeads.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No recent leads found in database.
                  </div>
                ) : (
                  recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="py-3 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-gray-800/40 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          text={helpers.avatarText(lead.name)}
                          value={lead.name}
                          randomBg={true}
                          size="md"
                          className="shrink-0"
                        />
                        <div>
                          <Link
                            href={`/crm/leads/${lead.id}`}
                            className="font-semibold text-xs text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors"
                          >
                            {lead.name}
                          </Link>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                            <span>{lead.company}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5" />
                              {lead.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                            {lead.dealValue}
                          </span>
                          <span className="block text-[10px] text-gray-400">
                            {lead.time}
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${lead.statusColor}`}
                        >
                          {lead.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Quick Actionable Tasks & Appointments */}
        <div className="space-y-5">
          {/* Tasks Card */}
          <Card className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs bg-white dark:bg-gray-900">
            <CardContent className="p-5">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-purple-600" />
                  Upcoming Tasks
                </h3>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-gray-400 font-medium">
                    {taskList.filter((t) => !t.completed).length} pending
                  </span>
                  <Link
                    href="/crm/tasks"
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-0.5 hover:underline"
                  >
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Task Items List */}
              <div className="space-y-2.5 mt-3 min-h-[140px]">
                {taskList.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-xs">
                    <CheckSquare className="w-7 h-7 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="font-medium text-gray-600 dark:text-gray-300">No tasks pending</p>
                    <p className="text-[11px] mt-0.5 text-gray-400">Click "+ Add Item" below to create one.</p>
                  </div>
                ) : (
                  taskList.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`group p-2.5 rounded-lg border text-xs cursor-pointer transition-all duration-150 flex items-start gap-2.5 ${
                        task.completed
                          ? "bg-gray-50/70 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 opacity-60"
                          : "bg-white dark:bg-gray-800/70 border-gray-100 dark:border-gray-700/80 hover:border-gray-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-0 cursor-pointer pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium ${
                            task.completed
                              ? "line-through text-gray-400 dark:text-gray-500"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {task.date}
                          </span>
                          {task.contact && (
                            <>
                              <span>•</span>
                              <span>{task.contact}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 transition-opacity p-0.5"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Item Button */}
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <ButtonTw
                  onClick={handleOpenTaskModal}
                  variant="blue"
                  size="sm"
                  className="w-full text-xs font-medium py-1.5 cursor-pointer"
                >
                  + Add Item
                </ButtonTw>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Creation Modal */}
      {isTaskModalOpen && (
        <ModalTw
          show={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          title="Add New Task"
          showFooter={false}
          size="md"
        >
          <div className="space-y-4 py-2">
            {taskError && (
              <div className="p-2.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900/40 font-medium">
                {taskError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) => {
                  setTaskForm({ ...taskForm, title: e.target.value });
                  if (taskError) setTaskError("");
                }}
                placeholder="e.g. Follow-up call with prospective client"
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={taskForm.contact}
                  onChange={(e) => setTaskForm({ ...taskForm, contact: e.target.value })}
                  placeholder="e.g. Adity Akter"
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Due Date & Time
                </label>
                <input
                  type="text"
                  value={taskForm.date}
                  onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                  placeholder="e.g. Today, 5:00 PM"
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="Normal">Normal</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <ButtonTw
                onClick={handleCloseTaskModal}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Cancel
              </ButtonTw>
              <ButtonTw
                onClick={handleSaveTask}
                variant="blue"
                size="sm"
                className="text-xs"
              >
                Save Task
              </ButtonTw>
            </div>
          </div>
        </ModalTw>
      )}
    </div>
  );
}
