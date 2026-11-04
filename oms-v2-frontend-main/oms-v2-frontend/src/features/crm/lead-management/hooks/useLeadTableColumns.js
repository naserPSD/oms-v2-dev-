import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import SelectSearch from "@/components/ui/SelectSearch";
import helpers from "@/utils/helpers";
import {
  Pencil,
  Trash2,
  Phone,
  Building,
  User,
  Calendar,
  ChevronDown,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";

// Status Dropdown Cell Component
const safeExtractLeadId = (lead) => {
  const rawId = lead?._id || lead?.id;
  if (!rawId) return "";
  if (typeof rawId === "string") {
    return rawId !== "[object Object]" && rawId !== "undefined" && rawId !== "null"
      ? rawId
      : "";
  }
  if (typeof rawId.toString === "function") {
    const str = rawId.toString();
    if (str && str !== "[object Object]" && str !== "undefined" && str !== "null") {
      return str;
    }
  }
  const str = String(rawId);
  return str && str !== "[object Object]" && str !== "undefined" && str !== "null"
    ? str
    : "";
};

const StatusDropdownCell = ({ statusName, leadId, handleStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const statusOptions = [
    {
      value: "Active",
      label: "Active",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      value: "In Process",
      label: "In Process",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      value: "Converted",
      label: "Converted",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
  ];

  const currentStatus =
    statusOptions.find((opt) => opt.value === statusName) || statusOptions[0];

  // outside click close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setDropdownPos({
      top: rect.bottom + 6,
      left: rect.left,
    });

    setIsOpen((prev) => !prev);
  };

  const handleStatusSelect = (newStatus) => {
    if (newStatus !== statusName) {
      handleStatusChange(leadId, newStatus);
    }
    setIsOpen(false);
  };

  return (
    <div className="flex justify-center">
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleDropdown}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${currentStatus.color}`}
        >
          <span className="truncate">{currentStatus.label}</span>
          <ChevronDown
            className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="fixed z-9999 w-40 bg-white dark:bg-gray-800
                     border border-gray-200 dark:border-gray-700
                     rounded-md shadow-lg"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
            }}
          >
            <div className="py-1">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleStatusSelect(option.value)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${option.value === statusName
                    ? "bg-gray-50 dark:bg-gray-700 font-medium"
                    : ""
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${option.value === "Active"
                        ? "bg-green-500"
                        : option.value === "In Process"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                        }`}
                    ></span>
                    <span>{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const useLeadTableColumns = ({
  handleStatusChange,
  handleEdit,
  handleDelete,
  handleAssignLead,
  userMap = new Map(),
  employees = [],
}) => {
  return useMemo(
    () => [
      // Hidden searchable column for global filtering
      // {
      //   id: "searchable",
      //   accessorFn: (row) => {
      //     // Combine all searchable fields into a single string
      //     // Include dealValue as a string for searching
      //     const dealValue = row.dealValue ? String(row.dealValue) : '';
      //     return [
      //       row.name || '', // Company name
      //       row.contactName || '', // Key contact name
      //       row.contactPhone || '', // Contact phone
      //       row.contactEmail || '', // Contact email
      //       row.contactAlternativePhone || '', // Alternative phone
      //       row.contactDepartment || '', // Department
      //       row.contactDesignation || '', // Designation
      //       row.leadSource || '', // Source
      //       row.leadType || '', // Lead type
      //       row.companyType || '', // Company type
      //       row.website || '', // Website
      //       dealValue, // Deal value (as string for searching)
      //     ]
      //       .filter(Boolean) // Remove empty values
      //       .join(' ') // Join with space
      //       .toLowerCase(); // Convert to lowercase for case-insensitive search
      //   },
      //   enableGlobalFilter: true,
      //   filterFn: 'includesString',
      //   // Hide this column from display
      //   header: () => null,
      //   cell: () => null,
      //   enableHiding: false,
      //   enableColumnFilter: false,
      //   enableSorting: false,
      // },

      {
        id: "select",
        header: ({ table }) => (
          <div className="text-center">
            <Input
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            <Input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
          </div>
        ),
        size: 40,
      },

      {
        accessorKey: "sl",
        header: "SL",
        size: 60,
        cell: ({ row }) => (
          <div className="text-center text-gray-500 dark:text-gray-400">
            {row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => {
          const item = row.original;
          const company = item?.name || "-";
          const source = item?.leadSource;
          const leadId = safeExtractLeadId(item);
          const hrefPath = leadId ? `/crm/leads/${leadId}` : "";

          const hasValidSource =
            source &&
            source !== "-" &&
            source !== "undefined" &&
            source !== "null" &&
            typeof source === "string" &&
            source.trim() !== "";

          const getSourceColor = (src) => {
            const colors = {
              LinkedIn:
                "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
              Facebook:
                "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
              Instagram:
                "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
              Website:
                "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
              Referral:
                "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
              Email:
                "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
              Other:
                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
            };
            return (
              colors[src] ||
              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            );
          };

          const cellContent = (
            <div className="flex flex-col justify-center min-w-0 w-full py-1">
              {/* Icon + Company inline on single line */}
              <div
                className="flex items-center gap-1.5 min-w-0"
                title={company}
              >
                <Building className="h-4 w-4 text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold dark-title-color group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate whitespace-nowrap transition-colors">
                  {company}
                </span>
              </div>

              {/* Source badge below with fixed height */}
              <div className="mt-1 h-5 flex items-center">
                {hasValidSource ? (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSourceColor(
                      source,
                    )}`}
                  >
                    {source}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                    —
                  </span>
                )}
              </div>
            </div>
          );

          if (hrefPath) {
            return (
              <Link
                href={hrefPath}
                className="block w-full h-full min-w-0 max-w-[210px] group cursor-pointer"
              >
                {cellContent}
              </Link>
            );
          }

          return (
            <div className="block w-full h-full min-w-0 max-w-[210px]">
              {cellContent}
            </div>
          );
        },
        size: 190,
      },
      {
        accessorKey: "leadInfo",
        header: "Key contact",
        cell: ({ row }) => {
          const lead = row.original;
          const displayName = lead?.contactName || "Unknown";
          const phone = lead?.contactPhone || "";

          return (
            <div className="flex items-center gap-3">
              <Avatar
                text={helpers.avatarText(displayName)}
                value={displayName}
                randomBg={true}
                size="md"
                className="shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold dark-title-color text-sm truncate">
                  {displayName}
                </p>
                {phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                    <span className="truncate font-medium">{phone}</span>
                  </div>
                )}
              </div>
            </div>
          );
        },
        size: 200,
      },

      {
        accessorKey: "leadStatus",
        header: "Status",
        cell: ({ row }) => {
          const lead = row.original;
          const status = lead?.leadStatus || "Active";
          const statusName = typeof status === "string" ? status : status?.name;
          // Get leadId - should already be a string from transformation
          const leadIdString = (lead?._id || lead?.id || "").toString();

          return (
            <StatusDropdownCell
              statusName={statusName}
              leadId={leadIdString}
              handleStatusChange={handleStatusChange}
            />
          );
        },
        size: 160,
      },
      {
        accessorKey: "dealValue",
        header: "Deal Value",
        cell: ({ row }) => {
          const value = row.original?.dealValue;
          return (
            <div className="text-right">
              <span className="font-semibold text-green-600 dark:text-green-400">
                {/* ${helpers.formatNumber(value)} */}
                {value}
              </span>
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: "lastContact",
        header: "Last Contact",
        cell: ({ row }) => {
          const lastContact = row.original?.lastContact;
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {lastContact ? helpers.dDate(lastContact) : "Never"}
              </span>
            </div>
          );
        },
        size: 130,
      },
      {
        accessorKey: "assignedTo",
        header: "Assigned To",
        cell: ({ row }) => {
          const lead = row.original;
          const assignedTo = lead?.assignedTo;
          const handleClick = (e) => {
            e.stopPropagation();
            if (handleAssignLead) {
              handleAssignLead(lead);
            }
          };

          // Get user details from the map - try multiple ID formats
          let userInfo = null;
          if (assignedTo) {
            const assignedToStr = String(assignedTo);
            const assignedToNum = Number(assignedTo);

            // Try multiple lookup methods in map
            userInfo =
              userMap.get(assignedToStr) ||
              userMap.get(assignedToNum?.toString()) ||
              userMap.get(String(assignedToNum)) ||
              (assignedToNum &&
                !isNaN(assignedToNum) &&
                userMap.get(assignedToNum));

            // Fallback: search employees array directly if map lookup fails
            if (!userInfo && employees.length > 0) {
              const employee = employees.find((emp) => {
                if (!emp.user) return false;
                const userId =
                  emp.user.id?.toString() || emp.user.userId?.toString();
                const empId = emp.id?.toString();
                return (
                  userId === assignedToStr ||
                  userId === String(assignedToNum) ||
                  empId === assignedToStr ||
                  empId === String(assignedToNum)
                );
              });

              if (employee?.user) {
                userInfo = {
                  name: employee.user.fullName || "Unknown User",
                  email: employee.user.email || "",
                  designation: employee.designation?.name || "",
                  profilePicture:
                    employee.user.profile?.profilePicture?.fileUrl || null,
                };
              }
            }
          }

          const displayName =
            userInfo?.name ||
            (assignedTo ? `User ${assignedTo}` : "Unassigned");

          return (
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded transition-colors"
              onClick={handleClick}
              title="Click to assign lead"
            >
              {userInfo?.profilePicture ? (
                <img
                  src={userInfo.profilePicture}
                  alt={displayName}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
              ) : (
                <User className="h-4 w-4 text-purple-500 shrink-0" />
              )}
              <span className="text-sm font-medium dark-title-color">
                {displayName}
              </span>
            </div>
          );
        },
        size: 130,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        enableSorting: false,
        size: 120,
        cell: ({ row }) => {
          const item = row.original;
          const leadId = safeExtractLeadId(item);
          const hrefPath = leadId ? `/crm/leads/${leadId}` : "";

          return (
            <div className="flex items-center justify-center gap-1.5">
              {hrefPath && (
                <SimpleTooltip text="View Details">
                  <Link
                    href={hrefPath}
                    className="p-2 text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors inline-flex items-center justify-center"
                  >
                    <Eye size={16} />
                  </Link>
                </SimpleTooltip>
              )}

              <SimpleTooltip text="Edit Lead">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  <Pencil size={16} />
                </button>
              </SimpleTooltip>

              <SimpleTooltip text="Delete Lead">
                <button
                  onClick={() => {
                    const deleteId =
                      item._id?.toString() ||
                      item.id?.toString() ||
                      item._id ||
                      item.id;
                    handleDelete(
                      typeof deleteId === "string"
                        ? deleteId
                        : String(deleteId),
                    );
                  }}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </SimpleTooltip>
            </div>
          );
        },
      },
    ],
    [
      handleEdit,
      handleDelete,
      handleStatusChange,
      handleAssignLead,
      userMap,
      employees,
    ],
  );
};
