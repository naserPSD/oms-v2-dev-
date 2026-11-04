"use client";
import React, { useMemo, useState, useCallback } from "react";
import helpers from "@/utils/helpers";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import Swal from "sweetalert2";
import ButtonTw from "@/components/ui/ButtonTw";
import { BiPlus } from "react-icons/bi";
import AddOrUpdateMasterAssetTypeModal from "./AddOrUpdateMasterAssetTypeModal";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { deleteAssetType } from "@/services/hrServiceApi";
import { Trash2 } from "lucide-react";
import { getMasterAssetTypesTableColumns } from "../hooks/useMasterAssetTypesTableColumns";
import CommonTable from "@/components/common/CommonTable";
import Pagination from "@/components/common/Pagination";
import Input from "@/components/ui/Input";
import { Search } from "lucide-react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

const MasterAssetTypesTable = () => {
  const { useGlobalAssetTypeQuery } = useHrQueryApi();
  const { data: globalAssetTypes = [], isFetching } = useGlobalAssetTypeQuery();
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const queryClient = useQueryClient();
  
  const deleteAssetTypeMutation = useMutation({
    mutationFn: deleteAssetType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["globalAssetTypes"] });
      helpers.toaster("Asset type deleted successfully", "success");
    },
    onError: () => {
      helpers.toaster("Failed to delete asset type", "error");
    },
  });

  const handleEdit = useCallback((item) => {
    setSelectedAsset(item);
    setShowModal(true);
  }, []);

  const handleAdd = () => {
    setSelectedAsset(null);
    setShowModal(true);
  };

  const handleDelete = useCallback(async (id) => {
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
        await deleteAssetTypeMutation.mutateAsync(id);
      }
    });
  }, [deleteAssetTypeMutation]);


  const columns = useMemo(
    () =>
      getMasterAssetTypesTableColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete]
  );

  const table = useReactTable({
    data: globalAssetTypes,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: itemsPerPage,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const total = table.getFilteredRowModel().rows.length;

  return (
    <div className="">
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Asset Types</h1>
        <div className="flex gap-2">
          {Object.keys(rowSelection).length > 0 && (
            <ButtonTw
              onClick={() => {
                const selectedRows = table.getSelectedRowModel().rows;
                if (selectedRows.length === 0) return;
                
                Swal.fire({
                  title: "Are you sure?",
                  text: `You are about to delete ${selectedRows.length} selected items. You won't be able to revert this!`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Yes, delete them!",
                  customClass: {
                    popup: "swal-popup",
                    confirmButton: "swal-confirm-btn",
                    cancelButton: "swal-cancel-btn",
                  },
                  buttonsStyling: false,
                }).then(async (result) => {
                  if (result.isConfirmed) {
                    try {
                      // Delete each selected item one by one
                      for (const row of selectedRows) {
                        await deleteAssetTypeMutation.mutateAsync(row.original.value);
                      }
                      setRowSelection({}); // Clear selection after successful deletion
                    } catch (error) {
                      console.error("Error during bulk delete:", error);
                    }
                  }
                });
              }}
              variant="red"
              className="gap-2"
              disabled={deleteAssetTypeMutation.isLoading}
            >
              <Trash2 size={16} /> Delete Selected ({Object.keys(rowSelection).length})
            </ButtonTw>
          )}
          <ButtonTw onClick={handleAdd} variant="blue" className="gap-2">
            <BiPlus /> Add New
          </ButtonTw>
        </div>
      </div>

      <div className="mb-4 w-64">
        <Input
          type="text"
          label="Search Asset Type"
          value={globalFilter}
          onChange={(val) => setGlobalFilter(val)}
          placeholder="Search asset type..."
          icon={<Search className="h-5 w-5 text-gray-400" />}
          clearable={true}
        />
      </div>

                  <CommonTable
        table={table}
        isFetching={isFetching}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={Boolean(globalFilter)}
        currentPage={currentPage}
        total={total}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {showModal && (
        <AddOrUpdateMasterAssetTypeModal
          showModal={showModal}
          setShowModal={setShowModal}
          selectedAsset={selectedAsset}
        />
      )}
    </div>
  );
};
export default MasterAssetTypesTable;
