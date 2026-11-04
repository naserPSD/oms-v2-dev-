
import Button from "@/components/ui/ButtonTw";
import i18n from "@/lang/i18n";
// import { DarkThemeToggle } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button as Button2 } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/useAuthStore";

const AuthNavbar = () => {
  const { t } = useTranslation();
  const { setTheme } = useTheme()

  const [preferredLanguage, setPreferredLanguage] = useState("en");

  const setLanguage = (language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem('lang', language);
      setPreferredLanguage(language);
      i18n.changeLanguage(language);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lang = localStorage.getItem('lang') || 'en';
      setPreferredLanguage(lang);
      i18n.changeLanguage(lang);
    }
  }, []);
  
  const changeLanguage = (lng) => {
    setLanguage(lng)
    i18n.changeLanguage(preferredLanguage);
  }

  return (
    <div className="px-2 inline-flex justify-between items-center w-full h-16-lightBorder dark:bg-theme-dark bg-background-light text-theme-dark dark:text-gray-300 dark:border-gray-700">
      <Link href="/" className="inline-flex items-center gap-3 py-3 px-4">
        <Image
          src="/images/sanzio-logo.webp"
          alt="Sanzio"
          width={120}
          height={28}
          className="h-7 w-auto"
          priority
        />
        <div className="border-l border-gray-200 pl-3 dark:border-gray-700">
          <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400">
            AI Based HR Management System
          </h5>
        </div>
      </Link>
      <div className="flex items-center  gap-4">
        {/* <Link
          href="/auth/login"
          className="text-gray-700 dark:text-gray-300 hover:text-secondaryColor dark:hover:text-secondaryColor transition-colors"
        >
          Login
        </Link> */}
        {/* <DarkThemeToggle className="text-gray-700 dark:text-gray-300 cursor-pointer" /> */}

        <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button2 id="auth-theme-menu-trigger" variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button2>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

        {preferredLanguage === 'en' &&
          <Button onClick={() => changeLanguage('bn')} variant="alternative">
            <i className="fa-solid fa-globe"></i>
            <span className="text-md ml-2">{t('bangla')}</span>
          </Button>
        }
        {preferredLanguage === 'bn' &&
          <Button onClick={() => changeLanguage('en')} variant="alternative">
            <i className="fa-solid fa-globe"></i>
            <span className="text-md ml-2">{t('lang')}</span>
          </Button>}
      </div>
    </div>
  );
};

export default AuthNavbar;
