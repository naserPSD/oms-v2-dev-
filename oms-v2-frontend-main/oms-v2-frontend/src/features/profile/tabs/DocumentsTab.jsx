// /tabs/EmployeeHistoryTab.jsx
"use client";
import { FormController as Controller } from "@/components/common/FormController";
import ButtonTw from "@/components/ui/ButtonTw";
import { toast } from "react-toastify";
import MiniSpinner from "@/shared/loader/MiniSpinner";
import { ModalTw } from '@/components/common/ModalTw';
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@/utils/zodResolver';
import Input from "@/components/ui/Input";
import RestApi from "@/utils/RestApi";
import helpers, { toaster } from "@/utils/helpers";
import FileUpload from '@/components/ui/FileUpload';
import SelectSearch from '@/components/ui/SelectSearch';
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css';
import Image from "next/image";
import { RadioButton } from '@/components/ui/RadioButton';
import AvatarUpload from '@/components/ui/AvatarUpload';
import RadioGroup from '@/components/ui/RadioGroup';
import { useAuthStore } from '@/store/useAuthStore';
import { getAuthUserInfo } from '@/utils/commonApiFunction';
import { useCommonStore } from "@/store/useCommonStore";

const DocumentsTab = () => {
  // const [loading, setLoading] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [assetDetails, setAssetDetails] = useState([]);
  const user = useAuthStore((state) => state.user);
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const authUser = useAuthStore((state) => state.user);

  const initialSetupTypeList = useCommonStore((state) => state.initialSetupTypeList);

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

   const schema = z.object({
      setupType: z.string().min(1, 'Setup Type is required'),
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
    }).superRefine((data, ctx) => {
      if (data.setupType === "personal") {
        // if (!data.profilePic || data.profilePic.length === 0) {
        //   ctx.addIssue({ path: ["profilePic"], code: z.ZodIssueCode.custom, message: "Profile Picture is required" });
        // }
        if (!data.countryId) {
          ctx.addIssue({ path: ["countryId"], code: z.ZodIssueCode.custom, message: "Country is required" });
        }
        if (!data.phoneCountryId) {
          ctx.addIssue({ path: ["phoneCountryId"], code: z.ZodIssueCode.custom, message: "Country Code is required" });
        }
        if (!data.phone || data.phone.trim() === "") {
          ctx.addIssue({ path: ["phone"], code: z.ZodIssueCode.custom, message: "Phone number is required" });
        }
      }
      if (data.setupType === "company") {
        if (!data.name || data.name.trim() === "") {
          ctx.addIssue({ path: ["name"], code: z.ZodIssueCode.custom, message: "Company Name is required" });
        }
        if (!data.typeId) {
          ctx.addIssue({ path: ["typeId"], code: z.ZodIssueCode.custom, message: "Type is required" });
        }
        if (!data.sizeId) {
          ctx.addIssue({ path: ["sizeId"], code: z.ZodIssueCode.custom, message: "Size is required" });
        }
        if (!data.address || data.address.trim() === "") {
          ctx.addIssue({ path: ["address"], code: z.ZodIssueCode.custom, message: "Address is required" });
        }
        if (!data.city || data.city.trim() === "") {
          ctx.addIssue({ path: ["city"], code: z.ZodIssueCode.custom, message: "City is required" });
        }
        if (!data.countryId) {
          ctx.addIssue({ path: ["countryId"], code: z.ZodIssueCode.custom, message: "Country is required" });
        }
        if (!data.timezone || data.timezone.trim() === "") {
          ctx.addIssue({ path: ["timezone"], code: z.ZodIssueCode.custom, message: "Timezone is required" });
        }
        if (!data.logo || data.logo.length === 0) {
          ctx.addIssue({ path: ["logo"], code: z.ZodIssueCode.custom, message: "Logo is required" });
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
  
    // Watch the setupType field to conditionally render form fields
    const setupType = watch("setupType");
  
    // Handle form submit
    const submitForm = async (values) => {
      console.log('values', values)
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
          const phoneCountry = dropdowns.countryList?.find((country) => country.id === values.phoneCountryId)
          const callingCode = phoneCountry?.callingCode
          formData.append("phoneCountryId", values.phoneCountryId);
          formData.append("phoneIdentifier", values.phone);
          formData.append("phone", '+' + callingCode + values.phone);
        }
  
        await RestApi.post("/api/v1/initial-setup", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setShowModal(false);
        await getAuthUserInfo(setLoading)
  
        toaster('Initial setup completed successfully', 'success');
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Documents </h4>
          <ButtonTw onClick={() => setShowModal(true)} variant="blue" size="sm" className="mt-2"><i className="fa-solid fa-plus"></i>Add New</ButtonTw>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-center">Sl.</th>
                <th>Documents Type</th>
                <th>Document</th>
                <th>Uploaded At</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center">01</td>
                <td>Educational Certificate</td>
                <td><a href="#" download={true}><i className="fa-solid fa-file"></i></a></td>
                <td>05 February 2025</td>
                <td>
                  <div className="action">
                    <button type="button" className="btn-action"><i className="fa-regular fa-pen-to-square"></i></button>
                    <button type="button" className="btn-action hover:text-red-600"><i className="fa-regular fa-trash-can"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </>
  );
};

export default DocumentsTab;