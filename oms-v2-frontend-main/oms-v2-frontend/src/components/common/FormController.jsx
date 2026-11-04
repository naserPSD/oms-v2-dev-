"use client";
/**
 * FormController.jsx
 *
 * Drop-in replacement for react-hook-form's <Controller> that automatically
 * passes `required={true}` to the rendered field component when the field
 * is listed in the `requiredFields` Set provided via the nearest
 * <RequiredFieldsProvider> context — OR when `requiredFields` is passed
 * directly as a prop.
 *
 * Usage (with context):
 *   <RequiredFieldsProvider schema={zodSchema}>
 *     <FormController name="title" control={control} render={...} />
 *   </RequiredFieldsProvider>
 *
 * Usage (with prop):
 *   <FormController name="title" control={control} requiredFields={requiredFields} render={...} />
 */

import React, { createContext, useContext, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { getRequiredFields, isPathRequired } from "@/hooks/useRequiredFields";

// ─── Context ──────────────────────────────────────────────────────────────────

const RequiredFieldsContext = createContext(new Set());

/**
 * Wrap your form (or the section containing form fields) with this provider
 * to automatically propagate required field information down to FormController.
 *
 * @param {{ schema: import('zod').ZodObject, children: React.ReactNode }} props
 */
export function RequiredFieldsProvider({ schema, children }) {
  const requiredFields = useMemo(
    () => (schema ? getRequiredFields(schema) : new Set()),
    [schema]
  );

  return (
    <RequiredFieldsContext.Provider value={requiredFields}>
      {children}
    </RequiredFieldsContext.Provider>
  );
}

/**
 * Custom hook — returns the requiredFields Set from the nearest
 * RequiredFieldsProvider, or an empty Set if no provider is present.
 */
export function useRequiredFieldsContext() {
  return useContext(RequiredFieldsContext);
}

// ─── FormController ────────────────────────────────────────────────────────────

/**
 * Drop-in replacement for <Controller> that injects `required` into the
 * rendered field component automatically.
 *
 * @param {object} props - All react-hook-form Controller props, plus:
 *   @param {Set<string>} [props.requiredFields] - Override context with explicit Set
 */
function schemaFromControl(control) {
  return control?._options?.resolver?.zodSchema || null;
}

function childrenHaveStar(children) {
  if (children == null || typeof children === "boolean") return false;
  if (typeof children === "string" || typeof children === "number") {
    return String(children).includes("*");
  }
  if (Array.isArray(children)) return children.some(childrenHaveStar);
  if (React.isValidElement(children)) {
    return childrenHaveStar(children.props?.children);
  }
  return false;
}

function hasVisibleLabel(props) {
  const label = props.label ?? props.checkboxLabel;
  return label != null && label !== "" && label !== false;
}

function isLabelComponent(type) {
  if (type === "label") return "native";
  const name = type?.displayName || type?.name;
  if (name === "Label") return "component";
  return null;
}

function injectRequired(element) {
  if (!React.isValidElement(element)) return element;
  const props = element.props || {};
  const labelKind = isLabelComponent(element.type);

  if (labelKind) {
    if (props.required || childrenHaveStar(props.children)) return element;
    if (labelKind === "component") {
      return React.cloneElement(element, { required: true });
    }
    return React.cloneElement(
      element,
      props,
      props.children,
      <span
        key="req-star"
        className="text-red-500 font-bold select-none leading-none"
      >
        *
      </span>,
    );
  }

  if (hasVisibleLabel(props)) {
    if (props.required) return element;
    return React.cloneElement(element, { required: true });
  }

  if (props.children == null) return element;
  const children = React.Children.map(props.children, (child) =>
    injectRequired(child),
  );
  return React.cloneElement(element, {}, children);
}

export function FormController({
  name,
  render,
  control,
  requiredFields: propRequiredFields,
  ...rest
}) {
  const formContext = useFormContext();
  const resolvedControl = control || formContext?.control;
  const contextRequiredFields = useRequiredFieldsContext();
  const schema = schemaFromControl(resolvedControl);

  const isRequired = propRequiredFields
    ? propRequiredFields.has(name)
    : schema
      ? isPathRequired(schema, name)
      : Boolean(contextRequiredFields?.has(name));

  return (
    <Controller
      name={name}
      control={resolvedControl || undefined}
      {...rest}
      render={(renderProps) => {
        const element = render(renderProps);
        if (!isRequired) return element;
        return injectRequired(element);
      }}
    />
  );
}

export default FormController;

/**
 * FormWithRequiredFields
 * 
 * Wrap a <form> with this component to automatically provide required field
 * information to all FormController children.
 *
 * Usage:
 *   <FormWithRequiredFields requiredFields={requiredFields} onSubmit={handleSubmit(submit)}>
 *     <FormController name="title" control={control} render={...} />
 *   </FormWithRequiredFields>
 *
 * @param {{ requiredFields: Set<string>, schema?: import('zod').ZodObject, onSubmit?: Function, className?: string, children: React.ReactNode }} props
 */
export function FormWithRequiredFields({
  requiredFields: propRequiredFields,
  schema,
  onSubmit,
  className,
  children,
  ...formProps
}) {
  const resolvedFields = useMemo(() => {
    if (propRequiredFields) return propRequiredFields;
    if (schema) return getRequiredFields(schema);
    return new Set();
  }, [propRequiredFields, schema]);

  return (
    <RequiredFieldsContext.Provider value={resolvedFields}>
      <form onSubmit={onSubmit} className={className} {...formProps}>
        {children}
      </form>
    </RequiredFieldsContext.Provider>
  );
}
