import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  CheckSquare,
  Clock,
  DollarSign,
  FileText,
  Globe,
  Layers,
  LayoutGrid,
  Mail,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
const featurePills = [
  "HR & Attendance",
  "Payroll Engine",
  "CRM Pipeline",
  "Task Boards",
  "Leave Management",
  "Document Vault",
  "Recruitment Pipeline",
  "Reports & Analytics",
];

const stats = [
  { label: "Integrated Modules", value: "16+", icon: Layers },
  { label: "HR Sub-features", value: "10+", icon: Users },
  { label: "Multi-office Ready", value: "Global", icon: Globe },
  { label: "Free Trial Period", value: "30 Days", icon: CheckCircle },
];

const features = [
  {
    icon: Users,
    title: "HR Management",
    desc: "Full employee lifecycle — onboarding to exit. Attendance, leave, recruitment and shift management, unified.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    accentHex: "#3b82f6",
    bullets: [
      "Real-time check-in / check-out with reconciliation",
      "Leave applications with approval workflow",
      "Multi-stage recruitment pipeline & scoring",
      "Birthday calendar & event reminders",
      "Employee profiles with history & documents",
      "Asset allocation tracking per employee",
    ],
  },
  {
    icon: DollarSign,
    title: "Payroll Engine",
    desc: "Automate your entire payroll cycle — from defining pay items and salary grades to running monthly payroll.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    accentHex: "#10b981",
    bullets: [
      "Configurable pay items (Earnings & Deductions)",
      "Salary grades with min/max bands",
      "Monthly payroll runs with force re-run support",
      "Auto-calculated gross, deductions & net pay",
      "Statutory & taxable item management",
      "Employee promotions & grade progression",
    ],
  },
  {
    icon: Briefcase,
    title: "CRM",
    desc: "Manage your entire sales pipeline from first lead to closed deal — with email broadcasts and engagement analytics.",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    accentHex: "#8b5cf6",
    bullets: [
      "Lead & contact management with priority scoring",
      "Email templates with dynamic variable support",
      "Bulk email broadcasts with engagement tracking",
      "Deal value tracking and pipeline analytics",
      "Lead source attribution & conversion reporting",
      "Bounce rate, complaint rate & open-rate metrics",
    ],
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    desc: "Keep every project on track with Kanban boards, Gantt timelines, calendar views and organised workspaces.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    accentHex: "#f59e0b",
    bullets: [
      "Kanban boards with drag-and-drop columns",
      "Gantt chart for project timeline visibility",
      "Calendar & list views for flexible planning",
      "Workspaces to organise teams & projects",
      "Sub-tasks, custom tags & multi-assignees",
      "Priority levels, due dates & task roles",
    ],
  },
  {
    icon: FileText,
    title: "Document Management",
    desc: "Store, organise and share company documents — from HR policies to employee compliance certificates.",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    accentHex: "#f43f5e",
    bullets: [
      "Company documents & master document library",
      "Categorise by type: Policy, Contract, Form…",
      "Employee document attachments (NID, diplomas)",
      "Active/Inactive document status control",
      "Import from master document templates",
      "Employee-level document linking & tracking",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Reports & Access Control",
    desc: "Role-based access, module-level reports and company-wide configuration for full operational visibility.",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-500/10",
    accentHex: "#06b6d4",
    bullets: [
      "Granular role & permission management per user",
      "Attendance, leave & payroll report exports",
      "Export data to Excel & PDF",
      "Department, designation & office configuration",
      "Company branding, social links & logo",
      "Salary grade rules & payroll setup",
    ],
  },
];

const lifecycle = [
  {
    icon: Search,
    step: "Recruit",
    desc: "Post vacancies, define interview stages, schedule sessions and rank top candidates by score.",
  },
  {
    icon: UserPlus,
    step: "Onboard",
    desc: "Create employee profiles, assign offices, departments, designations and system access.",
  },
  {
    icon: Clock,
    step: "Track",
    desc: "Real-time check-in/out, 8 attendance tabs: list, reconciliation, monthly reports and more.",
  },
  {
    icon: Calendar,
    step: "Leave",
    desc: "Apply, approve and visualise leave on interactive calendars with policy-based balances.",
  },
  {
    icon: DollarSign,
    step: "Pay",
    desc: "Auto-calculate gross/net salary using pay items, grades and structures — run payroll monthly.",
  },
  {
    icon: TrendingUp,
    step: "Develop",
    desc: "Track promotions, training milestones, skills and employee development history.",
  },
];

const hrFeatureList = [
  {
    icon: Clock,
    text: "Real-time attendance with check-in/out and reconciliation tools",
  },
  {
    icon: Calendar,
    text: "Leave calendar with multi-step approval and balance reporting",
  },
  {
    icon: Search,
    text: "Multi-stage recruitment pipeline with configurable step names",
  },
  {
    icon: Star,
    text: "Interview scheduling, weight-based scoring & top-candidate ranking",
  },
  {
    icon: Users,
    text: "Full employee profiles — skills, training, documents and history",
  },
  {
    icon: Building2,
    text: "Multi-office support with shift scheduling & attendance rules",
  },
];

const crmTaskFeatureList = [
  {
    icon: Briefcase,
    text: "Lead management with priority levels, deal values & source tracking",
  },
  {
    icon: Mail,
    text: "Email broadcast with dynamic templates, open rates & engagement metrics",
  },
  {
    icon: TrendingUp,
    text: "Dashboard KPIs: contacts, new leads, clients, sales and invoices",
  },
  {
    icon: LayoutGrid,
    text: "Kanban, Gantt, Calendar and List views in one task workspace",
  },
  {
    icon: CheckSquare,
    text: "Sub-tasks, custom tags, multi-assignees, priorities and due dates",
  },
  {
    icon: Layers,
    text: "Multiple workspaces for organising different teams and projects",
  },
];

const faqs = [
  {
    q: "How many employees can I manage?",
    a: "Revinr OMS scales with your business. The Starter plan is ideal for small teams, while Professional and Enterprise plans handle growing organisations with no performance degradation.",
  },
  {
    q: "Can I customise the recruitment workflow?",
    a: "Yes. You can define unlimited recruitment step names — for example: Application → Screening → Written Test → Interview → Offer — and configure each stage independently with its own interviewers and weight distribution.",
  },
  {
    q: "Does payroll handle statutory deductions?",
    a: "Absolutely. Pay items can be flagged as Statutory and/or Taxable, with configurable min/max limits and calculation methods — fixed amount or percentage of gross salary. Salary grade rules can also be configured per organisation.",
  },
  {
    q: "Is there role-based access control?",
    a: "Yes. Admins can define custom roles with granular permissions per module — so HR managers see different screens than payroll officers or CRM executives. Each user's access is fully configurable.",
  },
  {
    q: "Can I track tasks across multiple views?",
    a: "Tasks support four views: Kanban board, List view, Calendar view and Gantt chart — all within the same workspace with real-time synchronisation across your team.",
  },
  {
    q: "What happens after the free trial ends?",
    a: "You can upgrade to any paid plan at any time. Your data is fully preserved throughout the trial period. There are no automatic charges — you decide when and if you want to upgrade.",
  },
];

const steps = [
  {
    step: "01",
    title: "Sign Up & Create Company Profile",
    desc: "Register your organisation in minutes. Set up offices, departments, designations and user roles.",
  },
  {
    step: "02",
    title: "Add Employees & Configure Modules",
    desc: "Onboard your team, assign roles & permissions, configure payroll items and activate needed modules.",
  },
  {
    step: "03",
    title: "Manage Everything from One Dashboard",
    desc: "Track attendance, run payroll, manage tasks and close CRM deals — from a single, unified interface.",
  },
];
export {
  crmTaskFeatureList,
  faqs,
  featurePills,
  features,
  hrFeatureList,
  lifecycle,
  stats,
  steps,
};
