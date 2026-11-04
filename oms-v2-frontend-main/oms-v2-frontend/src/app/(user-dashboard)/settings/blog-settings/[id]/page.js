import { Suspense } from "react";
import BlogEditorPage from "@/features/blog-settings/BlogEditorPage";

export const metadata = {
  title: "Edit Blog Post | Sanzio",
  description: "Update blog content and SEO settings.",
};

export default function EditBlogPostPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <BlogEditorPage />
    </Suspense>
  );
}
