"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import DataFilter from "@/components/common/DataFilter";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";
import { useCommonStore } from "@/store/useCommonStore";
import { useAuthStore } from "@/store/useAuthStore";
import helpers, { toaster } from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BiPlus } from "react-icons/bi";
import Swal from "sweetalert2";
import { z } from "zod";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import { checkCompanyEmailApi } from "@/services/companySettingsApi";
import { Skeleton } from "@/components/ui/skeleton";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { usePathname, useSearchParams } from "next/navigation";
import debounce from "lodash/debounce";

// Import TanStack Table
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FaFilter } from "react-icons/fa";
import ButtonTw2 from "@/components/ui/ButtonTw2";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

const UserListComponent = ({ scope }) => {
  const pathname = usePathname() || "";
  const resolvedScope =
    scope || (pathname.startsWith("/admin") ? "admin" : "company");
  const lockedAppUseCase = resolvedScope === "company" ? "Company" : "Admin";
  const rolesUrl =
    resolvedScope === "admin"
      ? "/settings/roles-and-permissions"
      : "/settings/company-user-roles";
  const { t } = useTranslation();
  const { hasPermission } = useCommonFunctions();
  const searchParams = useSearchParams();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const authUser = useAuthStore((state) => state.user);

  // Get initial values from URL search params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  const initialStatusFilter = searchParams.get("status") || "";

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );

  const toggleFilter = () => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  };

  // Define search filter state
  const [filters, setFilters] = useState({
    search: initialSearch,
    appUseCase: lockedAppUseCase,
    status: initialStatusFilter,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);
  const [copiedRows, setCopiedRows] = useState({});

  // Zod schema for service information
  const schema = z
    .object({
      id: z.coerce.number().optional(),
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email format"),
      phoneCountryId: z.coerce.number().min(1, "Phone country is required"),
      phone: z
        .string()
        .min(1, "Phone is required")
        .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
      password: z.string().optional(),
      confirmPassword: z.string().optional(),
      appUseCase: z.string().min(1, "App use case is required"),
      roleIds: z.array(z.coerce.number()).optional(),
      isActive: z.boolean().default(true),
    })
    .superRefine((data, ctx) => {
      if (parseInt(data.id) === 0) {
        // Only for new records
        if (!data.password) {
          ctx.addIssue({
            path: ["password"],
            code: z.ZodIssueCode.custom,
            message: "Password is required",
          });
        }
        if (!data.confirmPassword) {
          ctx.addIssue({
            path: ["confirmPassword"],
            code: z.ZodIssueCode.custom,
            message: "Confirm password is required",
          });
        }
        if (data.password !== data.confirmPassword) {
          ctx.addIssue({
            path: ["confirmPassword"],
            code: z.ZodIssueCode.custom,
            message: "Passwords do not match",
          });
        }
      }
    });

  const initialValues = {
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
    phoneCountryId: null,
    phone: "",
    password: "",
    confirmPassword: "",
    appUseCase: "Personal",
    roleIds: [],
    isActive: true,
  };

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const watchedEmail = watch("email");
  const currentUserId = watch("id");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(watchedEmail || "");
    }, 350);
    return () => clearTimeout(timer);
  }, [watchedEmail]);

  useEffect(() => {
    if (!showModal) return;
    const trimmed = (debouncedEmail || "").trim();
    if (!trimmed) {
      if (errors.email?.message === "Email already exists") {
        clearErrors("email");
      }
      return;
    }

    const isEmailValid = z.string().email().safeParse(trimmed).success;
    if (!isEmailValid) return;

    let isCancelled = false;
    setIsCheckingEmail(true);

    checkCompanyEmailApi(trimmed, {
      userId: currentUserId ? Number(currentUserId) : undefined,
    })
      .then((res) => {
        if (isCancelled) return;
        if (res?.exists) {
          setError("email", {
            type: "manual",
            message: "Email already exists",
          });
        } else {
          if (errors.email?.message === "Email already exists") {
            clearErrors("email");
          }
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("Failed to check company email availability:", err);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsCheckingEmail(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedEmail, currentUserId, showModal, setError, clearErrors, errors.email?.message]);

  const handleCloseRef = useRef(() => setShowModal(false));

  const {
    useCompanyAssignableRolesQuery,
    useUsersQuery,
    addOrUpdateUserMutation,
    deleteUserMutation,
    toggleUserStatusMutation,
    useGetCompanyInfoQuery,
  } = useCompanySettingsQueryApi({
    reset,
    setError,
    handleClose: () => handleCloseRef.current(),
    setShowModal,
  });

  const { data: companyInfoResponse } = useGetCompanyInfoQuery();

  const companyPhoneCountryId = useMemo(() => {
    const company =
      companyInfoResponse?.data?.data ||
      companyInfoResponse?.data ||
      companyInfoResponse ||
      {};
    if (company?.phoneCountryId) return Number(company.phoneCountryId);

    // Fallback: Bangladesh (+880)
    return (
      dropdowns.countryList?.find((c) => String(c.callingCode) === "880")
        ?.id || null
    );
  }, [companyInfoResponse, dropdowns.countryList]);

  const getDefaultFormValues = useCallback(
    () => ({
      ...initialValues,
      phoneCountryId: companyPhoneCountryId,
      appUseCase: lockedAppUseCase,
    }),
    [companyPhoneCountryId, lockedAppUseCase],
  );

  const handleClose = useCallback(() => {
    reset(getDefaultFormValues());
    setShowModal(false);
  }, [getDefaultFormValues, reset]);

  useEffect(() => {
    handleCloseRef.current = handleClose;
  }, [handleClose]);

  const handleAddUser = () => {
    reset(getDefaultFormValues());
    setShowModal(true);
  };

  const handleEdit = (item) => {
    reset({
      ...getDefaultFormValues(),
      ...item,
      countryId: item.profile?.countryId || null,
      phoneCountryId:
        item.profile?.phoneCountryId || companyPhoneCountryId || null,
      phone: item.profile?.phone || "",
      roleIds: item.userRoles?.map((ur) => ur.roleId) || [],
      appUseCase: item.appUseCase || "Company",
      password: "",
      confirmPassword: "",
    });
    setShowModal(true);
  };
  const { data: roleList, refetch: refetchRoleList } =
    useCompanyAssignableRolesQuery();

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (filters.search) params.search = filters.search;
    if (filters.appUseCase) params.appUseCase = filters.appUseCase;
    if (filters.status) params.isActive = filters.status;

    return params;
  }, [currentPage, itemsPerPage, filters]);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useUsersQuery(queryParams);

  const dataArray = responseData?.data || [];
  const pagination = responseData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total, lastPage } = pagination;

  const listData = useMemo(() => {
    return dataArray.map((item) => {
      const parent = dataArray.find((p) => p.id === item.parentId);
      const permissionType = dropdowns.permissionTypeList?.find(
        (p) => p.value === item.type,
      );
      return {
        ...item,
        parentName: parent?.name,
        typeName: permissionType?.label,
        sl: (currentPage - 1) * itemsPerPage + dataArray.indexOf(item) + 1,
      };
    });
  }, [dataArray, dropdowns.permissionTypeList, currentPage, itemsPerPage]);

  console.log("listData of user:", listData);

  const parentPermissionList = dataArray
    ?.filter((item) => item.parentId === null)
    .map((item) => {
      item.value = item.id;
      item.label = item.name;
      return Object.assign({}, item);
    });

  const handleDelete = async (itemOrId) => {
    const id = typeof itemOrId === "object" ? itemOrId.id : itemOrId;
    const isEmployee =
      typeof itemOrId === "object" ? !!itemOrId.employee : false;

    Swal.fire({
      title: "Are you sure?",
      text: isEmployee
        ? "This will delete the user account. The employee record will not be deleted."
        : "Are you sure you want to delete this user? You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal-popup",
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteUserMutation.mutateAsync(id);
      }
    });
  };

  const changeActiveStatus = async (id) => {
    await toggleUserStatusMutation.mutateAsync(id);
  };

  // Define columns for TanStack Table
  const columns = useMemo(
    () => [
      // {
      //   accessorKey: "employeeDetails",
      //   header: "User Details",
      //   accessorFn: (row) => row.user?.fullName,
      //   enableGlobalFilter: true,
      //   filterFn: "includesString",
      //   cell: ({ row }) => {
      //     const user = row?.original;

      //     return (
      //       <Link
      //         href={`/hr-dashboard/employee/${row?.original?.employee?.id}`}
      //         className="flex items-center gap-2 cursor-pointer"
      //       >
      //         {/* Avatar */}
      //         {user?.profile?.profilePicture?.fileUrl ? (
      //           <img
      //             src={user?.profile.profilePicture.fileUrl}
      //             alt={user?.fullName}
      //             className="w-8 h-8 rounded-full object-cover"
      //           />
      //         ) : (
      //           <Avatar
      //             text={helpers.avatarText(user?.fullName)}
      //             color="info"
      //             size="lg"
      //           />
      //         )}

      //         {/* User Details */}
      //         <div className="ml-1">
      //           <p className="font-semibold dark-title-color">
      //             {user?.fullName || "-"}
      //           </p>

      //           {/* Designation */}
      //           <SimpleTooltip text={"Designation"}>
      //             {user?.employee?.designation?.name && (
      //               <span className="badge badge-rounded badge-outline-secondary">
      //                 {user?.employee?.designation?.name}
      //               </span>
      //             )}
      //           </SimpleTooltip>

      //           {/* Email */}
      //           <p className="text-xs text-gray-500">{user?.email}</p>

      //           {/* Phone */}
      //           <p className="text-xs text-gray-500">
      //             {user?.profile?.phoneWithCallingCode}
      //           </p>
      //         </div>
      //       </Link>
      //     );
      //   },
      //   size: 200,
      // },

      {
        accessorKey: "employeeDetails",
        header: "User Details",
        // accessorFn: (row) => {
        //   const fullName = row.user?.firstName || row.user?.lastName;
        //   return fullName;
        // },
        accessorFn: (row) =>
          [row?.firstName, row?.lastName, row?.email]
            .filter(Boolean) // Remove null/undefined values
            .join(" "), // Join remaining values with space
        enableGlobalFilter: true,
        filterFn: "includesString",
        cell: ({ row }) => {
          const user = row?.original;
          const hasEmployee = !!user?.employee;
          const displayName =
            user?.fullName ||
            [user?.firstName, user?.lastName].filter(Boolean).join(" ");

          const content = (
            <div className="flex items-center gap-2 max-w-[300px] overflow-auto">
              <Avatar
                text={helpers.avatarText(displayName)}
                image={user?.profile?.profilePicture?.fileUrl || ""}
                color="info"
                size="lg"
              />

              {/* User Details */}
              <div className="ml-1 my-0.5">
                <p className="font-semibold dark-title-color ">
                  {displayName || "-"}
                </p>

                {/* Designation */}
                {hasEmployee && user?.employee?.designation?.name && (
                  <SimpleTooltip text={"Designation"}>
                    <span className="badge badge-rounded badge-outline-secondary my-0.5">
                      {user.employee.designation.name}
                    </span>
                  </SimpleTooltip>
                )}

                {/* Email */}
                {user?.email && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 my-0.5">
                    <i className="fa-solid fa-envelope text-gray-400 mr-0.5"></i>
                    {user?.email}
                  </p>
                )}

                {/* Phone */}
                {user?.profile?.phoneWithCallingCode && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 my-0.5">
                    <i className="fa-solid fa-phone text-gray-400 mr-0.5"></i>
                    {user?.profile?.phoneWithCallingCode}
                  </p>
                )}
              </div>
            </div>
          );

          // Only wrap with Link if employee exists
          return hasEmployee ? (
            <Link
              href={`/hr-dashboard/employee/${user.employee.id}`}
              className="cursor-pointer"
            >
              {content}
            </Link>
          ) : (
            content
          );
        },
        size: 200,
      },

      {
        accessorKey: "emailVerifiedAt",
        header: "Email Verified",
        cell: ({ row }) => {
          const emailVerifiedAt = row.original?.emailVerifiedAt;

          return (
            <p className="text-gray-600 dark:text-gray-500">
              {/* <span className="font-bold">Email Verified:</span>{" "} */}
              <span
                className={`badge badge-rounded badge-outline-${
                  emailVerifiedAt ? "success" : "danger"
                }`}
              >
                {emailVerifiedAt ? "Yes" : "No"}
              </span>
            </p>
          );
        },
        size: 50,
      },
      {
        accessorKey: "profileCompleted",
        header: "Profile Completed",
        cell: ({ row }) => {
          const profileCompleted = row.original?.profileCompleted;

          return (
            <p className="text-gray-600 dark:text-gray-500">
              {/* <span className="font-bold">Profile Completed:</span>{" "} */}
              <span
                className={`badge badge-rounded badge-outline-${
                  profileCompleted ? "success" : "danger"
                }`}
              >
                {profileCompleted ? "Yes" : "No"}
              </span>
            </p>
          );
        },
        size: 50,
      },

      {
        accessorKey: "userRoles",
        header: "User Roles",
        // cell: ({ getValue }) => getValue() || '-',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 max-w-[150px] overflow-auto">
            {row.original.userRoles && row.original.userRoles.length > 0
              ? row.original.userRoles.map((userRole) => (
                  <span
                    key={userRole.role.id}
                    className="badge badge-rounded badge-outline-info whitespace-nowrap"
                  >
                    {userRole?.role?.name}
                  </span>
                ))
              : "-"}
          </div>
        ),
        size: 150,
      },
      {
        accessorKey: "isActive",
        header: () => <div className="text-center w-full">Active</div>,
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="text-center">
              <SwitchButton
                onClick={() => changeActiveStatus(rowData.id)}
                enabled={rowData.isActive}
                enabledText="Yes"
                disabledText="No"
                className="!mb-0 mx-auto"
                disabled={!hasPermission("settings.user_list_edit")}
              />
            </div>
          );
        },
        size: 50,
      },
      {
        accessorKey: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const rowData = row.original;
          const canDelete =
            hasPermission("settings.user_list_delete") ||
            hasPermission("settings.user_list_edit") ||
            hasPermission("settings.company_users_delete");
          const isCurrentUser =
            authUser?.id && Number(rowData.id) === Number(authUser.id);

          return (
            <div className="flex justify-center gap-2">
              {hasPermission("settings.user_list_edit") && (
                <SimpleTooltip text="Edit">
                  <button
                    onClick={() => handleEdit(rowData)}
                    className="btn-action text-blue-500 hover:text-blue-700"
                  >
                    <Pencil size={16} />
                  </button>
                </SimpleTooltip>
              )}
              {canDelete && !isCurrentUser && (
                <SimpleTooltip text="Delete User (Keep Employee)">
                  <button
                    onClick={() => handleDelete(rowData)}
                    className="btn-action text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </SimpleTooltip>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 50,
      },
    ],
    [changeActiveStatus, handleDelete, handleEdit, hasPermission, authUser?.id],
  );

  // Create TanStack Table instance
  const table = useReactTable({
    data: listData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeDirection: "rtl",
  });
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // Debounced updater for search filter only
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    [],
  );

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateSearch.cancel();
    };
  }, [debouncedUpdateSearch]);

  const handleFilterChange = useCallback(
    (filterName, value) => {
      if (filterName === "search") {
        setGlobalFilter(value);
        debouncedUpdateSearch(value);
      } else {
        // For other filters, update immediately
        setFilters((prev) => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
      }
    },
    [debouncedUpdateSearch],
  );

  const clearAllFilters = () => {
    debouncedUpdateSearch.cancel();
    setFilters({
      search: "",
      appUseCase: lockedAppUseCase,
      status: "",
    });
    setCurrentPage(1);
    setGlobalFilter();

    // Clear URL params as well
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const submitForm = async (values) => {
    const phoneCountry = dropdowns.countryList?.find(
      (country) => country.id === values.phoneCountryId,
    );
    const callingCode = phoneCountry?.callingCode;

    values.phoneIdentifier = values.phone ? values.phone : null;
    values.phone = "+" + callingCode + values.phone;
    values.appUseCase = lockedAppUseCase;

    await addOrUpdateUserMutation.mutateAsync(values);
  };

  const isLoading =
    isFetching ||
    addOrUpdateUserMutation.isLoading ||
    deleteUserMutation.isLoading ||
    toggleUserStatusMutation.isLoading;

  // Check if any filters are active
  const hasActiveFilters = Boolean(filters.search || filters.status);

  // Filter configuration
  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search by Name, Email...",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "status",
      label: "Select Status",
      options: dropdowns.activeInactiveList || [],
      placeholder: "Filter by Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
      className:
        "col-span-12 lg:col-span-2 sm:col-span-12 flex items-center justify-center mt-1.5",
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-5">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="title-color font-bold text-lg">
            {resolvedScope === "company" ? "Company Users" : "User List"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <SimpleTooltip
            title={showFilter === "show" ? "Hide" : "Show"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw
              onClick={() => toggleFilter()}
              variant="alternative"
              className="gap-2"
            >
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>

          {hasPermission("settings.user_list_add") && (
            <ButtonTw
              onClick={handleAddUser}
              variant="blue"
              className="gap-2"
            >
              <BiPlus /> Add New
            </ButtonTw>
          )}
        </div>
      </div>

      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="table-container">
        <table className="table">
          <thead className="text-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: <ChevronUp size={14} />,
                          desc: <ChevronDown size={14} />,
                        }[header.column.getIsSorted()] ??
                          (header.column.getCanSort() ? (
                            <ArrowUpDown size={14} />
                          ) : null)}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isFetching ? (
              [...Array(itemsPerPage)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Skeleton className="h-6 w-12 rounded-full mx-auto" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </td>
                </tr>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-gray-400"
                >
                  {hasActiveFilters
                    ? "No results match your search criteria"
                    : "No data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={`${watch("id") ? "Update" : "Add New"} User`}
        size="3xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-12 gap-x-4">
            <Controller
              control={control}
              name="firstName"
              render={({ field, fieldState }) => (
                <Input
                  label="First Name"
                  placeholder="Enter First Name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field, fieldState }) => (
                <Input
                  label="Last Name"
                  placeholder="Enter Last Name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Input
                  label="Email"
                  placeholder="Enter Email"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  {...field}
                />
              )}
            />

            <div className="col-span-12 lg:col-span-6 sm:col-span-12 mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                <span className="inline-flex items-center gap-1">
                  Phone
                  <span className="text-red-500 font-bold leading-none">*</span>
                </span>
              </label>
              <div className="flex items-start">
                <Controller
                  control={control}
                  name="phoneCountryId"
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label=""
                      className="mb-0! w-[108px] shrink-0 rounded-r-none border-r-0"
                      options={dropdowns.countryList?.map((c) => ({
                        value: c.id,
                        label: `+${c.callingCode}`,
                        name: c.name,
                        searchText: `${c.callingCode} ${c.name}`,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      size="sm"
                      placeholder="+880"
                      searchable
                      showDesignation
                      designationKey="name"
                      showDesignationInSelected={false}
                      dropdownClassName="min-w-[240px]"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <Input
                      label=""
                      className="mb-0! -ml-px min-w-0 flex-1 rounded-l-none border-l-0"
                      placeholder="Enter phone number"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      error={fieldState.error?.message}
                      size="sm"
                    />
                  )}
                />
              </div>
            </div>

            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Input
                  label="Password"
                  placeholder="Enter Password"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Enter Confirm Password"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  {...field}
                />
              )}
            />

            <div className="col-span-12 lg:col-span-6 sm:col-span-12 mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  User Roles
                </label>
                <Link
                  href={rolesUrl}
                  onClick={() => refetchRoleList?.()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primaryColor hover:text-white bg-primaryColor/10 hover:bg-primaryColor rounded border border-primaryColor/20 transition-all duration-200 cursor-pointer shadow-xs"
                  title="Add or view company user roles"
                >
                  <BiPlus size={12} />
                  <span>Add/View Roles</span>
                </Link>
              </div>
              <Controller
                control={control}
                name="roleIds"
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label=""
                    placeholder="Select Role"
                    options={roleList}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    size="sm"
                    className="!mb-0"
                    searchable
                    multiple
                  />
                )}
              />
            </div>

            <Controller
              control={control}
              name="isActive"
              render={({ field, fieldState }) => (
                <SwitchButton
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Active"
                  className="col-span-12 lg:col-span-3 sm:col-span-12"
                  error={fieldState.error?.message}
                  enabledText="Yes"
                  disabledText="No"
                />
              )}
            />

            <div className="col-span-12 flex justify-center items-center gap-4">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-4 col-span-12"
                disabled={isLoading}
                loading={isLoading}
              >
                Submit
              </ButtonTw>

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold mt-4 col-span-12"
                onClick={() => reset(getDefaultFormValues())}
              >
                Reset
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default UserListComponent;
