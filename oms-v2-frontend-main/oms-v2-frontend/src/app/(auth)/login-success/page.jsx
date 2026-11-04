"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/common/Loading";
import Head from "next/head";

const LoginSuccessPage = () => {
  const [isLoading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This code runs only on the client
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');
    if (token) {
      localStorage.setItem("token", token);
      localStorage.removeItem("isLoggedOut");
      router.push("/main-dashboard");
    }
    setLoading(false);
  }, [router]);

  return (
    <>
      <Head>
        <title>Login Success | MyApp</title>
        <meta name="description" content="Login to your MyApp account" />
      </Head>
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-center mt-10 lg:mt-0">
          <div className="max-w-[1066px] w-full mx-auto flex flex-col lg:flex-row overflow-hidden ">
            <h1>Login Success. Redirecting...</h1>
            {isLoading ? <Loading /> : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginSuccessPage;