"use client";
import { Button } from "@/components/ui/button";
import MiniSpinner from "@/shared/loader/MiniSpinner";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import React, { useState } from "react";

const Profile = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [isLoading, setLoading] = useState(false);

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

  return (
    <div className="max-w-6xl mx-auto w-[95%] py-10">
      <h2 className="text-gray-900 font-bold text-xl mb-1">
        Please provide your basic information to get started.
      </h2>
      <p className="text-gray-600 mb-6">
        Enter your company name, company type, company email, company size,
        company contact number. Make sure all the details are correct, as this
        information will help us create your account and provide a better
        experience.
      </p>

      {/* form section */}
      <div className="bg-white shadow-sm rounded-[6px] p-4 md:p-10">
        <h2 className="text-gray-600 font-bold text-lg my-6">
          Basic Information
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
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
                className={`placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 focus:border-primary transition-colors duration-300 bg-white ${
                  errors.company_name ? "border-destructive" : ""
                }`}
              />
              {errors.company_name && (
                <p className="text-destructive text-xs mt-1">
                  {errors.company_name.message}
                </p>
              )}
            </div>

            {/* Company Type */}
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
                className={`placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 focus:border-primary transition-colors duration-300 bg-white ${
                  errors.company_type ? "border-destructive" : ""
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

            {/* Company Email */}
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
                className={`placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 focus:border-primary transition-colors duration-300 bg-white ${
                  errors.company_email ? "border-destructive" : ""
                }`}
              />
              {errors.company_email && (
                <p className="text-destructive text-xs mt-1">
                  {errors.company_email.message}
                </p>
              )}
            </div>

            {/* Company Size */}
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
                className={`placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 focus:border-primary transition-colors duration-300 bg-white ${
                  errors.company_size ? "border-destructive" : ""
                }`}
              />
              {errors.company_size && (
                <p className="text-destructive text-xs mt-1">
                  {errors.company_size.message}
                </p>
              )}
            </div>

            {/* Company Contact Number - col-span-2 */}
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
                className={`placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 focus:border-primary transition-colors duration-300 bg-white ${
                  errors.company_contact ? "border-destructive" : ""
                }`}
              />
              {errors.company_contact && (
                <p className="text-destructive text-xs mt-1">
                  {errors.company_contact.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit and Cancel Button */}
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
      </div>
    </div>
  );
};

export default Profile;
