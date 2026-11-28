// iou-be decides which ledger party a request acts as from its x-api-key
// header. This keeps the keys the user has added in this browser, one per
// party, so the "Acting as" dropdown can switch between them.
const STORAGE_KEY = "iou/party-api-keys";

type PartyKeyMap = Record<string, string>;

function readAll(): PartyKeyMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    return parsed && typeof parsed === "object" ? (parsed as PartyKeyMap) : {};
  } catch {
    return {};
  }
}

function writeAll(map: PartyKeyMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage blocked (private mode): keys last for this page load only.
  }
  memory = map;
}

let memory: PartyKeyMap | null = null;

export function getPartyKeys(): PartyKeyMap {
  if (typeof window === "undefined") return {};
  if (!memory) memory = readAll();
  return memory;
}

export function getPartyKey(partyId: string): string | undefined {
  return getPartyKeys()[partyId];
}

export function anyPartyKey(): string | undefined {
  return Object.values(getPartyKeys())[0];
}

export function savePartyKey(partyId: string, key: string) {
  writeAll({ ...getPartyKeys(), [partyId]: key });
}

export function removePartyKey(partyId: string) {
  const next = { ...getPartyKeys() };
  delete next[partyId];
  writeAll(next);
}
