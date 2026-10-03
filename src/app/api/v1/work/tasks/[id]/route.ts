import { hostedTaskRequest } from "@/platform/work/hosted-task-http";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  return hostedTaskRequest(request, (await context.params).id);
}
export const POST = GET;
