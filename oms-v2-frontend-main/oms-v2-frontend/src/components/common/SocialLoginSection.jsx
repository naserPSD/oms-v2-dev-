import { useAuthStore } from "@/store/useAuthStore";
import { socialPopupLogin, toaster } from "@/utils/helpers";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { baseURL } from "@/utils/RestApi";
import { getAuthUserInfo } from "@/utils/commonApiFunction";

const SocialLoginSection = () => {
  const router = useRouter();

  // const loginWithGoogle = () => {
  //   window.location.href = baseURL + '/auth/google/login'; // NestJS endpoint
  // };

  // const loginWithFacebook = () => {
  //   window.location.href = baseURL + '/auth/facebook/login'; // NestJS endpoint
  // };

  const [isLoading, setLoading] = useState(false);

  const handleSocialLogin = async (provider) => {
    try {
      const { data } = await socialPopupLogin(provider, baseURL);
      const { accessToken, tokenType, user } = data;

      const { setAuth } = useAuthStore.getState();
      setAuth({ accessToken, tokenType, user, callLoginApi: true });
      localStorage.setItem("token", accessToken);
      localStorage.removeItem("isLoggedOut");
      await getAuthUserInfo(setLoading);

      toaster("You are logged in successfully");
      router.push("/main-dashboard");
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  return (
    <>
      <div className="flex justify-center gap-6 mb-4">
        <button
          onClick={() => handleSocialLogin("facebook")}
          className="cursor-pointer flex items-center gap-2 border bg-gray-100 border-gray-300 p-2 rounded-full hover:bg-gray-100"
        >
          <Image
            src="/assets/icons/Facebook-logo.png"
            alt="Facebook"
            width={40}
            height={40}
            className="hover:scale-110 transition-transform duration-200"
          />
        </button>
        <button
          onClick={() => handleSocialLogin("google")}
          className="cursor-pointer flex items-center gap-2 border bg-gray-100 border-gray-300 p-2 rounded-full hover:bg-gray-100"
        >
          <Image
            src="/assets/icons/google-logo.png"
            alt="Google"
            width={40}
            height={40}
            className="hover:scale-110 transition-transform duration-200"
          />
        </button>
        {/* <button onClick={loginWithGoogle} className="cursor-pointer flex items-center gap-2 border bg-gray-100 border-gray-300 p-2 rounded-full hover:bg-gray-100">
                        <Image
                          src="/assets/icons/google-logo.png"
                          alt="Google"
                          width={40}
                          height={40}
                          className="hover:scale-110 transition-transform duration-200"
                        />
                      </button> */}
      </div>
    </>
  );
};

export default SocialLoginSection;
