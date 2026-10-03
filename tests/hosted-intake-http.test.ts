import assert from "node:assert/strict";
import test from "node:test";
import {intakeFingerprint,intakeTokenHash} from "../src/platform/intake/hosted-public-intake";
test("intake stores a token digest and only fingerprints trusted Vercel ingress",()=>{
 const request=new Request("https://kpi.example/",{headers:{"x-vercel-forwarded-for":"192.0.2.1"}});
 const config={KPI_SUPABASE_URL:"https://example.supabase.co",KPI_SUPABASE_SERVICE_ROLE_KEY:"fixture-secret",VERCEL:"1"};
 assert.equal(intakeFingerprint(request,{}),null);
 assert.match(intakeFingerprint(request,config)!,/^[a-f0-9]{64}$/);
 assert.equal(intakeFingerprint(new Request(request.url,{headers:{"x-vercel-forwarded-for":"forged-address"}}),config),null);
 assert.notEqual(intakeTokenHash("a".repeat(64)),"a".repeat(64));
 assert.notEqual(intakeFingerprint(request,config),intakeFingerprint(request,{...config,KPI_SUPABASE_SERVICE_ROLE_KEY:"different-secret"}));
});
