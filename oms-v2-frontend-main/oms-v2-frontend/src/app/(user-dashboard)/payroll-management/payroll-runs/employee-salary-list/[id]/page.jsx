import EmployeeSalaryList from "@/features/payroll-management/payroll-runs/pages/EmployeeSalaryList";
import { Suspense } from "react";

export const metadata = {
    title: "Employee Salary List | Sanzio",
    description: "View and update employee salary list information.",
};

export default async function EmployeeSalaryListPage({ params }) {
    const { id } = await params;

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EmployeeSalaryList payrollRunId={id} />
        </Suspense>
    )
}