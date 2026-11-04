// components/sidebar/DynamicDropdownSection.jsx (create this file)
"use client";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export const DynamicDropdownSection = ({ icon, title, pages }) => {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Check if any child page is active
    useEffect(() => {
        const isAnyChildActive = pages.some((page) => pathname === page.path);
        if (isAnyChildActive) setOpen(true);
    }, [pathname, pages]);

    if (!pages || pages.length === 0) return null;

    return (
        <div className="w-full mt-1.5">
            <div
                className={`flex items-center justify-between w-full p-2 px-3 dark:text-gray-300 text-gray-800 rounded-md transition 
          ${open ? "dark:bg-gray-800 bg-gray-200 text-secondaryColor" : "hover:bg-gray-400 hover:dark:bg-gray-700 hover:text-gray-200"}`}
            >
                <div className="flex items-center gap-3">
                    <span
                        className="text-xl text-gray-800 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: icon }}
                    />
                    <button onClick={() => setOpen(!open)} className="capitalize">
                        {title}
                    </button>
                </div>
                <button onClick={() => setOpen(!open)}>
                    {open ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            </div>

            <div
                className={`overflow-y-auto sidebar-scroll transition-all duration-300 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <ul className="ml-5 my-1.5 pl-5 border-l-[2px] border-gray-300 dark:border-gray-600 py-1 space-y-2">
                    {pages.map((page, idx) => (
                        <li key={idx}>
                            <Link
                                href={page.path}
                                className={`block text-sm hover:text-secondaryColor transition ${pathname === page.path
                                        ? "text-secondaryColor font-medium"
                                        : "text-gray-800 dark:text-gray-300"
                                    }`}
                            >
                                {page.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};