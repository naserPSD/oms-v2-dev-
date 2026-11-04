// src/features/subscription/subscription-list.jsx
"use client";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import { debounce } from "lodash";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { BiPlus } from "react-icons/bi";
import { FaFilter, FaGripVertical, FaList } from "react-icons/fa";
import Swal from "sweetalert2";

// Components
import DataFilter from "@/components/common/DataFilter";
import ButtonTw from "@/components/ui/ButtonTw";
import ViewButton from "@/components/common/ViewButton";
import EditButton from "@/components/common/EditButton";
import DeleteButton from "@/components/common/DeleteButton";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import { CheckCircle2, Ticket } from "lucide-react";
import { ModalTw } from "@/components/common/ModalTw";
import SubscriptionTable from "./components/SubscriptionTable";

// Hooks & Utilities
import helpers from "@/utils/helpers";
import SubscriptionAddOrUpdateModal from "./components/SubscriptionAddOrUpdateModal";
import { useCommonStore } from "@/store/useCommonStore";
import { useSubscriptionQueryApi } from "@/hooks/queryApi/useSubscriptionQueryApi";
import SubscriptionCardView from "./components/SubscriptionCard";
import { TabItemTw } from "@/components/ui/TabItemTw";

function parseFeaturesHtml(html) {
  if (!html) return null;
  if (typeof html === "object") return html;
  const text = String(html).replace(/<[^>]*>/g, "").trim();
  try { return JSON.parse(text); } catch { return null; }
}

function FeaturesModal({ show, plan, onClose }) {
  if (!plan) return null;
  const parsed = parseFeaturesHtml(plan.features);
  const featuresList = parsed?.features || [];
  const storage = parsed?.storage;
  const projects = parsed?.projects;

  return (
    <ModalTw
      show={show}
      onClose={onClose}
      title={`${plan.name} — Details`}
      size="md"
      position="center"
      showFooter={false}
      dismissible
    >
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{plan.name || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Slug</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{plan.slug || "-"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{plan.description || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Price</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{plan.monthlyPrice} {plan.currency}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Yearly Price</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{plan.yearlyPrice} {plan.currency}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Trial Days</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{plan.trialDays != null ? `${plan.trialDays} days` : "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Users (Min - Max)</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {plan.minUsers ? (plan.maxUsers ? `${plan.minUsers} - ${plan.maxUsers}` : `${plan.minUsers}+`) : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{plan.isActive ? "Active" : "Inactive"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Most Popular</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{plan.isPopular ? "Yes" : "No"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sort Order</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{plan.sortOrder ?? "-"}</p>
          </div>
        </div>

        <div className="border-t dark:border-gray-700 pt-4">
          <p className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">Features</p>
          {(storage || projects) && (
            <div className="flex gap-3 mb-4">
              {storage && (
                <div className="flex-1 text-center py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Storage</p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{storage}</p>
                </div>
              )}
              {projects && (
                <div className="flex-1 text-center py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Projects</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{projects}</p>
                </div>
              )}
            </div>
          )}

          {featuresList.length > 0 ? (
            <ul className="space-y-2">
              {featuresList.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
                  {f}
                </li>
              ))}
            </ul>
          ) : plan.features ? (
            <div 
              className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none" 
              dangerouslySetInnerHTML={{ __html: plan.features }} 
            />
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No features listed.</p>
          )}
        </div>
      </div>
    </ModalTw>
  );
}

// initial form values
const initialValues = {
  id: 0,
  name: "",
  slug: "",
  description: "",
  monthlyPrice: 0,
  yearlyPrice: 0,
  currency: "",
  features: "",
  isActive: true,
  isPopular: false,
  trialDays: 0,
  sortOrder: 0,
  minUsers: 1,
  maxUsers: 1,
};
const SubscriptionList = () => {
  // const { t } = useTranslation();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get initial values from URL search params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  const initialStatusFilter = searchParams.get("status") || "";
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [featuresModal, setFeaturesModal] = useState({ show: false, plan: null });
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  // Define search filter state
  const [filters, setFilters] = useState({
    search: initialSearch,
    status: initialStatusFilter,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);

  const schema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, "Plan name is required"),
    slug: z.string(),
    description: z.string().min(1, "Description is required"),
    monthlyPrice: z.coerce
      .number()
      .min(0, "Monthly price must be greater than 0"),
    yearlyPrice: z.coerce
      .number()
      .min(0, "Yearly price must be greater than 0"),
    currency: z.string().min(1, "Currency is required"),
    features: z.string().optional(),
    isActive: z.boolean().optional(),
    isPopular: z.boolean().optional(),
    trialDays: z.coerce
      .number()
      .min(0, "Trial days must be greater than or equal to 0"),
    sortOrder: z.coerce.number().optional(),
    minUsers: z.coerce.number().min(1, "Minimum users must be at least 1"),
    maxUsers: z.coerce.number().min(1, "Maximum users must be at least 1"),
  }).refine((data) => data.minUsers <= data.maxUsers, {
    message: "Minimum users cannot be greater than maximum users",
    path: ["minUsers"],
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
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Edit handler for modal
  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  const handleEdit = useCallback(
    (item) => {
      let features = item.features ?? "";
      // If features came back as a parsed object, wrap it in <p> for SunEditor
      if (typeof features === "object") {
        features = `<p>${JSON.stringify(features)}</p>`;
      }
      reset({
        ...item,
        isPopular: Boolean(item.isPopular),
        features,
      });
      setShowModal(true);
    },
    [reset],
  );

  // Fetch notes with pagination and filters
  const {
    useSubscriptionQuery,
    deleteSubscriptionMutation,
    toggleSubscriptionMutation,
    togglePopularSubscriptionMutation,
    addOrUpdateSubscriptionMutation,
  } = useSubscriptionQueryApi({ reset, setError, handleClose, setShowModal });

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
    if (filters.status) params.isActive = filters.status;

    return params;
  }, [currentPage, itemsPerPage, filters]);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useSubscriptionQuery(queryParams);

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data],
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
    // console.log('dataArray',dataArray)
    return dataArray.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  const submitForm = async (values) => {
    console.log("values", values);
    await addOrUpdateSubscriptionMutation.mutateAsync(values);
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
          await deleteSubscriptionMutation.mutateAsync(id);
        }
      });
    },
    [deleteSubscriptionMutation],
  );

  const handleToggleStatus = useCallback(
    async (id) => {
      await toggleSubscriptionMutation.mutateAsync(id);
    },
    [toggleSubscriptionMutation],
  );

  const handleTogglePopular = useCallback(
    async (id) => {
      await togglePopularSubscriptionMutation.mutateAsync(id);
    },
    [togglePopularSubscriptionMutation],
  );

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

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);

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
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "monthlyPrice",
        header: "Per User Monthly Price",
        cell: ({ row }) => {
          const price = row.original.monthlyPrice;
          const currency = row.original.currency;
          return price && currency ? `${price} ${currency}` : "-";
        },
      },
      {
        accessorKey: "yearlyPrice",
        header: "Per User Yearly Price",
        cell: ({ row }) => {
          const price = row.original.yearlyPrice;
          const currency = row.original.currency;
          return price && currency ? `${price} ${currency}` : "-";
        },
      },
      {
        accessorKey: "userRange",
        header: "User Range",
        cell: ({ row }) => {
          const minUser = row.original.minUsers;
          const maxUser = row.original.maxUsers;
          if (!minUser) return "-";
          return maxUser ? `${minUser} - ${maxUser}` : `${minUser}+`;
        },
      },
      {
        accessorKey: "trialDays",
        header: "Trial Days",
        cell: ({ getValue }) => {
          const val = getValue();
          return val != null ? `${val} days` : "-";
        },
      },
      {
        accessorKey: "features",
        header: "Features",
        size: 300,
        minSize: 250,
        cell: ({ getValue }) => {
          const val = getValue();
          if (!val) return "-";
          
          let items = [];
          const parsed = parseFeaturesHtml(val);
          const featuresList = parsed?.features || [];
          
          if (featuresList.length > 0) {
            items = featuresList;
          } else if (typeof val === "string") {
            // Split into lines based on block tags
            const text = val
              .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
              .replace(/<br\s*\/?>/gi, "\n")
              .replace(/<[^>]*>?/gm, "")
              .replace(/&nbsp;/g, " ")
              .trim();
            
            items = text.split("\n").map(item => item.trim()).filter(Boolean);
          }
          
          if (items.length === 0) return "-";
          return (
            <div className="flex flex-col gap-0.5 max-h-[120px] overflow-y-auto pr-1 min-w-[300px]">
              {items.map((item, idx) => (
                <div key={idx} className="text-xs text-slate-600 dark:text-slate-300">
                  {idx + 1}. {item}
                </div>
              ))}
            </div>
          );
        },
      },

      {
        accessorKey: "sortOrder",
        header: "Sort Order",
        cell: ({ getValue }) => getValue() ?? "-",
      },
      {
        accessorKey: "isActive",
        header: "Active",
        cell: ({ row }) => (
          <SwitchButton
            enabled={row.original.isActive}
            onClick={() => handleToggleStatus(row.original.id)}
            enabledText="Yes"
            disabledText="No"
          />
        ),
      },
      {
        accessorKey: "isPopular",
        header: "Most Popular",
        cell: ({ row }) => (
          <SwitchButton
            enabled={Boolean(row.original.isPopular)}
            onClick={() => handleTogglePopular(row.original.id)}
            enabledText="Yes"
            disabledText="No"
          />
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="flex items-center gap-1">
              <ViewButton 
                onClick={() => setFeaturesModal({ show: true, plan: rowData })} 
                tooltip="View Details" 
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition shadow-2xs"
              />
              <EditButton 
                onClick={() => handleEdit(rowData)} 
                tooltip="Edit Subscription" 
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition shadow-2xs"
              />
              <DeleteButton 
                onClick={() => handleDelete(rowData.id)} 
                tooltip="Delete Subscription" 
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition shadow-2xs"
              />
            </div>
          );
        },
        enableSorting: false,
        size: 50,
      },
    ],
    [handleToggleStatus, handleTogglePopular, handleEdit, handleDelete],
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
    addOrUpdateSubscriptionMutation.isLoading ||
    deleteSubscriptionMutation.isLoading ||
    toggleSubscriptionMutation.isLoading;

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Subscriptions...",
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
    },
  ];

  const TAB_CONFIG = useMemo(() => {
    return [
      {
        key: "subscription-list",
        label: "List View",
        icon: <FaList className="w-4 h-4" />,
      },
      {
        key: "subscription-card",
        label: "Card View",
        icon: <FaGripVertical className="w-4 h-4" />,
      },
    ];
  }, []);

  const [activeTab, setActiveTab] = useState(
    TAB_CONFIG[0]?.key || "subscription-list",
  );

  // Handle tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Subscription Plans</h1>
        <div className="flex gap-2">
          <div className="flex flex-wrap border-2 rounded-lg py-1 items-center text-gray-500 font-bold text-xs">
            {TAB_CONFIG.map((tab) => (
              <div key={tab.key}>
                <TabItemTw
                  active={activeTab === tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center px-3 py-2 ml-1 mr-1 rounded-lg transition-colors ${
                    activeTab === tab.key
                      ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-t border-l border-r border-b border-gray-200 dark:border-gray-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </TabItemTw>
              </div>
            ))}
          </div>
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
            onClick={() => router.push("/admin/subscription/coupons")}
            variant="alternative"
            className="gap-2 h-8 mt-2 text-xs"
          >
            <Ticket className="w-3.5 h-3.5 text-blue-400" /> Subscription Coupons
          </ButtonTw>
          <ButtonTw
            onClick={() => setShowModal(true)}
            variant="blue"
            className="gap-2 h-8 mt-2"
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

      {activeTab == "subscription-list" && (
        <SubscriptionTable
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
      )}

      {activeTab == "subscription-card" && (
        <SubscriptionCardView
          data={listData}
          isFetching={isFetching}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onTogglePopular={handleTogglePopular}
          pagination={pagination}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
        />
      )}

      <FeaturesModal
        show={featuresModal.show}
        plan={featuresModal.plan}
        onClose={() => setFeaturesModal({ show: false, plan: null })}
      />

      <SubscriptionAddOrUpdateModal
        showModal={showModal}
        handleClose={handleClose}
        isLoading={isLoading}
        reset={reset}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        control={control}
        watch={watch}
        setValue={setValue}
      />
    </div>
  );
};

export default SubscriptionList;
