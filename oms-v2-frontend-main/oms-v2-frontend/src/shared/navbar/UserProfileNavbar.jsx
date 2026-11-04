"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Bell, Settings, ChevronDown, Menu, X } from "lucide-react";
import { FaCheck, FaEdit, FaEyeSlash, FaPlus } from "react-icons/fa";
import { HiOutlineDuplicate } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

const UserProfileNavbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex items-center justify-between bg-white rounded-sm p-2.5 px-4 md:px-6 shadow-sm border border-b-gray-200 mx-auto">
      {/* Left Section - Logo + Title (Always visible) */}
      <Link href={"/"} className="inline-flex items-center gap-3">
        <div className="border-4 border-lightBorder rounded-full w-10 h-10 md:w-12 md:h-12 relative">
          <Image
            src="/assets/images/paint.png"
            alt="Logo"
            fill
            className="rounded-full w-full object-cover bg-white"
          />
        </div>
        <div className="hidden sm:block">
          <h3 className="font-bold text-gray-700 text-sm md:text-base">
            <span className="text-secondaryColor">Sanzio</span>
          </h3>
          <h5 className="text-xs text-gray-400">Office Management Sysetm</h5>
        </div>
      </Link>

      {/* Middle Section - User Info + Time (Hidden on mobile) */}
      <div className="hidden md:flex flex-col items-start justify-center">
        <div className="flex items-center gap-3">
          <Image
            src="/assets/icons/avatar.png"
            alt="User"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-bold text-black">User XYZ</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
          <div>
            <p className="text-pink-500 font-bold ml-4">12:05 AM</p>
            <p className="text-xs text-gray-500 ml-4">Wednesday, 01 January</p>
          </div>
        </div>
      </div>

      {/* Right Section - Desktop Buttons + Icons (Hidden on mobile) */}
      <div className="hidden md:flex items-center gap-4">
        <button className="cursor-pointer flex items-center gap-2 text-sm text-gray-600 font-bold px-2 py-1 rounded  group hover:text-gray-800 ">
          <span className="secondaryColor-light group-hover:bg-cyan-600 text-white rounded-full size-5 flex items-center justify-center">
            <FaPlus size={12} />
          </span>
          Add requisitions
        </button>
        <button
          className="flex items-center gap-2 text-sm border border-gray-600 px-5 py-1.5 hover:bg-gray-100 rounded-2xl text-gray-600 cursor-pointer font-bold"
          variant={"outline"}
        >
          <FaEdit size={14} />
          Add notes
        </button>

        <Popover>
          <PopoverTrigger className="p-1 rounded relative mr-1 cursor-pointer">
            <Bell size={20} className="text-gray-700 hover:text-gray-900" />
            <span className="absolute top-0 right-0 bg-red-500 rounded-full h-2 w-2"></span>
          </PopoverTrigger>
          <PopoverContent className="w-72 sm:w-96">
            <div className="p-3 pb-5 flex justify-between">
              <h5 className="text-xl font-bold">Notification (1)</h5>
              <h5 className="text-primary">Mark all as read</h5>
            </div>
            <div className="max-h-72 overflow-y-auto">
              <div className="flex items-start gap-2 border-b border-gray-200 pb-2">
                <div className="rounded-full bg-gray-200 h-8 w-8 flex items-center justify-center">
                  <FaCheck className="text-green-500" size={12} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Order 12345 ready to ship</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2 border-b border-gray-200 py-2">
                <div className="rounded-full bg-gray-200 h-8 w-8 flex items-center justify-center">
                  <FaEyeSlash className="text-red-500" size={12} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Stock update failed</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2 border-b border-gray-200 py-2">
                <div className="rounded-full bg-gray-200 h-8 w-8 flex items-center justify-center">
                  <FaPlus className="text-gray-700" size={12} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">New order received</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Settings
          size={20}
          className="text-gray-700 cursor-pointer hover:text-gray-800 hover:animate-spin "
        />
        <HiOutlineDuplicate
          size={20}
          className="text-gray-700 hover:text-gray-800 cursor-pointer"
        />
        <ChevronDown size={20} className="text-gray-700 cursor-pointer" />
      </div>

      {/* Mobile Menu Button (Visible only on mobile) */}
      <div className="flex md:hidden items-center gap-3">
        <Popover>
          <PopoverTrigger className="p-1 rounded relative cursor-pointer">
            <Bell size={20} className="text-gray-700" />
            <span className="absolute top-0 right-0 bg-red-500 rounded-full h-2 w-2"></span>
          </PopoverTrigger>
          <PopoverContent className="w-72 sm:w-96">
            <div className="py-3 pb-5 flex justify-between">
              <h5 className="text-lg text-gray-800 md:text-xl  font-bold whitespace-nowrap">
                Notification (1)
              </h5>
              <h5 className="text-primary text-sm">Mark all as read</h5>
            </div>

            <div className="max-h-72 overflow-y-auto">
              <div className="flex items-start gap-2 border-b border-gray-200 pb-2">
                <div className="rounded-full bg-gray-200 h-8 w-8 flex items-center justify-center">
                  <FaCheck className="text-green-500" size={12} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Order 12345 ready to ship</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2 border-b border-gray-200 py-2">
                <div className="rounded-full bg-gray-200 h-8 w-8 flex items-center justify-center">
                  <FaEyeSlash className="text-red-500" size={12} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Stock update failed</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2 border-b border-gray-200 py-2">
                <div className="rounded-full bg-gray-200 h-8 w-8 flex items-center justify-center">
                  <FaPlus className="text-gray-700" size={12} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">New order received</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Settings size={20} className="text-gray-700 cursor-pointer" />
        <HiOutlineDuplicate
          size={20}
          className="text-gray-700 cursor-pointer"
        />

        <button
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 text-gray-700 focus:outline-none cursor-pointer"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 right-0 left-0 bg-white shadow-lg border-t border-gray-200 z-50 p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3 border-b pb-4">
              <Image
                src="/assets/icons/avatar.png"
                alt="User"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-bold text-black">User XYZ</p>
                <p className="text-xs text-gray-500">Super Admin</p>
                <p className="text-xs text-pink-500">12:05 AM</p>
              </div>
            </div>

            <button className="flex items-center gap-2 text-sm cursor-pointer text-gray-600 font-bold px-4 py-2 rounded hover:bg-gray-100">
              <span className="secondaryColor-light text-white rounded-full size-5 flex items-center justify-center">
                <FaPlus size={12} />
              </span>
              Add requisitions 
            </button>

            <Button
              className="flex items-center gap-2 text-sm border border-gray-300 px-4 py-2 hover:bg-gray-100 rounded-2xl text-gray-600 justify-start cursor-pointer"
              variant={"outline"}
            >
              <FaEdit size={14} />
              Add notes
            </Button>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-xs text-gray-500">Wednesday, 01 January</p>
              <ChevronDown size={18} className="text-gray-700" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileNavbar;
