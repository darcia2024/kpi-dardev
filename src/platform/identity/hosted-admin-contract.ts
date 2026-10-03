import { z } from "zod";
export const adminSetupSchema = z.object({ organizationCode:z.string().regex(/^[A-Z][A-Z0-9_]{1,63}$/),organizationName:z.string().trim().min(3).max(180),periodCode:z.string().regex(/^[A-Z0-9][A-Z0-9_/-]{1,63}$/),startsOn:z.iso.date(),endsOn:z.iso.date() }).strict().refine(value=>value.endsOn>=value.startsOn,"Tanggal akhir harus setelah tanggal mulai.");
export const adminDirectorySchema = z.object({ organizations:z.array(z.object({id:z.string().uuid(),code:z.string(),name:z.string()})),periods:z.array(z.object({id:z.string().uuid(),organizationId:z.string().uuid(),code:z.string(),startsOn:z.string(),endsOn:z.string(),status:z.string()})) });
export type AdminDirectory = z.infer<typeof adminDirectorySchema>;
