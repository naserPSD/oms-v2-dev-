import MasterAssetTypesTable from "@/features/master-asset-types/components/MasterAssetTypesTable";
import React, { Suspense } from "react";

export const metadata = {
  title: "Master Asset Types",
  description: "Manage global asset types",
};

export default function MasterAssetTypesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MasterAssetTypesTable />
    </Suspense>
  );
}
