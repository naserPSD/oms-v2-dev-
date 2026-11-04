"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const hasAsterisk = (val) => {
  if (!val) return false;
  if (typeof val === "string") return val.includes("*");
  if (typeof val === "number") return false;
  if (Array.isArray(val)) return val.some(hasAsterisk);
  if (React.isValidElement(val)) {
    return hasAsterisk(val.props?.children);
  }
  return false;
};

function Label({
  className,
  required = false,
  children,
  ...props
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-sm leading-4 font-medium text-foreground select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 inline-flex items-center gap-1 whitespace-nowrap",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {(required || props.required) && !hasAsterisk(children) && (
        <span className="text-red-500 font-bold select-none leading-none">*</span>
      )}
    </LabelPrimitive.Root>
  );
}

Label.displayName = "Label";

export { Label }
