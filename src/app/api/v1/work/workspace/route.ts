import {managementHttp} from '@/platform/work/hosted-management-http';
export async function GET(request:Request){return managementHttp(request,'workspace');}
