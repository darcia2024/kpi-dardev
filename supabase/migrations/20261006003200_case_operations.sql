begin;
alter table intake.case_forms add column stage text not null default 'DRAFT' check(stage in ('DRAFT','SUBMITTED','CHANGES_REQUESTED','REVIEWED','AUTHORIZATION_RECORDED'));
create table intake.case_field_definitions(code text not null,section text not null,field text not null,kind text not null,choice_group text,primary key(code,section,field));
create table intake.case_form_events(id uuid primary key default gen_random_uuid(),form_id uuid not null references intake.case_forms(id),version integer not null,action text not null,note text not null,reference text not null default '',asset_id uuid references files.managed_assets(id),actor_account_id uuid not null references identity.accounts(id),created_at timestamptz not null default now());
create table intake.case_evidence(id uuid primary key,case_id uuid not null references intake.cases(id),version integer not null default 1,fields jsonb not null,author_account_id uuid not null references identity.accounts(id),updated_at timestamptz not null default now());
create table intake.case_evidence_events(id uuid primary key default gen_random_uuid(),evidence_id uuid not null references intake.case_evidence(id),version integer not null,action text not null,note text not null,snapshot jsonb not null,actor_account_id uuid not null references identity.accounts(id),created_at timestamptz not null default now());
alter table intake.case_field_definitions enable row level security;
alter table intake.case_form_events enable row level security;
alter table intake.case_evidence enable row level security;
alter table intake.case_evidence_events enable row level security;
revoke all on intake.case_field_definitions,intake.case_form_events,intake.case_evidence,intake.case_evidence_events from public,anon,authenticated;

insert into intake.case_field_definitions(code,section,field,kind) select split_part(v,'|',1),split_part(v,'|',2),split_part(v,'|',3),trim(both E'\r' from split_part(v,'|',4)) from unnest(string_to_array($fields$01|HEADER|f1|text
01|HEADER|f2|text
01|HEADER|f3|text
01|HEADER|f4|text
01|HEADER|f5|date
01|HEADER|f6|text
01|HEADER|f7|text
01|HEADER|evidence_refs|evidence
01|A|f1|text
01|A|f2|text
01|A|f3|text
01|A|f4|tel
01|A|f5|text
01|A|f6|checkbox
01|A|f7|checkbox
01|A|f8|checkbox
01|A|f9|checkbox
01|A|f10|text
01|B|f1|text
01|B|f2|text
01|B|f3|text
01|B|f4|tel
01|B|f5|text
01|C|f1|text
01|C|f2|text
01|C|f3|text
01|C|f4|text
01|C|f5|text
01|D|f1|checkbox
01|D|f2|checkbox
01|D|f3|checkbox
01|D|f4|checkbox
01|D|f5|checkbox
01|D|f6|checkbox
01|D|f7|checkbox
01|D|f8|checkbox
01|D|f9|checkbox
01|D|f10|checkbox
01|D|f11|checkbox
01|D|f12|text
01|G|f1|text
01|G|f2|checkbox
01|G|f3|checkbox
01|G|f4|checkbox
01|G|f5|checkbox
01|G|f6|checkbox
01|G|f7|text
01|H|f1|text
01|I|f1|text
01|I|f2|text
01|I|f3|date
01|J|f1|text
01|J|f2|date
01|J|f3|text
01|J|f4|date
01|J|f5|text
01|J|f6|text
01|J|f7|checkbox
01|J|f8|checkbox
01|J|f9|checkbox
01|J|f10|checkbox
01|J|f11|checkbox
01|J|f12|date
02|HEADER|f1|text
02|HEADER|f2|text
02|HEADER|f3|text
02|HEADER|f4|text
02|HEADER|f5|text
02|HEADER|f6|date
02|HEADER|f7|text
02|HEADER|f8|text
02|HEADER|f9|text
02|HEADER|f10|text
02|HEADER|evidence_refs|evidence
02|A|f1|text
02|A|f2|text
02|A|f3|text
02|A|f4|date
02|A|f5|text
02|A|f6|checkbox
02|A|f7|checkbox
02|A|f8|checkbox
02|A|f9|checkbox
02|A|f10|checkbox
02|B|f1|text
02|B|f2|checkbox
02|B|f3|checkbox
02|B|f4|checkbox
02|B|f5|checkbox
02|B|f6|checkbox
02|B|f7|checkbox
02|B|f8|checkbox
02|B|f9|checkbox
02|B|f10|text
02|C|f1|checkbox
02|C|f2|checkbox
02|C|f3|checkbox
02|C|f4|text
02|C|f5|checkbox
02|C|f6|checkbox
02|C|f7|checkbox
02|C|f8|text
02|C|f9|checkbox
02|C|f10|checkbox
02|C|f11|checkbox
02|C|f12|checkbox
02|C|f13|text
02|C|f14|checkbox
02|C|f15|checkbox
02|C|f16|checkbox
02|C|f17|text
02|D|f1|date
02|D|f2|text
02|D|f3|text
02|D|f4|text
02|D|f5|text
02|D|f6|text
02|E|f1|checkbox
02|E|f2|checkbox
02|E|f3|checkbox
02|E|f4|text
02|E|f5|checkbox
02|E|f6|checkbox
02|E|f7|checkbox
02|E|f8|checkbox
02|E|f9|checkbox
02|E|f10|checkbox
02|E|f11|text
02|E|f12|checkbox
02|E|f13|checkbox
02|E|f14|checkbox
02|E|f15|checkbox
02|E|f16|checkbox
02|E|f17|text
02|F|f1|text
02|F|f2|checkbox
02|F|f3|checkbox
02|F|f4|checkbox
02|F|f5|checkbox
02|F|f6|text
02|F|f7|checkbox
02|F|f8|checkbox
02|F|f9|checkbox
02|F|f10|checkbox
02|F|f11|checkbox
02|F|f12|checkbox
02|F|f13|checkbox
02|F|f14|text
02|F|f15|text
02|G|f1|text
02|G|f2|checkbox
02|G|f3|checkbox
02|G|f4|checkbox
02|G|f5|checkbox
02|G|f6|checkbox
02|G|f7|text
02|H|f1|text
02|H|f2|checkbox
02|H|f3|checkbox
02|H|f4|checkbox
02|H|f5|checkbox
02|H|f6|text
02|H|f7|checkbox
02|H|f8|checkbox
02|H|f9|checkbox
02|H|f10|checkbox
02|H|f11|checkbox
02|H|f12|checkbox
02|H|f13|checkbox
02|H|f14|text
02|I|f1|text
02|I|f2|checkbox
02|I|f3|checkbox
02|I|f4|checkbox
02|I|f5|checkbox
02|I|f6|checkbox
02|I|f7|checkbox
02|I|f8|checkbox
02|I|f9|checkbox
02|I|f10|checkbox
02|I|f11|text
02|J|f1|text
02|J|f2|text
02|J|f3|text
02|K|f1|text
02|K|f2|date
02|K|f3|text
02|K|f4|date
02|K|f5|text
02|K|f6|checkbox
02|K|f7|checkbox
02|K|f8|checkbox
02|K|f9|checkbox
02|K|f10|checkbox
02|K|f11|checkbox
02|K|f12|checkbox
02|K|f13|checkbox
02|K|f14|text
02|K|f15|date
02|L|f1|text
02|L|f2|text
03|HEADER|f1|text
03|HEADER|f2|text
03|HEADER|f3|text
03|HEADER|f4|text
03|HEADER|f5|text
03|HEADER|f6|date
03|HEADER|f7|checkbox
03|HEADER|f8|checkbox
03|HEADER|f9|checkbox
03|HEADER|f10|checkbox
03|HEADER|f11|text
03|HEADER|evidence_refs|evidence
03|A|f1|text
03|A|f2|text
03|A|f3|text
03|A|f4|text
03|A|f5|tel
03|A|f6|text
03|A|f7|text
03|A|f8|checkbox
03|A|f9|checkbox
03|A|f10|checkbox
03|A|f11|checkbox
03|A|f12|checkbox
03|A|f13|checkbox
03|B|f1|text
03|B|f2|checkbox
03|B|f3|checkbox
03|B|f4|checkbox
03|B|f5|checkbox
03|B|f6|checkbox
03|B|f7|checkbox
03|B|f8|checkbox
03|B|f9|checkbox
03|B|f10|text
03|C|f1|text
03|C|f2|checkbox
03|C|f3|checkbox
03|C|f4|checkbox
03|C|f5|checkbox
03|C|f6|checkbox
03|C|f7|checkbox
03|C|f8|checkbox
03|C|f9|checkbox
03|C|f10|text
03|D|f1|text
03|D|f2|text
03|D|f3|text
03|D|f4|text
03|D|f5|text
03|E|f1|text
03|F|f1|text
03|G|f1|text
03|G|f2|checkbox
03|G|f3|checkbox
03|G|f4|checkbox
03|G|f5|checkbox
03|G|f6|checkbox
03|G|f7|checkbox
03|G|f8|checkbox
03|G|f9|text
03|H|f1|date
03|H|f2|text
03|H|f3|text
03|H|f4|text
03|H|f5|text
03|H|f6|text
03|I|f1|text
03|I|f2|checkbox
03|I|f3|checkbox
03|I|f4|checkbox
03|I|f5|checkbox
03|I|f6|text
03|I|f7|text
03|I|f8|date
03|I|f9|text
03|J|f1|text
03|J|f2|date
03|K|f1|text
03|K|f2|text
03|K|f3|text
03|K|f4|text
03|K|f5|text
03|K|f6|text
03|K|f7|text
03|L|f1|date
03|L|f2|text
03|L|f3|text
03|L|f4|text
03|L|f5|text
03|L|f6|text
03|M|f1|text
03|M|f2|checkbox
03|M|f3|checkbox
03|M|f4|checkbox
03|M|f5|checkbox
03|M|f6|checkbox
03|M|f7|checkbox
03|M|f8|checkbox
03|M|f9|checkbox
03|M|f10|text
03|N|f1|text
03|N|f2|checkbox
03|N|f3|checkbox
03|N|f4|checkbox
03|N|f5|checkbox
03|N|f6|checkbox
03|N|f7|checkbox
03|N|f8|checkbox
03|N|f9|text
03|O|f1|text
03|P|f1|text
03|P|f2|text
03|Q|f1|text
03|Q|f2|date
03|Q|f3|text
03|Q|f4|date
04|HEADER|f1|text
04|HEADER|f2|text
04|HEADER|f3|text
04|HEADER|f4|text
04|HEADER|f5|date
04|HEADER|f6|text
04|HEADER|f7|text
04|HEADER|f8|checkbox
04|HEADER|f9|checkbox
04|HEADER|f10|checkbox
04|HEADER|evidence_refs|evidence
04|A|f1|text
04|A|f2|text
04|A|f3|text
04|A|f4|text
04|A|f5|text
04|A|f6|text
04|A|f7|text
04|A|f8|text
04|A|f9|text
04|A|f10|tel
04|A|f11|text
04|A|f12|text
04|A|f13|text
04|A|f14|text
04|A|f15|text
04|A|f16|text
04|A|f17|text
04|B|f1|text
04|B|f2|date
04|B|f3|date
04|B|f4|text
04|B|f5|text
04|B|f6|text
04|B|f7|checkbox
04|B|f8|checkbox
04|B|f9|checkbox
04|B|f10|checkbox
04|B|f11|text
04|B|f12|text
04|B|f13|text
04|B|f14|text
04|B|f15|text
04|B|f16|text
04|B|f17|checkbox
04|B|f18|checkbox
04|B|f19|checkbox
04|B|f20|checkbox
04|B|f21|checkbox
04|D|f1|text
04|D|f2|text
04|D|f3|text
04|D|f4|text
04|D|f5|text
04|D|f6|text
04|D|f7|text
04|D|f8|text
04|D|f9|text
04|D|f10|text
04|D|f11|text
04|D|f12|text
04|D|f13|text
04|E|f1|checkbox
04|E|f2|checkbox
04|E|f3|text
04|E|f4|text
04|E|f5|text
04|E|f6|text
04|E|f7|text
04|G|f1|text
04|G|f2|text
04|G|f3|text
04|G|f4|text
04|G|f5|text
04|H|f1|text
04|H|f2|text
04|H|f3|text
04|H|f4|text
04|H|f5|text
04|H|f6|text
04|H|f7|text
04|H|f8|text
04|H|f9|text
04|I|f1|text
04|I|f2|text
04|I|f3|text
04|I|f4|text
04|I|f5|text
04|J|f1|text
04|J|f2|text
04|J|f3|text
04|J|f4|text
04|K|f1|text
04|K|f2|text
04|L|f1|text
04|L|f2|checkbox
04|L|f3|checkbox
04|L|f4|checkbox
04|L|f5|checkbox
04|L|f6|checkbox
04|L|f7|checkbox
04|L|f8|checkbox
04|L|f9|text
04|N|f1|text
04|N|f2|date
04|O|f1|text
04|O|f2|text
04|O|f3|text
04|O|f4|text
04|O|f5|text
04|O|f6|text
04|P|f1|text
04|P|f2|date
04|P|f3|text
04|P|f4|date
04|P|f5|text
04|P|f6|date
04|Q|f1|text
04|Q|f2|checkbox
04|Q|f3|checkbox
04|Q|f4|checkbox
05|HEADER|f1|text
05|HEADER|f2|text
05|HEADER|f3|text
05|HEADER|f4|text
05|HEADER|f5|text
05|HEADER|f6|date
05|HEADER|f7|text
05|HEADER|f8|checkbox
05|HEADER|f9|checkbox
05|HEADER|f10|checkbox
05|HEADER|evidence_refs|evidence
05|A|f1|text
05|A|f2|text
05|A|f3|date
05|A|f4|text
05|A|f5|text
05|A|f6|text
05|A|f7|text
05|A|f8|text
05|A|f9|text
05|A|f10|text
05|A|f11|text
05|B|f1|text
05|B|f2|checkbox
05|B|f3|checkbox
05|B|f4|checkbox
05|B|f5|checkbox
05|B|f6|checkbox
05|B|f7|checkbox
05|B|f8|checkbox
05|B|f9|checkbox
05|B|f10|checkbox
05|B|f11|checkbox
05|B|f12|checkbox
05|B|f13|text
05|B|f14|text
05|B|f15|text
05|C|f1|text
05|C|f2|checkbox
05|C|f3|checkbox
05|C|f4|checkbox
05|C|f5|checkbox
05|C|f6|checkbox
05|C|f7|checkbox
05|C|f8|checkbox
05|C|f9|checkbox
05|C|f10|checkbox
05|C|f11|checkbox
05|C|f12|checkbox
05|C|f13|checkbox
05|C|f14|text
05|D|f1|text
05|D|f2|text
05|D|f3|text
05|D|f4|text
05|D|f5|text
05|D|f6|text
05|E|f1|text
05|E|f2|checkbox
05|E|f3|checkbox
05|E|f4|checkbox
05|E|f5|checkbox
05|E|f6|checkbox
05|E|f7|checkbox
05|E|f8|checkbox
05|E|f9|checkbox
05|E|f10|text
05|E|f11|date
05|E|f12|text
05|F|f1|text
05|F|f2|checkbox
05|F|f3|checkbox
05|F|f4|checkbox
05|F|f5|checkbox
05|F|f6|checkbox
05|F|f7|checkbox
05|F|f8|checkbox
05|F|f9|checkbox
05|F|f10|text
05|G|f1|text
05|G|f2|checkbox
05|G|f3|checkbox
05|G|f4|checkbox
05|G|f5|checkbox
05|G|f6|checkbox
05|G|f7|checkbox
05|G|f8|checkbox
05|G|f9|checkbox
05|G|f10|text
05|H|f1|text
05|H|f2|checkbox
05|H|f3|checkbox
05|H|f4|checkbox
05|H|f5|checkbox
05|H|f6|text
05|I|f1|text
05|I|f2|checkbox
05|I|f3|checkbox
05|I|f4|checkbox
05|I|f5|checkbox
05|I|f6|checkbox
05|I|f7|text
05|I|f8|checkbox
05|I|f9|checkbox
05|I|f10|checkbox
05|I|f11|checkbox
05|I|f12|checkbox
05|I|f13|checkbox
05|I|f14|checkbox
05|I|f15|checkbox
05|I|f16|text
05|I|f17|text
05|J|f1|text
05|J|f2|text
05|J|f3|text
05|J|f4|text
05|J|f5|text
05|J|f6|text
05|J|f7|text
05|K|f1|text
05|K|f2|checkbox
05|K|f3|checkbox
05|K|f4|checkbox
05|K|f5|checkbox
05|K|f6|checkbox
05|K|f7|checkbox
05|K|f8|checkbox
05|K|f9|checkbox
05|L|f1|checkbox
05|L|f2|checkbox
05|L|f3|text
05|L|f4|text
05|M|f1|text
05|M|f2|text
05|M|f3|text
05|M|f4|date
05|M|f5|text
05|M|f6|text
05|M|f7|text
05|N|f1|text
05|N|f2|text
05|N|f3|text
05|N|f4|text
05|N|f5|text
05|N|f6|text
05|N|f7|checkbox
05|N|f8|checkbox
05|N|f9|checkbox
05|N|f10|checkbox
05|N|f11|text
05|N|f12|date
05|N|f13|text
05|N|f14|text
05|N|f15|checkbox
05|N|f16|checkbox
05|N|f17|text
05|O|f1|text
05|O|f2|text
05|O|f3|text
05|O|f4|date
05|O|f5|text
05|O|f6|text
05|O|f7|text
05|O|f8|date
05|O|f9|text
05|O|f10|text
05|O|f11|text
05|O|f12|date
05|O|f13|text
05|O|f14|text
05|P|f1|text
05|P|f2|date
05|P|f3|text
05|P|f4|checkbox
05|P|f5|checkbox
05|P|f6|checkbox
05|P|f7|checkbox
05|P|f8|checkbox
05|P|f9|checkbox
05|P|f10|text
05|P|f11|text
05|P|f12|text
05|P|f13|text
05|P|f14|text
05|Q|f1|text
05|Q|f2|text
05|Q|f3|text
05|Q|f4|text
05|Q|f5|text
05|Q|f6|text
05|Q|f7|text
05|R|f1|text
05|R|f2|checkbox
05|R|f3|checkbox
05|R|f4|checkbox
05|R|f5|checkbox
05|R|f6|checkbox
05|R|f7|checkbox
05|R|f8|checkbox
05|R|f9|checkbox
05|R|f10|checkbox
05|R|f11|text
05|S|f1|text
05|S|f2|checkbox
05|S|f3|checkbox
05|S|f4|checkbox
05|S|f5|checkbox
05|S|f6|checkbox
05|S|f7|checkbox
05|S|f8|text
05|T|f1|text
05|T|f2|text
05|T|f3|date
05|U|f1|text
05|U|f2|text
05|U|f3|date
05|U|f4|text
05|U|f5|checkbox
05|U|f6|checkbox
05|U|f7|checkbox
05|U|f8|checkbox
05|U|f9|text
05|V|f1|text
05|V|f2|date
05|V|f3|text
05|V|f4|date
05|V|f5|text
05|V|f6|date
05|W|f1|text
05|W|f2|checkbox
05|W|f3|checkbox
05|W|f4|checkbox
05|W|f5|text
05|W|f6|checkbox
05|W|f7|checkbox
05|W|f8|checkbox
05|W|f9|checkbox
05|W|f10|checkbox
05|W|f11|checkbox
05|W|f12|date
06|HEADER|f1|text
06|HEADER|f2|text
06|HEADER|f3|text
06|HEADER|f4|text
06|HEADER|f5|checkbox
06|HEADER|f6|checkbox
06|HEADER|f7|checkbox
06|HEADER|f8|text
06|HEADER|f9|date
06|HEADER|f10|text
06|HEADER|f11|checkbox
06|HEADER|f12|checkbox
06|HEADER|f13|checkbox
06|HEADER|f14|checkbox
06|HEADER|evidence_refs|evidence
06|A|f1|text
06|A|f2|date
06|A|f3|date
06|A|f4|date
06|A|f5|date
06|A|f6|text
06|A|f7|text
06|A|f8|checkbox
06|A|f9|checkbox
06|A|f10|checkbox
06|A|f11|checkbox
06|A|f12|checkbox
06|A|f13|checkbox
06|A|f14|checkbox
06|A|f15|checkbox
06|A|f16|text
06|A|f17|text
06|A|f18|text
06|A|f19|text
06|B|f1|text
06|B|f2|text
06|B|f3|text
06|B|f4|text
06|B|f5|text
06|B|f6|text
06|B|f7|text
06|B|f8|text
06|B|f9|text
06|B|f10|text
06|B|f11|text
06|B|f12|text
06|B|f13|text
06|B|f14|text
06|B|f15|text
06|B|f16|text
06|B|f17|text
06|B|f18|text
06|D|f1|text
06|D|f2|checkbox
06|D|f3|checkbox
06|D|f4|checkbox
06|D|f5|checkbox
06|D|f6|checkbox
06|D|f7|checkbox
06|D|f8|date
06|D|f9|text
06|D|f10|text
06|E|f1|text
06|E|f2|text
06|E|f3|text
06|E|f4|text
06|E|f5|text
06|E|f6|text
06|F|f1|date
06|F|f2|text
06|F|f3|date
06|F|f4|text
06|F|f5|date
06|F|f6|text
06|F|f7|text
06|F|f8|text
06|F|f9|checkbox
06|F|f10|checkbox
06|F|f11|date
06|F|f12|text
06|F|f13|date
06|F|f14|text
06|F|f15|checkbox
06|F|f16|checkbox
06|F|f17|text
06|F|f18|checkbox
06|F|f19|checkbox
06|F|f20|text
06|G|f1|text
06|G|f2|text
06|I|f1|text
06|I|f2|text
06|I|f3|checkbox
06|I|f4|checkbox
06|I|f5|checkbox
06|I|f6|checkbox
06|I|f7|checkbox
06|I|f8|text
06|J|f1|text
06|J|f2|checkbox
06|J|f3|checkbox
06|J|f4|checkbox
06|J|f5|checkbox
06|J|f6|checkbox
06|J|f7|checkbox
06|J|f8|checkbox
06|J|f9|checkbox
06|J|f10|checkbox
06|J|f11|checkbox
06|J|f12|text
06|K|f1|text
06|K|f2|text
06|K|f3|text
06|K|f4|text
06|K|f5|text
06|L|f1|date
06|L|f2|text
06|L|f3|text
06|L|f4|text
06|L|f5|text
06|L|f6|text
06|L|f7|text
06|L|f8|text
06|M|f1|date
06|M|f2|date
06|M|f3|date
06|M|f4|text
06|M|f5|checkbox
06|M|f6|checkbox
06|M|f7|checkbox
06|M|f8|checkbox
06|M|f9|checkbox
06|M|f10|checkbox
06|M|f11|checkbox
06|M|f12|checkbox
06|M|f13|text
06|M|f14|text
06|M|f15|text
06|M|f16|text
06|N|f1|text
06|N|f2|date
06|N|f3|text
06|N|f4|text
06|N|f5|date
06|N|f6|text
06|O|f1|text
06|O|f2|date
06|O|f3|text
06|O|f4|date
06|O|f5|text
06|O|f6|date
06|O|f7|text
06|O|f8|text
06|P|f1|text
06|P|f2|checkbox
06|P|f3|checkbox
06|P|f4|checkbox
06|P|f5|checkbox
06|P|f6|date
06|P|f7|text
06|P|f8|text
06|Q|f1|checkbox
06|Q|f2|checkbox
06|Q|f3|text
06|Q|f4|checkbox
06|Q|f5|checkbox
06|Q|f6|checkbox
06|Q|f7|checkbox
06|Q|f8|checkbox
06|Q|f9|text
06|Q|f10|text
06|Q|f11|text
06|R|f1|text
06|R|f2|checkbox
06|R|f3|checkbox
06|R|f4|checkbox
06|R|f5|checkbox
06|R|f6|checkbox
06|R|f7|text
06|S|f1|text
06|S|f2|checkbox
06|S|f3|checkbox
06|S|f4|checkbox
06|S|f5|checkbox
06|S|f6|checkbox
06|S|f7|checkbox
06|S|f8|checkbox
06|S|f9|checkbox
06|S|f10|checkbox
06|S|f11|checkbox
06|S|f12|checkbox
06|S|f13|checkbox
06|S|f14|checkbox
06|T|f1|text
06|T|f2|checkbox
06|T|f3|checkbox
06|T|f4|checkbox
06|T|f5|checkbox
06|T|f6|checkbox
06|T|f7|checkbox
06|T|f8|checkbox
06|T|f9|checkbox
06|T|f10|checkbox
06|T|f11|checkbox
06|U|f1|text
06|U|f2|text
06|U|f3|date
06|U|f4|text
06|U|f5|text
06|U|f6|date
06|U|f7|text
06|U|f8|date
06|V|f1|text
06|V|f2|checkbox
06|V|f3|checkbox
06|V|f4|checkbox
06|V|f5|checkbox
06|V|f6|checkbox
06|V|f7|text
06|V|f8|checkbox
06|V|f9|checkbox
06|V|f10|checkbox
06|V|f11|date
06|V|f12|text
06|W|f1|text
06|W|f2|date
06|W|f3|text
06|W|f4|date
06|W|f5|text
06|W|f6|date
07|HEADER|f1|text
07|HEADER|f2|text
07|HEADER|f3|text
07|HEADER|f4|text
07|HEADER|f5|text
07|HEADER|f6|date
07|HEADER|f7|text
07|HEADER|f8|checkbox
07|HEADER|f9|checkbox
07|HEADER|f10|checkbox
07|HEADER|evidence_refs|evidence
07|A|f1|text
07|A|f2|date
07|A|f3|date
07|A|f4|date
07|A|f5|text
07|A|f6|text
07|A|f7|checkbox
07|A|f8|checkbox
07|A|f9|checkbox
07|A|f10|checkbox
07|A|f11|text
07|A|f12|checkbox
07|A|f13|checkbox
07|A|f14|checkbox
07|A|f15|checkbox
07|A|f16|text
07|B|f1|text
07|B|f2|text
07|B|f3|text
07|B|f4|text
07|B|f5|text
07|B|f6|text
07|B|f7|text
07|B|f8|text
07|C|f1|text
07|C|f2|text
07|D|f1|text
07|D|f2|text
07|D|f3|text
07|D|f4|text
07|D|f5|text
07|D|f6|checkbox
07|D|f7|checkbox
07|D|f8|checkbox
07|D|f9|checkbox
07|D|f10|text
07|D|f11|text
07|D|f12|text
07|D|f13|text
07|E|f1|date
07|E|f2|text
07|E|f3|text
07|E|f4|text
07|E|f5|text
07|E|f6|text
07|E|f7|text
07|E|f8|text
07|E|f9|text
07|F|f1|text
07|F|f2|checkbox
07|F|f3|checkbox
07|F|f4|checkbox
07|F|f5|checkbox
07|F|f6|checkbox
07|F|f7|checkbox
07|F|f8|checkbox
07|F|f9|checkbox
07|F|f10|checkbox
07|F|f11|checkbox
07|F|f12|checkbox
07|F|f13|text
07|G|f1|text
07|G|f2|text
07|G|f3|checkbox
07|G|f4|checkbox
07|G|f5|checkbox
07|G|f6|checkbox
07|G|f7|checkbox
07|G|f8|checkbox
07|G|f9|checkbox
07|G|f10|checkbox
07|G|f11|checkbox
07|G|f12|text
07|G|f13|text
07|G|f14|text
07|G|f15|text
07|G|f16|date
07|G|f17|text
07|G|f18|text
07|H|f1|text
07|H|f2|text
07|H|f3|text
07|H|f4|text
07|H|f5|text
07|I|f1|text
07|I|f2|date
07|I|f3|text
07|I|f4|date
07|I|f5|text
07|I|f6|text
07|I|f7|text
07|I|f8|date
07|I|f9|text
07|I|f10|text
07|I|f11|date
07|I|f12|text
07|J|f1|date
07|J|f2|date
07|J|f3|date
07|J|f4|date
07|J|f5|text
07|K|f1|text
07|K|f2|text
07|K|f3|text
07|K|f4|text
07|K|f5|text
07|K|f6|date
07|K|f7|text
07|K|f8|checkbox
07|K|f9|checkbox
07|K|f10|checkbox
07|K|f11|checkbox
07|K|f12|text
07|K|f13|text
07|K|f14|date
07|K|f15|text
07|L|f1|text
07|L|f2|checkbox
07|L|f3|checkbox
07|L|f4|checkbox
07|L|f5|checkbox
07|L|f6|checkbox
07|L|f7|text
07|L|f8|date
07|L|f9|text
07|L|f10|text
07|M|f1|checkbox
07|M|f2|checkbox
07|M|f3|text
07|M|f4|checkbox
07|M|f5|checkbox
07|M|f6|checkbox
07|M|f7|checkbox
07|M|f8|checkbox
07|M|f9|text
07|M|f10|text
07|M|f11|text
07|N|f1|checkbox
07|N|f2|checkbox
07|N|f3|checkbox
07|N|f4|text
07|N|f5|checkbox
07|N|f6|checkbox
07|N|f7|checkbox
07|N|f8|checkbox
07|N|f9|checkbox
07|N|f10|date
07|N|f11|text
07|N|f12|text
07|P|f1|text
07|P|f2|checkbox
07|P|f3|checkbox
07|P|f4|checkbox
07|P|f5|checkbox
07|P|f6|text
07|P|f7|checkbox
07|P|f8|checkbox
07|P|f9|checkbox
07|P|f10|checkbox
07|P|f11|checkbox
07|P|f12|checkbox
07|P|f13|checkbox
07|P|f14|checkbox
07|P|f15|checkbox
07|P|f16|checkbox
07|P|f17|checkbox
07|P|f18|checkbox
07|P|f19|checkbox
07|P|f20|checkbox
07|P|f21|date
07|P|f22|text
07|P|f23|text
07|Q|f1|text
07|Q|f2|text
07|R|f1|text
07|R|f2|checkbox
07|R|f3|checkbox
07|R|f4|checkbox
07|R|f5|checkbox
07|R|f6|checkbox
07|R|f7|text
07|R|f8|date
07|R|f9|text
07|S|f1|text
07|S|f2|date
07|S|f3|text
07|S|f4|text
07|S|f5|date
07|S|f6|text
07|S|f7|text
07|S|f8|text
07|S|f9|date
07|T|f1|text
07|T|f2|date$fields$,E'\n')) v;

update intake.case_field_definitions set choice_group='g0' where code='02' and section='C' and field in ('f1','f2','f3');
update intake.case_field_definitions set choice_group='g1' where code='02' and section='C' and field in ('f5','f6','f7');
update intake.case_field_definitions set choice_group='g2' where code='02' and section='C' and field in ('f9','f10','f11');
update intake.case_field_definitions set choice_group='g0' where code='04' and section='E' and field in ('f1','f2');
update intake.case_field_definitions set choice_group='g0' where code='05' and section='L' and field in ('f1','f2');
update intake.case_field_definitions set choice_group='g0' where code='06' and section='Q' and field in ('f1','f2');
update intake.case_field_definitions set choice_group='g0' where code='07' and section='M' and field in ('f1','f2');

alter function intake.form_json(intake.case_forms) rename to form_json_v1;
create function intake.form_json(item intake.case_forms) returns jsonb language sql stable security definer set search_path='' as $$
 select intake.form_json_v1(item)||jsonb_build_object('stage',item.stage)
$$;
alter function public.kpi_case_form_save(uuid,jsonb) rename to kpi_case_form_save_v1;
revoke all on function public.kpi_case_form_save_v1(uuid,jsonb) from public,anon,authenticated;
create function public.kpi_case_form_save(case_id uuid,input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare f intake.case_forms;s record;v jsonb;field record;kind text;result jsonb;ref text;item intake.cases;
begin
 select * into item from intake.cases where id=case_id for update;
 if item.id is null or not intake.can_read(item) or not intake.permission('CASE_MANAGE',item) then raise exception 'Case access denied' using errcode='42501';end if;
 select * into f from intake.case_forms where id=(input->>'id')::uuid;
 if f.id is not null and f.case_id<>case_id then raise exception 'Form access denied' using errcode='42501';end if;
 if f.id is not null and f.stage not in ('DRAFT','CHANGES_REQUESTED') then raise exception 'Form is locked for review' using errcode='22023';end if;
 if jsonb_typeof(input->'answers')='object' then
 for s in select * from jsonb_each_text(input->'answers') loop
  if left(ltrim(s.value),1)='{' then
   begin v:=s.value::jsonb;exception when invalid_text_representation then raise exception 'Invalid structured section' using errcode='22023';end;
   if v->>'format'='fields-v1' then
    if jsonb_typeof(v->'fields') is distinct from 'object' or jsonb_typeof(v->'notes') is distinct from 'string' or jsonb_typeof(v->'notApplicableReason') is distinct from 'string' then raise exception 'Invalid structured section' using errcode='22023';end if;
    if exists(select d.choice_group from jsonb_each(v->'fields') a join intake.case_field_definitions d on d.code=input->>'code' and d.section=s.key and d.field=a.key where d.choice_group is not null and a.value='true'::jsonb group by d.choice_group having count(*)>1) then raise exception 'Conflicting choices' using errcode='22023';end if;
    for field in select * from jsonb_each(v->'fields') loop
     select d.kind into kind from intake.case_field_definitions d where d.code=input->>'code' and d.section=s.key and d.field=field.key;
     if kind is null or (kind='checkbox' and jsonb_typeof(field.value)<>'boolean') or (kind<>'checkbox' and jsonb_typeof(field.value)<>'string') then raise exception 'Invalid structured field' using errcode='22023';end if;
     if kind='evidence' then for ref in select trim(x) from unnest(string_to_array(field.value#>>'{}',',')) x where trim(x)<>'' loop
 if not exists(select 1 from intake.case_evidence e where e.id=ref::uuid and e.case_id=item.id) then raise exception 'Evidence reference denied' using errcode='42501';end if;end loop;end if;
     if kind='date' and field.value#>>'{}'<>'' then
      if field.value#>>'{}' !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Invalid date' using errcode='22023';end if;
      perform (field.value#>>'{}')::date;
     end if;
    end loop;
   end if;
  end if;
 end loop;end if;
 result:=public.kpi_case_form_save_v1(case_id,input);
 update intake.case_forms set template_version='KPI-CASE-20261006-v2',stage='DRAFT' where id=(result->>'id')::uuid returning * into f;
 return intake.form_json(f);
exception when invalid_datetime_format or datetime_field_overflow then raise exception 'Invalid date' using errcode='22023';
end $$;
create or replace function public.kpi_case_forms(case_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare item intake.cases;
begin
 select * into item from intake.cases where id=case_id;
 if item.id is null or not intake.can_read(item) then raise exception 'Case access denied' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(intake.form_json(f) order by f.code,f.updated_at),'[]'::jsonb) from intake.case_forms f where f.case_id=item.id);
end $$;

create function intake.case_section_filled(value text) returns boolean language plpgsql immutable set search_path='' as $$
declare v jsonb;
begin
 if trim(coalesce(value,''))='' then return false;end if;
 if left(ltrim(value),1)='{' then
  begin v:=value::jsonb;exception when invalid_text_representation then return true;end;
  if v->>'format'='fields-v1' then return length(trim(coalesce(v->>'notes','')))>0 or length(trim(coalesce(v->>'notApplicableReason','')))>0 or exists(select 1 from jsonb_each(v->'fields') f where f.value='true'::jsonb or (jsonb_typeof(f.value)='string' and trim(f.value#>>'{}')<>''));end if;
 end if;
 return true;
end $$;
revoke all on function intake.case_section_filled(text) from public,anon,authenticated;

create function intake.case_asset_valid(item intake.cases,asset uuid) returns boolean language sql stable security definer set search_path='' as $$
 select asset is null or exists(select 1 from files.module_attachments a join files.managed_assets f on f.id=a.asset_id where a.module='CASE' and a.entity_id=item.id and a.asset_id=asset and a.removed_at is null and f.status='AVAILABLE' and identity.has_permission('ASSET_READ',f.organization_id,f.period_id,f.division_id,f.id))
$$;
create function public.kpi_case_operations(case_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare item intake.cases;
begin
 select * into item from intake.cases where id=case_id;
 if item.id is null or not intake.can_read(item) then raise exception 'Case access denied' using errcode='42501';end if;
 return jsonb_build_object('events',(select coalesce(jsonb_agg(jsonb_build_object('formId',e.form_id,'version',e.version,'action',e.action,'note',e.note,'reference',e.reference,'assetId',case when intake.case_asset_valid(item,e.asset_id) then e.asset_id else null end,'authorName',a.display_name,'createdAt',e.created_at) order by e.created_at),'[]'::jsonb) from intake.case_form_events e join intake.case_forms f on f.id=e.form_id join identity.accounts a on a.id=e.actor_account_id where f.case_id=item.id),
 'attachments',public.kpi_module_attachments('CASE',item.id),
 'evidence',(select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'version',e.version,'fields',e.fields,'updatedAt',e.updated_at,'history',(select coalesce(jsonb_agg(jsonb_build_object('version',h.version,'action',h.action,'note',h.note,'snapshot',h.snapshot,'authorName',a.display_name,'createdAt',h.created_at) order by h.version desc),'[]'::jsonb) from intake.case_evidence_events h join identity.accounts a on a.id=h.actor_account_id where h.evidence_id=e.id)) order by e.updated_at),'[]'::jsonb) from intake.case_evidence e where e.case_id=item.id));
end $$;
create function public.kpi_case_operation(case_id uuid,input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare item intake.cases;f intake.case_forms;e intake.case_evidence;actor uuid:=identity.current_account_id();command text:=input->>'action';fid uuid:=(input->>'id')::uuid;expected integer:=(input->>'expectedVersion')::integer;asset uuid;fields jsonb;review boolean;v record;
begin
 select * into item from intake.cases where id=case_id for update;
 if item.id is null or not intake.can_read(item) then raise exception 'Case access denied' using errcode='42501';end if;
 if item.status not in ('RECEIVED','TRIAGED','IN_PROGRESS') then raise exception 'Case is under review or closed' using errcode='22023';end if;
 if length(trim(coalesce(input->>'note',''))) not between 3 and 2000 or expected is null or fid is null then raise exception 'Invalid operation' using errcode='22023';end if;
 review:=command in ('REVIEW','REQUEST_REVISION','RECORD_AUTHORIZATION');
 if not intake.permission(case when review then 'CASE_REVIEW' else 'CASE_MANAGE' end,item) then raise exception 'Case permission denied' using errcode='42501';end if;
 if command in ('SUBMIT','REVIEW','REQUEST_REVISION','RECORD_AUTHORIZATION','WITHDRAW') then
  select * into f from intake.case_forms where id=fid and intake.case_forms.case_id=item.id for update;
  if f.id is null then raise exception 'Form access denied' using errcode='42501';end if;
  if f.version<>expected then raise exception 'Form changed' using errcode='40001';end if;
  if review and (f.author_account_id=actor or item.owner_account_id=actor) then raise exception 'Independent reviewer required' using errcode='42501';end if;
  if command='SUBMIT' and f.stage in ('DRAFT','CHANGES_REQUESTED') then
   if not exists(select 1 from jsonb_each_text(f.answers) a where intake.case_section_filled(a.value)) then raise exception 'Empty form' using errcode='22023';end if;f.stage:='SUBMITTED';
  elsif command='WITHDRAW' and f.stage='SUBMITTED' and actor=f.author_account_id then f.stage:='DRAFT';
  elsif command='REQUEST_REVISION' and f.stage='SUBMITTED' then f.stage:='CHANGES_REQUESTED';
  elsif command='REVIEW' and f.stage='SUBMITTED' then f.stage:='REVIEWED';
  elsif command='RECORD_AUTHORIZATION' and f.stage='REVIEWED' then
   asset:=(input->>'assetId')::uuid;
   if asset is null or not intake.case_asset_valid(item,asset) or length(trim(coalesce(input->>'reference',''))) not between 3 and 500 then raise exception 'Attached authorization reference required' using errcode='22023';end if;
   f.stage:='AUTHORIZATION_RECORDED';
  else raise exception 'Invalid form stage' using errcode='22023';end if;
  update intake.case_forms set stage=f.stage,version=version+1,updated_at=now() where id=f.id returning * into f;
  insert into intake.case_form_revisions(form_id,version,title,answers,author_account_id) values(f.id,f.version,f.title,f.answers,actor);
  insert into intake.case_form_events(form_id,version,action,note,reference,asset_id,actor_account_id) values(f.id,f.version,command,trim(input->>'note'),coalesce(input->>'reference',''),asset,actor);
 elsif command in ('EVIDENCE_SAVE','EVIDENCE_TRANSFER') then
  fields:=input->'fields';
  if jsonb_typeof(fields) is distinct from 'object' or octet_length(fields::text)>18000 then raise exception 'Invalid evidence fields' using errcode='22023';end if;
  for v in select * from jsonb_each(fields) loop
   if v.key not in ('title','source','acquisition','condition','verification','location','assetId','receivedOn','verifiedOn','verificationNote','custodian','previousLocation') or jsonb_typeof(v.value)<>'string' or length(v.value#>>'{}')>2000 then raise exception 'Invalid evidence field' using errcode='22023';end if;
  end loop;
  if length(trim(coalesce(fields->>'title',''))) not between 3 and 180 or length(trim(coalesce(fields->>'source','')))<3 or length(trim(coalesce(fields->>'condition','')))<3 or length(trim(coalesce(fields->>'location','')))<3 or fields->>'verification' not in ('UNVERIFIED','IN_REVIEW','VERIFIED','DISPUTED') or fields->>'verification' is null then raise exception 'Incomplete evidence fields' using errcode='22023';end if;
  if fields->>'verification'='VERIFIED' and (length(trim(coalesce(fields->>'verificationNote','')))<3 or coalesce(fields->>'verifiedOn','')='') then raise exception 'Verification basis and date required' using errcode='22023';end if;
  for v in select * from jsonb_each_text(fields) where key in ('receivedOn','verifiedOn') and value<>'' loop perform v.value::date;end loop;
  asset:=nullif(fields->>'assetId','')::uuid;if not intake.case_asset_valid(item,asset) then raise exception 'Evidence attachment access denied' using errcode='42501';end if;
  select * into e from intake.case_evidence where id=fid for update;
  if e.id is null then
   if expected<>0 or command<>'EVIDENCE_SAVE' then raise exception 'Evidence changed' using errcode='40001';end if;
   insert into intake.case_evidence(id,case_id,fields,author_account_id) values(fid,item.id,fields,actor) returning * into e;
  else
   if e.case_id<>item.id then raise exception 'Evidence access denied' using errcode='42501';end if;
   if e.version<>expected then raise exception 'Evidence changed' using errcode='40001';end if;
   if (e.fields->>'location' is distinct from fields->>'location') and command<>'EVIDENCE_TRANSFER' then raise exception 'Use evidence transfer for location changes' using errcode='22023';end if;
   if command='EVIDENCE_TRANSFER' then fields:=fields||jsonb_build_object('previousLocation',e.fields->>'location');end if;
   update intake.case_evidence set fields=fields,version=version+1,updated_at=now(),author_account_id=actor where id=e.id returning * into e;
  end if;
  insert into intake.case_evidence_events(evidence_id,version,action,note,snapshot,actor_account_id) values(e.id,e.version,command,trim(input->>'note'),e.fields,actor);
 else raise exception 'Unknown operation' using errcode='22023';end if;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('CASE_'||command,'intake','case',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'recordId',fid));
 return public.kpi_case_operations(item.id);
end $$;
create function intake.protect_case_evidence_attachment() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.module='CASE' and old.removed_at is null and new.removed_at is not null and (
 exists(select 1 from intake.case_evidence_events e join intake.case_evidence r on r.id=e.evidence_id where r.case_id=old.entity_id and e.snapshot->>'assetId'=old.asset_id::text)
 or exists(select 1 from intake.case_form_events e join intake.case_forms f on f.id=e.form_id where f.case_id=old.entity_id and e.asset_id=old.asset_id)) then raise exception 'Evidence or authorization reference prevents attachment removal' using errcode='42501';end if;
 return new;
end $$;
revoke all on function intake.protect_case_evidence_attachment() from public,anon,authenticated;
create trigger case_evidence_attachment_protection before update of removed_at on files.module_attachments for each row execute function intake.protect_case_evidence_attachment();

revoke all on function intake.form_json(intake.case_forms),intake.case_asset_valid(intake.cases,uuid),public.kpi_case_operations(uuid),public.kpi_case_operation(uuid,jsonb),public.kpi_case_form_save(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.kpi_case_operations(uuid),public.kpi_case_operation(uuid,jsonb),public.kpi_case_form_save(uuid,jsonb) to authenticated;
commit;
