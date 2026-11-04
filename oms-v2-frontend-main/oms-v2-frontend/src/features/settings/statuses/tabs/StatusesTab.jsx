"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import Swal from "sweetalert2";
import { BiPlus } from "react-icons/bi";
import { Pencil, Trash2 } from "lucide-react";
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import CommonTable from "@/components/common/CommonTable";
import ButtonTw from "@/components/ui/ButtonTw";
import helpers from "@/utils/helpers";
import {
  deleteStatus,
  fetchStatusGroups,
  fetchStatuses,
} from "@/services/statusServiceApi";
import StatusModal from "../modals/StatusModal";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

const StatusesTab = ({ showFilter = true }) => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(
    helpers.perPageListItems || 10,
  );
  const [filters, setFilters] = useState({
    name: "",
    code: "",
    statusGroupId: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const debouncedSetFilters = useMemo(
    () =>
      debounce((next) => {
        setDebouncedFilters(next);
        setCurrentPage(1);
      }, 400),
    [],
  );

  const onFilterChange = (name, value) => {
    setFilters((prev) => {
      const next = { ...prev, [name]: value };
      debouncedSetFilters(next);
      return next;
    });
  };

  const onClearFilters = () => {
    const empty = { name: "", code: "", statusGroupId: "" };
    setFilters(empty);
    setDebouncedFilters(empty);
    setCurrentPage(1);
  };

  const { data: groupsResponse } = useQuery({
    queryKey: ["adminStatusGroupsAll"],
    queryFn: () =>
      fetchStatusGroups({
        page: 1,
        limit: 500,
        sort: "name:asc",
        params: JSON.stringify({}),
      }),
    staleTime: 1000 * 60 * 5,
  });

  const statusGroupOptions = useMemo(() => {
    const list = groupsResponse?.data ?? [];
    return [
      { label: "All groups", value: "" },
      ...list.map((g) => ({
        label: g.name ? `${g.name} (${g.code})` : g.code,
        value: String(g.id),
        searchText: `${g.name || ""} ${g.code || ""} ${g.id}`,
      })),
    ];
  }, [groupsResponse]);

  const listParams = useMemo(() => {
    const payload = {};
    if (debouncedFilters.name?.trim()) {
      payload.name = debouncedFilters.name.trim();
    }
    if (debouncedFilters.code?.trim()) {
      payload.code = debouncedFilters.code.trim();
    }
    if (debouncedFilters.statusGroupId) {
      payload.statusGroupId = debouncedFilters.statusGroupId;
    }
    return {
      page: currentPage,
      limit: itemsPerPage,
      sort: "id:desc",
      params: JSON.stringify(payload),
    };
  }, [currentPage, itemsPerPage, debouncedFilters]);

  const { data: listResponse, isFetching } = useQuery({
    queryKey: ["adminStatuses", listParams],
    queryFn: () => fetchStatuses(listParams),
    keepPreviousData: true,
  });

  const rows = listResponse?.data ?? [];
  const total = listResponse?.meta?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: deleteStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminStatuses"] });
      helpers.toaster("Status deleted successfully", "success");
    },
    onError: (err) => {
      helpers.toaster(
        err?.response?.data?.message || "Failed to delete status",
        "error",
      );
    },
  });

  const handleEdit = useCallback((row) => {
    setSelectedRow(row);
    setShowModal(true);
  }, []);

  const handleAdd = () => {
    setSelectedRow(null);
    setShowModal(true);
  };

  const handleDelete = useCallback(
    (row) => {
      Swal.fire({
        title: "Delete status?",
        text: `Remove "${row.name}"? Only delete test records you created.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
        customClass: {
          popup: "swal-popup",
          confirmButton: "swal-confirm-btn",
          cancelButton: "swal-cancel-btn",
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
          deleteMutation.mutate(row.id);
        }
      });
    },
    [deleteMutation],
  );

  const columns = useMemo(
    () => [
      {
        id: "sl",
        header: () => <div className="text-center w-full">SL.</div>,
        cell: ({ row }) => (
          <div className="text-center">
            {(currentPage - 1) * itemsPerPage + row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: () => <div className="text-left w-full">Name</div>,
      },
      {
        accessorKey: "code",
        header: () => <div className="text-left w-full">Code</div>,
        cell: ({ getValue }) => (
          <span className="font-mono text-sm">{getValue() || "—"}</span>
        ),
      },
      {
        id: "statusGroup",
        header: () => <div className="text-left w-full">Status group</div>,
        cell: ({ row }) => {
          const g = row.original.statusGroup;
          if (!g) return "—";
          return g.name || g.code || `#${g.id}`;
        },
      },
      {
        accessorKey: "colorName",
        header: () => <div className="text-center w-full">Color</div>,
        cell: ({ getValue }) => (
          <div className="text-center">{getValue() || "—"}</div>
        ),
      },
      {
        accessorKey: "serial",
        header: () => <div className="text-center w-full">Serial</div>,
        cell: ({ getValue }) => (
          <div className="text-center">
            {getValue() !== null && getValue() !== undefined
              ? getValue()
              : "—"}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: () => <div className="text-center w-full">Active</div>,
        cell: ({ getValue }) => (
          <div className="text-center">{getValue() ? "Yes" : "No"}</div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-center w-full">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handleEdit(row.original)}
              className="btn-action text-blue-500 hover:text-blue-700"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(row.original)}
              className="btn-action text-red-500 hover:text-red-700"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [currentPage, itemsPerPage, handleEdit, handleDelete],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const hasActiveFilters = Boolean(
    filters.name?.trim() ||
      filters.code?.trim() ||
      filters.statusGroupId,
  );

  return (
    <div>
      <DataFilter
        compact
        compactColumnCount={4}
        showFilter={showFilter}
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        hasActiveFilters={hasActiveFilters}
        filterConfig={[
          {
            name: "name",
            label: "Name",
            placeholder: "Filter by name",
            component: "input",
          },
          {
            name: "code",
            label: "Code",
            placeholder: "Filter by code",
            component: "input",
          },
          {
            name: "statusGroupId",
            label: "Status group",
            placeholder: "Search status group...",
            component: "select",
            options: statusGroupOptions,
            searchable: true,
          },
          {
            name: "clear",
            label: "Clear",
            component: "clear",
          },
        ]}
      />

      <div className="flex justify-end mb-3">
        <ButtonTw onClick={handleAdd} size="sm" className="inline-flex gap-1">
          <BiPlus className="h-5 w-5" />
          Add status
        </ButtonTw>
      </div>

      <CommonTable table={table} isLoading={isFetching} />

      <Pagination
        currentPage={currentPage}
        totalItems={total}
        resultRows={rows.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(val) => {
          setItemsPerPage(val);
          setCurrentPage(1);
        }}
      />

      <StatusModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedRow={selectedRow}
        statusGroupOptions={statusGroupOptions.filter((o) => o.value)}
      />
    </div>
  );
};

export default StatusesTab;
