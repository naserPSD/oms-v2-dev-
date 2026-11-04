import JobPositionList from "@/features/recruitment/job-position-list";
import { Suspense } from "react";

export const metadata = {
  title: "Job Position",
  description: "View and manage job position.",
};

const JobPositionListPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobPositionList />
    </Suspense>
  );
};

export default JobPositionListPage;
