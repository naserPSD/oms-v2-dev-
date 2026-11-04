"use client";

/**
 * useRequiredFields.js
 *
 * Given a Zod schema, returns a Set of field names that are required
 * (i.e. NOT optional, NOT nullable with no default, and NOT z.any()).
 *
 * Usage:
 *   const requiredFields = useRequiredFields(schema);
 *   <Input required={requiredFields.has('name')} ... />
 */

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

/**
 * Unwrap Zod schema through ZodOptional, ZodNullable, ZodDefault wrappers.
 * Returns { isOptional, innerSchema }.
 */
function typeNameOf(schema) {
  return schema?._def?.typeName || schema?._def?.type || '';
}

function unwrapZod(schema) {
  let current = schema;
  let isOptional = false;
  const seen = new Set();

  while (current?._def && !seen.has(current)) {
    seen.add(current);
    const typeName = typeNameOf(current);

    if (
      typeName === 'ZodOptional' ||
      typeName === 'ZodNullable' ||
      typeName === 'ZodDefault'
    ) {
      isOptional = true;
      current = current._def.innerType;
      continue;
    }

    if (typeName === 'ZodEffects') {
      current = current._def.schema;
      continue;
    }

    if (
      typeName === 'ZodBranded' ||
      typeName === 'ZodCatch' ||
      typeName === 'ZodReadonly'
    ) {
      current = current._def.innerType;
      continue;
    }

    if (typeName === 'ZodPipeline') {
      current = current._def.in || current._def.out;
      continue;
    }

    break;
  }

  if (!current?._def) return { isOptional: true, innerSchema: current };
  return { isOptional, innerSchema: current };
}

/**
 * Checks if a Zod field schema represents a required field.
 * A field is required if:
 * - It is not ZodOptional / ZodNullable / ZodDefault
 * - AND if it's a string, it has at least one .min(n, ...) where n > 0
 *   OR it doesn't have .optional() anywhere in the chain
 */
function isFieldRequired(fieldSchema) {
  if (!fieldSchema) return false;

  const { isOptional, innerSchema } = unwrapZod(fieldSchema);

  // If the field is wrapped in optional/nullable/default => not required
  if (isOptional) return false;

  if (!innerSchema || !innerSchema._def) return false;

  const typeName = typeNameOf(innerSchema);

  // ZodString: required when empty input cannot pass (min 1, email, url, ...)
  if (typeName === 'ZodString') {
    const checks = innerSchema._def.checks || [];
    const hasMin1 = checks.some((c) => c.kind === 'min' && c.value >= 1);
    const rejectsEmpty = checks.some((c) =>
      [
        'email',
        'url',
        'uuid',
        'cuid',
        'cuid2',
        'ulid',
        'emoji',
        'datetime',
        'ip',
        'regex',
        'startsWith',
        'endsWith',
        'includes',
      ].includes(c.kind),
    );
    return hasMin1 || rejectsEmpty;
  }

  // ZodNumber, ZodBoolean, ZodEnum, ZodDate, ZodArray, ZodObject, ZodCoerce => required
  if (
    typeName === 'ZodNumber' ||
    typeName === 'ZodBoolean' ||
    typeName === 'ZodEnum' ||
    typeName === 'ZodDate' ||
    typeName === 'ZodArray' ||
    typeName === 'ZodObject' ||
    typeName === 'ZodNativeEnum'
  ) {
    return true;
  }

  // ZodCoerce — treat same as inner type
  if (typeName === 'ZodPipeline') {
    return isFieldRequired(innerSchema._def.in);
  }

  // ZodAny / ZodUnknown => not strictly required
  if (typeName === 'ZodAny' || typeName === 'ZodUnknown') {
    return false;
  }

  return false;
}

/**
 * Extract required field names from a Zod object schema.
 * Returns a Set<string> of required field names.
 */
export function getRequiredFields(zodSchema) {
  if (!zodSchema || !zodSchema._def) return new Set();

  let schema = zodSchema;

  // Unwrap ZodEffects (e.g. .refine(), .superRefine())
  while (typeNameOf(schema) === 'ZodEffects') {
    schema = schema._def.schema;
  }

  if (typeNameOf(schema) !== 'ZodObject') return new Set();

  const shape = schema._def.shape();
  const required = new Set();

  for (const [key, fieldSchema] of Object.entries(shape)) {
    if (isFieldRequired(fieldSchema)) {
      required.add(key);
    }
  }

  return required;
}

function stepIntoObject(schema) {
  let current = schema;
  const seen = new Set();
  while (current?._def && !seen.has(current)) {
    seen.add(current);
    const typeName = typeNameOf(current);
    if (typeName === 'ZodEffects') {
      current = current._def.schema;
      continue;
    }
    if (typeName === 'ZodPipeline') {
      current = current._def.out || current._def.in;
      continue;
    }
    if (
      typeName === 'ZodOptional' ||
      typeName === 'ZodNullable' ||
      typeName === 'ZodDefault' ||
      typeName === 'ZodBranded' ||
      typeName === 'ZodCatch' ||
      typeName === 'ZodReadonly'
    ) {
      current = current._def.innerType;
      continue;
    }
    if (typeName === 'ZodArray' || typeName === 'ZodSet') {
      current = current._def.type || current._def.element;
      continue;
    }
    if (typeName === 'ZodObject') return current;
    break;
  }
  return null;
}

/**
 * True when a dotted field path (e.g. "address.email" or "shifts.0.name")
 * is required by the Zod schema.
 */
export function isPathRequired(zodSchema, path) {
  if (!zodSchema || path == null || path === '') return false;
  const parts = String(path)
    .split('.')
    .filter((part) => part && !/^\d+$/.test(part));
  if (!parts.length) return false;

  let current = zodSchema;
  for (let i = 0; i < parts.length; i += 1) {
    const objectSchema = stepIntoObject(current);
    if (!objectSchema) return false;
    const shape =
      typeof objectSchema._def.shape === 'function'
        ? objectSchema._def.shape()
        : objectSchema._def.shape;
    const field = shape?.[parts[i]];
    if (!field) return false;
    if (i === parts.length - 1) return isFieldRequired(field);
    current = field;
  }
  return false;
}

/**
 * True when this field name is required by the nearest form schema.
 * Works for inputs rendered with register() inside <FormProvider>.
 */
export function useAutoRequired(name) {
  const ctx = useFormContext();
  const schema = ctx?.control?._options?.resolver?.zodSchema || null;
  return useMemo(() => {
    if (!schema || name == null || name === '') return false;
    return isPathRequired(schema, name);
  }, [schema, name]);
}

/**
 * React hook wrapper — memoizes the required fields set so it doesn't
 * recalculate on every render.
 *
 * @param {import('zod').ZodObject} zodSchema
 * @returns {Set<string>}
 *
 * @example
 * const schema = z.object({
 *   name: z.string().min(1, 'Required'),
 *   description: z.string().optional(),
 * });
 * const requiredFields = useRequiredFields(schema);
 * // requiredFields.has('name') === true
 * // requiredFields.has('description') === false
 */
export function useRequiredFields(zodSchema) {
  return useMemo(() => getRequiredFields(zodSchema), [zodSchema]);
}
