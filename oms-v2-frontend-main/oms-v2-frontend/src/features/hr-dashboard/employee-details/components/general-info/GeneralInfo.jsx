// /tabs/GeneralInfoTab.jsx
"use client";
import ButtonTw from "@/components/ui/ButtonTw";

import helpers from "@/utils/helpers";
import { useState } from "react";
import AddPersonalInfoModal from "./modals/AddPersonalInfoModal";
import AddContactInfoModal from "./modals/AddContactInfoModal";

const GeneralInfo = ({ employeeDetails, id }) => {
  // const user = useAuthStore((state) => state.user);

  //console.log("employeeDetails => ", employeeDetails?.personalInformation?.maritalStatus);

  const [openModalName, setOpenModalName] = useState("");

  return (
    <>
      <div className="card mt-6">
        <div className="card-header items-center justify-between">
          <h4 className="card-title title-color">Personal Information</h4>
          <ButtonTw
            onClick={() => setOpenModalName("personalInfo")}
            variant="blue"
            className="gap-2"
          >
            <i className="fa-solid fa-pen-to-square"></i>Edit
          </ButtonTw>
        </div>

        <AddPersonalInfoModal
          showModal={openModalName === "personalInfo"}
          onClose={() => setOpenModalName("")}
          id={id}
          employeeDetails={employeeDetails}
          setOpenModalName={setOpenModalName}
        />

        <div className="my-3">
          <div className="px-4 py-2 space-y-3 text-gray-600 dark:text-gray-500">
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Name :</span>
              <span className="basis-3/5">
                {employeeDetails?.personalInformation?.name}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Father’s Name :</span>
              <span className="basis-3/5">
                {employeeDetails?.personalInformation?.fathersName}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Mothers Name :</span>
              <span className="">
                {employeeDetails?.personalInformation?.mothersName}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Date of Birth :</span>
              <span className="basis-3/5">
                {helpers.dDate(
                  employeeDetails?.personalInformation?.dateOfBirth,
                )}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">
                NID / Passport Number :
              </span>
              <span className="basis-3/5">
                {employeeDetails?.personalInformation?.nidNumber}
                {employeeDetails?.personalInformation?.passportNumber && (
                  <span> / </span>
                )}
                {employeeDetails?.personalInformation?.passportNumber}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Nationality:</span>
              <span className="basis-3/5">
                {employeeDetails?.personalInformation?.nationality}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Gender :</span>
              <span className="basis-3/5">
                {employeeDetails?.personalInformation?.gender}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Religion :</span>
              <span className="basis-3/5">
                {employeeDetails?.personalInformation?.religion}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Blood Group :</span>
              <span className="basis-3/5">
                {employeeDetails?.personalInformation?.bloodGroup}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Marital Status :</span>
              <span className="basis-3/5">
                {employeeDetails?.personalInformation?.maritalStatus}
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

      <h4 className="font-bold text-lg title-color mt-6">
        Language Proficiencies
      </h4>
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
            {employeeDetails?.languageTable?.map((item, index) => (
              <tr key={item.id}>
                <td className="text-center">{index + 1}</td>
                <td>{item.language}</td>
                <td>{item.speaking}</td>
                <td>{item.reading}</td>
                <td>{item.writing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card mt-6">
        <div className="card-header items-center justify-between">
          <h4 className="font-bold text-lg title-color">Contact Information</h4>
          <ButtonTw
            onClick={() => setOpenModalName("contactInfo")}
            variant="blue"
            className="gap-2"
          >
            <i className="fa-solid fa-pen-to-square"></i>Edit
          </ButtonTw>
        </div>

        <AddContactInfoModal
          showModal={openModalName === "contactInfo"}
          onClose={() => setOpenModalName("")}
          id={id}
          setOpenModalName={setOpenModalName}
          employeeDetails={employeeDetails}
        />

        <div className="my-3">
          <div className="px-4 py-2 space-y-3 text-gray-600 dark:text-gray-500">
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">
                Mobile Number (Personal) :
              </span>
              <span className="basis-3/5">
                {employeeDetails?.contactInformation?.mobileNumberPersonal}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">
                Mobile Number (Work) :
              </span>
              <span className="basis-3/5">
                {employeeDetails?.contactInformation?.mobileWork}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Telephone :</span>
              <span className="basis-3/5">
                {employeeDetails?.contactInformation?.telephone}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Email (Personal) :</span>
              <span className="">
                {employeeDetails?.contactInformation?.emailPersonal}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Email (Official) :</span>
              <span className="">
                {employeeDetails?.contactInformation?.emailOfficial}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">
                Emergency Contact Person :
              </span>
              <span className="basis-3/5">
                {employeeDetails?.contactInformation?.emergencyContactPerson}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">
                Emergency Contact Number :
              </span>
              <span className="basis-3/5">
                {employeeDetails?.contactInformation?.emergencyContactNumber}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Present Address :</span>
              <span className="basis-3/5">
                {employeeDetails?.contactInformation?.presentAddress}
              </span>
            </div>
            <div className="flex flex-row">
              <span className="font-bold basis-2/5">Permanant Address :</span>
              <span className="basis-3/5">
                {employeeDetails?.contactInformation?.permanentAddress}
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
