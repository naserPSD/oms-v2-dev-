import React from "react";
import { AdminGuard } from "@/utils/AdminGuard";

export const metadata = {
  title: "Admin Portal | OMS Sanzio",
  description: "Administrative console and management portal",
};

export default function AdminLayout({ children }) {
  return <AdminGuard>{children}</AdminGuard>;
}
