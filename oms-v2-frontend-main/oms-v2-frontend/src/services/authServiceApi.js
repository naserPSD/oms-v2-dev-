// services/authServiceApi.js
import RestApi from "@/utils/RestApi";

export const resetFirstPassword = async (payload) => {
  console.log('payload==', payload);
  return RestApi.post(
    `/api/v1/auth/reset-first-password`,
    payload,
  ).then((res) => res.data);
};