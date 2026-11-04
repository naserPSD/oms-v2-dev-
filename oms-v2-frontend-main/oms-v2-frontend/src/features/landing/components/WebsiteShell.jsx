import MarketingDemoChrome from "./MarketingDemoChrome";
import Footer from "./Footer";
import { color } from "@/features/landing/tokens";

export default function WebsiteShell({ children, className }) {
  return (
    <div
      className={`sanzio-site ${className || ""}`}
      style={{
        margin: 0,
        fontFamily: "var(--font-manrope), Manrope, system-ui, sans-serif",
        color: color.ink,
        background: "#fff",
        WebkitFontSmoothing: "antialiased",
        minHeight: "100vh",
      }}
    >
      <MarketingDemoChrome />
      <main>{children}</main>
      <Footer />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .sanzio-site a {
            transition: color .16s, background .16s, border-color .16s, box-shadow .16s, transform .16s;
          }
          .sanzio-site a.sanzio-nav-link:hover,
          .sanzio-site .sanzio-nav-link:hover,
          .sanzio-site .sanzio-desktop-nav > a:hover {
            color: ${color.cyan} !important;
          }
          .sanzio-site .sanzio-login-link:hover {
            color: ${color.cyan} !important;
          }

          .sanzio-site .sanzio-dd-item {
            transition: background .16s;
          }
          .sanzio-site .sanzio-dd-item:hover {
            background: #F5FBFE;
          }
          .sanzio-site .sanzio-dd-item--connect:hover {
            background: #FBF5FF;
          }

          .sanzio-site .sanzio-btn--ink:hover,
          .sanzio-site .sanzio-btn--header:hover {
            background: ${color.cyanButton} !important;
            color: #fff !important;
            transform: translateY(-1px);
          }
          .sanzio-site .sanzio-btn--ink.sanzio-btn--brand-hover:hover {
            background: ${color.brandDeep} !important;
            transform: translateY(-2px);
          }
          .sanzio-site .sanzio-btn--cyan {
            background: ${color.cyanButton} !important;
            color: #fff !important;
          }
          .sanzio-site .sanzio-btn--cyan:hover {
            background: ${color.cyanInk} !important;
            color: #fff !important;
            transform: translateY(-2px);
            box-shadow: 0 16px 30px -12px rgba(17,113,146,.5) !important;
          }

          .sanzio-site .sanzio-pillar-num {
            color: ${color.brandInk} !important;
          }
          .sanzio-site .sanzio-btn--white:hover {
            transform: translateY(-2px);
            background: ${color.ink} !important;
            color: #fff !important;
          }
          .sanzio-site .sanzio-btn--white.sanzio-btn--brand-hover:hover {
            background: ${color.brandDeep} !important;
          }
          .sanzio-site .sanzio-btn--brand:hover {
            transform: translateY(-2px);
            filter: brightness(1.08);
          }
          .sanzio-site .sanzio-btn--connect:hover {
            transform: translateY(-2px);
            filter: brightness(1.06);
          }

          .sanzio-site .sanzio-btn-outline {
            transition: border-color .16s, background .16s, color .16s, transform .16s;
          }
          .sanzio-site .sanzio-btn-outline:hover {
            border-color: ${color.ink} !important;
            background: ${color.bgTint} !important;
            color: ${color.ink} !important;
          }
          .sanzio-site .sanzio-btn-ghost-light:hover {
            background: rgba(255,255,255,.16) !important;
            color: #fff !important;
          }

          .sanzio-site .sanzio-card-hover {
            transition: box-shadow .22s, transform .22s, border-color .2s;
          }
          .sanzio-site .sanzio-card-hover:hover {
            box-shadow: 0 24px 50px -32px rgba(29,27,27,.3);
            transform: translateY(-3px);
          }

          .sanzio-site .sanzio-row-hover {
            transition: background .16s, color .16s;
          }
          .sanzio-site .sanzio-row-hover:hover {
            background: ${color.bgSoft};
          }
          .sanzio-site .sanzio-row-hover:hover .sanzio-row-cta {
            color: ${color.cyan} !important;
          }

          .sanzio-site .sanzio-pricing-cta:not(.sanzio-pricing-cta--popular):hover {
            border-color: ${color.ink} !important;
            color: ${color.ink} !important;
          }
          .sanzio-site .sanzio-pricing-cta--popular,
          .sanzio-site .sanzio-pricing-cta--popular:hover {
            background: ${color.cyanButton} !important;
            color: #fff !important;
          }
          .sanzio-site .sanzio-pricing-cta--popular:hover {
            transform: translateY(-2px) !important;
          }

          .sanzio-site .sanzio-footer-col-title {
            color: ${color.labelOnWhite} !important;
          }
          .sanzio-site .sanzio-footer-tagline,
          .sanzio-site .sanzio-footer-legal {
            color: ${color.muted} !important;
          }
          .sanzio-site .sanzio-kicker-on-light {
            color: ${color.labelOnWhite} !important;
          }

          .sanzio-site .sanzio-footer-link:hover {
            color: ${color.cyan} !important;
          }

          .sanzio-site .sanzio-suite-row {
            transition: background .16s ease;
          }
          .sanzio-site .sanzio-suite-row:hover {
            background: #FAFBFC !important;
          }
          .sanzio-site .sanzio-suite-row:hover .sanzio-suite-cta {
            color: ${color.cyan} !important;
          }
          .sanzio-site .sanzio-suite-row:hover .sanzio-arrow-icon,
          .sanzio-site .sanzio-arrow-btn:hover .sanzio-arrow-icon {
            transform: translateX(4px) !important;
          }

          .sanzio-site .sanzio-flow-row {
            margin-top: 28px;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
          }
          .sanzio-site .sanzio-flow-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            max-width: 340px;
          }
          .sanzio-site .sanzio-flow-card {
            width: 100%;
            max-width: 100%;
            transition: box-shadow .2s, transform .2s, border-color .2s;
          }
          .sanzio-site .sanzio-flow-connector {
            position: relative;
            width: 2px;
            height: 22px;
            margin: 8px 0;
            flex-shrink: 0;
            background: linear-gradient(180deg, #CFE9F6, #44BAEB);
          }
          .sanzio-site .sanzio-flow-connector-dot {
            position: absolute;
            left: 50%;
            bottom: -4px;
            width: 8px;
            height: 8px;
            margin-left: -4px;
            border-radius: 50%;
            background: ${color.cyan};
          }

          @media (min-width: 901px) {
            .sanzio-site .sanzio-flow-row {
              margin-top: 56px;
              flex-direction: row;
              flex-wrap: wrap;
              justify-content: center;
              align-items: center;
            }
            .sanzio-site .sanzio-flow-step {
              flex-direction: row;
              width: auto;
              max-width: none;
            }
            .sanzio-site .sanzio-flow-card {
              width: 176px;
            }
            .sanzio-site .sanzio-flow-connector {
              width: 40px;
              height: 2px;
              margin: 0 6px;
              background: linear-gradient(90deg, #CFE9F6, #44BAEB);
            }
            .sanzio-site .sanzio-flow-connector-dot {
              left: auto;
              right: -4px;
              top: 50%;
              bottom: auto;
              margin-left: 0;
              margin-top: -4px;
            }
          }

          .sanzio-site .sanzio-flow-card:hover {
            box-shadow: 0 20px 40px -26px rgba(29,27,27,.3) !important;
            transform: translateY(-3px) !important;
            border-color: #CFE9F6 !important;
          }

          .sanzio-site .sanzio-product-card {
            transition: box-shadow .22s, transform .22s, border-color .2s;
          }
          .sanzio-site .sanzio-product-card:hover {
            box-shadow: 0 28px 54px -34px rgba(29,27,27,.3) !important;
            transform: translateY(-3px) !important;
          }

          .sanzio-site .sanzio-faq-card {
            transition: background .16s ease, border-color .16s ease;
          }
          .sanzio-site .sanzio-faq-card:hover {
            background: #EAF6FC !important;
          }

          .sanzio-site .sanzio-connect-card {
            transition: border-color .16s, color .16s, transform .16s, box-shadow .16s;
          }
          .sanzio-site .sanzio-connect-card:hover {
            border-color: #A21CAF !important;
            transform: translateY(-2px) !important;
          }

          .sanzio-browser-mock-body {
            min-height: 492px;
          }

          @keyframes logoIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes logoMarquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }

          .sanzio-logo-marquee-track:hover {
            animation-play-state: paused !important;
          }
          .sanzio-logo-slot-wrap {
            filter: grayscale(1) opacity(.55);
            transition: filter .3s ease;
          }
          .sanzio-logo-slot-wrap:hover {
            filter: grayscale(0) opacity(1) !important;
          }

          .sanzio-site .sanzio-why-section {
            padding: 48px 40px 64px;
            overflow-x: clip;
            box-sizing: border-box;
          }
          .sanzio-site .sanzio-why-inner {
            width: 100%;
            max-width: 1320px;
            margin: 0 auto;
            min-width: 0;
            box-sizing: border-box;
          }
          .sanzio-site .sanzio-why-split {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 24px;
            width: 100%;
            min-width: 0;
          }
          .sanzio-site .sanzio-why-split-copy,
          .sanzio-site .sanzio-why-highlights {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
          }
          .sanzio-site .sanzio-why-highlights {
            padding: 28px 28px 24px;
            border-radius: 16px;
          }

          .sanzio-site .sanzio-why-buy-section {
            padding: 0 16px 40px;
            box-sizing: border-box;
          }
          .sanzio-site .sanzio-why-buy-banner {
            border-radius: 18px;
            padding: 28px 20px 24px;
          }
          .sanzio-site .sanzio-why-buy-split {
            margin-top: 18px;
            display: grid;
            grid-template-columns: 1fr;
            gap: 14px;
            align-items: start;
          }
          .sanzio-site .sanzio-why-buy-banner h2 {
            font-size: 30px;
            line-height: 1.12;
          }
          .sanzio-site .sanzio-why-buy-features {
            margin-top: 28px;
            padding-top: 22px;
            border-top: 1px solid rgba(255,255,255,0.1);
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .sanzio-site .sanzio-why-buy-actions {
            margin-top: 28px;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .sanzio-site .sanzio-why-buy-actions > a,
          .sanzio-site .sanzio-why-buy-actions > button {
            width: 100%;
            justify-content: center;
          }

          .sanzio-site .sanzio-blog-preview {
            padding: 40px 16px 48px;
            box-sizing: border-box;
          }
          .sanzio-site .sanzio-blog-preview-head {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
          .sanzio-site .sanzio-blog-preview-title {
            font-size: 32px;
            line-height: 1.12;
            max-width: none;
          }
          .sanzio-site .sanzio-blog-preview-grid {
            margin-top: 24px;
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .sanzio-site .sanzio-blog-preview-grid .sanzio-card-hover h3 {
            font-size: 18px;
            line-height: 1.3;
          }

          .sanzio-site .sanzio-footer-inner {
            max-width: 1320px;
            width: 100%;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .sanzio-site .sanzio-footer-tagline {
            max-width: none;
          }
          .sanzio-site .sanzio-footer-cols {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 28px 16px;
          }
          .sanzio-site .sanzio-footer-legal {
            max-width: 1320px;
            margin: 28px auto 0;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            gap: 6px 14px;
          }
          .sanzio-site .sanzio-footer-legal-item {
            white-space: nowrap;
          }

          @media (min-width: 901px) {
            .sanzio-site .sanzio-why-split {
              flex-direction: row;
              flex-wrap: nowrap;
              align-items: flex-start;
              gap: 48px;
            }
            .sanzio-site .sanzio-why-split-copy {
              flex: 1 1 0;
              width: auto;
              max-width: 620px;
            }
            .sanzio-site .sanzio-why-highlights {
              flex: 0 1 400px;
              width: auto;
              max-width: 400px;
            }
            .sanzio-site .sanzio-why-buy-section {
              padding: 0 40px 64px;
            }
            .sanzio-site .sanzio-why-buy-banner {
              border-radius: 24px;
              padding: 56px 56px 48px;
            }
            .sanzio-site .sanzio-why-buy-split {
              margin-top: 28px;
              grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
              gap: 48px;
            }
            .sanzio-site .sanzio-why-buy-banner h2 {
              font-size: 40px;
              line-height: 1.1;
            }
            .sanzio-site .sanzio-why-buy-features {
              margin-top: 44px;
              padding-top: 36px;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 32px;
            }
            .sanzio-site .sanzio-why-buy-actions {
              margin-top: 40px;
              flex-direction: row;
              align-items: center;
              flex-wrap: wrap;
            }
            .sanzio-site .sanzio-why-buy-actions > a,
            .sanzio-site .sanzio-why-buy-actions > button {
              width: auto;
            }
            .sanzio-site .sanzio-blog-preview {
              padding: 80px 40px;
            }
            .sanzio-site .sanzio-blog-preview-head {
              flex-direction: row;
              align-items: flex-end;
              justify-content: space-between;
              gap: 24px;
            }
            .sanzio-site .sanzio-blog-preview-title {
              font-size: 40px;
            }
            .sanzio-site .sanzio-blog-preview-grid {
              margin-top: 40px;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 24px;
            }
            .sanzio-site .sanzio-footer-inner {
              grid-template-columns: minmax(220px, 1.4fr) minmax(0, 4fr);
              gap: 40px;
              align-items: start;
            }
            .sanzio-site .sanzio-footer-tagline {
              max-width: 230px;
            }
            .sanzio-site .sanzio-footer-cols {
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 40px;
            }
            .sanzio-site .sanzio-footer-legal {
              margin-top: 56px;
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
            }
          }

          @media (max-width: 900px) {
            .sanzio-site h1 { font-size: 36px !important; }
            .sanzio-site h2 { font-size: 28px !important; }
            .sanzio-header { padding: 0 20px !important; }
            .sanzio-header-inner { gap: 14px !important; }
            .sanzio-footer { padding: 40px 20px 88px !important; }
            .sanzio-hero-top { padding: 28px 20px 48px !important; }
            .sanzio-hero-grid {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
            }
            .sanzio-hero-dashboard img {
              width: 100% !important;
              max-width: 100% !important;
              transform: none !important;
            }
            .sanzio-flow-section {
              padding: 36px 20px 48px !important;
              overflow-x: hidden !important;
            }
            .sanzio-flow-section h2 {
              font-size: 32px !important;
              line-height: 1.12 !important;
            }
            .sanzio-flow-section p {
              font-size: 15.5px !important;
              line-height: 1.55 !important;
            }
            .sanzio-flow-row {
              flex-direction: column !important;
              align-items: center !important;
              margin-top: 28px !important;
              width: 100% !important;
            }
            .sanzio-flow-step {
              flex-direction: column !important;
              align-items: center !important;
              width: 100% !important;
              max-width: 320px !important;
            }
            .sanzio-flow-card {
              width: 100% !important;
              max-width: 100% !important;
            }
            .sanzio-flow-connector {
              width: 2px !important;
              height: 22px !important;
              margin: 8px auto !important;
              background: linear-gradient(180deg, #CFE9F6, #44BAEB) !important;
            }
            .sanzio-flow-connector-dot {
              left: 50% !important;
              right: auto !important;
              top: auto !important;
              bottom: -4px !important;
              margin-left: -4px !important;
              margin-top: 0 !important;
              transform: none !important;
            }
            .sanzio-beyond-section,
            .sanzio-site .sanzio-why-section {
              padding-left: 20px !important;
              padding-right: 20px !important;
              padding-top: 32px !important;
              padding-bottom: 48px !important;
              overflow-x: hidden !important;
            }
            .sanzio-beyond-header {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 14px !important;
            }
            .sanzio-beyond-headline {
              width: 100% !important;
              max-width: 100% !important;
            }
            .sanzio-beyond-section h2 {
              font-size: 32px !important;
              max-width: none !important;
              line-height: 1.12 !important;
            }
            .sanzio-beyond-cta {
              display: inline-flex !important;
              align-items: center !important;
              padding: 6px 0 !important;
            }
            .sanzio-beyond-grid {
              grid-template-columns: 1fr !important;
              margin-top: 28px !important;
              gap: 16px !important;
            }
            .sanzio-beyond-section .sanzio-product-card {
              padding: 22px 18px !important;
            }
            .sanzio-site .sanzio-why-split-copy,
            .sanzio-site .sanzio-why-highlights {
              flex: none !important;
            }
            .sanzio-site .sanzio-why-title {
              font-size: 32px !important;
              max-width: none !important;
              line-height: 1.12 !important;
            }
            .sanzio-site .sanzio-why-lead {
              max-width: none !important;
              font-size: 15.5px !important;
            }
            .sanzio-site .sanzio-why-highlights {
              padding: 20px 18px !important;
            }
            .sanzio-site .sanzio-why-highlight-item {
              font-size: 14.5px !important;
              gap: 12px !important;
            }
            .sanzio-site .sanzio-why-highlight-item span {
              overflow-wrap: anywhere !important;
              word-break: break-word !important;
            }
            .sanzio-site .sanzio-why-section .sanzio-pillar-grid {
              margin-top: 40px !important;
            }
            .sanzio-site .sanzio-why-product-grid {
              margin-top: 32px !important;
              gap: 16px !important;
            }
            .sanzio-pillar-grid {
              grid-template-columns: 1fr !important;
            }
            .sanzio-pillar-grid > div {
              padding: 28px 0 0 !important;
              border-right: none !important;
            }
            .sanzio-why-product-grid {
              grid-template-columns: 1fr !important;
            }
            .sanzio-site .sanzio-product-card {
              padding: 24px 20px !important;
            }
            .sanzio-pricing-section,
            .sanzio-resources-section,
            .sanzio-demo-section {
              padding-left: 20px !important;
              padding-right: 20px !important;
            }
            .sanzio-pricing-section {
              padding-top: 32px !important;
              padding-bottom: 48px !important;
            }
            .sanzio-pricing-grid {
              grid-template-columns: 1fr !important;
            }
            .sanzio-demo-section {
              padding: 20px !important;
            }
            .sanzio-demo-banner {
              padding: 48px 24px !important;
            }
            .sanzio-suite-hero {
              padding: 48px 20px 56px !important;
            }
            .sanzio-suite-hero-title {
              font-size: 32px !important;
              line-height: 1.08 !important;
            }
            .sanzio-suite-hero-lead {
              font-size: 16px !important;
            }
            .sanzio-suite-hero-stats {
              grid-template-columns: 1fr !important;
              margin-top: 40px !important;
            }
            .sanzio-suite-section {
              padding-left: 20px !important;
              padding-right: 20px !important;
            }
            .sanzio-suite-why-grid {
              grid-template-columns: 1fr !important;
            }
            .sanzio-suite-products-grid {
              grid-template-columns: 1fr !important;
            }
            .sanzio-suite-connect-grid {
              grid-template-columns: 1fr !important;
              gap: 28px !important;
            }
            .sanzio-suite-cta-banner {
              padding: 32px 24px !important;
              flex-direction: column !important;
              align-items: flex-start !important;
            }
            .sanzio-site main section,
            .sanzio-site main article {
              padding-left: 20px !important;
              padding-right: 20px !important;
            }
            .sanzio-m-section {
              padding-top: 48px !important;
              padding-bottom: 48px !important;
            }
            .sanzio-m-section-hero {
              padding-top: 40px !important;
              padding-bottom: 40px !important;
            }
            .sanzio-m-grid-2,
            .sanzio-m-grid-3,
            .sanzio-m-grid-4,
            .sanzio-m-grid-5,
            .sanzio-m-split {
              grid-template-columns: 1fr !important;
            }
            .sanzio-m-flex-stack {
              flex-direction: column !important;
              align-items: stretch !important;
            }
            .sanzio-suite-section {
              padding-top: 48px !important;
              padding-bottom: 48px !important;
            }
            .sanzio-site .sanzio-footer-inner {
              grid-template-columns: 1fr !important;
              gap: 28px !important;
            }
            .sanzio-site .sanzio-footer-cols {
              grid-template-columns: 1fr 1fr !important;
              gap: 28px 16px !important;
            }
            .sanzio-site .sanzio-footer-tagline {
              max-width: none !important;
            }
            .sanzio-site .sanzio-footer-legal {
              flex-direction: row !important;
              flex-wrap: wrap !important;
              gap: 6px 14px !important;
              align-items: center !important;
              margin-top: 28px !important;
            }
            .sanzio-info-page h1,
            .sanzio-blog-page h1,
            .sanzio-blog-article h1 {
              font-size: 32px !important;
              line-height: 1.1 !important;
            }
            .sanzio-product-page h1 {
              font-size: 34px !important;
              line-height: 1.08 !important;
            }
            .sanzio-connect-page h1 {
              font-size: 34px !important;
            }
            .sanzio-blog-featured {
              grid-template-columns: 1fr !important;
              margin-top: 32px !important;
              gap: 24px !important;
            }
            .sanzio-blog-featured h2 {
              font-size: 24px !important;
            }
            .sanzio-connect-hero {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
            }
            .sanzio-site .sanzio-why-buy-section {
              padding: 0 16px 40px !important;
            }
            .sanzio-site .sanzio-why-buy-banner {
              padding: 28px 20px 24px !important;
              border-radius: 18px !important;
            }
            .sanzio-site .sanzio-why-buy-banner h2 {
              font-size: 30px !important;
              line-height: 1.12 !important;
            }
            .sanzio-site .sanzio-why-buy-split,
            .sanzio-site .sanzio-why-buy-features {
              grid-template-columns: 1fr !important;
            }
            .sanzio-site .sanzio-why-buy-actions {
              flex-direction: column !important;
              align-items: stretch !important;
            }
            .sanzio-site .sanzio-why-buy-actions > a,
            .sanzio-site .sanzio-why-buy-actions > button {
              width: 100% !important;
              justify-content: center !important;
            }
            .sanzio-products-section {
              padding-top: 32px !important;
              padding-bottom: 32px !important;
            }
            .sanzio-products-section h2 {
              font-size: 32px !important;
            }
            .sanzio-products-section-head {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 20px !important;
            }
            .sanzio-products-tabs {
              width: 100% !important;
              max-width: 100% !important;
              flex-wrap: nowrap !important;
              overflow-x: auto !important;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;
            }
            .sanzio-products-tabs::-webkit-scrollbar {
              display: none;
            }
            .sanzio-products-tab-btn {
              flex: 0 0 auto !important;
              white-space: nowrap !important;
              padding: 10px 14px !important;
              font-size: 13px !important;
            }
            .sanzio-products-tab-layout {
              display: flex !important;
              flex-direction: column !important;
              margin-top: 24px !important;
              gap: 24px !important;
              align-items: stretch !important;
            }
            .sanzio-products-tab-copy {
              order: 1 !important;
              width: 100% !important;
              min-width: 0 !important;
            }
            .sanzio-products-tab-mock {
              order: 2 !important;
              width: 100% !important;
              min-width: 0 !important;
            }
            .sanzio-products-tab-copy h3 {
              font-size: 26px !important;
            }
            .sanzio-suite-intro-section {
              padding-top: 32px !important;
            }
            .sanzio-browser-mock {
              width: 100% !important;
              max-width: 100% !important;
            }
            .sanzio-browser-mock-body {
              flex-direction: column !important;
              min-height: 0 !important;
            }
            .sanzio-browser-mock-sidebar {
              width: 100% !important;
              flex: none !important;
              border-right: none !important;
              border-bottom: 1px solid #EEF1F4;
              padding: 10px 12px !important;
              display: flex !important;
              flex-direction: row !important;
              flex-wrap: nowrap !important;
              align-items: center !important;
              gap: 6px !important;
              overflow-x: auto !important;
              -webkit-overflow-scrolling: touch;
            }
            .sanzio-browser-mock-sidebar-logo {
              display: none !important;
            }
            .sanzio-browser-mock-nav-item {
              flex: 0 0 auto !important;
              white-space: nowrap !important;
              padding: 8px 12px !important;
              margin: 0 !important;
            }
            .sanzio-browser-mock-nav-item span:first-child {
              display: none !important;
            }
            .sanzio-browser-mock-main {
              padding: 16px 14px 20px !important;
              overflow: visible !important;
            }
            .sanzio-browser-mock-toolbar {
              flex-direction: column !important;
              align-items: flex-start !important;
            }
            .sanzio-browser-mock-actions {
              width: 100% !important;
              flex-wrap: wrap !important;
            }
            .sanzio-browser-mock-tiles {
              grid-template-columns: 1fr !important;
            }
            .sanzio-browser-mock-board {
              grid-template-columns: 1fr !important;
            }
            .sanzio-browser-mock-table-wrap {
              margin-top: 12px !important;
              overflow-x: auto !important;
              -webkit-overflow-scrolling: touch;
              max-width: 100%;
            }
            .sanzio-browser-mock-table-head,
            .sanzio-browser-mock-table-row {
              min-width: 280px !important;
            }
            .sanzio-browser-mock-col-name {
              width: 120px !important;
              flex-shrink: 0;
            }
            .sanzio-products-tab-side {
              grid-template-columns: 1fr !important;
            }
            .sanzio-site .sanzio-product-card-checklist {
              grid-template-columns: 1fr !important;
            }
            .sanzio-prod-kpi-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
            .sanzio-prod-chart-row {
              grid-template-columns: 1fr !important;
            }
            .sanzio-prod-module-row {
              grid-template-columns: 1fr !important;
            }
            .sanzio-dashboard-kpis {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
            .sanzio-beyond-split {
              grid-template-columns: 1fr !important;
            }
            .sanzio-contact-grid {
              grid-template-columns: 1fr !important;
            }
            .sanzio-site .sanzio-hero-grid {
              min-width: 0 !important;
            }
            .sanzio-demo-title {
              font-size: 32px !important;
            }
            .sanzio-demo-lead {
              font-size: 16px !important;
            }
            .sanzio-demo-orb-a {
              width: 240px !important;
              height: 240px !important;
              right: -40px !important;
              top: -40px !important;
            }
            .sanzio-demo-orb-b {
              width: 160px !important;
              height: 160px !important;
              right: 24px !important;
              bottom: -60px !important;
            }
            .sanzio-site .sanzio-nav-link:hover,
            .sanzio-site .sanzio-desktop-nav > a:hover {
              color: ${color.cyanInk} !important;
            }
            .sanzio-site .sanzio-row-hover:hover .sanzio-row-cta,
            .sanzio-site .sanzio-footer-link:hover,
            .sanzio-site .sanzio-suite-row:hover .sanzio-suite-cta {
              color: ${color.cyanInk} !important;
            }
          }
        `,
          }}
        />
    </div>
  );
}
