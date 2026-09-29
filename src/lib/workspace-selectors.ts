export type WorkspaceTask = { id: string; title: string; ownerAccountId: string; status: "IN_PROGRESS" | "BLOCKED" | "IN_REVIEW" | "ACCEPTED" | "ARCHIVED"; dueAt?: string };
export type WorkspaceMeeting = { id: string; title: string; startsAt: string; participantAccountIds: string[]; archivedAt?: string };
export type WorkspaceAsset = { id: string; fileName: string };
export type WorkspaceDestination = { id: string; label: string; kind: "Tugas" | "Rapat" | "Dokumen"; href: string };
export type RequiredAction = { id: string; title: string; description: string; href: string; priority: number };

export function taskHref(id: string): string { return `/portal/tugas?task=${encodeURIComponent(id)}`; }
export function meetingHref(id: string): string { return `/portal/rapat?meeting=${encodeURIComponent(id)}`; }
export function documentHref(id: string): string { return `/portal/dokumen?document=${encodeURIComponent(id)}`; }

export function requiredActions(tasks: WorkspaceTask[], accountId: string, canSubmit: boolean, canReview: boolean): RequiredAction[] {
  const actions = tasks.flatMap((task): RequiredAction[] => {
    if (canReview && task.status === "IN_REVIEW" && task.ownerAccountId !== accountId) return [{ id: `review:${task.id}`, title: task.title, description: "Perlu keputusan review", href: taskHref(task.id), priority: 0 }];
    if (canSubmit && task.ownerAccountId === accountId && task.status === "IN_PROGRESS") return [{ id: `work:${task.id}`, title: task.title, description: task.dueAt ? `Tenggat ${new Date(task.dueAt).toLocaleDateString("id-ID", { timeZone: "Africa/Cairo" })}` : "Lanjutkan pekerjaan", href: taskHref(task.id), priority: 1 }];
    if (task.ownerAccountId === accountId && task.status === "BLOCKED") return [{ id: `blocked:${task.id}`, title: task.title, description: "Periksa prasyarat tugas", href: taskHref(task.id), priority: 2 }];
    return [];
  });
  return actions.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title, "id"));
}

export function searchWorkspace(query: string, tasks: WorkspaceTask[], meetings: WorkspaceMeeting[], assets: WorkspaceAsset[], limit = 8): WorkspaceDestination[] {
  const normalized = query.trim().toLocaleLowerCase("id-ID");
  if (normalized.length < 2) return [];
  return [
    ...tasks.filter((task) => task.title.toLocaleLowerCase("id-ID").includes(normalized)).map((task): WorkspaceDestination => ({ id: `task:${task.id}`, label: task.title, kind: "Tugas", href: taskHref(task.id) })),
    ...meetings.filter((meeting) => meeting.title.toLocaleLowerCase("id-ID").includes(normalized)).map((meeting): WorkspaceDestination => ({ id: `meeting:${meeting.id}`, label: meeting.title, kind: "Rapat", href: meetingHref(meeting.id) })),
    ...assets.filter((asset) => asset.fileName.toLocaleLowerCase("id-ID").includes(normalized)).map((asset): WorkspaceDestination => ({ id: `asset:${asset.id}`, label: asset.fileName, kind: "Dokumen", href: documentHref(asset.id) }))
  ].slice(0, limit);
}
