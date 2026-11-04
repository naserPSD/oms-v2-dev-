import HrRecruitment from "@/features/hr-dashboard/hr-recruitment/HrRecruitment";
import { Suspense } from "react";

export const metadata = {
  title: "Recruitment | Sanzio",
  description: "View and manage recruitment.",
};

const RecruitmentPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HrRecruitment />
    </Suspense>
  );
};

export default RecruitmentPage;
