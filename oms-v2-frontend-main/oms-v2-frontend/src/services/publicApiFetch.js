import http from "node:http";
import https from "node:https";

// Remote API calls during a parallel build often take longer than a local
// refusal. Keep this under the 60s static-page limit so a dead host still fails.
const BUILD_TIMEOUT_MS = 10000;
const RUNTIME_TIMEOUT_MS = 8000;

function getBaseUrl() {
  return process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PROD_BASE_URL
    : process.env.NEXT_PUBLIC_DEV_BASE_URL;
}

// Next's fetch cache drops AbortSignal while refreshing a stale entry.
// A build-time request that bypasses that cache cannot hold prerender open.
function requestDuringBuild(url) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const transport = target.protocol === "https:" ? https : http;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), BUILD_TIMEOUT_MS);

    const req = transport.request(
      target,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      },
      (incoming) => {
        const chunks = [];
        incoming.on("data", (chunk) => chunks.push(chunk));
        incoming.on("end", () => {
          clearTimeout(timer);
          const body = Buffer.concat(chunks).toString("utf8");
          const status = incoming.statusCode || 0;
          resolve({
            ok: status >= 200 && status < 300,
            status,
            text: async () => body,
            json: async () => (body ? JSON.parse(body) : null),
          });
        });
      }
    );

    req.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    req.end();
  });
}

export async function publicApiFetch(path, { revalidate = 60 } = {}) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("API base URL is not configured");
  }

  const url = `${baseUrl}${path}`;
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return requestDuringBuild(url);
  }

  return fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(RUNTIME_TIMEOUT_MS),
    next: revalidate === false ? { revalidate: 0 } : { revalidate },
  });
}
