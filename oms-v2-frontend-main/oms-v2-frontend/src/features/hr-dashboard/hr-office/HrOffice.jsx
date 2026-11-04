"use client";
import { FormController as Controller } from "@/components/common/FormController";
import { zodResolver } from "@/utils/zodResolver";
import { debounce } from "lodash";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
// import { isBefore } from "date-fns/isBefore";
// import { parseISO } from "date-fns/parseISO";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import "suneditor/dist/css/suneditor.min.css";
import Swal from "sweetalert2";

// Components
import DataFilter from "@/components/common/DataFilter";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { Eye, Pencil, Trash2 } from "lucide-react";

// Hooks & Utilities
import CommonTable from "@/components/common/CommonTable";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import helpers from "@/utils/helpers";
import { getTimezones } from "@/utils/timezones";
import { BsViewList } from "react-icons/bs";
import OfficeAddOrUpdateModal from "./components/OfficeAddOrUpdateModal";
import OfficeShiftsModal from "./components/OfficeShiftsModal";
import ViewOfficeDetailsModal from "./components/ViewOfficeDetailsModal";
import Pagination from "@/components/common/Pagination";
import SwitchButton from "@/components/ui/SwitchButton";
import { ModalTw } from "@/components/common/ModalTw";

// initial form values
const initialValues = {
  id: 0,
  name: "",
  typeId: null,
  addressId: 0,
  address: {
    address: "",
    addressType: "",
    phone: "",
    email: "",
    city: "",
    postalCode: "",
    countryId: 0,
    timezone: "",
    gmapLatitude: "",
    gmapLongitude: "",
  },
  managerId: null,
  hasShift: false,
  startTime: "",
  delayStartTime: "",
  endTime: "",
  earlyEndTime: "",
  timezone: "",
  officeShifts: [],
};
const HrOffice = () => {
  // const { t } = useTranslation();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();

  // Get initial values from URL search params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  // const initialIsActiveStatus = searchParams.get("isActive") || "";
  // const initialPriority = searchParams.get("priority") || "";
  // const initialStartDate = searchParams.get("startDate") || "";
  // const initialCreatedAt = searchParams.get("createdAt") || "";
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [singleOfficeData, setSingleOfficeData] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showAddShiftForm, setShowAddShiftForm] = useState(false);
  // const [shiftToggle, setShiftToggle] = useState(false);

  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );

  // Define search filter state
  const [filters, setFilters] = useState({
    search: initialSearch,
    //isActive: initialIsActiveStatus,

    officeType: searchParams.get("officeType") || "",
    timezone: searchParams.get("timezone") || "",
    countryId: searchParams.get("countryId") || "",
    addressType: searchParams.get("addressType") || "",
    // priority: initialPriority,
    // startDate: initialStartDate,
    // createdAt: initialCreatedAt,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const addressSchema = z.object({
    address: z.string().min(1, "Address is required"),
    addressType: z.string().min(1, "Address type is required"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .refine((val) => !val || /^\+?[0-9]{1,3}\s?[0-9]{3,14}$/.test(val), {
        message: "Mobile number is invalid. e.g. +1234567890",
      }),
    email: z.string().email("Email is invalid").min(1, "Email is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    countryId: z.coerce.number().min(1, "Country is required"),
    timezone: z.string().min(1, "Timezone is required"),
    gmapLatitude: z.string().nullable().optional(),
    gmapLongitude: z.string().nullable().optional(),
    mapLink: z
      .string()
      .optional()
      .refine((val) => !val || val.startsWith("https://www.google.com/maps"), {
        message: "Invalid map link",
      }),
  });

  // ✅ Shift Schema
  const shiftSchema = z.object({
    name: z.string().min(1, "Shift name is required"),
    startTime: z.string().min(1, "Start time is required"),
    delayStartTime: z.string().min(1, "Delay start time is required"),
    endTime: z.string().min(1, "End time is required"),
    earlyEndTime: z.string().min(1, "Early end time is required"), // ✅ এখন required
  });

  const schema = z
    .object({
      name: z.string().min(1, "Name is required"),
      typeId: z.coerce.number().min(1, "Type is required"),
      address: addressSchema,
      managerId: z.coerce.number().min(1, "Manager is required"),
      timezone: z.string().min(1, "Timezone is required"),
      id: z.coerce.number().optional(),
      addressId: z.coerce.number().optional(),
      officeShifts: z.array(shiftSchema).optional(),
      hasShift: z.boolean(),
      startTime: z.string().nullable().optional(),
      delayStartTime: z.string().nullable().optional(),
      endTime: z.string().nullable().optional(),
      earlyEndTime: z.string().nullable().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.hasShift) {
        ["startTime", "delayStartTime", "endTime", "earlyEndTime"].forEach(
          (field) => {
            if (!data[field]) {
              ctx.addIssue({
                path: [field], // ✅ important for fieldState.error
                code: z.ZodIssueCode.custom,
                message: field.replace(/([A-Z])/g, " $1") + " is required",
              });
            }
          },
        );
      }
      if (
        data.hasShift &&
        (!data.officeShifts || data.officeShifts.length === 0)
      ) {
        ctx.addIssue({
          path: ["officeShifts"],
          code: z.ZodIssueCode.custom,
          message: "At least one shift is required",
        });
      }
    });

  const {
    // register,
    // formState: { errors },
    setValue,
    handleSubmit,
    setError,
    control,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialValues,
      officeShifts: [],
    },
    mode: "onChange",
  });

  // Edit handler for modal
  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  const handleEdit = useCallback(
    (item) => {
      console.log(item, "item");
      reset(item);
      setShowModal(true);
    },
    [reset],
  );

  const handleViewShift = (item) => {
    setSingleOfficeData(item);
    setShowShiftModal(true);
    setShowAddShiftForm(false);
  };
  // handleAddShift removed (unused)
  const handleView = (item) => {
    setSingleOfficeData(item);
    setViewDetailsModal(true);
  };
  // Fetch notes with pagination and filters
  const {
    // office
    useOfficeQuery,
    useUserListQuery,
    useWeekendsQuery,
    addOrUpdateOfficeMutation,
    deleteOfficeMutation,
    toggleStatusOfficeMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== undefined && value !== null,
    );
  }, [filters]);

  // Toggle filter bar visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (filters.search) params.search = filters.search;
    if (filters.officeType) params.officeType = filters.officeType;
    if (filters.timezone) params.timezone = filters.timezone;
    if (filters.countryId) params.countryId = filters.countryId;
    if (filters.addressType) params.addressType = filters.addressType;

    // if (filters.isActive) params.isActive = filters.isActive;
    // if (filters.priority) params.priority = filters.priority;
    // if (filters.startDate) params.startDate = filters.startDate;
    // if (filters.createdAt) params.createdAt = filters.createdAt;

    return params;
  }, [currentPage, itemsPerPage, filters]);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useOfficeQuery(queryParams);
  const { data: responseUsersData } = useUserListQuery();

  // Fetch weekends list to display per-office weekends in the offices table
  const { data: weekendsResponse } = useWeekendsQuery({ limit: 1000 });
  const weekendsArray = useMemo(() => weekendsResponse?.data || [], [weekendsResponse?.data]);
  const weekendsMap = useMemo(() => {
    const m = new Map();
    weekendsArray.forEach((w) => {
      if (w?.officeId) m.set(w.officeId, w);
    });
    return m;
  }, [weekendsArray]);

  // ----- Weekends form (use same schema/UI as WeekendsComponent) -----
  const initialWeekendValues = {
    id: 0,
    saturday: false,
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    officeId: null,
  };

  const weekendSchema = z.object({
    id: z.coerce.number().optional(),
    officeId: z.coerce.number().min(1, "Office is required"),
    saturday: z.boolean().optional().default(false),
    sunday: z.boolean().optional().default(false),
    monday: z.boolean().optional().default(false),
    tuesday: z.boolean().optional().default(false),
    wednesday: z.boolean().optional().default(false),
    thursday: z.boolean().optional().default(false),
    friday: z.boolean().optional().default(false),
  });

  const [showAddWeekendModal, setShowAddWeekendModal] = useState(false);
  const weekendForm = useForm({
    resolver: zodResolver(weekendSchema),
    defaultValues: initialWeekendValues,
    mode: "onChange",
  });


  // create a weekend-specific mutation bound to this form's setError/reset
  const { addOrUpdateWeekendMutation: addOrUpdateWeekendForForm } = useHrQueryApi({ reset: weekendForm.reset, setError: weekendForm.setError, handleClose, setShowModal });

  const openAddWeekendModal = useCallback((office) => {
    weekendForm.reset({
      ...initialWeekendValues,
      officeId: office?.id || null,
    });
    setShowAddWeekendModal(true);
  }, [weekendForm]);

  const submitWeekend = async (values) => {
    await addOrUpdateWeekendForForm.mutateAsync(values);
    setShowAddWeekendModal(false);
  };

  const openEditWeekendModal = useCallback((weekend) => {
    // prefill form with the existing weekend record (id, officeId, day flags)
    weekendForm.reset({
      id: weekend?.id || 0,
      officeId: weekend?.officeId || null,
      saturday: !!weekend?.saturday,
      sunday: !!weekend?.sunday,
      monday: !!weekend?.monday,
      tuesday: !!weekend?.tuesday,
      wednesday: !!weekend?.wednesday,
      thursday: !!weekend?.thursday,
      friday: !!weekend?.friday,
    });
    setShowAddWeekendModal(true);
  }, [weekendForm]);

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data],
  );

  const usersArray = useMemo(
    () => responseUsersData?.data || [],
    [responseUsersData?.data],
  );

  const pagination = responseData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total } = pagination;

  const listData = useMemo(() => {
    return dataArray.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  const submitForm = async (values) => {
    console.log("values", values);
    await addOrUpdateOfficeMutation.mutateAsync(values);
  };

  const handleDelete = useCallback(
    async (id) => {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        customClass: {
          popup: "swal-popup",
          confirmButton: "swal-confirm-btn",
          cancelButton: "swal-cancel-btn",
        },
        buttonsStyling: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deleteOfficeMutation.mutateAsync(id);
        }
      });
    },
    [deleteOfficeMutation],
  );

  // const handleToggleStatus = useCallback(
  //   async (id) => {
  //     await toggleStatusOfficeMutation.mutateAsync(id);
  //   },
  //   [toggleStatusOfficeMutation]
  // );

  // Debounced updater for search filter only
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    [],
  );

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
      officeType: "",
      timezone: "",
      countryId: "",
      addressType: "",
      // isActive: "",
      // priority: "",
      // startDate: "",
      // createdAt: "",
    });
    setCurrentPage(1);
    setGlobalFilter();

    // Clear URL params as well
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());
    if (filters.search) params.set("search", filters.search);

    if (filters.officeType) params.set("officeType", filters.officeType);
    if (filters.timezone) params.set("timezone", filters.timezone);
    if (filters.countryId) params.set("countryId", filters.countryId);
    if (filters.addressType) params.set("addressType", filters.addressType);
    // if (filters.isActive) params.set("isActive", filters.isActive);
    // if (filters.priority) params.set("priority", filters.priority);
    // if (filters.startDate) params.set("startDate", filters.startDate);
    // if (filters.createdAt) params.set("createdAt", filters.createdAt);

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateSearch.cancel();
    };
  }, [debouncedUpdateSearch]);

  // TanStack Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL.",
        size: 50,
      },
      {
        accessorKey: "officeInfo",
        header: "Office Info",
        // --- START OF MODIFICATION ---
        // Concatenate all searchable fields into a single string for global filtering
        accessorFn: (row) =>
          [row.name, row.address?.email, row.address?.phone]
            .filter(Boolean) // Remove null/undefined values
            .join(" "), // Join remaining values with a space
        // --- END OF MODIFICATION ---
        enableGlobalFilter: true,
        filterFn: "includesString",
        cell: ({ row }) => (
          <div className=" text-left">
            <h4 className="font-semibold dark-title-color text-left">
              <SimpleTooltip text={"Office Name"}>
                {row.original.name}
              </SimpleTooltip>
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="title-color text-xs">
                {" "}
                <SimpleTooltip text={"Office Type"}>
                  {row.original.officeType?.name || "N/A"}
                </SimpleTooltip>
              </p>
              <i className="fa-solid fa-circle text-gray-500 text-[4px]" />
              <p className="title-color text-xs">
                <SimpleTooltip text={"Office Manager"}>
                  {row.original?.manager?.fullName || "N/A"}
                </SimpleTooltip>
              </p>
            </div>
            <p className="title-color text-xs">
              <SimpleTooltip text={"Office Email"}>
                {row.original?.address?.email || "N/A"}
              </SimpleTooltip>
            </p>
            <p className="title-color text-xs">
              <SimpleTooltip text={"Office Phone"}>
                {row.original?.address?.phone || "N/A"}
              </SimpleTooltip>
            </p>
          </div>
        ),
      },
      {
        accessorKey: "office-address",
        header: "Office Address",
        cell: ({ row }) => {
          const address = row.original?.address;
          return (
            <div className="text-left ">
              {/* Full Address */}
              <SimpleTooltip text="Office Location">
                <p className="text-xs font-semibold text-left dark-title-color">
                  {`${address?.countryName || "N/A"} - ${
                    address?.city || ""
                  } - ${address?.address || ""} - ${address?.postalCode || ""}`}
                </p>
              </SimpleTooltip>
              {/* Timezone */}
              <p className="text-xs title-color">
                <SimpleTooltip text="Office Timezone">
                  {address?.timezone || "N/A"}
                </SimpleTooltip>
              </p>
              {/* Address Type */}
              <p className="text-xs title-color">
                <SimpleTooltip text="Office Address Type">
                  {address?.addressType || "N/A"}
                </SimpleTooltip>
              </p>
            </div>
          );
        },
      },

      {
        accessorKey: "startTime",
        header: "Start & End Time",
        cell: ({ row }) => (
          <>
            <span>
              {row.original.startTime
                ? helpers.dTime(row.original.startTime)
                : "-"}{" "}
              -{" "}
              {row.original.endTime ? helpers.dTime(row.original.endTime) : "-"}
            </span>
          </>
        ),
      },
      {
        accessorKey: "delayStartTime",
        header: "Delay Start & End Time",
        cell: ({ row }) => (
          <>
            <span>
              {row.original.delayStartTime
                ? helpers.dTime(row.original.delayStartTime)
                : "-"}{" "}
              -{" "}
              {row.original.earlyEndTime
                ? helpers.dTime(row.original.earlyEndTime)
                : "-"}
            </span>
          </>
        ),
      },

      // {
      //   accessorKey: "timezone",
      //   header: "Timezone",
      //   cell: ({ getValue }) => getValue() || "-",
      // },
      // {
      //   accessorKey: "createdAt",
      //   header: "Created At",
      //   cell: ({ row }) => (
      //     <>
      //       <span>
      //         {row.original.createdAt
      //           ? helpers.dDateTime(row.original.createdAt)
      //           : "-"}
      //       </span>
      //     </>
      //   ),
      // },

      {
        accessorKey: "hasShift",
        header: "Has Shift",
        cell: ({ row }) => (
          <div className="flex items-center">
            {row.original.hasShift ? (
              <SimpleTooltip text="View Edit Shift">
                <ButtonTw
                  variant="outline.info"
                  size="xs"
                  className="gap-1"
                  onClick={() => {
                    handleViewShift(row.original);
                  }}
                >
                  <BsViewList /> View
                </ButtonTw>
              </SimpleTooltip>
            ) : (
              //  <SimpleTooltip text="Add New Shift">
              //   <ButtonTw
              //     variant="outline.blue"
              //     size="xs"
              //     className="gap-1"
              //     onClick={() => handleAddShift(row.original)}
              //   >
              //     <BsViewList /> Add
              //   </ButtonTw>
              // </SimpleTooltip>
              <p className="title-color"> No</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "weekends",
        header: "Weekends",
        cell: ({ row }) => {
          const officeId = row.original.id;
          const weekend = weekendsMap.get(officeId);
          const dayLabels = {
            saturday: "Sat",
            sunday: "Sun",
            monday: "Mon",
            tuesday: "Tue",
            wednesday: "Wed",
            thursday: "Thu",
            friday: "Fri",
          };

          if (!weekend) {
            return (
              <div className="flex items-center">
                <SimpleTooltip text="Add Weekends">
                  <ButtonTw
                    variant="blue"
                    size="xs"
                    className="gap-1"
                    onClick={() => openAddWeekendModal(row.original)}
                  >
                    <BsViewList /> Add
                  </ButtonTw>
                </SimpleTooltip>
              </div>
            );
          }

          const active = Object.keys(dayLabels).filter((d) => !!weekend[d]);
          if (!active || active.length === 0) {
            return (
              <div className="flex items-center">
                <SimpleTooltip text="Add Weekends">
                  <ButtonTw
                    variant="blue"
                    size="xs"
                    className="gap-1"
                    onClick={() => openAddWeekendModal(row.original)}
                  >
                    <BsViewList /> Add
                  </ButtonTw>
                </SimpleTooltip>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-2">
                {active.map((d) => (
                  <span key={d} className="badge badge-pill badge-outline-danger">
                    {dayLabels[d]}
                  </span>
                ))}
              </div>

              <SimpleTooltip text="Edit Weekends">
                <ButtonTw
                type="button"
                onClick={() => openEditWeekendModal(weekend)}
                className="btn-action text-blue-500 hover:text-blue-700"
                title="Edit Weekends"
              >
                <Pencil size={14} />
              </ButtonTw>
              </SimpleTooltip>
              
            </div>
          );
        },
        enableSorting: false,
        size: 140,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const rowData = row.original;
          const weekend = weekendsMap.get(rowData.id);
          return (
            <div className="gap-1 flex">
              <SimpleTooltip text="View">
                <button
                  type="button"
                  onClick={() => handleView(rowData)}
                  className="btn-action  text-cyan-500 hover:text-cyan-700 "
                >
                  <Eye size={16} />
                </button>
              </SimpleTooltip>
              {weekend && (
                <SimpleTooltip text="Edit Weekends">
                  <button
                    type="button"
                    onClick={() => openEditWeekendModal(weekend)}
                    className="btn-action text-blue-500 hover:text-blue-700"
                  >
                    <Pencil size={14} />
                  </button>
                </SimpleTooltip>
              )}
              <SimpleTooltip text="Delete">
                <button
                  type="button"
                  onClick={() => handleDelete(rowData.id)}
                  className="btn-action  text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </SimpleTooltip>
            </div>
          );
        },
        enableSorting: false,
        size: 50,
      },
    ],
    [handleDelete, handleEdit, weekendsMap, openAddWeekendModal, openEditWeekendModal],
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

  const isLoading =
    isFetching ||
    addOrUpdateOfficeMutation.isLoading ||
    deleteOfficeMutation.isLoading ||
    // toggleArchivePersonalNoteMutation.isLoading ||
    toggleStatusOfficeMutation.isLoading;

  const modalLoading = addOrUpdateWeekendForForm?.isLoading || false;

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search office name, email, phone...",
    },
    {
      component: "select",
      name: "officeType",
      label: "Office Type",
      options:
        dropdowns.statusGroupList?.find((s) => s.code === "office_types")
          ?.statuses ?? [],
      placeholder: "Filter by office type",
    },
    {
      component: "select",
      name: "countryId",
      label: "Country",
      options: dropdowns.countryList?.map((c) => ({
        value: c.id,
        label: c.name,
      })),
      placeholder: "Filter by country",
    },
    {
      component: "select",
      name: "addressType",
      label: "Address Type",
      options: dropdowns.addressTypes,
      placeholder: "Filter by address type",
    },
    {
      component: "select",
      name: "timezone",
      label: "Timezone",
      options: getTimezones(),
      placeholder: "Filter by Timezone",
    },

    // {
    //   component: "select",
    //   name: "isActive",
    //   label: "Active Status",
    //   options: [
    //     { value: "true", label: "Active" },
    //     { value: "false", label: "InActive" },
    //   ],
    //   placeholder: "Filter by Status",
    // },
    // {
    //   component: "select",
    //   name: "priority",
    //   label: "Priority",
    //   options: [
    //     { value: "Low", label: "Low" },
    //     { value: "Normal", label: "Medium" },
    //     { value: "High", label: "High" },
    //   ],
    //   placeholder: "Filter by priority",
    // },
    // {
    //   component: "datePicker",
    //   name: "startDate",
    //   label: "Start Date",
    //   placeholder: "Filter by Start Date",
    // },
    // {
    //   component: "datePicker",
    //   name: "createdAt",
    //   label: "Created At",
    //   placeholder: "Filter by created date",
    // },
    {
      component: "clear",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Offices......</h1>
        <div className="flex gap-2">
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
          <ButtonTw
            onClick={() => setShowModal(true)}
            variant="blue"
            className="gap-2"
          >
            <BiPlus /> Add New
          </ButtonTw>
        </div>
      </div>

      {/* Filter Bar */}
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />
      <div className="mb-8">
        {" "}
        <CommonTable
          table={table}
          isFetching={isFetching}
          itemsPerPage={itemsPerPage}
          columns={columns}
          hasActiveFilters={hasActiveFilters}
          currentPage={currentPage}
          total={total}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>

      <OfficeAddOrUpdateModal
        showModal={showModal}
        handleClose={handleClose}
        isLoading={isLoading}
        reset={reset}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        control={control}
        watch={watch}
        getTodayDate={getTodayDate}
        usersArray={usersArray}
        setValue={setValue}
      />

      <OfficeShiftsModal
        showModal={showShiftModal}
        handleClose={() => setShowShiftModal(false)}
        officeData={singleOfficeData}
        showAddForm={showAddShiftForm}
        setShowAddForm={setShowAddShiftForm}
      />
      <ViewOfficeDetailsModal
        showModal={viewDetailsModal}
        handleClose={() => setViewDetailsModal(false)}
        officeData={singleOfficeData}
        weekend={singleOfficeData ? weekendsMap.get(singleOfficeData.id) : null}
        onEditWeekends={(weekend) => openEditWeekendModal(weekend)}
      />

      <ModalTw
        show={showAddWeekendModal}
        onClose={() => setShowAddWeekendModal(false)}
        title="Add Weekends"
        size="lg"
        dismissible
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={weekendForm.handleSubmit(submitWeekend)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
            <input type="hidden" {...weekendForm.register("officeId")} />

            {[
              { name: "saturday", label: "Saturday" },
              { name: "sunday", label: "Sunday" },
              { name: "monday", label: "Monday" },
              { name: "tuesday", label: "Tuesday" },
              { name: "wednesday", label: "Wednesday" },
              { name: "thursday", label: "Thursday" },
              { name: "friday", label: "Friday" },
            ].map((day) => (
              <Controller
                key={day.name}
                name={day.name}
                control={weekendForm.control}
                render={({ field }) => {
                  console.log("field", field);
                  return (
                    <SwitchButton
                      label={day.label}
                      enabled={field.value}
                      onClick={() => field.onChange(!field.value)}
                      enabledText="Yes"
                      disabledText="No"
                    />
                  );
                }}
              />
            ))}
          </div>

          <div className="flex gap-4 mt-4">
            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              className="w-full font-bold"
              disabled={modalLoading}
              loading={modalLoading}
            >
              Save
            </ButtonTw>

            <ButtonTw
              type="button"
              size="sm"
              variant="outline.gray"
              className="w-full font-bold"
              onClick={() => weekendForm.reset()}
            >
              Reset
            </ButtonTw>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default HrOffice;
