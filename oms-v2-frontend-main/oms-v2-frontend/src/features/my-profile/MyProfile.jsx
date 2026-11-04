"use client";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import ProfileLeftSide from "./ProfileLeftSide";
import ProfileRightSide from "./ProfileRightSide";
import { useEffect, useState } from "react";
import { getAuthUserInfo } from "@/utils/commonApiFunction";
import { useRouter, usePathname } from "next/navigation";
import { useMyProfileQueryApi } from "@/hooks/queryApi/useMyProfileQueryApi";
import { useAuthStore } from "@/store/useAuthStore";

export default function MyProfile() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setAuth, clearAuth, setPermissions } = useAuthStore();
  const isAdminProfile =
    user?.appUseCase === "Admin" || pathname?.startsWith("/admin/my-profile");

  const [loading, setLoading] = useState(false);
  const [calledLoginApi, setCalledLoginApi] = useState(false);

  // const fetchData = async (setLoading, router) => {
  //     await getAuthUserInfo(setLoading, null, router);
  //     setCalledLoginApi(true);
  // };

  // useEffect(() => {
  //   if (!calledLoginApi) {
  //     fetchData(setLoading, router);
  //   }
  // }, [router]);

  const { useFetchAuthUserInfoQuery } =
    useMyProfileQueryApi();

  const { data: authUserInfoResponse } = useFetchAuthUserInfoQuery();

  useEffect(() => {
    if (authUserInfoResponse?.data) {
      // getAuthUserInfo(setLoading, null, router);
      console.log("Auth user info from MyProfile component:", authUserInfoResponse);

      const {
          accessToken,
          refreshToken,
          tokenType,
          sessionId,
          user,
          permissions,
      } = authUserInfoResponse?.data || {};

        // ✅ localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("sessionId", sessionId);

        // ✅ Zustand
        setAuth({ accessToken, tokenType, user, callLoginApi: true });
        setPermissions(permissions);
    }
  }, [authUserInfoResponse, router]);


  const { useFetchEmployeeProfileDashboardDataWithoutIdQuery } =
    useHrQueryApi();

  const { data: responseData } =
    useFetchEmployeeProfileDashboardDataWithoutIdQuery(!isAdminProfile);

  return (
    <div className="">
      <div className="flex flex-col gap-6 py-6 lg:flex-row min-h-screen">
        {/* Left Sidebar - Sticky */}
        <div className="w-full lg:w-80 xl:w-96 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto leftside-scrollbar">
          <ProfileLeftSide employeeData={responseData?.data} />
        </div>
        {/* Main Content - Scrollable */}
        <main className="flex-1 w-full min-w-0 dark:bg-theme-dark bg-theme-light lg:overflow-y-auto lg:h-screen sidebar-scroll rounded-md p-4">
          <ProfileRightSide />
        </main>
      </div>
    </div>
  );
}
