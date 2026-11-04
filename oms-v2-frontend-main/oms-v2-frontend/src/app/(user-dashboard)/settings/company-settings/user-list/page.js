import { Suspense } from "react";
import { redirect } from "next/navigation";

async function Redirector({ searchParams }) {
  const params = await searchParams;
  const queryString = params ? new URLSearchParams(params).toString() : "";
  redirect(`/settings/company-user-list${queryString ? `?${queryString}` : ""}`);
}

export default function LegacyCompanyUsersPage({ searchParams }) {
  return (
    <Suspense>
      <Redirector searchParams={searchParams} />
    </Suspense>
  );
}
