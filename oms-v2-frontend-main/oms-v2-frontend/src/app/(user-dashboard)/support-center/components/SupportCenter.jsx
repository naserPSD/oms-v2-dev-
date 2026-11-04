"use client";

import { useState } from "react";
import {
    Search,
    HelpCircle,
    Mail,
    BookOpen,
    Video,
    ChevronRight,
    Circle,
    Rocket,
    User,
    FileText,
    ShoppingCart,
    Package,
    Settings,
    ChevronDown,
} from "lucide-react";

export default function SupportCenter() {
    const [openQuestion, setOpenQuestion] = useState(0); // first open by default

    const categories = [
        { name: "Getting Started", articles: 5, icon: Rocket, bgColor: "bg-blue-100", iconColor: "text-blue-600" },
        { name: "Account & Profile", articles: 8, icon: User, bgColor: "bg-green-100", iconColor: "text-green-600" },
        { name: "Invoices & Billing", articles: 12, icon: FileText, bgColor: "bg-purple-100", iconColor: "text-purple-600" },
        { name: "Purchases", articles: 10, icon: ShoppingCart, bgColor: "bg-orange-100", iconColor: "text-orange-600" },
        { name: "Inventory", articles: 9, icon: Package, bgColor: "bg-amber-100", iconColor: "text-amber-600" },
        { name: "Settings", articles: 7, icon: Settings, bgColor: "bg-gray-100", iconColor: "text-gray-600" },
    ];

    const popularQuestions = [
        {
            question: "How do I create a new invoice?",
            answer:
                "To create a new invoice, go to the Invoices section from the sidebar menu, click on the \"New Invoice\" button, fill in the required details like customer, items, quantity, and pricing, then click \"Save\". Your invoice will be created and ready to send.",
        },
        { question: "How can I track my inventory?", answer: "You can track inventory in real-time from the Inventory dashboard. Set up low-stock alerts and view detailed reports." },
        { question: "How do I add a new user to my account?", answer: "Navigate to Settings > Team, click 'Invite User', enter their email and role, then send the invitation." },
        { question: "What payment methods are supported?", answer: "We support credit cards, PayPal, bank transfers, and digital wallets like Apple Pay and Google Pay." },
        { question: "How do I export reports?", answer: "Go to Reports, choose the report type, set your date range, and click 'Export' to download as PDF or CSV." },
    ];

    const toggleQuestion = (index) => {
        setOpenQuestion(openQuestion === index ? null : index);
    };

    return (
        <div className="min-h-screen shadow-lg rounded-lg my-5 dark:bg-theme-dark border bg-theme-light py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            {/* Background SVG (headphone, message, page icons) */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="icon-pattern" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
                            {/* Headphone */}
                            <g transform="translate(50, 50) scale(0.8)" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
                            </g>
                            {/* Message bubble */}
                            <g transform="translate(150, 80) scale(0.8)" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </g>
                            {/* Document/page */}
                            <g transform="translate(100, 160) scale(0.8)" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="8" y1="13" x2="16" y2="13" />
                                <line x1="8" y1="17" x2="16" y2="17" />
                                <line x1="8" y1="9" x2="10" y2="9" />
                            </g>
                            {/* Additional scattered icons */}
                            <g transform="translate(220, 20) scale(0.6)" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z" />
                            </g>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#icon-pattern)" className="text-gray-400" />
                </svg>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Center</h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Find answers to common questions about Revinv ERP. Get help with features, troubleshooting, and more.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-3xl mx-auto mb-14">
                    <div className="flex rounded-lg shadow-sm overflow-hidden">
                        <input
                            type="text"
                            placeholder="Search for help articles, features, or questions..."
                            className="flex-1 px-5 py-3.5 text-gray-900 border bg-gray-50
            focus:ring-blue-500 focus:border-blue-500
            border-gray-300
            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3.5 rounded-r-lg flex items-center gap-2 transition-colors">
                            <Search className="w-4 h-4" />
                            Search
                        </button>
                    </div>
                </div>

                {/* Browse by Category */}
                <div className="mb-14">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Browse by Category</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <div
                                    key={cat.name}
                                    className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 ${cat.bgColor} rounded-lg`}>
                                            <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                                        </div>
                                        <div className="flex-1 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-xs text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                    {cat.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-0.5">{cat.articles} articles</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                    <div className="sm:col-span-12 lg:col-span-8">

                        {/* Popular Questions (Accordion) */}
                        <div className="mb-14">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Popular Questions</h2>
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
                                {popularQuestions.map((item, idx) => (
                                    <div key={idx} className="overflow-hidden">
                                        <button
                                            onClick={() => toggleQuestion(idx)}
                                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 hover:dark:text-gray-800 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Circle className="w-4 h-4 text-gray-400 fill-current flex-shrink-0" />
                                                <span className="font-medium text-gray-900 dark:text-gray-200 hover:dark:text-gray-800">{item.question}</span>
                                            </div>
                                            <ChevronDown
                                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openQuestion === idx ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>
                                        {openQuestion === idx && (
                                            <div className="px-6 pb-5 pt-1">
                                                <div className="pl-7 text-gray-600 dark:text-gray-400 leading-relaxed">{item.answer}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="sm:col-span-12 lg:col-span-4">

                        {/* Need More Help */}
                        <div className="mb-14 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Need More Help?</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Can't find what you're looking for? Our support team is here to help.
                            </p>

                            <div className="grid grid-cols-1 gap-5 mb-6">
                                {/* Contact Support */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2.5 bg-blue-100/70 rounded-lg">
                                            <HelpCircle className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-sm text-gray-900 dark:text-white">Contact Support</h3>
                                            <p className="text-sm text-gray-500">Get help from our team</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Email Us */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2.5 bg-green-100/70 rounded-lg">
                                            <Mail className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-sm text-gray-900 dark:text-white">Email Us</h3>
                                            <p className="text-sm text-gray-500 ">support@revinv.com</p>
                                        </div>
                                    </div>
                                </div>

                                {/* User Guide */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2.5 bg-purple-100/70 rounded-lg">
                                            <BookOpen className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-sm text-gray-900 dark:text-white">User Guide</h3>
                                            <p className="text-sm text-gray-500">Learn with our docs</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Video Tutorials */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2.5 bg-orange-100/70 rounded-lg">
                                            <Video className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-sm text-gray-900 dark:text-white">Video Tutorials</h3>
                                            <p className="text-sm text-gray-500">Watch step-by-step guides</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Response badge */}
                            <div className="text-center">
                                <span className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-full">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Quick Response · We typically respond within 24 hours
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback */}
                {/* <div className="border-t border-gray-200 pt-10 text-center">
                    <p className="text-gray-900 font-medium mb-2">Was this helpful?</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Help us improve by letting us know if you found what you were looking for.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
                            Yes
                        </button>
                        <button className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
                            No
                        </button>
                    </div>
                </div> */}
            </div>
        </div>
    );
}