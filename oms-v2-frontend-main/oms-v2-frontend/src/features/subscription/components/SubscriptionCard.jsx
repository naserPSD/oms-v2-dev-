import React from "react";
import SwitchButton from "@/components/ui/SwitchButton";
import ButtonTw from "@/components/ui/ButtonTw";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/common/Pagination";
import {
  FiEdit,
  FiTrash2,
  FiLayers,
  FiCheckCircle,
  FiArrowUpRight,
} from "react-icons/fi";

const ACCENT = {
  border: "border-l-cyan-500",
  glow: "hover:shadow-cyan-500/10",
  badge: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300",
  dot: "bg-cyan-500",
  text: "text-cyan-600 dark:text-cyan-400",
  ring: "ring-cyan-500/20",
};

function parseFeaturesHtml(html) {
  if (!html) return null;
  if (typeof html === "object") return html;
  const text = String(html).replace(/<[^>]*>/g, "").trim();
  try { return JSON.parse(text); } catch { return null; }
}

function fmt(val) {
  if (val == null || val === "") return "—";
  return parseFloat(val).toLocaleString();
}

function DataRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-dashed border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-[11px] uppercase tracking-widest font-semibold text-gray-400 dark:text-gray-500">
        {label}
      </span>
      <span className={`text-xs font-semibold text-gray-800 dark:text-gray-100 ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function PlanCard({ plan, onEdit, onDelete, onToggleStatus, onTogglePopular }) {
  const accent = ACCENT;
  const parsed = parseFeaturesHtml(plan.features);
  const featuresList = parsed?.features || [];
  const storage = parsed?.storage;
  const projects = parsed?.projects;

  const userRange = plan.minUsers
    ? plan.maxUsers
      ? `${plan.minUsers} – ${plan.maxUsers}`
      : `${plan.minUsers}+`
    : "—";

  return (
    <div
      className={`
        relative flex flex-col
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        border-l-4 ${accent.border}
        rounded-xl overflow-hidden
        shadow-sm hover:shadow-xl ${accent.glow}
        transition-all duration-300 hover:-translate-y-0.5
        ring-1 ${accent.ring}
      `}
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(0,0,0,0.035) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    >
      {/* Solid overlay so dot grid is subtle */}
      <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/92 pointer-events-none rounded-xl" />

      <div className="relative z-10 flex flex-col h-full">
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`inline-block w-2 h-2 rounded-full ${accent.dot} shrink-0`} />
                <h3 className="text-[15px] font-bold tracking-tight text-gray-900 dark:text-white truncate">
                  {plan.name}
                </h3>
                {plan.isPopular ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                    MOST POPULAR
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500 truncate">
                /{plan.slug}
              </p>
            </div>

            {/* Status + Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onTogglePopular && (
                <button
                  type="button"
                  onClick={() => onTogglePopular(plan.id)}
                  title={plan.isPopular ? "Currently Most Popular" : "Set as Most Popular"}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                    plan.isPopular
                      ? "bg-cyan-500 text-white shadow-xs"
                      : "bg-gray-100 text-gray-500 hover:bg-cyan-50 hover:text-cyan-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {plan.isPopular ? "Popular ★" : "Make Popular"}
                </button>
              )}
              <SwitchButton
                enabled={plan.isActive}
                onClick={() => onToggleStatus(plan.id)}
                enabledText="Live"
                disabledText="Off"
              />
              <button
                onClick={() => onEdit(plan)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
                title="Edit"
              >
                <FiEdit size={14} />
              </button>
              <button
                onClick={() => onDelete(plan.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>

          {plan.description && (
            <p className="mt-3 text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
              {plan.description}
            </p>
          )}
        </div>

        {/* ── Pricing ── */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 dark:text-gray-500 mb-1">
                Per User Monthly Price
              </p>
              <p className={`text-xl font-mono font-bold ${accent.text}`}>
                {fmt(plan.monthlyPrice)}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                {plan.currency} / mo
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 dark:text-gray-500 mb-1">
                Per User Yearly Price
              </p>
              <p className={`text-xl font-mono font-bold ${accent.text}`}>
                {fmt(plan.yearlyPrice)}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                {plan.currency} / yr
              </p>
            </div>
          </div>
        </div>

        {/* ── Specs ── */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 space-y-0">
          <DataRow label="Users" value={userRange} mono />
          <DataRow label="Trial" value={plan.trialDays > 0 ? `${plan.trialDays} days` : "None"} />
          {storage && (
            <DataRow label="Storage" value={storage} />
          )}
          {projects && (
            <DataRow label="Projects" value={projects} />
          )}
        </div>

        {/* ── Features ── */}
        {featuresList.length > 0 && (
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex-1">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 dark:text-gray-500 mb-2">
              Includes
            </p>
            <ul className="space-y-1.5">
              {featuresList.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-[12px] text-gray-700 dark:text-gray-300">
                  <FiCheckCircle className={`shrink-0 w-3.5 h-3.5 ${accent.text}`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="px-5 py-3 mt-auto">
          <ButtonTw
            variant="default"
            className="w-full gap-1.5 text-xs"
            onClick={() => onEdit(plan)}
          >
            <FiEdit size={12} />
            Edit Plan
            <FiArrowUpRight size={12} className="ml-auto" />
          </ButtonTw>
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-l-4 border-l-gray-200 dark:border-l-gray-700 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-3 w-full" />)}
      </div>
      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  );
}

const SubscriptionCard = ({
  data,
  isFetching,
  onEdit,
  onDelete,
  onToggleStatus,
  onTogglePopular,
  pagination,
  currentPage,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
}) => {
  if (isFetching) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-6">
        {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="my-6">
      {data && data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                onTogglePopular={onTogglePopular}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={pagination?.total || 0}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <FiLayers className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            No plans yet
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Create your first subscription plan to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;
