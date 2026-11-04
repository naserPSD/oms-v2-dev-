// FAQItem.jsx
"use client";

import { ChevronDown } from "lucide-react";
import { useSupportStore } from "@/store/useSupportStore";

export default function FAQItem({ faq }) {
    const { openId, toggle } = useSupportStore();
    const open = openId === faq.id;

    return (
        <div className="border-b py-3">
            <button
                onClick={() => toggle(faq.id)}
                className="flex justify-between w-full"
            >
                <span>{faq.q}</span>
                <ChevronDown className={open ? "rotate-180" : ""} />
            </button>

            {open && <p className="mt-2 text-gray-500">{faq.a}</p>}
        </div>
    );
}