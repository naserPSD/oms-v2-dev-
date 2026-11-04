"use client";

import {
    crmTaskFeatureList,
    faqs,
    featurePills,
    features,
    hrFeatureList,
    lifecycle,
    stats,
    steps,
} from "@/data/homePageStaticData";
import {
    ArrowRight,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    XCircle,
    Zap,
} from "lucide-react";
import { useState } from "react";

const SectionLabel = ({ children, light = false }) => (
    <span
        className={`mb-3 inline-block text-xs font-bold uppercase tracking-widest ${light ? "text-blue-300" : "text-primaryColor"
            }`}
    >
        {children}
    </span>
);

const FaqComponent = () => {
    const [open, setOpen] = useState(null);

    return (
        <div className="dark:bg-theme-dark border bg-theme-light rounded-lg shadow ${className} my-5">
            <section className="bg-slate-50 dark:bg-gray-900 px-6 py-10">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-14 text-center">
                        <SectionLabel>FAQ</SectionLabel>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                            Frequently asked questions
                        </h2>
                        <p className="mt-3 text-gray-500 dark:text-gray-400">
                            Everything you need to know about Revinr OMS.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="overflow-hidden rounded-xl bg-white dark:bg-gray-800/60 transition-all"
                                style={{
                                    border:
                                        open === i
                                            ? "1px solid rgba(99,102,241,0.35)"
                                            : "1px solid #e5e7eb",
                                    boxShadow:
                                        open === i ? "0 2px 16px rgba(99,102,241,0.08)" : "none",
                                }}
                            >
                                <button
                                    onClick={() => setOpen(open === i ? null : i)}
                                    className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:text-white dark:hover:bg-white/4"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown
                                        size={16}
                                        className={`ml-4 shrink-0 transition-transform duration-200 ${open === i ? "rotate-180 text-indigo-500" : "text-gray-400"
                                            }`}
                                    />
                                </button>
                                {open === i && (
                                    <div
                                        className="px-6 py-4"
                                        style={{ borderTop: "1px solid rgba(99,102,241,0.1)" }}
                                    >
                                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                            {faq.a}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default FaqComponent
