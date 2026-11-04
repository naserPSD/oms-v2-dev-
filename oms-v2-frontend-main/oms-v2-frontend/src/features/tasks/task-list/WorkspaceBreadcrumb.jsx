"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  LayoutDashboard,
  ChevronDown,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import SimpleTooltip from "@/components/ui/SimpleTooltip";

const WorkspaceBreadcrumb = ({
  workspaceData = {},
  boardListsData = [],
  cardListsData,
  selectedBoardId,
  onBoardSelect,
  activeTab,
  isLoading = false,
  onAddNewBoard,
  onAddNewCard,
  setIsOpen,
  isOpen,
  setIsCardOpen,
  cardIsOpen,
  onEditWorkSpace,
}) => {
  const router = useRouter();
  // Find selected board
  const selectedBoard = useMemo(() => {
    if (!selectedBoardId || !boardListsData.length) return null;
    return boardListsData.find((board) => board.id === selectedBoardId);
  }, [selectedBoardId, boardListsData]);

  // Auto-select first board if none selected
  useEffect(() => {
    if (!selectedBoardId && boardListsData.length > 0 && !isLoading) {
      onBoardSelect(boardListsData[0].id);
    }
  }, [boardListsData, selectedBoardId, isLoading, onBoardSelect]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  // No workspace data
  if (!workspaceData || Object.keys(workspaceData).length === 0) {
    return (
      <div className="flex items-center space-x-2 py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-500 dark:text-gray-400">
        <LayoutDashboard className="h-4 w-4" />
        <span>No workspace selected</span>
      </div>
    );
  }

  const handleListView = () => {
    const params = new URLSearchParams({
      page: "1",
      limit: "10",
    });

    router.push(`/tasks/task-list?${params.toString()}`);
  };
  const handleCardListView = () => {
    const params = new URLSearchParams({
      page: "1",
      limit: "10",
      workspaceId: workspaceData.id,
      boardId: selectedBoardId,
    });

    router.push(`/tasks/task-cards?${params.toString()}`);
  };
  return (
    <div className="flex items-center space-x-2 py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
      {/* Workspace */}
      <div className="flex items-center space-x-2">
        <LayoutDashboard className="h-4 w-4 text-blue-500" />
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {workspaceData.name || "Unnamed Workspace"}
        </span>

        <span>
          <SimpleTooltip text="Edit Workspace">
            <button
              onClick={() => onEditWorkSpace(workspaceData)}
              className="icon-btn icon-btn-outlined-info icon-btn-sm"
            >
              <Pencil size={14} />
            </button>
          </SimpleTooltip>
        </span>
      </div>

      {/* Separator */}
      <ChevronRight className="h-4 w-4 text-gray-400" />

      {/* Board Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto p-0 hover:bg-transparent focus:ring-0"
          >
            <div className="flex items-center space-x-1">
              {selectedBoard ? (
                <>
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: getBoardColor(
                        selectedBoard.viewType?.code,
                      ),
                    }}
                  ></div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {selectedBoard.name}
                  </span>
                </>
              ) : boardListsData.length > 0 ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Select Board
                  </span>
                </>
              ) : (
                <span
                  onClick={() => onAddNewBoard(workspaceData.id)}
                  className="px-1.5 py-1.5 bg-gray-200 dark:bg-gray-800 rounded text-xs text-gray-500 cursor-pointer"
                >
                  {" "}
                  + Add New Board
                </span>
              )}
              {boardListsData.length > 0 && (
                <ChevronDown className="h-3 w-3 text-gray-400 ml-1" />
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>

        {/* Dropdown Content */}
        {boardListsData.length > 0 && (
          <DropdownMenuContent align="start" className="w-64 max-h-64">
            {/* Boards List */}
            {boardListsData.map((board) => (
              <DropdownMenuItem
                key={board.id}
                onClick={() => {
                  onBoardSelect(board.id);
                  setIsOpen(false);

                  // Navigate to board's default view type
                  // if (board.viewType?.code) {
                  //   router.push(
                  //     `/task-workspace/${board.id}?tab=${board.viewType.code}`
                  //   );
                  // }
                }}
                className={`flex items-center justify-between ${
                  selectedBoardId === board.id
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: getBoardColor(board.viewType?.code),
                    }}
                  ></div>
                  <span>{board.name}</span>
                </div>

                {/* Board info */}
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                    {board.cards?.length || 0} cards
                  </span>
                </div>
              </DropdownMenuItem>
            ))}

            {/* Divider */}
            <div className="border-t my-1"></div>

            {/* Create New Board */}

            <div className="flex items-center justify-between w-full px-1 pt-0.5 pb-1">
              <div className="">
                <span
                  onClick={() => onAddNewBoard(workspaceData.id)}
                  className="px-1.5 py-1.5 bg-gray-200 dark:bg-gray-800 rounded text-xs text-gray-500 cursor-pointer"
                >
                  {" "}
                  + Add New Board
                </span>
              </div>

              <div className="">
                <span
                  onClick={handleListView}
                  className="px-1.5 py-1.5 bg-gray-200 dark:bg-gray-800 rounded text-xs text-gray-500 cursor-pointer"
                >
                  List view
                </span>
              </div>
            </div>
          </DropdownMenuContent>
        )}
      </DropdownMenu>

      {/* Task Card Dropdown */}
      {boardListsData.length && selectedBoardId ? (
        cardListsData.length > 0 ? (
          <DropdownMenu open={cardIsOpen} onOpenChange={setIsCardOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="default"
                className="h-auto hover:bg-transparent focus:ring-0 px-4 py-1"
              >
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Show Cards ({cardListsData.length})
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-64 max-h-64">
              {cardListsData.map((card) => (
                <DropdownMenuItem key={card.id}>
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: getBoardColor(card?.color),
                      }}
                    />
                    <span>{card.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}

              <div className="border-t my-1"></div>

              <div className="flex items-center justify-between w-full px-1 pt-0.5 pb-1">
                <span
                  onClick={() => onAddNewCard(workspaceData.id)}
                  className="px-1.5 py-1.5 bg-gray-200 dark:bg-gray-800 rounded text-xs text-gray-500 cursor-pointer"
                >
                  + Add New Card
                </span>

                <span
                  onClick={handleCardListView}
                  className="px-1.5 py-1.5 bg-gray-200 dark:bg-gray-800 rounded text-xs text-gray-500 cursor-pointer"
                >
                  Card List view
                </span>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span
            onClick={() => onAddNewCard(workspaceData.id)}
            className="px-2 py-1.5 bg-gray-200 dark:bg-gray-800 rounded text-xs text-gray-500 cursor-pointer"
          >
            + Add New Card
          </span>
        )
      ) : null}

      {/* Active Tab Indicator */}
      {selectedBoard && activeTab && (
        <>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: getBoardColor(activeTab) }}
            ></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getTabLabel(activeTab)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

// Helper function to get board color based on view type
const getBoardColor = (viewTypeCode) => {
  const colorMap = {
    task_board_view_type_kanban: "#3b82f6", // Blue
    task_board_view_type_list: "#10b981", // Green
    task_board_view_type_calendar: "#f59e0b", // Yellow
    task_board_view_type_gantt: "#8b5cf6", // Purple
  };

  return colorMap[viewTypeCode] || "#6b7280"; // Default gray
};

// Helper function to get tab label from code
const getTabLabel = (tabCode) => {
  const labelMap = {
    task_board_view_type_kanban: "Kanban Board",
    task_board_view_type_list: "Task List",
    task_board_view_type_calendar: "Calendar",
    task_board_view_type_gantt: "Gantt Chart",
  };

  return labelMap[tabCode] || tabCode;
};

export default WorkspaceBreadcrumb;
