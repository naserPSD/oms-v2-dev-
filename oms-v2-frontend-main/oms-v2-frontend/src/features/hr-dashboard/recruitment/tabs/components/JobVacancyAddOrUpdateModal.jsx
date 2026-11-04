import React, { useMemo } from "react";
import Link from "next/link";
import { BiPlus } from "react-icons/bi";
import { FormController as Controller } from "@/components/common/FormController";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import DatePicker from "@/components/ui/DatePicker";
import SwitchButton from "@/components/ui/SwitchButton";
import helpers from "@/utils/helpers";
import ButtonTw from "@/components/ui/ButtonTw";

const JobVacancyAddOrUpdateModal = ({
  showModal,
  handleClose,
  isLoading,
  reset,
  handleSubmit,
  submitForm,
  control,
  watch,
  jobCategoryOptions,
 // employeeInvitationStatusList,
  jobLevelOptions,
  // workplaceOptions,
  // resumeReceivingOptions,
  // genderOptions,
}) => {
  // const dropdowns = useCommonStore((state) => state.dropdowns);

  const { useOfficeListQuery, useJobCategoryListQuery } = useCommonQueryApi({
    reset,
  });

  const { data: officeList = [], refetch: refetchOfficeList } = useOfficeListQuery();
  const { refetch: refetchJobCategoryList } = useJobCategoryListQuery();
  // const { data: designationList = [] } = useDesignationListQuery();

  const selectedOfficeId = watch("officeId");
  const selectedOffice = useMemo(() => {
    return officeList?.find((o) => o.value === selectedOfficeId);
  }, [selectedOfficeId, officeList]);

  const officeShiftOptions = useMemo(() => {
    if (selectedOffice?.officeShifts?.length > 0) {
      return selectedOffice.officeShifts.map((shift) => ({
        value: shift.id,
        label: `${shift.name} (${helpers.stringTimeToLocalTime(shift.startTime)} - ${helpers.stringTimeToLocalTime(shift.endTime)})`,
      }));
    }
    return [];
  }, [selectedOffice]);

  // const countryList = dropdowns.countryList?.map((each) => {
  //   return { value: each.id, label: each.name };
  // });

  // const religionList =
  //   dropdowns.statusGroupList?.find((s) => s.code === "religions")?.statuses ??
  //   [];

  // const maritalStatusList =
  //   dropdowns.statusGroupList?.find((s) => s.code === "marital_statuses")
  //     ?.statuses ?? [];

  return (
    <div>
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={watch("id") ? "Edit Job Vacancy" : "Add Job Vacancy"}
        size="4xl"
        dismissible
        showHeader
        showFooter={false}
      >
        <form onSubmit={handleSubmit(submitForm)} className="p-8">
          {/* Section: Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold  mb-4 pb-2 border-b ">
              Basic Information
            </h3>
            <div className="grid grid-cols-12 gap-5">
              {/* Job Title */}
              <Controller
                control={control}
                name="jobTitle"
                render={({ field, fieldState }) => (
                  <Input
                    label="Job Title"
                    placeholder="e.g., Senior Software Engineer"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-6"
                    required
                  />
                )}
              />

              {/* Vacancy */}
              <Controller
                control={control}
                name="noOfVacancies"
                render={({ field, fieldState }) => (
                  <Input
                    label="Number of Vacancies"
                    type="number"
                    placeholder="e.g., 5"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-6"
                    required
                    min={1}
                  />
                )}
              />

              {/* Office */}
              {/* <Controller
                name="officeId"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Office Location"
                    value={field.value}
                    onChange={field.onChange}
                    options={officeList}
                    error={fieldState.error?.message}
                    placeholder="Select Office"
                    className="col-span-12 lg:col-span-6"
                    required
                  />
                )}
              /> */}

              {/* Office */}
              <div className="col-span-12 lg:col-span-6 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Office{" "}
                    <span className="text-red-500 font-bold leading-none select-none">*</span>
                  </label>
                  <Link
                    href="/hr-dashboard/office"
                    onClick={() => refetchOfficeList?.()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primaryColor hover:text-white bg-primaryColor/10 hover:bg-primaryColor rounded border border-primaryColor/20 transition-all duration-200 cursor-pointer shadow-xs"
                    title="Add or view offices"
                  >
                    <BiPlus size={12} />
                    <span>Add/View</span>
                  </Link>
                </div>
                <Controller
                  name="officeId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label=""
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        // office change হলে shift reset
                        reset({ ...watch(), officeId: val, shiftId: null });
                      }}
                      options={officeList}
                      error={fieldState.error?.message}
                      placeholder="Select Office"
                      className="!mb-0"
                      emptyAction={{
                        label: "+ Add Office",
                        href: "/hr-dashboard/office",
                        onClick: () => refetchOfficeList?.(),
                      }}
                    />
                  )}
                />
              </div>

              {/* Shift */}
              {/* <Controller
                name="shiftId"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Work Shift"
                    value={field.value}
                    onChange={field.onChange}
                    options={officeShiftOptions}
                    error={fieldState.error?.message}
                    placeholder="Select Shift"
                    className="col-span-12 lg:col-span-6"
                    required
                  />
                )}
              /> */}
              {selectedOfficeId && officeShiftOptions.length > 0 && (
                <Controller
                  name="shiftId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label="Work Shift"
                      value={field.value}
                      onChange={field.onChange}
                      options={officeShiftOptions}
                      error={fieldState.error?.message}
                      placeholder="Select Shift"
                      className="col-span-12 lg:col-span-6"
                      required
                    />
                  )}
                />
              )}
            </div>
          </div>

          {/* Section: Job Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold  mb-4 pb-2 border-b ">
              Job Details
            </h3>
            <div className="grid grid-cols-8 gap-5">
              {/* Job Category */}
              <div className="col-span-12 lg:col-span-4 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Job Category{" "}
                    <span className="text-red-500 font-bold leading-none select-none">*</span>
                  </label>
                  <Link
                    href="/hr-dashboard/recruitment?tab=job-categories"
                    onClick={() => refetchJobCategoryList?.()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primaryColor hover:text-white bg-primaryColor/10 hover:bg-primaryColor rounded border border-primaryColor/20 transition-all duration-200 cursor-pointer shadow-xs"
                    title="Add or view job categories"
                  >
                    <BiPlus size={12} />
                    <span>Add/View</span>
                  </Link>
                </div>
                <Controller
                  name="jobCategoryId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <SelectSearch
                      label=""
                      value={field.value}
                      onChange={field.onChange}
                      options={jobCategoryOptions}
                      error={fieldState.error?.message}
                      placeholder="Select Job Category"
                      className="!mb-0"
                      emptyAction={{
                        label: "+ Add Job Category",
                        href: "/hr-dashboard/recruitment?tab=job-categories",
                        onClick: () => refetchJobCategoryList?.(),
                      }}
                    />
                  )}
                />
              </div>

              {/* Employment Status */}
              {/* <Controller
                name="employmentStatusId"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Employment Status"
                    value={field.value}
                    onChange={field.onChange}
                    options={employeeInvitationStatusList}
                    error={fieldState.error?.message}
                    placeholder="Select Employment Status"
                    className="col-span-12 lg:col-span-4"
                    required
                  />
                )}
              /> */}

              {/* Job Level */}
              <Controller
                name="jobLevel"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Job Level"
                    value={field.value}
                    onChange={field.onChange}
                    options={jobLevelOptions}
                    error={fieldState.error?.message}
                    placeholder="Select Job Level"
                    className="col-span-12 lg:col-span-4"
                    required
                  />
                )}
              />

              {/* Workplace */}
              {/* <Controller
                name=""
                control={control}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Workplace Type"
                    value={field.value}
                    onChange={field.onChange}
                    options={workplaceOptions}
                    error={fieldState.error?.message}
                    placeholder="Select Workplace"
                    className="col-span-12 lg:col-span-6"
                    required
                  />
                )}
              /> */}

              {/* <Controller
                control={control}
                name="workplace"
                render={({ field, fieldState }) => (
                  <Input
                    label="Workplace"
                    type="text"
                    placeholder="Work Form Home"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-6"
                    required
                  />
                )}
              /> */}

              {/* Deadline */}
              <Controller
                control={control}
                name="applicationDeadline"
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="Application Deadline"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-4"
                    required
                    minDate={new Date()}
                  />
                )}
              />

              {/* Resume Receiving Option */}
              {/* <Controller
                name="resumeReceivingOption"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Resume Receiving Method"
                    value={field.value}
                    onChange={field.onChange}
                    options={resumeReceivingOptions}
                    error={fieldState.error?.message}
                    placeholder="Select Option"
                    className="col-span-12"
                    required
                  />
                )}
              /> */}
            </div>
          </div>

          {/* Section: Salary Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold  mb-4 pb-2 border-b ">
              Salary Information
            </h3>
            <div className="grid grid-cols-12 gap-5">
              {/* Min Salary */}
              <Controller
                control={control}
                name="minSalary"
                render={({ field, fieldState }) => (
                  <Input
                    label="Minimum Salary (BDT)"
                    type="number"
                    placeholder="e.g., 30000"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-6"
                  />
                )}
              />

              {/* Max Salary */}
              <Controller
                control={control}
                name="maxSalary"
                render={({ field, fieldState }) => (
                  <Input
                    label="Maximum Salary (BDT)"
                    type="number"
                    placeholder="e.g., 60000"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-6"
                  />
                )}
              />

              {/* Additional Salary Info */}
              {/* <Controller
                name="additionalSalaryInfo"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Additional Salary Benefits"
                    placeholder="e.g., Festival bonus, Mobile bill, etc."
                    value={field.value}
                    onChange={field.onChange}
                    className="col-span-12"
                  />
                )}
              /> */}

              {/* Salary Options */}
              <div className="col-span-12 grid grid-cols-12 gap-4  p-4 rounded-lg">
                <Controller
                  name="showSalaryRange"
                  control={control}
                  render={({ field }) => (
                    <div className="col-span-12 lg:col-span-4 flex items-center">
                      <SwitchButton
                        label="Show Salary in Job Post"
                        enabled={field.value}
                        onChange={(val) => field.onChange(val)}
                        enabledText="Show"
                        disabledText="Hide"
                        size="sm"
                      />
                    </div>
                  )}
                />

                <Controller
                  name="salaryNegotiable"
                  control={control}
                  render={({ field }) => (
                    <div className="col-span-12 lg:col-span-4 flex items-center">
                      <SwitchButton
                        label="Salary Negotiable"
                        enabled={field.value}
                        onChange={(val) => field.onChange(val)}
                        enabledText="Yes"
                        disabledText="No"
                        size="sm"
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section: Educational Requirements */}
          {/* <div className="mb-8">
            <h3 className="text-lg font-semibold  mb-4 pb-2 border-b">
              Educational Requirements
            </h3>
            <div className="grid grid-cols-12 gap-5">
              <Controller
                name="preferredEduInstitute"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Preferred Institutions"
                    placeholder="e.g., BUET, DU, JU (comma separated)"
                    value={field.value}
                    onChange={field.onChange}
                    className="col-span-12 lg:col-span-6"
                  />
                )}
              />

              <Controller
                name="othersEduQualification"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Educational Qualification"
                    placeholder="e.g., BSc in CSE, MSc in IT"
                    value={field.value}
                    onChange={field.onChange}
                    className="col-span-12 lg:col-span-6"
                  />
                )}
              />

              <Controller
                name="trainingAndTradeCourse"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Training & Trade Courses"
                    placeholder="e.g., Project Management, Digital Marketing"
                    value={field.value}
                    onChange={field.onChange}
                    className="col-span-12 lg:col-span-6"
                  />
                )}
              />

              <Controller
                name="professionalCertification"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Professional Certifications"
                    placeholder="e.g., PMP, CISA, AWS Certified"
                    value={field.value}
                    onChange={field.onChange}
                    className="col-span-12 lg:col-span-6"
                  />
                )}
              />
            </div>
          </div> */}

          {/* Section: Experience Requirements */}
          {/* <div className="mb-8">
            <h3 className="text-lg font-semibold  mb-4 pb-2 border-b ">
              Experience Requirements
            </h3>
            <div className="grid grid-cols-12 gap-5">
              <Controller
                name="areaOfExperience"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Area of Experience"
                    placeholder="e.g., Software Development, Marketing"
                    value={field.value}
                    onChange={field.onChange}
                    className="col-span-12"
                  />
                )}
              />

              <Controller
                control={control}
                name="minYearExperience"
                render={({ field, fieldState }) => (
                  <Input
                    label="Minimum Years"
                    type="number"
                    placeholder="e.g., 2"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-3"
                    min={0}
                    step={0.5}
                  />
                )}
              />

              <Controller
                control={control}
                name="maxYearExperience"
                render={({ field, fieldState }) => (
                  <Input
                    label="Maximum Years"
                    type="number"
                    placeholder="e.g., 5"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-3"
                    min={0}
                    step={0.5}
                  />
                )}
              />

              <div className="col-span-12 lg:col-span-6 grid grid-cols-2 gap-4">
                <Controller
                  name="isApplyFresher"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center">
                      <SwitchButton
                        label="Freshers Allowed"
                        enabled={field.value === 1}
                        onChange={(val) => field.onChange(val ? 1 : 0)}
                        enabledText="Yes"
                        disabledText="No"
                        size="sm"
                      />
                    </div>
                  )}
                />

                <Controller
                  name="experienceRequired"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center">
                      <SwitchButton
                        label="Experience Required"
                        enabled={field.value === 1}
                        onChange={(val) => field.onChange(val ? 1 : 0)}
                        enabledText="Yes"
                        disabledText="No"
                        size="sm"
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </div> */}

          {/* Section: Additional Requirements */}
          {/* <div className="mb-8">
            <h3 className="text-lg font-semibold  mb-4 pb-2 border-b ">
              Additional Requirements
            </h3>
            <div className="grid grid-cols-12 gap-5">
             
              <Controller
                name="gender"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectSearch
                    label="Preferred Gender"
                    value={field.value}
                    onChange={field.onChange}
                    options={genderOptions}
                    error={fieldState.error?.message}
                    placeholder="Select Gender (Optional)"
                    className="col-span-12 lg:col-span-4"
                  />
                )}
              />

              <Controller
                control={control}
                name="minAge"
                render={({ field, fieldState }) => (
                  <Input
                    label="Minimum Age"
                    type="number"
                    placeholder="e.g., 22"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-4"
                  />
                )}
              />

              <Controller
                control={control}
                name="maxAge"
                render={({ field, fieldState }) => (
                  <Input
                    label="Maximum Age"
                    type="number"
                    placeholder="e.g., 45"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12 lg:col-span-4"
                  />
                )}
              />

            
              <Controller
                name="additionalRequirement"
                control={control}
                render={({ field }) => (
                  <Textarea
                    label="Additional Requirements"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Any other specific requirements (skills, personality traits, etc.)"
                    className="col-span-12"
                    rows={3}
                  />
                )}
              />
            </div>
          </div> */}

          {/* Section: Skills & Special Instructions */}
          {/* <div className="mb-8">
            <h3 className="text-lg font-semibold  mb-4 pb-2 border-b ">
              Skills & Instructions
            </h3>
            <div className="grid grid-cols-12 gap-5">
             
              <Controller
                name="skills"
                control={control}
                render={({ field, fieldState }) => (
                  <Textarea
                    label="Required Skills"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="e.g., JavaScript, React, Node.js, Communication (comma separated)"
                    error={fieldState.error?.message}
                    className="col-span-12"
                    rows={3}
                    required
                  />
                )}
              />

           
              <Controller
                name="specialInstruction"
                control={control}
                render={({ field }) => (
                  <Textarea
                    label="Special Instructions"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Any special instructions for applicants"
                    className="col-span-12"
                    rows={3}
                  />
                )}
              />
            </div>
          </div> */}

          {/* Section: Application Options */}
          {/* <div className="mb-8">
            <h3 className="text-lg font-semibold  mb-4 pb-2 border-b ">
              Application Options
            </h3>
            <div className="grid grid-cols-12 gap-4  p-4 rounded-lg">
              <Controller
                name="requiredPhoto"
                control={control}
                render={({ field }) => (
                  <div className="col-span-12 lg:col-span-4 flex items-center">
                    <SwitchButton
                      label="Require Photo with Application"
                      enabled={field.value}
                      onChange={(val) => field.onChange(val)}
                      enabledText="Required"
                      disabledText="Optional"
                      size="sm"
                    />
                  </div>
                )}
              />

              <Controller
                name="preferVideoResume"
                control={control}
                render={({ field }) => (
                  <div className="col-span-12 lg:col-span-4 flex items-center">
                    <SwitchButton
                      label="Accept Video Resume"
                      enabled={field.value}
                      onChange={(val) => field.onChange(val)}
                      enabledText="Yes"
                      disabledText="No"
                      size="sm"
                    />
                  </div>
                )}
              />
            </div>
          </div> */}
          {/* Section: Job Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold  mb-4 pb-2 border-b ">
              Job Description
            </h3>
            <div className="grid grid-cols-1 gap-5">
              {/* Job Context */}
              {/* <Controller
                name="jobContext"
                control={control}
                render={({ field, fieldState }) => (
                  <Textarea
                    label="Job Context"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Describe the company context, department, and reporting structure..."
                    error={fieldState.error?.message}
                    className="col-span-12"
                    rows={4}
                    required
                  />
                )}
              /> */}

              <Controller
                name="jobContext"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Job Context
                    </label>
                    <div className="suneditor-wrapper dark:bg-gray-800 dark:text-white rounded-md">
                      <SunEditor
                        setContents={field.value}
                        onChange={field.onChange}
                        height="180px"
                        placeholder="Enter Job Context"
                        setOptions={{
                          buttonList: [
                            [
                              "undo",
                              "redo",
                              "formatBlock",
                              "fontSize",
                              "bold",
                              "underline",
                              "italic",
                              "strike",
                              "removeFormat",
                              "fontColor",
                              "hiliteColor",
                              "align",
                              "list",
                              "table",
                              "link",
                              "codeView",
                              "fullScreen",
                            ],
                          ],
                          height: "180px",
                        }}
                      />
                    </div>
                    {fieldState.error?.message && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Job Responsibilities */}
              {/* <Controller
                name="jobResponsibilities"
                control={control}
                render={({ field, fieldState }) => (
                  <Textarea
                    label="Job Responsibilities"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="List the key responsibilities (one per line)"
                    error={fieldState.error?.message}
                    className="col-span-12"
                    rows={5}
                    required
                  />
                )}
              /> */}

              <Controller
                name="jobResponsibilities"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Job Responsibilities
                    </label>
                    <div className="suneditor-wrapper dark:bg-gray-800 dark:text-white rounded-md">
                      <SunEditor
                        setContents={field.value}
                        onChange={field.onChange}
                        height="180px"
                        placeholder="Enter Job Responsibilities"
                        setOptions={{
                          buttonList: [
                            [
                              "undo",
                              "redo",
                              "formatBlock",
                              "fontSize",
                              "bold",
                              "underline",
                              "italic",
                              "strike",
                              "removeFormat",
                              "fontColor",
                              "hiliteColor",
                              "align",
                              "list",
                              "table",
                              "link",
                              "codeView",
                              "fullScreen",
                            ],
                          ],
                          height: "180px",
                        }}
                      />
                    </div>
                    {fieldState.error?.message && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex  gap-x-2">
            <ButtonTw
              type="submit"
              size="md"
              variant="default"
              className="w-full font-bold mt-4 col-span-12 py-1.5"
              loading={isLoading}
            >
              {isLoading ? "Publishing Job..." : "Publish Job Vacancy"}
            </ButtonTw>

            <ButtonTw
              type="button"
              size="md"
              variant="outline.gray"
              className="w-full font-bold mt-4 col-span-12 py-1.5"
              onClick={() => reset()}
            >
              Reset
            </ButtonTw>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default JobVacancyAddOrUpdateModal;
