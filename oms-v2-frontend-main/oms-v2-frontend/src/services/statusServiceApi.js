import RestApi from "@/utils/RestApi";

const buildListQuery = (params = {}) => {
  const { page = 1, limit = 10, sort, fields, params: filterJson, ...rest } =
    params;
  const query = {
    page: String(page),
    limit: String(limit),
  };
  if (sort) {
    query.sort = sort;
  }
  if (fields) {
    query.fields = fields;
  }
  if (filterJson) {
    query.params =
      typeof filterJson === "string" ? filterJson : JSON.stringify(filterJson);
  } else if (Object.keys(rest).length > 0) {
    query.params = JSON.stringify(rest);
  }
  return query;
};

export const fetchStatusGroups = async (params = {}) => {
  const { data } = await RestApi.get("/status-group", {
    params: buildListQuery(params),
  });
  return data;
};

export const createStatusGroup = (body) =>
  RestApi.post("/status-group", body).then((res) => res.data);

export const updateStatusGroup = (id, body) =>
  RestApi.patch(`/status-group/${id}`, body).then((res) => res.data);

export const deleteStatusGroup = (id) =>
  RestApi.delete(`/status-group/${id}`).then((res) => res.data);

export const fetchStatuses = async (params = {}) => {
  const { data } = await RestApi.get("/status", {
    params: buildListQuery(params),
  });
  return data;
};

export const createStatus = (body) =>
  RestApi.post("/status", body).then((res) => res.data);

export const updateStatus = (id, body) =>
  RestApi.patch(`/status/${id}`, body).then((res) => res.data);

export const deleteStatus = (id) =>
  RestApi.delete(`/status/${id}`).then((res) => res.data);
