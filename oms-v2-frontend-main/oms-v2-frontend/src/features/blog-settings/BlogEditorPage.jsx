"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SwitchButton from "@/components/ui/SwitchButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SITE } from "@/features/landing/seo/site";
import { resolveBlogSeo } from "@/features/landing/blog/blogSeo";
import useBlogQueryApi from "@/hooks/queryApi/useBlogQueryApi";
import BlogBodyEditor from "@/features/blog-settings/BlogBodyEditor";
import BlogImageUploadField from "@/features/blog-settings/BlogImageUploadField";
import {
  BLOG_FORM_INITIAL,
  blogApiToFormValues,
  blogFormSchema,
  formValuesToBlogPayload,
} from "@/features/blog-settings/blogFormUtils";

function CharHint({ value, max, recommended }) {
  const len = (value || "").length;
  const over = len > max;
  return (
    <p
      className={`text-xs mt-1 ${over ? "text-red-500" : "text-gray-500"}`}
    >
      {len}/{max} chars
      {recommended ? ` · recommended ≤ ${recommended}` : ""}
    </p>
  );
}

export default function BlogEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const isEdit = !!id;

  const {
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(blogFormSchema),
    defaultValues: BLOG_FORM_INITIAL,
    mode: "onChange",
  });

  const { useBlogByIdQuery, addOrUpdateBlogMutation } = useBlogQueryApi({
    reset,
    setError,
    onSaveSuccess: (_, variables) => {
      router.push("/settings/blog-settings");
    },
  });

  const { data: blogData, isLoading: isLoadingBlog } = useBlogByIdQuery(id, {
    enabled: isEdit,
  });

  useEffect(() => {
    if (blogData) {
      reset(blogApiToFormValues(blogData));
    }
  }, [blogData, reset]);

  const watched = watch();
  const seoPreview = resolveBlogSeo({
    slug: watched.slug || "your-slug",
    title: watched.title,
    excerpt: watched.excerpt,
    seoTitle: watched.seoTitle,
    seoDescription: watched.seoDescription,
    seoKeywords: watched.seoKeywords,
    coverImage: watched.coverImage,
    ogImage: watched.ogImage,
    canonicalUrl: watched.canonicalUrl,
    noIndex: watched.noIndex,
  });

  const fillSeoFromContent = () => {
    if (watched.title && !watched.seoTitle) {
      setValue("seoTitle", watched.title.slice(0, 255));
    }
    if (watched.excerpt && !watched.seoDescription) {
      setValue("seoDescription", watched.excerpt.slice(0, 320));
    }
    if (watched.coverImage && !watched.ogImage) {
      setValue("ogImage", watched.coverImage);
    }
  };

  const onSubmit = async (values) => {
    await addOrUpdateBlogMutation.mutateAsync(formValuesToBlogPayload(values));
  };

  if (isEdit && isLoadingBlog) {
    return (
      <div className="container my-5 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-wrap items-center justify-between gap-3 my-5">
          <div>
            <Link
              href="/settings/blog-settings"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 mb-2"
            >
              <ArrowLeft size={16} /> Back to blog list
            </Link>
            <h1 className="title-color font-bold text-lg">
              {isEdit ? "Edit Blog Post" : "Add New Blog Post"}
            </h1>
          </div>
          {isEdit && watched.slug ? (
            <Link
              href={`/blog/${watched.slug}`}
              target="_blank"
              className="text-sm font-medium text-gray-600 hover:text-blue-600"
            >
              Preview on site →
            </Link>
          ) : null}
        </div>

        <Card className="pt-4 mb-4 gap-4">
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-x-4">
              <div className="col-span-12 lg:col-span-8">
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Title *"
                      {...field}
                      error={errors.title?.message}
                    />
                  )}
                />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <Controller
                  name="slug"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="URL slug"
                      placeholder="auto-from-title"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Input label="Category" {...field} />
                  )}
                />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <Controller
                  name="readTime"
                  control={control}
                  render={({ field }) => (
                    <Input label="Read time" {...field} />
                  )}
                />
              </div>
              <div className="col-span-12">
                <Controller
                  name="coverImage"
                  control={control}
                  render={({ field }) => (
                    <BlogImageUploadField
                      label="Cover image"
                      hint="Shown on the blog list and at the top of the post."
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="col-span-12">
                <Controller
                  name="excerpt"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Excerpt / lead"
                      type="textarea"
                      rows={2}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="col-span-12 min-w-0 pb-4">
                <Controller
                  name="bodyHtml"
                  control={control}
                  render={({ field, fieldState }) => (
                    <BlogBodyEditor
                      editorKey={
                        isEdit
                          ? `edit-${id}-${blogData?.updatedAt ?? "load"}`
                          : "new"
                      }
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pt-4 mb-4 gap-4">
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Author & publishing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-x-4">
              <div className="col-span-12 lg:col-span-4">
                <Controller
                  name="authorName"
                  control={control}
                  render={({ field }) => (
                    <Input label="Author name" {...field} />
                  )}
                />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <Controller
                  name="authorRole"
                  control={control}
                  render={({ field }) => (
                    <Input label="Author role" {...field} />
                  )}
                />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <Controller
                  name="publishedAt"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Published at"
                      type="datetime-local"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="col-span-12">
                <Controller
                  name="isPublished"
                  control={control}
                  render={({ field }) => (
                    <SwitchButton
                      label="Published on website"
                      enabled={!!field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pt-4 mb-4 gap-4">
          <CardHeader className="pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-base">SEO & social</CardTitle>
            <ButtonTw
              type="button"
              variant="alternative"
              size="sm"
              onClick={fillSeoFromContent}
            >
              Fill from content
            </ButtonTw>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-x-4">
              <div className="col-span-12 lg:col-span-6">
                <Controller
                  name="seoTitle"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input label="SEO title (meta title)" {...field} />
                      <CharHint
                        value={field.value}
                        max={255}
                        recommended={60}
                      />
                    </>
                  )}
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <Controller
                  name="canonicalUrl"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Canonical URL"
                      placeholder={`${SITE.url}/blog/...`}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="col-span-12">
                <Controller
                  name="seoDescription"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input
                        label="Meta description"
                        type="textarea"
                        rows={3}
                        {...field}
                      />
                      <CharHint
                        value={field.value}
                        max={320}
                        recommended={160}
                      />
                    </>
                  )}
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <Controller
                  name="seoKeywords"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Keywords (comma-separated)"
                      placeholder="payroll, HR, Sanzio"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <Controller
                  name="ogImage"
                  control={control}
                  render={({ field }) => (
                    <BlogImageUploadField
                      label="Social share image (Open Graph)"
                      hint="Used when the post is shared. Leave empty to use the cover image."
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="col-span-12">
                <Controller
                  name="noIndex"
                  control={control}
                  render={({ field }) => (
                    <SwitchButton
                      label="Hide from search engines (noindex)"
                      enabled={!!field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="col-span-12 mt-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Search preview
                </p>
                <p className="text-blue-700 dark:text-blue-400 text-lg leading-snug">
                  {seoPreview.title || "Page title"}
                </p>
                <p className="text-green-700 dark:text-green-500 text-sm truncate">
                  {seoPreview.canonical}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                  {seoPreview.description || "Meta description will appear here."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-row justify-end my-4 mb-8 gap-4">
          <ButtonTw
            type="button"
            size="sm"
            variant="outline.gray"
            className="font-bold px-18"
            onClick={() => router.push("/settings/blog-settings")}
          >
            Cancel
          </ButtonTw>
          <ButtonTw
            type="submit"
            size="sm"
            variant="default"
            className="font-bold px-18"
            loading={addOrUpdateBlogMutation.isPending}
          >
            {isEdit ? "Update" : "Save"}
          </ButtonTw>
        </div>
      </form>
    </div>
  );
}
