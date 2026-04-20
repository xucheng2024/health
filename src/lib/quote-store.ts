import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { Quote, QuoteRecord, Signature } from "@/lib/types";

type StoreShape = {
  quotes: QuoteRecord[];
};

const DATA_DIR = join(process.cwd(), ".data");
const STORE_FILE = join(DATA_DIR, "quotes.json");

let writeQueue: Promise<void> = Promise.resolve();

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await readFile(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoreShape;
    if (!Array.isArray(parsed.quotes)) {
      return { quotes: [] };
    }
    return parsed;
  } catch {
    return { quotes: [] };
  }
}

async function saveStore(store: StoreShape): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const task = writeQueue.then(fn);
  writeQueue = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}

export async function createQuoteRecord(
  quote: Omit<Quote, "id" | "quoteNo" | "createdAt" | "updatedAt">,
): Promise<QuoteRecord> {
  return withWriteLock(async () => {
    const store = await readStore();
    const now = new Date().toISOString();
    const id = randomUUID();

    const record: QuoteRecord = {
      quote: {
        ...quote,
        id,
        quoteNo: `Q-${now.slice(0, 10).replace(/-/g, "")}-${store.quotes.length + 1}`,
        createdAt: now,
        updatedAt: now,
      },
      signature: null,
    };

    store.quotes.push(record);
    await saveStore(store);
    return record;
  });
}

export async function getQuoteRecord(id: string): Promise<QuoteRecord | null> {
  const store = await readStore();
  return store.quotes.find((entry) => entry.quote.id === id) ?? null;
}

export async function signQuoteRecord(params: {
  quoteId: string;
  signerName: string;
  signatureData: string;
  ip?: string;
  userAgent?: string;
}): Promise<QuoteRecord | null> {
  return withWriteLock(async () => {
    const store = await readStore();
    const idx = store.quotes.findIndex((entry) => entry.quote.id === params.quoteId);
    if (idx === -1) return null;

    const current = store.quotes[idx];
    const now = new Date().toISOString();
    const signature: Signature = {
      id: randomUUID(),
      quoteId: params.quoteId,
      signerName: params.signerName,
      signatureData: params.signatureData,
      ip: params.ip,
      userAgent: params.userAgent,
      createdAt: now,
    };

    const next: QuoteRecord = {
      quote: {
        ...current.quote,
        status: "signed",
        agreedToTerms: true,
        signedAt: now,
        updatedAt: now,
      },
      signature,
    };

    store.quotes[idx] = next;
    await saveStore(store);
    return next;
  });
}
