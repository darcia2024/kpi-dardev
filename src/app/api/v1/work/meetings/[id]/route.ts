import { hostedMeetingRequest } from "@/platform/work/hosted-meeting-http";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> { return hostedMeetingRequest(request, (await context.params).id); }
export const POST = GET;
