"use client";

import { ModalTw } from "@/components/common/ModalTw";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import helpers from "@/utils/helpers";
import {
  Calendar,
  Clock,
  FileText,
  Tag,
  User,
  Users,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Circle,
  Layers,
  ArrowUpRight,
  Link,
} from "lucide-react";

const DashboardTaskDetailsModal = ({ showModal, handleClose, taskData }) => {
  if (!taskData) return null;

  // Get priority badge class
  const getPriorityBadgeClass = (priority) => {
    const colorMap = {
      critical: "danger",
      high: "warning",
      medium: "info",
      low: "warning",
      normal: "success",
    };

    const colorName = priority?.colorName?.toLowerCase() || "secondary";
    const mappedColor = colorMap[colorName] || colorName;

    return `badge badge-pill badge-outline-${mappedColor}`;
  };

  // Get status badge class
  const getStatusBadgeClass = (taskStatus) => {
    const colorMap = {
      success: "success",
      warning: "warning",
      danger: "danger",
      info: "info",
      secondary: "secondary",
    };

    const colorName = taskStatus?.colorName?.toLowerCase() || "secondary";
    const mappedColor = colorMap[colorName] || colorName;

    return `badge badge-pill badge-outline-${mappedColor}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return helpers.dDate(dateString);
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return `${formatDate(dateString)} at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title="Task Details"
      size="3xl"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto ">
        {/* Task Header */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {taskData.name}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ID: #{taskData.id}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Serial: {taskData.serial}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {taskData.priority && (
                <span className={getPriorityBadgeClass(taskData.priority)}>
                  {taskData.priority.name}
                </span>
              )}
              {taskData.taskStatus && (
                <span className={getStatusBadgeClass(taskData.taskStatus)}>
                  {taskData.taskStatus.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {taskData.description && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-500" />
                Description
              </CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-line">
                {taskData.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Timeline Section */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-purple-500" />
              Timeline
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created
                  </label>
                  <p className="text-foreground font-medium">
                    {formatDateTime(taskData.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Due Date
                  </label>
                  <p className="text-foreground font-medium">
                    {formatDate(taskData.dueDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Completed
                  </label>
                  <p className="text-foreground font-medium">
                    {taskData.completedAt
                      ? formatDateTime(taskData.completedAt)
                      : "Not Completed"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <p className="text-foreground font-medium">
                    {formatDateTime(taskData.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Hierarchy */}
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="h-5 w-5 text-teal-500" />
              Task Hierarchy
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: taskData.card?.color || "#3b82f6" }}
                />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Task Card
                  </label>
                  <p className="text-foreground font-medium">
                    {taskData.card?.name || "No Card"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Parent Task
                  </label>
                  <p className="text-foreground font-medium">
                    {taskData.parentTask?.name || "No Parent Task"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignees Section */}
        {taskData.assignees && taskData.assignees.length > 0 && (
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-indigo-500" />
                Assignees ({taskData.assignees.length})
              </CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taskData.assignees.map((assignee, index) => (
                  <div
                    key={assignee.id || index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    {assignee.assignedOn?.user?.profile?.profilePicture ? (
                      <img
                        src={`http://oms.studypress.org/api/static/tmp_aws_media/${assignee.assignedOn.user.profile.profilePicture.filename}`}
                        alt={assignee.assignedOn.user.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {assignee.assignedOn?.user?.fullName || "Unknown User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {assignee.assignedOn?.user?.email || "No email"}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Role ID: {assignee.taskRoleId || "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tags Section */}
        {taskData.tags && taskData.tags.length > 0 && (
          <Card className="border-l-4 border-l-pink-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-5 w-5 text-pink-500" />
                Tags ({taskData.tags.length})
              </CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {taskData.tags.map((tag, index) => (
                  <span
                    key={tag.id || index}
                    className="px-3 py-1 bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 rounded-full text-sm"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments Section */}
        {taskData.comments && taskData.comments.length > 0 && (
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-amber-500" />
                Comments ({taskData.comments.length})
              </CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taskData.comments.map((comment, index) => (
                  <div
                    key={comment.id || index}
                    className="border-l-4 border-l-amber-300 pl-4 py-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {comment.creator?.profile?.profilePicture ? (
                        <img
                          src={`http://oms.studypress.org/api/static/tmp_aws_media/${comment.creator.profile.profilePicture.filename}`}
                          alt={comment.creator.fullName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-foreground font-medium">
                        {comment.creator?.fullName || "Unknown User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-foreground whitespace-pre-line">
                      {comment.comment}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button variant="default">Edit Task</Button>
        </div>
      </div>
    </ModalTw>
  );
};

export default DashboardTaskDetailsModal;
