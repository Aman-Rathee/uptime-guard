import * as z from "zod";

export const websiteSchema = z.object({
    url: z.url()
})