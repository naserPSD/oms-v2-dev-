import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useCommonStore = create(
  devtools((set) => ({
    isDropdownLoaded: false,
    perPageListItems: 10,
    dropdowns: {
      genderList: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" },
      ],
      permissionTypeList: [
        { value: "module", label: "Module" },
        { value: "page", label: "Page" },
        { value: "action", label: "Action" },
        { value: "feature", label: "Feature" },
      ],
      activeInactiveList: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
      systemNonSystemRoleList: [
        { value: "true", label: "System" },
        { value: "false", label: "Non-System" },
      ],
      yesNoList: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
      appUseCaseList: [
        { value: "Admin", label: "Admin" },
        { value: "Company", label: "Company" },
        { value: "Personal", label: "Personal" },
      ],
      addressTypes: [
        { value: "Residential", label: "Residential" },
        { value: "Commercial", label: "Commercial" },
        { value: "Other", label: "Other" },
      ],
      billingCycles: [
        { value: "monthly", label: "Monthly" },
        { value: "yearly", label: "Yearly" },
      ],
    },
    initialSetupTypeList: [
      { value: "personal", label: "Personal" },
      { value: "company", label: "Company" },
    ],
    skillLevelList: [
      { value: "Beginner", label: "Beginner" },
      { value: "Intermediate", label: "Intermediate" },
      { value: "Advanced", label: "Advanced" },
      { value: "Expert", label: "Expert" },
    ],
    setIsDropdownLoaded: (value) => set({ isDropdownLoaded: value }),
    setDropdowns: (value) => {
      // console.log('setDropdowns', value);
      set((state) => ({
        dropdowns: {
          ...state.dropdowns, // keep previous dropdowns
          ...value, // merge new dropdown values
        },
        isDropdownLoaded: true,
      }));
    },
    clearDropdowns: () => set({ dropdowns: {}, isDropdownLoaded: false }),
  }))
);
