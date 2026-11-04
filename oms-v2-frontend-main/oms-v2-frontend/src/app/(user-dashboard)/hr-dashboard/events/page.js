import Events from "@/features/hr-dashboard/events/Events";
import Eventss from "@/features/hr-dashboard/events/Eventss";
import React from "react";
import { Suspense } from "react";

export const metadata = {
  title: "Events | Sanzio",
  description: "View and manage events.",
};

const EventsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Eventss />
    </Suspense>
  );
};

export default EventsPage;
