import { Suspense } from "react";
import BlogSettingsDashboard from "@/features/blog-settings";

export const metadata = {
  title: "Blog Settings | Sanzio",
  description: "Manage public blog posts.",
};

export default function BlogSettingsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <BlogSettingsDashboard />
    </Suspense>
  );
}
