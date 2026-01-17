export function validateMetadataAgainstSchema(
  metadata: Record<string, unknown> | undefined,
  schema: Record<string, any>,
) {
  if (!schema?.properties) return;

  const required: string[] = schema.required ?? [];

  for (const field of required) {
    if (!(field in (metadata ?? {}))) {
      throw new Error(`Missing required metadata field: ${field}`);
    }
  }
}
