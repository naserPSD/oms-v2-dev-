// path: src/services/tasksServiceApi.js
import RestApi, { offlineHandler } from "@/utils/RestApi";

// ====================  Task Dropdown Fetch Api List Start ====================

export const fetchParentTaskListDropDown = async () => {
  const { data } = await RestApi.get(`/api/v1/task/get-all-parent-task-list`);
  return data.data;
};
export const fetchAllCardTaskListDropDown = async () => {
  const { data } = await RestApi.get(`/api/v1/task/get-all-card-list`);
  return data.data;
};

// ====================  Task Dropdown Fetch Api List End ====================

export const fetchDashboardPendingTaskList = async () => {
  const { data } = await RestApi.get(`/api/v1/task/get-pending-task-list`);
  return data;
};
export const fetchSingleTaskById = async (id) => {
  const { data } = await RestApi.get(`/api/v1/task/get-task/${id}`);
  return data;
};
export const fetchWorkspaceListSidebar = async () => {
  const { data } = await RestApi.get(`/api/v1/task/get-workspace-list`);
  return data;
};
export const fetchWorkSpaceById = async (id) => {
  const { data } = await RestApi.get(`/api/v1/task/workspaces/${id}`);
  return data;
};
export const fetchBoardListByWorkspaceId = async (id) => {
  const { data } = await RestApi.get(
    `/api/v1/task/get-board-list-by-workspace-id/${id}`,
  );
  return data;
};

export const fetchCardListByWorkspaceId = async (id) => {
  const { data } = await RestApi.get(
    `/api/v1/task/get-task-cards-by-workspace-id/${id}`,
  );
  return data;
};

export const fetchCardListByBoardId = async (id) => {
  const { data } = await RestApi.get(
    `/api/v1/task/get-card-list-by-board-id/${id}`,
  );
  return data;
};

export const fetchTaskListByCardId = async (id) => {
  const { data } = await RestApi.get(
    `/api/v1/task/get-task-list-by-card-id/${id}`,
  );
  return data;
};
// ====================  All task list ====================

export const fetchAllTask = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    return await RestApi.get(`/api/v1/task/get-all-tasks?${queryParams}`);
  });
};

export const addOrUpdateTask = async (payload, queryKey) => {
  console.log("Mutation function called", payload);
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/task/add-or-update-task`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};

export const updateTaskCardSerial = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/task/update-task-cards-serial`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};

export const deleteTask = async (id, queryKey) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(`/api/v1/task/delete-task/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

export const toggleTaskStatus = async (id, queryKey) => {
  return offlineHandler.patch(async () =>
    RestApi.patch(`/api/v1/task/task-change-status/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

// ====================  All task  list End ====================

// ====================   task Card ====================

export const fetchTaskCards = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "serial:asc",
      fields,
    }).toString();

    return await RestApi.get(`/api/v1/task/get-all-task-cards?${queryParams}`);
  });
};

export const addOrUpdateTaskCard = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/task/add-or-update-task-card`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};

export const deleteTaskCard = async (id, queryKey) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(`/api/v1/task/delete-task-card/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

export const toggleTaskCardStatus = async (id, queryKey) => {
  return offlineHandler.patch(async () =>
    RestApi.patch(`/api/v1/task/change-task-card-status/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

export const updateTaskStatus = async (payload, queryKey) => {
  //console.log("payload=======>", payload);
  return offlineHandler.patch(async () =>
    RestApi.patch(`/api/v1/task/update-task-status`, payload, {
      offlineMetadata: { queryKey },
    }),
  );
};
// ====================   task Card End ====================

// ====================  All task  list End ====================
// ====================  Add or Update worksopce ====================
export const workSpace = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/task/add-or-update-workspace`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};
// ====================  Add or Update worksopce ====================

export const taskCommentFiles = async (id) => {

  if (!id) return null;
  const { data } = await RestApi.get(`/api/v1/task/get-task-comments/${id}`);
  return data;
};

export const addOrUpdateTaskCommentFile = (payload) =>
  RestApi.post(`/api/v1/task/add-or-update-task-comment`, payload).then(
    (res) => res.data,
  );
