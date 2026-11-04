// /tabs/EmployeeHistoryTab.jsx
"use client";
import { FormController as Controller } from "@/components/common/FormController";
import ButtonTw from "@/components/ui/ButtonTw";
import { toast } from "react-toastify";
import MiniSpinner from "@/shared/loader/MiniSpinner";
import { ModalTw } from "@/components/common/ModalTw";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import Input from "@/components/ui/Input";
import RestApi from "@/utils/RestApi";
import helpers, { toaster } from "@/utils/helpers";
import FileUpload from "@/components/ui/FileUpload";
import SelectSearch from "@/components/ui/SelectSearch";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Image from "next/image";
import { RadioButton } from "@/components/ui/RadioButton";
import AvatarUpload from "@/components/ui/AvatarUpload";
import RadioGroup from "@/components/ui/RadioGroup";
import { useAuthStore } from "@/store/useAuthStore";
import { getAuthUserInfo } from "@/utils/commonApiFunction";
import { useCommonStore } from "@/store/useCommonStore";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import CommonTable from "@/components/common/CommonTable";

const AssetDetails = () => {
  // const [loading, setLoading] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [assetDetails, setAssetDetails] = useState([]);
  const user = useAuthStore((state) => state.user);
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const authUser = useAuthStore((state) => state.user);

  const initialSetupTypeList = useCommonStore(
    (state) => state.initialSetupTypeList,
  );

  const [showModal, setShowModal] = useState(false);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);
  //       // Fetch both data in parallel
  //       const [historyRes, assetsRes] = await Promise.all([
  //         fetch(`/api/employee/history?userId=${user.id}`),
  //         fetch(`/api/employee/assets?userId=${user.id}`)
  //       ]);

  //       const historyData = await historyRes.json();
  //       const assetsData = await assetsRes.json();

  //       setEmployeeHistory(historyData);
  //       setAssetDetails(assetsData);
  //     } catch (error) {
  //       toast.error("Failed to load data");
  //       console.error(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [user.id]);

  const schema = z
    .object({
      setupType: z.string().min(1, "Setup Type is required"),
      name: z.string().optional(),
      typeId: z.coerce.number().optional(),
      sizeId: z.coerce.number().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      countryId: z.coerce.number().optional(),
      timezone: z.string().optional(),
      logo: z.any().optional(),
      profilePic: z.any().optional(),
      phoneCountryId: z.coerce.number().optional(),
      phone: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.setupType === "personal") {
        // if (!data.profilePic || data.profilePic.length === 0) {
        //   ctx.addIssue({ path: ["profilePic"], code: z.ZodIssueCode.custom, message: "Profile Picture is required" });
        // }
        if (!data.countryId) {
          ctx.addIssue({
            path: ["countryId"],
            code: z.ZodIssueCode.custom,
            message: "Country is required",
          });
        }
        if (!data.phoneCountryId) {
          ctx.addIssue({
            path: ["phoneCountryId"],
            code: z.ZodIssueCode.custom,
            message: "Country Code is required",
          });
        }
        if (!data.phone || data.phone.trim() === "") {
          ctx.addIssue({
            path: ["phone"],
            code: z.ZodIssueCode.custom,
            message: "Phone number is required",
          });
        }
      }
      if (data.setupType === "company") {
        if (!data.name || data.name.trim() === "") {
          ctx.addIssue({
            path: ["name"],
            code: z.ZodIssueCode.custom,
            message: "Company Name is required",
          });
        }
        if (!data.typeId) {
          ctx.addIssue({
            path: ["typeId"],
            code: z.ZodIssueCode.custom,
            message: "Type is required",
          });
        }
        if (!data.sizeId) {
          ctx.addIssue({
            path: ["sizeId"],
            code: z.ZodIssueCode.custom,
            message: "Size is required",
          });
        }
        if (!data.address || data.address.trim() === "") {
          ctx.addIssue({
            path: ["address"],
            code: z.ZodIssueCode.custom,
            message: "Address is required",
          });
        }
        if (!data.city || data.city.trim() === "") {
          ctx.addIssue({
            path: ["city"],
            code: z.ZodIssueCode.custom,
            message: "City is required",
          });
        }
        if (!data.countryId) {
          ctx.addIssue({
            path: ["countryId"],
            code: z.ZodIssueCode.custom,
            message: "Country is required",
          });
        }
        if (!data.timezone || data.timezone.trim() === "") {
          ctx.addIssue({
            path: ["timezone"],
            code: z.ZodIssueCode.custom,
            message: "Timezone is required",
          });
        }
        if (!data.logo || data.logo.length === 0) {
          ctx.addIssue({
            path: ["logo"],
            code: z.ZodIssueCode.custom,
            message: "Logo is required",
          });
        }
      }
    });

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
    defaultValues: {
      setupType: "",
      name: "",
      profilePic: "",
      phoneCountryId: "",
      countryId: "",
      phone: "",
      typeId: "",
      sizeId: "",
      address: "",
      city: "",
      timezone: "",
      logo: "",
    },
    mode: "onChange",
  });

  // Assset get start...........................................................

  const { useFetchMyAssetsQuery } = useHrQueryApi({});

  const initialLimit = helpers.perPageListItems();
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const queryParams = useMemo(
    () => ({ page: currentPage, limit: itemsPerPage }),
    [currentPage, itemsPerPage],
  );

  const { data: responseData, isLoading: isFetching } =
    useFetchMyAssetsQuery(queryParams);

  const listData = responseData?.data || [];

  const pagination = responseData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };

  const { total } = pagination;

  // Table columns
  const columns = useMemo(
    () => [
      // Serial number
      {
        accessorKey: "sl",
        header: "SL.",
        size: 60,
        cell: ({ row }) =>
          (pagination.page - 1) * pagination.limit + row.index + 1,
      },

      // Asset Type
      {
        accessorKey: "assetType",
        header: "Asset Type",
        size: 140,
        cell: ({ row }) => <span>{row.original?.assetType?.name || "-"}</span>,
      },

      // Description (Asset Name)
      {
        accessorKey: "description",
        header: "Asset",
        size: 180,
        cell: ({ row }) => <span>{row.original?.description}</span>,
      },

      // Model
      {
        accessorKey: "model",
        header: "Model",
        size: 140,
        cell: ({ row }) => <span>{row.original?.model || "-"}</span>,
      },

      // Serial Number
      {
        accessorKey: "serial",
        header: "Serial",
        size: 160,
        cell: ({ row }) => <span>{row.original?.serial || "-"}</span>,
      },

      // Amount
      {
        accessorKey: "amount",
        header: "Amount",
        size: 120,
        cell: ({ row }) => <span>{row.original?.amount}</span>,
      },

      // Allocation Date
      {
        accessorKey: "allocationDate",
        header: "Allocated On",
        size: 150,
        cell: ({ row }) => (
          <span>
            {helpers?.dDate?.(row.original?.allocationDate) ||
              row.original?.allocationDate}
          </span>
        ),
      },

      // Withdrawal Date
      {
        accessorKey: "withdrawalDate",
        header: "Withdrawn On",
        size: 150,
        cell: ({ row }) => (
          <span>
            {row.original?.withdrawalDate
              ? helpers?.dDate?.(row.original?.withdrawalDate)
              : "-"}
          </span>
        ),
      },

      // Status
      {
        accessorKey: "assetStatus",
        header: "Status",
        size: 140,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span
              className={`badge rounded-full badge-${row.original?.assetStatus?.colorName}`}
            >
              {row.original?.assetStatus?.name}
            </span>
          </div>
        ),
      },

      // Remarks
      {
        accessorKey: "remarks",
        header: "Remarks",
        size: 180,
        cell: ({ row }) => <span>{row.original?.remarks || "-"}</span>,
      },
    ],
    [pagination],
  );

  // Create TanStack Table instance
  const table = useReactTable({
    data: listData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode: "fit",
  });
  // Assset get End...........................................................End

  // Watch the setupType field to conditionally render form fields
  const setupType = watch("setupType");

  // Handle form submit
  const submitForm = async (values) => {
    // console.log('values', values)
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("setupType", values.setupType);

      if (values.setupType === "company") {
        formData.append("name", values.name);
        formData.append("typeId", values.typeId);
        formData.append("sizeId", values.sizeId);
        formData.append("address", values.address);
        formData.append("city", values.city);
        formData.append("countryId", values.countryId);
        formData.append("timezone", values.timezone);
        formData.append("logo", values.logo);
      } else if (values.setupType === "personal") {
        formData.append("profilePic", values.profilePic);
        formData.append("countryId", values.countryId);
        const phoneCountry = dropdowns.countryList?.find(
          (country) => country.id === values.phoneCountryId,
        );
        const callingCode = phoneCountry?.callingCode;
        formData.append("phoneCountryId", values.phoneCountryId);
        formData.append("phoneIdentifier", values.phone);
        formData.append("phone", "+" + callingCode + values.phone);
      }

      await RestApi.post("/api/v1/initial-setup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowModal(false);
      await getAuthUserInfo(setLoading);

      toaster("Initial setup completed successfully", "success");
      // reset();
      // router.push("/main-dashboard");
    } catch (error) {
      helpers.handleApiValidationError(error, setError);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <MiniSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 ">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Asset Details</h4>

          {/* {!user?.profileCompleted && (
            <ButtonTw
              onClick={() => setShowModal(true)}
              variant="blue"
              size="sm"
              className="mt-2"
            >
              <i className="fa-solid fa-plus"></i>Add New
            </ButtonTw>
          )} */}

          <ModalTw
            show={showModal}
            onClose={() => setShowModal(false)}
            title="Initial Setup"
            size="4xl"
            onConfirm={() => setShowModal(false)}
            dismissible={true}
            confirmText="Confirm"
            cancelText="Cancel"
            showFooter={true}
            showHeader={true}
            type="default"
            position="center"
          >
            <form className="p-3" onSubmit={handleSubmit(submitForm)}>
              <h2 className="text-2xl font-bold mb-2">Initial Setup</h2>
              <p className="text-gray-500 mb-4">
                Please fill in your details to get started
              </p>
              <div className="flex flex-row gap-[80px]">
                <div className="w-1/2">
                  <Controller
                    control={control}
                    name="setupType"
                    render={({ field }) => (
                      <RadioGroup
                        label="Setup Type"
                        name={field.name}
                        options={initialSetupTypeList}
                        selectedValue={field.value}
                        color="success"
                        activeColor={true}
                        direction="horizontal"
                        variant="card"
                        size="sm"
                        onChange={field.onChange}
                        error={errors.setupType?.message}
                      />
                    )}
                  />

                  {/* <Controller
                          control={control}
                          name="setupType"
                          render={({ field }) => (
                            <RadioButton
                              options={initialSetupTypeList}
                              name={field.name}
                              value={field.value}
                              onChange={field.onChange}
                              label="Setup Type"
                              variant="card"
                              direction="horizontal"
                              color="yellow"
                              size='md'
                              error={errors.setupType?.message}
                            />
                          )}
                        /> */}

                  {/* Personal fields */}
                  {setupType === "personal" && (
                    <>
                      {/* <Controller
                              control={control}
                              name="profilePic"
                              render={({ field }) => (
                                <FileUpload
                                  id="profilePic"
                                  name="profilePic"
                                  label="Profile Picture"
                                  accept="image/jpeg,image/png,image/webp"
                                  error={errors.profilePic?.message}
                                  size="sm"
                                  onChange={e => {
                                    field.onChange(e.target.files);
                                    if (file) {
                                      setSrc(URL.createObjectURL(file));
                                      setShowCrop(true);
                                    } else {
                                      setSrc("");
                                      setShowCrop(false);
                                    }
                                  }}
                                  clearable
                                />
                              )}
                            /> */}

                      <Controller
                        control={control}
                        name="countryId"
                        render={({ field, fieldState }) => (
                          <SelectSearch
                            label="Country"
                            options={dropdowns.countryList?.map((c) => ({
                              value: c.id,
                              label: c.name,
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            size="sm"
                            placeholder="Select Country"
                            searchable
                          />
                        )}
                      />

                      <div className="flex flex-row">
                        <Controller
                          control={control}
                          name="phoneCountryId"
                          render={({ field, fieldState }) => (
                            <SelectSearch
                              label="Phone"
                              className="w-1/2 border-r-0 rounded-r-none"
                              options={dropdowns.countryList?.map((c) => ({
                                value: c.id,
                                label: `(+${c.callingCode}) ${c.name}`,
                              }))}
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                              size="sm"
                              placeholder="Select Country Code"
                              searchable
                            />
                          )}
                        />

                        <Controller
                          control={control}
                          name="phone"
                          render={({ field, fieldState }) => (
                            <Input
                              className="w-1/2 border-l-0 rounded-l-none z-2 mt-[14px]"
                              label=""
                              placeholder="Enter Your Company Name"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                              size="sm"
                              {...field}
                            />
                          )}
                        />

                        {/* <Input
                                className="w-1/2 border-l-0 rounded-l-none z-2 mt-[14px]"
                                id="phone"
                                name="phone"
                                label=""
                                type="text"
                                size="sm"
                                placeholder="Enter Your Phone Number"
                                autoComplete="tel"
                                error={errors.phone?.message}
                                {...register("phone")}
                              /> */}
                      </div>
                    </>
                  )}

                  {/* Company fields */}
                  {setupType === "company" && (
                    <>
                      <Controller
                        control={control}
                        name="name"
                        render={({ field, fieldState }) => (
                          <Input
                            label="Company Name"
                            placeholder="Enter Your Company Name"
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            size="sm"
                            {...field}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="typeId"
                        render={({ field }) => (
                          <SelectSearch
                            label="Type"
                            options={dropdowns.typeList?.map((c) => ({
                              value: c.id,
                              label: c.name,
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.typeId?.message}
                            size="sm"
                            placeholder="Select Type"
                            searchable
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="sizeId"
                        render={({ field, fieldState }) => (
                          <SelectSearch
                            label="Size"
                            options={dropdowns.sizeList?.map((c) => ({
                              value: c.id,
                              label: c.name,
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            size="sm"
                            placeholder="Select Size"
                            searchable
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="address"
                        render={({ field, fieldState }) => (
                          <Input
                            label="Address"
                            placeholder="Enter Address"
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            size="sm"
                            {...field}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="city"
                        render={({ field, fieldState }) => (
                          <Input
                            label="City"
                            placeholder="Enter City"
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            size="sm"
                            {...field}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="countryId"
                        render={({ field, fieldState }) => (
                          <SelectSearch
                            label="Country"
                            options={dropdowns.countryList?.map((c) => ({
                              value: c.id,
                              label: c.name,
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            size="sm"
                            placeholder="Select Country"
                            searchable
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="timezone"
                        render={({ field, fieldState }) => (
                          <SelectSearch
                            label="Timezone"
                            options={dropdowns.timezoneList?.map((c) => ({
                              value: c.id,
                              label: c.name,
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                            size="sm"
                            placeholder="Select Timezone"
                            searchable
                          />
                        )}
                      />
                    </>
                  )}

                  <ButtonTw
                    type="submit"
                    size="sm"
                    variant="default"
                    className="w-full font-bold"
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    Submit
                  </ButtonTw>
                </div>
                {/* <div className="w-1/2">
                  <Image
                    src="/assets/images/auth/setup.png"
                    alt="Setup Image"
                    width={705}
                    height={705}
                    className="mx-auto mt-[-50px]"
                  />
                </div> */}
              </div>
            </form>
          </ModalTw>
        </div>

        <CommonTable
          table={table}
          isFetching={isFetching}
          itemsPerPage={itemsPerPage}
          columns={columns}
          currentPage={currentPage}
          total={total}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* <Pagination
          currentPage={currentPage}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        /> */}
      </div>
      {/* <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Employee History</h4> */}

      {/* {!user?.profileCompleted && (
            <ButtonTw
              onClick={() => setShowModal(true)}
              variant="blue"
              size="sm"
              className="mt-2"
            >
              <i className="fa-solid fa-plus"></i>Add New
            </ButtonTw>
          )} */}
      {/* </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-center">Sl.</th>
                <th>Designation</th>
                <th>Effective Date</th>
                <th className="text-center">Status</th>
                <th>Salary</th>
                {/* <th className="text-center">Actions</th> */}
      {/* </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center">01</td>
                <td>UI/UX Designer</td>
                <td>05 February 2025</td>
                <td className="text-center">Intern</td>
                <td>25,000 BDT</td> */}
      {/* <td className="action">
                  <button type="button" className="btn-action">
                    <i className="fa-regular fa-pen-to-square"></i>
                  </button>
                  <button
                    type="button"
                    className="btn-action hover:text-red-600"
                  >
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                </td> */}
      {/* </tr>
            </tbody>
          </table>
        </div>
      </div> */}
    </>
  );
};

export default AssetDetails;
