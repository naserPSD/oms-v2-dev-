import Holiday from "@/features/hr-dashboard/holidays/Holiday"
import { Suspense } from "react";

export const metadata = {
  title: "Holidays | Sanzio",
  description: "View and manage holidays.",
};

const HolidaysPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Holiday />
    </Suspense>
  )
}

export default HolidaysPage