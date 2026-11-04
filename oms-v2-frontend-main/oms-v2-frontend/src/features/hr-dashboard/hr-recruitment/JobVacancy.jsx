"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { StepNavigation } from "./components/job-vacancy-steps/StepNavigation";
import { PreviewStep } from "./components/job-vacancy-steps/PreviewStep";
import { EducationInfoStep } from "./components/job-vacancy-steps/EducationInfoStep";
import { JobInfoStep } from "./components/job-vacancy-steps/JobInfoStep";
import { PrimaryInfoStep } from "./components/job-vacancy-steps/PrimaryInfoStep";
import { useLocalStorage } from "@/hooks/common/useLocalStorage";
import { StepIndicator } from "./components/job-vacancy-steps/StepIndicator";
const initialPrimaryInfo = {
  jobTitle: "",
  numberOfVacancy: "",
  jobCategory: "",
  employmentStatus: "",
  applicationDeadline: "",
  resumeReceivingOption: "",
  specialInstruction: "",
  requiredPhoto: false,
};

const initialJobInfo = {
  jobLevel: "",
  workPlace: "",
  jobLocation: "",
  jobContext: "",
  jobResponsibilities: "",
  showSalaryRange: false,
  salaryNegotiable: false,
  minimumSalary: "",
  maximumSalary: "",
  additionalSalaryInfo: "",
};

const initialEducationInfo = {
  degreeLevel: [""],
  courseName: [""],
  preferredEducationalInstitution: "",
  trainingAndTradeCourse: "",
  areaOfExperience: "",
  professionalCertifications: "",
  additionalRequirements: "",
  skills: "",
  fresherCanApply: false,
  experienceRequired: false,
  minimumYearOfExperience: "",
  maximumYearOfExperience: "",
  minimumAge: "",
  maximumAge: "",
  gender: "",
};

const JobVacancy = () => {
  const searchParams = useSearchParams();
  const currentStep = Number.parseInt(searchParams.get("step") || "1");

  const [recruitmentData, setRecruitmentData] = useLocalStorage(
    "hr-recruitment-data",
    {
      primaryInfo: initialPrimaryInfo,
      jobInfo: initialJobInfo,
      educationInfo: initialEducationInfo,
    }
  );

  const handlePrimaryInfoChange = (data) => {
    setRecruitmentData((prev) => ({ ...prev, primaryInfo: data }));
  };

  const handleJobInfoChange = (data) => {
    setRecruitmentData((prev) => ({ ...prev, jobInfo: data }));
  };

  const handleEducationInfoChange = (data) => {
    setRecruitmentData((prev) => ({ ...prev, educationInfo: data }));
  };

  const handleSave = () => {
    console.log("Data saved to localStorage");
  };

  const handleSubmit = () => {
    console.log("Final submission:", recruitmentData);
    alert("Job posted successfully!");
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          recruitmentData.primaryInfo.jobTitle &&
          recruitmentData.primaryInfo.numberOfVacancy &&
          recruitmentData.primaryInfo.jobCategory &&
          recruitmentData.primaryInfo.employmentStatus &&
          recruitmentData.primaryInfo.applicationDeadline
        );
      case 2:
        return (
          recruitmentData.jobInfo.jobLevel &&
          recruitmentData.jobInfo.workPlace &&
          recruitmentData.jobInfo.jobLocation &&
          recruitmentData.jobInfo.jobContext &&
          recruitmentData.jobInfo.jobResponsibilities
        );
      case 3:
        return recruitmentData.educationInfo.gender;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PrimaryInfoStep
            data={recruitmentData.primaryInfo}
            onChange={handlePrimaryInfoChange}
          />
        );
      case 2:
        return (
          <JobInfoStep
            data={recruitmentData.jobInfo}
            onChange={handleJobInfoChange}
          />
        );
      case 3:
        return (
          <EducationInfoStep
            data={recruitmentData.educationInfo}
            onChange={handleEducationInfoChange}
          />
        );
      case 4:
        return <PreviewStep data={recruitmentData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background my-4 rounded-lg shadow-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold dark-title-color text-center w-full">
            Job Vacancy
          </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <StepIndicator currentStep={currentStep} totalSteps={4} />

          <div className="mb-8">{renderStep()}</div>

          <StepNavigation
            currentStep={currentStep}
            totalSteps={4}
            onSave={currentStep === 4 ? handleSubmit : handleSave}
            canProceed={canProceed()}
          />
        </div>
      </div>
    </div>
  );
};

export default JobVacancy;
