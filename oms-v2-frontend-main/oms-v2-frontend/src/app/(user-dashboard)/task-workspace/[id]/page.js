import React, { Suspense } from "react";
import BoardPage from "@/features/tasks/BoardPage";

export const metadata = {
  title: "Task Workspace | Sanzio",
  description: "View and update task workspace information.",
};

// Server Component
const TaskPage = async ({ params }) => { 
  const { id: workspaceId } = await params; 

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BoardPage workspaceId={workspaceId} />
    </Suspense>
  );
};

export default TaskPage;
