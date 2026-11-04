"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function PreviewStep({ data }) {
  const { primaryInfo, jobInfo, educationInfo } = data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Job Vacancy Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Requirements */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Primary Requirements
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Job Title:</strong> {primaryInfo.jobTitle}
                  </div>
                  <div>
                    <strong>No. Of Vacancy:</strong>{" "}
                    {primaryInfo.numberOfVacancy}
                  </div>
                  <div>
                    <strong>Job Category:</strong> {primaryInfo.jobCategory}
                  </div>
                  <div>
                    <strong>Employment Status:</strong>{" "}
                    {primaryInfo.employmentStatus}
                  </div>
                  <div>
                    <strong>Application Deadline:</strong>{" "}
                    {primaryInfo.applicationDeadline}
                  </div>
                  <div>
                    <strong>Resume Receiving Option:</strong>{" "}
                    {primaryInfo.resumeReceivingOption}
                  </div>
                  {primaryInfo.specialInstruction && (
                    <div>
                      <strong>Special Instruction:</strong>{" "}
                      {primaryInfo.specialInstruction}
                    </div>
                  )}
                  <div>
                    <strong>Required Photo:</strong>{" "}
                    {primaryInfo.requiredPhoto ? "Yes" : "No"}
                  </div>
                </div>
              </div>
              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Job Requirements</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Job Level:</strong> {jobInfo.jobLevel}
                  </div>
                  <div>
                    <strong>Job Responsibilities:</strong>{" "}
                    {jobInfo.jobResponsibilities}
                  </div>
                  <div>
                    <strong>Job Context:</strong> {jobInfo.jobContext}
                  </div>
                  <div>
                    <strong>Job Location:</strong> {jobInfo.jobLocation}
                  </div>
                  <div>
                    <strong>Work Place:</strong> {jobInfo.workPlace}
                  </div>
                  {jobInfo.showSalaryRange && (
                    <>
                      <div>
                        <strong>Minimum Salary:</strong> {jobInfo.minimumSalary}
                        /-
                      </div>
                      <div>
                        <strong>Maximum Salary:</strong> {jobInfo.maximumSalary}
                        /-
                      </div>
                      {jobInfo.additionalSalaryInfo && (
                        <div>
                          <strong>Additional Salary:</strong>{" "}
                          {jobInfo.additionalSalaryInfo}
                        </div>
                      )}
                      <div>
                        <strong>Salary Negotiable:</strong>{" "}
                        {jobInfo.salaryNegotiable ? "Yes" : "No"}
                      </div>
                      <div>
                        <strong>Show Salary Range:</strong>{" "}
                        {jobInfo.showSalaryRange ? "Yes" : "No"}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Education Requirements
                </h3>
                <div className="space-y-2 text-sm">
                  {educationInfo.preferredEducationalInstitution && (
                    <div>
                      <strong>Preferred Educational Institution:</strong>{" "}
                      {educationInfo.preferredEducationalInstitution}
                    </div>
                  )}
                  {educationInfo.trainingAndTradeCourse && (
                    <div>
                      <strong>Training and Trade Course:</strong>{" "}
                      {educationInfo.trainingAndTradeCourse}
                    </div>
                  )}
                  {educationInfo.areaOfExperience && (
                    <div>
                      <strong>Area of experience:</strong>{" "}
                      {educationInfo.areaOfExperience}
                    </div>
                  )}
                  {educationInfo.professionalCertifications && (
                    <div>
                      <strong>Professional Certifications:</strong>{" "}
                      {educationInfo.professionalCertifications}
                    </div>
                  )}
                  {educationInfo.additionalRequirements && (
                    <div>
                      <strong>Additional Requirements:</strong>{" "}
                      {educationInfo.additionalRequirements}
                    </div>
                  )}
                  {educationInfo.skills && (
                    <div>
                      <strong>Skills:</strong> {educationInfo.skills}
                    </div>
                  )}
                  <div>
                    <strong>Fresher can apply:</strong>{" "}
                    {educationInfo.fresherCanApply ? "Yes" : "No"}
                  </div>
                  <div>
                    <strong>Experience Required:</strong>{" "}
                    {educationInfo.experienceRequired ? "Yes" : "No"}
                  </div>
                  {educationInfo.minimumYearOfExperience &&
                    educationInfo.maximumYearOfExperience && (
                      <div>
                        <strong>Experience Range:</strong>{" "}
                        {educationInfo.minimumYearOfExperience} -{" "}
                        {educationInfo.maximumYearOfExperience} Year(s)
                      </div>
                    )}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Others Requirements
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Gender:</strong> {educationInfo.gender}
                  </div>
                  {educationInfo.minimumAge && educationInfo.maximumAge && (
                    <div>
                      <strong>Age Range:</strong> {educationInfo.minimumAge} to{" "}
                      {educationInfo.maximumAge} years
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Summary Sidebar */}
            <div className="space-y-4">
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Job Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <strong>Published On:</strong>{" "}
                    {new Date().toLocaleDateString()}
                  </div>
                  <div>
                    <strong>No. Of Vacancy:</strong>{" "}
                    {primaryInfo.numberOfVacancy}
                  </div>
                  <div>
                    <strong>Employment Status:</strong>{" "}
                    {primaryInfo.employmentStatus}
                  </div>
                  {educationInfo.minimumYearOfExperience &&
                    educationInfo.maximumYearOfExperience && (
                      <div>
                        <strong>Experience Range:</strong>{" "}
                        {educationInfo.minimumYearOfExperience} -{" "}
                        {educationInfo.maximumYearOfExperience} Year(s)
                      </div>
                    )}
                  {educationInfo.minimumAge && educationInfo.maximumAge && (
                    <div>
                      <strong>Age Range:</strong> {educationInfo.minimumAge} to{" "}
                      {educationInfo.maximumAge} years
                    </div>
                  )}
                  <div>
                    <strong>Job Location:</strong> {jobInfo.jobLocation}
                  </div>
                  {jobInfo.showSalaryRange && (
                    <div>
                      <strong>Salary:</strong> {jobInfo.minimumSalary} -{" "}
                      {jobInfo.maximumSalary}
                    </div>
                  )}
                  <div>
                    <strong>Application Deadline:</strong>{" "}
                    {primaryInfo.applicationDeadline}
                  </div>
                </CardContent>
              </Card>

              {educationInfo.degreeLevel.length > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Required Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {educationInfo.degreeLevel.map((degree, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="font-medium">
                            {degree.toUpperCase()}
                          </span>
                          <span>{educationInfo.courseName[index]}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
