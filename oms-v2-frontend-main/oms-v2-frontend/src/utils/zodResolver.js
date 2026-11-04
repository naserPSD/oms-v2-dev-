import { zodResolver as baseZodResolver } from "@hookform/resolvers/zod";

/**
 * Same API as @hookform/resolvers/zod, but keeps the schema on the
 * resolver so form fields can show a red * for required labels.
 */
export function zodResolver(schema, schemaOptions, resolverOptions) {
  const resolver = baseZodResolver(schema, schemaOptions, resolverOptions);
  resolver.zodSchema = schema;
  return resolver;
}
