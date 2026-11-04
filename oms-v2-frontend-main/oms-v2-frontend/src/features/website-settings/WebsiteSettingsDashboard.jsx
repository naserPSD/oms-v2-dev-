"use client";
import { Pencil, Trash2 } from "lucide-react";

import { FormController as Controller } from "@/components/common/FormController";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/utils/zodResolver";
import { z } from "zod";
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
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";
import { ModalTw } from "@/components/common/ModalTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import DataFilter from "@/components/common/DataFilter";
import SubscriptionTable from "@/features/subscription/components/SubscriptionTable";
import helpers from "@/utils/helpers";
import { useCommonStore } from "@/store/useCommonStore";
import useWebsiteSettingsQueryApi from "@/hooks/queryApi/useWebsiteSettingsQueryApi";
import PageSeoSettings from "@/features/website-settings/PageSeoSettings";

const SECTION_OPTIONS = [
  { value: "home_beyond_products", label: "Home — Beyond products" },
];

const TYPE_OPTIONS = [
  { value: "meta", label: "Section header (meta)" },
  { value: "item", label: "Product card (item)" },
];

const schema = z.object({
  id: z.coerce.number().optional(),
  sectionKey: z.string().min(1, "Section is required"),
  slug: z.string().optional(),
  contentType: z.enum(["meta", "item"]),
  eyebrow: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  iconUrl: z.string().optional(),
  previewUrl: z.string().optional(),
  previewBg: z.string().optional(),
  featuresText: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  accentColor: z.string().optional(),
  iconBg: z.string().optional(),
  sortOrder: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
});

const INITIAL = {
  id: 0,
  sectionKey: "home_beyond_products",
  slug: "",
  contentType: "item",
  eyebrow: "",
  title: "",
  description: "",
  iconUrl: "",
  previewUrl: "",
  previewBg: "",
  featuresText: "",
  ctaLabel: "",
  ctaHref: "",
  accentColor: "",
  iconBg: "",
  sortOrder: 0,
  isActive: true,
};

export default function WebsiteSettingsDashboard() {
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const [settingsTab, setSettingsTab] = useState("sections");
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(helpers.perPageListItems);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    sectionKey: "home_beyond_products",
    contentType: "",
    isActive: "",
  });

  const toggleFilter = () => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  };

  const {
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: INITIAL,
    mode: "onChange",
  });

  const handleClose = () => {
    reset(INITIAL);
    setShowModal(false);
  };

  const {
    useWebsiteContentsQuery,
    addOrUpdateWebsiteContentMutation,
    deleteWebsiteContentMutation,
  } = useWebsiteSettingsQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      sort: "sortOrder:asc",
    };
    if (filters.search) params.search = filters.search;
    if (filters.sectionKey) params.sectionKey = filters.sectionKey;
    if (filters.contentType) params.contentType = filters.contentType;
    if (filters.isActive !== "") params.isActive = filters.isActive;
    return params;
  }, [currentPage, itemsPerPage, filters]);

  const { data, isFetching } = useWebsiteContentsQuery(queryParams);
  const total = data?.pagination?.total ?? 0;
  const isEdit = !!watch("id");

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
    setFilters({
      search: "",
      sectionKey: "home_beyond_products",
      contentType: "",
      isActive: "",
    });
    setGlobalFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "sectionKey" && value === "home_beyond_products") return false;
    return value !== "" && value !== undefined && value !== null;
  });

  const openCreate = () => {
    reset({
      ...INITIAL,
      sectionKey: filters.sectionKey || "home_beyond_products",
    });
    setShowModal(true);
  };

  const openEdit = (row) => {
    reset({
      id: row.id,
      sectionKey: row.sectionKey,
      slug: row.slug || "",
      contentType: row.contentType || "item",
      eyebrow: row.eyebrow || "",
      title: row.title || "",
      description: row.description || "",
      iconUrl: row.iconUrl || "",
      previewUrl: row.previewUrl || "",
      previewBg: row.previewBg || "",
      featuresText: Array.isArray(row.features) ? row.features.join("\n") : "",
      ctaLabel: row.ctaLabel || "",
      ctaHref: row.ctaHref || "",
      accentColor: row.accentColor || "",
      iconBg: row.iconBg || "",
      sortOrder: row.sortOrder ?? 0,
      isActive: !!row.isActive,
    });
    setShowModal(true);
  };

  const onSubmit = async (values) => {
    const features = (values.featuresText || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    await addOrUpdateWebsiteContentMutation.mutateAsync({
      id: values.id || undefined,
      sectionKey: values.sectionKey,
      slug: values.slug || undefined,
      contentType: values.contentType,
      eyebrow: values.eyebrow || undefined,
      title: values.title,
      description: values.description || undefined,
      iconUrl: values.iconUrl || undefined,
      previewUrl: values.previewUrl || undefined,
      previewBg: values.previewBg || undefined,
      features,
      ctaLabel: values.ctaLabel || undefined,
      ctaHref: values.ctaHref || undefined,
      accentColor: values.accentColor || undefined,
      iconBg: values.iconBg || undefined,
      sortOrder: values.sortOrder ?? 0,
      isActive: values.isActive,
    });
  };

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
        await deleteWebsiteContentMutation.mutateAsync(row.id);
      }
    });
  };

  const handleToggleStatus = useCallback(
    async (row) => {
      await addOrUpdateWebsiteContentMutation.mutateAsync({
        id: row.id,
        sectionKey: row.sectionKey,
        slug: row.slug || undefined,
        contentType: row.contentType,
        eyebrow: row.eyebrow || undefined,
        title: row.title,
        description: row.description || undefined,
        iconUrl: row.iconUrl || undefined,
        previewUrl: row.previewUrl || undefined,
        previewBg: row.previewBg || undefined,
        features: Array.isArray(row.features) ? row.features : [],
        ctaLabel: row.ctaLabel || undefined,
        ctaHref: row.ctaHref || undefined,
        accentColor: row.accentColor || undefined,
        iconBg: row.iconBg || undefined,
        sortOrder: row.sortOrder ?? 0,
        isActive: !row.isActive,
      });
    },
    [addOrUpdateWebsiteContentMutation],
  );

  const columns = useMemo(
    () => [
      { accessorKey: "sl", header: "SL.", size: 50 },
      { accessorKey: "contentType", header: "Type", size: 80 },
      { accessorKey: "title", header: "Title", size: 200 },
      { accessorKey: "slug", header: "Slug", size: 160 },
      { accessorKey: "sortOrder", header: "Sort", size: 60 },
      {
        accessorKey: "isActive",
        header: "Active",
        cell: ({ row }) => (
          <SwitchButton
            enabled={row.original.isActive}
            onClick={() => handleToggleStatus(row.original)}
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
              onClick={() => openEdit(row.original)}
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
    [handleToggleStatus, openEdit, onDelete],
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

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search by title or slug...",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "sectionKey",
      label: "Section",
      options: SECTION_OPTIONS,
      placeholder: "Filter by section",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "contentType",
      label: "Content type",
      options: TYPE_OPTIONS,
      placeholder: "Filter by type",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "isActive",
      label: "Status",
      options: dropdowns.activeInactiveList || [],
      placeholder: "Filter by status",
      className: "col-span-12 lg:col-span-2 sm:col-span-12",
    },
    {
      component: "clear",
      className:
        "col-span-12 lg:col-span-1 sm:col-span-12 flex items-center justify-center mt-1.5",
    },
  ];

  const isLoading =
    isFetching ||
    addOrUpdateWebsiteContentMutation.isPending ||
    deleteWebsiteContentMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-lg">Website Setting</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage public website content and page meta titles.{" "}
            <Link
              href="/settings/blog-settings"
              className="font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Blog posts →
            </Link>
          </p>
          <div className="mt-3 flex gap-2">
            <ButtonTw
              type="button"
              variant={settingsTab === "sections" ? "blue" : "alternative"}
              onClick={() => setSettingsTab("sections")}
            >
              Sections
            </ButtonTw>
            <ButtonTw
              type="button"
              variant={settingsTab === "seo" ? "blue" : "alternative"}
              onClick={() => setSettingsTab("seo")}
            >
              Page SEO
            </ButtonTw>
          </div>
        </div>
        {settingsTab === "sections" ? (
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
          <ButtonTw onClick={openCreate} variant="blue" className="gap-2">
            <BiPlus /> Add New
          </ButtonTw>
        </div>
        ) : null}
      </div>

      {settingsTab === "seo" ? (
        <PageSeoSettings />
      ) : (
      <>
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
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
        currentPage={currentPage}
        total={total}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={isEdit ? "Edit Website Content" : "Add Website Content"}
        size="xl"
        dismissible
        showHeader
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-12 gap-x-4">
            <div className="col-span-12 md:col-span-6">
              <Controller
                name="sectionKey"
                control={control}
                render={({ field }) => (
                  <SelectSearch
                    label="Section *"
                    options={SECTION_OPTIONS}
                    value={
                      SECTION_OPTIONS.find((o) => o.value === field.value) ||
                      null
                    }
                    onChange={(opt) => field.onChange(opt?.value || "")}
                    error={errors.sectionKey?.message}
                  />
                )}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Controller
                name="contentType"
                control={control}
                render={({ field }) => (
                  <SelectSearch
                    label="Content type *"
                    options={TYPE_OPTIONS}
                    value={
                      TYPE_OPTIONS.find((o) => o.value === field.value) ||
                      null
                    }
                    onChange={(opt) => field.onChange(opt?.value || "item")}
                  />
                )}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Title *"
                    {...field}
                    error={errors.title?.message}
                  />
                )}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Controller
                name="slug"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Slug"
                    {...field}
                    placeholder="auto from title"
                  />
                )}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Controller
                name="eyebrow"
                control={control}
                render={({ field }) => (
                  <Input label="Eyebrow (meta)" {...field} />
                )}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Controller
                name="sortOrder"
                control={control}
                render={({ field }) => (
                  <Input label="Sort order" type="number" {...field} />
                )}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Controller
                name="iconUrl"
                control={control}
                render={({ field }) => (
                  <Input label="Icon URL" {...field} />
                )}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Controller
                name="previewUrl"
                control={control}
                render={({ field }) => (
                  <Input label="Preview image URL" {...field} />
                )}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Controller
                name="iconBg"
                control={control}
                render={({ field }) => (
                  <Input label="Icon background" {...field} />
                )}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Controller
                name="previewBg"
                control={control}
                render={({ field }) => (
                  <Input label="Preview background" {...field} />
                )}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Controller
                name="accentColor"
                control={control}
                render={({ field }) => (
                  <Input label="Accent color" {...field} />
                )}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Controller
                name="ctaLabel"
                control={control}
                render={({ field }) => <Input label="CTA label" {...field} />}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Controller
                name="ctaHref"
                control={control}
                render={({ field }) => <Input label="CTA link" {...field} />}
              />
            </div>
            <div className="col-span-12">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Description"
                    type="textarea"
                    rows={3}
                    {...field}
                  />
                )}
              />
            </div>
            <div className="col-span-12">
              <Controller
                name="featuresText"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Features (one per line)"
                    type="textarea"
                    rows={4}
                    {...field}
                  />
                )}
              />
            </div>
            <div className="col-span-12">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <SwitchButton
                    label="Active"
                    enabled={!!field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <ButtonTw type="button" variant="light" onClick={handleClose}>
              Cancel
            </ButtonTw>
            <ButtonTw
              type="submit"
              variant="blue"
              loading={addOrUpdateWebsiteContentMutation.isPending}
            >
              {isEdit ? "Update" : "Save"}
            </ButtonTw>
          </div>
        </form>
      </ModalTw>
      </>
      )}
    </div>
  );
}
