"use client";

import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import Input from "@/components/ui/Input";
import RestApi from "@/utils/RestApi";
import helpers, { toaster } from "@/utils/helpers";
import { useTranslation } from "next-i18next";
import ButtonTw from "@/components/ui/ButtonTw copy";
import FileUpload from "@/components/ui/FileUpload";
import { useCommonStore } from "@/store/useCommonStore";
import SelectSearch from "@/components/ui/SelectSearch";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Image from "next/image";
import { RadioButton } from "@/components/ui/RadioButton";
import AvatarUpload from "@/components/ui/AvatarUpload";
import RadioGroup from "@/components/ui/RadioGroup";
import { useAuthStore } from "@/store/useAuthStore";
import { getAuthUserInfo } from "@/utils/commonApiFunction";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const InitialSetup = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const authUser = useAuthStore((state) => state.user);

  const companySizeList =
    dropdowns.statusGroupList?.find((s) => s.code === "app_company_sizes")
      ?.statuses ?? [];
  const companyTypeList = React.useMemo(() => {
    const rawList =
      dropdowns.statusGroupList?.find((s) => s.code === "app_company_types")
        ?.statuses ?? [];

    return [...rawList]
      .map((item) => ({
        ...item,
        value: item.value ?? item.id,
        label: item.label ?? item.name,
      }))
      .sort((a, b) =>
        String(a.label || a.name || "")
          .trim()
          .localeCompare(String(b.label || b.name || "").trim(), undefined, {
            sensitivity: "base",
          })
      );
  }, [dropdowns.statusGroupList]);

  const initialSetupTypeList = useCommonStore(
    (state) => state.initialSetupTypeList,
  );

  const [showModal, setShowModal] = useState(false);

  const isPureAdmin =
    authUser?.email === "demo@revinr.com" ||
    (Array.isArray(authUser?.userRole) &&
      authUser.userRole.some(
        (r) =>
          typeof r === "string" &&
          (r.toLowerCase().includes("super") || r.toLowerCase() === "admin")
      ));

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__initialSetupModalOpen = showModal;
    }
    if (showModal) {
      toast.dismiss();
    }
    return () => {
      if (typeof window !== "undefined") {
        window.__initialSetupModalOpen = false;
      }
    };
  }, [showModal]);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("triggerInitialSetup") === "true") {
      sessionStorage.removeItem("triggerInitialSetup");
      window.__initialSetupModalOpen = true;
      setShowModal(true);
      return;
    }

    if (authUser && !authUser.appUseCase && !isPureAdmin) {
      if (typeof window !== "undefined") {
        window.__initialSetupModalOpen = true;
      }
      setShowModal(true);
    }
  }, [authUser, isPureAdmin]);

  const [isLoading, setLoading] = useState(false);
  const [src, setSrc] = useState(""); // For previewing the uploaded image
  const [showCrop, setShowCrop] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const imgRef = useRef(null);
  const [crop, setCrop] = useState({
    unit: "px",
    x: 80,
    y: 35,
    width: 250,
    height: 250,
  });

  const languages = [
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "js", label: "JavaScript" },
  ];

  // Crop utility
  const getCroppedImg = async function (image, crop) {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  };

  // Zod schema with conditional validation
  const schema = z
    .object({
      setupType: z.string().min(1, "Setup Type is required"),
      name: z.string().optional(),
      typeId: z.coerce.number().optional(),
      sizeId: z.coerce.number().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
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
        if (!data.postalCode || data.postalCode.trim() === "") {
          ctx.addIssue({
            path: ["postalCode"],
            code: z.ZodIssueCode.custom,
            message: "Postal Code is required",
          });
        }
        if (!data.countryId) {
          ctx.addIssue({
            path: ["countryId"],
            code: z.ZodIssueCode.custom,
            message: "Country is required",
          });
        }
        // if (!data.timezone || data.timezone.trim() === "") {
        //   ctx.addIssue({ path: ["timezone"], code: z.ZodIssueCode.custom, message: "Timezone is required" });
        // }
        // if (!data.logo || data.logo.length === 0) {
        //   ctx.addIssue({ path: ["logo"], code: z.ZodIssueCode.custom, message: "Logo is required" });
        // }
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
      setupType: "company",
      name: "",
      profilePic: "",
      phoneCountryId: "",
      countryId: 15,
      phone: "",
      typeId: "",
      sizeId: "",
      address: "",
      city: "",
      postalCode: "",
      timezone: "",
      // logo: "",
    },
    mode: "onChange",
  });

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
        // formData.append("logo", values.logo);
        formData.append("postalCode", values.postalCode);
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
        skipErrorToast: true,
      });
      setShowModal(false);
      await getAuthUserInfo(setLoading);

      toaster("Initial setup completed successfully", "success");
      // reset();
      if (values.setupType === "company") {
        router.push("/settings/company-settings");
      } else {
        router.push("/");
      }
    } catch (error) {
      helpers.handleApiValidationError(error, setError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* <button
        onClick={() => setShowModal(true)}
        className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        Open Modal
      </button> */}
      <ModalTw
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Initial Setup"
        size="4xl"
        onConfirm={() => setShowModal(false)}
        dismissible={false}
        confirmText="Confirm"
        cancelText="Cancel"
        showFooter={false}
        showHeader={false}
        type="default"
        position="center"
      >
        <form className="p-3 text-gray-900 dark:text-gray-100" onSubmit={handleSubmit(submitForm)}>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Get Started</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You are just one step away from setting up your account
          </p>
          <div className="flex flex-row gap-[80px]">
            <div className="w-1/2">
              {/* <Controller
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
                    size='sm'
                    onChange={field.onChange}
                    error={errors.setupType?.message}
                  />
                )}
              /> */}

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
                    name="profilePic"
                    render={({ field, fieldState }) => (
                      <AvatarUpload
                        id="profilePic"
                        value={field.value}
                        onChange={(file) => field.onChange(file)}
                        shape="square" // or "square"
                        size={120}
                        label="Profile Photo"
                        error={fieldState.error?.message}
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
                          className="w-1/2 border-l-0 rounded-l-none z-2 mt-3.5 -ml-1"
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
                        label="Company Name *"
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
                        label="Company Type *"
                        options={companyTypeList}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.typeId?.message}
                        size="sm"
                        placeholder="Select Company Type"
                        searchable
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="sizeId"
                    render={({ field, fieldState }) => (
                      <SelectSearch
                        label="Company Size *"
                        options={companySizeList}
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        size="sm"
                        placeholder="Select Company Size"
                        searchable
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="address"
                    render={({ field, fieldState }) => (
                      <Input
                        label="Address *"
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
                        label="City *"
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
                    name="postalCode"
                    render={({ field, fieldState }) => (
                      <Input
                        label="Postal Code *"
                        placeholder="Enter Postal code"
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
                        label="Country *"
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
                  {/* <Controller
                    control={control}
                    name="timezone"
                    render={({ field, fieldState }) => (
                      <SelectSearch
                        label="Timezone"
                        options={dropdowns.timezoneList?.map(c => ({ value: c.id, label: c.name }))}
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        size="sm"
                        placeholder="Select timezone"
                        searchable
                      />
                    )}
                  /> */}

                  {/* <Controller
                    control={control}
                    name="logo"
                    render={({ field, fieldState }) => (
                      <AvatarUpload
                        id="logo"
                        value={field.value}
                        onChange={file => field.onChange(file)}
                        shape="square" // or "square"
                        size={120}
                        label="Company Logo"
                        error={fieldState.error?.message}
                        icon={<i className="fa-solid fa-image"></i>}
                      />
                    )}
                  /> */}

                  {/* <Controller
                    control={control}
                    name="logo"
                    render={({ field }) => (
                      <FileUpload
                        id="logo"
                        name="logo"
                        label="Logo"
                        accept="image/jpeg,image/png,image/webp"
                        error={errors.logo?.message}
                        size="sm"
                        onChange={e => {
                          field.onChange(e.target.files);
                        }}
                        clearable
                      />
                    )}
                  /> */}
                </>
              )}

              {/* Image Crop Modal */}
              {/* {showCrop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-4 rounded shadow-lg">
                    <ReactCrop crop={crop} onChange={setCrop} aspect={1}>
                      <img
                        ref={imgRef}
                        src={src}
                        alt="Crop"
                        onLoad={e => (imgRef.current = e.target)}
                        style={{ maxHeight: 400, maxWidth: 400 }}
                      />
                    </ReactCrop>
                    <div className="flex justify-end mt-4">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
                        onClick={async () => {
                          const cropped = await getCroppedImg(imgRef.current, crop);
                          setCroppedImage(cropped);
                          setShowCrop(false);
                        }}
                      >
                        OK
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-300 rounded"
                        onClick={() => setShowCrop(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )} */}

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
            <div className="w-1/2">
              <Image
                src="/assets/images/auth/setup.png"
                alt="Setup Image"
                width={705}
                height={705}
                className="mx-auto mt-[-50px]"
              />
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default InitialSetup;
