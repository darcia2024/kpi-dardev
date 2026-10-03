import { hostedContentRequest } from "@/platform/content/hosted-content-http";
export async function GET(request:Request):Promise<Response>{return hostedContentRequest(request);}
export const POST=GET;
