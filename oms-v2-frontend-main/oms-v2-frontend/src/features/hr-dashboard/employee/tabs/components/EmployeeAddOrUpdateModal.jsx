import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BiPlus } from "react-icons/bi";
import { FormController as Controller } from "@/components/common/FormController";
import "suneditor/dist/css/suneditor.min.css";
import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { useCommonStore } from "@/store/useCommonStore";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import { fetchGeneratedEmployeeCode } from "@/services/hrServiceApi";
import { Sparkles } from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import SwitchButton from "@/components/ui/SwitchButton";
import { Textarea } from "@/components/ui/textarea";
import helpers, { toaster } from "@/utils/helpers";
import { checkCompanyEmailApi } from "@/services/companySettingsApi";
import { z } from "zod";

const EmployeeAddOrUpdateModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
  getValues,
  setValue,
  setError,
  clearErrors,
}) => {
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const {
    useOfficeListQuery,
    useDesignationListQuery,
    useDepartmentListQuery,
  } = useCommonQueryApi({
    reset,
  });

  const { useCompanyAssignableRolesQuery } = useCompanySettingsQueryApi({});
  const { data: roleList = [], refetch: refetchRoleList } =
    useCompanyAssignableRolesQuery();

  const { data: officeList = [] } = useOfficeListQuery();
  const { data: designationList = [], refetch: refetchDesignationList } =
    useDesignationListQuery();
  const { data: departmentList = [], refetch: refetchDepartmentList } =
    useDepartmentListQuery();

  const selectedDepartmentId = watch("departmentId");
  const resetFirstPassword = watch("resetFirstPassword");

  useEffect(() => {
    if (!resetFirstPassword) {
      setValue("roleId", null);
    }
  }, [resetFirstPassword, setValue]);

  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const handleGenerateEmployeeCode = async () => {
    try {
      setIsGeneratingCode(true);
      const code = await fetchGeneratedEmployeeCode();
      if (code) {
        setValue("employeeCode", code, { shouldValidate: true, shouldDirty: true });
        toaster("Generated unique employee code successfully", "success");
      }
    } catch (error) {
      console.error("Failed to generate employee code", error);
      toaster(
        error?.response?.data?.message || "Failed to generate employee code",
        "error",
      );
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const filteredDesignationList = useMemo(() => {
    if (!selectedDepartmentId) return designationList;
    return designationList.filter(
      (item) => item.departmentId === selectedDepartmentId,
    );
  }, [selectedDepartmentId, designationList]);

  const selectedOfficeId = watch("officeId");
  const selectedOffice = useMemo(() => {
    return officeList?.find((o) => o.value === selectedOfficeId);
  }, [selectedOfficeId, officeList]);

  const officeShiftOptions = useMemo(() => {
    if (selectedOffice?.officeShifts?.length > 0) {
      return selectedOffice.officeShifts.map((shift) => ({
        value: shift.id,
        label: `${shift.name} (${helpers.stringTimeToLocalTime(shift.startTime)} - ${helpers.stringTimeToLocalTime(shift.endTime)})`,
      }));
    }
    return [];
  }, [selectedOffice]);

  const countryList = dropdowns.countryList?.map((each) => {
    return { value: each.id, label: each.name };
  });

  const religionList =
    dropdowns.statusGroupList?.find((s) => s.code === "religions")?.statuses ??
    [];

  const maritalStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "marital_statuses")
      ?.statuses ?? [];

  const watchedEmail = watch("email");
  const currentEmployeeId = watch("id");
  const currentUserId = watch("userId");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(watchedEmail || "");
    }, 350);
    return () => clearTimeout(timer);
  }, [watchedEmail]);

  useEffect(() => {
    if (!showModal) return;
    const trimmed = (debouncedEmail || "").trim();
    if (!trimmed) {
      clearErrors?.("email");
      return;
    }

    const isEmailValid = z.string().email().safeParse(trimmed).success;
    if (!isEmailValid) return;

    let isCancelled = false;
    setIsCheckingEmail(true);

    checkCompanyEmailApi(trimmed, {
      userId: currentUserId ? Number(currentUserId) : undefined,
      employeeId: currentEmployeeId ? Number(currentEmployeeId) : undefined,
    })
      .then((res) => {
        if (isCancelled) return;
        if (res?.exists) {
          setError?.("email", {
            type: "manual",
            message: "Email already exists",
          });
        } else {
          clearErrors?.("email");
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("Failed to check company email availability:", err);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsCheckingEmail(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedEmail, currentUserId, currentEmployeeId, showModal, setError, clearErrors]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!getValues("id")) {
        const email = getValues("email");
        const password = getValues("password");

        if (email) setValue("email", "");
        if (password) setValue("password", "");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [getValues, setValue]);

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={watch("id") ? "Edit Employee" : "Add New Employee"}
        size="3xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form
          noValidate
          onSubmit={handleSubmit(submitForm)}
          autoComplete="off"
          className="space-y-4 "
        >
          <div className="grid grid-cols-12 gap-x-4 ">
            <Controller
              control={control}
              name="firstName"
              render={({ field, fieldState }) => (
                <Input
                  label="First Name"
                  placeholder="Enter Name Here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field, fieldState }) => (
                <Input
                  label="Last Name"
                  placeholder="Enter Name Here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Input
                  label="Email"
                  placeholder="Enter Email Here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  autoComplete="new-password"
                />
              )}
            />

            {/* Password field commented out per request
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Input
                  label="Password"
                  placeholder="Enter Password Here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  {...field}
                />
              )}
            />
            */}

            <div className="col-span-12 lg:col-span-6 sm:col-span-12 mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Employee Code{" "}
                  <span className="text-red-500 font-bold select-none leading-none">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateEmployeeCode}
                  disabled={isGeneratingCode}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primaryColor hover:text-white bg-primaryColor/10 hover:bg-primaryColor rounded border border-primaryColor/20 transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-xs"
                  title="Generate unique employee code for this company"
                >
                  <Sparkles size={12} className={isGeneratingCode ? "animate-spin" : ""} />
                  {isGeneratingCode ? "Generating..." : "Generate Code"}
                </button>
              </div>
              <Controller
                control={control}
                name="employeeCode"
                render={({ field, fieldState }) => (
                  <Input
                    placeholder="Enter Employee Code or click Generate..."
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="!mb-0"
                  />
                )}
              />
            </div>

            <Controller
              name="countryId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Select Country"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={countryList || []}
                  placeholder="Select Country Here..."
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              control={control}
              name="gender"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Select Gender"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={dropdowns.genderList || []}
                  placeholder="Select Status Here..."
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <div className="col-span-12 lg:col-span-12 sm:col-span-12 flex flex-row">
              <Controller
                control={control}
                name="phoneCountryId"
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Phone"
                    className="w-1/3 border-r-0 rounded-r-none"
                    options={dropdowns.countryList?.map((c) => ({
                      value: c.id,
                      label: `(+${c.callingCode}) ${c.name}`,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    size="sm"
                    placeholder="Country Code"
                    searchable
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Input
                    className="w-2/3 border-l-0 rounded-l-none mt-3.5 -ml-1"
                    label=""
                    placeholder="Enter Your Phone Number"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    size="sm"
                    {...field}
                  />
                )}
              />
            </div>

            <Controller
              name="maritalStatusId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Select Marital Status"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={maritalStatusList || []}
                  placeholder="Select Status Here..."
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="religionId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Select Religion"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={religionList || []}
                  placeholder="Select Religion Here..."
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            <Controller
              name="officeId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Select Office"
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    setValue("officeShiftId", null);
                  }}
                  error={fieldState.error?.message}
                  options={officeList || []}
                  placeholder="Select Office Here..."
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                />
              )}
            />

            {/* Shift (Conditional) */}
            {officeShiftOptions.length > 0 && (
              <Controller
                name="officeShiftId"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Select Shift"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    options={officeShiftOptions}
                    placeholder="Select Shift Here..."
                    className="col-span-12 lg:col-span-6 sm:col-span-12"
                  />
                )}
              />
            )}

            <div className="col-span-12 lg:col-span-6 sm:col-span-12 mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Select Department
                </label>
                <Link
                  href="/hr-dashboard/departments"
                  onClick={() => refetchDepartmentList?.()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primaryColor hover:text-white bg-primaryColor/10 hover:bg-primaryColor rounded border border-primaryColor/20 transition-all duration-200 cursor-pointer shadow-xs"
                  title="Add or view departments"
                >
                  <BiPlus size={12} />
                  <span>Add/View</span>
                </Link>
              </div>
              <Controller
                name="departmentId"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label=""
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      if (val) {
                        const currentDesig = designationList.find(
                          (d) => d.value === getValues("designationId"),
                        );
                        if (
                          currentDesig &&
                          currentDesig.departmentId !== val
                        ) {
                          setValue("designationId", null);
                        }
                      }
                    }}
                    error={fieldState.error?.message}
                    options={departmentList || []}
                    placeholder="Select Department Here..."
                    className="!mb-0"
                    emptyAction={{
                      label: "+ Add Department",
                      href: "/hr-dashboard/departments",
                      onClick: () => refetchDepartmentList?.(),
                    }}
                  />
                )}
              />
            </div>

            <div className="col-span-12 lg:col-span-6 sm:col-span-12 mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Select Designation{" "}
                  <span className="text-red-500 font-bold leading-none select-none">*</span>
                </label>
                <Link
                  href="/hr-dashboard/designations"
                  onClick={() => refetchDesignationList?.()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primaryColor hover:text-white bg-primaryColor/10 hover:bg-primaryColor rounded border border-primaryColor/20 transition-all duration-200 cursor-pointer shadow-xs"
                  title="Add or view designations"
                >
                  <BiPlus size={12} />
                  <span>Add/View</span>
                </Link>
              </div>
              <Controller
                name="designationId"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label=""
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      if (val) {
                        const selectedDesig = designationList.find(
                          (d) => d.value === val,
                        );
                        if (
                          selectedDesig?.departmentId &&
                          !getValues("departmentId")
                        ) {
                          setValue(
                            "departmentId",
                            selectedDesig.departmentId,
                          );
                        }
                      }
                    }}
                    error={fieldState.error?.message}
                    options={filteredDesignationList || []}
                    placeholder="Select Designation Here..."
                    className="!mb-0"
                    emptyAction={{
                      label: "+ Add Designation",
                      href: "/hr-dashboard/designations",
                      onClick: () => refetchDesignationList?.(),
                    }}
                  />
                )}
              />
            </div>

            <Controller
              control={control}
              name="joiningDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Enter Joining Date"
                  placeholder="Enter Date Here..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-12 lg:col-span-6 sm:col-span-12"
                  {...field}
                />
              )}
            />

            <Controller
              name="resetFirstPassword"
              control={control}
              render={({ field }) => (
                <div className="col-span-12 lg:col-span-6 sm:col-span-12 mb-5">
                  <SwitchButton
                    label="Invite to Become a User"
                    enabled={field.value}
                    onChange={(val) => field.onChange(val)}
                    enabledText="Yes"
                    disabledText="No"
                    size="sm"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    An invitation email will be sent to the employee to set their password and complete registration to access the system.
                  </p>
                </div>
              )}
            />

            {resetFirstPassword && (
              <div className="col-span-12 lg:col-span-6 sm:col-span-12 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Company Role{" "}
                    <span className="text-red-500 font-bold leading-none select-none">*</span>
                  </label>
                  <Link
                    href="/settings/company-user-roles"
                    onClick={() => refetchRoleList?.()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primaryColor hover:text-white bg-primaryColor/10 hover:bg-primaryColor rounded border border-primaryColor/20 transition-all duration-200 cursor-pointer shadow-xs"
                    title="Add or view company user roles"
                  >
                    <BiPlus size={12} />
                    <span>Add/View</span>
                  </Link>
                </div>
                <Controller
                  control={control}
                  name="roleId"
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label=""
                      placeholder="Select Company Role"
                      options={roleList}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      size="sm"
                      className="!mb-0"
                      searchable
                      required
                      emptyAction={{
                        label: "+ Add / View Company Roles",
                        href: "/settings/company-user-roles",
                        onClick: () => refetchRoleList?.(),
                      }}
                    />
                  )}
                />
              </div>
            )}

            <Controller
              name="remarks"
              control={control}
              render={({ field, fieldState }) => (
                <div className="col-span-12 lg:col-span-12 sm:col-span-12">
                  <label
                    className={`block mb-2 text-sm font-medium text-gray-900 dark:text-white`}
                  >
                    <span className={`text-sm`}>Remarks</span>
                  </label>
                  <Textarea
                    label="Remarks"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter Remarks"
                    className={`col-span-12 lg:col-span-12 sm:col-span-12 ${fieldState.error ? "border-red-500 focus-visible:border-red-500" : ""}`}
                  />
                  {fieldState.error?.message && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            <div className="col-span-12 flex justify-center items-center gap-4 mt-4">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold col-span-12"
                disabled={isLoading}
                loading={isLoading}
              >
                Submit
              </ButtonTw>

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold col-span-12"
                onClick={() => reset()}
              >
                Reset
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default EmployeeAddOrUpdateModal;
