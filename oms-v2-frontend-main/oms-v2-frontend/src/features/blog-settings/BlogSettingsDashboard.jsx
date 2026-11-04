"use client";
import { Pencil, Trash2 } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import DataFilter from "@/components/common/DataFilter";
import SwitchButton from "@/components/ui/SwitchButton";
import SubscriptionTable from "@/features/subscription/components/SubscriptionTable";
import helpers from "@/utils/helpers";
import useBlogQueryApi from "@/hooks/queryApi/useBlogQueryApi";
import { fetchBlogByIdAdmin } from "@/services/blogAdminApi";
import {
  blogApiToFormValues,
  formValuesToBlogPayload,
} from "@/features/blog-settings/blogFormUtils";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BlogSettingsDashboard() {
  const router = useRouter();
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(helpers.perPageListItems);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    isPublished: "",
  });

  const toggleFilter = () => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  };

  const { useBlogsAdminQuery, deleteBlogMutation, addOrUpdateBlogMutation } =
    useBlogQueryApi({});

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      sort: "publishedAt:desc",
    };
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.isPublished !== "") params.isPublished = filters.isPublished;
    return params;
  }, [currentPage, itemsPerPage, filters]);

  const { data, isFetching } = useBlogsAdminQuery(queryParams);
  const total = data?.pagination?.total ?? 0;

  const listData = useMemo(
    () =>
      (data?.data || []).map((item, index) => ({
        ...item,
        sl: (currentPage - 1) * itemsPerPage + index + 1,
      })),
    [data?.data, currentPage, itemsPerPage]
  );

  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    []
  );

  useEffect(() => () => debouncedUpdateSearch.cancel(), [debouncedUpdateSearch]);

  const handleFilterChange = useCallback(
    (filterName, value) => {
      if (filterName === "search") {
        setGlobalFilter(value);
        debouncedUpdateSearch(value);
        return;
      }
      const next =
        value && typeof value === "object" && "value" in value
          ? value.value
          : value;
      setFilters((prev) => ({ ...prev, [filterName]: next ?? "" }));
      setCurrentPage(1);
    },
    [debouncedUpdateSearch]
  );

  const clearAllFilters = () => {
    debouncedUpdateSearch.cancel();
    setFilters({ search: "", category: "", isPublished: "" });
    setGlobalFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== undefined && value !== null
  );

  const onDelete = (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: row.title,
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
        await deleteBlogMutation.mutateAsync(row.id);
      }
    });
  };

  const handleTogglePublished = useCallback(
    async (row) => {
      const blog = await fetchBlogByIdAdmin(row.id);
      const values = blogApiToFormValues(blog);
      await addOrUpdateBlogMutation.mutateAsync(
        formValuesToBlogPayload({
          ...values,
          isPublished: !row.isPublished,
        }),
      );
    },
    [addOrUpdateBlogMutation],
  );

  const columns = useMemo(
    () => [
      { accessorKey: "sl", header: "SL.", size: 50 },
      { accessorKey: "title", header: "Title", size: 220 },
      { accessorKey: "slug", header: "Slug", size: 160 },
      { accessorKey: "category", header: "Category", size: 100 },
      {
        accessorKey: "publishedAt",
        header: "Published",
        cell: ({ row }) => formatDate(row.original.publishedAt),
        size: 110,
      },
      {
        accessorKey: "isPublished",
        header: "Live",
        cell: ({ row }) => (
          <SwitchButton
            enabled={row.original.isPublished}
            onClick={() => handleTogglePublished(row.original)}
            enabledText="Yes"
            disabledText="No"
          />
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        enableSorting: false,
        size: 50,
        cell: ({ row }) => (
          <div className="flex justify-center gap-2">
            <button
              onClick={() =>
                router.push(`/settings/blog-settings/${row.original.id}`)
              }
              className="btn-action text-blue-500 hover:text-blue-700"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(row.original)}
              className="btn-action text-red-500 hover:text-red-700"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [router, handleTogglePublished, onDelete],
  );

  const table = useReactTable({
    data: listData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeDirection: "rtl",
  });

  const publishedOptions = [
    { value: "1", label: "Published" },
    { value: "0", label: "Draft" },
  ];

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search by title or slug...",
      className: "col-span-12 lg:col-span-4 sm:col-span-12",
    },
    {
      component: "input",
      name: "category",
      label: "Category",
      placeholder: "e.g. PRODUCT",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "isPublished",
      label: "Status",
      options: publishedOptions,
      placeholder: "Published / Draft",
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
      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-lg">Blog Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Posts on{" "}
            <Link href="/blog" className="text-blue-600 hover:underline">
              /blog
            </Link>
            .{" "}
            <Link
              href="/settings/website-settings"
              className="font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Website setting →
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <SimpleTooltip
            title={showFilter === "show" ? "Hide" : "Show"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw
              onClick={toggleFilter}
              variant="alternative"
              className="gap-2"
            >
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>
          <ButtonTw
            onClick={() => router.push("/settings/blog-settings/new")}
            variant="blue"
            className="gap-2"
          >
            <BiPlus /> Add New
          </ButtonTw>
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

      <SubscriptionTable
        table={table}
        isFetching={
          isFetching ||
          deleteBlogMutation.isPending ||
          addOrUpdateBlogMutation.isPending
        }
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
        currentPage={currentPage}
        total={total}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />
    </div>
  );
}
