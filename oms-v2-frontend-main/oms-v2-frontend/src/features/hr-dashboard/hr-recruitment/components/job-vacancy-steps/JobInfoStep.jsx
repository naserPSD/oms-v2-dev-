"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";
import RadioGroup from "@/components/ui/RadioGroup";

export function JobInfoStep({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Job Level */}
        <RadioGroup
          name="jobLevel"
          label="Job Level *"
          options={[
            { value: "entry", label: "Entry Level" },
            { value: "mid", label: "Mid Level" },
            { value: "top", label: "Top Level" },
          ]}
          selectedValue={data.jobLevel}
          onChange={(val) => handleChange("jobLevel", val)}
          direction="horizontal"
        />

        {/* Join information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 md:gap-x-6">
          <SelectSearch
            label="Work Place *"
            options={[
              { value: "office", label: "Work at Office" },
              { value: "remote", label: "Work from Home" },
              { value: "hybrid", label: "Hybrid" },
            ]}
            value={data.workPlace}
            onChange={(val) => handleChange("workPlace", val)}
            placeholder="Select work place"
            clearable
          />

          <Input
            label="Job Location *"
            value={data.jobLocation}
            onChange={(e) => handleChange("jobLocation", e.target.value)}
            placeholder="Enter job location"
          />

          {/* Job Context */}
          <Input
            label="Job Context *"
            type="textarea"
            value={data.jobContext}
            onChange={(e) => handleChange("jobContext", e.target.value)}
            placeholder="Describe the job context and background"
          />

          {/* Job Responsibilities */}
          <Input
            label="Job Responsibilities *"
            type="textarea"
            value={data.jobResponsibilities}
            onChange={(e) =>
              handleChange("jobResponsibilities", e.target.value)
            }
            placeholder="List the key responsibilities and duties"
          />
        </div>

        {/* Show Salary Range */}
        <div className="">
          <SwitchButton
            onClick={() =>
              handleChange("showSalaryRange", !data.showSalaryRange)
            }
            enabled={data.showSalaryRange}
            enabledText="Yes"
            disabledText="No"
            label="Show Salary Range"
            className="flex items-center gap-2"
          />

          {data.showSalaryRange && (
            <>
              <SwitchButton
                onClick={() =>
                  handleChange("salaryNegotiable", !data.salaryNegotiable)
                }
                enabled={data.salaryNegotiable}
                enabledText="Yes"
                disabledText="No"
                label="Salary Negotiable"
                className="flex items-center gap-2"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 md:gap-x-6">
                <Input
                  label="Minimum Salary *"
                  type="number"
                  value={data.minimumSalary}
                  onChange={(e) =>
                    handleChange("minimumSalary", e.target.value)
                  }
                  placeholder="Enter minimum salary"
                />

                <Input
                  label="Maximum Salary *"
                  type="number"
                  value={data.maximumSalary}
                  onChange={(e) =>
                    handleChange("maximumSalary", e.target.value)
                  }
                  placeholder="Enter maximum salary"
                />
              </div>

              <Input
                label="Additional Salary Information"
                type="textarea"
                value={data.additionalSalaryInfo}
                onChange={(e) =>
                  handleChange("additionalSalaryInfo", e.target.value)
                }
                placeholder="Any additional salary information or benefits"
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
