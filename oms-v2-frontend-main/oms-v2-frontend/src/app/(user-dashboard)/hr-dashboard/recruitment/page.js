// src/app/(user-dashboard)/hr-dashboard/recruitment/page.js
import JobRecruitment from "@/features/hr-dashboard/recruitment/JobRecruitment";
import { Suspense } from "react";

export const metadata = {
  title: "Job Recruitment | Sanzio",
  description: "View and manage job recruitment information.",
};

const JobRecruitmentPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobRecruitment />
    </Suspense>
  );
};

export default JobRecruitmentPage;
