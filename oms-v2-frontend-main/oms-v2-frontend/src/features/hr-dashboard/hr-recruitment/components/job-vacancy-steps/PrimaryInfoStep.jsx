"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";
import { parseISO } from "date-fns";

export function PrimaryInfoStep({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Primary Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Job Primary Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
          <Input
            label="Job Title *"
            value={data.jobTitle}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            placeholder="Enter job title"
          />

          <Input
            label="Number of Vacancy *"
            type="number"
            value={data.numberOfVacancy}
            onChange={(e) => handleChange("numberOfVacancy", e.target.value)}
            placeholder="Enter number of positions"
          />

          <SelectSearch
            label="Job Category *"
            options={[
              { value: "finance", label: "Finance" },
              { value: "technology", label: "Technology" },
              { value: "marketing", label: "Marketing" },
              { value: "sales", label: "Sales" },
              { value: "hr", label: "Human Resources" },
              { value: "operations", label: "Operations" },
            ]}
            value={data.jobCategory}
            onChange={(val) => handleChange("jobCategory", val)}
            placeholder="Select job category"
            clearable
          />

          <SelectSearch
            label="Employment Status *"
            options={[
              { value: "full-time", label: "Full Time" },
              { value: "part-time", label: "Part Time" },
              { value: "contract", label: "Contract" },
              { value: "internship", label: "Internship" },
            ]}
            value={data.employmentStatus}
            onChange={(val) => handleChange("employmentStatus", val)}
            placeholder="Select employment status"
            clearable
          />

          <DatePicker
            label="Application Deadline *"
            options={{
              dateFormat: "d-m-Y",
              minDate: getTodayDate(),
              defaultDate: data.applicationDeadline
                ? parseISO(data.applicationDeadline)
                : getTodayDate(),
            }}
            value={data.applicationDeadline}
            onChange={(val) => handleChange("applicationDeadline", val)}
            name="applicationDeadline"
            placeholder="Select application deadline"
            size="sm"
          />

          <SelectSearch
            label="Resume Receiving Option"
            options={[
              { value: "online", label: "Apply Online" },
              { value: "email", label: "Email" },
              { value: "hard-copy", label: "Hard Copy" },
            ]}
            value={data.resumeReceivingOption}
            onChange={(val) => handleChange("resumeReceivingOption", val)}
            placeholder="Select option"
            clearable
          />
        </div>

        {/* Special Instructions */}
        <Input
          label="Special Instructions"
          type="textarea"
          rows={5}
          value={data.specialInstruction}
          onChange={(e) => handleChange("specialInstruction", e.target.value)}
          placeholder="Enter any special instructions for applicants"
        />

        {/* Required Photo */}
        <SwitchButton
          onClick={() => handleChange("requiredPhoto", !data.requiredPhoto)}
          enabled={data.requiredPhoto}
          enabledText="Yes"
          disabledText="No"
          label="Required Photo"
          className="flex items-center gap-2"
        />
      </CardContent>
    </Card>
  );
}
