"use client";
// import { useAuthStore } from "@/store/useAuthStore";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useTasksQueryApi } from "@/hooks/queryApi/useTasksQueryApi";
import { handleLogout } from "@/utils/commonApiFunction";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { BiCollapse } from "react-icons/bi";
import { FaAngleLeft, FaCopyright } from "react-icons/fa";
import { FcMoneyTransfer } from "react-icons/fc";
import { GiToken } from "react-icons/gi";
import { HiMiniCalculator, HiUsers } from "react-icons/hi2";
import { RiPieChart2Fill } from "react-icons/ri";
import { TbLogout2 } from "react-icons/tb";
import { dropDownItems, DropdownSection } from "./DropdownSection";
import { WorkspaceDropdownSection } from "./WorkSpaceDropdownSection";
import { useAuthStore } from "@/store/useAuthStore";

const StaticSidebar = ({
  isCollapsed,
  setIsCollapsed,
  isMobileSidebarOpen,
  setMobileSidebarOpen,
  handleAddWorkSpace,
}) => {
  const authUser = useAuthStore((state) => state.user);
  const leftSidebarMenu = useAuthStore((state) => state.leftSidebarMenu);

  console.log('leftSidebarMenu===', leftSidebarMenu)
  // const { logout } = useAuth();
  const router = useRouter();
  // const { setAuth, clearAuth } = useAuthStore.getState();
  // const callLoginApi = useAuthStore((state) => state.callLoginApi);
  // const [accessToken, setAccessToken] = useState(undefined); // undefi

  // Set initial state based on screen size
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      if (isDesktop) {
        setMobileSidebarOpen(false);
        setIsCollapsed(false); // Expanded by default on desktop
      } else {
        setIsCollapsed(true); // Collapsed by default on mobile
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsCollapsed, setMobileSidebarOpen]);

  const showExpandedContent = !isCollapsed || isMobileSidebarOpen;

  // 🧠 ---------- API HOOKS ----------

  const { useWorkspaceListSidebarQuery } = useTasksQueryApi({});

  const { data: responseData } =
    useWorkspaceListSidebarQuery();

  // console.log(responseData, 1);
  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data],
  );
  // console.log(dataArray, 1);

  // Get unique workspaces (remove duplicates by name)
  const uniqueWorkspaces = useMemo(() => {
    const seen = new Set();
    return dataArray.filter((workspace) => {
      if (seen.has(workspace.name)) {
        return false;
      }
      seen.add(workspace.name);
      return true;
    });
  }, [dataArray]);

  // const workspaces = uniqueWorkspaces.map((ws) => ({
  //   id: ws.id,
  //   name: ws.name,
  // }));
  // console.log(workspaces);

  return (
    <aside
      className={`dark:bg-theme-dark bg-theme-light dark:text-theme-light text-theme-dark shadow-md fixed top-0 left-0 h-screen transition-all duration-300
      ${isCollapsed ? "w-[60px]" : "w-[305px]"}
      ${
        isMobileSidebarOpen
          ? "translate-x-0 w-[250px] z-50" // Mobile: higher z-index when open
          : "md:translate-x-0 "
      }`}
    >
      {/* Collapse/Expand Button */}
      {!showExpandedContent && (
        <div
          className={`absolute -right-4 top-14 bg-gray-700 p-2 rounded-full cursor-pointer block`}
          onClick={() => {
            if (window.innerWidth >= 768) {
              setIsCollapsed(!isCollapsed);
            } else {
              setMobileSidebarOpen(!isMobileSidebarOpen);
            }
          }}
        >
          <FaAngleLeft
            className={`text-white text-lg transition-transform duration-300 ${
              isMobileSidebarOpen ? "rotate-0" : "rotate-180"
            }`}
          />
        </div>
      )}
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="inline-flex items-center gap-3  ">
          <div
            className="border-2 border-lightBorder rounded-full w-10 h-10 relative cursor-pointer "
            onClick={() => {
              if (window.innerWidth >= 768) {
                setIsCollapsed(!isCollapsed);
              } else {
                setMobileSidebarOpen(!isMobileSidebarOpen);
              }
            }}
          >
            <Image
              src="/assets/images/paint.png"
              alt="Login"
              fill
              className="rounded-full w-full object-cover bg-white"
            />
          </div>
          {showExpandedContent && (
            <Link href="/">
              {/* <h3 className="font-bold text-sm md:text-base">
                <span className="text-secondaryColor">{authUser?.activeApp?.name}</span>
              </h3>
              <h5 className="text-xs title-color">Sanzio</h5> */}
              <h3 className="font-bold text-sm md:text-base">
                <span className="text-secondaryColor">Sanzio</span>
              </h3>
              <h5 className="text-xs title-color">
                {authUser?.activeApp?.name}
              </h5>
            </Link>
          )}
        </div>
        <BiCollapse
          className="title-color text-2xl"
          onClick={() => {
            if (window.innerWidth >= 768) {
              setIsCollapsed(!isCollapsed);
            } else {
              setMobileSidebarOpen(!isMobileSidebarOpen);
            }
          }}
        />
      </div>

      <div className="border-t-[2px] dark:border-gray-800 border-gray-300 " />

      {/* ----------Logo End ------------*/}

      {/* Scrollable Sidebar Items */}
      <div className="overflow-y-auto px-3 flex-1   h-[calc(100vh-190px)] sidebar-scroll mt-4">
        {dropDownItems.map((item, index) => (
          <React.Fragment key={index}>
            {!item.isDropdown && (
              <SimpleTooltip text={`${item.name}`}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 w-full p-2 px-3 mt-1 rounded-md transition-all duration-200 ${
                    !showExpandedContent ? "justify-center" : ""
                  } dark:text-gray-300 text-gray-800 hover:bg-gray-400 hover:dark:bg-gray-700 hover:text-gray-200`}
                >
                  <div className="text-[1.3rem] ">{item.icon}</div>
                  {showExpandedContent && (
                    <p className="text-[1rem] hover:text-cyan-50">
                      {item.name}
                    </p>
                  )}
                </Link>
              </SimpleTooltip>
            )}
            {item.isDropdown && !showExpandedContent && (
              <SimpleTooltip text={`${item.name}`}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 w-full p-2 mt-1 rounded-md transition-all duration-200  hover:bg-gray-800 text-gray-300`}
                >
                  <div className="text-[1.3rem] ">{item.icon}</div>
                </Link>
              </SimpleTooltip>
            )}
          </React.Fragment>
        ))}

        {/* Dropdown Sections */}
        {showExpandedContent && (
          <>
            <DropdownSection
              icon={<HiUsers />}
              title="HR"
              path="/hr-dashboard"
              items={[
                "Attendance",
                "Leave",
                "Employee",
                "Employee Hierarchy",
                "Employee Invitation",
                "Visit Application",
                // "Office",
                // "Departments",
                // "Designations",
                "Recruitment",
                "Meeting",
                "Requisitions",
                "Training Request",
                "Notices",
                "Events",
                // "Holidays",
                // "Office Holidays",
                // "Weekends",
                "Personal Notes",
                "Settings",
              ]}
            />

            {/* <DropdownSection
              icon={<HiUsers />}
              title="Recruitment"
              // path="/subscription"
              items={["Job Position List", "Job Posting List"]}
            /> */}

            <DropdownSection
              // icon={<MdOutlinePayments />}
              // icon={<MdPayments />}
              // icon={<FaMoneyCheckAlt />}
              icon={<FcMoneyTransfer />}
              title="Payroll Management"
              // path="/payroll-management"
              items={[
                "Pay Items",
                "Salary Grades",
                "Salary Grade Rules",
                "Salary Structures",
                // "Employees Salary Structure",
                "Payroll Runs",
                // "Payroll Employees",
                "Promotions",
                // "Allowances",
                // "Deductions",
                // "Loan Types",
                // "Loan Installments",
                // "Loan Installment Types",
              ]}
            />

            {/* <DropdownSection
              icon={<MdTask />}
              title="Tasks"
              // path="/tasks"
              items={[
                "Task List",
                "Task Boards",
                "Task Cards",
                "Workspace",
                "To Do",
                "In Progress",
                "Completed",
              ]}
            /> */}

            <WorkspaceDropdownSection
              workspaces={uniqueWorkspaces}
              handleAddWorkSpace={handleAddWorkSpace}
            />

            <DropdownSection
              icon={<RiPieChart2Fill />}
              title="CRM"
              items={[
                { name: "Overview", path: "/crm" },
                "Leads",
                // "Opportunities",
                // "Contacts",
                "Email Templates",
                "Email Broadcast",
              ]}
            />

            <DropdownSection
              icon={<HiUsers />}
              title="Subscription"
              // path="/subscription"
              items={["Subscription List"]}
            />

            <DropdownSection
              icon={<HiUsers />}
              title="Payments"
              items={[
                {
                  name: "Payment History",
                  path: "/subscription/payments/payment-history",
                },
                {
                  name: "Payment Dashboard",
                  path: "/admin/payment-dashboard",
                },
              ]}
            />

            <DropdownSection
              icon={<HiMiniCalculator />}
              title="Account Management"
              path="/accounts"
              items={[
                { name: "Income", path: "/accounts/income" },
                { name: "Expense", path: "/accounts/expense" },
                { name: "Invoice", path: "/accounts/invoice" },
                { name: "Reports", path: "/accounts/reports" },
              ]}
            />

            <DropdownSection
              icon={<HiMiniCalculator />}
              title="Settings"
              // path="/settings"
              items={[
                "Master Documents",
                "Company Documents",
                "Company Settings",
                "Permissions",
                "Roles And Permissions",
                "User List",
              ]}
            />

            <DropdownSection
              icon={<GiToken />}
              title="Token Management"
              path="/token-management"
              items={[""]}
            />
          </>
        )}

        {showExpandedContent && (
          <div className="py-2 mt-4 border-t dark:border-[#1F2937] border-gray-300">
            <Link
              href={"/help-and-faq"}
              className={`flex items-center gap-3 w-full p-2 px-3  mt-1 rounded-md transition-all duration-200 hover:bg-gray-800 dark:text-gray-300 text-gray-800 hover:dark:bg-gray-700 hover:text-gray-200`}
            >
              <p className="text-[1rem]">Help & FAQ</p>
            </Link>
            <Link
              href={"/support-center"}
              className={`flex items-center gap-3 w-full p-2 px-3  mt-1 rounded-md transition-all duration-200 hover:bg-gray-800 dark:text-gray-300 text-gray-800 hover:dark:bg-gray-700 hover:text-gray-200`}
            >
              <p className="text-[1rem]">Support Center</p>
            </Link>
          </div>
        )}
        {/* Settings & Logout */}
        <div className="py-2 pb-4  border-t dark:border-[#1F2937] border-gray-300">
          {/* <Link
            href="/company-setting"
            className={`flex items-center gap-3 w-full p-2  mt-1 rounded-md hover:bg-gray-800 dark:text-gray-300 text-gray-800 hover:dark:bg-gray-700 hover:text-gray-200 ${
              !showExpandedContent ? "justify-center" : " px-3"
            }`}
          >
            {!showExpandedContent && (
              <IoSettingsOutline className="text-[1.3rem]" />
            )}
            {showExpandedContent && (
              <p className="text-[1rem]">Company Setting</p>
            )}
          </Link> */}

          <div
            className={`flex items-center gap-3 w-full p-2  mt-1 rounded-md hover:bg-gray-800 dark:text-gray-300 text-gray-800 hover:dark:bg-gray-700 hover:text-gray-200 cursor-pointer ${
              !showExpandedContent ? "justify-center" : " px-3"
            }`}
            onClick={() => handleLogout(router)}
          >
            {!showExpandedContent && <TbLogout2 className="text-[1.3rem]" />}
            {showExpandedContent && <p className="text-[1rem]">Logout</p>}
          </div>
        </div>
      </div>

      {/* side bar footer */}
      <div
        className={` py-4  px-2 my-2  border-t dark:border-[#1F2937] border-gray-300 ${
          showExpandedContent ? " mx-4" : "mx-2"
        }`}
      >
        {showExpandedContent ? (
          <>
            <div className="flex items-center">
              <Image
                src="/images/sanzio-logo.webp"
                alt="Sanzio"
                width={120}
                height={28}
                className="h-7 w-auto dark:hidden"
              />
              <Image
                src="/images/sanzio-logo-white.webp"
                alt="Sanzio"
                width={120}
                height={28}
                className="h-7 w-auto hidden dark:block"
              />
            </div>
            <p className="text-xs mt-2 flex items-center gap-1 text-gray-500">
              <FaCopyright className="  " /> Revinr IT Ltd. 2025
            </p>
          </>
        ) : (
          <div className="flex justify-center items-center">
            <Image
              src="/images/sanzio-icon.webp"
              alt="Sanzio"
              width={26}
              height={26}
              className="h-6 w-6 object-contain"
            />
          </div>
        )}
      </div>
    </aside>
  );
};

export default StaticSidebar;
