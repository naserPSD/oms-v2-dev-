"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import { toaster } from "@/utils/helpers";
import { fetchBlogsAdmin } from "@/services/blogAdminApi";
import { addOrUpdateWebsiteContent } from "@/services/websiteSettingsAdminApi";
import { PUBLIC_ROUTES } from "@/features/landing/seo/publicRoutes";
import { PAGE_SEO_SECTION, pageSeoSlug } from "@/features/landing/seo/pageMetadata";
import useWebsiteSettingsQueryApi from "@/hooks/queryApi/useWebsiteSettingsQueryApi";

function blogRows(payload) {
  const list = payload?.data || payload?.items || [];
  return Array.isArray(list) ? list : [];
}

export default function PageSeoSettings() {
  const queryClient = useQueryClient();
  const { useWebsiteContentsQuery } = useWebsiteSettingsQueryApi();
  const { data, isFetching } = useWebsiteContentsQuery({
    page: 1,
    limit: 200,
    sectionKey: PAGE_SEO_SECTION,
    sort: "sortOrder:asc",
  });
  const { data: blogData, isFetching: blogsLoading } = useQuery({
    queryKey: ["pageSeoBlogs"],
    queryFn: () => fetchBlogsAdmin({ page: 1, limit: 100, sort: "publishedAt:desc" }),
  });

  const savedByPath = useMemo(() => {
    const map = new Map();
    for (const row of data?.data || []) {
      const key = pageSeoSlug(row.slug || "");
      if (key) map.set(key, row);
    }
    return map;
  }, [data]);

  const pages = useMemo(() => {
    const staticPages = PUBLIC_ROUTES.map((route) => ({
      path: route.path,
      label: route.title,
      defaultTitle: route.metaTitle || route.title,
      defaultDescription: route.metaDescription || route.description,
    }));
    const posts = blogRows(blogData)
      .filter((post) => post?.slug)
      .map((post) => ({
        path: `/blog/${post.slug}`,
        label: post.title || post.slug,
        defaultTitle: post.seoTitle || post.title || "",
        defaultDescription: post.seoDescription || post.excerpt || "",
      }));
    return [...staticPages, ...posts];
  }, [blogData]);

  const [drafts, setDrafts] = useState({});
  const [savingPath, setSavingPath] = useState("");

  useEffect(() => {
    if (isFetching || blogsLoading) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const page of pages) {
        const saved = savedByPath.get(page.path);
        const current = next[page.path];
        if (!current) {
          next[page.path] = {
            id: saved?.id,
            title: saved?.title || page.defaultTitle,
            description: saved?.description || page.defaultDescription,
          };
        } else if (saved?.id && !current.id) {
          next[page.path] = { ...current, id: saved.id };
        }
      }
      return next;
    });
  }, [pages, savedByPath, isFetching, blogsLoading]);

  const saveMutation = useMutation({
    mutationFn: addOrUpdateWebsiteContent,
    onSuccess: () => {
      toaster("Page meta saved", "success");
      queryClient.invalidateQueries({ queryKey: ["websiteContents"] });
    },
    onError: (error) => {
      toaster(error?.response?.data?.message || "Could not save page meta", "error");
    },
    onSettled: () => setSavingPath(""),
  });

  const updateDraft = (path, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [path]: { ...prev[path], [field]: value },
    }));
  };

  const savePage = (page, index) => {
    const draft = drafts[page.path] || {};
    setSavingPath(page.path);
    saveMutation.mutate(
      {
        id: draft.id || undefined,
        sectionKey: PAGE_SEO_SECTION,
        slug: page.path,
        contentType: "item",
        title: (draft.title || "").trim(),
        description: (draft.description || "").trim(),
        sortOrder: index,
        isActive: true,
      },
      {
        onSuccess: (result) => {
          const id = result?.data?.id || result?.id || draft.id;
          if (id) {
            setDrafts((prev) => ({
              ...prev,
              [page.path]: { ...prev[page.path], id },
            }));
          }
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Meta title and description for every public page in the sitemap. Empty
        saved text falls back to the current default. Blog articles are included
        from published posts.
      </p>
      {pages.map((page, index) => {
        const draft = drafts[page.path] || {
          title: page.defaultTitle,
          description: page.defaultDescription,
        };
        return (
          <div
            key={page.path}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                {page.label}
              </h2>
              <code className="text-xs text-gray-500">{page.path}</code>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Input
                label="Meta title"
                value={draft.title || ""}
                onChange={(value) => updateDraft(page.path, "title", value)}
              />
              <Input
                type="textarea"
                label="Meta description"
                rows={3}
                value={draft.description || ""}
                onChange={(value) =>
                  updateDraft(page.path, "description", value)
                }
              />
            </div>
            <div className="mt-3 flex justify-end">
              <ButtonTw
                type="button"
                variant="blue"
                disabled={savingPath === page.path}
                onClick={() => savePage(page, index)}
              >
                {savingPath === page.path ? "Saving..." : "Save"}
              </ButtonTw>
            </div>
          </div>
        );
      })}
    </div>
  );
}
