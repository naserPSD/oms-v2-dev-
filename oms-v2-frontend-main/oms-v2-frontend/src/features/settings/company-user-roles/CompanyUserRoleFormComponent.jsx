"use client";

import { FormController as Controller } from "@/components/common/FormController";
import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";
import { parseISO } from "date-fns";
import { effect, z } from "zod";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import helpers, { toaster } from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import ButtonTw from "@/components/ui/ButtonTw";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import { Button } from "@/components/ui/button";
import CheckboxGroup from "@/components/ui/CheckboxGroup";
import Checkbox from "@/components/ui/Checkbox";
import { AlertTriangle } from "lucide-react";
import { FaUserCheck } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { useDebounce } from "@/utils/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

const CompanyUserRoleFormComponent = () => {
  const t = useTranslation();
  const { hasPermission } = useCommonFunctions();
  const params = useParams();
  const id = params.id;

  const router = useRouter();
  const searchParams = useSearchParams();

  const canEdit = hasPermission("settings.company_user_roles_edit");
  const canAdd = hasPermission("settings.company_user_roles_add");
  const isDisabled = !!id ? !canEdit : !canAdd;

  // Zod schema for company role (no isSystem)
  const schema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, "Role name is required"),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
    permissionIds: z
      .array(z.coerce.number())
      .min(1, "At least one permission is required"),
  });

  const initialValues = {
    id: 0,
    name: "",
    description: "",
    isActive: true,
    permissionIds: [],
  };

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const {
    useCompanyAssignablePermissionsQuery,
    useCompanyRoleByIdQuery,
    addOrUpdateCompanyRoleMutation,
  } = useCompanySettingsQueryApi({ reset, setError });

  const { data: roleData, isLoading: isFetching } = useCompanyRoleByIdQuery(id, {
    enabled: !!id,
  });

  useEffect(() => {
    if (roleData) {
      setValue("id", roleData.id);
      setValue("name", roleData.name);
      setValue("description", roleData.description || "");
      setValue("isActive", roleData.isActive);
      const permissionIds =
        roleData.permissionIds ||
        roleData.rolePermissions?.map((rp) => rp.permissionId) ||
        [];
      setValue("permissionIds", permissionIds);
    }
  }, [roleData, setValue]);

  const permissionName = watch("permissionName");
  const debouncedPermissionName = useDebounce(permissionName, 500);

  const queryParams = {
    name: debouncedPermissionName || "",
  };

  const { data: allPermissionsData, isLoading: isAllPermissionsLoading } =
    useCompanyAssignablePermissionsQuery(queryParams);

  const [filteredPermissions, setFilteredPermissions] = useState([]);

  useEffect(() => {
    setFilteredPermissions(
      Array.isArray(allPermissionsData) ? allPermissionsData : [],
    );
  }, [permissionName, allPermissionsData]);

  const submitForm = async (values) => {
    if (isDisabled) {
      toaster("You don't have permission to save this role", "error");
      return;
    }
    const result = await addOrUpdateCompanyRoleMutation.mutateAsync({
      ...values,
      isSystem: false,
    });
    if (result) {
      router.push("/settings/company-user-roles");
    }
  };

  const isLoading = addOrUpdateCompanyRoleMutation.isPending || addOrUpdateCompanyRoleMutation.isLoading;

  return (
    <div className="container">
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="flex items-center justify-between my-5">
          <h1 className="title-color font-bold text-lg">
            {id ? "Update" : "Add New"} Company User Role
          </h1>
          {isDisabled && (
            <div className="text-amber-600 bg-amber-50 px-4 py-2 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">View Only Mode - You cannot edit this role</span>
            </div>
          )}
        </div>

        {/* Role information */}
        <Card className="pt-4 mb-4 gap-4">
          <CardContent>
            <div className="grid grid-cols-12 gap-x-4">
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <Input
                    label="Role Name"
                    placeholder="Enter Role Name"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-3 sm:col-span-12"
                    disabled={isDisabled}
                    {...field}
                  />
                )}
              />

              <Controller
                control={control}
                name="description"
                render={({ field, fieldState }) => (
                  <Input
                    label="Role Description"
                    placeholder="Enter Role Description"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-8 sm:col-span-12"
                    disabled={isDisabled}
                    {...field}
                  />
                )}
              />

              <Controller
                control={control}
                name="isActive"
                render={({ field, fieldState }) => (
                  <SwitchButton
                    enabled={field.value}
                    onChange={field.onChange}
                    label="Active"
                    className="col-span-12 lg:col-span-1 sm:col-span-12"
                    error={fieldState.error?.message}
                    enabledText="Yes"
                    disabledText="No"
                    disabled={isDisabled}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <div className="flex items-center justify-between flex-wrap">
          {/* Filter input - NEVER disabled */}
          <Controller
            control={control}
            name="permissionName"
            render={({ field, fieldState }) => (
              <Input
                label="Filter Permissions By Name"
                placeholder="Enter Permission Name"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                size="md"
                className="w-[300px]"
                clearable
                {...field}
              />
            )}
          />

          {/* Select All button - disabled when can't edit */}
          <Controller
            control={control}
            name="permissionIds"
            render={({ field }) => {
              const allIds = [];
              filteredPermissions &&
                filteredPermissions.length > 0 &&
                filteredPermissions.forEach((item) => {
                  allIds.push(item.id);
                  item.childIds &&
                    item.childIds.forEach((childId) => {
                      allIds.push(childId);
                    });
                });

              const isAllSelected =
                allIds.length > 0 &&
                allIds.every((id) => field.value.includes(id));

              const toggleAll = () => {
                if (isDisabled || allIds.length === 0) return;
                if (isAllSelected) {
                  field.onChange(
                    field.value.filter((id) => !allIds.includes(id)),
                  );
                } else {
                  field.onChange([...new Set([...field.value, ...allIds])]);
                }
              };

              return (
                <Checkbox
                  id={`select-all-permissions`}
                  label="Select All Permissions"
                  checked={isAllSelected}
                  onChange={toggleAll}
                  size="lg"
                  color="success"
                  icon={FaCheckCircle}
                  circular
                  disabled={isDisabled || allIds.length === 0}
                />
              );
            }}
          />
        </div>

        {errors.permissionIds && (
          <p className="text-red-500 text-sm mt-2 font-medium">
            {errors.permissionIds.message}
          </p>
        )}

        {isAllPermissionsLoading || isLoading ? (
          <div className="space-y-6 my-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="pt-4 mb-4 gap-4">
                <CardHeader className="border-b !my-0 !pb-2 space-y-2">
                  <Skeleton className="h-6 w-1/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPermissions && filteredPermissions.length > 0 ? (
          filteredPermissions.map((item) => (
            <Card className="pt-4 mb-4 gap-4" key={item.id}>
              <CardHeader className="border-b !my-0 !pb-2 flex justify-between items-center">
                <div className="flex flex-row justify-between items-center">
                  <Controller
                    control={control}
                    name="permissionIds"
                    render={({ field, fieldState }) => {
                      const isChecked = field.value.includes(item.id);
                      const handleChange = () => {
                        if (isDisabled) return;
                        if (isChecked) {
                          field.onChange(
                            field.value.filter((id) => id !== item.id),
                          );
                        } else {
                          field.onChange([...field.value, item.id]);
                        }
                      };

                      return (
                        <Checkbox
                          id={`module-${item.id}`}
                          label={`${item.name} (${item.type.charAt(0).toUpperCase() + item.type.slice(1)})`}
                          labelClassName="font-bold"
                          checked={isChecked}
                          onChange={handleChange}
                          size="md"
                          color="success"
                          icon={FaCheckCircle}
                          circular={true}
                          error={fieldState.error?.message}
                          disabled={isDisabled}
                        />
                      );
                    }}
                  />
                </div>

                {/* Select all inside this item */}
                <Controller
                  control={control}
                  name="permissionIds"
                  render={({ field }) => {
                    const allIds = [item.id, ...(item.childIds || [])];
                    const isAllSelected = allIds.every((id) =>
                      field.value.includes(id),
                    );

                    const toggleAll = () => {
                      if (isDisabled) return;
                      if (isAllSelected) {
                        field.onChange(
                          field.value.filter((id) => !allIds.includes(id)),
                        );
                      } else {
                        field.onChange([
                          ...new Set([...field.value, ...allIds]),
                        ]);
                      }
                    };

                    return (
                      <Checkbox
                        id={`select-all-${item.id}`}
                        label="Select All"
                        checked={isAllSelected}
                        onChange={toggleAll}
                        size="md"
                        color="success"
                        icon={FaCheckCircle}
                        circular
                        disabled={isDisabled}
                      />
                    );
                  }}
                />
              </CardHeader>

              <CardContent className="space-y-2 px-4 py-0">
                <div className="grid grid-cols-12 gap-x-4">
                  <div className="col-span-12 flex flex-col">
                    {/* Page Permissions */}
                    {item.pages && item.pages.length > 0 && (
                      <div className="col-span-12 flex flex-col gap-3 bg-sky-50 dark:bg-gray-800/30 p-4 rounded-lg">
                        <div className="flex flex-row justify-between items-center pb-2">
                          <h4 className="dark-title-color font-semibold text-md">
                            Page Permissions
                          </h4>

                          <Controller
                            control={control}
                            name="permissionIds"
                            render={({ field, fieldState }) => {
                              const allIds = item.pages.map((p) => p.id);
                              const isAllSelected = allIds.every((id) =>
                                field.value.includes(id),
                              );

                              const toggleAll = () => {
                                if (isDisabled) return;
                                if (isAllSelected) {
                                  field.onChange(
                                    field.value.filter(
                                      (id) => !allIds.includes(id),
                                    ),
                                  );
                                } else {
                                  field.onChange([
                                    ...new Set([...field.value, ...allIds]),
                                  ]);
                                }
                              };

                              return (
                                <Checkbox
                                  id={`select-all-page-${item.id}`}
                                  label="Select All"
                                  checked={isAllSelected}
                                  onChange={toggleAll}
                                  size="sm"
                                  color="success"
                                  icon={FaCheckCircle}
                                  circular={true}
                                  error={fieldState.error?.message}
                                  disabled={isDisabled}
                                />
                              );
                            }}
                          />
                        </div>

                        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 grid-auto-flow gap-x-4">
                          {item.pages &&
                            item.pages.length > 0 &&
                            item.pages.map((page) => (
                              <div key={page.id} className="flex flex-col items-start gap-1">
                                <Controller
                                  control={control}
                                  name="permissionIds"
                                  render={({ field, fieldState }) => {
                                    const isChecked = field.value.includes(
                                      page.id,
                                    );
                                    const handleChange = () => {
                                      if (isDisabled) return;
                                      if (isChecked) {
                                        field.onChange(
                                          field.value.filter(
                                            (id) => id !== page.id,
                                          ),
                                        );
                                      } else {
                                        field.onChange([
                                          ...field.value,
                                          page.id,
                                        ]);
                                      }
                                    };

                                    return (
                                      <Checkbox
                                        id={`page-${page.id}`}
                                        label={page.name}
                                        checked={isChecked}
                                        onChange={handleChange}
                                        size="sm"
                                        color="success"
                                        icon={FaCheckCircle}
                                        circular={true}
                                        error={fieldState.error?.message}
                                        disabled={isDisabled}
                                      />
                                    );
                                  }}
                                />
                                <p className="text-gray-400 dark:text-gray-600 text-xs ml-7">
                                  {page.description}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Action Permissions */}
                    {item.actions && item.actions.length > 0 && (
                      <div className="col-span-12 flex flex-col gap-3 mt-5 bg-sky-50 dark:bg-gray-800/30 p-4 rounded-lg">
                        <div className="flex flex-row justify-between items-center pb-2">
                          <h4 className="dark-title-color font-semibold text-md">
                            Action Permissions
                          </h4>

                          <Controller
                            control={control}
                            name="permissionIds"
                            render={({ field, fieldState }) => {
                              const allIds = item.actions.map((p) => p.id);
                              const isAllSelected = allIds.every((id) =>
                                field.value.includes(id),
                              );

                              const toggleAll = () => {
                                if (isDisabled) return;
                                if (isAllSelected) {
                                  field.onChange(
                                    field.value.filter(
                                      (id) => !allIds.includes(id),
                                    ),
                                  );
                                } else {
                                  field.onChange([
                                    ...new Set([...field.value, ...allIds]),
                                  ]);
                                }
                              };

                              return (
                                <Checkbox
                                  id={`select-all-actions-${item.id}`}
                                  label="Select All"
                                  checked={isAllSelected}
                                  onChange={toggleAll}
                                  size="sm"
                                  color="success"
                                  icon={FaCheckCircle}
                                  circular={true}
                                  error={fieldState.error?.message}
                                  disabled={isDisabled}
                                />
                              );
                            }}
                          />
                        </div>

                        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 grid-auto-flow gap-x-4">
                          {item.actions &&
                            item.actions.length > 0 &&
                            item.actions.map((action) => (
                              <div key={action.id} className="flex flex-col items-start gap-1">
                                <Controller
                                  control={control}
                                  name="permissionIds"
                                  render={({ field, fieldState }) => {
                                    const isChecked = field.value.includes(
                                      action.id,
                                    );
                                    const handleChange = () => {
                                      if (isDisabled) return;
                                      if (isChecked) {
                                        field.onChange(
                                          field.value.filter(
                                            (id) => id !== action.id,
                                          ),
                                        );
                                      } else {
                                        field.onChange([
                                          ...field.value,
                                          action.id,
                                        ]);
                                      }
                                    };

                                    return (
                                      <Checkbox
                                        id={`action-${action.id}`}
                                        label={action.name}
                                        checked={isChecked}
                                        onChange={handleChange}
                                        size="sm"
                                        color="success"
                                        icon={FaCheckCircle}
                                        circular={true}
                                        error={fieldState.error?.message}
                                        disabled={isDisabled}
                                      />
                                    );
                                  }}
                                />
                                <p className="text-gray-400 dark:text-gray-600 text-xs ml-7">
                                  {action.description}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Feature Permissions*/}
                    {item.features && item.features.length > 0 && (
                      <div className="col-span-12 flex flex-col gap-3 mt-5 bg-sky-50 dark:bg-gray-800/30 p-4 rounded-lg">
                        <div className="flex flex-row justify-between items-center pb-2">
                          <h4 className="dark-title-color font-semibold text-md">
                            Feature Permissions
                          </h4>

                          <Controller
                            control={control}
                            name="permissionIds"
                            render={({ field, fieldState }) => {
                              const allIds = item.features.map((p) => p.id);
                              const isAllSelected = allIds.every((id) =>
                                field.value.includes(id),
                              );

                              const toggleAll = () => {
                                if (isDisabled) return;
                                if (isAllSelected) {
                                  field.onChange(
                                    field.value.filter(
                                      (id) => !allIds.includes(id),
                                    ),
                                  );
                                } else {
                                  field.onChange([
                                    ...new Set([...field.value, ...allIds]),
                                  ]);
                                }
                              };

                              return (
                                <Checkbox
                                  id={`select-all-features-${item.id}`}
                                  label="Select All"
                                  checked={isAllSelected}
                                  onChange={toggleAll}
                                  size="sm"
                                  color="success"
                                  icon={FaCheckCircle}
                                  circular={true}
                                  error={fieldState.error?.message}
                                  disabled={isDisabled}
                                />
                              );
                            }}
                          />
                        </div>

                        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 grid-auto-flow gap-x-4">
                          {item.features &&
                            item.features.length > 0 &&
                            item.features.map((feature) => (
                              <div key={feature.id} className="flex flex-col items-start gap-1">
                                <Controller
                                  control={control}
                                  name="permissionIds"
                                  render={({ field, fieldState }) => {
                                    const isChecked = field.value.includes(
                                      feature.id,
                                    );
                                    const handleChange = () => {
                                      if (isDisabled) return;
                                      if (isChecked) {
                                        field.onChange(
                                          field.value.filter(
                                            (id) => id !== feature.id,
                                          ),
                                        );
                                      } else {
                                        field.onChange([
                                          ...field.value,
                                          feature.id,
                                        ]);
                                      }
                                    };

                                    return (
                                      <Checkbox
                                        id={`feature-${feature.id}`}
                                        label={feature.name}
                                        checked={isChecked}
                                        onChange={handleChange}
                                        size="sm"
                                        color="success"
                                        icon={FaCheckCircle}
                                        circular={true}
                                        error={fieldState.error?.message}
                                        disabled={isDisabled}
                                      />
                                    );
                                  }}
                                />
                                <p className="text-gray-400 dark:text-gray-600 text-xs ml-7">
                                  {feature.description}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg my-6 border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              No permissions found{permissionName ? ` matching "${permissionName}"` : ""}.
            </p>
            {permissionName && (
              <button
                type="button"
                onClick={() => setValue("permissionName", "")}
                className="text-primary text-sm underline mt-2 inline-block cursor-pointer hover:opacity-80"
              >
                Clear search filter
              </button>
            )}
          </div>
        )}

        <div className="mt-4 border-t"></div>

        <div className="flex flex-row justify-end my-4 mb-8 gap-4">
          <ButtonTw
            type="submit"
            size="sm"
            variant="default"
            className="font-bold px-18"
            disabled={isLoading || isDisabled}
            loading={isLoading}
          >
            Submit
          </ButtonTw>

          <ButtonTw
            size="sm"
            variant="outline.gray"
            className="font-bold px-18"
            onClick={() => router.push("/settings/company-user-roles")}
          >
            Cancel
          </ButtonTw>
        </div>
      </form>
    </div>
  );
};

export default CompanyUserRoleFormComponent;