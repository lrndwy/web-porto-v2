import { z } from 'zod'

/**
 * The public router's request contract. `.loose()` is deliberate: every other
 * OpenAI-compatible field (temperature, tools, stream, …) passes straight
 * through to the provider untouched.
 */
export const routerRequestSchema = z
  .object({
    model: z.string().min(1).max(200),
    messages: z
      .array(
        z.object({
          role: z.enum(['system', 'user', 'assistant', 'tool']),
          content: z.union([z.string(), z.array(z.unknown())]),
        }),
      )
      .min(1)
      .max(200),
  })
  .loose()

/** Admin payloads for the router screens. */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => (value ? value : null))

export const providerCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  base_url: z
    .url('Must be a full URL, e.g. https://api.openai.com/v1')
    .refine((value) => value.startsWith('https://'), 'The base URL must use https'),
  secret_api_key: optionalText(500),
  is_active: z.boolean(),
})

export const providerUpdateSchema = providerCreateSchema.partial()

export const modelSchema = z.object({
  provider_id: z.uuid(),
  model_name: z.string().trim().min(1).max(200),
  display_name: z.string().trim().min(1).max(200),
  input_price: z.number().min(0).nullable().optional(),
  output_price: z.number().min(0).nullable().optional(),
  is_active: z.boolean(),
})

export const modelUpdateSchema = modelSchema.partial()

export const routerSettingsSchema = z.object({
  is_enabled: z.boolean(),
  monthly_token_limit: z.number().int().min(0),
  requests_per_minute: z.number().int().min(0),
  requests_per_hour: z.number().int().min(0),
  requests_per_day: z.number().int().min(0),
  quota_exceeded_message: z.string().trim().min(1).max(300),
})
