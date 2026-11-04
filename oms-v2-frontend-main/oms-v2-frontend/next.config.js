// File: next.config.js
// import withFlowbiteReact from "flowbite-react/plugin/nextjs";
// const withFlowbiteReact = require('flowbite-react/plugin/nextjs');
import path from "path";
import { fileURLToPath } from "url";
import withBundleAnalyzer from "@next/bundle-analyzer";
import withPWA from "next-pwa";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pwaDefaultCache = require("next-pwa/cache");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

const withPWAPlugin = withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    cacheOnFrontEndNav: false,
    reloadOnOnline: true,
    runtimeCaching: [
        {
            urlPattern: /\/_next\/static\/.*/i,
            handler: "NetworkFirst",
            options: {
                cacheName: "next-static-build",
                networkTimeoutSeconds: 10,
                expiration: {
                    maxEntries: 256,
                    maxAgeSeconds: 60 * 60 * 24,
                },
            },
        },
        ...pwaDefaultCache,
    ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Dev chunk names stay stable, and they were cached as immutable. A prefix
    // makes the browser request new URLs instead of the stuck login bundle.
    ...(process.env.NODE_ENV === "development"
        ? { assetPrefix: "/dev-assets" }
        : {}),
    reactStrictMode: true,
    compress: true,
    output: 'standalone', // Enable standalone output for Docker
    outputFileTracingRoot: path.resolve(__dirname),
    serverExternalPackages: ['mysql2'], // Keep mysql2 as external (native bindings)
    cacheComponents: true,
    // experimental: {
    //     useCache: true,
    // },
    images: {
        qualities: [75, 80],
        // domains: ['localhost', 'erp.studypress.org'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '4000',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'erp.studypress.org',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'erp.studypress.org',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'oms.studypress.org',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'oms.studypress.org',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'sanzio.app',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'sanzio.app',
                pathname: '/**',
            },
        ],
    },
    async headers() {
        const longCache = "public, max-age=31536000, immutable";
        // Turbopack dev reuses chunk filenames. Immutable caching keeps the old
        // login bundle (and its broken import) for a year.
        const staticCache =
            process.env.NODE_ENV === "development"
                ? "no-store, must-revalidate"
                : longCache;
        return [
            {
                source: "/images/:path*",
                headers: [{ key: "Cache-Control", value: longCache }],
            },
            {
                source: "/_next/static/:path*",
                headers: [{ key: "Cache-Control", value: staticCache }],
            },
            {
                source: "/_next/image",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=86400, stale-while-revalidate=604800",
                    },
                ],
            },
        ];
    },
    async redirects() {
        return [
            {
                source: "/suite",
                destination: "/sanzio-hr-management",
                permanent: true,
            },
            {
                source: "/products/hr",
                destination: "/sanzio-hr-management",
                permanent: true,
            },
        ];
    },
    async rewrites() {
        const adminRewrites = [
            // Admin panel paths — map /admin/settings/* → /settings/*
            // This means no new page files are needed when adding new admin
            // permissions. Just set the path in DB starting with /admin/
            // and AdminGuard (in /admin/layout.js) will protect it.
            {
                source: '/admin/settings/:path*',
                destination: '/settings/:path*',
            },
            {
                source: '/admin/hr-dashboard/:path*',
                destination: '/hr-dashboard/:path*',
            },
            {
                source: '/admin/crm/:path*',
                destination: '/crm/:path*',
            },
            {
                source: '/admin/accounts/:path*',
                destination: '/accounts/:path*',
            },
            {
                source: '/admin/subscription/:path*',
                destination: '/subscription/:path*',
            },
        ];

        const backendBase =
            process.env.NODE_ENV === "production"
                ? "http://localhost:3001"
                : (process.env.NEXT_PUBLIC_DEV_BASE_URL || "http://localhost:4000");

        const staticRewrites = [
            ...adminRewrites,
            {
                source: '/static/:path*',
                destination: `${backendBase}/api/static/:path*`,
            },
        ];

        if (process.env.NODE_ENV !== "development") {
            return staticRewrites;
        }

        return {
            beforeFiles: [
                {
                    source: "/dev-assets/_next/:path*",
                    destination: "/_next/:path*",
                },
            ],
            afterFiles: adminRewrites,
        };
    },
    turbopack: {
        root: path.resolve(__dirname),
    },
    // Note: Next.js no longer supports the `eslint` option inside
    // `next.config.js`. If you relied on `ignoreDuringBuilds`, move that
    // behavior to a lint script or CI step instead.
    // webpack: (config) => {
    //     return config;
    // },
    // experimental: {
    //     turbo: false // Force Webpack instead of Turbopack
    // }
};

// PWA uses webpack/workbox — keep it off the dev Turbopack graph (and avoid
// patched webpack hooks from tooling such as Console Ninja breaking the build).
const configWithPlugins =
    process.env.NODE_ENV === "development"
        ? withAnalyzer(nextConfig)
        : withAnalyzer(withPWAPlugin(nextConfig));

export default configWithPlugins;
