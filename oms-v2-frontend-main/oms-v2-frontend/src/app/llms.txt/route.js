import { fetchPublishedBlogs } from "@/services/blogApi";
import { absoluteUrl, PUBLIC_ROUTES } from "@/features/landing/seo/publicRoutes";
import { SITE } from "@/features/landing/seo/site";

function linkLine(title, path, description) {
  const detail = description ? `: ${description}` : "";
  return `- [${title}](${absoluteUrl(path)})${detail}`;
}

export async function GET() {
  const groups = {
    Products: PUBLIC_ROUTES.filter((route) =>
      [
        "/sanzio-hr-management",
        "/products/payroll",
        "/products/workspace",
        "/products/recruitment",
        "/connect",
      ].includes(route.path)
    ),
    Company: PUBLIC_ROUTES.filter((route) =>
      ["/", "/pricing", "/about", "/contact", "/blog"].includes(route.path)
    ),
    Help: PUBLIC_ROUTES.filter((route) => ["/faq", "/help"].includes(route.path)),
    Policies: PUBLIC_ROUTES.filter((route) =>
      ["/privacy", "/terms"].includes(route.path)
    ),
  };

  let posts = [];
  try {
    const result = await fetchPublishedBlogs({ page: 1, limit: 20, revalidate: 3600 });
    posts = Array.isArray(result?.data) ? result.data : [];
  } catch {
    posts = [];
  }

  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "Sanzio is a workforce platform. HR Management, Payroll, Workspace and Recruitment share one foundation. Sanzio Connect handles SMS, Email and WhatsApp campaigns from a separate dashboard.",
    "",
    "The signed-in product (dashboards, settings, payroll runs, employee records) is private and is not listed here.",
    "",
  ];

  for (const [heading, routes] of Object.entries(groups)) {
    lines.push(`## ${heading}`, "");
    for (const route of routes) {
      lines.push(linkLine(route.title, route.path, route.description));
    }
    lines.push("");
  }

  const published = posts.filter((post) => post?.slug && post?.title);
  if (published.length) {
    lines.push("## Latest articles", "");
    for (const post of published) {
      const excerpt = (post.excerpt || "").replace(/\s+/g, " ").trim();
      lines.push(linkLine(post.title, `/blog/${post.slug}`, excerpt));
    }
    lines.push("");
  }

  lines.push(
    "## Machine-readable",
    "",
    linkLine("Sitemap", "/sitemap.xml", "Every public URL, including blog posts."),
    linkLine("Robots", "/robots.txt", "Public pages are allowed. App and account routes are disallowed."),
    ""
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
