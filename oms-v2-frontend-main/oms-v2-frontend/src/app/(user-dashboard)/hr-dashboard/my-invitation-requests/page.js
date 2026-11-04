
import React, { Suspense } from "react";
import MyEmployeeInvitationRequests from "./MyEmployeeInvitationRequests";

export const metadata = {
  title: "My Invitation Requests | Sanzio",
  description: "View and manage invitation requests.",
};

const MyEmployeeInvitationRequestsPage = () => {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyEmployeeInvitationRequests />
    </Suspense>
  );
};

export default MyEmployeeInvitationRequestsPage;
