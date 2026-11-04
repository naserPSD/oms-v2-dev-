import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Avatar from "@/components/ui/Avatar";
import helpers from "@/utils/helpers";
import { Users, UserCheck, Calendar } from "lucide-react";

const TaskAssigneeModal = ({ showModal, onClose, selectedTaskDetails }) => {
  const assignees = selectedTaskDetails?.assignees || [];
  const taskName = selectedTaskDetails?.name || "Task Details";

  return (
    <ModalTw
      show={showModal}
      onClose={onClose}
      title={`Task Assignees - ${taskName}`}
      size="lg"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-6">
        {/* Task Info Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Task Name
              </p>
              <p className="font-semibold dark-title-color">
                {selectedTaskDetails?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Priority
              </p>
              <p className="font-semibold text-blue-600 dark:text-blue-400">
                {selectedTaskDetails?.priority?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Due Date
              </p>
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-gray-500" />
                <p className="font-semibold dark-title-color">
                  {selectedTaskDetails?.dueDate
                    ? helpers.dDate(selectedTaskDetails.dueDate)
                    : "No due date"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignees List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Assignees ({assignees.length})
              </h3>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm">
              Total: {assignees.length}
            </span>
          </div>

          {assignees.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No assignees for this task
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Assign team members to this task
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {assignees.map((assignee, index) => {
                const user = assignee?.assignedOn?.user;
                const profile = user?.profile;

                return (
                  <div
                    key={assignee.id || index}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        {profile?.profilePicture?.fileUrl ? (
                          <img
                            src={profile.profilePicture.fileUrl}
                            alt={user?.fullName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                          />
                        ) : (
                          <Avatar
                            text={helpers.avatarText(user?.fullName)}
                            color="info"
                            size="lg"
                          />
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-700"></div>
                      </div>

                      {/* User Info */}
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {user?.fullName || "Unknown User"}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user?.email || "No email"}
                          </p>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            {assignee.taskRoleId === 1
                              ? "Assignee"
                              : "Reviewer"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Assigned ID: {assignee.assignedOnId}
                      </p>
                      <p className="text-xs text-gray-400">
                        Role ID: {assignee.taskRoleId}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="text-sm text-gray-500">
            <p>
              Last updated:{" "}
              {selectedTaskDetails?.updatedAt
                ? helpers.dDate(selectedTaskDetails.updatedAt)
                : "Never"}
            </p>
          </div>
          <div className="flex gap-2">
            <ButtonTw variant="outline" onClick={onClose}>
              Close
            </ButtonTw>
            {assignees.length > 0 && (
              <ButtonTw
                variant="blue"
                onClick={() => {
                  // Handle assignee management
                  console.log("Manage assignees");
                }}
              >
                Manage Assignees
              </ButtonTw>
            )}
          </div>
        </div>
      </div>
    </ModalTw>
  );
};

export default TaskAssigneeModal;
