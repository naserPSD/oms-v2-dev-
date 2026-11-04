"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function StepNavigation({
  currentStep,
  totalSteps,
  onSave,
  onNext,
  onPrevious,
  canProceed = true,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    }
    if (currentStep > 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", (currentStep - 1).toString());
      router.push(`?${params.toString()}`);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    }
    if (currentStep < totalSteps) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", (currentStep + 1).toString());
      router.push(`?${params.toString()}`);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <div>
        {currentStep > 1 && (
          <Button variant="outline" onClick={handlePrevious}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button variant="outline" onClick={handleSave}>
          Save
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={handleNext} disabled={!canProceed}>
            Save & Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={!canProceed}>
            Submit Job
          </Button>
        )}
      </div>
    </div>
  );
}
