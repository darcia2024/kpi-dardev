const requestIdPattern = /^[a-zA-Z0-9_-]{16,128}$/;

export function getRequestId(candidate: string | null): string {
  if (candidate && requestIdPattern.test(candidate)) {
    return candidate;
  }

  return crypto.randomUUID();
}
