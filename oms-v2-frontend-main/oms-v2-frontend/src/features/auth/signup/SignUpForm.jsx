import React, { useEffect, useState } from "react";
import MiniSpinner from "@/shared/loader/MiniSpinner";
import { FaAnglesRight } from "react-icons/fa6";
import { useForm, useWatch } from "react-hook-form";
import { FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import Input from "@/components/ui/Input";
import Loading from "@/components/common/Loading";
import { z } from 'zod';
import { zodResolver } from '@/utils/zodResolver';
const SignUpForm = ({ submitForm, isSubmitting, isLoading }) => {
  // const {
  //   register,
  //   handleSubmit,
  //   control,
  //   formState: { errors },
  // } = useForm();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });


  const [isPasswordShow, setPasswordShow] = useState(false);
  const [requirements, setRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  // Watch the password field to update requirements

  useEffect(() => {
    if (password) {
      setRequirements({
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      });
    } else {
      setRequirements({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
    }
  }, [password]);

  // Password validation rules
  const passwordValidation = {
    required: "Password is required!",
    minLength: {
      value: 8,
      message: "Must be at least 8 characters",
    },
    validate: {
      hasUpperCase: (value) =>
        /[A-Z]/.test(value) || "Must contain at least one uppercase letter",
      hasLowerCase: (value) =>
        /[a-z]/.test(value) || "Must contain at least one lowercase letter",
      hasNumber: (value) =>
        /[0-9]/.test(value) || "Must contain at least one number",
      hasSpecialChar: (value) =>
        /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
        "Must contain at least one special character",
    },
  };
  return (
    <>
      {isSubmitting || isLoading ? (
        <Loading />
      ) : null}
      <form className="space-y-1.5" onSubmit={handleSubmit(submitForm)}>

        <Input
          id="firstName"
          name="firstName"
          label="First Name"
          type="text"
          placeholder="Enter your first name"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register("firstName")}
        />

        <Input
          id="lastName"
          name="lastName"
          label="Last Name"
          type="text"
          placeholder="Enter your last name"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register("lastName")}
        />

        <Input
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          id="password"
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Enter your confirm Password"
          autoComplete="current-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", passwordValidation)}
        />

        {/* First Name */}
        {/* <div>
          <label htmlFor="first_name" className="font-bold text-sm text-gray-700">
            First Name
          </label>
          <input
            id="first_name"
            type="text"
            placeholder="Enter Your Full Name"
            {...register("first_name", {
              required: "Full name is required",
            })}
            className={`placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 bg-white ${errors.first_name ? "border-destructive" : ""
              }`}
          />
          {errors.first_name && (
            <span className="text-xs text-destructive">
              {errors.first_name.message}
            </span>
          )}
        </div>
        <div>
          <label htmlFor="last_name" className="font-bold text-sm text-gray-700">
            Last Name
          </label>
          <input
            id="last_name"
            type="text"
            placeholder="Enter Your Full Name"
            {...register("last_name", {
              required: "Full name is required",
            })}
            className={`placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 bg-white ${errors.last_name ? "border-destructive" : ""
              }`}
          />
          {errors.last_name && (
            <span className="text-xs text-destructive">
              {errors.last_name.message}
            </span>
          )}
        </div> */}

        {/* Email */}
        {/* <div>
          <label htmlFor="email" className="font-bold text-sm text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter Your Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email",
              },
            })}
            className={`placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 bg-white ${errors.email ? "border-destructive" : ""
              }`}
          />
          {errors.email && (
            <span className="text-xs text-destructive">
              {errors.email.message}
            </span>
          )}
        </div> */}

        {/* Mobile Number */}
        {/* <div>
          <label htmlFor="mobile" className="font-bold text-sm text-gray-700">
            Mobile Number
          </label>
          <input
            id="mobile"
            type="text"
            placeholder="Enter Mobile Number"
            {...register("mobile", {
              required: "Mobile number is required",
              pattern: {
                value: /^(?:\+88|88)?(01[3-9]\d{8})$/,
                message: "Enter a valid mobile number",
              },
            })}
            className={`placeholder:text-gray-400  bg-white border rounded-sm outline-none px-4 w-full mt-1 py-2 ${
              errors.mobile ? "border-destructive" : ""
            }`}
          />
          {errors.mobile && (
            <span className="text-xs text-destructive">
              {errors.mobile.message}
            </span>
          )}
        </div> */}

        {/*  Password Input */}
        <div>
          <label className="font-bold text-sm text-gray-700">Password</label>
          <div className="relative">
            <input
              type={isPasswordShow ? "text" : "password"}
              placeholder="Enter Your Password"
              {...register("user_password", passwordValidation)}
              className={`bg-white placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 focus:border-primary transition-colors duration-300 ${errors.user_password ? "border-red-500" : "border-gray-300"
                }`}
            />
            <span
              onClick={() => setPasswordShow(!isPasswordShow)}
              className="absolute end-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
            >
              {isPasswordShow ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
            </span>
          </div>
          {errors.user_password && (
            <div className="text-xs text-red-500 mt-1 space-y-1">
              <p>{errors.user_password.message}</p>
            </div>
          )}
        </div>
        {/* Retype Password Input */}
        <div>
          <label className="font-bold text-sm text-gray-700">
            Retype Password
          </label>
          <div className="relative">
            <input
              type={isPasswordShow ? "text" : "password"}
              placeholder="Retype Password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className={`bg-white placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 focus:border-primary transition-colors duration-300 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
            />
            <span
              onClick={() => setPasswordShow(!isPasswordShow)}
              className="absolute end-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
            >
              {isPasswordShow ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
            </span>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        {/* Password Requirements */}
        <div className="text-sm text-gray-500 space-y-1 mb-4">
          <ul className="flex flex-col gap-1">
            <li
              className={`flex items-center gap-2 ${requirements.minLength ? "text-green-500" : ""
                }`}
            >
              {requirements.minLength ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaAnglesRight />
              )}
              Minimum 8 characters
            </li>
            <li
              className={`flex items-center gap-2 ${requirements.hasUpperCase ? "text-green-500" : ""
                }`}
            >
              {requirements.hasUpperCase ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaAnglesRight />
              )}
              At least one uppercase letter (A-Z)
            </li>
            <li
              className={`flex items-center gap-2 ${requirements.hasLowerCase ? "text-green-500" : ""
                }`}
            >
              {requirements.hasLowerCase ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaAnglesRight />
              )}
              At least one lowercase letter (a-z)
            </li>
            <li
              className={`flex items-center gap-2 ${requirements.hasNumber ? "text-green-500" : ""
                }`}
            >
              {requirements.hasNumber ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaAnglesRight />
              )}
              At least one number (0-9)
            </li>
            <li
              className={`flex items-center gap-2 ${requirements.hasSpecialChar ? "text-green-500" : ""
                }`}
            >
              {requirements.hasSpecialChar ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaAnglesRight />
              )}
              At least one special character (e.g., !, @, #, $, etc.)
            </li>
          </ul>
        </div>

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
            Sign Up
          </button>
        )}
      </form>
    </>
  );
};

export default SignUpForm;
