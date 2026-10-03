import {hostedCaseRequest} from "@/platform/intake/hosted-case-http";
export const runtime="nodejs";
export async function GET(request:Request):Promise<Response>{return hostedCaseRequest(request);}
