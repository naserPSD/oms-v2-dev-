// /tabs/EmployeeHistoryTab.jsx
"use client";
import ButtonTw from "@/components/ui/ButtonTw";
import "react-image-crop/dist/ReactCrop.css";

const SalaryAndPayrollTab = () => {
  return (
    <>
      <div className="flex flex-col gap-4 border rounded-lg p-4">
        {/* Salary Grade */}
        <h4 className="font-bold text-lg title-color">Salary Grade</h4>
        <div className="border py-2  px-4 max-w-sm">A</div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Salary Details</h4>
        </div>
        {/* Salary Details Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-center">Sl.</th>
                <th>Payroll Name</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center">01</td>
                <td>Basic Salary</td>
                <td className="text-end">20000</td>
              </tr>
              <tr>
                <td className="text-center">02</td>
                <td>House rant</td>
                <td className="text-end">12000</td>
              </tr>
              <tr>
                <td className="text-center">03</td>
                <td>Medical Allowance</td>
                <td className="text-end">1500</td>
              </tr>
              <tr>
                <td colSpan={2}>Gross Salary </td>
                <td className="text-end">42000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Payment History</h4>
          <ButtonTw
            // onClick={() => setOpen(true)}
            variant="blue"
            size="sm"
            className="mt-2"
          >
            <i className="fa-solid fa-plus"></i>Add New
          </ButtonTw>
          {/* Modal for payment history */}
        </div>

        {/* Payment history table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Sl.</th>
                <th>Date</th>
                <th>Particular </th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>01</td>
                <td>11 March 2025</td>
                <td>Notepad</td>
                <td className="text-end">32000.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SalaryAndPayrollTab;
