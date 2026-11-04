"use client";

// src/hooks/queryApi/useSupportQueryApi.js
import { useQuery } from "@tanstack/react-query";
import RestApi from "@/utils/RestApi";

export const useSupportQueryApi = () => {
    const getSupportData = () =>
        useQuery({
            queryKey: ["support-data"],
            queryFn: async () => {
                const { data } = await RestApi.get("/api/v1/users/support/get-support-data");
                return data.data;
            },
        });

    return { getSupportData };
};