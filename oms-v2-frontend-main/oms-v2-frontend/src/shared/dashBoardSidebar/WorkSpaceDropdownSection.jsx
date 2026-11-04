// // WorkspaceDropdownSection.jsx
// "use client";
// import { FaChevronDown, FaChevronUp, FaChevronRight } from "react-icons/fa";
// import { MdTask } from "react-icons/md";
// import { useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";

// export const WorkspaceDropdownSection = ({
//   workspaces = [],
//   isLoading = false,
// }) => {
//   const [open, setOpen] = useState(false);
//   const [openSubDropdowns, setOpenSubDropdowns] = useState({});
//   const pathName = usePathname();

//   const toggleSubDropdown = (workspaceId) => {
//     setOpenSubDropdowns((prev) => ({
//       ...prev,
//       [workspaceId]: !prev[workspaceId],
//     }));
//   };

//   // Get unique workspaces
//   const uniqueWorkspaces = Array.from(
//     new Map(workspaces.map((ws) => [ws.name, ws])).values()
//   );

//   return (
//     <div className="w-full mt-1.5">
//       <button
//         onClick={() => setOpen(!open)}
//         className={`flex items-center justify-between w-full p-2 px-3 dark:text-gray-300 text-gray-800 hover:bg-gray-400 hover:dark:bg-gray-700 hover:text-gray-200 rounded-md transition ${
//           open ? "dark:bg-theme-dark bg-gray-200" : ""
//         }`}
//       >
//         <div className="flex items-center gap-3">
//           <span className="text-xl">
//             <MdTask />
//           </span>
//           <span>Workspaces</span>
//         </div>
//         {open ? <FaChevronUp /> : <FaChevronDown />}
//       </button>

//       <div
//         className={`transition-all duration-300 ${
//           open ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
//         }`}
//       >
//         {isLoading ? (
//           <div className="ml-5 pl-5 py-2">
//             <span className="text-sm text-gray-500">Loading workspaces...</span>
//           </div>
//         ) : uniqueWorkspaces.length === 0 ? (
//           <div className="ml-5 pl-5 py-2">
//             <span className="text-sm text-gray-500">No workspaces found</span>
//           </div>
//         ) : (
//           <ul className="ml-5 pl-5 border-l-[2px] border-gray-300 dark:border-gray-800 py-1 space-y-2">
//             {uniqueWorkspaces.map((workspace) => {
//               const isSubDropdownOpen = openSubDropdowns[workspace.id];
//               const isWorkspaceActive = pathName.includes(
//                 `/tasks/workspace/${workspace.id}`
//               );

//               return (
//                 <li key={workspace.id} className="mt-1">
//                   <div className="flex items-center justify-between">
//                     <Link
//                       href={`/tasks/workspace/${workspace.id}`}
//                       className={`text-sm hover:text-secondaryColor transition flex-1 ${
//                         isWorkspaceActive
//                           ? "text-secondaryColor font-medium"
//                           : ""
//                       }`}
//                     >
//                       {workspace.name}
//                     </Link>
//                     <button
//                       onClick={() => toggleSubDropdown(workspace.id)}
//                       className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
//                     >
//                       {isSubDropdownOpen ? (
//                         <FaChevronDown className="text-xs" />
//                       ) : (
//                         <FaChevronRight className="text-xs" />
//                       )}
//                     </button>
//                   </div>

//                   {isSubDropdownOpen && (
//                     <div className="ml-4 mt-1 pl-3 border-l border-gray-400 dark:border-gray-600">
//                       <Link
//                         href={`/get-board-list-by-workspace-id/${workspace.id}`}
//                         className="block text-xs text-gray-600 dark:text-gray-400 hover:text-secondaryColor py-1"
//                       >
//                         View Boards
//                       </Link>
//                       <Link
//                         href={`/tasks/workspace/${workspace.id}/board/todo`}
//                         className="block text-xs text-gray-600 dark:text-gray-400 hover:text-secondaryColor py-1"
//                       >
//                         To Do Board
//                       </Link>
//                       <Link
//                         href={`/tasks/workspace/${workspace.id}/board/in-progress`}
//                         className="block text-xs text-gray-600 dark:text-gray-400 hover:text-secondaryColor py-1"
//                       >
//                         In Progress Board
//                       </Link>
//                       <Link
//                         href={`/tasks/workspace/${workspace.id}/board/completed`}
//                         className="block text-xs text-gray-600 dark:text-gray-400 hover:text-secondaryColor py-1"
//                       >
//                         Completed Board
//                       </Link>
//                     </div>
//                   )}
//                 </li>
//               );
//             })}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };

// WorkspaceDropdownSection.jsx
"use client";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { MdTask } from "react-icons/md";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";

export const WorkspaceDropdownSection = ({
  workspaces = [],
  handleAddWorkSpace,
}) => {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();

  // Get unique workspaces by name
  const uniqueWorkspaces = Array.from(
    new Map(workspaces.map((ws) => [ws.name, ws])).values()
  );

  return (
    <div className="w-full mt-1.5">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((prev) => !prev);
          }
        }}
        className={`flex items-center justify-between w-full p-2 px-3 dark:text-gray-300 text-gray-800 hover:bg-gray-400 hover:dark:bg-gray-700 hover:text-gray-200 rounded-md transition cursor-pointer ${
          open ? "dark:bg-theme-dark bg-gray-200" : ""
        }`}
      >
        <div className="flex items-center gap-1">
          <span className="text-xl">
            <MdTask />
          </span>
          <span>Task Workspaces</span>
          <SimpleTooltip text="Add New Workspace">
            <ButtonTw
              variant="outline.info"
              size="xs"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleAddWorkSpace();
              }}
            >
              Add
            </ButtonTw>
          </SimpleTooltip>
        </div>
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </div>

      <div
        className={`overflow-y-auto sidebar-scroll transition-all duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {uniqueWorkspaces.length === 0 ? (
          <div className="ml-5 pl-5 py-2">
            <span className="text-sm text-gray-500">No workspaces found</span>
          </div>
        ) : (
          <ul className="ml-5 my-1.5 pl-5 border-l-[2px] border-gray-300 dark:border-gray-600  py-1 text-gray-300 space-y-2">
            {uniqueWorkspaces.map((workspace) => {
              const isActive = pathName.includes(`/workspaces/${workspace.id}`);

              return (
                <li key={workspace.id} className="mt-1">
                  <Link
                    href={`/task-workspace/${workspace.id}`}
                    className={`block text-sm hover:text-secondaryColor transition ${
                      isActive
                        ? "text-secondaryColor font-medium"
                        : "text-gray-800 dark:text-gray-300"
                    } `}
                  >
                    {workspace.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
