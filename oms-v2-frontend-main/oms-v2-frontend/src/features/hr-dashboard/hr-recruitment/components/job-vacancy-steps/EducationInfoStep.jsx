"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SwitchButton from "@/components/ui/SwitchButton";

export function EducationInfoStep({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const addDegreeLevel = () => {
    handleChange("degreeLevel", [...data.degreeLevel, ""]);
    handleChange("courseName", [...data.courseName, ""]);
  };

  const removeDegreeLevel = (index) => {
    const newDegreeLevel = data.degreeLevel.filter((_, i) => i !== index);
    const newCourseName = data.courseName.filter((_, i) => i !== index);
    handleChange("degreeLevel", newDegreeLevel);
    handleChange("courseName", newCourseName);
  };

  const updateDegreeLevel = (index, value) => {
    const newDegreeLevel = [...data.degreeLevel];
    newDegreeLevel[index] = value;
    handleChange("degreeLevel", newDegreeLevel);
  };

  const updateCourseName = (index, value) => {
    const newCourseName = [...data.courseName];
    newCourseName[index] = value;
    handleChange("courseName", newCourseName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p>Required Certifications</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDegreeLevel}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          </div>

          {data.degreeLevel.map((degree, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg"
            >
              <div className="space-y-2">
                <SelectSearch
                  label="Degree Level *"
                  options={[
                    { value: "bsc", label: "BSC" },
                    { value: "masters", label: "Masters" },
                    { value: "phd", label: "PhD" },
                    { value: "diploma", label: "Diploma" },
                    { value: "certificate", label: "Certificate" },
                  ]}
                  value={degree}
                  onChange={(val) => updateDegreeLevel(index, val)}
                  placeholder="Select degree level"
                  clearable
                />
              </div>

              <div className="space-y-2">
                <Input
                  label="Course Name *"
                  value={data.courseName[index] || ""}
                  onChange={(e) => updateCourseName(index, e.target.value)}
                  placeholder="Enter course name"
                />
              </div>

              {data.degreeLevel.length > 1 && (
                <div className="md:col-span-2 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDegreeLevel(index)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Replace Textarea → Input type="textarea" */}
        <Input
          label="Preferred Educational Institution"
          type="textarea"
          value={data.preferredEducationalInstitution}
          onChange={(e) =>
            handleChange("preferredEducationalInstitution", e.target.value)
          }
          placeholder="Enter preferred educational institutions"
        />

        <Input
          label="Training and Trade Course"
          type="textarea"
          value={data.trainingAndTradeCourse}
          onChange={(e) =>
            handleChange("trainingAndTradeCourse", e.target.value)
          }
          placeholder="Enter relevant training and trade courses"
        />

        <Input
          label="Area of Experience"
          type="textarea"
          value={data.areaOfExperience}
          onChange={(e) => handleChange("areaOfExperience", e.target.value)}
          placeholder="Describe the required area of experience"
        />

        <Input
          label="Professional Certifications"
          type="textarea"
          value={data.professionalCertifications}
          onChange={(e) =>
            handleChange("professionalCertifications", e.target.value)
          }
          placeholder="List any required professional certifications"
        />

        <Input
          label="Additional Requirements"
          type="textarea"
          value={data.additionalRequirements}
          onChange={(e) =>
            handleChange("additionalRequirements", e.target.value)
          }
          placeholder="Any additional requirements"
        />

        <Input
          label="Skills"
          type="textarea"
          value={data.skills}
          onChange={(e) => handleChange("skills", e.target.value)}
          placeholder="List required skills"
        />

        {/* Switch → SwitchButton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SwitchButton
            onClick={() =>
              handleChange("fresherCanApply", !data.fresherCanApply)
            }
            enabled={data.fresherCanApply}
            enabledText="Yes"
            disabledText="No"
            label="Fresher Can Apply"
            className="flex items-center gap-2"
          />
          <SwitchButton
            onClick={() =>
              handleChange("experienceRequired", !data.experienceRequired)
            }
            enabled={data.experienceRequired}
            enabledText="Yes"
            disabledText="No"
            label="Experience Required"
            className="flex items-center gap-2"
          />
        </div>

        {/* Experience Years */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Minimum Year of Experience"
            type="number"
            value={data.minimumYearOfExperience}
            onChange={(e) =>
              handleChange("minimumYearOfExperience", e.target.value)
            }
            placeholder="Enter minimum years"
          />

          <Input
            label="Maximum Year of Experience"
            type="number"
            value={data.maximumYearOfExperience}
            onChange={(e) =>
              handleChange("maximumYearOfExperience", e.target.value)
            }
            placeholder="Enter maximum years"
          />
        </div>

        {/* Age */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Minimum Age"
            type="number"
            value={data.minimumAge}
            onChange={(e) => handleChange("minimumAge", e.target.value)}
            placeholder="Enter minimum age"
          />
          <Input
            label="Maximum Age"
            type="number"
            value={data.maximumAge}
            onChange={(e) => handleChange("maximumAge", e.target.value)}
            placeholder="Enter maximum age"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <SelectSearch
            label="Gender *"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "any", label: "Any" },
            ]}
            value={data.gender}
            onChange={(val) => handleChange("gender", val)}
            placeholder="Select gender preference"
            clearable
          />
        </div>
      </CardContent>
    </Card>
  );
}
