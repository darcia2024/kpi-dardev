import { hostedTaskRequest } from "@/platform/work/hosted-task-http";
export async function GET(request: Request): Promise<Response> { return hostedTaskRequest(request); }
export const POST = GET;
