import MyProfile from "@/features/my-profile/MyProfile";
import { Suspense } from "react";

export const metadata = {
  title: "Company Profile | Sanzio",
  description: "View and update your company profile information.",
};

const ProfilePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyProfile />
    </Suspense>
  );
};

export default ProfilePage;
