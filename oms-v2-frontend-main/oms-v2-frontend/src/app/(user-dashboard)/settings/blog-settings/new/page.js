import { Suspense } from "react";
import BlogEditorPage from "@/features/blog-settings/BlogEditorPage";

export const metadata = {
  title: "Add Blog Post | Sanzio",
  description: "Create a new public blog post with SEO settings.",
};

export default function NewBlogPostPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <BlogEditorPage />
    </Suspense>
  );
}
