"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HR_ICON_WEBP } from "@/features/landing/hrIcon";
import { color } from "@/features/landing/tokens";

export default function Header() {
  const [productsOpen, setProductsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sanzio-header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,.88)",
        backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${color.border}`,
        padding: "0 40px",
      }}
    >
      <div
        className="sanzio-header-inner"
        style={{
          maxWidth: 1320,
          width: "100%",
          margin: "0 auto",
          height: 76,
          display: "flex",
          alignItems: "center",
          gap: 48,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/images/sanzio-logo.webp"
            alt="Sanzio"
            height={26}
            width={110}
            style={{ height: 26, width: "auto" }}
            priority
          />
        </Link>

        <nav
          className="sanzio-desktop-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 34,
            fontSize: 14.5,
            fontWeight: 600,
            letterSpacing: "-.01em",
            color: color.ink,
          }}
        >
          <div
            className="sanzio-nav-link"
            style={{
              position: "relative",
              padding: "26px 0",
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              color: productsOpen ? color.cyanInk : color.ink,
              transition: "color .16s",
            }}
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <span>Products</span>
            <span style={{ fontSize: 9, opacity: 0.5 }}>▾</span>
            {productsOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 72,
                  left: -24,
                  width: 280,
                  padding: 10,
                  background: "#fff",
                  border: `1px solid ${color.border}`,
                  borderRadius: 18,
                  boxShadow: "0 24px 60px -24px rgba(29,27,27,.22)",
                }}
              >
                <Link
                  href="/sanzio-hr-management"
                  className="sanzio-dd-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    borderRadius: 12,
                    textDecoration: "none",
                    color: color.ink,
                  }}
                >
                  <span
                    style={{
                      flex: "none",
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "#F0FAFF",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Image
                      src={HR_ICON_WEBP}
                      alt=""
                      width={22}
                      height={19}
                      style={{
                        width: 22,
                        height: 19,
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>
                    Sanzio HR Management
                  </span>
                </Link>
                <Link
                  href="/connect"
                  className="sanzio-dd-item sanzio-dd-item--connect"
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 14,
                    borderRadius: 12,
                    textDecoration: "none",
                    color: color.ink,
                  }}
                >
                  <span
                    style={{
                      flex: "none",
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      overflow: "hidden",
                      background: color.connectTint,
                    }}
                  >
                    <Image
                      src="/images/sanzio-connect-fab-icon.webp"
                      alt=""
                      width={34}
                      height={34}
                      style={{ objectFit: "contain", padding: 5 }}
                    />
                  </span>
                  <span>
                    <span
                      style={{ display: "block", fontSize: 14, fontWeight: 700 }}
                    >
                      Sanzio Connect
                    </span>
                    <span
                      style={{
                        display: "block",
                        marginTop: 2,
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#6B7076",
                      }}
                    >
                      Multi-channel communication & marketing
                    </span>
                  </span>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/pricing"
            className="sanzio-nav-link"
            style={{ color: color.ink, textDecoration: "none" }}
          >
            Pricing
          </Link>
          <Link
            href="/#why"
            className="sanzio-nav-link"
            style={{ color: color.ink, textDecoration: "none" }}
          >
            Why Sanzio
          </Link>

          <div
            className="sanzio-nav-link"
            style={{
              position: "relative",
              padding: "26px 0",
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              color: resourcesOpen ? color.cyanInk : color.ink,
              transition: "color .16s",
            }}
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <span>Resources</span>
            <span style={{ fontSize: 9, opacity: 0.5 }}>▾</span>
            {resourcesOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 72,
                  right: -16,
                  width: 200,
                  padding: 10,
                  background: "#fff",
                  border: `1px solid ${color.border}`,
                  borderRadius: 16,
                  boxShadow: "0 24px 60px -24px rgba(29,27,27,.22)",
                }}
              >
                {[
                  ["Blog", "/blog"],
                  ["About", "/about"],
                  ["Contact", "/contact"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="sanzio-dd-item"
                    style={{
                      display: "block",
                      padding: "12px 14px",
                      borderRadius: 10,
                      fontSize: 14.5,
                      fontWeight: 700,
                      color: color.ink,
                      textDecoration: "none",
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Link
            href="/main-dashboard"
            className="sanzio-desktop-nav sanzio-login-link"
            style={{
              marginRight: 8,
              fontSize: 14.5,
              fontWeight: 700,
              color: color.brandInk,
              textDecoration: "none",
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/sign-in"
            className="sanzio-btn sanzio-btn--header"
            style={{
              padding: "11px 20px",
              background: color.ink,
              color: "#fff",
              borderRadius: 10,
              fontSize: 14.5,
              fontWeight: 700,
              border: 0,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background .16s, transform .16s",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Sign In
          </Link>
          <button
            type="button"
            aria-label="Menu"
            className="sanzio-mobile-btn"
            onClick={() => setMobileOpen((v) => !v)}
            style={{
              display: "none",
              gap: 4,
              padding: "12px 11px",
              border: `1px solid ${color.border}`,
              borderRadius: 10,
              background: "#fff",
              cursor: "pointer",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                display: "block",
                width: 16,
                height: 2,
                borderRadius: 2,
                background: color.ink,
              }}
            />
            <span
              style={{
                display: "block",
                width: 16,
                height: 2,
                borderRadius: 2,
                background: color.ink,
              }}
            />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          style={{
            padding: "6px 20px 22px",
            borderTop: `1px solid ${color.border}`,
            background: "#fff",
            display: "grid",
            gap: 2,
            fontSize: 15.5,
            fontWeight: 700,
          }}
        >
          {[
            ["Sanzio HR Management", "/sanzio-hr-management"],
            ["Sanzio Connect", "/connect"],
            ["Pricing", "/pricing"],
            ["Why Sanzio", "/#why"],
            ["Blog", "/blog"],
            ["About", "/about"],
            ["Contact", "/contact"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #F2F5F7",
                color: color.ink,
                textDecoration: "none",
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/main-dashboard"
            onClick={() => setMobileOpen(false)}
            style={{
              padding: "12px 0",
              color: color.brandInk,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/sign-in"
            onClick={() => setMobileOpen(false)}
            style={{
              padding: "12px 0",
              color: color.cyanInk,
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (max-width: 900px) {
          .sanzio-desktop-nav { display: none !important; }
          .sanzio-mobile-btn { display: flex !important; }
        }
      `,
        }}
      />
    </header>
  );
}
