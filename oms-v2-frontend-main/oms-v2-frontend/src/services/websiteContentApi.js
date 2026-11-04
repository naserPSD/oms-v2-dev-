import { publicApiFetch } from "@/services/publicApiFetch";

function websiteFetch(path, { revalidate = 60 } = {}) {
  return publicApiFetch(path, { revalidate });
}

export async function fetchWebsiteSection(sectionKey) {
  if (!sectionKey) {
    return { meta: null, items: [] };
  }

  try {
    const res = await websiteFetch(
      `/api/v1/website-contents/by-section/${encodeURIComponent(sectionKey)}`
    );
    if (!res.ok) {
      console.error(
        "Failed to fetch website section:",
        res.status,
        await res.text()
      );
      return { meta: null, items: [] };
    }
    const json = await res.json();
    return json?.data || { meta: null, items: [] };
  } catch (error) {
    console.error("Website section fetch error:", error?.message || error);
    return { meta: null, items: [] };
  }
}
