import { z } from "zod";

import { serviceOptions } from "@/content/services";

/** Contact-form payload, validated in the browser before the WhatsApp handoff. */
export const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),

  email: z.email("Enter a valid work email").max(190),

  company: z.string().trim().max(160).optional().or(z.literal("")),

  service: z
    .string()
    .refine((value) => serviceOptions.includes(value), "Choose a service"),

  budget: z.string().trim().max(60).optional().or(z.literal("")),

  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters")
    .max(4000),

  /**
   * Honeypot. Real people never see this field, so anything in it is a bot.
   * Named innocuously because scrapers fill in fields called "website".
   *
   * Deliberately permissive: the form decides what to do with a filled
   * honeypot. Rejecting it here would tell the bot which field gave it away.
   */
  website: z.string().optional(),
});

/** Flattens a Zod error into { field: message } for rendering under inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !result[field]) {
      result[field] = issue.message;
    }
  }

  return result;
}
