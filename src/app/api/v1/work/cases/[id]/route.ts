import {hostedCaseRequest} from "@/platform/intake/hosted-case-http";
export const runtime="nodejs";
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,context:Context):Promise<Response>{return hostedCaseRequest(request,(await context.params).id);}
export async function POST(request:Request,context:Context):Promise<Response>{return hostedCaseRequest(request,(await context.params).id);}
