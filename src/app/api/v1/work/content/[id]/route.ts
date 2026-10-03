import { hostedContentRequest } from "@/platform/content/hosted-content-http";
export async function GET(request:Request,context:{params:Promise<{id:string}>}):Promise<Response>{return hostedContentRequest(request,(await context.params).id);}
export const POST=GET;
