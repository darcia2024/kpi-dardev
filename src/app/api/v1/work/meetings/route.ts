import { hostedMeetingRequest } from "@/platform/work/hosted-meeting-http";
export async function GET(request: Request): Promise<Response> { return hostedMeetingRequest(request); }
export const POST = GET;
