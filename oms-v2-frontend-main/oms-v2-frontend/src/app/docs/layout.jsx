"use client";
// src/app/docs/layout.jsx
// import { DarkThemeToggle } from 'flowbite-react';
import Link from 'next/link';
import React, { createContext, useState } from "react";
import ClientRootProviders from "@/components/layout/ClientRootProviders";

export const ComponentNameContext = createContext();

export default function Layout({ children }) {
    const [componentName, setComponentName] = useState("ButtonTw2");

    return (
        <ClientRootProviders>
        <ComponentNameContext.Provider value={{ componentName, setComponentName }}>
        <div style={{ margin: '0 auto', maxWidth: 960, padding: '2rem' }}>
            <header>
                <h1>Component Documentation || {componentName}</h1>
            </header>

            {/* <div className="flex items-center justify-end mb-6">
                <DarkThemeToggle className="text-gray-700 dark:text-gray-300 cursor-pointer" />
            </div> */}


            <button data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                </svg>
            </button>

            <aside id="default-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
                <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-theme-dark">
                    <ul className="space-y-2 font-medium">
                        <li>
                       
                            <Link href="/" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <span className="ms-3">Home</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/docs/button" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <span className="ms-3">Button Tw</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/docs/button2" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <span className="ms-3">Button Tw2</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/docs/modal" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <span className="ms-3">ModalTw</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </aside>

            <main>{children}</main>
        </div>
        </ComponentNameContext.Provider>
        </ClientRootProviders>
    );
}