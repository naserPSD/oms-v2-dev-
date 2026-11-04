import { Suspense } from "react";
import WebsiteSettingsDashboard from "@/features/website-settings";

export const metadata = {
  title: "Website Setting | Sanzio",
  description: "Manage dynamic public website content.",
};

export default function WebsiteSettingsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <WebsiteSettingsDashboard />
    </Suspense>
  );
}
