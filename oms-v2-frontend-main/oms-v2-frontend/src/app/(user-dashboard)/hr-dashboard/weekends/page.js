import Weekends from "@/features/hr-dashboard/weekends/Weekends";
import React, { Suspense } from "react";

export const metadata = {
  title: "Weekends | Sanzio",
  description: "View and manage weekends.",
};

const WeekendsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Weekends />
    </Suspense>
  );
};

export default WeekendsPage;
