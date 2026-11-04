// Loaded into the Next process only for tutorial capture: sends Supabase traffic to the local stand-in.
const fake = process.env.KPI_SUPABASE_URL;
const local = process.env.TUTORIAL_BACKEND_URL;
if (!fake?.endsWith(".invalid") || !local?.startsWith("http://127.0.0.1")) throw new Error("Tutorial capture must point at the local stand-in only.");
const realFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (!url.startsWith(fake)) return realFetch(input, init);
  const target = local + url.slice(fake.length);
  return input instanceof Request ? realFetch(new Request(target, input), init) : realFetch(target, init);
};
