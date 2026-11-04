import JobPostingList from "@/features/recruitment/job-posting-list";
import { Suspense } from "react";

export const metadata = {
  title: "Job Posting List",
  description: "View and manage job posting.",
};

const JobPostingListPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobPostingList />
    </Suspense>
  );
};

export default JobPostingListPage;
