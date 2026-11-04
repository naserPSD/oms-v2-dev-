import TrainingRequest from "@/features/hr-dashboard/training-request/TrainingRequest";
import React, { Suspense } from "react";

export const metadata = {
  title: "Training Request | Sanzio",
  description: "View and manage training requests.",
};

const TrainingRequestPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrainingRequest />
    </Suspense>
  );
};

export default TrainingRequestPage;
