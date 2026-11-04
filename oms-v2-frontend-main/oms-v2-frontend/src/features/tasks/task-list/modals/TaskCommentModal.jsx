import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Avatar from "@/components/ui/Avatar";
import helpers from "@/utils/helpers";
import { MessageSquare, Send, Calendar, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTasksQueryApi } from "@/hooks/queryApi/useTasksQueryApi";

const TaskCommentModal = ({
  showModal,
  onClose,
  selectedTaskDetails,
  setShowTaskComments,
}) => {
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const taskName = selectedTaskDetails?.name || "Task Comments";
  const taskId = selectedTaskDetails?.id;

  const { useTaskcommentQuery, addOrUpdateTaskCommentFileMutation } =
    useTasksQueryApi({
      setShowModal: setShowTaskComments,
    });

  // Data fetching
  const {
    data: responseData,
    //isLoading: isFetching,
    //refetch,
  } = useTaskcommentQuery(taskId);

  //console.log("comment data in-dividual task: ", responseData?.data);

  const comments = responseData?.data || [];

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    const payload = {
      comment: newComment,
      taskId: selectedTaskDetails?.id,
    };
    await addOrUpdateTaskCommentFileMutation.mutateAsync(payload);
    setNewComment("");
  };

  // const handleEditComment = (comment) => {
  //   setEditingCommentId(comment.id);
  //   setEditCommentText(comment.comment);
  // };

  const handleUpdateComment = () => {
    if (editCommentText.trim()) {
      console.log("Updating comment:", editingCommentId, editCommentText);
      // Add your API call here
      setEditingCommentId(null);
      setEditCommentText("");
    }
  };

  // const handleDeleteComment = (commentId) => {
  //   console.log("Deleting comment:", commentId);
  //   // Add your API call here
  // };

  return (
    <ModalTw
      show={showModal}
      onClose={onClose}
      title={`Task Comments - ${taskName}`}
      size="lg"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-6">
        {/* Task Info Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Task Name
              </p>
              <p className="font-semibold dark-title-color truncate">
                {selectedTaskDetails?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Comments
              </p>
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-500" />
                <p className="font-semibold text-blue-600 dark:text-blue-400">
                  {comments.length} comment{comments.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Comment */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Add New Comment
          </h3>
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your comment here..."
              rows={3}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
            <ButtonTw
              variant="blue"
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="self-end gap-2"
            >
              <Send size={16} />
              Post
            </ButtonTw>
          </div>
        </div>

        {/* Comments List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Comments ({comments.length})
              </h3>
            </div>
          </div>

          {comments.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No comments yet
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Be the first to comment on this task
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comments.map((comment) => {
                const creator = comment?.creator;
                const profile = creator?.profile;

                return (
                  <div
                    key={comment.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
                  >
                    {/* Comment Header */}
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Creator Avatar */}
                          <div>
                            {profile?.profilePicture?.fileUrl ? (
                              <img
                                src={profile.profilePicture.fileUrl}
                                alt={creator?.fullName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <Avatar
                                text={helpers.avatarText(creator?.fullName)}
                                color="info"
                                size="sm"
                              />
                            )}
                          </div>

                          {/* Creator Info */}
                          <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                              {creator?.fullName || "Unknown"}
                            </p>
                            <div className="flex items-center gap-2">
                              <Calendar size={12} className="text-gray-400" />
                              <p className="text-xs text-gray-500">
                                {comment.createdAt
                                  ? helpers.dDate(comment.createdAt)
                                  : "Unknown date"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {/* <div className="flex gap-2">
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div> */}
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className="p-4">
                      {editingCommentId === comment.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white resize-none"
                          />
                          <div className="flex gap-2 justify-end">
                            <ButtonTw
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditCommentText("");
                              }}
                            >
                              Cancel
                            </ButtonTw>
                            <ButtonTw
                              variant="blue"
                              size="sm"
                              onClick={handleUpdateComment}
                            >
                              Update
                            </ButtonTw>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                      )}
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
              Showing {comments.length} comment
              {comments.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <ButtonTw variant="outline" onClick={onClose}>
              Close
            </ButtonTw>
          </div>
        </div>
      </div>
    </ModalTw>
  );
};

export default TaskCommentModal;
