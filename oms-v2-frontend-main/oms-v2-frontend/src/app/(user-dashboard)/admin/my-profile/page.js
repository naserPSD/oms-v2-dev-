import MyProfile from "@/features/my-profile/MyProfile";
import { Suspense } from "react";

export const metadata = {
  title: "My Profile | Sanzio",
  description: "View and update your admin profile.",
};

const AdminProfilePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyProfile />
    </Suspense>
  );
};

export default AdminProfilePage;
