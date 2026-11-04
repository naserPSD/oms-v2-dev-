"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  
  
  Plus,
  RefreshCw,
  Search,
  Shield,
  
  
  
} from "lucide-react";
import Swal from "sweetalert2";
import { useAccountsQueryApi } from "@/hooks/queryApi/useAccountsQueryApi";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import { useAuthStore } from "@/store/useAuthStore";

import CommonTable from "@/components/common/CommonTable";
import { getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useCategoryTableColumns } from "./hooks/useCategoryTableColumns";
import SwitchButton from "@/components/ui/SwitchButton";
import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";

const EMPTY_FORM = { name: "", description: "", isActive: true };

function unwrapCategories(data) {
  if (Array.isArray(data?.data?.data)) return data.data.data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}

function matchesQuery(category, query) {
  if (!query) return true;
  const haystack = `${category.name || ""} ${category.description || ""}`.toLowerCase();
  return haystack.includes(query);
}

export default function MasterCategoryManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const kind = searchParams.get("type") === "income" ? "income" : "expense";

  const { hasPermission } = useCommonFunctions();
  const canCreate = hasPermission("accounts.category.create");
  const canUpdate = hasPermission("accounts.category.update");
  const canDelete = hasPermission("accounts.category.delete");
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions) || [];
  const isSuperAdmin = permissions.includes("*") || permissions.includes("super_admin") || permissions.includes("all") || user?.role?.code === "super_admin";

  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(defaultCategories.map((i) => i.id || i._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };


  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormValues(EMPTY_FORM);
  };


  const accountsQuery = useAccountsQueryApi({ handleClose: closeForm });
  const expenseCategoriesQuery = accountsQuery.useExpenseCategoriesQuery({ status: "all" });
  const incomeCategoriesQuery = accountsQuery.useIncomeCategoriesQuery({ status: "all" });
  const activeQuery = kind === "income" ? incomeCategoriesQuery : expenseCategoriesQuery;
  const { data: categoriesData, isLoading } = activeQuery;
  
  const createMutation = kind === "income"
    ? accountsQuery.createIncomeCategoryMutation
    : accountsQuery.createCategoryMutation;
  const updateMutation = kind === "income"
    ? accountsQuery.updateIncomeCategoryMutation
    : accountsQuery.updateCategoryMutation;
  const deleteMutation = kind === "income"
    ? accountsQuery.deleteIncomeCategoryMutation
    : accountsQuery.deleteCategoryMutation;

  const categories = useMemo(() => unwrapCategories(categoriesData), [categoriesData]);
  const normalizedQuery = query.trim().toLowerCase();
  
  const defaultCategories = useMemo(
    () => categories.filter((cat) => cat.source === "master" && matchesQuery(cat, normalizedQuery)),
    [categories, normalizedQuery],
  );

  const switchKind = (next) => {
    closeForm();
    setQuery("");
    router.push(`${pathname}?type=${next}`);
  };


  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${selectedIds.length} category record(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal-popup rounded-2xl",
        confirmButton:
          "px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-sm",
        cancelButton:
          "px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          for (const id of selectedIds) {
            await deleteMutation.mutateAsync({ id, source: "master" });
          }
          setSelectedIds([]);
        } catch (err) {
          console.error("Failed to delete categories:", err);
        }
      }
    });
  };

  const openCreate = () => {
    setEditingCategory(null);
    setFormValues({ ...EMPTY_FORM, source: "master" });
    setShowForm(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setFormValues({
      name: category.name || "",
      description: category.description || "",
      isActive: category.isActive !== false,
      source: "master",
    });
    setShowForm(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      isActive: formValues.isActive,
      source: "master",
    };
    if (!payload.name) return;
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, payload }, { onSuccess: closeForm });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeForm });
  };

  const toggleActiveStatus = (category) => {
    if (!canUpdate || !isSuperAdmin) return;
    const payload = {
      name: category.name,
      description: category.description,
      isActive: category.isActive === false ? true : false,
      source: "master"
    };
    updateMutation.mutate({ id: category.id, payload });
  };

  const handleDelete = (category) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this category record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal-popup rounded-2xl",
        confirmButton:
          "px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-sm",
        cancelButton:
          "px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate({ id: category.id, source: category.source });
      }
    });
  };

    const columns = useCategoryTableColumns({
    canUpdate,
    canDelete,
    toggleActiveStatus,
    openEdit,
    handleDelete,
    isMaster: true,
    isSuperAdmin,
    selectedIds,
    handleSelectRow,
    handleSelectAll,
    categories: defaultCategories,
  });

  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data: defaultCategories || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (!hasPermission("accounts")) {
    return <div className="my-6 text-center text-gray-500">You do not have permission to manage categories.</div>;
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 pb-12 pt-6 px-4 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            <Shield className="h-6 w-6 text-violet-600" />
            Master Categories
          </h1>
          <p className="mt-1 text-sm text-gray-500">Global defaults shared across all accounts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {canCreate && isSuperAdmin && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 hover:bg-violet-700"
            >
              <Plus className="h-4 w-4" />
              Add Master Category
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-fit rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
          {[
            { key: "income", label: "Income" },
            { key: "expense", label: "Expense" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => switchKind(tab.key)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                kind === tab.key
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <label className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search master categories"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </label>
      </div>

      <ModalTw
        show={showForm}
        onClose={closeForm}
        title={editingCategory ? "Edit master category" : `New ${kind} master category`}
        size="lg"
        showFooter={false}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid gap-4">
            <Input
              label={<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Name</span>}
              required
              value={formValues.name}
              onChange={(val) => setFormValues((prev) => ({ ...prev, name: val }))}
              placeholder="e.g. Consulting Income"
              className="!mb-0"
            />
            <Input
              label={<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Description</span>}
              value={formValues.description}
              onChange={(val) => setFormValues((prev) => ({ ...prev, description: val }))}
              placeholder="Optional note"
              className="!mb-0"
            />
            <div className="flex items-center justify-between gap-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mt-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Active Status</span>
              <SwitchButton
                name="isActive"
                enabled={formValues.isActive !== false}
                onChange={(val) => setFormValues((prev) => ({ ...prev, isActive: val }))}
                enabledText="Yes"
                disabledText="No"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <ButtonTw variant="light" type="button" onClick={closeForm}>Cancel</ButtonTw>
            <ButtonTw type="submit" disabled={saving}>{saving ? "Saving..." : editingCategory ? "Save changes" : "Create master category"}</ButtonTw>
          </div>
        </form>
      </ModalTw>


      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center dark:border-gray-800 dark:bg-gray-900">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-violet-600" />
          <p className="mt-2 text-xs text-gray-500">Loading master categories...</p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <Shield className="h-4 w-4 text-violet-600" />
                Default categories
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {canUpdate && isSuperAdmin ? "You have permission to add, edit, and delete these master categories." : "Shared with every account. These cannot be edited."}
              </p>
            </div>
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
              {defaultCategories.length}
            </span>
          </header>
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900 text-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 shadow-md mb-4">
              <span className="text-xs font-semibold px-2 text-slate-200 dark:text-gray-200">
                {selectedIds.length} item(s) selected
              </span>
              <div className="flex items-center gap-2">
                {canDelete && isSuperAdmin && (
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-600 dark:hover:bg-rose-500 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    Bulk Delete
                  </button>
                )}
              </div>
            </div>
          )}

          {defaultCategories.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-gray-500">No matching default categories.</div>
          ) : (
            <div className="overflow-x-auto">
              <CommonTable
                table={table}
                isFetching={isLoading}
                itemsPerPage={defaultCategories.length}
                columns={columns}
                hasActiveFilters={!!normalizedQuery}
              />
            </div>
          )}
        </section>
      )}

    </div>
  );
}
