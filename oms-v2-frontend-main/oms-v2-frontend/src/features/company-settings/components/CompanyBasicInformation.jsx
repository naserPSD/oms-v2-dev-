"use client";

import { FormController as Controller } from "@/components/common/FormController";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";

import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import ButtonTw from "@/components/ui/ButtonTw";
import { ModalTw } from "@/components/common/ModalTw";
import { useCommonStore } from "@/store/useCommonStore";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import {
  FaFacebookF,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { resolveImageUrl } from "@/utils/helpers";

/* =======================
   Zod Schema & Initial Values
======================= */

const initialValues = {
  id: 0,
  name: "",
  typeId: null,
  sizeId: null,
  email: "",
  phoneCountryId: null,
  phone: "",
  facebookUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  websiteUrl: "",
  address: "",
  logoMediaId: "",
};

const emptyToString = (value) =>
  value == null || value === undefined ? "" : String(value);

const optionalUrl = z.preprocess(
  emptyToString,
  z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .url("Enter a valid URL (e.g. https://example.com)"),
  ]),
);

const requiredString = (message) =>
  z.preprocess(emptyToString, z.string().min(1, message));

const schema = z.object({
  id: z.coerce.number().optional(),
  name: requiredString("Company name is required"),
  typeId: z.coerce.number().min(1, "Company type is required"),
  sizeId: z.coerce.number().min(1, "Company size is required"),
  email: z.preprocess(
    emptyToString,
    z.string().min(1, "Email is required").email("Invalid email"),
  ),
  phoneCountryId: z.preprocess(
    (value) => (value == null || value === "" ? undefined : value),
    z.coerce.number({
      required_error: "Country code is required",
      invalid_type_error: "Country code is required",
    }).min(1, "Country code is required"),
  ),
  phone: requiredString("Phone number is required"),
  facebookUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  instagramUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  websiteUrl: optionalUrl,
  address: requiredString("Company address is required"),
  logoMediaId: z.any().nullable().optional(),
});

/* =======================
   Modal Component
======================= */

const CompanyModal = ({
  showModal,
  onClose,
  companyData,
  companyTypeList = [],
  companySizeList = [],
  dropdowns,
}) => {
  const { control, handleSubmit, reset, watch, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const { addAndUpdateCompanyInfoMutation, isLoading } =
    useCompanySettingsQueryApi({
      reset,
      setError,
      handleClose: onClose,
    });

  // Reset / pre-fill logic based on mode
  useEffect(() => {
    if (!showModal) return;

    const bangladeshCountryId =
      dropdowns.countryList?.find((c) => String(c.callingCode) === "880")?.id ||
      null;

    if (companyData?.id) {
      reset({
        ...initialValues,
        ...companyData,
        // API may return null — normalize to form-friendly values
        name: companyData.name ?? "",
        email: companyData.email ?? "",
        phone: companyData.phone ?? "",
        phoneCountryId: companyData.phoneCountryId || bangladeshCountryId,
        address: companyData.address ?? "",
        websiteUrl: companyData.websiteUrl ?? "",
        facebookUrl: companyData.facebookUrl ?? "",
        linkedinUrl: companyData.linkedinUrl ?? "",
        instagramUrl: companyData.instagramUrl ?? "",
        youtubeUrl: companyData.youtubeUrl ?? "",
        logoMediaId: companyData.logoMediaId ?? "",
      });
      return;
    }

    reset({ ...initialValues, phoneCountryId: bangladeshCountryId });
  }, [showModal, companyData, dropdowns.countryList, reset]);

  const submitForm = async (values) => {
    const payload = {
      ...values,
      websiteUrl: values.websiteUrl || null,
      facebookUrl: values.facebookUrl || null,
      linkedinUrl: values.linkedinUrl || null,
      instagramUrl: values.instagramUrl || null,
      youtubeUrl: values.youtubeUrl || null,
    };
    if (!payload.id) delete payload.id;

    await addAndUpdateCompanyInfoMutation.mutateAsync(payload);
  };
  return (
    <ModalTw
      show={showModal}
      onClose={onClose}
      title={
        watch("id") ? "Update Company Information" : "Add Company Information"
      }
      size="xl"
      dismissible
      showHeader
      showFooter={false}
      type="default"
      position="center"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="grid grid-cols-2 gap-4">
          {/* Company Name */}
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Input
                label="Company Name *"
                placeholder="Enter Company Name"
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Input
                label="Contact Email *"
                placeholder="example@email.com"
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />

          {/* Company Type */}
          <Controller
            control={control}
            name="typeId"
            render={({ field, fieldState }) => (
              <SelectSearch
                label="Company Type *"
                placeholder="Select Company Type"
                options={companyTypeList}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          {/* Company Size */}
          <Controller
            control={control}
            name="sizeId"
            render={({ field, fieldState }) => (
              <SelectSearch
                label="Company Size *"
                placeholder="Select Company Size"
                options={companySizeList}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          {/* Phone */}
          <div className="col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Phone <span className="text-red-500">*</span>
            </label>

            <div className="flex">
              <Controller
                control={control}
                name="phoneCountryId"
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label=""
                    className="w-1/3 rounded-r-none border-r-0"
                    options={dropdowns.countryList?.map((c) => ({
                      value: c.id,
                      label: `(+${c.callingCode}) ${c.name}`,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    placeholder="+880"
                    searchable
                    size="sm"
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Input
                    className="w-2/3 rounded-l-none -ml-px border-l-0"
                    placeholder="Enter Phone Number"
                    error={fieldState.error?.message}
                    size="sm"
                    {...field}
                  />
                )}
              />
            </div>
          </div>

          {/* Website */}
          <Controller
            control={control}
            name="websiteUrl"
            render={({ field, fieldState }) => (
              <Input
                label="Website"
                placeholder="https://example.com"
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />

          {/* Address */}
          <div className="col-span-2">
            <Controller
              control={control}
              name="address"
              render={({ field, fieldState }) => (
                <Input
                  label="Company Address *"
                  placeholder="Enter full address (e.g. House 37, Road 3, Sector 9, Uttara, Dhaka-1230)"
                  error={fieldState.error?.message}
                  {...field}
                />
              )}
            />
          </div>

          {/* Social Links */}
          <Controller
            control={control}
            name="facebookUrl"
            render={({ field, fieldState }) => (
              <Input
                label="Facebook URL"
                placeholder="https://facebook.com/your-page"
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="linkedinUrl"
            render={({ field, fieldState }) => (
              <Input
                label="LinkedIn URL"
                placeholder="https://linkedin.com/company/your-company"
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="instagramUrl"
            render={({ field, fieldState }) => (
              <Input
                label="Instagram URL"
                placeholder="https://instagram.com/your-page"
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="youtubeUrl"
            render={({ field, fieldState }) => (
              <Input
                label="YouTube URL"
                placeholder="https://youtube.com/@your-channel"
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />

          {/* Buttons */}
          <div className="col-span-2 flex gap-4 pt-4">
            <ButtonTw
              type="submit"
              className="w-full font-bold"
              disabled={isLoading}
            >
              {watch("id") ? "Update" : "Create"}
            </ButtonTw>
            <ButtonTw
              type="button"
              variant="outline.gray"
              className="w-full"
              onClick={() => {
                const bangladeshCountryId =
                  dropdowns.countryList?.find(
                    (c) => String(c.callingCode) === "880",
                  )?.id || null;

                if (companyData?.id) {
                  reset({
                    ...initialValues,
                    ...companyData,
                    name: companyData.name ?? "",
                    email: companyData.email ?? "",
                    phone: companyData.phone ?? "",
                    phoneCountryId:
                      companyData.phoneCountryId || bangladeshCountryId,
                    address: companyData.address ?? "",
                    websiteUrl: companyData.websiteUrl ?? "",
                    facebookUrl: companyData.facebookUrl ?? "",
                    linkedinUrl: companyData.linkedinUrl ?? "",
                    instagramUrl: companyData.instagramUrl ?? "",
                    youtubeUrl: companyData.youtubeUrl ?? "",
                  });
                } else {
                  reset({
                    ...initialValues,
                    phoneCountryId: bangladeshCountryId,
                  });
                }
              }}
            >
              Reset
            </ButtonTw>
          </div>
        </div>
      </form>
    </ModalTw>
  );
};

/* =======================
   Main Page Component
======================= */

const CompanyBasicInformation = ({ company, hasPermission }) => {
  const [openModal, setOpenModal] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const companyLogoUrl = resolveImageUrl(company?.logoMedia?.fileUrl);

  useEffect(() => {
    setLogoError(false);
  }, [companyLogoUrl]);

  const companySizeList =
    dropdowns.statusGroupList?.find((s) => s.code === "app_company_sizes")
      ?.statuses ?? [];
  const companyTypeList =
    dropdowns.statusGroupList?.find((s) => s.code === "app_company_types")
      ?.statuses ?? [];

  const initials = company?.name
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="flex-1 min-w-[280px]
      bg-white dark:bg-gray-900
      border border-gray-100 dark:border-gray-800
      rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4
        border-b border-gray-100 dark:border-gray-800"
      >
        <div className="flex items-center gap-3">
          {/* Company Logo / Avatar */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center
            bg-blue-50 dark:bg-blue-950
            text-blue-600 dark:text-blue-400
            text-sm font-medium
            border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-xs"
          >
            {companyLogoUrl && !logoError ? (
              <img
                src={companyLogoUrl}
                alt={company?.name || "Company Logo"}
                className="w-full h-full object-contain p-0.5"
                onError={() => setLogoError(true)}
              />
            ) : (
              initials || "CO"
            )}
          </div>
          <div>
            <p className="text-[15px] font-medium text-gray-800 dark:text-gray-100 leading-tight">
              {company?.name || "Company Name"}
            </p>
            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
              {[company?.type?.name, company?.size?.name]
                .filter(Boolean)
                .join(" · ") || "—"}
            </p>
            {(!company?.email || !company?.phone || !company?.address) && (
              <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                Add email, phone &amp; address to complete basic info
              </p>
            )}
          </div>
        </div>

        {hasPermission("settings.company_settings_basic_information_edit") && (
          <ButtonTw
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5"
          >
            {company?.id ? (
              <>
                <i className="fa-solid fa-pen-to-square text-[11px]" /> Edit
              </>
            ) : (
              <>
                <i className="fa-solid fa-plus text-[11px]" /> Create
              </>
            )}
          </ButtonTw>
        )}
      </div>

      {/* Info Rows */}
      <div className="px-5 py-4 flex flex-col gap-2.5">
        <InfoRow label="Email" value={company?.email} />
        <InfoRow label="Phone" value={company?.phone} />
        <InfoRow label="Address" value={company?.address} />
        <InfoRow label="Type" value={company?.type?.name} />
        <InfoRow label="Size" value={company?.size?.name} />
      </div>

      {/* Social Links */}
      <SocialLinks company={company} />

      <CompanyModal
        showModal={openModal}
        onClose={() => setOpenModal(false)}
        companyData={company}
        companyTypeList={companyTypeList}
        companySizeList={companySizeList}
        dropdowns={dropdowns}
      />
    </div>
  );
};

/* =======================
   Info Row Component
======================= */

const InfoRow = ({ label, value }) => {
  return (
    <div
      className="flex items-center gap-2.5
      px-3 py-2 rounded-xl
      bg-gray-50 dark:bg-gray-800/60"
    >
      <span
        className="w-[88px] shrink-0
        text-[11px] font-medium uppercase tracking-wide
        text-gray-400 dark:text-gray-500"
      >
        {label}
      </span>
      <span className="text-[13px] text-gray-700 dark:text-gray-300 break-all">
        {value || "—"}
      </span>
    </div>
  );
};

const SocialLinks = ({ company }) => {
  if (!company) return null;

  const buttons = [
    {
      label: "Facebook",
      icon: <FaFacebookF />,
      value: company.facebookUrl || company.facebook_url,
      style: "bg-[#1877F2] text-white",
    },
    {
      label: "LinkedIn",
      icon: <FaLinkedinIn />,
      value: company.linkedinUrl || company.linkedInUrl || company.linked_in_url,
      style: "bg-[#0A66C2] text-white",
    },
    {
      label: "Instagram",
      icon: <FaInstagram />,
      value: company.instagramUrl || company.instagram_url,
      style: "bg-[#E1306C] text-white",
    },
    {
      label: "YouTube",
      icon: <FaYoutube />,
      value: company.youtubeUrl || company.youtube_url,
      style: "bg-[#FF0000] text-white",
    },
    {
      label: "Website",
      icon: <FaGlobe />,
      value: company.websiteUrl || company.website_url,
      style:
        "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
    },
  ].filter((b) => b.value);

  if (buttons.length === 0) return null;

  return (
    <div className="px-5 pb-5">
      <div className="h-px bg-gray-100 dark:bg-gray-800 mb-4" />
      <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
        Social Links
      </p>
      <div className="flex flex-wrap gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={() =>
              window.open(btn.value, "_blank", "noopener,noreferrer")
            }
            className={`flex items-center gap-1.5 px-3 py-1.5
              rounded-full text-[12px] font-medium
              cursor-pointer hover:opacity-80 transition-opacity
              ${btn.style}`}
          >
            <span className="text-[11px]">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CompanyBasicInformation;
