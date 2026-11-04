import WorkSpace from "@/features/tasks/workspace/WorkSpace";
import React, { Suspense } from "react";

export const metadata = {
  title: "Task Workspace | Sanzio",
  description: "View and update task workspace information.",
};

const WorkSpacePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkSpace />{" "}
    </Suspense>
  );
};

export default WorkSpacePage;
