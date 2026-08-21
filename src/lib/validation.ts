import { z } from "zod";

import { serviceOptions } from "@/content/services";

/**
 * Contact-form payload. Shared by the client form and the API route so both
 * sides agree on the rules and the browser never sends something the server
 * will silently reject.
 */
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
   * Deliberately permissive: the API route decides what to do with a filled
   * honeypot. Rejecting it here would tell the bot which field gave it away.
   */
  website: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** Budget bands offered in the contact form dropdown. */
export const budgetOptions = [
  "Under $5,000",
  "$5,000 – $25,000",
  "$25,000 – $100,000",
  "$100,000+",
  "Not sure yet",
];

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
