import assert from "node:assert/strict";
import test from "node:test";
import {createHostedDatabase,hostedFixture,loginHostedFixture} from "./fixtures/hosted-database";
import {assetHash,validateHostedFile,scanHostedFile} from "../src/platform/storage/hosted-assets";
test("hosted file policy rejects spoofed types and scanner fails closed",async()=>{
 const bytes=new TextEncoder().encode("Dokumen berisi catatan kegiatan.");const hash=assetHash(bytes);
 assert.equal(validateHostedFile("report.txt","text/plain",bytes),true);
 assert.equal(validateHostedFile("report.pdf","application/pdf",bytes),false);
 assert.equal(validateHostedFile("../../report.txt","text/plain",bytes),false);
 assert.equal(validateHostedFile("report.txt","text/plain",new Uint8Array([0,1])),false);
 const oldUrl=process.env.KPI_FILE_SCANNER_URL,oldToken=process.env.KPI_FILE_SCANNER_TOKEN;
 try{delete process.env.KPI_FILE_SCANNER_URL;delete process.env.KPI_FILE_SCANNER_TOKEN;assert.equal(await scanHostedFile(bytes,hash,"text/plain"),"PENDING_SCAN");
 process.env.KPI_FILE_SCANNER_URL="https://scanner.example.invalid";process.env.KPI_FILE_SCANNER_TOKEN="fixture-not-a-real-credential";
 let sent=false;assert.equal(await scanHostedFile(bytes,hash,"text/plain",async()=>{sent=true;return Response.json({clean:true,sha256:hash});},async()=>false),"PENDING_SCAN");assert.equal(sent,false);
 assert.equal(await scanHostedFile(bytes,hash,"text/plain",async()=>Response.json({clean:true,sha256:"wrong"})),"PENDING_SCAN");
 assert.equal(await scanHostedFile(bytes,hash,"text/plain",async()=>Response.json({clean:true,sha256:hash}),async()=>true),"AVAILABLE");
 assert.equal(await scanHostedFile(bytes,hash,"text/plain",async()=>Response.json({clean:false,sha256:hash}),async()=>true),"REJECTED");
 assert.equal(await scanHostedFile(bytes,hash,"text/plain",async()=>{throw new Error("network");}),"PENDING_SCAN");
 }finally{if(oldUrl===undefined)delete process.env.KPI_FILE_SCANNER_URL;else process.env.KPI_FILE_SCANNER_URL=oldUrl;if(oldToken===undefined)delete process.env.KPI_FILE_SCANNER_TOKEN;else process.env.KPI_FILE_SCANNER_TOKEN=oldToken;}
});
test("hosted assets are private, scoped, idempotent and cannot download before trusted scan",async()=>{
 const db=await createHostedDatabase(["migrations/20261002000800_hosted_assets.sql"],["ASSET_UPLOAD","ASSET_DOWNLOAD"]);
 const sha="a".repeat(64),input={name:"pedoman.pdf",mimeType:"application/pdf",sizeBytes:100,sha256:sha,idempotencyKey:"00000000-0000-4000-8000-000000000099"};
 try{await loginHostedFixture(db,hostedFixture.owner);
 const create=(body=input)=>db.query<{asset:{id:string;status:string}}>("select public.kpi_asset_register('KPI','CURRENT',$1::jsonb) asset",[JSON.stringify(body)]);
 const asset=(await create()).rows[0].asset;
 assert.equal((await create()).rows[0].asset.id,asset.id);
 await assert.rejects(create({...input,sizeBytes:101}),/Request key already used/);
 await assert.rejects(db.query("select public.kpi_asset_download($1)",[asset.id]),/not cleared/);
 await assert.rejects(db.query("select public.kpi_asset_finish($1,$2,'AVAILABLE')",[asset.id,sha]),/permission denied/);
 await db.exec("reset role;set role service_role;");
 await assert.rejects(db.query("select public.kpi_asset_finish($1,$2,'AVAILABLE')",[asset.id,"b".repeat(64)]),/Invalid asset completion/);
 await db.query("select public.kpi_asset_finish($1,$2,'AVAILABLE')",[asset.id,sha]);
 await loginHostedFixture(db,hostedFixture.owner);assert.equal((await db.query("select public.kpi_asset_download($1)",[asset.id])).rows.length,1);
 await loginHostedFixture(db,hostedFixture.stranger);await assert.rejects(db.query("select public.kpi_asset_download($1)",[asset.id]),/Access denied/);
 await db.exec(`reset role;update identity.permission_grants set revoked_at=now() where account_id='${hostedFixture.owner}';`);await loginHostedFixture(db,hostedFixture.owner);await assert.rejects(db.query("select public.kpi_asset_download($1)",[asset.id]),/Access denied/);
 await db.exec("reset role;");assert.equal((await db.query<{public:boolean}>("select public from storage.buckets where id='kpi-private'")).rows[0].public,false);
 }finally{await db.close();}
});
