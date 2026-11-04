// Reachability check for the app itself. Do not call external hosts here —
// that blocks the dev server and delays page navigations.

export function GET() {
  return Response.json(
    {
      status: "ok",
      timestamp: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}
