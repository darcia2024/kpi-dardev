"use client";

import { useState } from "react";
import { usePortalResource } from "@/components/portal/api-client";
import type { AssetRecord } from "@/platform/storage/asset-repository";
import { EditorComposer } from "./editor-composer";
import { EditorLibrary } from "./editor-library";
import type { Publication } from "./editor-types";

type View = { kind: "library" } | { kind: "edit"; id: string } | { kind: "new"; seed?: { slug?: string; locale?: Publication["locale"]; type?: string }; key: number };

export function EditorWorkspace({ accountId, canDraft, canReview, canPublish }: { accountId: string; canDraft: boolean; canReview: boolean; canPublish: boolean }): React.JSX.Element {
  const records = usePortalResource<Publication>("/api/v1/editor/publications", "records");
  const media = usePortalResource<AssetRecord>("/api/v1/documents", "assets");
  const [view, setView] = useState<View>({ kind: "library" });
  const [flash, setFlash] = useState("");
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (view.kind === "library") {
    return <EditorLibrary accountId={accountId} canDraft={canDraft} canReview={canReview} error={records.error} loading={records.loading} onCreate={() => { setView({ kind: "new", key: Date.now() }); scrollTop(); }} onOpen={(id) => { setView({ kind: "edit", id }); scrollTop(); }} onReload={() => void records.reload()} records={records.items} />;
  }

  const record = view.kind === "edit" ? records.items.find((item) => item.id === view.id) ?? null : null;
  if (view.kind === "edit" && !record) {
    return <div className="portal-empty" role="status"><strong>{records.loading ? "Memuat naskah…" : "Naskah tidak ditemukan pada periode ini."}</strong>{!records.loading && <button className="button button--quiet" onClick={() => setView({ kind: "library" })} type="button">Kembali ke daftar naskah</button>}</div>;
  }
  const slug = record?.slug ?? (view.kind === "new" ? view.seed?.slug : undefined);

  return <EditorComposer
    accountId={accountId}
    canDraft={canDraft}
    canPublish={canPublish}
    canReview={canReview}
    initialNotice={flash}
    key={view.kind === "edit" ? view.id : `new:${view.key}`}
    media={media.items}
    onBack={() => { setFlash(""); setView({ kind: "library" }); void records.reload(); }}
    onOpen={(id) => { setFlash(""); setView({ kind: "edit", id }); }}
    onSaved={async (created) => { await records.reload(); if (created) { setFlash("Draf dibuat. Lanjutkan menulis atau ajukan review."); setView({ kind: "edit", id: created.id }); } }}
    onTranslate={(seed) => { setView({ kind: "new", seed, key: Date.now() }); scrollTop(); }}
    record={record}
    seed={view.kind === "new" ? view.seed : undefined}
    siblings={slug ? records.items.filter((item) => item.slug === slug) : []}
  />;
}
