import PayItemsComponent from "@/features/payroll-management/pay-items/PayItemsComponent";
import React, { Suspense } from "react";

export const metadata = {
  title: "Pay Items | Sanzio",
  description: "View and update pay items information.",
};

const PayItemsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PayItemsComponent />
    </Suspense>
  );
};

export default PayItemsPage;
