import { z } from "zod";

const environmentSchema = z.object({
  KPI_APP_ENV: z.enum(["local", "staging", "production"]),
  KPI_APP_NAME: z.literal("kpi-ppmi-mesir"),
  KPI_REQUEST_ID_HEADER: z.literal("x-request-id")
});

export type AppEnvironment = z.infer<typeof environmentSchema>;

export function parseEnvironment(values: Record<string, string | undefined>): AppEnvironment {
  return environmentSchema.parse({
    KPI_APP_ENV: values.KPI_APP_ENV,
    KPI_APP_NAME: values.KPI_APP_NAME,
    KPI_REQUEST_ID_HEADER: values.KPI_REQUEST_ID_HEADER
  });
}
