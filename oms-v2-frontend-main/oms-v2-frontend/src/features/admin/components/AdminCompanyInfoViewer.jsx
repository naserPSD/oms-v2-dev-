"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  ExternalLink,
  Info,
  Clock,
  Briefcase,
  Users,
} from "lucide-react";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { fetchCompanyInfo } from "@/services/companySettingsApi";
import { fetchOffice } from "@/services/hrServiceApi";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCompanyInfoViewer() {
  const { data: companyResponse, isLoading: isCompanyLoading } = useQuery({
    queryKey: ["company-Info"],
    queryFn: () => fetchCompanyInfo(),
    staleTime: 5 * 60 * 1000,
  });

  const { servicesQuery } = useCompanySettingsQueryApi({});
  const { data: servicesResponse } = servicesQuery({ page: 1, limit: 10 });

  const officeParams = useMemo(() => ({ page: 1, limit: 10 }), []);
  const { data: officesResponse } = useQuery({
    queryKey: ["office", officeParams],
    queryFn: () => fetchOffice(officeParams),
    staleTime: 5 * 60 * 1000,
  });

  const company = useMemo(() => {
    const raw =
      companyResponse?.data?.data ||
      companyResponse?.data ||
      companyResponse;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
    if (Array.isArray(raw) && raw.length > 0) return raw[0];
    return raw || {};
  }, [companyResponse]);

  const offices = useMemo(() => {
    return officesResponse?.data || [];
  }, [officesResponse]);

  const services = useMemo(() => {
    return servicesResponse?.data || [];
  }, [servicesResponse]);

  if (isCompanyLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-60 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
        </div>
      </div>
    );
  }

  const logoUrl =
    company?.companyLogoMedia?.fileUrl ||
    company?.logoMedia?.fileUrl ||
    company?.logo ||
    null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Super Admin Notice Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300">
        <Info className="w-5 h-5 shrink-0 text-amber-500" />
        <div className="text-sm">
          <span className="font-semibold">Super Admin View Mode:</span> You are viewing the tenant company profile information. Company configuration is kept out of the main navigation sidebar to maintain a dedicated administrative focus.
        </div>
      </div>

      {/* Main Header / Card */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-xs">
        <div className="h-32 bg-linear-to-r from-blue-600 via-indigo-600 to-amber-500 opacity-90" />
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12">
          <div className="flex items-end gap-4">
            <div className="relative w-24 h-24 rounded-2xl border-4 border-white dark:border-[#111827] bg-white dark:bg-gray-800 shadow-md flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={company?.name || "Company Logo"}
                  width={96}
                  height={96}
                  className="object-contain w-full h-full p-1"
                />
              ) : (
                <Building2 className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {company?.name || "Company Name Unavailable"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Active Tenant
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Application ID #{company?.id || "N/A"} • Registered Company
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700/60">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>
              Member since:{" "}
              {company?.createdAt
                ? new Date(company.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Active"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white font-semibold">
              <Mail className="w-4 h-4 text-blue-500" />
              <h3>Contact Details</h3>
            </div>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Official Email</p>
                  <a
                    href={`mailto:${company?.email || ""}`}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block"
                  >
                    {company?.email || "No email provided"}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Phone Number</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {company?.phone || "No phone provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Website</p>
                  {company?.websiteUrl ? (
                    <a
                      href={company.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      {company.websiteUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-gray-500">Not set</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Physical Address</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {company?.address || "No physical address provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Profile */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white font-semibold">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              <h3>Business Profile</h3>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-gray-400">Company Type</p>
                <div className="mt-1 inline-block px-3 py-1 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                  {company?.type?.name || "Corporate Enterprise"}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400">Organization Scale</p>
                <div className="mt-1 inline-block px-3 py-1 rounded-md text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
                  {company?.size?.name || "Small & Medium Business (SMB)"}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400">Total Offices Registered</p>
                <p className="mt-1 font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {offices.length} Branch / Location{offices.length === 1 ? "" : "s"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Configured Services</p>
                <p className="mt-1 font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gray-400" />
                  {services.length} Product & Service Categories
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Presence & Connectivity */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white font-semibold">
              <Users className="w-4 h-4 text-pink-500" />
              <h3>Social & Media Links</h3>
            </div>
            <div className="space-y-3">
              {company?.facebookUrl ? (
                <a
                  href={company.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-sm">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                      <FaFacebookF />
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">Facebook</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              ) : null}

              {company?.linkedinUrl ? (
                <a
                  href={company.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-sm">
                    <span className="w-7 h-7 rounded-full bg-sky-700 text-white flex items-center justify-center text-xs">
                      <FaLinkedinIn />
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">LinkedIn</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              ) : null}

              {company?.instagramUrl ? (
                <a
                  href={company.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-sm">
                    <span className="w-7 h-7 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs">
                      <FaInstagram />
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">Instagram</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              ) : null}

              {company?.youtubeUrl ? (
                <a
                  href={company.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-sm">
                    <span className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                      <FaYoutube />
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">YouTube</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              ) : null}

              {!company?.facebookUrl &&
                !company?.linkedinUrl &&
                !company?.instagramUrl &&
                !company?.youtubeUrl && (
                  <p className="text-xs text-gray-400 italic py-4 text-center">
                    No social media profiles linked for this company.
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
