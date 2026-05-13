import { getStartContext } from "@tanstack/start-storage-context";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  const startCtx = getStartContext({ throwIfNotFound: false }) as
    | { contextAfterGlobalMiddlewares?: { DB?: D1Database } }
    | undefined;
  const d1 = startCtx?.contextAfterGlobalMiddlewares?.DB;
  if (!d1) return null;
  return drizzle(d1, { schema });
}
