"use client";
import TabContent from "@/components/ui/TabContent";
import TabItem from "@/components/ui/TabItem";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const ProfileLeftSide = () => {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

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

  const [activeTab, setActiveTab] = useState(OVERVIEW_TAB_LIST[0].key);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
  }, [copied]);

  return (
    <>
      <div className="xs:w-full profile-card">
        <div className="lg:w-[440px]">
          {/* Profile info */}
          <div className="flex flex-row">
            <div className="">
              <Image
                src={
                  user?.profile?.profilePicture?.fileUrl ||
                  "/assets/icons/avatar.png"
                }
                alt="Profile"
                width={100}
                height={100}
                className="rounded-lg"
              />
            </div>
            <div className="flex flex-col ml-4 site-font-size">
              <p className=" text-gray-600 dark:text-gray-500">
                <span className="font-bold">Name:</span>{" "}
                {user?.fullName || "N/A"}
              </p>
              <p className=" text-gray-600 dark:text-gray-500">
                <span className="font-bold">ID:</span> {user?.fullName || "N/A"}
              </p>
              <p className=" text-gray-600 dark:text-gray-500">
                <span className="font-bold">Supervisor:</span>{" "}
                {user?.fullName || "N/A"}
              </p>
              <p className=" text-gray-600 dark:text-gray-500">
                <span className="font-bold">Attendance:</span>{" "}
                {user?.fullName || "N/A"}
              </p>
              <p className=" text-gray-600 dark:text-gray-500">
                <span className="font-bold">Leave:</span>{" "}
                {user?.fullName || "N/A"}
              </p>
            </div>
          </div>

          {/* Overview Tabs */}
          <div className="flex flex-row border rounded-md">
            <div className="flex flex-col w-[127px] 2xl:w-[280px] border rounded-l-md">
              <ul className="list-none w-full my-3 flex flex-col gap-[6px]">
                {OVERVIEW_TAB_LIST.map((tab) => (
                  <li className="w-full" key={tab.key}>
                    {/* <button onClick={() => setActiveTab(tab.key)} className={`flex flex-row items-center gap-2 cursor-pointer btn hover:bg-blue-300 dark:hover:text-gray-700 font-bold leading-[16px] py-[15px] px-[10px] rounded-none text-[12px] 2xl:text-[16px] w-full ${activeTab === tab.key
                                                ? "bg-blue-200 text-gray-700"
                                                : "bg-white text-gray-700 dark:bg-theme-dark dark:text-gray-500"
                                            }`}>
                                            <span dangerouslySetInnerHTML={{ __html: tab.icon }} />
                                            <span>{tab.label}</span>
                                        </button> */}

                    <TabItem
                      active={activeTab === tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className="py-[10px] "
                    >
                      <span dangerouslySetInnerHTML={{ __html: tab.icon }} />
                      <span>{tab.label}</span>
                    </TabItem>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative w-full">
              <TabContent
                className={`flex flex-col w-full p-[10px]`}
                active={activeTab === "quickview"}
              >
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-row min-w-[141px] 2xl:w-full items-center gap-[6px] p-2 2xl:gap-[12px] 2xl:px-4 border rounded-lg text-[10px] 2xl:text-[16px]">
                    {/* <i className="fa-solid fa-gear text-[20px] bg-blue-100 p-1 rounded-sm text-gray-600"></i> */}
                    <span className=" text-[20px] bg-blue-100 p-1 rounded-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 2xl:size-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <span className="text-gray-700 dark:text-gray-400 font-bold">
                        Serving
                      </span>
                      <span className="text-gray-500">8 years 10 Months</span>
                    </div>
                  </div>

                  <div className="flex flex-row min-w-[141px] 2xl:w-full items-center gap-[6px] p-2 2xl:gap-[12px] 2xl:px-4 border rounded-lg text-[10px] 2xl:text-[16px]">
                    {/* <i className="fa-solid fa-gear text-[20px] bg-red-100 p-1 rounded-sm text-gray-600"></i> */}
                    <span className=" text-[20px] bg-red-100 p-1 rounded-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 2xl:size-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12"
                        />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <span className="text-gray-700 dark:text-gray-400 font-bold">
                        Promotions
                      </span>
                      <span className="text-gray-500">5 Times</span>
                    </div>
                  </div>

                  <div className="flex flex-row min-w-[141px] 2xl:w-full items-center gap-[6px] p-2 2xl:gap-[12px] 2xl:px-4 border rounded-lg text-[10px] 2xl:text-[16px]">
                    {/* <i className="fa-solid fa-gear text-[20px] bg-amber-100 p-1 rounded-sm text-gray-600"></i> */}
                    <span className=" text-[20px] bg-amber-100 p-1 rounded-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 2xl:size-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5"
                        />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <span className="text-gray-700 dark:text-gray-400 font-bold">
                        Salary Update
                      </span>
                      <span className="text-gray-500">1 year Ago</span>
                    </div>
                  </div>

                  <div className="flex flex-row min-w-[141px] 2xl:w-full items-center gap-[6px] p-2 2xl:gap-[12px] 2xl:px-4 border rounded-lg text-[10px] 2xl:text-[16px]">
                    {/* <i className="fa-solid fa-gear text-[20px] bg-violet-100 p-1 rounded-sm text-gray-600"></i> */}
                    <span className=" text-[20px] bg-violet-100 p-1 rounded-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 2xl:size-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <span className="text-gray-700 dark:text-gray-400 font-bold">
                        Salary Grade
                      </span>
                      <span className="text-gray-500">A</span>
                    </div>
                  </div>
                </div>
              </TabContent>

              <TabContent
                className={`flex flex-col w-full p-[10px]`}
                active={activeTab === "performance"}
              >
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-row min-w-[141px] 2xl:w-full items-center gap-[6px] p-2 2xl:gap-[12px] 2xl:px-4 border rounded-lg text-[10px] 2xl:text-[16px]">
                    {/* <i className="fa-solid fa-gear text-[20px] bg-blue-100 p-1 rounded-sm text-gray-600"></i> */}
                    <span className=" text-[20px] bg-blue-100 p-1 rounded-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 2xl:size-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <span className="text-gray-700 dark:text-gray-400 font-bold">
                        Serving
                      </span>
                      <span className="text-gray-500">8 years 10 Months</span>
                    </div>
                  </div>

                  <div className="flex flex-row min-w-[141px] 2xl:w-full items-center gap-[6px] p-2 2xl:gap-[12px] 2xl:px-4 border rounded-lg text-[10px] 2xl:text-[16px]">
                    {/* <i className="fa-solid fa-gear text-[20px] bg-amber-100 p-1 rounded-sm text-gray-600"></i> */}
                    <span className=" text-[20px] bg-amber-100 p-1 rounded-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 2xl:size-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5"
                        />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <span className="text-gray-700 dark:text-gray-400 font-bold">
                        Salary Update
                      </span>
                      <span className="text-gray-500">1 year Ago</span>
                    </div>
                  </div>
                </div>
              </TabContent>

              <TabContent
                className={`flex flex-col w-full p-[10px]`}
                active={activeTab === "attendance"}
              >
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-row min-w-[141px] 2xl:w-full items-center gap-[6px] p-2 2xl:gap-[12px] 2xl:px-4 border rounded-lg text-[10px] 2xl:text-[16px]">
                    {/* <i className="fa-solid fa-gear text-[20px] bg-amber-100 p-1 rounded-sm text-gray-600"></i> */}
                    <span className=" text-[20px] bg-amber-100 p-1 rounded-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 2xl:size-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5"
                        />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <span className="text-gray-700 dark:text-gray-400 font-bold">
                        Salary Update
                      </span>
                      <span className="text-gray-500">1 year Ago</span>
                    </div>
                  </div>

                  <div className="flex flex-row min-w-[141px] 2xl:w-full items-center gap-[6px] p-2 2xl:gap-[12px] 2xl:px-4 border rounded-lg text-[10px] 2xl:text-[16px]">
                    {/* <i className="fa-solid fa-gear text-[20px] bg-violet-100 p-1 rounded-sm text-gray-600"></i> */}
                    <span className=" text-[20px] bg-violet-100 p-1 rounded-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 2xl:size-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <span className="text-gray-700 dark:text-gray-400 font-bold">
                        Salary Grade
                      </span>
                      <span className="text-gray-500">A</span>
                    </div>
                  </div>
                </div>
              </TabContent>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileLeftSide;
