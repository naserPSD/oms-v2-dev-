// /tabs/GeneralInfoTab.jsx
"use client";
import ButtonTw from "@/components/ui/ButtonTw";
import { useAuthStore } from "@/store/useAuthStore";
import { useCommonStore } from "@/store/useCommonStore";
import helpers from "@/utils/helpers";
import { useState } from "react";

import AddProfilePersonalInfoModal from "@/features/profile/tabs/modals/AddProfilePersonalInfoModal";
import AddProfileContactInfoModal from "@/features/profile/tabs/modals/AddProfileContactInfoModal";
import AddLanguageModal from "@/features/my-profile/tabs/modals/AddLanguageModal";

const GeneralInfo = () => {
  const user = useAuthStore((state) => state.user);
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const [openModalName, setOpenModalName] = useState("");

  const languageProficienciesList =
    user?.userLanguageProficiencies ||
    user?.languageProficiencies ||
    user?.languageTable ||
    [];

  const getLanguageLabel = (item) => {
    if (item?.languageName) return item.languageName;
    if (item?.language) {
      return typeof item.language === "object"
        ? item.language.language || item.language.name || "—"
        : item.language;
    }
    if (item?.languageId) {
      const match = dropdowns?.countryList?.find(
        (c) => String(c.id) === String(item.languageId)
      );
      if (match?.language) return match.language;
      if (match?.name) return match.name;
    }
    return "—";
  };

  const getProficiencyLabel = (levelName, levelId, fallbackVal) => {
    if (levelName) return levelName;
    if (fallbackVal && typeof fallbackVal === "string") return fallbackVal;
    if (levelId) {
      const statuses = dropdowns?.statusGroupList?.find(
        (g) => g.code === "proficiency_levels"
      )?.statuses;
      const match = statuses?.find((s) => String(s.id) === String(levelId));
      if (match?.name) return match.name;
    }
    return "—";
  };



  return (
    <>
      <div className="card mt-6">
        <div className="card-header items-center justify-between">
          <h4 className="card-title title-color">Personal Information</h4>
          {/* <ButtonTw
            onClick={() => setOpenModalName("personalInfo")}
            variant="blue"
            className="gap-2"
          >
            <i className="fa-solid fa-pen-to-square"></i>Edit
          </ButtonTw> */}

          {!user?.profileCompleted && (
            <ButtonTw
              onClick={() => setOpenModalName("personalInfo")}
              variant="blue"
              className="gap-2"
            >
              <i className="fa-solid fa-pen-to-square"></i>Edit
            </ButtonTw>
          )}
        </div>

        <AddProfilePersonalInfoModal
          showModal={openModalName === "personalInfo"}
          onClose={() => setOpenModalName("")}
        />

        <div className="my-3">
          <div className="px-4 py-2 space-y-3 text-gray-600 dark:text-gray-500">
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Name :</span>
              <span className="basis-3/5">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Father’s Name :</span>
              <span className="basis-3/5">{user?.profile?.fathersName}</span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Mothers Name :</span>
              <span className="">{user?.profile?.mothersName}</span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Date of Birth :</span>
              <span className="basis-3/5">
                {helpers.dDate(user?.profile?.dateOfBirth)}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">
                NID / Passport Number :
              </span>
              <span className="basis-3/5">
                {user?.profile?.nidNumber}
                {user?.profile?.passportNumber && <span> / </span>}
                {user?.profile?.passportNumber}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Nationality:</span>
              <span className="basis-3/5">
                {user?.profile?.country?.citizenship}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Gender :</span>
              <span className="basis-3/5">{user?.profile?.gender}</span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Religion :</span>
              <span className="basis-3/5">{user?.profile?.religionName}</span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Blood Group :</span>
              <span className="basis-3/5">{user?.profile?.bloodGroupName}</span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Marital Status :</span>
              <span className="basis-3/5">
                {user?.profile?.maritalStatusName}
              </span>
            </div>

            {/* <div className="flex flex-col w-1/2 space-y-3 border border-dashed rounded p-3">
                            <div className="flex flex-row justify-around">
                                <span className="font-bold basis-5/6">Language :</span>
                                <span className="basis-1/6">A+</span>
                            </div>
                            <div className="flex flex-row">
                                <span className="font-bold basis-5/6">Proficiency :</span>
                                <span className="basis-1/6">High</span>
                            </div>
                        </div> */}
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-header items-center justify-between">
          <h4 className="card-title title-color">Language Proficiencies</h4>
          <ButtonTw
            onClick={() => setOpenModalName("languageProficiency")}
            variant="blue"
            className="gap-2"
          >
            <i className="fa-solid fa-pen-to-square"></i>Edit
          </ButtonTw>
        </div>

        <AddLanguageModal
          showModal={openModalName === "languageProficiency"}
          onClose={() => setOpenModalName("")}
        />

        <div className="table-container mt-2">
          <table className="table">
            <thead>
              <tr>
                <th className="text-center">Sl.</th>
                <th>Language</th>
                <th>Speaking</th>
                <th>Reading</th>
                <th>Writing</th>
              </tr>
            </thead>
            <tbody>
              {languageProficienciesList?.length > 0 ? (
                languageProficienciesList.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="text-center">{index + 1}</td>
                    <td>{getLanguageLabel(item)}</td>
                    <td>
                      {getProficiencyLabel(
                        item.speakingLevelName,
                        item.speakingLevelId,
                        item.speaking
                      )}
                    </td>
                    <td>
                      {getProficiencyLabel(
                        item.readingLevelName,
                        item.readingLevelId,
                        item.reading
                      )}
                    </td>
                    <td>
                      {getProficiencyLabel(
                        item.writingLevelName,
                        item.writingLevelId,
                        item.writing
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No language proficiency found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-header items-center justify-between">
          <h4 className="font-bold text-lg title-color">Contact Information</h4>
          {!user?.profileCompleted && (
            <ButtonTw
              onClick={() => setOpenModalName("contactInfo")}
              variant="blue"
              className="gap-2"
            >
              <i className="fa-solid fa-pen-to-square"></i>Edit
            </ButtonTw>
          )}
        </div>

        <AddProfileContactInfoModal
          showModal={openModalName === "contactInfo"}
          onClose={() => setOpenModalName("")}
        />

        <div className="my-3">
          <div className="px-4 py-2 space-y-3 text-gray-600 dark:text-gray-500">
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">
                Mobile Number Personal :
              </span>
              <span className="basis-3/5">
                {" "}
                {user?.userContactInfos?.mobilePersonal}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Mobile Number Work :</span>
              <span className="basis-3/5">
                {user?.userContactInfos?.mobileWork}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Telephone :</span>
              <span className="basis-3/5">
                {user?.userContactInfos?.telephone}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Email Personal :</span>
              <span className="">{user?.userContactInfos?.emailPersonal}</span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Email Official :</span>
              <span className="">{user?.userContactInfos?.emailOfficial}</span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">
                Emergency Contact Person :
              </span>
              <span className="basis-3/5">
                {user?.userContactInfos?.emergencyContactPerson}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">
                Emergency Contact Number :
              </span>
              <span className="basis-3/5">
                {user?.userContactInfos?.emergencyContactNumber}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Present Address :</span>
              <span className="basis-3/5">
                {user?.userContactInfos?.presentAddress}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Permanant Address :</span>
              <span className="basis-3/5">
                {user?.userContactInfos?.permanentAddress}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="card mt-6">
                <div className="card-header items-center justify-between">
                    <h4 className="font-bold text-lg title-color">
                        Personal Information
                    </h4>
                    <ButtonTw variant="blue" className="gap-2">
                        <i className="fa-solid fa-pen-to-square"></i>Add New
                    </ButtonTw>
                </div>

                <div className="my-3">
                    <div className="px-4 py-2 space-y-3 text-gray-600 dark:text-gray-500">
                        <div className="flex flex-row">
                            <span className="font-bold basis-2/5">Father’s Name :</span>
                            <span className="basis-3/5">Sumaiya Toori Khan</span>
                        </div>
                        <div className="flex flex-row">
                            <span className="font-bold basis-2/5">Mothers Name :</span>
                            <span className="">March 1997</span>
                        </div>
                    </div>
                </div>
            </div> */}
    </>
  );
};

export default GeneralInfo;
