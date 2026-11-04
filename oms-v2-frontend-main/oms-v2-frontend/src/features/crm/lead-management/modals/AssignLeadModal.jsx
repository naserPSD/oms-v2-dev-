import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import React, { useState, useMemo } from "react";
import { Search, User, Check } from "lucide-react";

const AssignLeadModal = ({
  showModal,
  handleClose,
  lead,
  users = [],
  onAssign,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  // Update selectedUserId when lead changes or modal opens
  React.useEffect(() => {
    if (showModal && lead) {
      if (lead.assignedTo) {
        const assignedToId = lead.assignedTo?.toString() || String(lead.assignedTo);
        setSelectedUserId(assignedToId);
      } else {
        setSelectedUserId("");
      }
    }
    // Reset search when modal closes
    if (!showModal) {
      setSearchTerm("");
    }
  }, [lead, showModal]);

  // Filter users/employees based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter((item) => {
      // Handle employee structure (has user object)
      if (item.user) {
        const fullName = item.user?.fullName || "";
        const email = item.user?.email || "";
        return (
          fullName.toLowerCase().includes(term) ||
          email.toLowerCase().includes(term)
        );
      }
      // Handle user structure (direct firstName/lastName)
      return (
        item.firstName?.toLowerCase().includes(term) ||
        item.lastName?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        `${item.firstName || ""} ${item.lastName || ""}`
          .toLowerCase()
          .includes(term)
      );
    });
  }, [users, searchTerm]);

  const handleAssign = () => {
    if (selectedUserId) {
      onAssign(lead?._id || lead?.id, selectedUserId);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId === selectedUserId ? "" : userId);
  };

  const getInitials = (item) => {
    // Handle employee structure (has user object)
    if (item.user) {
      const fullName = item.user?.fullName || "";
      if (!fullName) return "?";
      const parts = fullName.trim().split(" ");
      if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
      return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
    }
    // Handle user structure (direct firstName/lastName)
    const firstName = item?.firstName || "";
    const lastName = item?.lastName || "";
    if (!firstName && !lastName) return "?";
    if (!lastName) return firstName[0]?.toUpperCase() || "?";
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  const getFullName = (item) => {
    // Handle employee structure (has user object)
    if (item.user) {
      return item.user?.fullName || "Unknown User";
    }
    // Handle user structure (direct firstName/lastName)
    return `${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "Unknown User";
  };

  const getEmail = (item) => {
    return item.user?.email || item?.email || "";
  };

  const getPosition = (item) => {
    return item.designation?.name || item?.position || "";
  };

  const getUserId = (item) => {
    // For employees, use user.id or user.userId - prioritize user.id
    if (item.user) {
      const userId = item.user.id?.toString() || item.user.userId?.toString() || item.user.id || item.user.userId;
      return userId ? String(userId) : item.id?.toString();
    }
    // For direct users
    return item.id?.toString() || item._id?.toString() || String(item.id || item._id || "");
  };

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title="Assign Lead"
      size="md"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-4">
        {/* Lead Info */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">Assigning lead:</p>
          
          {/* Company Name */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Company</p>
            <p className="font-semibold text-base dark-title-color">
              {lead?.name || "N/A"}
            </p>
          </div>

          {/* Key Contact Person */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Key Contact</p>
            <p className="font-medium text-sm dark-title-color">
              {lead?.contactName || "N/A"}
            </p>
          </div>

          {/* Email */}
          {lead?.contactEmail && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Email</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {lead?.contactEmail}
              </p>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="pl-10"
          />
        </div>

        {/* Users List */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No employees found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((item) => {
                const userId = getUserId(item);
                // Compare both as strings to ensure match
                const isSelected = selectedUserId && userId && (
                  selectedUserId.toString() === userId.toString() ||
                  String(selectedUserId) === String(userId)
                );
                return (
                  <div
                    key={item.id || item._id || userId}
                    onClick={() => handleUserSelect(userId)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.user?.profile?.profilePicture?.fileUrl ? (
                        <img
                          src={item.user.profile.profilePicture.fileUrl}
                          alt={getFullName(item)}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(item)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium dark-title-color">{getFullName(item)}</p>
                        {getEmail(item) && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{getEmail(item)}</p>
                        )}
                        {getPosition(item) && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{getPosition(item)}</p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <ButtonTw
            variant="outline.gray"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </ButtonTw>
          <ButtonTw
            variant="blue"
            onClick={handleAssign}
            disabled={!selectedUserId || isLoading}
            loading={isLoading}
          >
            Assign Lead
          </ButtonTw>
        </div>
      </div>
    </ModalTw>
  );
};

export default AssignLeadModal;

