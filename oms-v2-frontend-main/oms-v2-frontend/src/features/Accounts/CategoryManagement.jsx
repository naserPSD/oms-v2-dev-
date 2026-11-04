"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  
  Plus,
  RefreshCw,
  Search,
  Tag,
  
  
  
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
import { toaster } from "@/utils/helpers";

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


export default function CategoryManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kind = searchParams.get("type") === "income" ? "income" : "expense";
  const backHref = kind === "income" ? "/accounts/income" : "/accounts/expense";

  const { hasPermission } = useCommonFunctions();
  const canCreate = hasPermission("accounts.category.create");
  const canUpdate = hasPermission("accounts.category.update");
  const canDelete = hasPermission("accounts.category.delete");
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions) || [];
  const isSuperAdmin = permissions.includes("*") || permissions.includes("super_admin") || permissions.includes("all") || user?.role?.code === "super_admin";

  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedImportIds, setSelectedImportIds] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const masterNames = masterCategories.map(c => c.name);
      const selectable = userCategories.filter(c => !masterNames.includes(c.name));
      setSelectedIds(selectable.map((i) => i.id || i._id));
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
  const importMutation = accountsQuery.importMasterCategoriesMutation;

  const categories = useMemo(() => unwrapCategories(categoriesData), [categoriesData]);
  const normalizedQuery = query.trim().toLowerCase();
  
  // We only display user categories in this component now.
  const userCategories = useMemo(
    () => categories.filter((cat) => cat.source !== "master" && matchesQuery(cat, normalizedQuery)),
    [categories, normalizedQuery],
  );

  const masterCategories = useMemo(
    () => categories.filter((cat) => cat.source === "master"),
    [categories],
  );

  const switchKind = (next) => {
    closeForm();
    setQuery("");
    router.push(`/accounts/categories?type=${next}`);
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
             await deleteMutation.mutateAsync({ id, source: "user" });
          }
          toaster(`${selectedIds.length} category record(s) deleted`, "success");
          setSelectedIds([]);
        } catch (err) {
          console.error("Failed to delete categories:", err);
        }
      }
    });
  };

  const openCreate = () => {
    setEditingCategory(null);
    setFormValues({ ...EMPTY_FORM, source: "user" });
    setShowForm(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setFormValues({
      name: category.name || "",
      description: category.description || "",
      isActive: category.isActive !== false,
      source: category.source || "user",
    });
    setShowForm(true);
  };

  const handleImportDefault = () => {
    setSelectedImportIds(masterCategories.map(c => c.id || c._id));
    setShowImportModal(true);
  };

  const submitImport = async () => {
    if (selectedImportIds.length === 0) return;
    setIsImporting(true);
    try {
      const selectedCats = masterCategories.filter(c => selectedImportIds.includes(c.id || c._id));
      for (const cat of selectedCats) {
        await createMutation.mutateAsync({
          name: cat.name,
          description: cat.description,
          isActive: true,
          source: "user"
        });
      }
      toaster(`Successfully imported ${selectedCats.length} category(s)`, "success");
      setShowImportModal(false);
      setSelectedImportIds([]);
    } catch (error) {
      console.error(error);
      toaster("Failed to import some categories", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      isActive: formValues.isActive,
      source: "user",
    };
    if (!payload.name) return;
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, payload }, { onSuccess: closeForm });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeForm });
  };

  const toggleActiveStatus = (category) => {
    if (!canUpdate) return;
    const payload = {
      name: category.name,
      description: category.description,
      isActive: category.isActive === false ? true : false,
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
    isMaster: false,
    isSuperAdmin,
    selectedIds,
    handleSelectRow,
    handleSelectAll,
    categories: userCategories,
    masterCategoryNames: masterCategories.map(c => c.name),
  });

  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data: userCategories || [],
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
            <Tag className="h-6 w-6 text-blue-600" />
            Manage Categories
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <button
            type="button"
            onClick={handleImportDefault}
            disabled={importMutation.isPending || expenseCategoriesQuery.isLoading || incomeCategoriesQuery.isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 disabled:opacity-70"
          >
            <RefreshCw className={`h-4 w-4 ${importMutation.isPending ? "animate-spin" : ""}`} />
            {importMutation.isPending ? "Importing..." : "Import Default"}
          </button>
          {canCreate && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add category
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
            placeholder="Search categories"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </label>
      </div>

      <ModalTw
        show={showForm}
        onClose={closeForm}
        title={editingCategory ? "Edit your category" : `New ${kind} category`}
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
            <ButtonTw type="submit" disabled={saving}>{saving ? "Saving..." : editingCategory ? "Save changes" : "Create category"}</ButtonTw>
          </div>
        </form>
      </ModalTw>


      <ModalTw
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Default Categories"
        subTitle={`${selectedImportIds.length} of ${masterCategories.length} categories selected`}
        size="lg"
        showFooter={false}
      >
        <div className="space-y-4 pt-2 max-h-[60vh] overflow-y-auto">
          {masterCategories.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No default categories available to import.</div>
          ) : (
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    checked={selectedImportIds.length === masterCategories.length && masterCategories.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedImportIds(masterCategories.map(c => c.id || c._id));
                      else setSelectedImportIds([]);
                    }}
                  />
                  <span className="font-semibold text-sm">Select All</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                  {selectedImportIds.length} of {masterCategories.length} selected
                </span>
              </label>
              <div className="grid gap-2">
                {masterCategories.map(cat => (
                  <label key={cat.id || cat._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      checked={selectedImportIds.includes(cat.id || cat._id)}
                      onChange={(e) => {
                        const id = cat.id || cat._id;
                        if (e.target.checked) setSelectedImportIds(prev => [...prev, id]);
                        else setSelectedImportIds(prev => prev.filter(i => i !== id));
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cat.name}</span>
                      {cat.description && <span className="text-xs text-gray-500">{cat.description}</span>}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
          <ButtonTw variant="light" onClick={() => setShowImportModal(false)}>Cancel</ButtonTw>
          <ButtonTw onClick={submitImport} disabled={isImporting || selectedImportIds.length === 0}>
            {isImporting
              ? "Importing..."
              : selectedImportIds.length > 0
              ? `Import Selected (${selectedImportIds.length})`
              : "Import Selected"}
          </ButtonTw>
        </div>
      </ModalTw>

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center dark:border-gray-800 dark:bg-gray-900">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-600" />
          <p className="mt-2 text-xs text-gray-500">Loading categories...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                  <Tag className="h-4 w-4 text-blue-600" />
                  Your categories
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">{userCategories.length} custom categories</p>
              </div>
            </header>
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900 text-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 shadow-md mb-4">
              <span className="text-xs font-semibold px-2 text-slate-200 dark:text-gray-200">
                {selectedIds.length} item(s) selected
              </span>
              <div className="flex items-center gap-2">
                {canDelete && (
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

            {userCategories.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-gray-500">
                {normalizedQuery ? "No matching categories." : "You have not added a category yet."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <CommonTable
                  table={table}
                  isFetching={isLoading}
                  itemsPerPage={userCategories.length}
                  columns={columns}
                  hasActiveFilters={!!normalizedQuery}
                />
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
