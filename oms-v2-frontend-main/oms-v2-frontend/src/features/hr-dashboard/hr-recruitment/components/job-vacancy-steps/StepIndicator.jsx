"use client";

import { cn } from "@/lib/utils";
import { User, Briefcase, GraduationCap, Eye } from "lucide-react";

const stepIcons = [User, Briefcase, GraduationCap, Eye];
const stepLabels = [
  "Primary Info",
  "Job Info",
  "Education Info",
  "Preview & Complete",
];

export function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex flex-wrap items-start justify-center mb-8 px-2 sm:px-4 gap-y-4">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const Icon = stepIcons[index];
        const isLast = index === totalSteps - 1;

        return (
          <div key={stepNumber} className="flex items-start min-w-[80px]">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  // Responsive icon size
                  "flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300",
                  isActive &&
                    "border-primary bg-primary text-primary-foreground scale-110 shadow-lg",
                  isCompleted &&
                    "border-primary bg-primary text-primary-foreground",
                  !isActive &&
                    !isCompleted &&
                    "border-muted-foreground bg-background"
                )}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span
                className={cn(
                  // Responsive label size
                  "mt-2 sm:mt-3 text-xs sm:text-sm font-medium transition-colors duration-300 text-center max-w-[72px] sm:max-w-24",
                  isActive && "text-primary font-semibold",
                  isCompleted && "text-primary",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                {stepLabels[index]}
              </span>
            </div>

            {!isLast && (
              <div className="flex items-center mx-2 sm:mx-4 mt-5 sm:mt-6">
                <div className="w-10 sm:w-16 h-1 bg-muted rounded-full relative overflow-hidden">
                  <div
                    className={cn(
                      "absolute left-0 top-0 h-full bg-primary transition-all duration-500 ease-in-out rounded-full",
                      isCompleted ? "w-full" : "w-0"
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
