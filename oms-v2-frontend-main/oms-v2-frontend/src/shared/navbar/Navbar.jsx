"use client";
import { Menu, X, Globe, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken"));
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav
      className={`transition-all duration-300 border-b ${
        scrolled
          ? "border-white/10 shadow-lg shadow-black/30"
          : "border-white/6"
      }`}
      style={
        scrolled
          ? {
              background: "rgba(7, 14, 30, 0.88)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }
          : {
              background: "rgba(5, 11, 24, 0.55)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 shrink-0">
          <div className="relative h-9 w-9 overflow-hidden rounded-full shrink-0 border-2 border-indigo-400/30">
            <Image
              src="/assets/images/paint.png"
              alt="Revinr OMS"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-extrabold text-white leading-tight">
              OMS <span className="font-normal text-white/40">V2</span>
            </p>
            <p className="text-[10px] text-white/30 leading-tight">
              AI Powerd HR Management System
            </p>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-semibold text-white/60 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white/70 transition-colors">
            <Globe size={13} />
            EN
          </button>

          {accessToken ? (
            <Link
              href="/main-dashboard"
              className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 hover:shadow-lg active:scale-95"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              boxShadow: "0 2px 12px rgba(99,102,241,0.4)",
            }}
          >
            Start Free Trial
            <ChevronRight size={12} />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex md:hidden p-1.5 rounded-lg text-white/70 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-5 pt-3 border-t border-white/8">
          <div className="flex flex-col gap-4">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={closeMobile}
                className="text-sm font-semibold text-white/60 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}

            <div className="h-px bg-white/6" />

            <button className="flex items-center gap-1.5 text-xs font-semibold text-white/40">
              <Globe size={13} />
              EN
            </button>

            {accessToken ? (
              <Link
                href="/main-dashboard"
                onClick={closeMobile}
                className="text-sm font-semibold text-white/70"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/sign-in"
                onClick={closeMobile}
                className="text-sm font-semibold text-white/70"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/sign-up"
              onClick={closeMobile}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              }}
            >
              Start Free Trial
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
