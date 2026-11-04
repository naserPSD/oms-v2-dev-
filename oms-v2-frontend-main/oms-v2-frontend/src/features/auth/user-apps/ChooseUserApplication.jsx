"use client";
import { FormController as Controller } from "@/components/common/FormController";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";
import MiniSpinner from "@/shared/loader/MiniSpinner";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { z } from 'zod';
import { zodResolver } from '@/utils/zodResolver';
import Input from "@/components/ui/Input";
import RestApi, { baseURL } from "@/utils/RestApi";
import helpers, { toaster, socialPopupLogin } from "@/utils/helpers";
import Loading from "@/components/common/Loading";
import { useAuthStore } from "@/store/useAuthStore";
import { getAuthUserInfo, getCommonDropdownList } from "@/utils/commonApiFunction";
import { useTranslation } from 'next-i18next'
import SocialLoginSection from "@/components/common/SocialLoginSection";
import { useCommonStore } from "@/store/useCommonStore";
import Cookies from 'js-cookie';
import RadioGroup from '@/components/ui/RadioGroup';
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { isPureAdminUser } from "@/utils/authRedirect";

const ChooseUserApplication = () => {
  const searchParams = useSearchParams();
  const invitationCode = searchParams.get("invitationCode") || "";
  const router = useRouter();

  const authUser = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!authUser?.appUseCase) {
      router.push("/main-dashboard");
      return;
    }
  }, []);

  const initialSetupTypeList = useCommonStore((state) => state.initialSetupTypeList);

  console.log('initialSetupTypeList', initialSetupTypeList)

  const applicationDropdowns = authUser?.appUsers?.map((appUser) => {
    return {
      value: appUser?.application?.id,
      label: appUser?.application?.name,
    }
  }) || [];

  console.log('applicationDropdowns', applicationDropdowns)
  console.log('initialSetupTypeList', initialSetupTypeList)

  // ✅ Zod schema for validation
  const schema = z.object({
    activeAppId: z.coerce.number().min(1, 'Please select an application'),
  });

  const {
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { activeAppId: "" },
  });

  const [isLoading, setLoading] = useState(false);

  const { useResetTanstackCache } = useCommonQueryApi({});

  const submitForm = async (values) => {
    // console.log('values', values)
    setLoading(true);
    try {
      const { data } = await RestApi.post("/auth/set-active-app-user", values);

      // console.log('data', data)

      const { user } = data.data;
      await getAuthUserInfo(setLoading)

      toaster('You are entering into the system', 'success');

      useResetTanstackCache();

      if (invitationCode) {
        router.push(`/hr-dashboard/my-invitation-requests?invitationCode=${invitationCode}`);
        return;
      }
      // reset();
      if (user && !user.emailVerifiedAt) {
        router.push("/email-verification");
      } else if (isPureAdminUser(user)) {
        router.replace("/admin");
      } else {
        router.push("/main-dashboard");
      }
    } catch (error) {
      helpers.handleApiValidationError(error, setError);
    } finally {
      setLoading(false);
    }
  }

  return (
    // <div className=" min-h-[92vh] flex items-center justify-center">
    <div className=" flex items-center justify-center">
      <div className="flex items-center justify-center">
        <div className="max-w-[1066px] w-full mx-auto flex flex-col lg:flex-row  overflow-hidden ">
          {/* Left: login Image Section */}
          <div className="hidden lg:flex lg:w-1/2 w-full items-center justify-center bg-background-light dark:bg-theme-dark p-4">
            <Image
              src="/assets/images/auth/group.png"
              alt="Login"
              width={500}
              height={500}
              className="mx-auto"
            />
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-[1px] bg-gray-400 md:mx-6"></div>

          {/* Right: Form Section */}

          <div className="lg:w-1/2 w-full flex items-center justify-center p-6">

            <div className="w-full max-w-[450px]">
              {/* <h2 className="text-gray-900 dark:text-gray-300 font-bold text-xl mb-1">
                Please Select Your Application
              </h2> */}
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Before entering the system, please select the application you wish to access.
              </p>

              <form className="space-y-5" onSubmit={handleSubmit(submitForm)}>

                <Controller
                  control={control}
                  name="activeAppId"
                  render={({ field, fieldState }) => (
                    <RadioGroup
                      label="Select Your Application"
                      options={applicationDropdowns}
                      // options={initialSetupTypeList}
                      selectedValue={field.value}
                      color="success"
                      activeColor={true}
                      direction="horizontal"
                      variant="card"
                      size='sm'
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                {/* Sign In Button */}
                {isSubmitting || isLoading ? (
                  <div
                    type="submit"
                    className="bg-primaryColor hover:bg-primaryColor-700 text-white py-2 w-full font-bold rounded-sm text-center flex items-center justify-center cursor-not-allowed"
                  >
                    <MiniSpinner />

                  </div>
                ) : (
                  <button
                    type="submit"
                    className="bg-primaryColor hover:bg-primaryColor-700 text-white py-2 w-full font-bold rounded-sm cursor-pointer"
                  >
                    Enter Sanzio
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseUserApplication;
