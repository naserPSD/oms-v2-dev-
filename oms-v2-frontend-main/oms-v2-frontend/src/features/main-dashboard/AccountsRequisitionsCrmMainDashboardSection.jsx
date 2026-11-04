"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CgTrending, CgTrendingDown } from "react-icons/cg";
import {
  FaCircleArrowDown,
  FaCircleArrowUp,
  FaMoneyBills,
  FaStar,
} from "react-icons/fa6";
import { HiDotsHorizontal } from "react-icons/hi";
import { Eye } from "lucide-react";
import DashboardRequisitionsCardSection from "./DashboardRequisitionsCardSection";

const AccountsRequisitionsCrmMainDashboardSection = ({
  requisitionData,
  hasPermission,
  crmData,
  accountsData,
}) => {
  const totalLeads = crmData?.totalLeads ?? crmData?.totalContacts ?? 0;
  const newLeads = crmData?.newLeads?.total || 0;
  const newLeadsPercentage = crmData?.newLeads?.percentage || 0;
  const newClients = crmData?.newClients?.total || 0;
  const newClientsPercentage = crmData?.newClients?.percentage || 0;

  // Accounts Data
  const dueTotal = accountsData?.dueInvoice?.total || 0;
  const dueAmount = accountsData?.dueInvoice?.amount || "0";
  const collectedTotal = accountsData?.collected?.totalBill || 0;
  const collectedAmount = accountsData?.collected?.amount || "0";
  const expenseCurrent = accountsData?.expenses?.currentMonth || "0";
  const expenseTrend = accountsData?.expenses?.trend || "down";
  const expensePrevious = accountsData?.expenses?.previousMonth || "0";

  return (
    <div className="flex flex-wrap gap-3">
      {hasPermission("dashboard.accounts") && (
        <div className="flex-1">
          <div>
            <div className=" flex sm:flex-row sm:items-center sm:justify-between flex-col gap-6 p-1">
              {" "}
              <p className="text-gray-700 dark:text-theme-light-text whitespace-nowrap">
                Accounts
              </p>{" "}
              <hr className="w-full hidden sm:flex" />
            </div>

            <div className="flex items-center flex-wrap gap-3">
              {/* 1st card Due Amount */}
              <div className="dark:bg-theme-dark bg-theme-light dark:text-theme-light-text text-theme-dark-text border rounded-md  flex-1">
                <div className="flex items-center gap-2 p-2.5 px-4 border-b text-xs font-bold text-gray-500">
                  {" "}
                  <FaStar className="text-destructive text-sm" /> Due invoice
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500">Total:</p>
                    <p className="text-gray-900 dark:text-theme-light-text font-bold">
                      {dueTotal}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500">Amount:</p>
                    <p className="text-gray-900 dark:text-theme-light-text font-bold">
                      {dueAmount}
                    </p>
                  </div>
                  <Link href="/accounts/invoices">
                    <Button
                      className={
                        "bg-primaryColor hover:bg-primaryColor-700 text-white py-2 my-1  font-bold w-full rounded-full"
                      }
                      size={"sm"}
                    >
                      View
                    </Button>
                  </Link>
                </div>
              </div>
              {/* 2nd Card Collected*/}
              <div className="dark:bg-theme-dark bg-theme-light dark:text-theme-light-text text-theme-dark-text border rounded-md flex-1">
                <div className="flex items-center gap-2 p-2.5 px-4 border-b text-xs font-bold text-gray-500">
                  {" "}
                  <FaStar className="text-secondaryColor text-sm" /> Collected
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500">Total bill:</p>
                    <p className="text-gray-900 dark:text-theme-light-text font-bold">
                      {collectedTotal}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500">Amount:</p>
                    <p className="text-gray-900 dark:text-theme-light-text font-bold">
                      {collectedAmount}
                    </p>
                  </div>
                  <Link href="/accounts/incomes">
                    <Button
                      className={
                        "bg-primaryColor hover:bg-primaryColor-700 text-white py-2 my-1  font-bold w-full rounded-full"
                      }
                      size={"sm"}
                    >
                      View
                    </Button>
                  </Link>
                </div>
              </div>
              {/* 3rd card expenses */}
              <div className="dark:bg-theme-dark bg-theme-light dark:text-theme-light-text text-theme-dark-text border rounded-md flex-1">
                <div className="flex items-center gap-2 p-2.5 px-4 border-b text-xs font-bold text-gray-500">
                  {" "}
                  <FaMoneyBills className="text-primaryColor text-sm" />{" "}
                  Expenses
                </div>

                <div className="p-4 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 pb-1">Current month</p>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 dark:text-theme-light-text font-bold">
                        {expenseCurrent}
                      </p>
                      <p>
                        {" "}
                        {expenseTrend === "up" ? (
                          <CgTrending className="text-destructive text-2xl" />
                        ) : (
                          <CgTrendingDown className="text-primaryColor text-2xl" />
                        )}
                      </p>
                    </div>
                  </div>

                  <hr />
                  <div>
                    <p className="text-xs text-gray-500 pb-1">Previous month</p>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 dark:text-theme-light-text font-bold">
                        {expensePrevious}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex  gap-3 flex-wrap">
        {hasPermission("dashboard.requisitions") && (
          <div className="flex-1">
            {/* Section Title */}
            <div className="flex sm:flex-row sm:items-center sm:justify-between flex-col gap-6 p-1">
              <p className="text-gray-700 dark:text-theme-light-text whitespace-nowrap">
                Requisitions
              </p>
              <hr className="w-full hidden sm:flex" />
            </div>
            {/*  Requisition Card */}
            <DashboardRequisitionsCardSection
              requisitionData={requisitionData}
            />
          </div>
        )}

        {hasPermission("dashboard.crm") && (
          <div className="flex-1">
            <div className="flex sm:flex-row sm:items-center sm:justify-between flex-col gap-6 p-1">
              <Link
                href="/crm/overview"
                className="text-gray-700 dark:text-theme-light-text hover:text-primaryColor font-medium whitespace-nowrap transition-colors"
                title="View CRM Overview"
              >
                CRM
              </Link>
              <hr className="w-full hidden sm:flex" />
            </div>

            <div className="flex items-center flex-wrap gap-3">
              <div className="dark:bg-theme-dark bg-theme-light dark:text-theme-light-text text-theme-dark-text border rounded-md  flex-1">
                <div className="mx-4 mb-3 mt-4  space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-sm font-bold">
                      Total leads
                    </p>
                    <div className="flex items-center gap-3">
                      <p className="text-gray-900 dark:text-theme-light-text font-bold">
                        {totalLeads?.toLocaleString()}{" "}
                      </p>
                      {/* <p className="size-6 bg-gray-100 rounded-full p-1  flex items-center justify-center ring-1 ring-gray-200">
                        <HiDotsHorizontal className="text-gray-500 text-base" />
                      </p> */}
                      <Link
                        href="/crm/leads"
                        title="View All Leads"
                        className="size-6 bg-gray-100 dark:bg-gray-700 rounded-full p-1 flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 hover:text-primaryColor transition-colors"
                      >
                        <Eye className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                  <hr />

                  <div>
                    <p className="text-xs text-gray-500 pb-1 ">Last month</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <p className="text-gray-500 font-bold">New leads</p>
                        <p className="flex items-center gap-2 pr-1">
                          {" "}
                          {newLeadsPercentage >= 0 ? (
                            <FaCircleArrowUp className="text-primaryColor-500 " />
                          ) : (
                            <FaCircleArrowDown className="text-red-500 " />
                          )}
                          <span
                            className={
                              newLeadsPercentage >= 0
                                ? "text-primaryColor-500 text-xs "
                                : "text-red-500 text-xs "
                            }
                          >
                            {newLeadsPercentage > 0 ? "+" : ""}
                            {newLeadsPercentage}%
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-gray-900 dark:text-theme-light-text font-bold">
                          {newLeads?.toLocaleString()}{" "}
                        </p>
                        {/* <p className="size-6 bg-gray-100 rounded-full p-1  flex items-center justify-center ring-1 ring-gray-200">
                          <HiDotsHorizontal className="text-gray-500 text-base" />
                        </p> */}
                        <Link
                          href="/crm/leads?leadStatus=Active"
                          title="View Leads"
                          className="size-6 bg-gray-100 dark:bg-gray-700 rounded-full p-1 flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 hover:text-primaryColor transition-colors"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <hr />

                  <div>
                    <p className="text-xs text-gray-500 pb-1">Last month</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <p className="text-gray-500 font-bold">New clients</p>
                        <p className="flex items-center gap-2 pr-1">
                          {" "}
                          {newClientsPercentage >= 0 ? (
                            <FaCircleArrowUp className="text-primaryColor-500 " />
                          ) : (
                            <FaCircleArrowDown className="text-red-500 " />
                          )}
                          <span
                            className={
                              newClientsPercentage >= 0
                                ? "text-primaryColor-500 text-xs "
                                : "text-red-500 text-xs "
                            }
                          >
                            {newClientsPercentage > 0 ? "+" : ""}
                            {newClientsPercentage}%
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-gray-900 dark:text-theme-light-text font-bold">
                          {newClients?.toLocaleString()}{" "}
                        </p>
                        {/* <p className="size-6 bg-gray-100 rounded-full p-1  flex items-center justify-center ring-1 ring-gray-200">
                          <HiDotsHorizontal className="text-gray-500 text-base" />
                        </p> */}
                        <Link
                          href="/crm/leads?leadStatus=Converted"
                          title="View Clients"
                          className="size-6 bg-gray-100 dark:bg-gray-700 rounded-full p-1 flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 hover:text-primaryColor transition-colors"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsRequisitionsCrmMainDashboardSection;
