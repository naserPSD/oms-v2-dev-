"use client";

import Income from "./Income";
import Expense from "./Expense";
import Invoice from "./Invoice";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import Link from "next/link";
import { ArrowRight, FileText, Landmark, Receipt, WalletCards } from "lucide-react";

const sections = [
  { key: "income", label: "Income", description: "Track money received by the business.", href: "/accounts/income", icon: WalletCards, tone: "emerald" },
  { key: "expense", label: "Expense", description: "Keep operating costs and payments organised.", href: "/accounts/expense", icon: Landmark, tone: "amber" },
  { key: "invoice", label: "Invoice", description: "Create, send and follow up on invoices.", href: "/accounts/invoice", icon: FileText, tone: "blue" },
];

export default function Accounts({ activeSection = "overview" }) {
  const { hasPermission } = useCommonFunctions();

  if (!hasPermission("accounts")) {
    return <div className="my-6 text-center text-gray-500">You do not have permission to view Accounts.</div>;
  }

  return (
    <div className="min-h-[calc(100vh-100px)] bg-slate-50/70 px-4 py-6 dark:bg-slate-950/30 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">Account Management</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Keep every transaction in view.</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Manage income, expenses and invoices from one focused workspace.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:flex">
          <Receipt size={15} className="text-blue-500" /> Financial workspace
        </div>
      </div>

      <nav className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Account sections">
        <Link href="/accounts" className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeSection === "overview" ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"}`}>Overview</Link>
        {sections.map(({ key, label, href }) => <Link key={key} href={href} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeSection === key ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"}`}>{label}</Link>)}
      </nav>

      {activeSection === "overview" ? (
        <div className="grid gap-4 md:grid-cols-3">
          {sections.map(({ key, label, description, href, icon: Icon, tone }) => {
            const canView = hasPermission(`accounts.${key}.view`);
            return <Link key={key} href={canView ? href : "/accounts"} className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 ${!canView ? "cursor-not-allowed opacity-50" : ""}`}>
              <div className={`mb-10 flex h-11 w-11 items-center justify-center rounded-xl ${tone === "emerald" ? "bg-emerald-100 text-emerald-700" : tone === "amber" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}><Icon size={21} /></div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{label}</h2>
              <p className="mt-2 min-h-10 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">Open {label} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
            </Link>;
          })}
        </div>
      ) : (
        <div className="w-full">
          {activeSection === "income" && hasPermission("accounts.income.view") && <Income />}
          {activeSection === "expense" && hasPermission("accounts.expense.view") && <Expense />}
          {activeSection === "invoice" && hasPermission("accounts.invoice.view") && <Invoice />}
        </div>
      )}
      {activeSection !== "overview" && !hasPermission(`accounts.${activeSection}.view`) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">You do not have permission to view this section.</div>
      )}
    </div>
  );
}