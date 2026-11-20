/**
 * Reservations: a 48-hour hold on one engine, shared by every visitor.
 *
 * Stored in a JSON file (RESERVATIONS_FILE, default `.data/reservations.json`). That is enough for one
 * server and for development. On a serverless host with several instances (Vercel), swap the two
 * functions `readAll` and `writeAll` for a database or KV store; nothing else changes.
 */
import "server-only";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { site } from "@/config/site";

export interface Reservation {
  ref: string;
  engineId: string;
  createdAt: string;
  until: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  vin: string;
  notes: string;
}

function storeFile(): string {
  if (process.env.RESERVATIONS_FILE) return process.env.RESERVATIONS_FILE;
  // Vercel and similar hosts only allow writes under the OS temp folder.
  if (process.env.VERCEL) return path.join(os.tmpdir(), "enginemarket-reservations.json");
  return path.join(/* turbopackIgnore: true */ process.cwd(), ".data", "reservations.json");
}

async function readAll(): Promise<Reservation[]> {
  try {
    return JSON.parse(await fs.readFile(storeFile(), "utf8")) as Reservation[];
  } catch {
    return [];
  }
}

async function writeAll(list: Reservation[]): Promise<void> {
  const file = storeFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2));
  await fs.rename(tmp, file);
}

/** One write at a time inside this process, so two buyers never both get the same engine. */
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

const active = (r: Reservation, now = Date.now()) => new Date(r.until).getTime() > now;

export async function getReservation(engineId: string): Promise<Reservation | null> {
  const list = await readAll();
  return list.find((r) => r.engineId === engineId && active(r)) ?? null;
}

export class AlreadyReservedError extends Error {
  constructor(public until: string) {
    super("already reserved");
  }
}

export async function createReservation(
  engineId: string,
  data: Omit<Reservation, "ref" | "engineId" | "createdAt" | "until">,
): Promise<Reservation> {
  return serial(async () => {
    const now = Date.now();
    const list = (await readAll()).filter((r) => active(r, now - 30 * 24 * 3600 * 1000));
    const taken = list.find((r) => r.engineId === engineId && active(r, now));
    if (taken) throw new AlreadyReservedError(taken.until);
    const r: Reservation = {
      ref: `R-${randomUUID().slice(0, 8).toUpperCase()}`,
      engineId,
      createdAt: new Date(now).toISOString(),
      until: new Date(now + site.reservationHours * 3600 * 1000).toISOString(),
      ...data,
    };
    list.push(r);
    await writeAll(list);
    return r;
  });
}
