"use client";
import { Button } from "@/components/ui/button";
import MiniSpinner from "@/shared/loader/MiniSpinner";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import React, { useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import ButtonTw from "@/components/ui/ButtonTw";
import ProfileLeftSide from "./ProfileLeftSide";
import ProfileRightSide from "./ProfileRightSide";

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  console.log("user", user);

  const companyTypes = [
    "IT Services",
    "Finance",
    "Healthcare",
    "Education",
    "Retail",
    "Manufacturing",
    "Other",
  ];

  const submitForm = async (data) => {
    try {
      setLoading(true);

      const sendData = {
        company_name: data.company_name,
        company_type: data.company_type,
        company_email: data.company_email,
        company_size: data.company_size,
        company_contact: data.company_contact,
      };

      console.log("Form data to be submitted:", sendData);
      // API call would go here
      // const response = await fetch('/api/profile', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(sendData),
      // });

      toast.success("Profile information saved successfully!");
      reset();
    } catch (error) {
      toast.error(error.message || "Failed to save profile information");
    } finally {
      setLoading(false);
    }
  };

  const OVERVIEW_TAB_LIST = [
    {
      key: "quickview",
      label: "Quick View",
      icon: `<i className="fa-solid fa-eye"></i>`,
    },
    {
      key: "performance",
      label: "Performance",
      icon: `<i className="fa-solid fa-arrow-trend-up"></i>`,
    },
    {
      key: "attendance",
      label: "Attendance",
      icon: `<i className="fa-solid fa-clock"></i>`,
    },
  ];

  const GENERAL_INFO_TAB_LIST = [
    {
      key: "generalInfo",
      label: "General Info",
      icon: `<i className="fa-solid fa-circle-info"></i>`,
    },
    {
      key: "attendance",
      label: "Attendance",
      icon: `<i className="fa-solid fa-calendar-days"></i>`,
    },
    {
      key: "employeeHistory",
      label: "Employee History",
      icon: `<i className="fa-light fa-file"></i>`,
    },
    {
      key: "workExperience",
      label: "Work Experience & Education",
      icon: `<i className="fa-solid fa-briefcase"></i>`,
    },
    {
      key: "salaryPayroll",
      label: "Salary & Payroll",
      icon: `<i className="fa-solid fa-wallet"></i>`,
    },
    {
      key: "documents",
      label: "Documents",
      icon: `<i className="fa-solid fa-file"></i>`,
    },
    {
      key: "settings",
      label: "Settings",
      icon: `<i className="fa-solid fa-gear"></i>`,
    },
  ];

  const [activeTab, setActiveTab] = useState(OVERVIEW_TAB_LIST[0].key);

  return (
    <div className="mx-auto py-4">
      <h2 className="text-gray-900 dark:text-gray-300 font-bold text-xl mb-4">
        Employee Profile
      </h2>
      {/* form section */}

      <div className="flex flex-row flex-wrap gap-4 mb-4">
        {/* Left section */}
        <ProfileLeftSide />

        {/* right section */}
        <ProfileRightSide />
        {/* <div className="min-w-[411px] sm:w-full flex-1 card">
          <div className="flex flex-col w-[127px] 2xl:w-[280px] border">
            <ul className="list-none w-full my-3 flex flex-col gap-[6px]">

              {OVERVIEW_TAB_LIST.map((tab) => (
                <li className="w-full">
                  <button onClick={() => setActiveTab(tab.key)} className={`flex flex-row items-center gap-2 cursor-pointer btn bg-blue-200 hover:bg-blue-300 text-gray-700 transition-all duration-200 ease-in-out ${activeTab === tab.key
                    ? "bg-blue-200"
                    : "bg-gray-100"
                    } font-bold leading-[16px] py-[15px] px-[10px] rounded-none text-[12px] 2xl:text-[16px] w-full`}>
                    <span dangerouslySetInnerHTML={{ __html: tab.icon }} />
                    <span>{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div> */}
      </div>

      {/* <div className="card">
        <h2 className="text-gray-600 font-bold text-lg my-6">
          Basic Information
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="company_name"
                className="font-bold text-sm text-gray-700"
              >
                Company Name
              </label>
              <input
                type="text"
                id="company_name"
                placeholder="Type Company Name"
                {...register("company_name", {
                  required: "Company name is required",
                  minLength: {
                    value: 2,
                    message: "Company name must be at least 2 characters",
                  },
                })}
                className={`placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 focus:border-primary transition-colors duration-300 bg-white ${errors.company_name ? "border-destructive" : ""
                  }`}
              />
              {errors.company_name && (
                <p className="text-destructive text-xs mt-1">
                  {errors.company_name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="company_type"
                className="font-bold text-sm text-gray-700"
              >
                Company Type
              </label>
              <select
                id="company_type"
                {...register("company_type", {
                  required: "Company type is required",
                })}
                className={`placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 focus:border-primary transition-colors duration-300 bg-white ${errors.company_type ? "border-destructive" : ""
                  }`}
              >
                <option value="">Select Company Type</option>
                {companyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.company_type && (
                <p className="text-destructive text-xs mt-1">
                  {errors.company_type.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="company_email"
                className="font-bold text-sm text-gray-700"
              >
                Company Email
              </label>
              <input
                type="email"
                id="company_email"
                placeholder="Type Email Address"
                {...register("company_email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={`placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 focus:border-primary transition-colors duration-300 bg-white ${errors.company_email ? "border-destructive" : ""
                  }`}
              />
              {errors.company_email && (
                <p className="text-destructive text-xs mt-1">
                  {errors.company_email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="company_size"
                className="font-bold text-sm text-gray-700"
              >
                Company Size
              </label>
              <input
                type="number"
                id="company_size"
                placeholder="Type Company Size"
                {...register("company_size", {
                  required: "Company size is required",
                  min: {
                    value: 1,
                    message: "Company size must be at least 1",
                  },
                  max: {
                    value: 10000,
                    message: "Company size cannot exceed 10,000",
                  },
                })}
                className={`placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 focus:border-primary transition-colors duration-300 bg-white ${errors.company_size ? "border-destructive" : ""
                  }`}
              />
              {errors.company_size && (
                <p className="text-destructive text-xs mt-1">
                  {errors.company_size.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="company_contact"
                className="font-bold text-sm text-gray-700"
              >
                Company Contact Number
              </label>
              <input
                type="tel"
                id="company_contact"
                placeholder="Type Contact Number"
                {...register("company_contact", {
                  required: "Contact number is required",
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: "Please enter a valid phone number (10-15 digits)",
                  },
                })}
                className={`placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 focus:border-primary transition-colors duration-300 bg-white ${errors.company_contact ? "border-destructive" : ""
                  }`}
              />
              {errors.company_contact && (
                <p className="text-destructive text-xs mt-1">
                  {errors.company_contact.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            {isLoading ? (
              <Button
                type="button"
                className="bg-primaryColor hover:bg-primaryColor-700 px-6 md:px-12 text-white py-2  font-bold rounded-sm flex items-center justify-center cursor-not-allowed"
              >
                <MiniSpinner />
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-primaryColor hover:bg-primaryColor-700 px-6 md:px-12 text-white py-2  font-bold rounded-sm cursor-pointer"
              >
                Confirm
              </Button>
            )}

            <Button
              type="button"
              className="cursor-pointer bg-gray-700 px-6 md:px-12"
              onClick={() => reset()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div> */}
    </div>
  );
};

export default Profile;
