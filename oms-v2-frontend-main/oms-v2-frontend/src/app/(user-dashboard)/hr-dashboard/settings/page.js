import HrSettingsComponent from "@/features/hr-dashboard/hr-settings/HrSettingsComponent";
import { Suspense } from "react";

export const metadata = {
  title: "HR Settings | Sanzio",
  description: "View and manage HR settings.",
};

const HrSettingsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HrSettingsComponent />
    </Suspense>
  );
};

export default HrSettingsPage;
