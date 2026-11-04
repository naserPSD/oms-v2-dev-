"use client";
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTaskListTableColumn } from "./hooks/useTaskListTableColumn";
//import TaskBoardView from "./TaskBoardView";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import { useAuthStore } from "@/store/useAuthStore";

const TaskListView = ({
  // Props from parent
  tasks = [],
  onEdit,
  onDelete,
  onViewAssignees,
  onViewComments,
  onToggleStatus,
  onAddTask,
  isLoading = false,
  total = 0,
  filters,
  globalFilter,
  hasActiveFilters,
  filterConfig,
  showFilter,
  toggleFilter,
  handleFilterChange,
  clearAllFilters,
  //viewMode,
  // setViewMode,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  //pagination,
  sorting,
  setSorting,
  setGlobalFilter,
}) => {
  const authUser = useAuthStore((state) => state.user);

  const isTaskAssigneeAdminOrEditor = (item) => {
    if (!authUser?.id || !item) return false;
    if (
      authUser?.appUseCase === "Admin" ||
      authUser?.role?.name?.toLowerCase() === "admin" ||
      authUser?.role?.name?.toLowerCase() === "super admin"
    ) {
      return true;
    }
    const creatorId = item?.creatorId || item?.createdById || item?.creator?.id;
    if (creatorId && Number(creatorId) === Number(authUser?.id)) {
      return true;
    }
    if (!item?.assignees || item.assignees.length === 0) {
      return true;
    }
    const assignee = item.assignees.find(
      (a) => a?.assignedOn?.user?.id === authUser?.id || a?.assignedOn?.userId === authUser?.id
    );
    return !assignee || assignee?.taskRoleId === 87 || assignee?.taskRoleId === 88;
  };

  // Table columns
  const columns = useTaskListTableColumn({
    handleEdit: onEdit,
    handleDelete: onDelete,
    authUser: authUser,
    isTaskAssigneeAdminOrEditor: isTaskAssigneeAdminOrEditor,
    handleToggleStatus: onToggleStatus,
    handleViewTaskCommentsModal: onViewComments,
    handleVewTaskAssigneeModal: onViewAssignees,
  });

  // Create TanStack Table instance
  const table = useReactTable({
    data: tasks,
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

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-2xl">Task List</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your all tasks ({total} tasks found)
          </p>
        </div>

        <div className="flex gap-2">
          <SimpleTooltip text={`${showFilter ? "Hide" : "Show"} Filters`}>
            <ButtonTw
              onClick={toggleFilter}
              variant="alternative"
              className="gap-2"
            >
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>

          {/* View Toggle Buttons */}
          {/* <SimpleTooltip text="Table View">
            <ButtonTw
              onClick={() => setViewMode("table")}
              variant={viewMode === "table" ? "blue" : "outline"}
              className="gap-2"
            >
              📊
            </ButtonTw>
          </SimpleTooltip>

          <SimpleTooltip text="Card View">
            <ButtonTw
              onClick={() => setViewMode("card")}
              variant={viewMode === "card" ? "blue" : "outline"}
              className="gap-2"
            >
              🗂️
            </ButtonTw>
          </SimpleTooltip> */}

          <ButtonTw onClick={() => onAddTask?.()} variant="blue" className="gap-2">
            <BiPlus /> Add Task
          </ButtonTw>
        </div>
      </div>

      {/* Filter Bar */}
      <DataFilter
        showFilter={showFilter}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Task Table */}
      {/* {viewMode === "card" ? (
        <TaskBoardView
          tasks={tasks}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewAssignees={onViewAssignees}
          onViewComments={onViewComments}
          viewMode={viewMode}
        />
      ) : ( */}
      <CommonTable
        table={table}
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
      />
      {/* )} */}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
};

export default TaskListView;
