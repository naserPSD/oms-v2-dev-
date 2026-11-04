import { FormController as Controller } from "@/components/common/FormController";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { useCommonStore } from "@/store/useCommonStore";
import RestApi from "@/utils/RestApi";
import { getAuthUserInfo } from "@/utils/commonApiFunction";
import helpers, { toaster } from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const CompanyBasicInformationModal = ({
  showModal = false,
  onClose,
  companyData,
}) => {
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const [isLoading, setLoading] = useState(false);

  const companySizeList =
    dropdowns.statusGroupList
      ?.find((s) => s.code === "app_company_sizes")
      ?.statuses?.map((c) => ({
        value: c.id,
        label: c.name,
        code: c.code,
      })) ?? [];

  const companyTypeList =
    dropdowns.statusGroupList
      ?.find((s) => s.code === "app_company_types")
      ?.statuses?.map((c) => ({
        value: c.id,
        label: c.name,
        code: c.code,
      })) ?? [];

  // Zod schema for company information
  const schema = z.object({
    name: z.string().min(1, "Company name is required"),
    companyTypeId: z.string().min(1, "Company type is required"),
    companySizeId: z.string().min(1, "Company size is required"),
    contactEmail: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    adminUser: z.string().min(1, "Admin user is required"),
    facebookProfile: z.string().url("Invalid URL").optional().or(z.literal("")),
    linkedinProfile: z.string().url("Invalid URL").optional().or(z.literal("")),
  });

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: companyData?.name || "",
      companyTypeId: companyData?.type?.id || "",
      companySizeId: companyData?.size?.id || "",
      contactEmail: companyData?.contactEmail || "",
      phoneNumber: companyData?.phoneNumber || "",
      adminUser: companyData?.adminUser || "",
      facebookProfile: companyData?.facebookProfile || "",
      linkedinProfile: companyData?.linkedinProfile || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (companyData) {
      reset({
        name: companyData.name || "",
        companyTypeId: companyData.type?.id || "",
        companySizeId: companyData.size?.id || "",
        contactEmail: companyData.contactEmail || "",
        phoneNumber: companyData.phoneNumber || "",
        adminUser: companyData.adminUser || "",
        facebookProfile: companyData.facebookProfile || "",
        linkedinProfile: companyData.linkedinProfile || "",
      });
    }
  }, [companyData, reset]);

  const handleClose = () => {
    if (onClose) onClose();
  };

  const submitForm = async (values) => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      await RestApi.patch(`/companies/update-info`, values);
      await getAuthUserInfo(setLoading);
      handleClose();
      toaster("Company information updated successfully", "success");
    } catch (error) {
      helpers.handleApiValidationError(error, setError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title="Company Information"
      size="2xl"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <form className="" onSubmit={handleSubmit(submitForm)}>
        <div className="flex flex-row ">
          <div className="container">
            <div className="grid grid-cols-12 gap-x-4">
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <Input
                    label="Company Name"
                    placeholder="Enter company name"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12"
                    {...field}
                  />
                )}
              />

              <Controller
                control={control}
                name="companyTypeId"
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Company Type"
                    placeholder="Select company type"
                    options={companyTypeList}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-6 sm:col-span-12"
                    searchable
                  />
                )}
              />

              <Controller
                control={control}
                name="companySizeId"
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Company Size"
                    placeholder="Select company size"
                    options={companySizeList}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-6 sm:col-span-12"
                    searchable
                  />
                )}
              />

              <Controller
                control={control}
                name="contactEmail"
                render={({ field, fieldState }) => (
                  <Input
                    label="Contact Email"
                    placeholder="Enter contact email"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-6 sm:col-span-12"
                    {...field}
                  />
                )}
              />

              <Controller
                control={control}
                name="phoneNumber"
                render={({ field, fieldState }) => (
                  <Input
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-6 sm:col-span-12"
                    {...field}
                  />
                )}
              />

              <Controller
                control={control}
                name="adminUser"
                render={({ field, fieldState }) => (
                  <Input
                    label="Admin User"
                    placeholder="Enter admin user"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-6 sm:col-span-12"
                    {...field}
                  />
                )}
              />

              <Controller
                control={control}
                name="facebookProfile"
                render={({ field, fieldState }) => (
                  <Input
                    label="Facebook Profile"
                    placeholder="Enter Facebook profile URL"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-6 sm:col-span-12"
                    {...field}
                  />
                )}
              />

              <Controller
                control={control}
                name="linkedinProfile"
                render={({ field, fieldState }) => (
                  <Input
                    label="LinkedIn Profile"
                    placeholder="Enter LinkedIn profile URL"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-6 sm:col-span-12"
                    {...field}
                  />
                )}
              />
            </div>

            <ButtonTw
              type="submit"
              size="sm"
              variant="default"
              className="w-full font-bold mt-4"
              disabled={isLoading}
              loading={isLoading}
            >
              Update Information
            </ButtonTw>
          </div>
        </div>
      </form>
    </ModalTw>
  );
};

export default CompanyBasicInformationModal;
