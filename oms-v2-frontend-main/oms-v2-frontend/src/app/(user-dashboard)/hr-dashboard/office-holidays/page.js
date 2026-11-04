import OfficeHolidays from "@/features/hr-dashboard/office-holidays/OfficeHolidays";
import { Suspense } from "react";

export const metadata = {
  title: "Office Holidays | Sanzio",
  description: "View and manage office holidays.",
};

const OfficeHolidaysPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OfficeHolidays />
    </Suspense>
  );
};

export default OfficeHolidaysPage;
